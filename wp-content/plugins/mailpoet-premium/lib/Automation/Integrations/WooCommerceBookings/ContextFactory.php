<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings;

if (!defined('ABSPATH')) exit;


use MailPoet\WooCommerce\WooCommerceBookings\Helper as WCBookingsHelper;

class ContextFactory {

  private WCBookingsHelper $wcBookings;

  public function __construct(
    WCBookingsHelper $wcBookings
  ) {
    $this->wcBookings = $wcBookings;
  }

  /**
   * @return mixed[]
   */
  public function getContextData(): array {
    if (!$this->wcBookings->isWooCommerceBookingsActive()) {
      return [];
    }
    return [
      'booking_statuses' => $this->getBookingStatuses(),
    ];
  }

  /**
   * @return array<int, array<string,string>>
   */
  private function getBookingStatuses(): array {
    $statuses = $this->wcBookings->getBookingStatuses();
    $result = array_map(
      function ($label, $value) {
        return [
          'label' => $label,
          'value' => $value,
        ];
      },
      $statuses,
      array_keys($statuses),
    );
    $labels = array_column($result, 'label');
    array_multisort($labels, SORT_ASC, $result);
    return $result;
  }
}
