<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;

class WooCommerceBookingStatusChangePayload implements Payload {

  private string $from;
  private string $to;

  public function __construct(
    string $from,
    string $to
  ) {
    $this->from = $from;
    $this->to = $to;
  }

  public function getFrom(): string {
    return $this->from;
  }

  public function getTo(): string {
    return $this->to;
  }
}
