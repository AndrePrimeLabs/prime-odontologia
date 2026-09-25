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

class AddProductToSubscriptionAction extends AbstractSubscriptionAction implements Action {
  public const KEY = 'woocommerce-subscriptions:add-product-to-subscription';

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Add product to subscription', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'product_id' => Builder::integer()->required()->minimum(1),
      'variation_id' => Builder::integer()->nullable(),
      'quantity' => Builder::integer()->required()->minimum(1)->default(1),
      'line_total' => Builder::number()->nullable(),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceSubscriptionSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $this->validateWooCommerceSubscriptionsActive();
    $stepArgs = $args->getStep()->getArgs();
    $this->validateQuantity((int)($stepArgs['quantity'] ?? 1), 'quantity');
    $this->validateLineTotal($stepArgs['line_total'] ?? null, 'line_total');
    $this->resolveProduct($this->getIntArg($stepArgs, 'product_id'), $this->normalizeOptionalId($stepArgs['variation_id'] ?? null), 'product_id');
    $this->authorizeSave($args->getAutomation());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorizeRun($args->getAutomation());
    $this->runtimeWooCommerceSubscriptionsActive();
    $stepArgs = $args->getStep()->getArgs();
    $quantity = (int)($stepArgs['quantity'] ?? 1);
    $lineTotal = $stepArgs['line_total'] ?? null;
    $variationId = $this->normalizeOptionalId($stepArgs['variation_id'] ?? null);
    $this->validateQuantity($quantity, 'quantity');
    $this->validateLineTotal($lineTotal, 'line_total');
    $product = $this->resolveProduct($this->getIntArg($stepArgs, 'product_id'), $variationId, 'product_id');

    $subscription = $args->getSinglePayloadByClass(WooCommerceSubscriptionPayload::class)->getSubscription();
    $itemArgs = [];
    if ($lineTotal !== null) {
      $itemArgs['subtotal'] = (float)$lineTotal;
      $itemArgs['total'] = (float)$lineTotal;
    }

    try {
      $subscription->add_product($product, $quantity, $itemArgs);
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __('Product could not be added to the subscription.', 'mailpoet-premium')
      );
    }
    $this->calculateAndSave($subscription);
  }

  public function onDuplicate(Step $step): Step {
    return $step;
  }

  /**
   * @param mixed $id
   */
  private function normalizeOptionalId($id): ?int {
    if (!is_int($id)) {
      return null;
    }
    return $id > 0 ? $id : null;
  }

  /**
   * @param array<string, mixed> $args
   */
  private function getIntArg(array $args, string $key): int {
    $value = $args[$key] ?? 0;
    return is_int($value) ? $value : 0;
  }
}
