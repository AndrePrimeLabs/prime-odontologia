<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers;

if (!defined('ABSPATH')) exit;


use DateTimeImmutable;
use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Logging\LoggerFactory;
use Throwable;

class CustomerWinBackScheduler {
  public const SCAN_HOOK = 'mailpoet_premium/automation/customer_win_back_scan';
  public const BATCH_SIZE = 250;
  public const LOCK_TTL_SECONDS = 15 * MINUTE_IN_SECONDS;
  public const LOCK_RETRY_DELAY_SECONDS = 5 * MINUTE_IN_SECONDS;
  private const INTER_BATCH_DELAY_SECONDS = 10;
  private const LOCK_CACHE_GROUP = 'mailpoet_customer_win_back';
  private const RECONCILE_CACHE_KEY = 'mailpoet_cwb_reconcile';
  private const RECONCILE_TTL_SECONDS = 5 * MINUTE_IN_SECONDS;
  private const SCHEDULED_ACTIONS_PAGE_SIZE = 100;

  /** @var WordPress */
  private $wp;

  /** @var ActionScheduler */
  private $actionScheduler;

  /** @var AutomationStorage */
  private $automationStorage;

  /** @var CustomerWinBackTrigger */
  private $trigger;

  public function __construct(
    WordPress $wp,
    ActionScheduler $actionScheduler,
    AutomationStorage $automationStorage,
    CustomerWinBackTrigger $trigger
  ) {
    $this->wp = $wp;
    $this->actionScheduler = $actionScheduler;
    $this->automationStorage = $automationStorage;
    $this->trigger = $trigger;
  }

  public function init(): void {
    $this->wp->addAction(self::SCAN_HOOK, [$this, 'handleScan'], 10, 1);
    $this->wp->addAction(Hooks::AUTOMATION_AFTER_SAVE, [$this, 'handleAutomationSaved'], 10, 2);
    $this->wp->addAction(Hooks::AUTOMATION_AFTER_DELETE, [$this, 'handleAutomationDeleted']);
    $this->wp->addAction(Hooks::AUTOMATION_AFTER_DUPLICATE, [$this, 'handleAutomationDuplicated'], 10, 2);
  }

  /**
   * @param array<string, mixed> $args
   */
  public function handleScan(array $args): void {
    $scanArgs = $this->normalizeScanArgs($args);
    if (!$scanArgs || !$this->isScanArgsCurrent($scanArgs)) {
      $this->reconcileStaleActions();
      return;
    }

    if (!$this->acquireLock($scanArgs['automation_id'], $scanArgs['trigger_id'])) {
      $this->scheduleScanFromArgs($scanArgs, time() + self::LOCK_RETRY_DELAY_SECONDS);
      return;
    }

    try {
      $automation = $this->automationStorage->getAutomation($scanArgs['automation_id']);
      $trigger = $automation ? $automation->getStep($scanArgs['trigger_id']) : null;
      if (!$automation || !$trigger instanceof Step || !$this->isCustomerWinBackTrigger($trigger) || $automation->getStatus() !== Automation::STATUS_ACTIVE) {
        return;
      }

      $config = self::getTriggerConfig($trigger);
      $lastOrders = $this->getLastCompletedOrdersAfterCursor($scanArgs['cursor']);
      $nextCursor = $scanArgs['cursor'];
      foreach ($lastOrders as $userId => $lastOrder) {
        $nextCursor = $userId;
        try {
          $this->processUser($automation, $trigger, $userId, $lastOrder, $config);
        } catch (Throwable $e) {
          LoggerFactory::getInstance()->getLogger(LoggerFactory::TOPIC_CRON)->error(
            'Customer win-back scan failed for automation #{automationId} and user #{userId}: {message}',
            [
              'automationId' => $automation->getId(),
              'userId' => $userId,
              'message' => $e->getMessage(),
            ]
          );
        }
      }

      $nextArgs = $this->buildScanArgs($automation, $trigger, count($lastOrders) >= self::BATCH_SIZE ? $nextCursor : 0);
      $nextTimestamp = count($lastOrders) >= self::BATCH_SIZE ? time() + self::INTER_BATCH_DELAY_SECONDS : time() + DAY_IN_SECONDS;
      $this->scheduleScanFromArgs($nextArgs, $nextTimestamp);
    } finally {
      $this->releaseLock($scanArgs['automation_id'], $scanArgs['trigger_id']);
    }
  }

