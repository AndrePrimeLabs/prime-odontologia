<?php
/**
 * Admin paged used to configure the banner styles.
 *
 * @package WPConsent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WPConsent_Admin_Page_Banner.
 */
class WPConsent_Admin_Page_Banner extends WPConsent_Admin_Page {

	use WPConsent_Input_Select;
	use WPConsent_Input_Colorpicker;
	use WPConsent_Input_WYSIWYG;
	use WPConsent_Input_Media;
	use WPConsent_Input_Image_Radio;
	use WPConsent_Banner_Preview;

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	public $page_slug = 'wpconsent-banner';

	/**
	 * Default view.
	 *
	 * @var string
	 */
	public $view = 'layout';

	/**
	 * Call this just to set the page title translatable.
	 */
	public function __construct() {
		$this->page_title = __( 'Banner Design', 'wpconsent-cookies-banner-privacy-suite' );
		parent::__construct();
	}

	/**
	 * Page scripts.
	 *
	 * @return void
	 */
	public function page_scripts() {
		// Enqueue sortable.
		wp_enqueue_script( 'jquery-ui-sortable' );
		// Media.
		wp_enqueue_media();
	}

	/**
	 * Page hooks.
	 *
	 * @return void
	 */
	public function page_hooks() {
		add_action( 'admin_init', array( $this, 'save_settings' ) );

		$this->views = array(
			'layout'  => array(
				'label' => __( 'Layout', 'wpconsent-cookies-banner-privacy-suite' ),
				'icon'  => array(
					'slug'   => 'layout',
					'width'  => 18,
					'height' => 18,
				),
			),
			'style'   => array(
				'label' => __( 'Style', 'wpconsent-cookies-banner-privacy-suite' ),
				'icon'  => array(
					'slug'   => 'style',
					'width'  => 20,
					'height' => 19,
				),
			),
			'content' => array(
				'label' => __( 'Content', 'wpconsent-cookies-banner-privacy-suite' ),
				'icon'  => array(
					'slug'   => 'content',
					'width'  => 20,
					'height' => 22,
				),
			),
		);

		add_filter( 'wpconsent_admin_js_data', array( $this, 'banner_preview_scripts' ) );
	}

	/**
	 * Get the current tab label.
	 *
	 * @return string
	 */
	public function get_tab_label() {
		$label = '';
		if ( isset( $this->views[ $this->view ] ) ) {
			$label = $this->views[ $this->view ]['label'];
		}

		return $label;
	}

