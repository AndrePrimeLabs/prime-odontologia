<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

if (!defined('ABSPATH')) exit;


/*
 * Plugin Name: MailPoet Premium
 * Requires Plugins: mailpoet
 * Version: 5.39.0
 * Plugin URI: https://www.mailpoet.com
 * Description: This plugin adds Premium features to the free version of MailPoet and unlocks the subscribers limit. Enjoy!
 * Author: MailPoet
 * Author URI: https://www.mailpoet.com
 * Update URI: https://www.mailpoet.com
 * Requires at least: 7.0
 *
 * Text Domain: mailpoet-premium
 * Domain Path: /lang/
 *
 * @package WordPress
 * @author MailPoet
 * @since 3.0.0
 */

$mailpoetPremium = [
  'version' => '5.39.0',
  'filename' => __FILE__,
  'path' => dirname(__FILE__),
  'autoloader' => dirname(__FILE__) . '/vendor/autoload.php',
  'initializer' => dirname(__FILE__) . '/mailpoet_initializer.php',
];

require_once(ABSPATH . 'wp-admin/includes/plugin.php');

// Display PHP version error notice
function mailpoet_premium_php_version_notice() {
  $noticeP1 = sprintf(
    // translators: %1$s is the plugin name (MailPoet or MailPoet Premium), %2$s, %3$s, and %4$s are PHP version (e.g. "8.1.30")
    __('%1$s requires PHP version %2$s or newer (%3$s recommended). You are running version %4$s.', 'mailpoet-premium'),
    'MailPoet Premium',
    '7.4',
    '8.1',
    phpversion()
  );

  $noticeP2 = __('Please read our [link]instructions[/link] on how to upgrade your site.', 'mailpoet-premium');
  $noticeP2 = str_replace(
    '[link]',
    '<a href="https://kb.mailpoet.com/article/251-upgrading-the-websites-php-version" target="_blank">',
    $noticeP2
  );
  $noticeP2 = str_replace('[/link]', '</a>', $noticeP2);

  $allowedTags = [
    'a' => [
      'href' => true,
      'target' => true,
    ],
  ];
  printf(
    '<div class="error"><p><strong>%s</strong></p><p>%s</p></div>',
    esc_html($noticeP1),
    wp_kses(
      $noticeP2,
      $allowedTags
    )
  );
}

// Display missing core dependencies error notice
function mailpoet_premium_core_dependency_notice() {
  $notice = __('MailPoet Premium cannot start because it is missing core files. Please reinstall the plugin.', 'mailpoet-premium');
  printf(
    '<div class="notice notice-error"><p>%1$s</p></div>',
    esc_html($notice)
  );
}

function mailpoet_premium_check_base_requirements($mailpoetPremium) {
  // Check for minimum supported PHP version
  if (version_compare(phpversion(), '7.4.0', '<')) {
    add_action('admin_notices', 'mailpoet_premium_php_version_notice');
    return false;
  }

  // Check for presence of core dependencies
  if (!file_exists($mailpoetPremium['autoloader']) || !file_exists($mailpoetPremium['initializer'])) {
    add_action('admin_notices', 'mailpoet_premium_core_dependency_notice');
    return false;
  }

  return true;
}

// Initialize plugin
if (mailpoet_premium_check_base_requirements($mailpoetPremium)) {
  require_once($mailpoetPremium['initializer']);
}
