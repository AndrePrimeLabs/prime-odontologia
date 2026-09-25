<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration\Payload;

class WooCommerceBookingPayload implements Payload {

  private \WC_Booking $booking;

  /** @var \WC_Product|null Optional product for preview (when booking isn't in database) */
  private ?\WC_Product $previewProduct = null;

  public function __construct(
    \WC_Booking $booking
  ) {
    $this->booking = $booking;
  }

  public function getId(): int {
    return $this->booking->get_id();
  }

  public function getBooking(): \WC_Booking {
    return $this->booking;
  }

  /**
   * Set a product for preview purposes.
   * Used when the booking isn't saved to database and get_product() would return null.
   */
  public function setPreviewProduct(\WC_Product $product): void {
    $this->previewProduct = $product;
  }

  /**
   * Get the product, preferring the preview product if set.
   *
   * @return \WC_Product|null
   */
  public function getProduct(): ?\WC_Product {
    if ($this->previewProduct !== null) {
      return $this->previewProduct;
    }

    // @phpstan-ignore-next-line - WC_Booking::get_product() not recognized by PHPStan
    return $this->booking->get_product() ?: null;
  }
}
