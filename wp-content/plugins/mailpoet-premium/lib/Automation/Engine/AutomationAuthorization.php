<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Engine;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Engine;
use MailPoet\Automation\Engine\Exceptions\InvalidStateException;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\WP\Functions as WPFunctions;
use WP_User;

/**
 * Records which user vouched for an automation's steps and re-checks that user's
 * capabilities before privileged actions run. Automation actions execute from
 * cron with application authority, so without this the capability gate is only
 * "can manage automations", which editors hold by default.
 *
 * A capability is either a capability name or an array whose first element is
 * a meta capability name followed by its arguments, e.g. ['promote_user', $userId].
 *
 * @phpstan-type Capability string|array{0: string, 1?: mixed, 2?: mixed}
 */
class AutomationAuthorization {
  public const AUTHORIZED_BY_META = 'mailpoet-premium:authorized-by';
  public const CAPABILITY_MANAGE_WOOCOMMERCE = 'manage_woocommerce';

  /** @var AutomationStorage */
  private $storage;

  /** @var WPFunctions */
  private $wp;

  public function __construct(
    AutomationStorage $storage,
    WPFunctions $wp
  ) {
    $this->storage = $storage;
    $this->wp = $wp;
  }

  /**
   * The current user becomes the authorizing user when the automation is new, its
   * steps change, it gets activated, or the previously recorded user no longer
   * exists. Otherwise the previously recorded user is kept. Whatever the request
   * body carried in the meta is always overwritten, so it cannot be used to
   * impersonate another user. When there is no current user (WP-CLI, cron), a
   * changed automation gets no record and falls back to its author.
   */
  public function recordAuthorizingUser(Automation $automation): void {
    $previous = $this->getPersistedAutomation($automation);
    $currentUserId = (int)$this->wp->getCurrentUserId();
    $previousUserId = $previous ? $this->getRecordedUserId($previous) : null;

    $needsNewRecord = $previous === null
      || $this->stepsChanged($previous, $automation)
      || $this->activated($previous, $automation)
      || $this->getAuthorizingUser($previous) === null;
    $userId = $needsNewRecord ? ($currentUserId > 0 ? $currentUserId : null) : $previousUserId;

    if ($userId === null) {
      $automation->deleteMeta(self::AUTHORIZED_BY_META);
      return;
    }
    $automation->setMeta(self::AUTHORIZED_BY_META, $userId);
  }

  public function getAuthorizingUser(Automation $automation): ?WP_User {
    $userId = $this->getRecordedUserId($automation);
    $user = $userId === null ? $automation->getAuthor() : $this->wp->getUserBy('id', $userId);
    return $user instanceof WP_User && $user->exists() ? $user : null;
  }

  /**
   * @param Capability[] $capabilities
   */
  public function isAuthorized(Automation $automation, array $capabilities = []): bool {
    $user = $this->getAuthorizingUser($automation);
    if ($user === null) {
      return false;
    }
    array_unshift($capabilities, Engine::CAPABILITY_MANAGE_AUTOMATIONS);
    foreach ($capabilities as $capability) {
      $args = is_array($capability) ? $capability : [$capability];
      if (!$user->has_cap(...$args)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param Capability[] $capabilities
   */
  public function authorizeSave(Automation $automation, array $capabilities, string $message): void {
    if (!$this->isAuthorized($automation, $capabilities)) {
      throw ValidationException::create()->withMessage($message)->withError('general', $message);
    }
  }

  /**
   * @param Capability[] $capabilities
   */
  public function authorizeRun(Automation $automation, array $capabilities, string $message): void {
    if (!$this->isAuthorized($automation, $capabilities)) {
      throw RuntimeException::create()->withMessage($message);
    }
  }

  private function getRecordedUserId(Automation $automation): ?int {
    $userId = $automation->getMeta(self::AUTHORIZED_BY_META);
    return is_numeric($userId) ? (int)$userId : null;
  }

  private function getPersistedAutomation(Automation $automation): ?Automation {
    try {
      $id = $automation->getId();
    } catch (InvalidStateException $e) {
      return null;
    }
    return $this->storage->getAutomation($id);
  }

  private function stepsChanged(Automation $previous, Automation $automation): bool {
    return $this->getStepsData($previous) !== $this->getStepsData($automation);
  }

  /** @return array<string|int, array<string, mixed>> */
  private function getStepsData(Automation $automation): array {
    return array_map(function (Step $step): array {
      return $step->toArray();
    }, $automation->getSteps());
  }

  private function activated(Automation $previous, Automation $automation): bool {
    return $automation->getStatus() === Automation::STATUS_ACTIVE && $previous->getStatus() !== Automation::STATUS_ACTIVE;
  }
}
