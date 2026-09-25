<?php declare(strict_types = 1);

namespace MailPoet\Premium\EmailEditor\Integrations\MailPoet;

if (!defined('ABSPATH')) exit;


use Automattic\WooCommerce\EmailEditor\Email_Editor_Container;
use Automattic\WooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use Automattic\WooCommerce\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use MailPoet\EmailEditor\Integrations\MailPoet\EmailEditor;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Payloads\WooCommerceBookingPayload;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Payloads\WooCommerceSubscriptionPayload;
use MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags\WooCommerceBooking;
use MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags\WooCommerceSubscription;
use MailPoet\WooCommerce\NonPersistablePreviewData;
use MailPoet\WP\Functions as WPFunctions;

class PersonalizationTagManager {
  private WooCommerceSubscription $wooCommerceSubscription;
  private WooCommerceBooking $wooCommerceBooking;
  private WPFunctions $wp;

  public function __construct(
    WooCommerceSubscription $wooCommerceSubscription,
    WooCommerceBooking $wooCommerceBooking,
    WPFunctions $wp
  ) {
    $this->wooCommerceSubscription = $wooCommerceSubscription;
    $this->wooCommerceBooking = $wooCommerceBooking;
    $this->wp = $wp;
  }

  public function initialize() {
    $this->wp->addFilter('mailpoet_automation_email_personalization_context', [$this, 'addPersonalizationContext'], 10, 2);
    $this->wp->addFilter('mailpoet_automation_email_extend_personalization_tags', [$this, 'registerPersonalizationTagsForAutomation'], 10, 2);

    // Hook to extend tags during sending (not just editor loading)
    $this->wp->addAction('mailpoet_automation_email_extend_personalization_tags_for_sending', [$this, 'extendTagsForSending'], 10, 1);

    // Hook to add dummy data for browser preview
    $this->wp->addFilter('woocommerce_email_editor_send_preview_email_personalizer_context', [$this, 'addDummyDataForPreview']);

    // Hook to add dummy data for send preview email in MailPoet
    $this->wp->addFilter('mailpoet_automation_email_preview_sample_data', [$this, 'addDummyDataForPreview']);

    // Hook to add category-to-subjects mapping for filtering personalization tags
    $this->wp->addFilter('mailpoet_personalization_tags_category_subjects_mapping', [$this, 'addCategorySubjectsMapping']);
  }

  /**
   * Add premium category-to-subjects mapping for personalization tag filtering.
   * This allows Subscription and Booking tags to be filtered based on available automation subjects.
   *
   * @param array<string, string[]> $mapping Existing category to subjects mapping
   * @return array<string, string[]> Extended mapping with premium categories
   */
  public function addCategorySubjectsMapping(array $mapping): array {
    // Add Subscription category - requires subscription subject
    $mapping['Subscription'] = ['woocommerce-subscriptions:subscription'];

    // Add Booking category - requires booking subject
    $mapping['Booking'] = ['woocommerce-bookings:booking'];

    return $mapping;
  }

  /**
   * Add subscription and booking data to the personalization context.
   *
   * This receives subjects either from metadata (old approach) or from AutomationRun (new approach).
   * Both formats use the same array structure: ['key' => string, 'args' => array]
   *
   * @param array<string, mixed> $context
   * @param array<string, mixed> $subjects Array of subjects with 'key' and 'args'
   * @return array<string, mixed>
   */
  public function addPersonalizationContext(array $context, array $subjects): array {
    $context = $this->addSubscriptionContext($context, $subjects);
    $context = $this->addBookingContext($context, $subjects);

    return $context;
  }

