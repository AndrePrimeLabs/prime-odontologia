<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\Storage\AutomationRunStorage;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Logging\LoggerFactory;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\SavedCardSubject;
use MailPoet\Subscribers\SubscribersRepository;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class SavedCardExpiresTrigger implements Trigger {

  public const KEY = 'woocommerce:saved-card-expires';
  public const SCHEDULED_HOOK = 'mailpoet/automation/triggers/saved-card-expires/run';
  public const BATCH_SIZE = 1000;

  private WordPress $wp;
  private ActionScheduler $actionScheduler;
  private AutomationStorage $automationStorage;
  private AutomationRunStorage $automationRunStorage;
  private SubscribersRepository $subscribersRepository;
  private ?int $currentAutomationId = null;

  public function __construct(
    WordPress $wp,
    ActionScheduler $actionScheduler,
    AutomationStorage $automationStorage,
    AutomationRunStorage $automationRunStorage,
    SubscribersRepository $subscribersRepository
  ) {
    $this->wp = $wp;
    $this->actionScheduler = $actionScheduler;
    $this->automationStorage = $automationStorage;
    $this->automationRunStorage = $automationRunStorage;
    $this->subscribersRepository = $subscribersRepository;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __("Customer's saved card expires", 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'days_before' => Builder::integer()->required()->minimum(1)->maximum(365)->default(7),
      'send_hour' => Builder::integer()->required()->minimum(0)->maximum(23)->default(0),
    ]);
  }

  public function getSubjectKeys(): array {
    return [SavedCardSubject::KEY];
  }

  public function validate(StepValidationArgs $args): void {
    // The args schema (days_before integer 1-365 required, send_hour integer 0-23 required) is enforced
    // by the engine before this method runs, so there is nothing additional to check here.
  }

  public function registerHooks(): void {
    $this->wp->addAction(self::SCHEDULED_HOOK, [$this, 'handle']);
  }

  public function handle(?\DateTimeImmutable $now = null): void {
    $automations = $this->automationStorage->getActiveAutomationsByTriggerKey(self::KEY);
    if (count($automations) === 0) {
      return;
    }

    $currentTime = $now ?? new \DateTimeImmutable('now', $this->wp->wpTimezone());
    $currentHour = (int)$currentTime->format('G');

    try {
      foreach ($automations as $automation) {
        try {
          $trigger = $automation->getTrigger(self::KEY);
          if (!$trigger) {
            continue;
          }
          $sendHour = (int)($trigger->getArgs()['send_hour'] ?? 0);
          if ($sendHour !== $currentHour) {
            continue;
          }
          $this->processAutomation($automation, $currentTime);
        } catch (\Throwable $e) {
          LoggerFactory::getInstance()->getLogger(LoggerFactory::TOPIC_CRON)->error(
            'Saved-card-expires trigger failed for automation #{id}: {message}',
            ['id' => $automation->getId(), 'message' => $e->getMessage()]
          );
        }
      }
    } finally {
      $nextHourTime = $currentTime->modify('+1 hour');
      $nextRun = $nextHourTime->setTime((int)$nextHourTime->format('G'), 0);
      if (!$this->actionScheduler->hasPendingScheduledAction(self::SCHEDULED_HOOK)) {
        $this->actionScheduler->schedule((int)$nextRun->getTimestamp(), self::SCHEDULED_HOOK);
      }
    }
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    return $args->getAutomation()->getId() === $this->currentAutomationId;
  }

  private function processAutomation(Automation $automation, \DateTimeImmutable $now): void {
    $trigger = $automation->getTrigger(self::KEY);
    if (!$trigger) {
      return;
    }

    $daysBefore = (int)($trigger->getArgs()['days_before'] ?? 7);
    if ($daysBefore < 1) {
      return;
    }

    $today = $now->setTime(0, 0);
    $targetDate = $today->modify("+{$daysBefore} days");

    foreach ($this->findTokensExpiringOn($targetDate) as $tokenRow) {
      $tokenId = (int)$tokenRow['token_id'];
      $userId = (int)$tokenRow['user_id'];
      $expiryMonth = (string)$tokenRow['expiry_month'];
      $expiryYear = (string)$tokenRow['expiry_year'];

      // The trigger ultimately needs to deliver an email to a MailPoet subscriber, so skip tokens
      // whose owning WP user has no linked subscriber. The subscriber-derivation transformer chain
      // would otherwise throw and the trigger would silently fail to fire.
      $subscriber = $this->subscribersRepository->findOneBy(['wpUserId' => $userId]);
      if (!$subscriber) {
        continue;
      }

      $subject = new Subject(SavedCardSubject::KEY, [
        'token_id' => $tokenId,
        'user_id' => $userId,
        'expiry_month' => $expiryMonth,
        'expiry_year' => $expiryYear,
      ]);

      $existingRuns = $this->automationRunStorage->getCountByAutomationAndSubject($automation, $subject);
      if ($existingRuns > 0) {
        continue;
      }

      $this->currentAutomationId = $automation->getId();
      try {
        $this->wp->doAction(Hooks::TRIGGER, $this, [$subject]);
      } finally {
        $this->currentAutomationId = null;
      }
    }
  }

  /**
   * Returns rows of CC payment tokens whose expiry month/year match the last calendar day of $targetDate's month.
   * A card expires on the last day of its expiry month, so we match tokens whose stored expiry_month/expiry_year
   * resolve to that same last day.
   *
   * @return \Generator<array{token_id: int, user_id: int, expiry_month: string, expiry_year: string}>
   */
  private function findTokensExpiringOn(\DateTimeImmutable $targetDate): \Generator {
    $lastDayOfMonth = (new \DateTimeImmutable($targetDate->format('Y-m-01')))->modify('last day of this month');
    if ($targetDate->format('Y-m-d') !== $lastDayOfMonth->format('Y-m-d')) {
      // Cards only expire on the last calendar day of their expiry month, so no card can match dates other than that.
      return;
    }

    global $wpdb;
    $tokensTable = $wpdb->prefix . 'woocommerce_payment_tokens';
    $metaTable = $wpdb->prefix . 'woocommerce_payment_tokenmeta';
    $expiryMonth = $targetDate->format('m');
    $expiryYear = $targetDate->format('Y');

    // WC payment-token tables are reached via $wpdb->prefix; sprintf-ing them into the
    // query before $wpdb->prepare() is the established pattern. All user-supplied values
    // go through %d/%s placeholders.
    $sqlTemplate = sprintf(
      "SELECT t.token_id, t.user_id, m1.meta_value AS expiry_month, m2.meta_value AS expiry_year
       FROM %s t
       INNER JOIN %s m1 ON t.token_id = m1.payment_token_id AND m1.meta_key = 'expiry_month'
       INNER JOIN %s m2 ON t.token_id = m2.payment_token_id AND m2.meta_key = 'expiry_year'
       WHERE t.type = 'CC'
         AND t.user_id > 0
         AND t.token_id > %%d
         AND m1.meta_value = %%s
         AND m2.meta_value = %%s
       ORDER BY t.token_id ASC
       LIMIT %%d",
      $tokensTable,
      $metaTable,
      $metaTable
    );

    $lastId = 0;
    do {
      // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $sqlTemplate is a literal sprintf'd string above; placeholders go through prepare().
      $query = $wpdb->prepare($sqlTemplate, $lastId, $expiryMonth, $expiryYear, self::BATCH_SIZE);
      $rows = $wpdb->get_results($query, ARRAY_A); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
      if (!is_array($rows) || count($rows) === 0) {
        return;
      }

      foreach ($rows as $row) {
        if (
          !is_array($row)
          || !isset($row['token_id'], $row['user_id'], $row['expiry_month'], $row['expiry_year'])
          || !is_scalar($row['token_id'])
          || !is_scalar($row['user_id'])
          || !is_scalar($row['expiry_month'])
          || !is_scalar($row['expiry_year'])
        ) {
          continue;
        }
        yield [
          'token_id' => (int)$row['token_id'],
          'user_id' => (int)$row['user_id'],
          'expiry_month' => (string)$row['expiry_month'],
          'expiry_year' => (string)$row['expiry_year'],
        ];
      }

      $lastRow = end($rows);
      if (!is_array($lastRow) || !isset($lastRow['token_id']) || !is_scalar($lastRow['token_id'])) {
        // $lastId can't advance, so a full BATCH_SIZE batch would loop forever; bail out.
        return;
      }
      $lastId = (int)$lastRow['token_id'];
    } while (count($rows) >= self::BATCH_SIZE);
  }
}
