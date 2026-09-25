<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Engine;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\API\API;
use MailPoet\Automation\Engine\Hooks as AutomationHooks;
use MailPoet\Premium\Automation\Engine\Endpoints\Automations\AutomationsPostEndpoint;
use MailPoet\Premium\Automation\Engine\Endpoints\Automations\AutomationsPutEndpoint;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\MailPoetPremiumIntegration;
use MailPoet\Premium\Automation\Integrations\WooCommerce\WooCommerceIntegration;
use MailPoet\Premium\Automation\Integrations\WooCommerceBookings\WooCommerceBookingsIntegration;
use MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\WooCommerceSubscriptionsIntegration;
use MailPoet\Premium\Automation\Integrations\WordPress\WordPressIntegration;
use MailPoet\WP\Functions as WPFunctions;

class Engine {
  /** @var MailPoetPremiumIntegration */
  private $mailpoetPremiumIntegration;

  /** @var WordPressIntegration */
  private $wordPressIntegration;

  /** @var WooCommerceIntegration */
  private $wooCommerceIntegration;

  /** @var WooCommerceSubscriptionsIntegration */
  private $wooCommerceSubscriptionsIntegration;

  private WooCommerceBookingsIntegration $wooCommerceBookingsIntegration;

  /** @var AutomationAuthorization */
  private $authorization;

  /** @var WPFunctions */
  private $wp;

  public function __construct(
    MailPoetPremiumIntegration $mailpoetPremiumIntegration,
    WordPressIntegration $wordPressIntegration,
    WooCommerceIntegration $wooCommerceIntegration,
    WooCommerceSubscriptionsIntegration $wooCommerceSubscriptionsIntegration,
    WooCommerceBookingsIntegration $wooCommerceBookingsIntegration,
    AutomationAuthorization $authorization,
    WPFunctions $wp
  ) {
    $this->mailpoetPremiumIntegration = $mailpoetPremiumIntegration;
    $this->wordPressIntegration = $wordPressIntegration;
    $this->wooCommerceIntegration = $wooCommerceIntegration;
    $this->wooCommerceSubscriptionsIntegration = $wooCommerceSubscriptionsIntegration;
    $this->authorization = $authorization;
    $this->wp = $wp;
    $this->wooCommerceBookingsIntegration = $wooCommerceBookingsIntegration;
  }

  public function initialize(): void {
    $this->wp->addAction(
      AutomationHooks::API_INITIALIZE,
      [$this, 'registerPremiumAutomationAPIRoutes'],
      5 // register premium routes before the free ones to replace the same ones
    );

    $this->wp->addAction(AutomationHooks::AUTOMATION_BEFORE_SAVE, [$this->authorization, 'recordAuthorizingUser']);

    $this->wp->addAction(AutomationHooks::INITIALIZE, function($registry) {
      $this->mailpoetPremiumIntegration->register($registry);
      $this->wordPressIntegration->register($registry);
      $this->wooCommerceIntegration->register($registry);
      $this->wooCommerceSubscriptionsIntegration->register($registry);
      $this->wooCommerceBookingsIntegration->register($registry);
    });
  }

  public function registerPremiumAutomationAPIRoutes(API $api): void {
    $api->registerPostRoute('automations', AutomationsPostEndpoint::class);
    $api->registerPutRoute('automations/(?P<id>\d+)', AutomationsPutEndpoint::class);
  }
}
