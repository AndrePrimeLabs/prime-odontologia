<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Integration\Payload;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingStatusChangePayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

/**
 * @implements Subject<WooCommerceBookingStatusChangePayload>
 */
class WooCommerceBookingStatusChangeSubject implements Subject {

  const KEY = 'woocommerce-bookings:booking-status-changed';

  public function getName(): string {
    // translators: automation trigger title
    return __('WooCommerce Booking status changed', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'from' => Builder::string()->required(),
      'to' => Builder::string()->required(),
    ]);
  }

  public function getPayload(SubjectData $subjectData): Payload {
    $from = $subjectData->getArgs()['from'];
    $to = $subjectData->getArgs()['to'];

    return new WooCommerceBookingStatusChangePayload($from, $to);
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getFields(): array {
    return [];
  }
}
