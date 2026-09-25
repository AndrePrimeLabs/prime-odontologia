<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings;

if (!defined('ABSPATH')) exit;


class WooCommerceBookingProvider implements BookingProviderInterface {
  public function getBooking(int $id): ?\WC_Booking {
    if (!function_exists('get_wc_booking')) {
      return null;
    }
    $booking = get_wc_booking($id);
    return $booking instanceof \WC_Booking ? $booking : null;
  }
}
