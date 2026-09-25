<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\CustomerSubject;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\BookingProviderInterface;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;
use MailPoet\WP\Functions;

class BookingCreatedTrigger implements Trigger {

  public const KEY = 'woocommerce-bookings:booking-created';
  private const META_KEY_TRIGGERED = '_mailpoet_booking_created_triggered';

  protected Functions $wp;
  protected WooCommerce $woocommerce;
  protected BookingProviderInterface $bookingProvider;

  public function __construct(
    Functions $wp,
    WooCommerce $woocommerceHelper,
    BookingProviderInterface $bookingProvider
  ) {
    $this->wp = $wp;
    $this->woocommerce = $woocommerceHelper;
    $this->bookingProvider = $bookingProvider;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Booking Created', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([]);
  }

  public function getSubjectKeys(): array {
    return [
      WooCommerceBookingSubject::KEY,
      CustomerSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
  }

  public function registerHooks(): void {
    $this->wp->addAction(
      'woocommerce_new_booking',
      [
        $this,
        'handle',
      ],
      10,
      1
    );

    $this->wp->addAction(
      'woocommerce_booking_status_changed',
      [
        $this,
        'handleBookingStatusChanged',
      ],
      10,
      3
    );
  }

  public function handleBookingStatusChanged(string $oldStatus, string $newStatus, int $bookingId): void {
    // Only consider the booking to be "created" if it transitions from "draft" to a "non-draft" status
    if ($this->isDraftStatus($oldStatus) && !$this->isDraftStatus($newStatus)) {
      $booking = $this->bookingProvider->getBooking($bookingId);
      if (!$booking instanceof \WC_Booking) {
        return;
      }
      $this->triggerBookingCreated($booking);
    }
  }

  public function handle(int $bookingId): void {
    $booking = $this->bookingProvider->getBooking($bookingId);
    if (!$booking instanceof \WC_Booking) {
      return;
    }

    // Skip draft bookings as they are not confirmed bookings yet
    if ($this->isDraftStatus($booking->get_status())) {
      return;
    }

    $this->triggerBookingCreated($booking);
  }

  private function isDraftStatus(string $status): bool {
    return in_array($status, ['in-cart', 'was-in-cart'], true);
  }

  private function triggerBookingCreated(\WC_Booking $booking): void {
    // Prevent duplicate triggers using booking meta
    if ($booking->get_meta(self::META_KEY_TRIGGERED)) {
      return;
    }

    // Get customer ID from booking or associated order
    $customerId = $booking->get_customer_id();
    $order = $booking->get_order();
    if (!$customerId && ($order instanceof \WC_Order)) {
      $customerId = $order->get_customer_id();
    }

    // Mark this booking as triggered to prevent duplicates
    $booking->update_meta_data(self::META_KEY_TRIGGERED, true);
    $booking->save();

    // Build booking subject args, including order_id if available for guest customer handling
    $bookingArgs = ['booking_id' => $booking->get_id()];
    if ($order instanceof \WC_Order) {
      $bookingArgs['order_id'] = $order->get_id();
    }

    $subjects = [
      new Subject(WooCommerceBookingSubject::KEY, $bookingArgs),
    ];
    
    if ($customerId) {
      $subjects[] = new Subject(CustomerSubject::KEY, ['customer_id' => $customerId]);
    }

    $this->wp->doAction(Hooks::TRIGGER, $this, $subjects);
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    // This trigger doesn't have any conditional arguments, so it always triggers
    return true;
  }
}
