<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;
use WC_Payment_Token_CC;

class SavedCardPayload implements Payload {
  private WC_Payment_Token_CC $token;

  public function __construct(
    WC_Payment_Token_CC $token
  ) {
    $this->token = $token;
  }

  public function getCardType(): string {
    return (string)$this->token->get_card_type();
  }

  public function getLast4(): string {
    return (string)$this->token->get_last4();
  }

  public function getExpiryMonth(): string {
    return (string)$this->token->get_expiry_month();
  }

  public function getExpiryYear(): string {
    return (string)$this->token->get_expiry_year();
  }

  public function getExpiresOn(): ?\DateTimeImmutable {
    $month = (int)$this->getExpiryMonth();
    $year = (int)$this->getExpiryYear();
    if ($month < 1 || $month > 12 || $year < 1) {
      return null;
    }
    $date = \DateTimeImmutable::createFromFormat('!Y-n-j', sprintf('%d-%d-1', $year, $month));
    return $date ? $date->modify('last day of this month') : null;
  }
}