	/**
	 * Page content.
	 *
	 * @return void
	 */
	public function output_content() {
		$this->metabox(
		// translators: %s: The name of the current tab: Layout, Style or Content.
			sprintf( esc_html__( '%s Settings', 'wpconsent-cookies-banner-privacy-suite' ), $this->get_tab_label() ),
			$this->banner_styles_fields()
		);
		wp_nonce_field( 'wpconsent_save_banner_settings', 'wpconsent_banner_settings_nonce' );
		?>
		<div class="wpconsent-submit">
			<?php if ( 'content' === $this->view ) : ?>
				<label class="wpconsent-inline-styled-checkbox">
					<span class="wpconsent-styled-checkbox checked">
						<input type="checkbox" name="enable_consent_banner" checked/>
					</span>
					<?php esc_html_e( 'Show Banner on Frontend', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</label>
			<?php endif; ?>
			<?php if ( 'layout' !== $this->view ) : ?>
				<a href="<?php echo esc_url( $this->get_previous_view_link() ); ?>" class="wpconsent-button wpconsent-button-secondary">
					<?php wpconsent_icon( 'chevron-left', 5, 8 ); ?>
					<?php esc_html_e( 'Back', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</a>
			<?php endif; ?>
			<?php if ( 'content' !== $this->view ) : ?>
				<button type="submit" name="save_changes" class="wpconsent-button wpconsent-button-secondary wpconsent-button-icon-right" value="save_continue">
					<?php esc_html_e( 'Save & Continue', 'wpconsent-cookies-banner-privacy-suite' ) . wpconsent_icon( 'chevron-right', 4, 7, '0 0 7 12' ); ?>
				</button>
			<?php endif; ?>
			<?php if ( 'content' === $this->view ) : ?>
				<button type="submit" name="save_changes" class="wpconsent-button wpconsent-button-secondary" value="save">
					<?php esc_html_e( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</button>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Banner styles fields.
	 *
	 * @return string
	 */
	public function banner_styles_fields() {
		ob_start();

		$view_method = 'output_view_' . $this->view;
		if ( method_exists( $this, $view_method ) ) {
			$this->$view_method();
		}

		return ob_get_clean();
	}

	/**
	 * Get the TCF notice for the Banner Layout section.
	 *
	 * Returns an empty string by default. Pro classes override this when IAB TCF is enabled.
	 *
	 * @return string
	 */
	protected function get_tcf_layout_notice() {
		return '';
	}

	/**
	 * Get the TCF notice for the Banner Content section.
	 *
	 * Returns an empty string by default. Pro classes override this when IAB TCF is enabled.
	 *
	 * @return string
	 */
	protected function get_tcf_content_notice() {
		return '';
	}

	/**
	 * Output the layout view.
	 *
	 * @return void
	 */
	public function output_view_layout() {
		echo $this->get_tcf_layout_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		$this->metabox_row(
			esc_html__( 'Layout', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->image_radio(
				'banner_layout',
				$this->get_banner_layouts(),
				wpconsent()->settings->get_option( 'banner_layout', 'long' ),
				'large'
			),
			'banner_layout',
			'',
			'',
			'',
			false,
			'',
			$this->is_tcf_field_locked( 'banner_layout' )
		);

		$this->metabox_row(
			esc_html__( 'Position', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->image_radio(
				'banner_long_position',
				array(
					'top'    => array(
						'label' => esc_html__( 'Top', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-long-top.png',
						'width' => 105,
					),
					'bottom' => array(
						'label' => esc_html__( 'Bottom', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-long-bottom.png',
					),
				),
				wpconsent()->settings->get_option( 'banner_position', 'top' )
			),
			'banner_long_position',
			'[name="banner_layout"]',
			'long'
		);

		$this->metabox_row(
			esc_html__( 'Position', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->image_radio(
				'banner_floating_position',
				array(
					'left-top'     => array(
						'label' => esc_html__( 'Left Top', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-floating-left-top.png',
						'width' => 105,
					),
					'right-top'    => array(
						'label' => esc_html__( 'Right Top', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-floating-right-top.png',
					),
					'left-bottom'  => array(
						'label' => esc_html__( 'Left Bottom', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-floating-left-bottom.png',
					),
					'right-bottom' => array(
						'label' => esc_html__( 'Right Bottom', 'wpconsent-cookies-banner-privacy-suite' ),
						'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-floating-right-bottom.png',
					),
				),
				wpconsent()->settings->get_option( 'banner_position', 'left-top' )
			),
			'banner_floating_position',
			'[name="banner_layout"]',
			'floating'
		);
	}

	/**
	 * Get the banner layouts in a method we can override in child classes.
	 *
	 * @return array
	 */
	public function get_banner_layouts() {
		return array(
			'long'     => array(
				'label' => esc_html__( 'Long Banner', 'wpconsent-cookies-banner-privacy-suite' ),
				'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-layout-long.png',
				'width' => 190,
			),
			'floating' => array(
				'label' => esc_html__( 'Floating Banner', 'wpconsent-cookies-banner-privacy-suite' ),
				'img'   => WPCONSENT_PLUGIN_URL . 'admin/images/banner-layout-floating.png',
			),
			'modal'    => array(
				'label'           => esc_html__( 'Modal Banner', 'wpconsent-cookies-banner-privacy-suite' ),
				'img'             => WPCONSENT_PLUGIN_URL . 'admin/images/banner-layout-modal.png',
				'is_pro'          => true,
				'pro_title'       => esc_html__( 'Modal Layout is a Pro Feature', 'wpconsent-cookies-banner-privacy-suite' ),
				'pro_description' => esc_html__( 'Upgrade to WPConsent Pro to unlock the modal banner and improve the consent rate for your website.', 'wpconsent-cookies-banner-privacy-suite' ),
				'pro_link'        => wpconsent_utm_url(
					'https://wpconsent.com/lite/',
					'banner-layout',
					'modal'
				),
			),
		);
	}

	/**
	 * Output the style view.
	 *
	 * @return void
	 */
	public function output_view_style() {
		$this->metabox_row(
			esc_html__( 'Banner', 'wpconsent-cookies-banner-privacy-suite' ),
			'<span class="wpconsent-input-area-description">' . esc_html__( 'This feature allows you to customize the overall appearance of your banner.', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>'
		);
		?>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			$this->metabox_row(
				esc_html__( 'Background Color', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_background_color',
					wpconsent()->settings->get_option( 'banner_background_color', '#FFFFFF' ),
					'.wpconsent-banner-holder .wpconsent-banner',
					'#FFFFFF',
					'background-color'
				),
				'banner_background_color'
			);
			?>
		</div>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			$this->metabox_row(
				esc_html__( 'Text Color', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_text_color',
					wpconsent()->settings->get_option( 'banner_text_color', '#000000' ),
					'.wpconsent-banner-holder .wpconsent-banner',
					'#000000',
					'color'
				),
				'banner_text_color'
			);
			// Font size select.

			$this->metabox_row(
				esc_html__( 'Font Size', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->select(
					'banner_font_size',
					array(
						'12px' => esc_html__( '12px', 'wpconsent-cookies-banner-privacy-suite' ),
						'14px' => esc_html__( '14px', 'wpconsent-cookies-banner-privacy-suite' ),
						'16px' => esc_html__( '16px', 'wpconsent-cookies-banner-privacy-suite' ),
						'18px' => esc_html__( '18px', 'wpconsent-cookies-banner-privacy-suite' ),
						'20px' => esc_html__( '20px', 'wpconsent-cookies-banner-privacy-suite' ),
						'22px' => esc_html__( '22px', 'wpconsent-cookies-banner-privacy-suite' ),
						'24px' => esc_html__( '24px', 'wpconsent-cookies-banner-privacy-suite' ),
						'26px' => esc_html__( '26px', 'wpconsent-cookies-banner-privacy-suite' ),
						'28px' => esc_html__( '28px', 'wpconsent-cookies-banner-privacy-suite' ),
						'30px' => esc_html__( '30px', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					wpconsent()->settings->get_option( 'banner_font_size', '16px' ),
					false,
					'',
					'.wpconsent-banner-body',
					'font-size'
				),
				'banner_font_size'
			);
			?>
		</div>
		<?php
		$this->metabox_row_separator();

		$this->metabox_row(
			esc_html__( 'Buttons', 'wpconsent-cookies-banner-privacy-suite' ),
			'<span class="wpconsent-input-area-description">' . esc_html__( 'Customize the styles of your banner buttons.', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>'
		);
		?>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			// Button size dropdown, small regular large.
			$this->metabox_row(
				esc_html__( 'Button Size', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->select(
					'banner_button_size',
					array(
						'small'   => esc_html__( 'Small', 'wpconsent-cookies-banner-privacy-suite' ),
						'regular' => esc_html__( 'Regular', 'wpconsent-cookies-banner-privacy-suite' ),
						'large'   => esc_html__( 'Large', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					wpconsent()->settings->get_option( 'banner_button_size', 'regular' ),
					false,
					'',
					'.wpconsent-banner-holder .wpconsent-banner-footer',
					'class',
					'wpconsent-button-size-'
				),
				'banner_button_size'
			);
			// Button corner (radius) - select with options like: rounded, slightly rounded, square.
			$this->metabox_row(
				esc_html__( 'Button Corner', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->select(
					'banner_button_corner',
					array(
						'square'           => esc_html__( 'Square', 'wpconsent-cookies-banner-privacy-suite' ),
						'slightly-rounded' => esc_html__( 'Slightly Rounded', 'wpconsent-cookies-banner-privacy-suite' ),
						'rounded'          => esc_html__( 'Rounded', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					wpconsent()->settings->get_option( 'banner_button_corner', 'rounded' ),
					false,
					'',
					'.wpconsent-banner-holder .wpconsent-banner-footer',
					'class',
					'wpconsent-button-corner-'
				),
				'banner_button_corner'
			);
			?>
		</div>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			// Button type options filled, outlined.
			$this->metabox_row(
				esc_html__( 'Button Type', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->select(
					'banner_button_type',
					array(
						'filled'   => esc_html__( 'Filled', 'wpconsent-cookies-banner-privacy-suite' ),
						'outlined' => esc_html__( 'Outlined', 'wpconsent-cookies-banner-privacy-suite' ),
					),
					wpconsent()->settings->get_option( 'banner_button_type', 'filled' ),
					false,
					'',
					'.wpconsent-banner-holder .wpconsent-banner-footer',
					'class',
					'wpconsent-button-type-'
				),
				'banner_button_type'
			);
			?>
		</div>
		<?php
		$this->metabox_row_separator();

		$this->metabox_row(
			esc_html__( 'Button Color', 'wpconsent-cookies-banner-privacy-suite' ),
			'<span class="wpconsent-input-area-description">' . esc_html__( 'Customize button colors.', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>'
		);
		$button_bg_property = 'background-color';
		if ( 'outlined' === wpconsent()->settings->get_option( 'banner_button_type', 'filled' ) ) {
			$button_bg_property = 'border-color';
		}
		?>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			$this->metabox_row(
				esc_html__( 'Accept Background', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_accept_bg',
					wpconsent()->settings->get_option( 'banner_accept_bg', '#E8B13A' ),
					'#wpconsent-accept-all',
					'#04194E',
					$button_bg_property
				),
				'banner_accept_bg'
			);
			$this->metabox_row(
				esc_html__( 'Font Color', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_accept_color',
					wpconsent()->settings->get_option( 'banner_accept_color', '#FFFFFF' ),
					'#wpconsent-accept-all',
					'#FFFFFF',
					'color'
				),
				'banner_accept_color'
			);
			?>
		</div>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			$this->metabox_row(
				esc_html__( 'Cancel Background', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_cancel_bg',
					wpconsent()->settings->get_option( 'banner_cancel_bg', '#FFFFFF' ),
					'#wpconsent-cancel-all',
					'#04194E',
					$button_bg_property
				),
				'banner_cancel_bg'
			);
			$this->metabox_row(
				esc_html__( 'Font Color', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_cancel_color',
					wpconsent()->settings->get_option( 'banner_cancel_color', '#FFFFFF' ),
					'#wpconsent-cancel-all',
					'#FFFFFF',
					'color'
				),
				'banner_cancel_color'
			);
			?>
		</div>
		<div class="wpconsent-metabox-row-2columns">
			<?php
			$this->metabox_row(
				esc_html__( 'Customize Background', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_preferences_bg',
					wpconsent()->settings->get_option( 'banner_preferences_bg', '#04194E' ),
					'#wpconsent-preferences-all',
					'#04194E',
					$button_bg_property
				),
				'banner_preferences_bg'
			);
			$this->metabox_row(
				esc_html__( 'Font Color', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->colorpicker(
					'banner_preferences_color',
					wpconsent()->settings->get_option( 'banner_preferences_color', '#FFFFFF' ),
					'#wpconsent-preferences-all',
					'#FFFFFF',
					'color'
				),
				'banner_preferences_color'
			);
			?>
		</div>
		<?php
		if ( wpconsent()->settings->get_option( 'enable_consent_floating' ) ) {
			$this->metabox_row_separator();

			$this->metabox_row(
				esc_html__( 'Floating Settings Button Design', 'wpconsent-cookies-banner-privacy-suite' ),
				'<span class="wpconsent-input-area-description">' . esc_html__( 'Customize the appearance of the floating settings button that appears on your website.', 'wpconsent-cookies-banner-privacy-suite' ) . '</span>'
			);
			?>
			<div class="wpconsent-metabox-form-row">
				<div class="wpconsent-metabox-form-row-label">
					<label><?php esc_html_e( 'Button Icon', 'wpconsent-cookies-banner-privacy-suite' ); ?></label>
				</div>
				<div class="wpconsent-metabox-form-row-input">
					<?php
					$background_color = wpconsent()->settings->get_option( 'banner_background_color', '#FFFFFF' );
					$text_color       = wpconsent()->settings->get_option( 'banner_text_color', '#000000' );
					$css_vars         = sprintf(
						'--wpconsent-floating-button-bg: %s; --wpconsent-floating-button-color: %s;',
						esc_attr( $background_color ),
						esc_attr( $text_color )
					);
					?>
					<div class="wpconsent-floating-button-grid" style="<?php echo esc_attr( $css_vars ); ?>">
						<input type="hidden" name="consent_floating_icon" id="consent_floating_icon" value="<?php echo esc_attr( wpconsent()->settings->get_option( 'consent_floating_icon', 'preferences' ) ); ?>">
						<div class="wpconsent-floating-button-preview" data-icon="custom" id="floating-icon-custom">
							<?php
							$icon_value = wpconsent()->settings->get_option( 'consent_floating_icon', 'preferences' );
							if ( filter_var( $icon_value, FILTER_VALIDATE_URL ) ) {
								echo '<img src="' . esc_url( $icon_value ) . '" alt="' . esc_attr__( 'Cookie Settings', 'wpconsent-cookies-banner-privacy-suite' ) . '">';
							}
							?>
							<button type="button" class="wpconsent-media-upload-button">
								<span><?php esc_html_e( 'Your Image', 'wpconsent-cookies-banner-privacy-suite' ); ?></span>
							</button>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="preferences" id="floating-icon-preferences">
							<?php wpconsent_icon( 'preferences', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="settings" id="floating-icon-settings">
							<?php wpconsent_icon( 'settings', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="cookie-icon" id="floating-icon-cookie-icon">
							<?php wpconsent_icon( 'cookie-icon', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="cookie-off" id="floating-icon-cookie-off">
							<?php wpconsent_icon( 'cookie-off', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="lock-icon" id="floating-icon-lock-icon">
							<?php wpconsent_icon( 'lock-icon', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="shield" id="floating-icon-shield">
							<?php wpconsent_icon( 'shield', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="policy" id="floating-icon-policy">
							<?php wpconsent_icon( 'policy', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="list" id="floating-icon-list">
							<?php wpconsent_icon( 'list', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="wrench" id="floating-icon-wrench">
							<?php wpconsent_icon( 'wrench', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="tune" id="floating-icon-tune">
							<?php wpconsent_icon( 'tune', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
						<div class="wpconsent-floating-button-preview" data-icon="pencil" id="floating-icon-pencil">
							<?php wpconsent_icon( 'pencil', 24, 24, '0 -960 960 960', $text_color ); ?>
						</div>
					</div>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Output the content view.
	 *
	 * @return void
	 */
	public function output_view_content() {
		echo $this->get_tcf_content_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		$this->metabox_row(
			esc_html__( 'Message', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->wysiwyg(
				'banner_message',
				wpconsent()->settings->get_option( 'banner_message', wpconsent()->strings->get_string( 'banner_message' ) ),
				'',
				'.wpconsent-banner-body'
			),
			'banner_message',
			'',
			'',
			'',
			false,
			'',
			$this->is_tcf_field_locked( 'banner_message' )
		);
		$this->metabox_row_separator();
		$this->metabox_row(
			esc_html__( 'Buttons', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->buttons_content_fields(),
			'',
			'',
			'',
			'',
			false,
			'',
			$this->is_tcf_field_locked( 'accept_button_text' )
		);
		$this->metabox_row(
			esc_html__( 'Disable Close Button', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_checkbox_toggle(
				wpconsent()->settings->get_option( 'disable_close_button' ),
				'disable_close_button',
				esc_html__( 'Disable the close (x) button in the banner to prevent users from dismissing it without making a choice.', 'wpconsent-cookies-banner-privacy-suite' )
			),
			'disable_close_button'
		);
		$this->metabox_row_separator();

		// Add a title for the preferences panel section.
		echo '<h2 class="wpconsent-preferences-section-title">' . esc_html__( 'Preferences Panel Settings', 'wpconsent-cookies-banner-privacy-suite' ) . '</h2>';

		// Preferences Panel Settings - Accordion.
		echo '<div class="wpconsent-accordion wpconsent-preferences-panel-accordion">';
		echo '<div class="wpconsent-accordion-item">';
		echo '<div class="wpconsent-accordion-header">';
		echo '<h3>' . esc_html__( 'Preferences Panel', 'wpconsent-cookies-banner-privacy-suite' ) . '</h3>';
		echo '<button class="wpconsent-accordion-toggle">';
		echo '<span class="dashicons dashicons-arrow-down-alt2"></span>';
		echo '</button>';
		echo '</div>'; // .wpconsent-accordion-header.
		echo '<div class="wpconsent-accordion-content">'; // Not collapsed by default.

		$this->metabox_row(
			esc_html__( 'Preferences Panel Title', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'preferences_panel_title',
				wpconsent()->settings->get_option( 'preferences_panel_title', wpconsent()->strings->get_string( 'preferences_panel_title' ) ),
				'',
				'preferences_panel_title'
			),
			'preferences_panel_title'
		);
		$this->metabox_row(
			esc_html__( 'Preferences Panel Description', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_textarea(
				'preferences_panel_description',
				wpconsent()->settings->get_option( 'preferences_panel_description', wpconsent()->strings->get_string( 'preferences_panel_description' ) ),
				'',
				'preferences_panel_description'
			),
			'preferences_panel_description',
			'',
			'',
			'',
			false,
			'',
			$this->is_tcf_field_locked( 'preferences_panel_description' )
		);
		$this->metabox_row(
			esc_html__( 'Cookie Policy Title', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'cookie_policy_title',
				wpconsent()->settings->get_option( 'cookie_policy_title', wpconsent()->strings->get_string( 'cookie_policy_title' ) ),
				'',
				'cookie_policy_title'
			),
			'cookie_policy_title'
		);
		$this->metabox_row(
			esc_html__( 'Cookie Policy Text', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_textarea(
				'cookie_policy_text',
				wpconsent()->settings->get_option( 'cookie_policy_text', wpconsent()->strings->get_string( 'cookie_policy_text' ) ),
				sprintf(
				// Translators: %1$s is the cookie policy placeholder ({cookie_policy}), %2$s is the privacy policy placeholder ({privacy_policy}).
					esc_html__( 'This text will appear at the bottom of the Preferences panel. We recommend including the %1$s and %2$s placeholders.', 'wpconsent-cookies-banner-privacy-suite' ),
					'<code>{cookie_policy}</code>',
					'<code>{privacy_policy}</code>'
				) . '<br />' .
				esc_html__( 'The placeholders will be replaced with links to the respective pages as configured in WPConsent and your WordPress Privacy settings.', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookie_policy_text'
			),
			'cookie_policy_text'
		);
		$this->metabox_row(
			esc_html__( 'Save Preferences Button Text', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'save_preferences_button_text',
				wpconsent()->settings->get_option( 'save_preferences_button_text', wpconsent()->strings->get_string( 'save_preferences_button_text' ) ),
				'',
				'save_preferences_button_text'
			),
			'save_preferences_button_text',
			'',
			'',
			'',
			false,
			'',
			$this->is_tcf_field_locked( 'save_preferences_button_text' )
		);
		$this->metabox_row(
			esc_html__( 'Close Button Text', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'close_button_text',
				wpconsent()->settings->get_option( 'close_button_text', wpconsent()->strings->get_string( 'close_button_text' ) ),
				'',
				'close_button_text'
			),
			'close_button_text'
		);

		$this->metabox_row(
			esc_html__( 'Service URL Label', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'cookie_table_header_service_url',
				wpconsent()->settings->get_option( 'cookie_table_header_service_url', wpconsent()->strings->get_string( 'cookie_table_header_service_url' ) ),
				esc_html__( 'The label text for the Service URL in the cookie table.', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookie_table_header_service_url'
			),
			'cookie_table_header_service_url'
		);
		// GPC Settings - only show if respect_gpc is enabled.
		if ( wpconsent()->settings->get_option( 'respect_gpc', 0 ) ) {
			$this->metabox_row(
				esc_html__( 'GPC Honored Message', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_input_text(
					'gpc_toast_message',
					wpconsent()->settings->get_option( 'gpc_toast_message', wpconsent()->strings->get_string( 'gpc_toast_message' ) ),
					esc_html__( 'Message shown in toast notification when GPC signal is honored.', 'wpconsent-cookies-banner-privacy-suite' ),
					'gpc_toast_message'
				),
				'gpc_toast_message'
			);
			$this->metabox_row(
				esc_html__( 'GPC Override Message', 'wpconsent-cookies-banner-privacy-suite' ),
				$this->get_input_textarea(
					'gpc_override_message',
					wpconsent()->settings->get_option( 'gpc_override_message', wpconsent()->strings->get_string( 'gpc_override_message' ) ),
					esc_html__( 'Message users must acknowledge when overriding GPC in the preference panel.', 'wpconsent-cookies-banner-privacy-suite' ),
					'gpc_override_message'
				),
				'gpc_override_message'
			);
		}

		echo '</div>'; // .wpconsent-accordion-content
		echo '</div>'; // .wpconsent-accordion-item

		// Cookie Table Headers Section - Separate accordion item.
		echo '<div class="wpconsent-accordion-item">';
		echo '<div class="wpconsent-accordion-header">';
		echo '<h3>' . esc_html__( 'Cookie Table Headers', 'wpconsent-cookies-banner-privacy-suite' ) . '</h3>';
		echo '<button class="wpconsent-accordion-toggle">';
		echo '<span class="dashicons dashicons-arrow-down-alt2"></span>';
		echo '</button>';
		echo '</div>'; // .wpconsent-accordion-header.
		echo '<div class="wpconsent-accordion-content">'; // Not collapsed by default.

		$this->metabox_row(
			esc_html__( 'Name Header', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'cookie_table_header_name',
				wpconsent()->settings->get_option( 'cookie_table_header_name', wpconsent()->strings->get_string( 'cookie_table_header_name' ) ),
				esc_html__( 'The header text for the Name column in the cookie table.', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookie_table_header_name'
			),
			'cookie_table_header_name'
		);

		$this->metabox_row(
			esc_html__( 'Description Header', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'cookie_table_header_description',
				wpconsent()->settings->get_option( 'cookie_table_header_description', wpconsent()->strings->get_string( 'cookie_table_header_description' ) ),
				esc_html__( 'The header text for the Description column in the cookie table.', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookie_table_header_description'
			),
			'cookie_table_header_description'
		);

		$this->metabox_row(
			esc_html__( 'Duration Header', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_input_text(
				'cookie_table_header_duration',
				wpconsent()->settings->get_option( 'cookie_table_header_duration', wpconsent()->strings->get_string( 'cookie_table_header_duration' ) ),
				esc_html__( 'The header text for the Duration column in the cookie table.', 'wpconsent-cookies-banner-privacy-suite' ),
				'cookie_table_header_duration'
			),
			'cookie_table_header_duration'
		);

		echo '</div>'; // .wpconsent-accordion-content
		echo '</div>'; // .wpconsent-accordion-item
		echo '</div>'; // .wpconsent-accordion

		$this->metabox_row_separator();
		$this->metabox_row(
			esc_html__( 'Logo/Icon', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->media(
				'banner_logo',
				wpconsent()->settings->get_option( 'banner_logo', '' ),
				'',
				'.wpconsent-banner-logo'
			)
		);
		$this->metabox_row_separator();
		$this->metabox_row(
			esc_html__( 'Hide Powered By', 'wpconsent-cookies-banner-privacy-suite' ),
			$this->get_checkbox_toggle(
				wpconsent()->settings->get_option( 'hide_powered_by' ),
				'hide_powered_by',
				esc_html__( 'Hide the "Powered by WPConsent" link in the frontend.', 'wpconsent-cookies-banner-privacy-suite' )
			),
			'hide_powered_by'
		);
	}

	/**
	 * Output the footer.
	 *
	 * @return void
	 */
	public function output_footer() {
		parent::output_footer();

		$this->get_banner_preview();
	}

	/**
	 * Get the banner preview.
	 *
	 * @return void
	 */
	public function get_banner_preview() {
		wpconsent()->banner->output_banner();
	}

	/**
	 * Get the next view based on the passed current view.
	 *
	 * @param string $current_view The current view.
	 *
	 * @return string
	 */
	public function get_next_view( $current_view ) {
		$views = array_keys( $this->views );
		$index = array_search( $current_view, $views, true );
		$next  = isset( $views[ $index + 1 ] ) ? $views[ $index + 1 ] : $views[0];

		return $next;
	}

	/**
	 * Get the URL for the previous view based on the current view.
	 *
	 * @return string
	 */
	public function get_previous_view_link() {
		$views = array_keys( $this->views );
		$index = array_search( $this->view, $views, true );
		$prev  = isset( $views[ $index - 1 ] ) ? $views[ $index - 1 ] : $views[ count( $views ) - 1 ];

		return add_query_arg( 'view', $prev, $this->get_page_action_url() );
	}

	/**
	 * Save settings.
	 *
	 * @return void
	 */
	public function save_settings() {
		if ( isset( $_POST['wpconsent_banner_settings_nonce'] ) && wp_verify_nonce( sanitize_key( $_POST['wpconsent_banner_settings_nonce'] ), 'wpconsent_save_banner_settings' ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			$redirect                = add_query_arg( 'message', 1, $this->get_page_action_url() );
			$button_action           = isset( $_POST['save_changes'] ) ? sanitize_text_field( wp_unslash( $_POST['save_changes'] ) ) : 'save';
			$banner_layout           = isset( $_POST['banner_layout'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_layout'] ) ) : false;
			$banner_background_color = isset( $_POST['banner_background_color'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_background_color'] ) ) : false;
			$banner_message          = isset( $_POST['banner_message'] ) ? wp_kses_post( wp_unslash( $_POST['banner_message'] ) ) : false;

			$current_view = 'layout';

			if ( $banner_layout ) {
				// We're on the layout view.
				$position_input = 'banner_' . $banner_layout . '_position';
				$position       = isset( $_POST[ $position_input ] ) ? sanitize_text_field( wp_unslash( $_POST[ $position_input ] ) ) : false;

				$settings = array(
					'banner_layout'   => $banner_layout,
					'banner_position' => $position,
				);
			}

			if ( $banner_background_color ) {
				// We're on the Style view.
				$banner_text_color = isset( $_POST['banner_text_color'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_text_color'] ) ) : false;
				$banner_font_size  = isset( $_POST['banner_font_size'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_font_size'] ) ) : false;

				$banner_button_size   = isset( $_POST['banner_button_size'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_button_size'] ) ) : false;
				$banner_button_corner = isset( $_POST['banner_button_corner'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_button_corner'] ) ) : false;
				$banner_button_type   = isset( $_POST['banner_button_type'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_button_type'] ) ) : false;

				$banner_accept_bg         = isset( $_POST['banner_accept_bg'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_accept_bg'] ) ) : false;
				$banner_accept_color      = isset( $_POST['banner_accept_color'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_accept_color'] ) ) : false;
				$banner_cancel_bg         = isset( $_POST['banner_cancel_bg'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_cancel_bg'] ) ) : false;
				$banner_cancel_color      = isset( $_POST['banner_cancel_color'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_cancel_color'] ) ) : false;
				$banner_preferences_bg    = isset( $_POST['banner_preferences_bg'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_preferences_bg'] ) ) : false;
				$banner_preferences_color = isset( $_POST['banner_preferences_color'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_preferences_color'] ) ) : false;
				$consent_floating_icon    = isset( $_POST['consent_floating_icon'] ) ? sanitize_text_field( wp_unslash( $_POST['consent_floating_icon'] ) ) : 'preferences';

				$current_view = 'style';

				$settings = array(
					'banner_background_color'  => $banner_background_color,
					'banner_text_color'        => $banner_text_color,
					'banner_font_size'         => $banner_font_size,
					'banner_button_size'       => $banner_button_size,
					'banner_button_corner'     => $banner_button_corner,
					'banner_button_type'       => $banner_button_type,
					'banner_accept_bg'         => $banner_accept_bg,
					'banner_accept_color'      => $banner_accept_color,
					'banner_cancel_bg'         => $banner_cancel_bg,
					'banner_cancel_color'      => $banner_cancel_color,
					'banner_preferences_bg'    => $banner_preferences_bg,
					'banner_preferences_color' => $banner_preferences_color,
					'consent_floating_icon'    => $consent_floating_icon,
				);
			}

			// Content view.
			if ( ! empty( $banner_message ) ) {
				$current_view        = 'content';
				$accept_button       = isset( $_POST['accept_button_text'] ) ? sanitize_text_field( wp_unslash( $_POST['accept_button_text'] ) ) : false;
				$cancel_button       = isset( $_POST['cancel_button_text'] ) ? sanitize_text_field( wp_unslash( $_POST['cancel_button_text'] ) ) : false;
				$settings_button     = isset( $_POST['preferences_button_text'] ) ? sanitize_text_field( wp_unslash( $_POST['preferences_button_text'] ) ) : false;
				$accept_enabled      = isset( $_POST['accept_button_enabled'] );
				$cancel_enabled      = isset( $_POST['cancel_button_enabled'] );
				$preferences_enabled = isset( $_POST['preferences_button_enabled'] );
				$button_order        = isset( $_POST['button_order'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['button_order'] ) ) : array(
					'accept',
					'cancel',
					'preferences',
				);
				$banner_logo         = isset( $_POST['banner_logo'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_logo'] ) ) : '';

				$preferences_panel_title       = isset( $_POST['preferences_panel_title'] ) ? sanitize_text_field( wp_unslash( $_POST['preferences_panel_title'] ) ) : '';
				$preferences_panel_description = isset( $_POST['preferences_panel_description'] ) ? wp_kses_post( wp_unslash( $_POST['preferences_panel_description'] ) ) : '';
				$cookie_policy_title           = isset( $_POST['cookie_policy_title'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_policy_title'] ) ) : '';
				$cookie_policy_text            = isset( $_POST['cookie_policy_text'] ) ? wp_kses_post( wp_unslash( $_POST['cookie_policy_text'] ) ) : '';
				$save_preferences_button_text  = isset( $_POST['save_preferences_button_text'] ) ? sanitize_text_field( wp_unslash( $_POST['save_preferences_button_text'] ) ) : '';
				$close_button_text             = isset( $_POST['close_button_text'] ) ? sanitize_text_field( wp_unslash( $_POST['close_button_text'] ) ) : '';

				// Cookie table headers.
				$cookie_table_header_name        = isset( $_POST['cookie_table_header_name'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_table_header_name'] ) ) : '';
				$cookie_table_header_description = isset( $_POST['cookie_table_header_description'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_table_header_description'] ) ) : '';
				$cookie_table_header_duration    = isset( $_POST['cookie_table_header_duration'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_table_header_duration'] ) ) : '';
				$cookie_table_header_service_url = isset( $_POST['cookie_table_header_service_url'] ) ? sanitize_text_field( wp_unslash( $_POST['cookie_table_header_service_url'] ) ) : '';

				$settings = array(
					'banner_message'                  => $banner_message,
					'accept_button_text'              => $accept_button,
					'cancel_button_text'              => $cancel_button,
					'preferences_button_text'         => $settings_button,
					'accept_button_enabled'           => $accept_enabled,
					'cancel_button_enabled'           => $cancel_enabled,
					'preferences_button_enabled'      => $preferences_enabled,
					'button_order'                    => $button_order,
					'banner_logo'                     => $banner_logo,
					'enable_consent_banner'           => isset( $_POST['enable_consent_banner'] ),
					'disable_close_button'            => isset( $_POST['disable_close_button'] ),
					'hide_powered_by'                 => isset( $_POST['hide_powered_by'] ),
					'preferences_panel_title'         => $preferences_panel_title,
					'preferences_panel_description'   => $preferences_panel_description,
					'cookie_policy_title'             => $cookie_policy_title,
					'cookie_policy_text'              => $cookie_policy_text,
					'save_preferences_button_text'    => $save_preferences_button_text,
					'close_button_text'               => $close_button_text,
					// Cookie table headers.
					'cookie_table_header_name'        => $cookie_table_header_name,
					'cookie_table_header_description' => $cookie_table_header_description,
					'cookie_table_header_duration'    => $cookie_table_header_duration,
					'cookie_table_header_service_url' => $cookie_table_header_service_url,
				);

				// GPC Settings.
				if ( wpconsent()->settings->get_option( 'respect_gpc', 0 ) ) {
					$gpc_toast_message                = isset( $_POST['gpc_toast_message'] ) ? sanitize_text_field( wp_unslash( $_POST['gpc_toast_message'] ) ) : '';
					$gpc_override_message             = isset( $_POST['gpc_override_message'] ) ? wp_kses_post( wp_unslash( $_POST['gpc_override_message'] ) ) : '';
					$settings['gpc_toast_message']    = $gpc_toast_message;
					$settings['gpc_override_message'] = $gpc_override_message;

				}
			}

			if ( 'save_continue' === $button_action ) {
				$redirect = add_query_arg( 'view', $this->get_next_view( $current_view ) );
			}

			if ( ! empty( $settings ) ) {
				wpconsent()->settings->bulk_update_options( $settings );

				// Clear translation strings cache when settings change.
				delete_transient( 'wpconsent_translation_strings' );
			}

			wp_safe_redirect( $redirect );
			exit;
		}
	}

	/**
	 * Override the output method so we can add our form markup for this page.
	 *
	 * @return void
	 */
	public function output() {
		?>
		<form method="post" action="<?php echo esc_url( $this->get_page_action_url() ); ?>">
			<?php
			parent::output();
			?>
		</form>
		<?php
	}

	/**
	 * Content of the bottom row of the header.
	 *
	 * @return void
	 */
	public function output_header_bottom() {
		?>
		<div class="wpconsent-column wpconsent-title-button">
			<ul class="wpconsent-admin-tabs wpconsent-admin-tabs-icons">
				<?php
				$i = 0;
				foreach ( $this->views as $slug => $view ) {
					$class = $this->view === $slug ? 'active' : '';
					if ( 0 !== $i ) {
						?>
						<li class="wpconsent-admin-tabs-separator">
							<?php wpconsent_icon( 'chevron-right', 7, 12 ); ?>
						</li>
						<?php
					}
					?>
					<li>
						<a href="<?php echo esc_url( $this->get_view_link( $slug ) ); ?>" class="<?php echo esc_attr( $class ); ?>">
							<?php wpconsent_icon( $view['icon']['slug'], $view['icon']['width'], $view['icon']['height'] ); ?>
							<?php echo esc_html( $view['label'] ); ?>
						</a>
					</li>
					<?php
					++ $i;
				}
				?>
			</ul>
		</div>
		<div class="wpconsent-column">
			<button class="wpconsent-button wpconsent-button-secondary wpconsent-button-icon" type="button" id="wpconsent-show-banner-preview">
				<?php wpconsent_icon( 'visibility', 14, 10 ); ?>
				<?php esc_html_e( 'Preview', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
			<button class="wpconsent-button" type="submit">
				<?php esc_html_e( 'Save', 'wpconsent-cookies-banner-privacy-suite' ); ?>
			</button>
		</div>
		<?php
	}

	/**
	 * This is a custom field that outputs a list where you can customize buttons using jquery sortable. Each row
	 * has a text input for the button text and a toggle for enabling the button. There is also a hidden input used
	 * for the order of the buttons.
	 *
	 * @return string
	 */
	public function buttons_content_fields() {
		$buttons = array(
			'accept'      => array(
				'label'   => esc_html__( 'Accept Button', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'    => wpconsent()->settings->get_option( 'accept_button_text', wpconsent()->strings->get_string( 'accept_button_text' ) ),
				'enabled' => wpconsent()->settings->get_option( 'accept_button_enabled', true ),
			),
			'cancel'      => array(
				'label'   => esc_html__( 'Reject Button', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'    => wpconsent()->settings->get_option( 'cancel_button_text', wpconsent()->strings->get_string( 'cancel_button_text' ) ),
				'enabled' => wpconsent()->settings->get_option( 'cancel_button_enabled', true ),
			),
			'preferences' => array(
				'label'   => esc_html__( 'Settings Button', 'wpconsent-cookies-banner-privacy-suite' ),
				'text'    => wpconsent()->settings->get_option( 'preferences_button_text', wpconsent()->strings->get_string( 'preferences_button_text' ) ),
				'enabled' => wpconsent()->settings->get_option( 'preferences_button_enabled', true ),
			),
		);

		$button_order = wpconsent()->settings->get_option( 'button_order', array_keys( $buttons ) );
		ob_start();
		?>
		<div class="wpconsent-input-area-description">
			<?php esc_html_e( 'Customize the banner buttons output and order.', 'wpconsent-cookies-banner-privacy-suite' ); ?>
		</div>
		<div class="wpconsent-buttons-config-input">
			<div class="wpconsent-button-row wpconsent-buttons-list-header">
				<div class="wpconsent-button-label-column wpconsent-button-label-header">
					<?php echo esc_html__( 'Title', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
				<div class="wpconsent-button-text-column wpconsent-button-text-header">
					<?php echo esc_html__( 'Button Text', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
				<div class="wpconsent-button-enabled-column wpconsent-button-enabled-header">
					<?php echo esc_html__( 'Status', 'wpconsent-cookies-banner-privacy-suite' ); ?>
				</div>
			</div>
			<div class="wpconsent-buttons-list" id="wpconsent-buttons-list">
				<?php
				foreach ( $button_order as $button_id ) {
					if ( ! isset( $buttons[ $button_id ] ) ) {
						continue;
					}
					$button = $buttons[ $button_id ];
					?>
					<div class="wpconsent-button-row" data-button-id="<?php echo esc_attr( $button_id ); ?>">
						<div class="wpconsent-button-label-column">
							<div class="wpconsent-button-handle">
								<?php wpconsent_icon( 'drag', 16, 6 ); ?>
							</div>
							<label class="wpconsent-button-label">
								<?php echo esc_html( $button['label'] ); ?>
							</label>
						</div>
						<div class="wpconsent-button-text-column">
							<input
									type="text"
									name="<?php echo esc_attr( $button_id ); ?>_button_text"
									value="<?php echo esc_attr( $button['text'] ); ?>"
									class="wpconsent-input-text"
									data-target="#wpconsent-<?php echo esc_attr( $button_id ); ?>-all"
							>
						</div>
						<div class="wpconsent-button-enabled-column">
							<label class="wpconsent-toggle">
								<?php
								echo $this->get_checkbox_toggle( $button['enabled'], $button_id . '_button_enabled', '', '', '', '#wpconsent-' . $button_id . '-all' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								?>
								<span class="wpconsent-toggle-slider"></span>
							</label>
						</div>
						<input
								type="hidden"
								name="button_order[]"
								value="<?php echo esc_attr( $button_id ); ?>"
						>
					</div>
					<?php
				}
				?>
			</div>
		</div>
		<script>
			jQuery( document ).ready( function ( $ ) {
				$( '#wpconsent-buttons-list' ).sortable( {
					handle: '.wpconsent-button-handle',
					update: function ( event, ui ) {
						var order = [];
						$( '.wpconsent-button-row' ).each( function () {
							var buttonId = $( this ).data( 'button-id' );
							order.push( buttonId );

							// Get the preview button using the data-target from the text input
							var previewTarget = $( this ).find( 'input.wpconsent-input-text' ).data( 'target' );
							var $previewButton = $( document.getElementById( 'wpconsent-container' ).shadowRoot.querySelector( previewTarget ) );

							// Move the preview button to match new order
							$previewButton.parent().append( $previewButton );
						} );
					}
				} );
			} );
		</script>
		<?php

		return ob_get_clean();
	}
}
