<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings;

if (!defined('ABSPATH')) exit;


interface BookingProviderInterface {
  public function getBooking(int $id): ?\WC_Booking;
}
