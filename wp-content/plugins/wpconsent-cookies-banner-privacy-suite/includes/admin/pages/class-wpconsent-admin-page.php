<?php

/**
 * Admin pages abstract class.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Admin_Page
 */
abstract class WPConsent_Admin_Page {

	use WPConsent_Language_Picker;

	/**
	 * The page slug.
	 *
	 * @var string
	 */
	public $page_slug = '';

	/**
	 * The page title.
	 *
	 * @var string
	 */
	public $page_title = '';

	/**
	 * The menu title, defaults to the page title.
	 *
	 * @var string
	 */
	public $menu_title;

	/**
	 * If there's an error message, let's store it here.
	 *
	 * @var string
	 */
	public $message_error;

	/**
	 * If there's a success message, store it here.
	 *
	 * @var string
	 */
	public $message_success;

	/**
	 * The current view.
	 *
	 * @var string
	 */
	public $view = '';

	/**
	 * The available views for this page.
	 *
	 * @var array
	 */
	public $views = array();

	/**
	 * If the submenu for the page should be hidden, set this to true.
	 *
	 * @var bool
	 */
	public $hide_menu = false;

	/**
	 * The capability needed for the current user to view this page.
	 *
	 * @var string
	 */
	protected $capability = 'manage_options';

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( ! isset( $this->menu_title ) ) {
			$this->menu_title = $this->page_title;
		}

