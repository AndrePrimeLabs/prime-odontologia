<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Premium\Automation\Engine\AutomationAuthorization;
use MailPoet\WooCommerce\WooCommerceSubscriptions\Helper as WCS;

abstract class AbstractSubscriptionAction {
  protected const STATUS_ACTIVE = 'active';
  protected const STATUS_ON_HOLD = 'on-hold';
  protected const STATUS_PENDING_CANCEL = 'pending-cancel';
  protected const STATUS_CANCELLED = 'cancelled';
  protected const STATUS_EXPIRED = 'expired';

  private const TARGET_STATUSES = [
    self::STATUS_ACTIVE,
    self::STATUS_ON_HOLD,
    self::STATUS_PENDING_CANCEL,
    self::STATUS_CANCELLED,
    self::STATUS_EXPIRED,
  ];

  /** @var WCS */
  protected $wcs;

  /** @var WooCommerce */
  protected $woocommerce;

  /** @var AutomationAuthorization */
  protected $authorization;

  public function __construct(
    WCS $wcs,
    WooCommerce $woocommerce,
    AutomationAuthorization $authorization
  ) {
    $this->wcs = $wcs;
    $this->woocommerce = $woocommerce;
    $this->authorization = $authorization;
  }

  protected function authorizeSave(Automation $automation): void {
    $this->authorization->authorizeSave($automation, [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
  }

  protected function authorizeRun(Automation $automation): void {
    $this->authorization->authorizeRun($automation, [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
  }

  private function getAuthorizationMessage(): string {
    return __('The user who last saved this automation is not allowed to manage WooCommerce subscriptions.', 'mailpoet-premium');
  }

  protected function validateWooCommerceSubscriptionsActive(): void {
    if (!$this->wcs->isWooCommerceSubscriptionsActive()) {
      throw ValidationException::create()
        ->withError('woocommerce-subscriptions', __('WooCommerce Subscriptions is required for this action.', 'mailpoet-premium'));
    }
  }

  protected function validateTargetStatus(string $targetStatus): void {
    $this->validateWooCommerceSubscriptionsActive();
    if (!in_array($targetStatus, self::TARGET_STATUSES, true)) {
      throw ValidationException::create()
        ->withError('target_status', __('Select a valid subscription status.', 'mailpoet-premium'));
    }

    $statuses = array_map([$this, 'normalizeStatus'], array_keys($this->wcs->wcsGetSubscriptionStatuses()));
    if ($statuses && !in_array($targetStatus, $statuses, true)) {
      throw ValidationException::create()
        ->withError('target_status', __('Select a valid subscription status.', 'mailpoet-premium'));
    }
  }

  protected function validateQuantity(int $quantity, string $field): void {
    if ($quantity < 1) {
      throw ValidationException::create()
        ->withError($field, __('Enter a quantity of at least 1.', 'mailpoet-premium'));
    }
  }

  /**
   * @param mixed $lineTotal
   */
  protected function validateLineTotal($lineTotal, string $field): void {
    if ($lineTotal === null) {
      return;
    }
    if (!is_int($lineTotal) && !is_float($lineTotal)) {
      throw ValidationException::create()
        ->withError($field, __('Enter a valid line total.', 'mailpoet-premium'));
    }
    if ((float)$lineTotal < 0) {
      throw ValidationException::create()
        ->withError($field, __('Enter a line total of at least 0.', 'mailpoet-premium'));
    }
  }

  protected function resolveProduct(int $productId, ?int $variationId, string $productField): \WC_Product {
    if ($productId < 1) {
      throw ValidationException::create()
        ->withError($productField, __('Select a valid product.', 'mailpoet-premium'));
    }

    $product = $this->woocommerce->wcGetProduct($variationId ?: $productId);
    if (!$product instanceof \WC_Product) {
      throw ValidationException::create()
        ->withError($productField, __('Select a valid product.', 'mailpoet-premium'));
    }

    if ($variationId) {
      if (!$product instanceof \WC_Product_Variation || $product->get_parent_id() !== $productId) {
        throw ValidationException::create()
          ->withError($productField, __('Select a valid product variation.', 'mailpoet-premium'));
      }
      return $product;
    }

    if ($product instanceof \WC_Product_Variation) {
      throw ValidationException::create()
        ->withError($productField, __('Select a valid product.', 'mailpoet-premium'));
    }

    return $product;
  }

  protected function findLineItem(\WC_Subscription $subscription, int $productId, ?int $variationId): ?\WC_Order_Item_Product {
    foreach ($subscription->get_items('line_item') as $item) {
      if (!$item instanceof \WC_Order_Item_Product) {
        continue;
      }
      if ((int)$item->get_product_id() !== $productId) {
        continue;
      }
      if ($variationId && (int)$item->get_variation_id() !== $variationId) {
        continue;
      }
      return $item;
    }
    return null;
  }

  protected function calculateAndSave(\WC_Subscription $subscription): void {
    try {
      $subscription->calculate_totals();
      $subscription->save();
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __('Subscription could not be saved.', 'mailpoet-premium')
      );
    }
  }

  protected function runtimeWooCommerceSubscriptionsActive(): void {
    if (!$this->wcs->isWooCommerceSubscriptionsActive()) {
      throw RuntimeException::create()->withMessage(
        __('WooCommerce Subscriptions is required for this action.', 'mailpoet-premium')
      );
    }
  }

  private function normalizeStatus(string $status): string {
    if (strpos($status, 'wc-') === 0) {
      return substr($status, 3);
    }
    return $status;
  }
}
