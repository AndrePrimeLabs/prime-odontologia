<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Payloads\WooCommerceSubscriptionPayload;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Subjects\WooCommerceSubscriptionSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class UpdateProductOnSubscriptionAction extends AbstractSubscriptionAction implements Action {
  public const KEY = 'woocommerce-subscriptions:update-product-on-subscription';

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Update product on subscription', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'product_id' => Builder::integer()->required()->minimum(1),
      'variation_id' => Builder::integer()->nullable(),
      'new_quantity' => Builder::integer()->nullable(),
      'new_line_total' => Builder::number()->nullable(),
      'new_product_id' => Builder::integer()->nullable(),
      'new_variation_id' => Builder::integer()->nullable(),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceSubscriptionSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $this->validateWooCommerceSubscriptionsActive();
    $this->validateStepArgs($args->getStep()->getArgs());
    $this->authorizeSave($args->getAutomation());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorizeRun($args->getAutomation());
    $this->runtimeWooCommerceSubscriptionsActive();
    $stepArgs = $args->getStep()->getArgs();
    $this->validateStepArgs($stepArgs);

    $productId = $this->getIntArg($stepArgs, 'product_id');
    $variationId = $this->normalizeOptionalId($stepArgs['variation_id'] ?? null);
    $subscription = $args->getSinglePayloadByClass(WooCommerceSubscriptionPayload::class)->getSubscription();
    $item = $this->findLineItem($subscription, $productId, $variationId);
    if (!$item) {
      throw RuntimeException::create()->withMessage(
        __('Product could not be found on the subscription.', 'mailpoet-premium')
      );
    }

    $replacementProductId = $this->normalizeOptionalId($stepArgs['new_product_id'] ?? null);
    if ($replacementProductId) {
      $replacementProduct = $this->resolveProduct(
        $replacementProductId,
        $this->normalizeOptionalId($stepArgs['new_variation_id'] ?? null),
        'new_product_id'
      );
      $item->set_product($replacementProduct);
    }

    if (array_key_exists('new_quantity', $stepArgs) && $stepArgs['new_quantity'] !== null) {
      $item->set_quantity((int)$stepArgs['new_quantity']);
    }
    if (array_key_exists('new_line_total', $stepArgs) && $stepArgs['new_line_total'] !== null) {
      $lineTotal = (string)$stepArgs['new_line_total'];
      $item->set_subtotal($lineTotal);
      $item->set_total($lineTotal);
    }

    try {
      $item->save();
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __('Subscription product could not be updated.', 'mailpoet-premium')
      );
    }
    $this->calculateAndSave($subscription);
  }

  public function onDuplicate(Step $step): Step {
    return $step;
  }

  /**
   * @param array<string, mixed> $stepArgs
   */
  private function validateStepArgs(array $stepArgs): void {
    $productId = $this->getIntArg($stepArgs, 'product_id');
    $variationId = $this->normalizeOptionalId($stepArgs['variation_id'] ?? null);
    $this->resolveProduct($productId, $variationId, 'product_id');

    $hasQuantity = array_key_exists('new_quantity', $stepArgs) && $stepArgs['new_quantity'] !== null;
    $hasLineTotal = array_key_exists('new_line_total', $stepArgs) && $stepArgs['new_line_total'] !== null;
    $replacementProductId = $this->normalizeOptionalId($stepArgs['new_product_id'] ?? null);
    $replacementVariationId = $this->normalizeOptionalId($stepArgs['new_variation_id'] ?? null);
    if ($replacementVariationId && !$replacementProductId) {
      throw ValidationException::create()
        ->withError('new_product_id', __('Select a product before selecting a variation.', 'mailpoet-premium'));
    }

    if (!$hasQuantity && !$hasLineTotal && !$replacementProductId) {
      throw ValidationException::create()
        ->withError('updates', __('Select at least one subscription product update.', 'mailpoet-premium'));
    }

    if ($hasQuantity) {
      $this->validateQuantity($this->getIntArg($stepArgs, 'new_quantity'), 'new_quantity');
    }
    $this->validateLineTotal($stepArgs['new_line_total'] ?? null, 'new_line_total');
    if ($replacementProductId) {
      $this->resolveProduct($replacementProductId, $replacementVariationId, 'new_product_id');
    }
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
