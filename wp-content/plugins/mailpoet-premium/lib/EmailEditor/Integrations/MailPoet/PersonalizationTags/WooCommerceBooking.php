<?php declare(strict_types = 1);

namespace MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags;

if (!defined('ABSPATH')) exit;


use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingPayload;

class WooCommerceBooking {
  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getId(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    return $booking ? (string)$booking->get_id() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getCreated(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    $dateCreated = $booking->get_date_created();
    return $this->formatDate($dateCreated);
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getModified(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    $dateModified = $booking->get_date_modified();
    return $this->formatDate($dateModified);
  }

  /**
   * Format a date value that can be either a timestamp (int) or WC_DateTime object.
   *
   * @param \WC_DateTime|\DateTimeInterface|int|null $date The date value
   * @return string Formatted date string or empty string
   */
  private function formatDate($date): string {
    if (!$date) {
      return '';
    }

    $format = $this->getDateTimeFormat();

    // Handle integer timestamp
    if (is_int($date)) {
      return date_i18n($format, $date);
    }

    // Handle WC_DateTime or similar object with date_i18n method
    if (is_object($date) && method_exists($date, 'date_i18n')) {
      return $date->date_i18n($format);
    }

    // Handle DateTime objects
    if ($date instanceof \DateTimeInterface) {
      return date_i18n($format, $date->getTimestamp());
    }

    return '';
  }

  private function getDateTimeFormat(): string {
    $dateFormat = get_option('date_format');
    $timeFormat = get_option('time_format');
    return (is_string($dateFormat) ? $dateFormat : '') . ' ' . (is_string($timeFormat) ? $timeFormat : '');
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getStatus(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    return $booking ? (string)$booking->get_status() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getPersonsCount(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    $persons = $booking->get_persons();
    return is_array($persons) ? (string)array_sum($persons) : (string)$persons;
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getStartDate(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    $start = $booking->get_start();
    return $start ? date_i18n($this->getDateTimeFormat(), $start) : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getEndDate(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    $end = $booking->get_end();
    return $end ? date_i18n($this->getDateTimeFormat(), $end) : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getProductName(array $context, array $args = []): string {
    $payload = $this->getPayload($context);
    if (!$payload) {
      return '';
    }
    $product = $payload->getProduct();
    return $product ? $product->get_name() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   * @return string
   */
  public function getAllDay(array $context, array $args = []): string {
    $booking = $this->getBooking($context);
    if (!$booking) {
      return '';
    }
    return $booking->get_all_day() ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium');
  }

  /**
   * @param array<string, mixed> $context
   * @return \WC_Booking|null
   */
  private function getBooking(array $context): ?\WC_Booking {
    $payload = $this->getPayload($context);
    return $payload ? $payload->getBooking() : null;
  }

  /**
   * @param array<string, mixed> $context
   * @return WooCommerceBookingPayload|null
   */
  private function getPayload(array $context): ?WooCommerceBookingPayload {
    $payload = $context['woocommerce-bookings:booking'] ?? null;
    if (!$payload instanceof WooCommerceBookingPayload) {
      return null;
    }
    return $payload;
  }
}
