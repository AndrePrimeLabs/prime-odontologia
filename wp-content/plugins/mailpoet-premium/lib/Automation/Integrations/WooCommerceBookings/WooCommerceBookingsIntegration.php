<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingStatusChangeSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\SubjectTransformers\BookingSubjectToSubscriberSubjectTransformer;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingCreatedTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStartsHooks;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStartsTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStatusChangedTrigger;

class WooCommerceBookingsIntegration implements Integration {

  private BookingCreatedTrigger $bookingCreated;
  private BookingStartsTrigger $bookingStarts;
  private BookingStartsHooks $bookingStartsHooks;
  private BookingStatusChangedTrigger $bookingStatusChanged;
  private ContextFactory $contextFactory;
  private WooCommerceBookingSubject $wooCommerceBookingSubject;
  private WooCommerceBookingStatusChangeSubject $wooCommerceBookingStatusChangeSubject;
  private BookingSubjectToSubscriberSubjectTransformer $bookingSubjectToSubscriberSubjectTransformer;

  public function __construct(
    ContextFactory $contextFactory,
    BookingCreatedTrigger $bookingCreated,
    BookingStartsTrigger $bookingStarts,
    BookingStartsHooks $bookingStartsHooks,
    BookingStatusChangedTrigger $bookingStatusChanged,
    WooCommerceBookingSubject $wooCommerceBookingSubject,
    WooCommerceBookingStatusChangeSubject $wooCommerceBookingStatusChangeSubject,
    BookingSubjectToSubscriberSubjectTransformer $bookingSubjectToSubscriberSubjectTransformer
  ) {
    $this->contextFactory = $contextFactory;
    $this->bookingCreated = $bookingCreated;
    $this->bookingStarts = $bookingStarts;
    $this->bookingStartsHooks = $bookingStartsHooks;
    $this->bookingStatusChanged = $bookingStatusChanged;
    $this->wooCommerceBookingSubject = $wooCommerceBookingSubject;
    $this->wooCommerceBookingStatusChangeSubject = $wooCommerceBookingStatusChangeSubject;
    $this->bookingSubjectToSubscriberSubjectTransformer = $bookingSubjectToSubscriberSubjectTransformer;
  }

  public function register(Registry $registry): void {
    $registry->addContextFactory('woocommerce-bookings', function () {
      return $this->contextFactory->getContextData();
    });

    $registry->addTrigger($this->bookingCreated);
    $registry->addTrigger($this->bookingStarts);
    $this->bookingStartsHooks->init();
    $registry->addTrigger($this->bookingStatusChanged);
    $registry->addSubject($this->wooCommerceBookingSubject);
    $registry->addSubject($this->wooCommerceBookingStatusChangeSubject);
    $registry->addSubjectTransformer($this->bookingSubjectToSubscriberSubjectTransformer);
  }
}
