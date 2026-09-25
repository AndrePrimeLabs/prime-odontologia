<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Integrations\WooCommerce\Payloads\OrderPayload;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\OrderSubject;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Premium\Automation\Engine\AutomationAuthorization;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class ChangeOrderStatusAction implements Action {
  public const KEY = 'woocommerce:change-order-status';

  /** @var WooCommerce */
  private $woocommerce;

  /** @var AutomationAuthorization */
  private $authorization;

  public function __construct(
    WooCommerce $woocommerce,
    AutomationAuthorization $authorization
  ) {
    $this->woocommerce = $woocommerce;
    $this->authorization = $authorization;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Change order status', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'target_status' => Builder::string()->required()->minLength(1),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      OrderSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $this->validateTargetStatus((string)($args->getStep()->getArgs()['target_status'] ?? ''));
    $this->authorization->authorizeSave($args->getAutomation(), [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorization->authorizeRun($args->getAutomation(), [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
    $targetStatus = (string)($args->getStep()->getArgs()['target_status'] ?? '');
    $this->validateTargetStatus($targetStatus);

    $order = $args->getSinglePayloadByClass(OrderPayload::class)->getOrder();
    if ($this->normalizeStatus($order->get_status()) === $this->normalizeStatus($targetStatus)) {
      return;
    }

    try {
      $order->update_status($targetStatus);
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __("Order status could not be changed.", 'mailpoet-premium')
      );
    }
  }

  public function onDuplicate(Step $step): Step {
    return $step;
  }

  private function validateTargetStatus(string $targetStatus): void {
    $targetStatus = $this->normalizeStatus($targetStatus);
    $validStatuses = array_map([$this, 'normalizeStatus'], array_keys($this->woocommerce->wcGetOrderStatuses()));
    if ($targetStatus === '' || !in_array($targetStatus, $validStatuses, true)) {
      throw ValidationException::create()
        ->withError('target_status', __('Select a valid order status.', 'mailpoet-premium'));
    }
  }

  private function getAuthorizationMessage(): string {
    return __('The user who last saved this automation is not allowed to change order statuses.', 'mailpoet-premium');
  }

  private function normalizeStatus(string $status): string {
    if (strpos($status, 'wc-') === 0) {
      return substr($status, 3);
    }
    return $status;
  }
}