  public function handleAutomationSaved(Automation $automation, ?Automation $previousAutomation = null): void {
    $previousTriggers = $previousAutomation ? $this->getCustomerWinBackTriggers($previousAutomation) : [];
    $currentTriggers = $this->getCustomerWinBackTriggers($automation);

    foreach ($previousTriggers as $previousTrigger) {
      $currentTrigger = $currentTriggers[$previousTrigger->getId()] ?? null;
      if (
        $automation->getStatus() !== Automation::STATUS_ACTIVE
        || !$currentTrigger
        || !$previousAutomation
        || $previousAutomation->getStatus() !== Automation::STATUS_ACTIVE
        || !$this->hasSameSchedulerConfig($previousTrigger, $currentTrigger)
      ) {
        $this->unscheduleScansForAutomationTrigger($automation->getId(), $previousTrigger->getId());
      }
    }

    if ($automation->getStatus() !== Automation::STATUS_ACTIVE) {
      $this->reconcileStaleActions(true);
      return;
    }

    foreach ($currentTriggers as $currentTrigger) {
      $previousTrigger = $previousTriggers[$currentTrigger->getId()] ?? null;
      $shouldSchedule = !$previousAutomation
        || $previousAutomation->getStatus() !== Automation::STATUS_ACTIVE
        || !$previousTrigger
        || !$this->hasSameSchedulerConfig($previousTrigger, $currentTrigger);
      if ($shouldSchedule) {
        $this->unscheduleScansForAutomationTrigger($automation->getId(), $currentTrigger->getId());
        $this->scheduleScan($automation, $currentTrigger, 0, time());
      }
    }

    $this->reconcileStaleActions(true);
  }

  public function handleAutomationDeleted(Automation $automation): void {
    foreach ($this->getCustomerWinBackTriggers($automation) as $trigger) {
      $this->unscheduleScansForAutomationTrigger($automation->getId(), $trigger->getId());
    }
    $this->reconcileStaleActions(true);
  }

  public function handleAutomationDuplicated(Automation $automation, Automation $sourceAutomation): void {
    if ($automation->getStatus() !== Automation::STATUS_ACTIVE) {
      $this->reconcileStaleActions(true);
      return;
    }

    foreach ($this->getCustomerWinBackTriggers($automation) as $trigger) {
      $this->scheduleScan($automation, $trigger, 0, time());
    }
    $this->reconcileStaleActions(true);
  }

  public function reconcileStaleActions(bool $force = false): void {
    if (!$force && !$this->wp->wpCacheAdd(self::RECONCILE_CACHE_KEY, time(), self::LOCK_CACHE_GROUP, self::RECONCILE_TTL_SECONDS)) {
      return;
    }

    foreach ($this->getScheduledScanActions() as $action) {
      $args = $action->get_args();
      $scanArgs = $this->normalizeScanArgs($args[0] ?? []);
      if (!$scanArgs || !$this->isScanArgsCurrent($scanArgs)) {
        $this->actionScheduler->unscheduleAction(self::SCAN_HOOK, $args);
      }
    }
  }

  /** @return array{days_since_last_purchase: int} */
  public static function getTriggerConfig(Step $trigger): array {
    $args = $trigger->getArgs();
    $daysSinceLastPurchase = self::getIntConfigValue($args, 'days_since_last_purchase') ?? CustomerWinBackTrigger::DEFAULT_DAYS_SINCE_LAST_PURCHASE;

    return [
      'days_since_last_purchase' => $daysSinceLastPurchase,
    ];
  }

  /**
   * @param array{order_id: int, date: DateTimeImmutable} $lastOrder
   * @param array{days_since_last_purchase: int} $config
   */
  private function processUser(Automation $automation, Step $trigger, int $userId, array $lastOrder, array $config): void {
    $user = $this->wp->getUserBy('id', $userId);
    if (!$user instanceof \WP_User) {
      return;
    }

    if (!$this->isEligibleByDate($lastOrder['date'], $config['days_since_last_purchase'])) {
      return;
    }

    $intervalBucket = $this->calculateIntervalBucket($config['days_since_last_purchase']);

    $this->trigger->triggerCustomer(
      $automation,
      $trigger,
      $userId,
      $lastOrder['order_id'],
      $intervalBucket
    );
  }

  private function scheduleScan(Automation $automation, Step $trigger, int $cursor, int $timestamp): void {
    $this->scheduleScanFromArgs($this->buildScanArgs($automation, $trigger, $cursor), $timestamp);
  }

  /**
   * @param array{automation_id: int, trigger_id: string, days_since_last_purchase: int, cursor: int} $args
   */
  private function scheduleScanFromArgs(array $args, int $timestamp): void {
    if ($this->actionScheduler->hasScheduledAction(self::SCAN_HOOK, [$args])) {
      return;
    }
    $this->actionScheduler->schedule($timestamp, self::SCAN_HOOK, [$args]);
  }

