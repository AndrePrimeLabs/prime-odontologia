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

class RemoveProductFromSubscriptionAction extends AbstractSubscriptionAction implements Action {
  public const KEY = 'woocommerce-subscriptions:remove-product-from-subscription';

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Remove product from subscription', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'product_id' => Builder::integer()->required()->minimum(1),
      'variation_id' => Builder::integer()->nullable(),
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
    $this->resolveProduct($this->getIntArg($stepArgs, 'product_id'), $this->normalizeOptionalId($stepArgs['variation_id'] ?? null), 'product_id');
    $this->authorizeSave($args->getAutomation());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorizeRun($args->getAutomation());
    $this->runtimeWooCommerceSubscriptionsActive();
    $stepArgs = $args->getStep()->getArgs();
    $productId = $this->getIntArg($stepArgs, 'product_id');
    $variationId = $this->normalizeOptionalId($stepArgs['variation_id'] ?? null);
    $this->resolveProduct($productId, $variationId, 'product_id');

    $subscription = $args->getSinglePayloadByClass(WooCommerceSubscriptionPayload::class)->getSubscription();
    $item = $this->findLineItem($subscription, $productId, $variationId);
    if (!$item) {
      return;
    }

    try {
      $subscription->remove_item($item->get_id());
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __('Product could not be removed from the subscription.', 'mailpoet-premium')
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
