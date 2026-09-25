<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Exceptions\NotFoundException;
use MailPoet\Automation\Engine\Integration\Payload;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Fields\BookingFields;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingPayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;
use MailPoet\WooCommerce\WooCommerceBookings\Helper as WCBookingsHelper;

/**
 * @implements Subject<WooCommerceBookingPayload>
 */
class WooCommerceBookingSubject implements Subject {

  public const KEY = 'woocommerce-bookings:booking';

  private WCBookingsHelper $booking;
  private BookingFields $bookingFields;

  public function __construct(
    WCBookingsHelper $booking,
    BookingFields $bookingFields
  ) {
    $this->booking = $booking;
    $this->bookingFields = $bookingFields;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation subject (entity entering automation) title
    return __('WooCommerce Booking', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'booking_id' => Builder::integer()->required(),
      'order_id' => Builder::integer(),
    ]);
  }

  public function getFields(): array {
    return $this->bookingFields->getFields();
  }

  public function getPayload(SubjectData $subjectData): Payload {
    $id = $subjectData->getArgs()['booking_id'];

    $booking = $this->booking->getBooking($id);
    if (!$booking instanceof \WC_Booking) {
      // translators: %d is the booking ID.
      throw NotFoundException::create()->withMessage(sprintf(__("WooCommerce Booking with ID '%d' not found.", 'mailpoet-premium'), $id));
    }
    return new WooCommerceBookingPayload($booking);
  }
}
