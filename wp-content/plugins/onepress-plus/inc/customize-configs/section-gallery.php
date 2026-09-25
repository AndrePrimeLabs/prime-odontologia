<?php
class Onepress_Section_Gallery extends Onepress_Section_Base {
	function get_info() {

	}
	/**
	 * @param $wp_customize WP_Customize_Manager
	 */
	function wp_customize( $wp_customize ) {

		// Gallery.
		// Source facebook settings.
		$wp_customize->add_setting(
			'onepress_gallery_source_facebook',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_gallery_source_facebook',
			array(
				'label'       => esc_html__( 'Facebook Fan Page Album', 'onepress-plus' ),
				'priority'    => 15,
				'section'     => 'onepress_gallery_content',
				'description' => esc_html__( 'Enter Facebook fan page album ID or album URL here. Your album should publish to load data.', 'onepress-plus' ),
			)
		);

		// Source flickr API settings.
		$wp_customize->add_setting(
			'onepress_gallery_api_facebook',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_gallery_api_facebook',
			array(
				'label'       => esc_html__( 'Facebook Access Token', 'onepress-plus' ),
				'section'     => 'onepress_gallery_content',
				'priority'    => 20,
				'description' => sprintf( esc_html__( 'Paste your Facebook User Token here. Click %1$s to create an app and then %2$s.', 'onepress-plus' ), '<a target="_blank" href="https://developers.facebook.com/apps/">' . esc_html( 'here', 'onepress-plus' ) . '</a>', '<a target="_blank" href="https://developers.facebook.com/tools/accesstoken/">' . esc_html( 'get user token', 'onepress-plus' ) . '</a>' ),
			)
		);

		// Source flickr settings.
		$wp_customize->add_setting(
			'onepress_gallery_source_flickr',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_gallery_source_flickr',
			array(
				'label'       => esc_html__( 'Flickr Username or ID', 'onepress-plus' ),
				'section'     => 'onepress_gallery_content',
				'priority'    => 25,
				'description' => esc_html__( 'Flickr Username or ID here, Required Flickr API.', 'onepress-plus' ),
			)
		);

		// Source flickr API settings.
		$wp_customize->add_setting(
			'onepress_gallery_api_flickr',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_gallery_api_flickr',
			array(
				'label'       => esc_html__( 'Flickr API key', 'onepress-plus' ),
				'section'     => 'onepress_gallery_content',
				'priority'    => 30,
				'description' => esc_html__( 'Paste your Flickr API key here.', 'onepress-plus' ),
			)
		);

		// Source instagram settings.
		/*
		$wp_customize->add_setting(
			'onepress_gallery_source_instagram',
			array(
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);
		$wp_customize->add_control(
			'onepress_gallery_source_instagram',
			array(
				'label'       => esc_html__( 'Instagram Username', 'onepress-plus' ),
				'section'     => 'onepress_gallery_content',
				'priority'    => 35,
				'description' => esc_html__( 'Enter your Instagram username here.', 'onepress-plus' ),
			)
		);*/
		$wp_customize->add_setting(
			'onepress_gallery_source_instagram',
			array(
				'default' => '',
			)
		);

		$wp_customize->add_control(
			new Onepress_Plus_Instagram_Login_Control(
				$wp_customize,
				'onepress_gallery_source_instagram',
				array(
					'section'  => 'onepress_gallery_content',
					'settings' => 'onepress_gallery_source_instagram',
					'priority' => 10,
				)
			)
		);

		// End Gallery.
	}
}

Onepress_Customize::get_instance()->add_section( 'gallery', 'Onepress_Section_Gallery' );

if ( class_exists( 'WP_Customize_Control' ) ) {
	class Onepress_Plus_Instagram_Login_Control extends WP_Customize_Control {
		public $type = 'instagram_login';
		/**
		 * Render the control's content.
		 */
		public function render_content() {
			$current_user_profile = get_option( 'pm_instagram_current_user_profile', array() );
			?>
			<div class="pm-instagram-settings">
				<?php
				if ( is_array( $current_user_profile ) && ! empty( $current_user_profile ) ) {
					$wp_nonce = wp_create_nonce( 'remove_inst_account' );
					?>
						<div class="pm-instagram-user">
						<?php
						if ( isset( $current_user_profile['username'] ) && ! empty( $current_user_profile['username'] ) ) {
							$profile_link = sprintf( '%s/%s', 'https://www.instagram.com', str_replace( '@', '', $current_user_profile['username'] ) );
							?>
								<div class="pm-inst-info">
									<div class="pm-inst-fullname">
										<a href="<?php echo esc_url( $profile_link ); ?>" target="_blank"><?php echo esc_html( $current_user_profile['id'] ); ?></a>
									</div>
									<?php if ( isset( $current_user_profile['username'] ) && ! empty( $current_user_profile['username'] ) ) { ?>
										<div class="pm-inst-username"><?php echo sprintf( '@%s', esc_html( $current_user_profile['username'] ) ); ?></div>
									<?php } ?>
								</div>
							<?php } ?>
							<script type="text/javascript">
								function pm_instagram_confirm_remove_account() {
									var sure = confirm('<?php esc_attr_e( 'Are you sure to remove this account?', 'screenr-plus' ); ?>');
									if ( sure ) {
										var admin_url = '<?php echo esc_url( admin_url( 'admin.php' ) ); ?>';
										var concat_var = '?';
										if ( -1 !== admin_url.indexOf( '?' ) ) {
											concat_var = '&';
										}
										var delete_token_url = admin_url + concat_var + 'pm_action=remove_inst_account&_wp_nonce=<?php echo esc_js( $wp_nonce ); ?>';
										if ( '' !== delete_token_url ) {
											window.location.href = delete_token_url;
										}
									}
								}
							</script>
							<a href="#" class="button button-secondary" onClick="pm_instagram_confirm_remove_account();"><?php esc_html_e( 'Remove Instagram Account', 'screenr-plus' ); ?></a>
						</div>
						<?php
				} else {
					$url = Onepress_Plus_Instagram::get_api_connect_uri();
					?>
					<a href="<?php echo esc_url( $url ); ?>" class="button button-primary"><?php esc_html_e( 'Connect Instagram Account', 'screenr-plus' ); ?></a>
				<?php } ?>
			</div>
			<?php
		}
	}
}