  /**
   * Add subscription to the personalization context.
   *
   * @param array<string, mixed> $context
   * @param array<string, mixed> $subjects
   * @return array<string, mixed>
   */
  private function addSubscriptionContext(array $context, array $subjects): array {
    if (!function_exists('wcs_get_subscription')) {
      return $context;
    }

    $subscriptionSubject = $subjects['woocommerce-subscriptions:subscription'] ?? null;
    if (!is_array($subscriptionSubject)) {
      return $context;
    }

    $args = $subscriptionSubject['args'] ?? null;
    if (!is_array($args)) {
      return $context;
    }

    $subscriptionId = $args['subscription_id'] ?? null;
    if (!is_numeric($subscriptionId)) {
      return $context;
    }

    $subscription = wcs_get_subscription((int)$subscriptionId);
    if ($subscription instanceof \WC_Subscription) {
      $context['woocommerce-subscriptions:subscription'] = new WooCommerceSubscriptionPayload($subscription);
    }

    return $context;
  }

  /**
   * Add booking to the personalization context.
   *
   * @param array<string, mixed> $context
   * @param array<string, mixed> $subjects
   * @return array<string, mixed>
   */
  private function addBookingContext(array $context, array $subjects): array {
    if (!function_exists('get_wc_booking')) {
      return $context;
    }

    $bookingSubject = $subjects['woocommerce-bookings:booking'] ?? null;
    if (!is_array($bookingSubject)) {
      return $context;
    }

    $args = $bookingSubject['args'] ?? null;
    if (!is_array($args)) {
      return $context;
    }

    $bookingId = $args['booking_id'] ?? null;
    if (!is_numeric($bookingId)) {
      return $context;
    }

    $booking = get_wc_booking((int)$bookingId);
    if ($booking instanceof \WC_Booking) {
      $context['woocommerce-bookings:booking'] = new WooCommerceBookingPayload($booking);
    }

    return $context;
  }

  /**
   * Extend WooCommerce personalization tags during email sending.
   * This registers subscription/booking tags at send time based on available subjects.
   *
   * @param string[] $availableSubjects Available subject keys from automation run
   * @return void
   */
  public function extendTagsForSending(array $availableSubjects): void {
    if (!class_exists(Email_Editor_Container::class)) {
      return;
    }

    try {
      // Get the WooCommerce personalization tags registry
      $registry = Email_Editor_Container::container()->get(Personalization_Tags_Registry::class);
    } catch (\Exception $e) {
      // Container not available or registry not found
      return;
    }

    // Register subscription tags if available
    if (in_array('woocommerce-subscriptions:subscription', $availableSubjects, true)) {
      $this->registerSubscriptionTags($registry);
    }

    // Register booking tags if available
    if (in_array('woocommerce-bookings:booking', $availableSubjects, true)) {
      $this->registerBookingTags($registry);
    }
  }

  /**
   * Register WooCommerce Subscription and Booking personalization tags when automation has the required subjects.
   *
   * @param Personalization_Tags_Registry $registry
   * @param string[] $availableSubjects Available subject keys for this automation
   * @return Personalization_Tags_Registry
   */
  public function registerPersonalizationTagsForAutomation(Personalization_Tags_Registry $registry, array $availableSubjects): Personalization_Tags_Registry {
    if (in_array('woocommerce-subscriptions:subscription', $availableSubjects, true)) {
      $this->registerSubscriptionTags($registry);
    }

    if (in_array('woocommerce-bookings:booking', $availableSubjects, true)) {
      $this->registerBookingTags($registry);
    }

    return $registry;
  }

