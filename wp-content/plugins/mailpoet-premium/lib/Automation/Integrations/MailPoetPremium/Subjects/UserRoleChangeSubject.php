<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Integration\Payload;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Payloads\UserRoleChangePayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

/**
 * @implements Subject<UserRoleChangePayload>
 */
class UserRoleChangeSubject implements Subject {
  public const KEY = 'mailpoet:user-role-change';

  public function getName(): string {
    // translators: automation subject (entity entering automation) title
    return __('WordPress user role changes', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'old_roles' => Builder::array(Builder::string())->required(),
      'new_roles' => Builder::array(Builder::string())->required(),
    ]);
  }

  public function getPayload(SubjectData $subjectData): Payload {
    $oldRoles = $subjectData->getArgs()['old_roles'];
    $newRoles = $subjectData->getArgs()['new_roles'];

    return new UserRoleChangePayload($oldRoles, $newRoles);
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getFields(): array {
    return [];
  }
}
