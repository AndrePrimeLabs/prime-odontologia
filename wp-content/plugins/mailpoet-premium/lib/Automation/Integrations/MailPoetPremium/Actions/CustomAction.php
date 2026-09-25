<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Exceptions\NotFoundException;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Integrations\MailPoet\Payloads\SubscriberPayload;
use MailPoet\Premium\Automation\Engine\AutomationAuthorization;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\CustomHookChain;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Payloads\CustomDataPayload;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\CustomTrigger;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;
use MailPoet\WP\Functions as WPFunctions;

class CustomAction implements Action {
  /** @var AutomationAuthorization */
  private $authorization;

  /** @var CustomHookChain */
  private $customHookChain;

  /** @var WPFunctions */
  private $wp;

  public function __construct(
    AutomationAuthorization $authorization,
    CustomHookChain $customHookChain,
    WPFunctions $wp
  ) {
    $this->authorization = $authorization;
    $this->customHookChain = $customHookChain;
    $this->wp = $wp;
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorization->authorizeRun($args->getAutomation(), [], $this->getAuthorizationMessage());

    $step = $args->getStep();
    $hook = $step->getArgs()['hook'];
    $email = $args->getSinglePayloadByClass(SubscriberPayload::class)->getSubscriber()->getEmail();
    $payload = null;
    try {
      $payload = $args->getSinglePayloadByClass(CustomDataPayload::class);
    } catch (NotFoundException $e) {
      // no custom data subject is attached, e.g. the run was not started by a custom trigger
    }
    $customData = $payload ? $payload->getData() : [];
    $depth = $payload ? $payload->getDepth() : 0;

    $this->customHookChain->dispatch($depth + 1, function () use ($hook, $email, $customData): void {
      $this->wp->doAction($hook, $email, $customData);
    });
  }

  public function getKey(): string {
    return 'mailpoet:custom-action';
  }

  public function getName(): string {
    // translators: automation action title
    return __('Custom action', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'hook' => Builder::string()->default('my_custom_hook')->minLength(1)->required(),
    ]);
  }

  public function getSubjectKeys(): array {
    return ['mailpoet:subscriber'];
  }

  public function validate(StepValidationArgs $args): void {
    $hook = (string)($args->getStep()->getArgs()['hook'] ?? '');
    foreach ($args->getAutomation()->getTriggers() as $trigger) {
      if ($trigger->getKey() === CustomTrigger::KEY && ($trigger->getArgs()['hook'] ?? null) === $hook) {
        $message = __('This hook is used by the custom trigger of this automation, so firing it would trigger the automation again.', 'mailpoet-premium');
        throw ValidationException::create()->withMessage($message)->withError('hook', $message);
      }
    }
    $this->authorization->authorizeSave($args->getAutomation(), [], $this->getAuthorizationMessage());
  }

  public function onDuplicate(Step $step): Step {
    // Intentionally left empty for now
    return $step;
  }

  private function getAuthorizationMessage(): string {
    return __('The user who last saved this automation is not allowed to manage automations.', 'mailpoet-premium');
  }
}
