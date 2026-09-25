<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\Automation\Integrations\WordPress\Subjects\UserSubject;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Payloads\UserRoleChangePayload;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\UserRoleChangeSubject;
use MailPoet\Subscribers\SubscribersRepository;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class UserRoleChangedTrigger implements Trigger {

  /** @var WordPress */
  private $wp;

  /** @var SubscribersRepository */
  private $subscribersRepository;

  public static $roleChangeEvent = [];

  public function __construct(
    WordPress $wp,
    SubscribersRepository $subscribersRepository
  ) {
    $this->wp = $wp;
    $this->subscribersRepository = $subscribersRepository;
  }

  public function getKey(): string {
    return 'mailpoet:user-role-changed';
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('WordPress user role changed', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'old_roles_include' => Builder::string()->required()->default('any'),
      'new_roles_include' => Builder::string()->required()->default('any'),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      UserSubject::KEY,
      UserRoleChangeSubject::KEY,
      SubscriberSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
  }

  public function registerHooks(): void {
    $this->wp->addAction('set_user_role', [$this, 'handleSetUserRole'], 10, 3);
    $this->wp->addAction('add_user_role', [$this, 'handleAddUserRole'], 10, 2);
    $this->wp->addAction('remove_user_role', [$this, 'handleRemoveUserRole'], 10, 2);

    // When setting user role, it also fires all three hooks right after each other.
    // To prevent triggering multiple times, we only take the last event.
    // https://github.com/WordPress/wordpress-develop/blob/c726220a21d13fdb5409372b652c9460c59ce1db/src/wp-includes/class-wp-user.php#L633-L657
    $this->wp->addAction('shutdown', [$this, 'handleRoleChange'], 10, 0);
  }

  /**
   * @param int $userId
   * @param string $newRole
   * @param string[] $oldRoles
   */
  public function handleSetUserRole($userId, $newRole, $oldRoles): void {
    $user = $this->getEligibleUser($userId);
    if (!$user) {
      return;
    }

    $oldRoles = !empty($oldRoles) ? $oldRoles : [];
    $newRoles = $newRole ? [$newRole] : [];

    self::$roleChangeEvent[$userId] = [
      'old_roles' => $oldRoles,
      'new_roles' => $newRoles,
    ];
  }

  /**
   * @param int $userId
   * @param string $newRole
   */
  public function handleAddUserRole($userId, $newRole): void {
    $user = $this->getEligibleUser($userId);
    if (!$user) {
      return;
    }

    $userRoles = empty($user->roles) ? [] : $user->roles;
    $oldRoles = array_diff($userRoles, [$newRole]);
    $newRoles = $userRoles;

    self::$roleChangeEvent[$userId] = [
      'old_roles' => $oldRoles,
      'new_roles' => $newRoles,
    ];
  }

  /**
   * @param int $userId
   * @param string $oldRole
   */
  public function handleRemoveUserRole($userId, $oldRole): void {
    $user = $this->getEligibleUser($userId);
    if (!$user) {
      return;
    }

    $userRoles = empty($user->roles) ? [] : $user->roles;
    $oldRoles = array_merge($userRoles, [$oldRole]);
    $newRoles = $userRoles;

    self::$roleChangeEvent[$userId] = [
      'old_roles' => $oldRoles,
      'new_roles' => $newRoles,
    ];
  }

  /**
   * This method is called after all WordPress operations are complete.
   * It's used to trigger the automation.
   */
  public function handleRoleChange(): void {
    if (self::$roleChangeEvent === null) {
      return;
    }

    foreach (self::$roleChangeEvent as $userId => $event) {
      $oldRoles = $event['old_roles'] ?? null;
      $newRoles = $event['new_roles'] ?? null;
      if ($userId === null || $oldRoles === null || $newRoles === null) {
        continue;
      }

      $subjects = [
        new Subject(UserRoleChangeSubject::KEY, ['old_roles' => $oldRoles, 'new_roles' => $newRoles]),
        new Subject(UserSubject::KEY, ['user_id' => (int)$userId]),
      ];

      $subscriber = $this->subscribersRepository->findOneBy(['wpUserId' => (int)$userId]);
      if ($subscriber) {
        $subjects[] = new Subject(SubscriberSubject::KEY, ['subscriber_id' => $subscriber->getId()]);
      }

      $this->wp->doAction(Hooks::TRIGGER, $this, $subjects);
    }
  }

  /**
   * Get user if eligible for role change automation. Skip users
   * created in the last 5 seconds to avoid triggering on user creation.
   *
   * @param int $userId
   * @return \WP_User|null
   */
  private function getEligibleUser(int $userId): ?\WP_User {
    $user = $this->wp->getUserBy('id', $userId);
    if (!$user) {
      return null;
    }

    $userCreatedAt = (int)strtotime($user->user_registered); // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    $currentTime = (int)$this->wp->currentTime('timestamp', true);
    $timeDifference = $currentTime - $userCreatedAt;

    if ($timeDifference < 5) {
      return null;
    }

    return $user;
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    /** @var UserRoleChangePayload $payload */
    $payload = $args->getSinglePayloadByClass(UserRoleChangePayload::class);
    $triggerArgs = $args->getStep()->getArgs();
    $oldRolesInclude = (string)($triggerArgs['old_roles_include'] ?? 'any');
    $newRolesInclude = (string)($triggerArgs['new_roles_include'] ?? 'any');

    // Check old roles setting
    if ($oldRolesInclude !== 'any') {
      // Skip if the old role doesn't match
      if (!in_array($oldRolesInclude, $payload->getOldRoles())) {
        return false;
      }
      // Skip if the old role is still present in new roles.
      if (in_array($oldRolesInclude, $payload->getNewRoles())) {
        return false;
      }
    }

    // Check new roles setting
    if ($newRolesInclude !== 'any') {
      // Skip if the new role doesn't match
      if (!in_array($newRolesInclude, $payload->getNewRoles())) {
        return false;
      }
      // Skip if the new role was already present in old roles.
      if (in_array($newRolesInclude, $payload->getOldRoles())) {
        return false;
      }
    }

    return true;
  }
}
