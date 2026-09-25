<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Engine\Storage\AutomationRunStorage;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\CustomFields\CustomFieldsRepository;
use MailPoet\Entities\CustomFieldEntity;
use MailPoet\Logging\LoggerFactory;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class AnnualDateTrigger implements Trigger {

  public const KEY = 'mailpoet:annual-date';
  public const SCHEDULED_HOOK = 'mailpoet/automation/triggers/annual-date/run';
  public const BATCH_SIZE = 1000;

  private WordPress $wp;
  private ActionScheduler $actionScheduler;
  private AutomationStorage $automationStorage;
  private AutomationRunStorage $automationRunStorage;
  private CustomFieldsRepository $customFieldsRepository;
  private ?int $currentAutomationId = null;

  public function __construct(
    WordPress $wp,
    ActionScheduler $actionScheduler,
    AutomationStorage $automationStorage,
    AutomationRunStorage $automationRunStorage,
    CustomFieldsRepository $customFieldsRepository
  ) {
    $this->wp = $wp;
    $this->actionScheduler = $actionScheduler;
    $this->automationStorage = $automationStorage;
    $this->automationRunStorage = $automationRunStorage;
    $this->customFieldsRepository = $customFieldsRepository;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Birthday', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'custom_field_id' => Builder::integer()->required()->minimum(1),
      'timing' => Builder::string()->required()->pattern('^(before|on|after)$')->default('on'),
      'days_offset' => Builder::integer()->required()->minimum(0)->maximum(365)->default(1),
      'send_hour' => Builder::integer()->required()->minimum(0)->maximum(23)->default(0),
    ]);
  }

  public function getSubjectKeys(): array {
    return [SubscriberSubject::KEY];
  }

  public function validate(StepValidationArgs $args): void {
    if (!$args->getAutomation()->needsFullValidation()) {
      return;
    }

    $stepArgs = $args->getStep()->getArgs();

    $customFieldId = $stepArgs['custom_field_id'] ?? null;
    if (!is_int($customFieldId) || $customFieldId < 1) {
      throw ValidationException::create()
        ->withMessage(__('A date custom field must be selected.', 'mailpoet-premium'));
    }

    $customField = $this->customFieldsRepository->findOneById($customFieldId);
    $params = $customField ? $customField->getParams() : null;
    if (
      !$customField
      || $customField->getType() !== CustomFieldEntity::TYPE_DATE
      || ($params['date_type'] ?? null) !== 'year_month_day'
    ) {
      throw ValidationException::create()
        ->withMessage(__('The selected custom field must be a "year, month, day" date field.', 'mailpoet-premium'));
    }
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
          $this->processAutomation($automation, $now);
        } catch (\Throwable $e) {
          LoggerFactory::getInstance()->getLogger(LoggerFactory::TOPIC_CRON)->error('Annual-date trigger failed for automation #{id}: {message}', ['id' => $automation->getId(), 'message' => $e->getMessage()]);
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

  private function processAutomation(Automation $automation, ?\DateTimeImmutable $now): void {
    $trigger = $automation->getTrigger(self::KEY);
    if (!$trigger) {
      return;
    }

    $triggerArgs = $trigger->getArgs();
    $customFieldId = (int)($triggerArgs['custom_field_id'] ?? 0);
    $timing = (string)($triggerArgs['timing'] ?? 'on');
    $daysOffset = (int)($triggerArgs['days_offset'] ?? 0);

    if ($customFieldId < 1) {
      return;
    }

    $targetDate = $this->computeTargetDate($timing, $daysOffset, $now);
    $mmDd = $targetDate->format('m-d');
    $targetDateString = $targetDate->format('Y-m-d');

    $matchValues = [$mmDd];

    if ($mmDd === '02-28' && !$this->isLeapYear((int)$targetDate->format('Y'))) {
      $matchValues[] = '02-29';
    }

    $this->processBatches($automation, $customFieldId, $matchValues, $targetDateString);
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    return $args->getAutomation()->getId() === $this->currentAutomationId;
  }

  /**
   * @param string[] $matchValues MM-DD strings to match
   */
  private function processBatches(Automation $automation, int $customFieldId, array $matchValues, string $targetDateString): void {
    global $wpdb;

    $lastId = 0;
    do {
      $placeholders = implode(',', array_fill(0, count($matchValues), '%s'));
      $table = $wpdb->prefix . 'mailpoet_subscriber_custom_field';
      // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
      $query = $wpdb->prepare("SELECT subscriber_id FROM {$table} WHERE custom_field_id = %d AND subscriber_id > %d AND value != '' AND SUBSTRING(value, 6, 5) IN ({$placeholders}) ORDER BY subscriber_id ASC LIMIT %d", array_merge([$customFieldId, $lastId], $matchValues, [self::BATCH_SIZE]));
      $rows = $wpdb->get_results($query, ARRAY_A); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

      if (!is_array($rows)) {
        break;
      }

      foreach ($rows as $row) {
        if (!is_array($row) || !isset($row['subscriber_id']) || !is_scalar($row['subscriber_id'])) {
          continue;
        }
        $subscriberId = (int)$row['subscriber_id'];
        $subject = new Subject(SubscriberSubject::KEY, [
          'subscriber_id' => $subscriberId,
          'target_date' => $targetDateString,
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

      if (count($rows) > 0) {
        $lastRow = end($rows);
        if (is_array($lastRow) && isset($lastRow['subscriber_id']) && is_scalar($lastRow['subscriber_id'])) {
          $lastId = (int)$lastRow['subscriber_id'];
        } else {
          // $lastId can't advance, so a full BATCH_SIZE batch would loop forever; bail out.
          break;
        }
      }
    } while (count($rows) >= self::BATCH_SIZE);
  }

  private function computeTargetDate(string $timing, int $daysOffset, ?\DateTimeImmutable $now = null): \DateTimeImmutable {
    $today = $now ?? new \DateTimeImmutable('today midnight', $this->wp->wpTimezone());

    if ($timing === 'before') {
      return $today->modify("+{$daysOffset} days");
    }

    if ($timing === 'after') {
      return $today->modify("-{$daysOffset} days");
    }

    return $today;
  }

  private function isLeapYear(int $year): bool {
    return ($year % 4 === 0 && $year % 100 !== 0) || ($year % 400 === 0);
  }
}
