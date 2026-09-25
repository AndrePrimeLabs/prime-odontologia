<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads\CustomerWinBackPayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

/**
 * @implements Subject<CustomerWinBackPayload>
 */
class CustomerWinBackSubject implements Subject {
  public const KEY = 'woocommerce:customer-win-back-data';

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation subject (entity entering automation) title
    return __('Customer win back data', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'customer_id' => Builder::integer()->required(),
      'interval_bucket' => Builder::integer()->required(),
    ]);
  }

  /** @return Field[] */
  public function getFields(): array {
    return [];
  }

  public function getPayload(SubjectData $subjectData): CustomerWinBackPayload {
    $args = $subjectData->getArgs();
    return new CustomerWinBackPayload(
      (int)$args['customer_id'],
      (int)$args['interval_bucket']
    );
  }
}
