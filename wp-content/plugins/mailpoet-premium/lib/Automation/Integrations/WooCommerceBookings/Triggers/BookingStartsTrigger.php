<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\CustomerSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\BookingProviderInterface;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

/**
 * Time-based trigger that fires before or after a WooCommerce Booking's
 * scheduled start date/time.
 *
 * Each booking gets its own Action Scheduler job at booking_start +/- offset.
 * At fire time the trigger re-checks that the automation is active and the
 * booking status matches the configured statuses, then creates an automation
 * run with booking + customer subjects.
 *
 * Deduplication: after firing, a per-automation meta key is set on the booking
 * to prevent duplicate runs. The meta is cleared when the start date changes
 * (see BookingStartsHooks::handleMetaUpdate).
 */
class BookingStartsTrigger implements Trigger {

  public const KEY = 'woocommerce-bookings:booking-starts';
  public const SCHEDULED_HOOK = 'mailpoet/automation/triggers/booking-starts';
  public const SCAN_HOOK = 'mailpoet/automation/triggers/booking-starts/scan';
  public const SCAN_BATCH_SIZE = 100;
  /** Per-booking meta key prefix; suffixed with automation ID */
  public const META_KEY_PREFIX = '_mailpoet_booking_starts_triggered_';

  private WordPress $wp;
  private ActionScheduler $actionScheduler;
  private AutomationStorage $automationStorage;
  private BookingProviderInterface $bookingProvider;
  private ?int $currentAutomationId = null;

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

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Booking starts', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'timing' => Builder::string()->required()->pattern('^(before|after)$')->default('before'),
      'time_value' => Builder::integer()->required()->minimum(1)->maximum(365)->default(1),
      'time_unit' => Builder::string()->required()->pattern('^(minutes|hours|days)$')->default('hours'),
      'booking_statuses' => Builder::array(Builder::string())->required()->minItems(1),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceBookingSubject::KEY,
      CustomerSubject::KEY,
    ];
  }

  public function registerHooks(): void {
    $this->wp->addAction(self::SCHEDULED_HOOK, [$this, 'handle'], 10, 2);
    $this->wp->addAction(self::SCAN_HOOK, [$this, 'handleScan'], 10, 2);
  }

  /**
   * Called by Action Scheduler at the computed fire time.
   *
   * Re-validates that the automation is still active, the booking still
   * exists, and its current status is in the configured list. Sets dedup
   * meta to prevent re-firing for the same automation + booking pair.
   */
  public function handle(int $bookingId, int $automationId): void {
    $automation = $this->automationStorage->getAutomation($automationId);
    if (!$automation || $automation->getStatus() !== Automation::STATUS_ACTIVE) {
      return;
    }

    $booking = $this->bookingProvider->getBooking($bookingId);
    if (!$booking instanceof \WC_Booking) {
      return;
    }

    $trigger = $automation->getTrigger(self::KEY);
    if (!$trigger) {
      return;
    }

    // Status is checked at fire time, not at schedule time, because
    // the booking status may change between scheduling and firing.
    $configuredStatuses = $trigger->getArgs()['booking_statuses'] ?? [];
    if (!is_array($configuredStatuses) || !in_array($booking->get_status(), $configuredStatuses, true)) {
      return;
    }

    $metaKey = self::META_KEY_PREFIX . $automationId;
    if ($booking->get_meta($metaKey)) {
      return;
    }

    $booking->update_meta_data($metaKey, true);
    $booking->save();

    // Set currentAutomationId so isTriggeredBy() can match this automation.
    // Cleared in `finally` to ensure cleanup even if the trigger action throws.
    $this->currentAutomationId = $automationId;
    try {
      $order = $booking->get_order();
      $bookingArgs = ['booking_id' => $booking->get_id()];
      if ($order instanceof \WC_Order) {
        $bookingArgs['order_id'] = $order->get_id();
      }

      $subjects = [
        new Subject(WooCommerceBookingSubject::KEY, $bookingArgs),
      ];

      // For guest bookings, fall back to the order's customer ID
      $customerId = $booking->get_customer_id();
      if (!$customerId && ($order instanceof \WC_Order)) {
        $customerId = $order->get_customer_id();
      }

      if ($customerId) {
        $subjects[] = new Subject(CustomerSubject::KEY, ['customer_id' => $customerId]);
      }

      $this->wp->doAction(Hooks::TRIGGER, $this, $subjects);
    } finally {
      $this->currentAutomationId = null;
    }
  }

  /**
   * Batch-scan existing future bookings when an automation is activated.
   *
   * Processes bookings in batches of SCAN_BATCH_SIZE, ordered by ID.
   * Uses a cursor (lastProcessedId) for pagination via a posts_where filter,
   * since WP_Query does not natively support "ID > X" filtering.
   * Enqueues a follow-up scan job if a full batch was returned.
   */
  public function handleScan(int $automationId, int $lastProcessedId): void {
    $automation = $this->automationStorage->getAutomation($automationId);
    if (!$automation || $automation->getStatus() !== Automation::STATUS_ACTIVE) {
      return;
    }

    $trigger = $automation->getTrigger(self::KEY);
    if (!$trigger) {
      return;
    }

    $triggerArgs = $trigger->getArgs();
    $timing = $triggerArgs['timing'] ?? 'before';
    $timeValue = (int)($triggerArgs['time_value'] ?? 1);
    $timeUnit = $triggerArgs['time_unit'] ?? 'hours';

    // _booking_start stores timestamps as YmdHis strings
    $queryArgs = [
      'post_type' => 'wc_booking',
      'post_status' => 'any',
      'fields' => 'ids',
      'posts_per_page' => self::SCAN_BATCH_SIZE,
      'meta_key' => '_booking_start',
      'meta_value' => (string)$this->wp->currentTime('YmdHis'),
      'meta_compare' => '>',
      'orderby' => 'ID',
      'order' => 'ASC',
    ];

    // Cursor-based pagination via posts_where filter
    $whereFilter = null;
    if ($lastProcessedId > 0) {
      $whereFilter = function (string $where) use ($lastProcessedId): string {
        global $wpdb;
        return $where . $wpdb->prepare(" AND {$wpdb->posts}.ID > %d", $lastProcessedId);
      };
      $this->wp->addFilter('posts_where', $whereFilter);
    }

    /** @var int[] $bookingIds — 'fields' => 'ids' returns int[] */
    $bookingIds = $this->wp->getPosts($queryArgs);

    if ($whereFilter !== null) {
      $this->wp->removeFilter('posts_where', $whereFilter);
    }

    foreach ($bookingIds as $bookingId) {
      $booking = $this->bookingProvider->getBooking($bookingId);
      if (!$booking instanceof \WC_Booking) {
        continue;
      }

      $fireTime = $this->calculateFireTime($booking, $timing, $timeValue, $timeUnit);
      if ($fireTime === null) {
        continue;
      }

      $this->actionScheduler->schedule($fireTime, self::SCHEDULED_HOOK, [$bookingId, $automationId]);
    }

    if (count($bookingIds) >= self::SCAN_BATCH_SIZE) {
      $nextCursor = end($bookingIds);
      $this->actionScheduler->enqueue(self::SCAN_HOOK, [$automationId, $nextCursor]);
    }
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    return $args->getAutomation()->getId() === $this->currentAutomationId;
  }

  public function validate(StepValidationArgs $args): void {
    if (!$args->getAutomation()->needsFullValidation()) {
      return;
    }

    $stepArgs = $args->getStep()->getArgs();

    $timing = $stepArgs['timing'] ?? null;
    if (!is_string($timing) || !in_array($timing, ['before', 'after'], true)) {
      throw ValidationException::create()
        ->withMessage(__('Timing must be "before" or "after".', 'mailpoet-premium'));
    }

    $timeValue = $stepArgs['time_value'] ?? null;
    if (!is_int($timeValue) || $timeValue < 1) {
      throw ValidationException::create()
        ->withMessage(__('Time value must be at least 1.', 'mailpoet-premium'));
    }

    $timeUnit = $stepArgs['time_unit'] ?? null;
    if (!is_string($timeUnit) || !in_array($timeUnit, ['minutes', 'hours', 'days'], true)) {
      throw ValidationException::create()
        ->withMessage(__('Time unit must be "minutes", "hours", or "days".', 'mailpoet-premium'));
    }

    $bookingStatuses = $stepArgs['booking_statuses'] ?? null;
    if (!is_array($bookingStatuses) || empty($bookingStatuses)) {
      throw ValidationException::create()
        ->withMessage(__('At least one booking status must be selected.', 'mailpoet-premium'));
    }
  }

  /**
   * Compute the timestamp when the trigger should fire.
   *
   * Shared by BookingStartsHooks (scheduling) and handleScan (batch scan).
   * Returns null if the computed time is already in the past.
   *
   * @return int|null Fire timestamp or null if in the past
   */
  public static function calculateFireTime(\WC_Booking $booking, string $timing, int $timeValue, string $timeUnit): ?int {
    $start = $booking->get_start();
    if (!$start) {
      return null;
    }

    $multipliers = [
      'minutes' => 60,
      'hours' => 3600,
      'days' => 86400,
    ];
    $offset = $timeValue * ($multipliers[$timeUnit] ?? 3600);
    $fireTime = $timing === 'before' ? $start - $offset : $start + $offset;

    return $fireTime > time() ? (int)$fireTime : null;
  }
}
