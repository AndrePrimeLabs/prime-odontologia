<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\BookingProviderInterface;

/**
 * Manages Action Scheduler job lifecycle for the "Booking starts" trigger.
 *
 * Listens to booking creation, status changes, start-date changes, and
 * automation saves. On each event it cancels the old Action Scheduler job
 * and schedules a new one at booking_start ± configured offset.
 */
class BookingStartsHooks {

  private WordPress $wp;
  private ActionScheduler $actionScheduler;
  private AutomationStorage $automationStorage;
  private BookingProviderInterface $bookingProvider;
  private bool $isProcessing = false;

  public function __construct(
    WordPress $wp,
    ActionScheduler $actionScheduler,
    AutomationStorage $automationStorage,
    BookingProviderInterface $bookingProvider
  ) {
    $this->wp = $wp;
    $this->actionScheduler = $actionScheduler;
    $this->automationStorage = $automationStorage;
    $this->bookingProvider = $bookingProvider;
  }

  public function init(): void {
    $this->wp->addAction('woocommerce_new_booking', [$this, 'handleNewBooking'], 10, 1);
    $this->wp->addAction('woocommerce_booking_status_changed', [$this, 'handleStatusChanged'], 10, 4);
    $this->wp->addAction('updated_post_meta', [$this, 'handleMetaUpdate'], 10, 3);
    $this->wp->addAction(Hooks::AUTOMATION_BEFORE_SAVE, [$this, 'handleBeforeAutomationSave']);
  }

  public function handleNewBooking(int $bookingId): void {
    $booking = $this->bookingProvider->getBooking($bookingId);
    if (!$booking instanceof \WC_Booking) {
      return;
    }

    $automations = $this->automationStorage->getActiveAutomationsByTriggerKey(BookingStartsTrigger::KEY);
    foreach ($automations as $automation) {
      $this->scheduleForBooking($booking, $automation);
    }
  }

  /**
   * Cancel-then-reschedule on every status change. The booking status is
   * re-checked at fire time in BookingStartsTrigger::handle(), so we
   * always reschedule regardless of the new status.
   */
  public function handleStatusChanged(string $oldStatus, string $newStatus, int $bookingId, \WC_Booking $booking): void {
    $automations = $this->automationStorage->getActiveAutomationsByTriggerKey(BookingStartsTrigger::KEY);
    foreach ($automations as $automation) {
      $this->cancelForBooking($bookingId, $automation->getId());
      $this->scheduleForBooking($booking, $automation);
    }
  }

  /**
   * Reschedule when the booking start date changes.
   *
   * We listen to `updated_post_meta` for the `_booking_start` key rather than
   * `save_post_wc_booking` because the latter fires on every save regardless
   * of what changed, while this hook fires only when the start date is updated.
   *
   * @param int $metaId
   * @param int $postId
   * @param string $metaKey
   */
  public function handleMetaUpdate(int $metaId, int $postId, string $metaKey): void {
    if ($this->isProcessing) {
      return;
    }

    if ($metaKey !== '_booking_start') {
      return;
    }

    $post = $this->wp->getPost($postId);
    // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    if (!$post instanceof \WP_Post || $post->post_type !== 'wc_booking') {
      return;
    }

    $booking = $this->bookingProvider->getBooking($postId);
    if (!$booking instanceof \WC_Booking) {
      return;
    }

    $this->isProcessing = true;
    try {
      $this->clearDeduplicationMeta($booking);

      $automations = $this->automationStorage->getActiveAutomationsByTriggerKey(BookingStartsTrigger::KEY);
      foreach ($automations as $automation) {
        $this->cancelForBooking($postId, $automation->getId());
        $this->scheduleForBooking($booking, $automation);
      }
    } finally {
      $this->isProcessing = false;
    }
  }

  /**
   * On every automation save: cancel all existing Action Scheduler jobs for this automation,
   * then re-scan existing future bookings if the automation is (still) active.
   * This handles activation, deactivation, and trigger-config changes.
   */
  public function handleBeforeAutomationSave(Automation $automation): void {
    $trigger = $automation->getTrigger(BookingStartsTrigger::KEY);
    if (!$trigger) {
      return;
    }

    $current = $this->automationStorage->getAutomation($automation->getId());
    if ($current) {
      $currentTrigger = $current->getTrigger(BookingStartsTrigger::KEY);
      $argsUnchanged = $currentTrigger
        && $currentTrigger->getArgs() === $trigger->getArgs()
        && $current->getStatus() === $automation->getStatus();
      if ($argsUnchanged) {
        return;
      }
    }

    $this->cancelAllForAutomation($automation->getId());

    if ($automation->getStatus() === Automation::STATUS_ACTIVE) {
      $this->actionScheduler->enqueue(BookingStartsTrigger::SCAN_HOOK, [$automation->getId(), 0]);
    }
  }

  private function scheduleForBooking(\WC_Booking $booking, Automation $automation): void {
    $trigger = $automation->getTrigger(BookingStartsTrigger::KEY);
    if (!$trigger) {
      return;
    }

    $triggerArgs = $trigger->getArgs();
    $timing = $triggerArgs['timing'] ?? 'before';
    $timeValue = (int)($triggerArgs['time_value'] ?? 1);
    $timeUnit = $triggerArgs['time_unit'] ?? 'hours';

    $fireTime = BookingStartsTrigger::calculateFireTime($booking, $timing, $timeValue, $timeUnit);
    if ($fireTime === null) {
      return;
    }

    $args = [$booking->get_id(), $automation->getId()];
    if ($this->actionScheduler->hasScheduledAction(BookingStartsTrigger::SCHEDULED_HOOK, $args)) {
      return;
    }

    $this->actionScheduler->schedule($fireTime, BookingStartsTrigger::SCHEDULED_HOOK, $args);
  }

  private function cancelForBooking(int $bookingId, int $automationId): void {
    $this->actionScheduler->unscheduleAction(BookingStartsTrigger::SCHEDULED_HOOK, [$bookingId, $automationId]);
  }

  /**
   * Cancel all pending AS jobs (triggers + scans) belonging to a given automation.
   * Processes in batches to avoid loading all actions into memory on large sites.
   */
  private function cancelAllForAutomation(int $automationId): void {
    $this->cancelActionsBatched(BookingStartsTrigger::SCHEDULED_HOOK, 1, $automationId);
    $this->cancelActionsBatched(BookingStartsTrigger::SCAN_HOOK, 0, $automationId);
  }

  private function cancelActionsBatched(string $hook, int $automationIdArgIndex, int $automationId): void {
    $args = [];
    $args[$automationIdArgIndex] = $automationId;
    do {
      $actions = $this->actionScheduler->getScheduledActions([
        'hook' => $hook,
        'status' => 'pending',
        'per_page' => BookingStartsTrigger::SCAN_BATCH_SIZE,
        'args' => $args,
        'partial_args_matching' => 'json',
      ]);

      foreach ($actions as $action) {
        $this->actionScheduler->unscheduleAction($hook, $action->get_args());
      }
    } while (count($actions) >= BookingStartsTrigger::SCAN_BATCH_SIZE);
  }

  /**
   * Remove all `_mailpoet_booking_starts_triggered_*` meta keys so that
   * the trigger can re-fire after a start-date change.
   */
  private function clearDeduplicationMeta(\WC_Booking $booking): void {
    $metaData = $booking->get_meta_data();
    foreach ($metaData as $meta) {
      $data = $meta->get_data();
      if (strpos($data['key'], BookingStartsTrigger::META_KEY_PREFIX) === 0) {
        $booking->delete_meta_data($data['key']);
      }
    }
    $booking->save();
  }
}