		$this->hooks();
	}

	/**
	 * Add hooks to register the page and output content.
	 *
	 * @return void
	 */
	public function hooks() {
		add_action( 'admin_menu', array( $this, 'add_page' ) );
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		// Only load if we are actually on the desired page.
		if ( $this->page_slug !== $page ) {
			return;
		}
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'wpconsent-cookies-banner-privacy-suite' ) );
		}
		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
		add_action( 'wpconsent_admin_page', array( $this, 'output' ) );
		add_action( 'wpconsent_admin_page', array( $this, 'output_footer' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'page_scripts' ) );
		add_filter( 'admin_body_class', array( $this, 'page_specific_body_class' ) );
		add_action( 'in_admin_footer', array( $this, 'wpconsent_footer' ) );

		$this->setup_views();
		$this->page_hooks();
		$this->set_current_view();
	}

	/**
	 * If the page has views, this is where you should assign them to $this->views.
	 *
	 * @return void
	 */
	protected function setup_views() {
	}

	/**
	 * Set the current view from the query param also checking it's a registered view for this page.
	 *
	 * @return void
	 */
	protected function set_current_view() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['view'] ) ) {
			return;
		}
		$view = sanitize_text_field( wp_unslash( $_GET['view'] ) );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended
		if ( array_key_exists( $view, $this->views ) ) {
			$this->view = $view;
		}
	}

	/**
	 * Override in child class to define page-specific hooks that will run only
	 * after checks have been passed.
	 *
	 * @return void
	 */
	public function page_hooks() {
	}

	/**
	 * Add the submenu page.
	 *
	 * @return void
	 */
	public function add_page() {
		add_submenu_page(
			'wpconsent',
			$this->page_title,
			$this->menu_title,
			$this->capability,
			$this->page_slug,
			array(
				wpconsent()->admin_page_loader,
				'admin_menu_page',
			)
		);
	}

	/**
	 * Output the page content.
	 *
	 * @return void
	 */
	public function output() {
		$this->output_header();
		?>
		<div class="wpconsent-content">
			<?php
			$this->output_content();
			do_action( "wpconsent_admin_page_content_{$this->page_slug}", $this );
			?>
		</div>
		<?php
	}

	/**
	 * Output of the header markup for admin pages.
	 *
	 * @return void
	 */
	public function output_header() {
		?>
		<div class="wpconsent-header">
			<div class="wpconsent-header-top">
				<div class="wpconsent-header-left">
					<?php $this->output_header_left(); ?>
				</div>
				<div class="wpconsent-header-right">
					<?php $this->output_header_right(); ?>
				</div>
			</div>
			<div id="wpconsent-header-between">
			</div>
			<div class="wpconsent-header-bottom">
				<?php $this->output_header_bottom(); ?>
			</div>
		</div>
		<?php $this->maybe_output_message(); ?>
		<?php
	}

	/**
	 * Left side of the header, usually just the logo in this area.
	 *
	 * @return void
	 */
	public function output_header_left() {
		$this->logo_image();
	}

	/**
	 * Logo image.
	 *
	 * @return void
	 */
	public function logo_image() {
		wpconsent_icon( 'logo-text', 194, 34, '0 0 395 66' );
	}

	/**
	 * Top right area of the header, by default the notifications and help icons.
	 *
	 * @return void
	 */
	public function output_header_right() {
		$notifications_count = wpconsent()->notifications->get_count();
		$dismissed_count     = wpconsent()->notifications->get_dismissed_count();
		$data_count          = '';
		if ( $notifications_count > 0 ) {
			$data_count = sprintf(
				'data-count="%d"',
				absint( $notifications_count )
			);
		}
		$this->language_picker_button();
		?>
		<button
				type="button"
				id="wpconsent-notifications-button"
				class="wpconsent-button-just-icon wpconsent-notifications-inbox wpconsent-open-notifications"
				data-dismissed="<?php echo esc_attr( $dismissed_count ); ?>"
			<?php
			echo $data_count; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		>
			<?php wpconsent_icon( 'inbox', 15, 16 ); ?>
		</button>
		<button class="wpconsent-text-button-icon wpconsent-show-help" type="button">
			<?php wpconsent_icon( 'help', 21 ); ?>
			<?php esc_html_e( 'Help', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</button>
		<?php
	}

	/**
	 * Content of the bottom row of the header: the view tabs when the page has
	 * views, otherwise its title.
	 *
	 * @return void
	 */
	public function output_header_bottom() {
		if ( empty( $this->views ) ) {
			?>
			<div class="wpconsent-column wpconsent-title-button">
				<h1><?php echo esc_html( $this->page_title ); ?></h1>
			</div>
			<?php
			return;
		}
		?>
		<ul class="wpconsent-admin-tabs">
			<?php foreach ( $this->views as $slug => $label ) : ?>
				<li>
					<a href="<?php echo esc_url( $this->get_view_link( $slug ) ); ?>" class="<?php echo esc_attr( $this->view === $slug ? 'active' : '' ); ?>"><?php echo esc_html( $label ); ?></a>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php
	}

	/**
	 * Checks if an error or success message is available and outputs using the specific format.
	 *
	 * @return void
	 */
	public function maybe_output_message() {
		$error_message   = $this->get_error_message();
		$success_message = $this->get_success_message();
		?>
		<div class="wrap" id="wpconsent-notice-area">
			<?php
			if ( $error_message ) {
				?>
				<div class="error fade notice is-dismissible">
					<p><?php echo wp_kses_post( $error_message ); ?></p>
				</div>
				<?php
			}
			if ( $success_message ) {
				?>
				<div class="updated fade notice is-dismissible">
					<p><?php echo wp_kses_post( $success_message ); ?></p>
				</div>
				<?php
			}
			do_action( 'wpconsent_admin_notices' );
			?>
		</div>
		<?php
	}

	/**
	 * If no message is set return false otherwise return the message string.
	 *
	 * @return false|string
	 */
	public function get_error_message() {
		return ! empty( $this->message_error ) ? $this->message_error : false;
	}

	/**
	 * If no message is set return false otherwise return the message string.
	 *
	 * @return false|string
	 */
	public function get_success_message() {
		return ! empty( $this->message_success ) ? $this->message_success : false;
	}

	/**
	 * This is the main page content.
	 *
	 * A page with views only needs an output_view_{slug} method per view; the
	 * default below dispatches to it. Pages that render one screen override this.
	 *
	 * @return void
	 */
	public function output_content() {
		if ( method_exists( $this, 'output_view_' . $this->view ) ) {
			call_user_func( array( $this, 'output_view_' . $this->view ) );
		}
	}

	/**
	 * Output footer markup, mostly used for overlays that are fixed.
	 *
	 * @return void
	 */
	public function output_footer() {
		$support_url = wpconsent_utm_url( 'https://wpconsent.com/contact/', 'help-overlay', 'support-url' );
		?>
		<div class="wpconsent-docs-overlay" id="wpconsent-docs-overlay">
			<div id="wpconsent-help-logo">
				<?php $this->logo_image(); ?>
			</div>
			<button id="wpconsent-help-close" class="wpconsent-button-just-icon" type="button">
				<?php wpconsent_icon( 'close', 19, 19 ); ?>
			</button>
			<div class="wpconsent-docs-content">
				<div id="wpconsent-help-search" class="wpconsent-search-empty">
					<label>
						<span class="screen-reader-text"><?php esc_html_e( 'Search docs', 'wpconsent-cookies-banner-privacy-suite' ); ?></span>
						<?php wpconsent_icon( 'search' ); ?>
						<input type="text" class="wpconsent-input-text"/>
					</label>
					<div id="wpconsent-help-search-clear" title="<?php esc_attr_e( 'Clear', 'wpconsent-cookies-banner-privacy-suite' ); ?>">
						<?php wpconsent_icon( 'close', 14, 14 ); ?>
					</div>
				</div>
				<div id="wpconsent-help-no-result" style="display: none;">
					<ul class="wpconsent-help-docs">
						<li>
							<span><?php esc_html_e( 'No docs found', 'wpconsent-cookies-banner-privacy-suite' ); ?></span>
						</li>
					</ul>
				</div>
				<div id="wpconsent-help-result">
					<ul class="wpconsent-help-docs"></ul>
				</div>
				<?php
				$docs = new WPConsent_Docs();
				$docs->get_categories_accordion();
				?>
				<div class="wpconsent-help-footer">
					<div class="wpconsent-help-footer-box">
						<?php wpconsent_icon( 'file', 48, 48 ); ?>
						<h3><?php esc_html_e( 'View Documentation', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
						<p><?php esc_html_e( 'Browse documentation, reference material, and tutorials for WPConsent.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
						<a class="wpconsent-button wpconsent-button-secondary" href="<?php echo esc_url( wpconsent_utm_url( 'https://wpconsent.com/docs/', 'help-overlay', 'docs', 'footer' ) ); ?>" target="_blank"><?php esc_html_e( 'View All Documentation', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>
					</div>
					<div class="wpconsent-help-footer-box">
						<?php wpconsent_icon( 'support', 48, 48 ); ?>
						<h3><?php esc_html_e( 'Get Support', 'wpconsent-cookies-banner-privacy-suite' ); ?></h3>
						<p><?php esc_html_e( 'Submit a ticket and our world class support team will be in touch soon.', 'wpconsent-cookies-banner-privacy-suite' ); ?></p>
						<a class="wpconsent-button wpconsent-button-secondary" href="<?php echo esc_url( $support_url ); ?>" target="_blank"><?php esc_html_e( 'Submit a Support Ticket', 'wpconsent-cookies-banner-privacy-suite' ); ?></a>
					</div>
				</div>
			</div>
		</div>
		<div class="wpconsent-notifications-drawer" id="wpconsent-notifications-drawer">
			<div class="wpconsent-notifications-header">
				<h3 id="wpconsent-active-title">
					<?php
					printf(
						wp_kses_post(
						// Translators: Placeholder for the number of active notifications.
							__( 'New Notifications (%s)', 'wpconsent-cookies-banner-privacy-suite' )
						),
						'<span id="wpconsent-notifications-count">' . absint( wpconsent()->notifications->get_count() ) . '</span>'
					);
					?>
				</h3>
				<h3 id="wpconsent-dismissed-title">
					<?php
					printf(
						wp_kses_post(
						// Translators: Placeholder for the number of dismissed notifications.
							__( 'Notifications (%s)', 'wpconsent-cookies-banner-privacy-suite' )
						),
						'<span id="wpconsent-notifications-dismissed-count">' . absint( wpconsent()->notifications->get_dismissed_count() ) . '</span>'
					);
					?>
				</h3>
				<button type="button" class="wpconsent-button-text" id="wpconsent-notifications-show-dismissed">
					<?php esc_html_e( 'Dismissed Notifications', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
				<button type="button" class="wpconsent-button-text" id="wpconsent-notifications-show-active">
					<?php esc_html_e( 'Active Notifications', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
				<button type="button" class="wpconsent-just-icon-button wpconsent-notifications-close"><?php wpconsent_icon( 'close', 12, 12, '0 0 16 16' ); ?></button>
			</div>
			<div class="wpconsent-notifications-list">
				<ul class="wpconsent-notifications-active">
					<?php
					$notifications = wpconsent()->notifications->get_active_notifications();
					foreach ( $notifications as $notification ) {
						$this->get_notification_markup( $notification );
					}
					?>
				</ul>
				<ul class="wpconsent-notifications-dismissed">
					<?php
					$notifications = wpconsent()->notifications->get_dismissed_notifications();
					foreach ( $notifications as $notification ) {
						$this->get_notification_markup( $notification );
					}
					?>
				</ul>
			</div>
			<div class="wpconsent-notifications-footer">
				<button type="button" class="wpconsent-button-text wpconsent-notification-dismiss" id="wpconsent-dismiss-all" data-id="all"><?php esc_html_e( 'Dismiss all', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
			</div>
		</div>
		<span class="wpconsent-loading-spinner" id="wpconsent-admin-spinner"></span>
		<?php
	}

	/**
	 * Output of the footer markup for admin pages (credits + links).
	 *
	 * @return void
	 */
	public function wpconsent_footer() {

		$links = array(
			array(
				'url'    => class_exists( 'WPConsent_Premium' ) ? wpconsent_utm_url( 'https://wpconsent.com/my-account/support/', 'plugin-footer', 'contact-support' ) : 'https://wordpress.org/support/plugin/wpconsent-cookies-banner-privacy-suite/',
				'text'   => __( 'Support', 'wpconsent-cookies-banner-privacy-suite' ),
				'target' => '_blank',
			),
			array(
				'url'    => function_exists( 'wpconsent_utm_url' ) ? wpconsent_utm_url( 'https://wpconsent.com/docs/', 'plugin-footer', 'documentation' ) : 'https://wpconsent.com/docs/',
				'text'   => __( 'Docs', 'wpconsent-cookies-banner-privacy-suite' ),
				'target' => '_blank',
			),
		);

		$heart = '♥';
		$team  = 'WPConsent';
		?>

		<div class="wpconsent-footer">

			<p>
			<?php
			printf(
				// Translators: %1$s - love symbol (e.g., heart), %2$s - team name.
				esc_html__( 'Made with %1$s by the %2$s team', 'wpconsent-cookies-banner-privacy-suite' ),
				esc_html( $heart ),
				esc_html( $team )
			);
			?>
			</p>

			<ul class="wpconsent-footer-links">
				<?php foreach ( $links as $index => $item ) : ?>
					<li>
						<a href="<?php echo esc_url( $item['url'] ); ?>" target="<?php echo esc_attr( $item['target'] ); ?>" rel="noopener noreferrer"><?php echo esc_html( $item['text'] ); ?></a>
						<?php if ( $index + 1 < count( $links ) ) : ?>
							<span>/</span>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>
			<ul class="wpconsent-footer-social">
				<li>
					<a href="https://www.facebook.com/groups/wpbeginner" target="_blank" rel="noopener noreferrer">
						<?php wpconsent_icon( 'facebook', 17, 16 ); ?>
						<span class="screen-reader-text">Facebook</span>
					</a>
				</li>
				<li>
					<a href="https://x.com/wpconsent" target="_blank" rel="noopener noreferrer">
						<?php wpconsent_icon( 'x', 17, 16, '0 0 512 512' ); ?>
						<span class="screen-reader-text">X</span>
					</a>
				</li>
			</ul>
		</div>

		<?php
	}

	/**
	 * Get the notification HTML markup for displaying in a list.
	 *
	 * @param array $notification The notification array.
	 *
	 * @return void
	 */
	public function get_notification_markup( $notification ) {
		$type = ! empty( $notification['icon'] ) ? $notification['icon'] : 'info';
		?>
		<li>
			<div class="wpconsent-notification-icon"><?php wpconsent_icon( $type, 18, 18 ); ?></div>
			<div class="wpconsent-notification-content">
				<h4><?php echo esc_html( $notification['title'] ); ?></h4>
				<p><?php echo wp_kses_post( $notification['content'] ); ?></p>
				<p class="wpconsent-start"><?php echo esc_html( $notification['start'] ); ?></p>
				<div class="wpconsent-notification-actions">
					<?php
					$main_button = ! empty( $notification['btns']['main'] ) ? $notification['btns']['main'] : false;
					$alt_button  = ! empty( $notification['btns']['alt'] ) ? $notification['btns']['alt'] : false;
					if ( $main_button ) {
						?>
						<a href="<?php echo esc_url( $main_button['url'] ); ?>" class="wpconsent-button wpconsent-button-small" target="_blank">
							<?php echo esc_html( $main_button['text'] ); ?>
						</a>
						<?php
					}
					if ( $alt_button ) {
						?>
						<a href="<?php echo esc_url( $alt_button['url'] ); ?>" class="wpconsent-button wpconsent-button-secondary wpconsent-button-small" target="_blank">
							<?php echo esc_html( $alt_button['text'] ); ?>
						</a>
						<?php
					}
					?>
					<button type="button" class="wpconsent-button-text wpconsent-notification-dismiss" data-id="<?php echo esc_attr( $notification['id'] ); ?>"><?php esc_html_e( 'Dismiss', 'wpconsent-cookies-banner-privacy-suite' ); ?></button>
				</div>
			</div>
		</li>
		<?php
	}

	/**
	 * If you need to page-specific scripts override this function.
	 * Hooked to 'admin_enqueue_scripts'.
	 *
	 * @return void
	 */
	public function page_scripts() {
	}

	/**
	 * Set a success message to display it in the appropriate place.
	 * Let's use a function so if we decide to display multiple messages in the
	 * same instance it's easy to change the variable to an array.
	 *
	 * @param string $message The message to store as success message.
	 *
	 * @return void
	 */
	public function set_success_message( $message ) {
		$this->message_success = $message;
	}

	/**
	 * Set an error message to display it in the appropriate place.
	 * Let's use a function so if we decide to display multiple messages in the
	 * same instance it's easy to change the variable to an array.
	 *
	 * @param string $message The message to store as error message.
	 *
	 * @return void
	 */
	public function set_error_message( $message ) {
		$this->message_error = $message;
	}

	/**
	 * Add a page-specific body class using the page slug variable..
	 *
	 * @param string $body_class The body class to append.
	 *
	 * @return string
	 */
	public function page_specific_body_class( $body_class ) {

		$body_class .= ' wpconsent-admin-page';
		$body_class .= ' ' . $this->page_slug;

		return $body_class;
	}

	/**
	 * Get the page url to be used in a form action.
	 *
	 * @return string
	 */
	public function get_page_action_url() {
		$args = array(
			'page' => $this->page_slug,
		);
		if ( ! empty( $this->view ) ) {
			$args['view'] = $this->view;
		}

		return add_query_arg( $args, $this->admin_url( 'admin.php' ) );
	}

	/**
	 * Get an admin URL.
	 *
	 * @param string $path The path to append to the admin URL.
	 *
	 * @return string
	 */
	public function admin_url( $path ) {
		return admin_url( $path );
	}

	/**
	 * Metabox-style layout for admin pages.
	 *
	 * @param string $title The metabox title.
	 * @param string $content The metabox content.
	 * @param string $help The helper text (optional) - if set, a help icon will show up next to the title.
	 * @param string $id The metabox id attribute (optional).
	 * @param string $actions Markup shown on the right of the title (optional).
	 *
	 * @return void
	 */
	public function metabox( $title, $content, $help = '', $id = '', $actions = '' ) {
		// translators: %s is the title of the metabox.
		$button_title = sprintf( __( 'Collapse Metabox %s', 'wpconsent-cookies-banner-privacy-suite' ), $title )
		?>
		<div class="wpconsent-metabox" <?php echo ! empty( $id ) ? 'id="' . esc_attr( $id ) . '"' : ''; ?>>
			<div class="wpconsent-metabox-title">
				<div class="wpconsent-metabox-title-text">
					<?php echo wp_kses_post( $title ); ?>
					<?php $this->help_icon( $help ); ?>
				</div>
				<?php if ( ! empty( $actions ) ) { ?>
					<div class="wpconsent-metabox-title-actions">
						<?php echo wp_kses_post( $actions ); ?>
					</div>
				<?php } ?>
				<div class="wpconsent-metabox-title-toggle">
					<button class="wpconsent-metabox-button-toggle" type="button" title="<?php echo esc_attr( $button_title ); ?>">
						<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M1.41 7.70508L6 3.12508L10.59 7.70508L12 6.29508L6 0.295079L-1.23266e-07 6.29508L1.41 7.70508Z" fill="#454545"/>
						</svg>
					</button>
				</div>
			</div>
			<div class="wpconsent-metabox-content">
				<?php echo $content; // phpcs:ignore
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Output a help icon with the text passed to it.
	 *
	 * @param string $text The tooltip text.
	 * @param bool   $echo_output Whether to echo or return the output.
	 *
	 * @return void|string
	 */
	public function help_icon( $text = '', $echo_output = true ) {
		if ( empty( $text ) ) {
			return;
		}
		if ( ! $echo_output ) {
			ob_start();
		}
		?>
		<span class="wpconsent-help-tooltip">
			<?php wpconsent_icon( 'help', 16, 16, '0 0 20 20' ); ?>
			<span class="wpconsent-help-tooltip-text"><?php echo wp_kses_post( $text ); ?></span>
		</span>
		<?php
		if ( ! $echo_output ) {
			return ob_get_clean();
		}
	}

	/**
	 * Get a WPConsent metabox row.
	 *
	 * @param string $label The label of the field.
	 * @param string $input The field input (html).
	 * @param string $input_id The id of the input that we use in the label.
	 * @param string $show_if_id Conditional logic id, automatically hide if the value of the field with this id doesn't match show if value.
	 * @param string $show_if_value Value(s) to match against, can be comma-separated string for multiple values.
	 * @param string $description Description to show under the input.
	 * @param bool   $is_pro Whether this is a pro feature and the pro indicator should be shown next to the label.
	 * @param string $id The id of the metabox row.
	 * @param bool   $locked Whether the field is locked (e.g. enforced by IAB TCF) and should render as non-editable.
	 *
	 * @return void
	 */
	public function metabox_row( $label, $input, $input_id = '', $show_if_id = '', $show_if_value = '', $description = '', $is_pro = false, $id = '', $locked = false ) {
		$show_if_rules = '';
		if ( ! empty( $show_if_id ) ) {
			$show_if_rules = sprintf( 'data-show-if-id="%1$s" data-show-if-value="%2$s"', esc_attr( $show_if_id ), esc_attr( $show_if_value ) );
		}
		$id    = ! empty( $id ) ? 'id="' . esc_attr( $id ) . '"' : '';
		$class = 'wpconsent-metabox-form-row';
		if ( $is_pro ) {
			$class .= ' wpconsent-form-row-pro';
		}
		if ( $locked ) {
			$class .= ' wpconsent-field-tcf-locked';
		}
		?>
		<div class="<?php echo esc_attr( $class ); ?>"
			<?php
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built with esc_attr().
			echo $show_if_rules;
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $id;
			?>
		>
			<div class="wpconsent-metabox-form-row-label">
				<?php
				if ( $locked ) {
					echo '<span class="wpconsent-tcf-lock-icon" aria-hidden="true"><span class="dashicons dashicons-lock"></span></span>';
				}
				?>
				<label for="<?php echo esc_attr( $input_id ); ?>">
					<?php echo esc_html( $label ); ?>
					<?php
					if ( $is_pro ) {
						echo '<span class="wpconsent-pro-pill">PRO</span>';
					}
					?>
				</label>
			</div>
			<div class="wpconsent-metabox-form-row-input">
				<?php
				echo $input; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				?>
				<?php if ( ! empty( $description ) ) { ?>
					<p><?php echo wp_kses_post( $description ); ?></p>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Check whether a specific field is locked by IAB TCF enforcement.
	 *
	 * Returns false by default; Pro classes override this when IAB TCF is enabled.
	 *
	 * @param string $field The option/field name to check.
	 *
	 * @return bool
	 */
	protected function is_tcf_field_locked( $field ) {
		return false;
	}

	/**
	 * Get the HTML for a TCF enforcement notice.
	 *
	 * @param string $message The notice message (may contain HTML links).
	 * @param string $link_url URL for the "Manage TCF settings" link.
	 * @param string $link_text Link text for the settings link.
	 *
	 * @return string
	 */
	protected function get_tcf_notice( $message, $link_url = '', $link_text = '' ) {
		$link = '';
		if ( ! empty( $link_url ) ) {
			$link = sprintf(
				' <a href="%1$s">%2$s &rarr;</a>',
				esc_url( $link_url ),
				esc_html( $link_text )
			);
		}
		return sprintf(
			'<div class="wpconsent-tcf-notice" role="status"><span class="dashicons dashicons-info-outline" aria-hidden="true"></span><span>%1$s%2$s</span></div>',
			wp_kses_post( $message ),
			$link // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);
	}

	/**
	 * Get a checkbox wrapped with markup to be displayed as a toggle.
	 *
	 * @param bool       $checked Is it checked or not.
	 * @param string     $name The name for the input.
	 * @param string     $description Field description (optional).
	 * @param string|int $value Field value (optional).
	 * @param string     $label Field label (optional).
	 * @param string     $target Target element to update when the checkbox is checked.
	 *
	 * @return string
	 */
	public function get_checkbox_toggle( $checked, $name, $description = '', $value = '', $label = '', $target = '' ) {
		$markup = '<label class="wpconsent-checkbox-toggle">';

		$markup .= '<input type="checkbox" ' . checked( $checked, true, false ) . ' name="' . esc_attr( $name ) . '" id="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" data-target="' . esc_attr( $target ) . '" />';
		$markup .= '<span class="wpconsent-checkbox-toggle-slider"></span>';
		$markup .= '</label>';
		if ( ! empty( $label ) ) {
			$markup .= '<label class="wpconsent-checkbox-toggle-label" for="' . esc_attr( $name ) . '">' . esc_html( $label ) . '</label>';
		}

		if ( ! empty( $description ) ) {
			$markup .= '<p class="description">' . wp_kses_post( $description ) . '</p>';
		}

		return $markup;
	}

	/**
	 * Get the full URL for a view of an admin page.
	 *
	 * @param string $view The view slug.
	 *
	 * @return string
	 */
	public function get_view_link( $view ) {
		return add_query_arg(
			array(
				'page' => $this->page_slug,
				'view' => $view,
			),
			$this->admin_url( 'admin.php' )
		);
	}

	/**
	 * Get a textarea field.
	 *
	 * @param string $id The id of the select field.
	 * @param string $value The value of the textarea field.
	 * @param string $description The description of the textarea field.
	 * @param bool   $wide Whether the textarea field should be wide.
	 * @param array  $attributes Additional attributes for the textarea field.
	 *
	 * @return string
	 */
	public function get_input_textarea( $id, $value = '', $description = '', $wide = false, $attributes = array() ) {
		$class = 'wpconsent-input-textarea wpconsent-regular-text';
		if ( $wide ) {
			$class .= ' wpconsent-wide-text';
		}
		$attributes_string = '';
		foreach ( $attributes as $key => $attribute_value ) {
			$attributes_string .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $attribute_value ) );
		}
		$markup = '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" class="' . esc_attr( $class ) . '" ' . $attributes_string . '>' . esc_textarea( $value ) . '</textarea>';
		if ( ! empty( $description ) ) {
			$markup .= '<p>' . wp_kses_post( $description ) . '</p>';
		}

		return $markup;
	}

	/**
	 * Get an email field.
	 *
	 * @param string $id The id of the text field.
	 * @param string $value The value of the text field.
	 * @param string $description The description of the text field.
	 * @param bool   $wide Whether the text field should be wide.
	 *
	 * @return string
	 */
	public function get_input_email( $id, $value = '', $description = '', $wide = false ) {
		return $this->get_input_text( $id, $value, $description, $wide, 'email' );
	}

	/**
	 * Get a number field.
	 *
	 * @param string $id The id of the text field.
	 * @param string $value The value of the text field.
	 * @param string $description The description of the text field.
	 * @param bool   $wide Whether the text field should be wide.
	 *
	 * @return string
	 */
	public function get_input_number( $id, $value = '', $description = '', $wide = false ) {
		return $this->get_input_text( $id, $value, $description, $wide, 'number' );
	}

	/**
	 * Get a text field markup.
	 *
	 * @param string $id The id of the text field.
	 * @param string $value The value of the text field.
	 * @param string $description The description of the text field.
	 * @param bool   $wide Whether the text field should be wide.
	 * @param string $type The type of the text field.
	 * @param array  $attributes Additional attributes for the input field.
	 *
	 * @return string
	 */
	public function get_input_text( $id, $value = '', $description = '', $wide = false, $type = 'text', $attributes = array() ) {
		$allowed_types = array(
			'text',
			'email',
			'url',
			'number',
			'password',
		);
		if ( in_array( $type, $allowed_types, true ) ) {
			$type = esc_attr( $type );
		} else {
			$type = 'text';
		}
		$class = 'wpconsent-regular-text';
		if ( $wide ) {
			$class .= ' wpconsent-wide-text';
		}
		$class .= ' wpconsent-input-' . $type;

		$attributes_string = '';
		foreach ( $attributes as $key => $attribute_value ) {
			$attributes_string .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $attribute_value ) );
		}
		$markup = '<input type="' . esc_attr( $type ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" value="' . esc_attr( $value ) . '" class="' . esc_attr( $class ) . '" autocomplete="off" ' . $attributes_string . '>';
		if ( ! empty( $description ) ) {
			$markup .= '<p>' . wp_kses_post( $description ) . '</p>';
		}

		return $markup;
	}

	/**
	 * Get the page URL for any wpconsent page by its slug.
	 *
	 * @param string $slug The page slug.
	 * @param string $view The view slug.
	 *
	 * @return string
	 */
	public function get_page_url( $slug, $view = '' ) {
		$args = array(
			'page' => $slug,
		);
		if ( ! empty( $view ) ) {
			$args['view'] = $view;
		}

		return add_query_arg(
			$args,
			$this->admin_url( 'admin.php' )
		);
	}

	/**
	 * Whether the active license unlocks a given level.
	 *
	 * Lite has no license object at all, so this answers false there.
	 *
	 * @param string $level One of basic, plus, pro, elite, bundle.
	 *
	 * @return bool
	 */
	protected function license_can( $level ) {
		if ( ! isset( wpconsent()->license ) || ! method_exists( wpconsent()->license, 'license_can' ) ) {
			return false;
		}

		return wpconsent()->license->license_can( $level, is_multisite() && is_network_admin() );
	}

	/**
	 * Get an enhanced select, matching the other settings screens.
	 *
	 * @param string $id       Field name, also the id unless one is given.
	 * @param array  $options  Value => label map.
	 * @param mixed  $selected The selected value.
	 * @param string $input_id Optional id, when it differs from the field name.
	 *
	 * @return string
	 */
	public function get_choices_select( $id, $options, $selected, $input_id = '' ) {
		$markup = sprintf(
			'<select name="%1$s" id="%2$s" class="wpconsent-choices" data-remove-item="false">',
			esc_attr( $id ),
			esc_attr( empty( $input_id ) ? $id : $input_id )
		);

		foreach ( $options as $value => $label ) {
			$markup .= sprintf(
				'<option value="%1$s" %2$s>%3$s</option>',
				esc_attr( $value ),
				selected( $selected, $value, false ),
				esc_html( $label )
			);
		}

		return $markup . '</select>';
	}

	/**
	 * Output a separator row in a metabox.
	 *
	 * @return void
	 */
	public function metabox_row_separator() {
		?>
		<div class="wpconsent-metabox-form-row wpconsent-metabox-form-row-separator"></div>
		<?php
	}

	/**
	 * Get an upsell box markup.
	 *
	 * @param string $title The main upsell box title.
	 * @param string $text The text displayed under the title.
	 * @param string $button_1 The main CTA button.
	 * @param string $button_2 The text link below the main CTA.
	 * @param array  $features A list of features to display below the text.
	 *
	 * @return string
	 */
	public static function get_upsell_box( $title, $text = '', $button_1 = array(), $button_2 = array(), $features = array() ) {

		$container_class = array(
			'wpconsent-upsell-box',
		);

		if ( ! empty( $features ) ) {
			$container_class[] = 'wpconsent-upsell-box-with-features';
		}

		$html = sprintf(
			'<div class="%s">',
			esc_attr( implode( ' ', $container_class ) )
		);

		$html .= '<div class="wpconsent-upsell-text-content">';

		$html .= sprintf(
			'<h2>%s</h2>',
			wp_kses_post( $title )
		);

		if ( ! empty( $text ) ) {
			$html .= sprintf(
				'<div class="wpconsent-upsell-text">%s</div>',
				wp_kses_post( $text )
			);
		}

		if ( ! empty( $features ) ) {
			$html .= '<ul class="wpconsent-upsell-features">';
			foreach ( $features as $feature ) {
				$html .= sprintf(
					'<li class="wpconsent-upsell-feature">%s</li>',
					wp_kses_post( $feature )
				);
			}
			$html .= '</ul>';
		}
		$button_1 = wp_parse_args(
			$button_1,
			array(
				'tag'        => 'a',
				'text'       => '',
				'url'        => wpconsent_utm_url( 'https://wpconsent.com/lite/' ),
				'class'      => 'wpconsent-button wpconsent-button-orange wpconsent-button-large',
				'attributes' => array(
					'target' => '_blank',
				),
			)
		);
		$button_2 = wp_parse_args(
			$button_2,
			array(
				'tag'        => 'a',
				'text'       => '',
				'url'        => wpconsent_utm_url( 'https://wpconsent.com/lite/' ),
				'class'      => 'wpconsent-upsell-button-text',
				'attributes' => array(
					'target' => '_blank',
				),
			)
		);

		$html .= '</div>'; // .wpconsent-upsell-text-content
		$html .= '<div class="wpconsent-upsell-buttons">';

		if ( ! empty( $button_1['text'] ) ) {
			$html .= self::get_list_item_button( $button_1, false );
		}

		if ( ! empty( $button_2['text'] ) ) {
			$html .= '<br />';
			$html .= self::get_list_item_button( $button_2, false );
		}

		$html .= '</div>'; // .wpconsent-upsell-buttons

		$html .= '</div>';

		return $html;
	}

	/**
	 * Get a button for the list of items.
	 *
	 * @param array $args Arguments for the button.
	 * @param bool  $echo_output (optional) Whether to echo the button or return it.
	 *
	 * @return void|string
	 */
	public static function get_list_item_button( $args, $echo_output = true ) {
		$button_settings = wp_parse_args(
			$args,
			array(
				'tag'        => 'button',
				'url'        => '',
				'text'       => '',
				'class'      => 'wpconsent-button',
				'attributes' => array(),
			)
		);

		if ( empty( $button_settings['text'] ) ) {
			return;
		}

		$button_settings['class'] = esc_attr( $button_settings['class'] );

		$parsed_attributes = "class='{$button_settings['class']}' ";
		if ( ! empty( $button_settings['url'] ) && 'a' === $button_settings['tag'] ) {
			$parsed_attributes .= 'href="' . esc_url( $button_settings['url'] ) . '" ';
		}
		if ( ! empty( $button_settings['attributes'] ) ) {
			foreach ( $button_settings['attributes'] as $key => $value ) {
				$parsed_attributes .= esc_attr( $key ) . '="' . esc_attr( $value ) . '"';
			}
		}

		if ( $echo_output ) {
			printf(
				'<%1$s %2$s>%3$s</%1$s>',
				$button_settings['tag'], // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				$parsed_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				wp_kses( $button_settings['text'], wpconsent_get_icon_allowed_tags() )
			);
		} else {
			return sprintf(
				'<%1$s %2$s>%3$s</%1$s>',
				$button_settings['tag'], // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				$parsed_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				wp_kses( $button_settings['text'], wpconsent_get_icon_allowed_tags() )
			);
		}
	}
}
