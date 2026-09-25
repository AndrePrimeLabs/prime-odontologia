<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;

class CustomerWinBackPayload implements Payload {
  /** @var int */
  private $customerId;

  /** @var int */
  private $intervalBucket;

  public function __construct(
    int $customerId,
    int $intervalBucket
  ) {
    $this->customerId = $customerId;
    $this->intervalBucket = $intervalBucket;
  }

  public function getCustomerId(): int {
    return $this->customerId;
  }

  public function getIntervalBucket(): int {
    return $this->intervalBucket;
  }
}
