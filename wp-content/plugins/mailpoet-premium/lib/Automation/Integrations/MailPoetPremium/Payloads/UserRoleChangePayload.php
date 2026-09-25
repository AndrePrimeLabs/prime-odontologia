<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;

class UserRoleChangePayload implements Payload {

  /** @var array<string> */
  private $oldRoles;

  /** @var array<string> */
  private $newRoles;

  /**
   * @param array<string> $oldRoles
   * @param array<string> $newRoles
   */
  public function __construct(
    array $oldRoles,
    array $newRoles
  ) {
    $this->oldRoles = $oldRoles;
    $this->newRoles = $newRoles;
  }

  /**
   * @return array<string>
   */
  public function getOldRoles(): array {
    return $this->oldRoles;
  }

  /**
   * @return array<string>
   */
  public function getNewRoles(): array {
    return $this->newRoles;
  }
}
