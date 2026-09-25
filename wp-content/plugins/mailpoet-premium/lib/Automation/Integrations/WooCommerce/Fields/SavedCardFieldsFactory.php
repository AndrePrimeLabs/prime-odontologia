<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Fields;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads\SavedCardPayload;

class SavedCardFieldsFactory {
  /** @return Field[] */
  public function getFields(): array {
    return [
      new Field(
        'woocommerce:saved-card:card-type',
        Field::TYPE_STRING,
        // translators: automation field title
        __('Card type', 'mailpoet-premium'),
        function (SavedCardPayload $payload) {
          return $payload->getCardType();
        }
      ),
      new Field(
        'woocommerce:saved-card:last4',
        Field::TYPE_STRING,
        // translators: automation field title
        __('Last 4 digits', 'mailpoet-premium'),
        function (SavedCardPayload $payload) {
          return $payload->getLast4();
        }
      ),
      new Field(
        'woocommerce:saved-card:expiry-month',
        Field::TYPE_STRING,
        // translators: automation field title
        __('Expiry month', 'mailpoet-premium'),
        function (SavedCardPayload $payload) {
          return $payload->getExpiryMonth();
        }
      ),
      new Field(
        'woocommerce:saved-card:expiry-year',
        Field::TYPE_STRING,
        // translators: automation field title
        __('Expiry year', 'mailpoet-premium'),
        function (SavedCardPayload $payload) {
          return $payload->getExpiryYear();
        }
      ),
      new Field(
        'woocommerce:saved-card:expires-on',
        Field::TYPE_DATETIME,
        // translators: automation field title
        __('Expires on', 'mailpoet-premium'),
        function (SavedCardPayload $payload) {
          return $payload->getExpiresOn();
        }
      ),
    ];
  }
}
