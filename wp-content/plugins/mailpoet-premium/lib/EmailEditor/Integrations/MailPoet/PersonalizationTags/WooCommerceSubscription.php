<?php declare(strict_types = 1);

namespace MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags;

if (!defined('ABSPATH')) exit;


use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Payloads\WooCommerceSubscriptionPayload;

class WooCommerceSubscription {
  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getId(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? (string)$subscription->get_id() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getCreated(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }
    $dateCreated = $subscription->get_date_created();
    return $dateCreated ? $dateCreated->date_i18n($this->getDateTimeFormat()) : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getModified(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }
    $dateModified = $subscription->get_date_modified();
    return $dateModified ? $dateModified->date_i18n($this->getDateTimeFormat()) : '';
  }

  private function getDateTimeFormat(): string {
    $dateFormat = get_option('date_format');
    $timeFormat = get_option('time_format');
    return (is_string($dateFormat) ? $dateFormat : '') . ' ' . (is_string($timeFormat) ? $timeFormat : '');
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getTitle(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }

    return $subscription->get_title();
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getStatus(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? $subscription->get_status() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getBillingPeriod(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? $subscription->get_billing_period() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getBillingInterval(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? (string)$subscription->get_billing_interval() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getTotalInitialPayment(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? (string)$subscription->get_total_initial_payment() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getFailedPaymentCount(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? (string)$subscription->get_failed_payment_count() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getPaymentCount(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    return $subscription ? (string)$subscription->get_payment_count() : '';
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getIsManual(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }
    return $subscription->is_manual() ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium');
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getCancelEmailSent(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }
    if (!function_exists('wc_string_to_bool')) {
      return '';
    }
    return wc_string_to_bool($subscription->get_cancelled_email_sent()) ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium');
  }

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $args
   */
  public function getIsTrial(array $context, array $args = []): string {
    $subscription = $this->getSubscription($context);
    if (!$subscription) {
      return '';
    }
    // Returns 0 if no trial or a timestamp
    $trialEndTimestamp = $subscription->get_time('trial_end');
    if ($trialEndTimestamp === 0) {
      return __('No', 'mailpoet-premium');
    }

    $isTrial = time() < $trialEndTimestamp;
    return $isTrial ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium');
  }

  /**
   * @param array<string, mixed> $context
   */
  private function getSubscription(array $context): ?\WC_Subscription {
    $payload = $context['woocommerce-subscriptions:subscription'] ?? null;
    if (!$payload instanceof WooCommerceSubscriptionPayload) {
      return null;
    }
    return $payload->getSubscription();
  }
}