  /**
   * @return array{automation_id: int, trigger_id: string, days_since_last_purchase: int, cursor: int}
   */
  private function buildScanArgs(Automation $automation, Step $trigger, int $cursor): array {
    $config = self::getTriggerConfig($trigger);
    return [
      'automation_id' => $automation->getId(),
      'trigger_id' => $trigger->getId(),
      'days_since_last_purchase' => $config['days_since_last_purchase'],
      'cursor' => $cursor,
    ];
  }

  /**
   * @param mixed $args
   * @return array{automation_id: int, trigger_id: string, days_since_last_purchase: int, cursor: int}|null
   */
  private function normalizeScanArgs($args): ?array {
    if (!is_array($args)) {
      return null;
    }

    $automationId = $this->getIntScanArg($args, 'automation_id') ?? 0;
    $triggerId = $this->getStringScanArg($args, 'trigger_id') ?? '';
    $daysSinceLastPurchase = $this->getIntScanArg($args, 'days_since_last_purchase') ?? 0;
    if (!$automationId || $triggerId === '' || $daysSinceLastPurchase < 1) {
      return null;
    }

    return [
      'automation_id' => $automationId,
      'trigger_id' => $triggerId,
      'days_since_last_purchase' => $daysSinceLastPurchase,
      'cursor' => max(0, $this->getIntScanArg($args, 'cursor') ?? 0),
    ];
  }

  /**
   * @param array{automation_id: int, trigger_id: string, days_since_last_purchase: int, cursor: int} $scanArgs
   */
  private function isScanArgsCurrent(array $scanArgs): bool {
    $automation = $this->automationStorage->getAutomation($scanArgs['automation_id']);
    if (!$automation || $automation->getStatus() !== Automation::STATUS_ACTIVE) {
      return false;
    }

    $trigger = $automation->getStep($scanArgs['trigger_id']);
    if (!$trigger instanceof Step || !$this->isCustomerWinBackTrigger($trigger)) {
      return false;
    }

    return $this->scanArgsMatchTrigger($scanArgs, $trigger);
  }

  /**
   * @param array{automation_id: int, trigger_id: string, days_since_last_purchase: int, cursor: int} $scanArgs
   */
  private function scanArgsMatchTrigger(array $scanArgs, Step $trigger): bool {
    $config = self::getTriggerConfig($trigger);
    return $scanArgs['days_since_last_purchase'] === $config['days_since_last_purchase'];
  }

  private function hasSameSchedulerConfig(Step $previousTrigger, Step $currentTrigger): bool {
    return $this->buildComparableConfig($previousTrigger) === $this->buildComparableConfig($currentTrigger);
  }

  /** @return array{days_since_last_purchase: int} */
  private function buildComparableConfig(Step $trigger): array {
    $config = self::getTriggerConfig($trigger);
    return [
      'days_since_last_purchase' => $config['days_since_last_purchase'],
    ];
  }

  private function unscheduleScansForAutomationTrigger(int $automationId, string $triggerId): void {
    foreach ($this->getScheduledScanActions() as $action) {
      $args = $action->get_args();
      $scanArgs = $this->normalizeScanArgs($args[0] ?? []);
      if ($scanArgs && $scanArgs['automation_id'] === $automationId && $scanArgs['trigger_id'] === $triggerId) {
        $this->actionScheduler->unscheduleAction(self::SCAN_HOOK, $args);
      }
    }
  }

  /**
   * @return array<string, Step>
   */
  private function getCustomerWinBackTriggers(Automation $automation): array {
    $triggers = [];
    foreach ($automation->getSteps() as $step) {
      if ($this->isCustomerWinBackTrigger($step)) {
        $triggers[$step->getId()] = $step;
      }
    }
    return $triggers;
  }

  private function isCustomerWinBackTrigger(?Step $step): bool {
    return $step !== null && $step->getType() === Step::TYPE_TRIGGER && $step->getKey() === CustomerWinBackTrigger::KEY;
  }

  /**
   * @return \ActionScheduler_Action[]
   */
  private function getScheduledScanActions(): array {
    $actions = [];
    $offset = 0;
    do {
      $page = $this->actionScheduler->getScheduledActions([
        'hook' => self::SCAN_HOOK,
        'status' => 'pending',
        'per_page' => self::SCHEDULED_ACTIONS_PAGE_SIZE,
        'offset' => $offset,
      ]);
      $actions = array_merge($actions, $page);
      $offset += self::SCHEDULED_ACTIONS_PAGE_SIZE;
    } while (count($page) === self::SCHEDULED_ACTIONS_PAGE_SIZE);
    return $actions;
  }

