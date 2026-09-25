<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Fields;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Payloads\WooCommerceSubscriptionPayload;
use MailPoet\WooCommerce\WooCommerceSubscriptions\Helper as WCS;

class SubscriptionFields {

  /** @var WCS */
  private $wcs;

  public function __construct(
    WCS $wcs
  ) {
    $this->wcs = $wcs;
  }

  /**
   * @return Field[]
   */
  public function getFields(): array {
    return [
      new Field(
        'woocommerce-subscriptions:subscription:id',
        Field::TYPE_INTEGER,
        __('Woo Subscription ID', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_id();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:created',
        Field::TYPE_DATETIME,
        __('Woo Subscription created', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_date_created();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:modified',
        Field::TYPE_DATETIME,
        __('Woo Subscription modified date', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_date_modified();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:title',
        Field::TYPE_STRING,
        __('Woo Subscription title', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_title();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:status',
        Field::TYPE_ENUM,
        __('Woo Subscription status', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_status();
        },
        [
          'options' => $this->getSubscriptionStatuses(),
        ]
      ),
      new Field(
        'woocommerce-subscriptions:subscription:failed-payment-count',
        Field::TYPE_INTEGER,
        __('Woo Subscription number of failed payments', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_failed_payment_count();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:payment-count',
        Field::TYPE_INTEGER,
        __('Woo Subscription number of payments', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_payment_count();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:total-initial-payment',
        Field::TYPE_NUMBER,
        __('The total amount charged at the outset of the Subscription', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_total_initial_payment();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:billing-period',
        Field::TYPE_ENUM,
        __('Woo Subscription billing period', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_billing_period();
        },
        [
          'options' => $this->getBillingPeriods(),
        ]
      ),
      new Field(
        'woocommerce-subscriptions:subscription:billing-interval',
        Field::TYPE_INTEGER,
        __('Woo Subscription billing interval', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_billing_interval();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:is-manual',
        Field::TYPE_BOOLEAN,
        __('Woo Subscription requires manual renewal payments', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->is_manual();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:cancel-email-sent',
        Field::TYPE_BOOLEAN,
        __('Woo Subscription cancel email sent', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          return $payload->getSubscription()->get_cancelled_email_sent();
        }
      ),
      new Field(
        'woocommerce-subscriptions:subscription:is-trial',
        Field::TYPE_BOOLEAN,
        __('Woo Subscription is in trial period', 'mailpoet-premium'),
        function(WooCommerceSubscriptionPayload $payload) {
          $trialEndDate = $payload->getSubscription()->get_date('trial_end');
          if ($trialEndDate === 0) {
            return false;
          };
          return (new \DateTime())->format('Y-m-d H:i:s') < $trialEndDate;
        }
      ),
    ];
  }

  /**
   * @return array<int, array<string, string>>
   */
  private function getBillingPeriods(): array {
    $periods = $this->wcs->wcsGetBillingPeriodStrings();
    return array_map(
      function($name, $id) {
        return [
          'name' => $name,
          'id' => $id,
        ];
      },
      $periods,
      array_keys($periods)
    );
  }

  /**
   * @return array<int, array<string, string>>
   */
  private function getSubscriptionStatuses(): array {
    $statuses = $this->wcs->wcsGetSubscriptionStatuses();
    return array_map(
      function($name, $id) {
        return [
          'name' => $name,
          // WooCommerce subscription statuses are internally saved with 'wc-' prefix:
          // https://github.com/Automattic/woocommerce-subscriptions-core/blob/03797c7/wcs-functions.php#L216-L229
          // However, when getting the status from the subscription object, it doesn't have the prefix.
          // To make the status codes consistent, we remove the prefix here and only work with unprefixed statuses.
          'id' => substr($id, 0, 3) === 'wc-' ? substr($id, 3) : $id,
        ];
      },
      $statuses,
      array_keys($statuses)
    );
  }
}
