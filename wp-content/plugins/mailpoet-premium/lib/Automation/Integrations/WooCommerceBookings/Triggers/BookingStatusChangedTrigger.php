<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\CustomerSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingStatusChangePayload;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingStatusChangeSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;
use MailPoet\WP\Functions;

class BookingStatusChangedTrigger implements Trigger {

  public const KEY = 'woocommerce-bookings:booking-status-changed';

  protected Functions $wp;

  public function __construct(
    Functions $wp
  ) {
    $this->wp = $wp;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Booking status changed', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'from' => Builder::string()->required()->default('any'),
      'to' => Builder::string()->required()->default('any'),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceBookingSubject::KEY,
      WooCommerceBookingStatusChangeSubject::KEY,
      CustomerSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
  }

  public function registerHooks(): void {
    $this->wp->addAction(
      'woocommerce_booking_status_changed',
      [
        $this,
        'handle',
      ],
      10,
      4
    );
  }

  public function handle(string $oldStatus, string $newStatus, int $bookingId, \WC_Booking $booking): void {
    // Build booking subject args, including order_id if available for guest customer handling
    $order = $booking->get_order();
    $bookingArgs = ['booking_id' => $bookingId];
    if ($order instanceof \WC_Order) {
      $bookingArgs['order_id'] = $order->get_id();
    }

    $subjects = [
      new Subject(WooCommerceBookingStatusChangeSubject::KEY, ['from' => $oldStatus, 'to' => $newStatus]),
      new Subject(WooCommerceBookingSubject::KEY, $bookingArgs),
    ];
    
    $customerId = $booking->get_customer_id();
    if ($customerId) {
      $subjects[] = new Subject(CustomerSubject::KEY, ['customer_id' => $customerId]);
    }

    $this->wp->doAction(Hooks::TRIGGER, $this, $subjects);
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    /** @var WooCommerceBookingStatusChangePayload $bookingPayload */
    $bookingPayload = $args->getSinglePayloadByClass(WooCommerceBookingStatusChangePayload::class);
    $triggerArgs = $args->getStep()->getArgs();
    $configuredFrom = $triggerArgs['from'] ?? null;
    $configuredTo = $triggerArgs['to'] ?? null;
    if ($configuredFrom !== 'any' && $bookingPayload->getFrom() !== $configuredFrom) {
      return false;
    }
    if ($configuredTo !== 'any' && $bookingPayload->getTo() !== $configuredTo) {
      return false;
    }
    return true;
  }
}
