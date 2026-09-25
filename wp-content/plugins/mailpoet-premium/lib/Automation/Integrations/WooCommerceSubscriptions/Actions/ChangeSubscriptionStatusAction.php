<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Payloads\WooCommerceSubscriptionPayload;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Subjects\WooCommerceSubscriptionSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class ChangeSubscriptionStatusAction extends AbstractSubscriptionAction implements Action {
  public const KEY = 'woocommerce-subscriptions:change-subscription-status';

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Change subscription status', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'target_status' => Builder::string()->required()->minLength(1),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceSubscriptionSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $this->validateTargetStatus((string)($args->getStep()->getArgs()['target_status'] ?? ''));
    $this->authorizeSave($args->getAutomation());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorizeRun($args->getAutomation());
    $this->runtimeWooCommerceSubscriptionsActive();
    $targetStatus = (string)($args->getStep()->getArgs()['target_status'] ?? '');
    $this->validateTargetStatus($targetStatus);

    $subscription = $args->getSinglePayloadByClass(WooCommerceSubscriptionPayload::class)->getSubscription();
    try {
      $subscription->update_status($targetStatus);
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __('Subscription status could not be changed.', 'mailpoet-premium')
      );
    }
  }

  public function onDuplicate(Step $step): Step {
    return $step;
  }
}
