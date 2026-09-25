=== MailPoet - Premium ===
Contributors: mailpoet
Tags: newsletter, email, welcome email, post notification, autoresponder, mailchimp, signup, smtp
Requires at least: 7.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 5.39.0
Create and send beautiful emails and newsletters from WordPress.

== Description ==

Try the new MailPoet! This is a Premium version of our completely new email newsletter plugin.

= What's new? =

* New email designer
* Responsive templates
* Send with MailPoet Sending Service
* Fast user interface
* Easier initial configuration

= Check out this 2 minute video. =

[vimeo https://vimeo.com/183339372]

= Use at your own risk! =

Use [the current stable MailPoet](https://wordpress.org/plugins/wysija-newsletters/) instead of this version if you are not a power user.

* This alpha version is for testing purposes only!
* Not RTL compatible
* We expect bug reports from you!
* Multisite not supported
* No migration script from MailPoet 2.X to this version
* Weekly releases

= Premium version =

Not available yet. Limited stats in free version.

= Translations in your language =

We accept translations in the repository.

== Frequently Asked Questions ==

= Need help? =

Our [support site](https://kb.mailpoet.com/) has plenty of articles. You can write to us on the forums too.

== Screenshots ==

1. Sample newsletters.
2. The drag & drop editor.
3. Subscriber management.
4. Sending method configuration in Settings.
5. Importing subscribers with a CSV or from MailChimp.

== Changelog ==

= 5.39.0 - 2026-09-21 =
* Improved: Stability of automation triggers and actions;
* Fixed: Change user role automation action failing with an unknown error when the automation is saved or run.

= 5.38.0 - 2026-09-07 =
* Fixed: Subscription and booking personalization tags showing HTML-encoded characters in email subjects and plain-text emails.

= 5.37.0 - 2026-09-01 =
* Improved: Campaign and subscriber stats now show personalization tag names instead of raw tokens for tracked links.

= 5.36.0 - 2026-08-18 =
* Updated: Bump the minimum required WordPress version to 7.0 and tested up to version to 7.1;
* Improved: Quicker access to subscribers who clicked a specific link in campaign stats, with a new clicked link column and always-visible filters.

= 5.35.0 - 2026-08-03 =
* Improved: minor changes and fixes.

= 5.34.0 - 2026-07-13 =
* Added: Native filters and sorting on the campaign statistics tables (engagement, bounces, clicked links, products sold and unsubscribe reasons);
* Fixed: Show Create Segment when filtering campaign stats by a clicked link;
* Fixed: Match shortcode link labels when searching the campaign stats clicked-links table;
* Fixed: Apply date and subscriber-status filters to the engagement Status filter counts;
* Fixed: Restore searching unsubscribe reasons by their label in campaign stats;
* Fixed: Show the clicked-links stats table without relying on the legacy links argument;
* Fixed: Sync the engagement Status filter chips to the clicked status when filtering by a link;
* Fixed: Respect a single engagement status filter passed as a query string value;
* Fixed: Show the unsubscribe reason column whenever unsubscribed is among the selected engagement statuses.

= 5.33.0 - 2026-06-30 =
* Fixed: Birthday and saved-card-expires automations now keep running every hour instead of stopping after the first run, and previously stopped automations resume automatically.

= 5.32.0 - 2026-06-25 =
* Added: Native event-type and date filters with sorting on the subscriber activity feed.

= 5.31.0 - 2026-06-23 =
* Added: Subscription email content for automation templates;
* Added: Booking confirmation email content for automation templates;
* Added: Preview of an automation template's pre-built email content before starting to build;
* Improved: Linked the Birthday trigger empty state to the custom fields page.

= 5.30.0 - 2026-06-16 =
* Added: Email content for loyalty, win-back, and birthday automations;
* Added: Email content for win-back inactive customer automation;
* Added: Pre-built email content for review follow-up and reviewer reward automation templates;
* Added: Listing preferences for premium statistics tables;
* Improved: Improve WooCommerce order analytics with order attribution data;
* Improved: WooCommerce product stats now read from Woo order attribution data.

= 5.29.0 - 2026-06-09 =
* Added: Pre-built automation templates for customer win-back, review follow-up, review alerts, and unpaid order cancellation;
* Added: Email content for welcome series automation templates;
* Added: Email content for abandoned cart campaign automation;
* Fixed: Prevent the email preview from overwriting or reading from an existing subscriptions and bookings.

= 5.28.0 - 2026-05-25 =
* Updated: WordPress compatibility to version 7.0;
* Improved: WooCommerce review automation trigger support for review notifications;
* Improved: Improve campaign statistics list views.

= 5.27.0 - 2026-05-18 =
* Added: Customer's saved card expires automation trigger;
* Added: WooCommerce Order Paid automation trigger;
* Added: WordPress Change user role automation action;
* Added: WooCommerce order status and order note automation actions;
* Added: WooCommerce subscription product and status automation actions;
* Added: Customer win-back automation trigger for inactive WooCommerce customers;
* Added: Combine segment filter conditions into groups with mixed AND/OR logic;
* Fixed: Automation editor step deletion stability;
* Fixed: Date and time formatting regressions caused by respecting WordPress date settings.

= 5.26.0 - 2026-05-12 =
* Improved: It's now possible to select automation email links in the clicked-link automation trigger;
* Improved: Respect WordPress date format settings in MailPoet UIs.

= 5.25.0 - 2026-05-04 =
* Added: "None of the conditions" option for segments with multiple conditions;
* Added: Unsubscribe reason display in email and subscriber statistics.

= 5.24.0 - 2026-04-27 =
* Added: Export per-recipient email statistics as CSV or XLSX;
* Added: Bulk export statistics for multiple emails from the listing screen;
* Improved: Redesign the subscriber statistics page.

= 5.23.0 - 2026-04-06 =
* Added: Automation templates for WooCommerce Bookings;
* Updated: Update JavaScript dependencies with security patches.

= 5.22.0 - 2026-03-03 =
* Added: Add booking-starts automation trigger that fires before or after a booking's scheduled start date.

= 5.21.0 - 2026-02-10 =
* Added: Provide personalization tags by WooCommerce subjects in email block editor.

= 5.20.0 - 2026-02-02 =
* Added: Support guest customers in WooCommerce Bookings automation triggers.

= 5.19.0 - 2026-01-26 =
* Improved: Added search and filter capabilities to automation statistics (orders by customer name/email, status, and email; subscribers by status and step).

= 5.18.0 - 2026-01-19 =
* Updated: Bump the minimum required WordPress version to 6.8 and tested up to version to 6.9.

= 5.17.0 - 2025-11-10 =
* Improved: Titles and descriptions for automation triggers and actions.

= 5.16.0 - 2025-10-06 =
* Added: Automation trigger Booking Created for WooCommerce Bookings plugin.

= 5.15.0 - 2025-09-22 =
* Added: Automation trigger WooCommerce Booking status changed.

= 5.14.0 - 2025-08-25 =
* Added: New 'WordPress user role changes' automation trigger.

= 5.13.0 - 2025-08-12 =
* Added: Add functionality to duplicate an automation step;
* Added: new automation templates to ask for a review and a follow-up on positive or negative review;
* Added: WooCommerce Subscription-based automation templates.

= 5.12.0 - 2025-04-29 =
* Improved: minor changes and fixes.

= 5.11.0 - 2025-04-22 =
* Added: enable cross-sell products in Dynamic Products block in product review automations;
* Improved: plugin release process;
* Updated: minimum required WordPress version to 6.7 and tested up to version to 6.8.

= 5.10.0 - 2025-03-18 =
* Added: product ID, name, url, price and reviewer ID, name, email fields to review-based automations.

= 5.9.0 - 2025-03-11 =
* Improved: minor changes and fixes.

= 5.8.0 - 2025-02-24 =
* Improved: Win-back automation template.

= 5.7.0 - 2025-02-11 =
* Improved: minor changes and fixes.

= 5.6.0 - 2025-01-06 =
* Changed: when WordPress or WooCommerce version requirements are not met, MailPoet plugin won't deactivate, and instead stop executing. Once the requirements are met, it will start working automatically;
* Fixed: subscription renewed trigger is not interfering with renewals anymore.

= 5.5.0 - 2024-12-09 =
* Changed: minimum required WordPress version to 6.6 and WooCommerce to 9.3.

= 5.4.0 - 2024-11-18 =
* Fixed: WC Subscriptions status and billing period fields were always false in Automations.

= 5.3.0 - 2024-10-03 =
* Fixed: "Unknown error" in automation analytics.

= 5.2.0 - 2024-09-09 =
* Fixed: error when displaying automation orders statistics.

= 5.1.0 - 2024-09-02 =
* Improved: minor changes and fixes.

= 5.0.0 - 2024-08-19 =
* Changed: replaced PDO database connection in favor of WordPress's native wpdb.

= 4.58.0 - 2024-07-30 =
* Improved: indicate when automation run is stuck and link to Scheduled Actions to run it manually.

= 4.57.0 - 2024-07-22 =
* Improved: minor changes and fixes.

= 4.56.0 - 2024-07-15 =
* Improved: minor changes and fixes.

= 4.55.0 - 2024-07-08 =
* Improved: minor changes and fixes.

= 4.54.0 - 2024-07-02 =
* Improved: minor changes and fixes.

= 4.53.0 - 2024-06-25 =
* Updated: npm dependencies.

= 4.52.0 - 2024-06-17 =
* Updated: composer dependencies.

= 4.51.0 - 2024-05-27 =
* Improved: minor changes and fixes.

= 4.50.0 - 2024-05-08 =
* Improved: minor changes and fixes.

= 4.49.0 - 2024-04-22 =
* Improved: Delays do not count against the Step limit in pricing plans.

= 4.48.0 - 2024-03-22 =
* Improved: minor changes and fixes.

= 4.47.0 - 2024-03-18 =
* Improved: minor changes and fixes.

= 4.46.0 - 2024-03-11 =
* Improved: new parameter “in the last `x` days” added to some filters.

= 4.45.0 - 2024-03-05 =
* Improved: minor changes and fixes.

= 4.44.0 - 2024-02-19 =
* Improved: minor changes and fixes.

= 4.43.0 - 2024-02-05 =
* Improved: minor changes and fixes.

= 4.42.0 - 2024-01-22 =
* Fixed: A spelling error has been corrected.

= 4.41.0 - 2024-01-03 =
* Improved: show icon on the WordPress Update page.

= 4.40.0 - 2023-12-12 =
* Fixed: When previewing newsletters from the statistic page, the preview was missing the latest posts.

= 4.39.0 - 2023-12-04 =
* Improved: dropped support for PHP 7.3, MailPoet now requires at least PHP 7.4.

= 4.38.0 - 2023-11-27 =
* Added: WooCommerce Subscriptions automation triggers.

= 4.37.0 - 2023-11-20 =
* Improved: minor changes and fixes.

= 4.36.0 - 2023-11-14 =
* Added: "subscriber clicks a link in email" automation trigger;
* Updated: composer dependencies.

= 4.35.0 - 2023-10-31 =
* Added: "customer makes a review" automation trigger;
* Added: "user makes a comment" automation trigger.

= 4.34.0 - 2023-10-25 =
* Improved: minor changes and fixes.

= 4.33.0 - 2023-10-24 =
* Added: "if/else" automation step to allow branching automations based on subscribers' behaviours and purchase history.

= 4.32.0 - 2023-10-16 =
* Improved: minor changes and fixes.

= 4.31.0 - 2023-10-09 =
* Added: "tag added" and "tag removed" triggers in automations;
* Added: hook-based custom trigger and action in automations.

= 4.30.0 - 2023-10-02 =
* Updated: npm dependencies.

= 4.29.0 - 2023-09-25 =
* Improved: minor changes and fixes.

= 4.28.0 - 2023-09-18 =
* Changed: "Subscriber abandons cart" automation trigger moved to the free plugin.

= 4.27.0 - 2023-09-11 =
* Improved: minor changes and fixes.

= 4.26.0 - 2023-08-28 =
* Improved: minor changes and fixes.

= 4.25.0 - 2023-08-21 =
* Changed: removed mention of shortcodes in "Send notification email" step, where they don't work.

= 4.24.0 - 2023-08-14 =
* Added: Automation templates for purchased a product, a product with a tag, or in a category.

= 4.23.0 - 2023-08-08 =
* Improved: minor changes and fixes.

= 4.22.0 - 2023-07-25 =
* Fixes: counting clicks in stats when the newsletter contains more than one link.

= 4.21.0 - 2023-07-17 =
* Improved: minor changes and fixes.

= 4.20.0 - 2023-06-26 =
* Improved: minor changes and fixes.

= 4.19.0 - 2023-06-19 =
* Improved: minor changes and fixes.

= 4.18.0 - 2023-06-05 =
* Improved: minor changes and fixes.

= 4.17.0 - 2023-05-29 =
* Improved: dropped support for PHP 7.2, MailPoet now requires at least PHP 7.3.

= 4.16.0 - 2023-05-15 =
* Improved: minor changes and fixes.

= 4.15.0 - 2023-05-08 =
* Improved: minor changes and fixes.

= 4.14.0 - 2023-05-01 =
* Added: new automation action to send notification email.

= 4.13.0 - 2023-04-24 =
* Improved: minor changes and fixes.

= 4.12.0 - 2023-04-17 =
* Improved: minor changes and fixes.

= 4.11.0 - 2023-04-04 =
* Improved: minor changes and fixes.

= 4.10.0 - 2023-03-27 =
* Improved: minor changes and fixes.

= 4.9.0 - 2023-03-21 =
* Added: "Unsubscribe" action in Automations.

= 4.8.0 - 2023-03-06 =
* Improved: minor changes and fixes.

= 4.7.0 - 2023-02-20 =
* Updated: minimum required WordPress version to 5.9.

= 4.6.0 - 2023-01-31 =
* Added: update subscriber action in Automations.

= 4.5.0 - 2023-01-17 =
* Fixed: occasional class not found error during plugin update.

= 4.4.0 - 2023-01-09 =
* Improved: minor changes and fixes.

= 4.3.0 - 2022-12-19 =
* Added: add to and remove from a list actions in Automations;
* Added: add and remove tag actions in Automations.

= 4.2.0 - 2022-12-12 =
* Improved: minor changes and fixes.

= 4.1.0 - 2022-11-28 =
* Improved: minor changes and fixes.

= 4.0.0 - 2022-11-14 =
* Added: new Automations page (beta version, please share your feedback directly from the plugin).

= 3.103.0 - 2022-11-07 =
* Fix CSS class used to display minimum required version notices.

= 3.102.0 - 2022-11-01 =
* Changed: Google Analytics integration requires the premium plugin.

= 3.101.0 - 2022-10-17 =
* Improved: minor changes and fixes.

= 3.100.0 - 2022-10-03 =
* Improved: minor changes and fixes.

= 3.99.0 - 2022-09-27 =
* Improved: minor changes and fixes.

= 3.98.0 - 2022-09-19 =
* Improved: minor changes and fixes.

= 3.97.0 - 2022-09-12 =
* Changed: we are dropping number 3 from the plugin name, so from now on, "MailPoet 3" becomes just "MailPoet".

= 3.96.0 - 2022-08-29 =
* Improved: minor changes and fixes.

= 3.95.0 - 2022-08-15 =
* Improved: minor changes and fixes.

= 3.94.0 - 2022-08-08 =
* Added: link to MailPoet settings from Plugins page.

= 3.93.0 - 2022-07-25 =
* Added: new segment by subscriber tags.

= 3.92.0 - 2022-07-19 =
* Improved: minor changes and fixes.

= 3.91.0 - 2022-06-22 =
* Fixed: template caching.

= 3.90.1 - 2022-06-16 =
* Fixed: occasional error related to twig templates when updating the plugin.

= 3.90.0 - 2022-06-14 =
* Improved: badge links on stats pages are now directed to its subscribers.

= 3.89.0 - 2022-05-09 =
* Fixed: auto-updating not working.

= 3.88.0 - 2022-04-25 =
* Updated: minimum required WordPress version to 5.6.

= 3.87.0 - 2022-04-11 =
* Improved: minor changes and fixes.

= 3.86.1 - 2022-04-06 =
* Improved: minor changes and fixes.

= 3.86.0 - 2022-04-05 =
* Improved: minor changes and fixes.

= 3.85.0 - 2022-03-21 =
* Updated: npm dependencies;
* Updated: composer dependencies;
* Fixed: missing .pot file with translation sources.

= 3.84.0 - 2022-03-07 =
* Improved: minor changes and fixes.

= 3.83.0 - 2022-03-01 =
* Improved: minor changes and fixes.

= 3.82.0 - 2022-02-22 =
* Improved: minor changes and fixes.

= 3.81.0 - 2022-02-16 =
* Improved: minor changes and fixes.

= 3.80.0 - 2022-02-15 =
* Updated: npm dependencies.

= 3.79.0 - 2022-02-09 =
* Added: "Update URI" header in the plugin headers.

= 3.78.0 - 2022-01-25 =
* Fixed: unable to create a segment from email stats page.

= 3.77.0 - 2022-01-17 =
* Updated: composer dependencies.

= 3.76.0 - 2022-01-11 =
* Improved: dropped support for PHP 7.1, MailPoet now requires at least PHP 7.2.

= 3.75.0 - 2021-12-13 =
* Improved: minor changes and fixes.

= 3.74.0 - 2021-11-16 =
* Improved: minor changes and fixes.

= 3.73.0 - 2021-11-02 =
* Updated: npm dependencies;
* Updated: composer dependencies.

= 3.72.0 - 2021-10-25 =
* Improved: minor changes and fixes.

= 3.71.0 - 2021-09-28 =
* Improved: minor changes and fixes.

= 3.70.0 - 2021-09-20 =
* Added: detailed bounce statistics.

= 3.69.0 - 2021-09-07 =
* Added: show detailed machine-opened stats on the email stats page;
* Improved: subscriber engagement calculation performance.

= 3.68.0 - 2021-08-30 =
* Fixed: parse error when activating plugin.

= 3.67.0 - 2021-08-17 =
* Improved: updated PHP dependencies.

= 3.66.0 - 2021-08-09 =
* Improved: minor changes and fixes.

= 3.65.0 - 2021-07-12 =
* Improved: minor changes and fixes.

= 3.64.0 - 2021-06-15 =
* Improved: minor changes and fixes.

= 3.63.0 - 2021-06-07 =
* Improved: minor changes and fixes.

= 3.62.0 - 2021-05-24 =
* Improved: minor changes and fixes.

= 3.61.0 - 2021-05-17 =
* Improved: minor changes and fixes.

= 3.60.0 - 2021-02-15 =
* Improved: minor changes and fixes.

= 3.59.0 - 2021-01-25 =
* Improved: minor changes and fixes.

= 3.58.0 - 2021-01-18 =
* Improved: minor changes and fixes.

= 3.57.0 - 2021-01-04 =
* Improved: minor changes and fixes.

= 3.56.0 - 2020-12-07 =
* Improved: minor changes and fixes.

= 3.55.0 - 2020-11-23 =
* Improved: redesigned email stats.

= 3.54.0 - 2020-10-26 =
* Improved: minor changes and fixes.

= 3.53.0 - 2020-10-20 =
* Improved: minor changes and fixes.

= 3.52.0 - 2020-10-12 =
* Improved: minor changes and fixes.

= 3.0.94 - 2020-10-06 =
* Improved: minor changes and fixes.

= 3.0.93 - 2020-09-22 =
* Improved: minor changes and fixes.

= 3.0.92 - 2020-09-14 =
* Improved: minor changes and fixes.

= 3.0.91 - 2020-09-08 =
* Added: stats per subscriber.

= 3.0.90 - 2020-08-24 =
* Improved: minor changes and fixes.

= 3.0.89 - 2020-08-04 =
* Improved: minor changes and fixes.

= 3.0.88 - 2020-07-28 =
* Improved: minor changes and fixes.

= 3.0.87 - 2020-06-23 =
* Improved: minor changes and fixes.

= 3.0.86 - 2020-05-25 =
* Improved: minor changes and fixes.

= 3.0.85 - 2020-05-18 =
* Improved: minor changes and fixes.

= 3.0.84 - 2020-05-04 =
* Improved: minor changes and fixes.

= 3.0.83 - 2020-03-16 =
* Improved: minor changes and fixes.

= 3.0.82 - 2020-02-17 =
* Improved: minor changes and fixes.

= 3.0.81 - 2020-02-03 =
* Improved: minor changes and fixes.

= 3.0.80 - 2020-01-28 =
* Improved: minor changes and fixes.

= 3.0.79 - 2020-01-21 =
* Fixed: SQL error in strict mode.

= 3.0.78 - 2020-01-07 =
* Improved: minor changes and fixes.

= 3.0.77 - 2019-12-24 =
* Improved: minor changes and fixes.

= 3.0.76 - 2019-12-17 =
* Improved: minor changes and fixes.

= 3.0.75 - 2019-12-03 =
* Improved: minor changes and fixes.

= 3.0.74 - 2019-11-18 =
* Improved: minor changes and fixes.

= 3.0.73 - 2019-11-05 =
* Improved: minor changes and fixes.

= 3.0.72 - 2019-10-29 =
* Improved: minor changes and fixes.

= 3.0.71 - 2019-10-22 =
* Improved: minor changes and fixes.

= 3.0.70 - 2019-10-15 =
* Improved: minor changes and fixes.

= 3.0.69 - 2019-10-07 =
* Improved: minor changes and fixes.

= 3.0.68 - 2019-10-01 =
* Improved: minor changes and fixes.

= 3.0.67 - 2019-09-24 =
* Fixed: WooCommerce emails tab now only shows if WooCommerce is active;
* Fixed: incorrect WooCommerce link.

= 3.0.66 - 2019-09-17 =
* Improved: minor changes and fixes.

= 3.0.65 - 2019-09-10 =
* Improved: minor changes and fixes.

= 3.0.64 - 2019-09-04 =
* Improved: logic for displaying MailPoet notices.

= 3.0.63 - 2019-08-27 =
* Improved: better exception catching and handling.

= 3.0.62 - 2019-08-13 =
* Improved: links to our Knowledge Base updated;
* Fixed: fatal error on newsletters stats page if WooCommerce wasn't installed.
* Fixed: scheduled WooCommerce emails to not prevent viewing their stats. Thanks, Dmitris!

= 3.0.61 - 2019-07-30 =
* New: Abandoned cart emails for WooCommerce users, yay!

= 3.0.60 - 2019-07-23 =
* Improved: minor changes and fixes.

= 3.0.59 - 2019-07-09 =
* Improved: minor changes and fixes.

= 3.0.58 - 2019-07-03 =
* Improved: minor changes and fixes.

= 3.0.57 - 2019-07-02 =
* Improved: minor changes and fixes.

= 3.0.56 - 2019-06-25 =
* Improved: minor changes and fixes.

= 3.0.55 - 2019-06-18 =
* Improved: minor changes and fixes.

= 3.0.54 - 2019-06-04 =
* Improved: minor tweaks and fixes.

= 3.0.53 - 2019-05-28 =
* Added: a WooCommerce email to contact the customer when they purchased products in a certain category.

= 3.0.52 - 2019-05-21 =
* Improved: minor changes and fixes.

= 3.0.51 - 2019-05-14 =
* Added: WooCommerce guest checkout customers can now opt-in to email lists, receive WooCommerce emails.

= 3.0.50 - 2019-04-29 =
* Fixed: blank newsletter page for users with PHP 7.0.33.

= 3.0.49 - 2019-04-23 =
* Improved: minor changes and fixes.

= 3.0.48 - 2019-04-16 =
* Improved: minor changes and fixes.

= 3.0.47 - 2019-04-02 =
* Improved: minor changes and fixes.

= 3.0.46 - 2019-03-25 =
* Improved: minor changes and fixes.


= 3.0.45 - 2019-03-11 =
* Improved: minor changes and fixes.

= 3.0.44 - 2019-03-05 =
* Fixed: Welcome email clicked link stats are properly aggregated.

= 3.0.43 - 2019-02-26 =
* Improved: minor changes and fixes.

= 3.0.42 - 2019-02-12 =
* Improved: minor changes and fixes.

= 3.0.41 - 2019-02-05 =
* Improved: minor changes and fixes.

= 3.0.40 - 2019-01-22 =
* Improved: minor changes and fixes.

= 3.0.39 - 2019-01-15 =
* Improved: minor changes and fixes.

= 3.0.38 - 2019-01-08 =
* Fixed: possible conflict with other plugins using webpack. Thanks, Julien;

= 3.0.37 - 2018-12-18 =
* Improved: minor changes and fixes.

= 3.0.36 - 2018-12-13 =
* Improved: minor enhancements.

= 3.0.35 - 2018-12-11 =
* Improved: the stats page is now mobile-friendly;

= 3.0.33 - 2018-12-05 =
* Improved: minor enhancements.

= 3.0.32 - 2018-11-27 =
* Fixed: deleted subscribers are shown as deleted in statistics for clarity.

= 3.0.31 - 2018-11-20 =
* Improved: minor enhancements.

= 3.0.30 - 2018-11-13 =
* Fixed: Dynamic listing segments display trashed entries again;
* Fixed: GA params are added to other subdomains' links. Thanks, Nicole!

= 3.0.29 - 2018-09-11 =
* Improved: minor enhancements.

= 3.0.28 - 2018-10-23 =
* Fixed: trashed segments to not appear in lists filters.

= 3.0.27 - 2018-09-25 =
* Fixed: WooCommerce Purchased This Product emails created and sent for COD and check payments.

= 3.0.26 - 2018-09-11 =
* Improved: minor enhancements.

= 3.0.25 - 2018-09-04 =
* Fixed: automatic first purchase emails for COD and bank transfer payment types restored;

= 3.0.24 - 2018-08-28 =
* Improved: minor enhancements.

= 3.0.23 - 2018-07-17 =
* Improved: we collect more informative data from those who share it with us in order to improve the plugin. You should share too!
* Added: compatibility with the latest MailPoet 3 Free version.

= 3.0.22 - 2018-06-20 =
* Added: feedback badge to gather comments on Automatic Emails;

= 3.0.21 - 2018-06-12 =
* Fixed: statistics are properly displayed for welcome notifications. Thanks, Mike!
* Added: You can now send automatic emails when a customer places their first order or buys a product in your WooCommerce shop;

= 3.0.20 - 2018-05-30 =
* Improved: translation enhancements.

= 3.0.19 - 2018-05-22 =
* Fixed: javascript warnings resolved on Stats page. Thanks Mathieu;
* Fixed: compatibility issue with Members plugin and welcome emails. Thanks Kenneth!

= 3.0.18 - 2018-04-25 =
* Fixed: Fields do not display on last step of email creation.
* Fixed: Welcome email scheduling delay to work again. Thanks Shing and Luc!
* Fixed: Stats showing incorrect results.

= 3.0.17 - 2018-04-10 =
* Improved: subscriber export tool now supports dynamic segments.

= 3.0.16 - 2018-03-20 =
* Updated compatible MailPoet 3 Free version.

= 3.0.15 - 2018-03-13 =
* Improved: plugin usage statistics.

= 3.0.14 - 2018-03-07 =
* Fixed: Welcome Email functionality was restored.

= 3.0.13 - 2018-03-06 =
* Added: bulk actions can now be executed on subscribers belonging to a selected segment.

= 3.0.12 - 2018-02-20 =
* Added: send emails to WooCommerce customers who purchased in a specific product category.

= 3.0.11 - 2018-02-20 =
* Improved: you can now delete segments.

= 3.0.10 - 2018-02-13 =
* Added: segment your subscribers by opened, clicked and unopened events from the stats page of a sent newsletter.

= 3.0.9 - 2018-02-06 =
* Fixed: standard newsletters scheduled for future are sent to dynamic segments. Thanks Amanda;
* Fixed: Premium plugin’s UserRole dynamic segment query works little bit better now, thanks Delta Factory.

= 3.0.8 - 2018-01-30 =
* Fixed: sending emails to WordPress user role segments. Thanks Drew!

= 3.0.7 - 2018-01-23 =
* Fixed: Creation of segments for WP user roles. Thanks Jeff!

= 3.0.6 - 2018-01-16 =
* Improved: made some translations clearer;

= 3.0.5 - 2018-01-02 =
* Improved: you can search segments

= 3.0.4 - 2017-12-12 =
* Improved: you can now segment your subscribers by email events;
* Fixed: pagination in the segment section of the plugin has been fixed;
* Fixed: GA tracking of post notifications works as it should.

= 3.0.3 - 2017-11-14 =
* Improved: you can now view subscribers in dynamic segments.

= 3.0.2 - 2017-11-07 =
* Added: early preview of dynamic subscriber segmentation based on WP user roles. Let us know your feedback!

= 3.0.1 - 2017-10-24 =
* Fixed: we localized numbers across our entire UI for readability

= 3.0.0 - 2017-09-20 =
* Official launch of the new MailPoet. :)

= 3.0.0-rc.2.0.1 - 2017-09-12 =
* Fixed: translations are properly loaded;

= 3.0.0-rc.2.0.0 - 2017-08-29 =
* Improved: error messages when plugin needs to be updated;

= 3.0.0-rc.1.0.2 - 2017-08-22 =
* Fixed: unopened subscribers tally in statistics is now correct. Thanks Sophie and Eugene!

= 3.0.0-rc.1.0.1 - 2017-08-15 =
* Fixed: translations should now be up to date;

= 3.0.0-rc.1.0.0 - 2017-08-01 =
* Improved: MailPoet 3 is no longer in Beta!

= 3.0.0-beta.4.0.0 - 2017-07-25 =
* Improved: we collect more informative data from those who share it with us in order to improve the plugin. You should share too!
* Fixed: sending newsletters with GA campaigns works again.

= 3.0.0-beta.3.0.1 - 2017-06-23 =
* Fixed: administrator pages will not display error notices.

= 3.0.0-beta.3.0.0 - 2017-06-20 =
* Fixed: settings page is not blocked any more if you have more than 2000 subscribers which prevented Premium version updates;
* Improved: newsletter stats are zippier on large data sets.

= 3.0.0-beta.2.0.0 - 2017-06-13 =
* Fixed: plugins that change WP upload directory will not interfere with MailPoet Premium caching.

= 3.0.0-beta.1.0.0 - 2017-06-07 =
* Premium is now in the beta phase!;
* Added: updates for Premium will show up in your admin;
* Improved: stats page UX got a little better.

= 3.0.0-alpha.0.1 - 2017-05-31 =
* Added: plugin can now be translated into different languages. If you would like to help us translate MailPoet 3 Premium into your language, please visit our Transifex page (https://www.transifex.com/wysija/mp3-pro);
* Fixed: plugin reinstallation via Settings page to work with new versions of MailPoet 3;
* Fixed: error will be correctly displayed when the plugin is missing core files;
* Changed: minimum PHP version requirement from 5.3 to 5.3.3.

= 3.0.0-alpha.0.0.4 - 2017-05-23 =
* Fixed: Premium behavior to work with new versions of MailPoet 3.

= 3.0.0-alpha.0.0.3 - 2017-04-26 =
* Added: detailed statistics for single campaigns are now available.

= 3.0.0-alpha.0.0.2 - 2017-03-23 =
* Added: 2000 subscriber limit is unlocked;
* Added: links can be tracked with Google Analytics in sent emails.

= 3.0.0-alpha.0.0.1 - 2016-12-13 =
* Initial plugin structure.