  /**
   * @return array<int, array{order_id: int, date: DateTimeImmutable}>
   */
  private function getLastCompletedOrdersAfterCursor(int $cursor): array {
    global $wpdb;
    $rows = $wpdb->get_results(
      $wpdb->prepare(
        'SELECT customer.user_id, stats.order_id, stats.date_completed
        FROM %i AS customer
        INNER JOIN %i AS stats ON stats.customer_id = customer.customer_id
        LEFT JOIN %i AS newer
          ON newer.customer_id = stats.customer_id
          AND newer.status = %s
          AND newer.date_completed IS NOT NULL
          AND (
            newer.date_completed > stats.date_completed
            OR (newer.date_completed = stats.date_completed AND newer.order_id > stats.order_id)
          )
        WHERE customer.user_id > %d
          AND customer.user_id > 0
          AND stats.status = %s
          AND stats.date_completed IS NOT NULL
          AND newer.order_id IS NULL
        ORDER BY customer.user_id ASC
        LIMIT %d',
        $wpdb->prefix . 'wc_customer_lookup',
        $wpdb->prefix . 'wc_order_stats',
        $wpdb->prefix . 'wc_order_stats',
        'wc-completed',
        $cursor,
        'wc-completed',
        self::BATCH_SIZE
      ),
      ARRAY_A
    );

    $lastOrders = [];
    foreach ((array)$rows as $row) {
      $userId = (int)$row['user_id'];
      $lastOrders[$userId] = [
        'order_id' => (int)$row['order_id'],
        'date' => new DateTimeImmutable((string)$row['date_completed'], $this->wp->wpTimezone()),
      ];
    }
    return $lastOrders;
  }

  private function isEligibleByDate(DateTimeImmutable $lastCompletedOrderDate, int $daysSinceLastPurchase): bool {
    $thresholdDate = (new DateTimeImmutable('now', $this->wp->wpTimezone()))
      ->modify('-' . $daysSinceLastPurchase . ' days')
      ->format('Y-m-d');
    return $lastCompletedOrderDate->format('Y-m-d') <= $thresholdDate;
  }

  private function calculateIntervalBucket(int $intervalDays): int {
    $today = (new DateTimeImmutable('now', $this->wp->wpTimezone()))->setTime(0, 0);
    $epoch = new DateTimeImmutable('1970-01-01', $this->wp->wpTimezone());
    $daysSinceEpoch = (int)$epoch->diff($today)->format('%a');
    return intdiv($daysSinceEpoch, $intervalDays);
  }

  /**
   * @param array<string, mixed> $args
   */
  private static function getIntConfigValue(array $args, string $key): ?int {
    $value = $args[$key] ?? null;
    if (is_int($value)) {
      return $value;
    }
    if (is_string($value) && is_numeric($value)) {
      return (int)$value;
    }
    return null;
  }

  /**
   * @param array<mixed> $args
   */
  private function getIntScanArg(array $args, string $key): ?int {
    $value = $args[$key] ?? null;
    if (is_int($value)) {
      return $value;
    }
    if (is_string($value) && is_numeric($value)) {
      return (int)$value;
    }
    return null;
  }

  /**
   * @param array<mixed> $args
   */
  private function getStringScanArg(array $args, string $key): ?string {
    $value = $args[$key] ?? null;
    return is_string($value) ? $value : null;
  }

  private function acquireLock(int $automationId, string $triggerId): bool {
    $lockKey = $this->getLockKey($automationId, $triggerId);
    if ($this->addLockOption($lockKey)) {
      return true;
    }

    $createdAt = $this->wp->getOption($lockKey);
    if (!is_numeric($createdAt) || (int)$createdAt + self::LOCK_TTL_SECONDS > time()) {
      return false;
    }

    $this->deleteLockOption($lockKey);
    return $this->addLockOption($lockKey);
  }

  private function releaseLock(int $automationId, string $triggerId): void {
    $this->deleteLockOption($this->getLockKey($automationId, $triggerId));
  }

  private function getLockKey(int $automationId, string $triggerId): string {
    return 'mailpoet_cwb_scan_' . $automationId . '_' . md5($triggerId);
  }

  private function addLockOption(string $lockKey): bool {
    global $wpdb;
    $inserted = $wpdb->query(
      $wpdb->prepare(
        'INSERT IGNORE INTO %i (option_name, option_value, autoload) VALUES (%s, %s, %s)',
        $wpdb->options,
        $lockKey,
        (string)time(),
        'no'
      )
    );
    $this->wp->wpCacheDelete($lockKey, 'options');
    return (bool)$inserted;
  }

  private function deleteLockOption(string $lockKey): void {
    global $wpdb;
    $wpdb->delete($wpdb->options, ['option_name' => $lockKey], ['%s']);
    $this->wp->wpCacheDelete($lockKey, 'options');
  }
}
