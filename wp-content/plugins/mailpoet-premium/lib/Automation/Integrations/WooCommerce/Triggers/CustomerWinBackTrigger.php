<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Engine\Storage\AutomationRunStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\CustomerSubject;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\OrderSubject;
use MailPoet\Automation\Integrations\WordPress\Subjects\UserSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\CustomerWinBackSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class CustomerWinBackTrigger implements Trigger {
  public const KEY = 'woocommerce:customer-win-back';
  public const DEFAULT_DAYS_SINCE_LAST_PURCHASE = 60;

  /** @var WordPress */
  private $wp;

  /** @var AutomationRunStorage */
  private $automationRunStorage;

  /** @var int|null */
  private $currentAutomationId = null;

  /** @var string|null */
  private $currentTriggerId = null;

  public function __construct(
    WordPress $wp,
    AutomationRunStorage $automationRunStorage
  ) {
    $this->wp = $wp;
    $this->automationRunStorage = $automationRunStorage;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Customer win back', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'days_since_last_purchase' => Builder::integer()->required()->minimum(1)->default(self::DEFAULT_DAYS_SINCE_LAST_PURCHASE),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      OrderSubject::KEY,
      CustomerSubject::KEY,
      UserSubject::KEY,
      CustomerWinBackSubject::KEY,
    ];
  }

  public function registerHooks(): void {
  }

  public function validate(StepValidationArgs $args): void {
    if (!$args->getAutomation()->needsFullValidation()) {
      return;
    }

    $config = CustomerWinBackScheduler::getTriggerConfig($args->getStep());
    if ($config['days_since_last_purchase'] < 1) {
      throw ValidationException::create()
        ->withError('days_since_last_purchase', __('Days since last purchase must be at least 1.', 'mailpoet-premium'));
    }

  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    if ($args->getAutomation()->getId() !== $this->currentAutomationId || $args->getStep()->getId() !== $this->currentTriggerId) {
      return false;
    }

    $subjects = $args->getAutomationRun()->getSubjects(CustomerWinBackSubject::KEY);
    $subject = $subjects[0] ?? null;
    if (!$subject) {
      return false;
    }

    return $this->automationRunStorage->getCountByAutomationTriggerAndSubject(
      $args->getAutomation(),
      self::KEY,
      $subject
    ) === 0;
  }

  public function triggerCustomer(
    Automation $automation,
    Step $trigger,
    int $customerId,
    int $lastOrderId,
    int $intervalBucket
  ): void {
    $winBackSubjectArgs = [
      'customer_id' => $customerId,
      'interval_bucket' => $intervalBucket,
    ];

    $this->currentAutomationId = $automation->getId();
    $this->currentTriggerId = $trigger->getId();
    try {
      $this->wp->doAction(Hooks::TRIGGER, $this, [
        new Subject(OrderSubject::KEY, ['order_id' => $lastOrderId]),
        new Subject(CustomerSubject::KEY, ['customer_id' => $customerId]),
        new Subject(UserSubject::KEY, ['user_id' => $customerId]),
        new Subject(CustomerWinBackSubject::KEY, $winBackSubjectArgs),
      ]);
    } finally {
      $this->currentAutomationId = null;
      $this->currentTriggerId = null;
    }
  }
}
