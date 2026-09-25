<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;

class CustomDataPayload implements Payload {

  /** @var string */
  private $hook;

  /** @var scalar[] */
  private $data;

  /** @var int */
  private $depth;

  /**
   * @param scalar[] $data
   */
  public function __construct(
    string $hook,
    array $data,
    int $depth = 0
  ) {
    $this->hook = $hook;
    $this->data = $data;
    $this->depth = $depth;
  }

  /**
   * @return scalar[]
   */
  public function getData(): array {
    return $this->data;
  }

  public function getHook(): string {
    return $this->hook;
  }

  public function getDepth(): int {
    return $this->depth;
  }
}