  /**
   * Register subscription personalization tags.
   *
   * @param Personalization_Tags_Registry $registry
   * @return void
   */
  private function registerSubscriptionTags(Personalization_Tags_Registry $registry): void {

    $categoryName = __('Subscription', 'mailpoet-premium');

    // Register subscription personalization tags
    $registry->register(new Personalization_Tag(
      __('Subscription ID', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-id',
      $categoryName,
      [$this->wooCommerceSubscription, 'getId'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Created', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-created',
      $categoryName,
      [$this->wooCommerceSubscription, 'getCreated'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Modified Date', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-modified',
      $categoryName,
      [$this->wooCommerceSubscription, 'getModified'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Title', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-title',
      $categoryName,
      [$this->wooCommerceSubscription, 'getTitle'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Status', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-status',
      $categoryName,
      [$this->wooCommerceSubscription, 'getStatus'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Failed Payment Count', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-failed-payment-count',
      $categoryName,
      [$this->wooCommerceSubscription, 'getFailedPaymentCount'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Payment Count', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-payment-count',
      $categoryName,
      [$this->wooCommerceSubscription, 'getPaymentCount'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Total Initial Payment', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-total-initial-payment',
      $categoryName,
      [$this->wooCommerceSubscription, 'getTotalInitialPayment'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Billing Period', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-billing-period',
      $categoryName,
      [$this->wooCommerceSubscription, 'getBillingPeriod'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Billing Interval', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-billing-interval',
      $categoryName,
      [$this->wooCommerceSubscription, 'getBillingInterval'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Requires Manual Renewal', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-is-manual',
      $categoryName,
      [$this->wooCommerceSubscription, 'getIsManual'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Cancel Email Sent', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-cancel-email-sent',
      $categoryName,
      [$this->wooCommerceSubscription, 'getCancelEmailSent'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Subscription Is in Trial Period', 'mailpoet-premium'),
      'mailpoet/woocommerce-subscription-is-trial',
      $categoryName,
      [$this->wooCommerceSubscription, 'getIsTrial'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
  }

  /**
   * Register booking personalization tags.
   *
   * @param Personalization_Tags_Registry $registry
   * @return void
   */
  private function registerBookingTags(Personalization_Tags_Registry $registry): void {
    $categoryName = __('Booking', 'mailpoet-premium');

    // Register booking personalization tags
    $registry->register(new Personalization_Tag(
      __('Booking ID', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-id',
      $categoryName,
      [$this->wooCommerceBooking, 'getId'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Created', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-created',
      $categoryName,
      [$this->wooCommerceBooking, 'getCreated'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Modified Date', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-modified',
      $categoryName,
      [$this->wooCommerceBooking, 'getModified'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Status', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-status',
      $categoryName,
      [$this->wooCommerceBooking, 'getStatus'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Persons Count', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-persons-count',
      $categoryName,
      [$this->wooCommerceBooking, 'getPersonsCount'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Start Date', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-start-date',
      $categoryName,
      [$this->wooCommerceBooking, 'getStartDate'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking End Date', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-end-date',
      $categoryName,
      [$this->wooCommerceBooking, 'getEndDate'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking Product Name', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-product-name',
      $categoryName,
      [$this->wooCommerceBooking, 'getProductName'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
    $registry->register(new Personalization_Tag(
      __('Booking All Day', 'mailpoet-premium'),
      'mailpoet/woocommerce-booking-all-day',
      $categoryName,
      [$this->wooCommerceBooking, 'getAllDay'],
      [],
      null,
      [EmailEditor::MAILPOET_EMAIL_POST_TYPE],
      Personalization_Tag::VALUE_TYPE_TEXT
    ));
  }

  /**
   * Add dummy subscription and booking data for preview emails.
   *
   * @param array<string, mixed> $context
   * @return array<string, mixed>
   */
  public function addDummyDataForPreview(array $context): array {
    $context = $this->addDummySubscriptionForPreview($context);
    $context = $this->addDummyBookingForPreview($context);
    return $context;
  }

  /**
   * Add dummy subscription data for preview emails.
   *
   * @param array<string, mixed> $context
   * @return array<string, mixed>
   */
  private function addDummySubscriptionForPreview(array $context): array {
    if (!function_exists('wcs_create_subscription')) {
      return $context;
    }

    try {
      // Create a dummy subscription using WooCommerce Subscriptions
      $subscription = new class extends \WC_Subscription {
        use NonPersistablePreviewData;
      };
      // Set a dummy ID for preview (not saved to database)
      $subscription->set_id(12345);
      $subscription->set_status('active');

      // Set dates for created and modified tags
      $subscription->set_date_created(time() - (30 * DAY_IN_SECONDS)); // 30 days ago
      $subscription->set_date_modified(time() - DAY_IN_SECONDS); // 1 day ago

      // Set billing properties
      $subscription->set_billing_period('month');
      $subscription->set_billing_interval(1);
      $subscription->set_total('29.99');

      // Set boolean flags
      $subscription->set_requires_manual_renewal(false); // Automatic renewal
      $subscription->set_cancelled_email_sent('no'); // Cancel email not sent
      // Set trial end date (0 means no trial)
      $subscription->update_dates(['trial_end' => 0]);

      // Add a line item
      $item = new \WC_Order_Item_Product();
      $item->set_name('Sample Subscription Product');
      $item->set_quantity(1);
      $item->set_subtotal('29.99');
      $item->set_total('29.99');
      $subscription->add_item($item);

      // Set billing address
      $subscription->set_billing_first_name('John');
      $subscription->set_billing_last_name('Doe');
      $subscription->set_billing_company('Sample Company');
      $subscription->set_billing_address_1('123 Sample Street');
      $subscription->set_billing_city('Sample City');
      $subscription->set_billing_state('CA');
      $subscription->set_billing_postcode('12345');
      $subscription->set_billing_country('US');
      $subscription->set_billing_email('john.doe@example.com');
      $subscription->set_billing_phone('555-1234');

      $context['woocommerce-subscriptions:subscription'] = new WooCommerceSubscriptionPayload($subscription);
    } catch (\Exception $e) {
      // If creation fails, skip and log for debugging
      if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('MailPoet: Failed to create dummy subscription for preview: ' . $e->getMessage()); // phpcs:ignore Squiz.PHP.DiscouragedFunctions
      }
    }

    return $context;
  }

  /**
   * Add dummy booking data for preview emails.
   *
   * @param array<string, mixed> $context
   * @return array<string, mixed>
   */
  private function addDummyBookingForPreview(array $context): array {
    if (!class_exists(\WC_Booking::class)) {
      return $context;
    }

    try {
      // Create a dummy booking using WooCommerce Bookings
      $booking = new class extends \WC_Booking {
        use NonPersistablePreviewData;
      };
      // Set a dummy ID for preview (not saved to database)
      $booking->set_id(54321);
      $booking->set_status('confirmed');
      $booking->set_start(strtotime('+3 days'));
      $booking->set_end(strtotime('+4 days'));
      $booking->set_all_day(false);
      // Set dates for created and modified tags
      $booking->set_date_created(time() - (7 * DAY_IN_SECONDS)); // 7 days ago
      $booking->set_date_modified(time() - DAY_IN_SECONDS); // 1 day ago

      // Set persons count if the method exists.
      /** @phpstan-ignore-next-line function.alreadyNarrowedType -- WC Bookings stub is optimistic about minimum version that ships set_persons(). */
      if (method_exists($booking, 'set_persons')) {
        $booking->set_persons(2);
      }

      // Create the payload
      $payload = new WooCommerceBookingPayload($booking);

      // Set a product for preview (required since get_product() loads from database)
      if (class_exists(\WC_Product_Booking::class)) {
        $product = new class extends \WC_Product_Booking {
          use NonPersistablePreviewData;
        };
        $product->set_id(99999);
        $product->set_name('Sample Booking Product');
        $payload->setPreviewProduct($product);
      }

      $context['woocommerce-bookings:booking'] = $payload;
    } catch (\Exception $e) {
      // If creation fails, skip and log for debugging
      if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('MailPoet: Failed to create dummy booking for preview: ' . $e->getMessage()); // phpcs:ignore Squiz.PHP.DiscouragedFunctions
      }
    }

    return $context;
  }
}
