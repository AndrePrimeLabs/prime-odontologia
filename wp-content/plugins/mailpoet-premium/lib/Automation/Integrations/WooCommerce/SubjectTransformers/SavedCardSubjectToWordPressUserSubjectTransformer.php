<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\SubjectTransformers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Integration\SubjectTransformer;
use MailPoet\Automation\Integrations\WordPress\Subjects\UserSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\SavedCardSubject;

class SavedCardSubjectToWordPressUserSubjectTransformer implements SubjectTransformer {
  public function accepts(): string {
    return SavedCardSubject::KEY;
  }

  public function returns(): string {
    return UserSubject::KEY;
  }

  public function transform(Subject $data): ?Subject {
    if ($this->accepts() !== $data->getKey()) {
      return null;
    }

    $userId = (int)($data->getArgs()['user_id'] ?? 0);
    if ($userId < 1) {
      return null;
    }

    return new Subject(UserSubject::KEY, ['user_id' => $userId]);
  }
}
