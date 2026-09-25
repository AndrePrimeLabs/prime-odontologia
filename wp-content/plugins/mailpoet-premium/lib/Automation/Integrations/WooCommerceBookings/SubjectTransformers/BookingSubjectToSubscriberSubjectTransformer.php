<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\SubjectTransformers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Integration\SubjectTransformer;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject;
use MailPoet\Segments;
use MailPoet\Subscribers\SubscribersRepository;
use MailPoet\WooCommerce\WooCommerceBookings\Helper as WCBookingsHelper;

class BookingSubjectToSubscriberSubjectTransformer implements SubjectTransformer {

  private SubscribersRepository $subscribersRepository;
  private Segments\WooCommerce $woocommerce;
  private WooCommerce $woocommerceHelper;
  private WCBookingsHelper $bookingsHelper;

  public function __construct(
    SubscribersRepository $subscribersRepository,
    Segments\WooCommerce $woocommerce,
    WooCommerce $woocommerceHelper,
    WCBookingsHelper $bookingsHelper
  ) {
    $this->subscribersRepository = $subscribersRepository;
    $this->woocommerce = $woocommerce;
    $this->woocommerceHelper = $woocommerceHelper;
    $this->bookingsHelper = $bookingsHelper;
  }

  public function transform(Subject $data): ?Subject {
    if ($this->accepts() !== $data->getKey()) {
      return null;
    }

    $subscriber = $this->findOrCreateSubscriber($data);
    if (!$subscriber instanceof SubscriberEntity) {
      return null;
    }

    return new Subject(SubscriberSubject::KEY, ['subscriber_id' => $subscriber->getId()]);
  }

  public function accepts(): string {
    return WooCommerceBookingSubject::KEY;
  }

  public function returns(): string {
    return SubscriberSubject::KEY;
  }

  private function findOrCreateSubscriber(Subject $bookingSubject): ?SubscriberEntity {
    $args = $bookingSubject->getArgs();
    $bookingId = $args['booking_id'] ?? null;
    $orderId = $args['order_id'] ?? null;

    if (!$bookingId) {
      return null;
    }

    // If order_id is passed in args, try to find/create subscriber from order
    if ($orderId) {
      $subscriber = $this->findOrCreateSubscriberFromOrder($orderId);
      if ($subscriber) {
        return $subscriber;
      }
    }

    // Load the booking to get more info
    $booking = $this->bookingsHelper->getBooking($bookingId);
    if (!$booking instanceof \WC_Booking) {
      return null;
    }

    // Try to get subscriber from associated order if not already tried
    if (!$orderId) {
      $order = $booking->get_order();
      if ($order instanceof \WC_Order) {
        $subscriber = $this->findOrCreateSubscriberFromOrder($order->get_id());
        if ($subscriber) {
          return $subscriber;
        }
      }
    }

    // Fallback to customer_id → wp_user_id lookup (for bookings without orders)
    $customerId = $booking->get_customer_id();
    if ($customerId) {
      return $this->subscribersRepository->findOneBy(['wpUserId' => $customerId]);
    }

    return null;
  }

  private function findOrCreateSubscriberFromOrder(int $orderId): ?SubscriberEntity {
    $wcOrder = $this->woocommerceHelper->wcGetOrder($orderId);
    if (!$wcOrder instanceof \WC_Order) {
      return null;
    }

    $billingEmail = $wcOrder->get_billing_email();

    // First try to find existing subscriber by billing email
    if ($billingEmail) {
      $subscriber = $this->subscribersRepository->findOneBy(['email' => $billingEmail]);
      if ($subscriber) {
        return $subscriber;
      }
    }

    // If no subscriber found, synchronize guest customer to create one
    $this->woocommerce->synchronizeGuestCustomer($orderId);

    // Try to find subscriber again after synchronization
    if ($billingEmail) {
      return $this->subscribersRepository->findOneBy(['email' => $billingEmail]);
    }

    // Fallback to user ID lookup if order has a user
    $userId = $wcOrder->get_user_id();
    if ($userId) {
      return $this->subscribersRepository->findOneBy(['wpUserId' => $userId]);
    }

    return null;
  }
}
