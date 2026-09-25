<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Fields;

if (!defined('ABSPATH')) exit;


use DateTime;
use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingPayload;
use MailPoet\WooCommerce\WooCommerceBookings\Helper as WCBookingsHelper;

class BookingFields {

  private WCBookingsHelper $wcBookings;
  private WordPress $wp;

  public function __construct(
    WCBookingsHelper $wcBooking,
    WordPress $wp
  ) {
    $this->wcBookings = $wcBooking;
    $this->wp = $wp;
  }

  /**
   * @return Field[]
   */
  public function getFields(): array {
    return [
      new Field(
        'woocommerce-bookings:booking:id',
        Field::TYPE_INTEGER,
        __('Woo Booking ID', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_id();
        }
      ),
      new Field(
        'woocommerce-bookings:booking:created',
        Field::TYPE_DATETIME,
        __('Woo Booking created', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_date_created();
        }
      ),
      new Field(
        'woocommerce-bookings:booking:modified',
        Field::TYPE_DATETIME,
        __('Woo Booking modified date', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_date_modified();
        }
      ),
      new Field(
        'woocommerce-bookings:booking:status',
        Field::TYPE_ENUM,
        __('Woo Booking status', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_status();
        },
        [
          'options' => $this->wcBookings->getBookingStatuses(),
        ]
      ),
      new Field(
        'woocommerce-bookings:customer:booking-count',
        Field::TYPE_INTEGER,
        __('Woo Booking customer booking count', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload, array $params = []) {
          $booking = $payload->getBooking();
          $customerId = (int)$booking->get_customer_id();
          $inTheLastSeconds = isset($params['in_the_last']) ? (int)$params['in_the_last'] : null;
          if ($customerId <= 0 || $inTheLastSeconds === null) {
            return 0;
          }
          return $this->wcBookings->countRecentCustomerBookings($customerId, $inTheLastSeconds, (int)$booking->get_id());
        },
        [
          'params' => ['in_the_last'],
        ]
      ),
      new Field(
        'woocommerce-bookings:booking:persons',
        Field::TYPE_NUMBER,
        __('Woo Booking persons count', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_persons();
        }
      ),
      new Field(
        'woocommerce-bookings:booking:all-day',
        Field::TYPE_BOOLEAN,
        __('Woo Booking all day', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_all_day();
        }
      ),
      new Field(
        'woocommerce-bookings:booking:start',
        Field::TYPE_DATETIME,
        __('Woo Booking start', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          $timestamp = $payload->getBooking()->get_start();
          return $timestamp ? new DateTime('@' . $timestamp) : null;
        }
      ),
      new Field(
        'woocommerce-bookings:booking:end',
        Field::TYPE_DATETIME,
        __('Woo Booking end', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          $timestamp = $payload->getBooking()->get_end();
          return $timestamp ? new DateTime('@' . $timestamp) : null;
        }
      ),
      new Field(
        'woocommerce-bookings:booking:product',
        Field::TYPE_ENUM,
        __('Woo Booking product', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          return $payload->getBooking()->get_product_id();
        },
        [
          'options' => $this->getBookableProducts(),
        ]
      ),
      new Field(
        'woocommerce-bookings:booking:product-categories',
        Field::TYPE_ENUM_ARRAY,
        __('Woo Booking product categories', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          $productId = $payload->getBooking()->get_product_id();
          if (!$productId) {
            return [];
          }
          $terms = $this->wp->wpGetPostTerms($productId, 'product_cat');
          if (!is_array($terms)) {
            return [];
          }
          /** @var \WP_Term[] $terms */
          // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return array_map(fn($term) => $term->term_id, $terms);
        },
        [
          'options' => $this->getTermOptions('product_cat'),
        ]
      ),
      new Field(
        'woocommerce-bookings:booking:product-tags',
        Field::TYPE_ENUM_ARRAY,
        __('Woo Booking product tags', 'mailpoet-premium'),
        function(WooCommerceBookingPayload $payload) {
          $productId = $payload->getBooking()->get_product_id();
          if (!$productId) {
            return [];
          }
          $terms = $this->wp->wpGetPostTerms($productId, 'product_tag');
          if (!is_array($terms)) {
            return [];
          }
          /** @var \WP_Term[] $terms */
          // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return array_map(fn($term) => $term->term_id, $terms);
        },
        [
          'options' => $this->getTermOptions('product_tag'),
        ]
      ),
    ];
  }

  /**
   * @return array<int, array{id: int, name: string}>
   */
  private function getBookableProducts(): array {
    /** @var \WP_Post[] $posts */
    $posts = $this->wp->getPosts([
      'post_type' => 'product',
      'post_status' => 'publish',
      'posts_per_page' => 200, // phpcs:ignore WordPress.WP.PostsPerPage.posts_per_page_posts_per_page -- bookable products are a limited set
      'tax_query' => [
        [
          'taxonomy' => 'product_type',
          'field' => 'slug',
          'terms' => 'booking',
        ],
      ],
    ]);
    // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    return array_map(fn($post) => ['id' => $post->ID, 'name' => $post->post_title], $posts);
  }

  /**
   * @return array<int, array{id: int, name: string}>
   */
  private function getTermOptions(string $taxonomy): array {
    $terms = $this->wp->getTerms([
      'taxonomy' => $taxonomy,
      'hide_empty' => false,
    ]);
    if (!is_array($terms)) {
      return [];
    }
    /** @var \WP_Term[] $terms */
    // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    return array_map(fn($term) => ['id' => $term->term_id, 'name' => $term->name], $terms);
  }
}
