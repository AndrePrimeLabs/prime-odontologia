<?php

namespace Manage\Modules\Settings\Components;

use Manage\Classes\Utils;
use Manage\Modules\Core\Components\Pointers;
use Manage\Modules\Connect\Module as Connect;
use Manage\Modules\Settings\Module as Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Pointer {

	const CURRENT_POINTER_SLUG = 'manage-settings';

	public function admin_print_script() {
		if ( Connect::is_elementor_one() ) {
			return;
		}

		if ( ! Utils::user_is_admin() ) {
			return;
		}

		if ( Pointers::is_dismissed( self::CURRENT_POINTER_SLUG ) ) {
			return;
		}

		wp_enqueue_script( 'wp-util' );
		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );

		$pointer_content = '<h3>' . esc_html__( 'Manage', 'manage' ) . '</h3>';
		$pointer_content .= '<p>' . esc_html__( 'Connect your site in Site management settings to manage it from your Elementor dashboard.', 'manage' ) . '</p>';

		$pointer_content .= sprintf(
			'<p><a class="button button-primary manage-pointer-settings-link" href="%s">%s</a></p>',
			admin_url( 'admin.php?page=' . Settings::SETTING_BASE_SLUG ),
			esc_html__( 'Open settings', 'manage' )
		);

		$allowed_tags = [
			'h3' => [],
			'p' => [],
			'a' => [
				'class' => [],
				'href' => [],
			],
		];
		?>
		<script>
			const onManageSettingsPointerClose = () => {
				return wp.ajax.post( 'manage_pointer_dismissed', {
					data: {
						pointer: '<?php echo esc_attr( static::CURRENT_POINTER_SLUG ); ?>',
					},
					nonce: '<?php echo esc_attr( wp_create_nonce( 'manage-pointer-dismissed' ) ); ?>',
				} );
			};

			jQuery( document ).ready( function( $ ) {
				$( '#toplevel_page_elementor-home' ).pointer( {
					content: '<?php echo wp_kses( $pointer_content, $allowed_tags ); ?>',
					pointerClass: 'manage-settings-pointer',
					position: {
						edge: 'top',
						align: 'left',
						at: 'left+20 bottom',
						my: 'left top'
					},
					close: onManageSettingsPointerClose,
				} ).pointer( 'open' );

				$( '.manage-pointer-settings-link' ).first().on( 'click', function( e ) {
					e.preventDefault();

					$( this ).attr( 'disabled', true );

					onManageSettingsPointerClose().promise().done( () => {
						location = $( this ).attr( 'href' );
					} );
				} );
			} );
		</script>

		<style>
			.manage-settings-pointer .wp-pointer-content h3::before {
				content: '';
				background: transparent;
				border-radius: 0;
				background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCA2Ljk1N2EyLjc4MyAyLjc4MyAwIDAgMSAyLjc4MyAtMi43ODNoMjIuMjYxYTIuNzgzIDIuNzgzIDAgMCAxIDIuNzgzIDIuNzgzdjIyLjI2MWEyLjc4MyAyLjc4MyAwIDAgMSAtMi43ODMgMi43ODNIMi43ODNhMi43ODMgMi43ODMgMCAwIDEgLTIuNzgzIC0yLjc4M3oiIGZpbGw9IiNmYWU4ZmYiLz48ZyBjbGlwLXBhdGg9InVybCgjYSkiIGZpbGw9IiNlZDAxZWUiPjxwYXRoIGQ9Ik0xMy45MDMgMTUuMTZhMC41MjIgMC41MjIgMCAwIDEgMC40OTUgMC4zNTdsMC43MSAyLjEyOWgyLjExYTAuNTIyIDAuNTIyIDAgMCAxIDAgMS4wNDNoLTIuNDg2YTAuNTIyIDAuNTIyIDAgMCAxIC0wLjQ5NSAtMC4zNTZsLTAuMzM0IC0xLjAwMiAtMS4xNjIgMy40ODdhMC41MjIgMC41MjIgMCAwIDEgLTAuOTI5IDAuMTI0bC0xLjUwMyAtMi4yNTNIOC45MzJhMC41MjIgMC41MjIgMCAwIDEgMCAtMS4wNDNoMS42NTdsMC4wNjUgMC4wMDRhMC41MjIgMC41MjIgMCAwIDEgMC4zNjkgMC4yMjhsMS4wNjYgMS41OTggMS4zMiAtMy45NTkgMC4wMzMgLTAuMDc3YTAuNTIyIDAuNTIyIDAgMCAxIDAuNDYzIC0wLjI4Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOS4zNDEgMTAuMjU5YTIuNjA5IDIuNjA5IDAgMCAxIDIuNjA5IDIuNjA5djUuMjU0YTIuNjA5IDIuNjA5IDAgMCAxIC0yLjE4OSAyLjU3NHYwLjM2OWEyLjYwOSAyLjYwOSAwIDAgMSAtMi42MDkgMi42MDloLTMuNjl2MS4wM2EwLjU1NyAwLjU1NyAwIDAgMSAtMC4wMjkgMC4xNjhoMi43OTdhMC41MjIgMC41MjIgMCAwIDEgMCAxLjA0M2gtNi41NzZhMC41MjIgMC41MjIgMCAwIDEgMCAtMS4wNDNoMi43OTRhMC41NTcgMC41NTcgMCAwIDEgLTAuMDMgLTAuMTY3VjIzLjY3M0g4LjczYTIuNjA5IDIuNjA5IDAgMCAxIC0yLjYwOSAtMi42MDl2LTUuNzk0YTIuNjA5IDIuNjA5IDAgMCAxIDIuMzQ4IC0yLjU5NSAyLjYwOSAyLjYwOSAwIDAgMSAyLjYwMiAtMi40MTV6bS0xMC42MTEgMy40NDZhMS41NjUgMS41NjUgMCAwIDAgLTEuNTY1IDEuNTY1djUuNzk1YTEuNTY1IDEuNTY1IDAgMCAwIDEuNTY1IDEuNTY1aDguNDIzYTEuNTY1IDEuNTY1IDAgMCAwIDEuNTY1IC0xLjU2NXYtNS43OTVhMS41NjUgMS41NjUgMCAwIDAgLTEuNTY1IC0xLjU2NXptMi4zNCAtMi40MDJhMS41NjUgMS41NjUgMCAwIDAgLTEuNTUgMS4zNTloNy42MzNhMi42MDkgMi42MDkgMCAwIDEgMi42MDkgMi42MDl2NC4zNThhMS41NjUgMS41NjUgMCAwIDAgMS4xNDUgLTEuNTA2di01LjI1NGExLjU2NSAxLjU2NSAwIDAgMCAtMS41NjUgLTEuNTY1eiIvPjwvZz48bWFzayBpZD0iYiIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjE4IiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTkiPjxwYXRoIGQ9Ik0zMiAwSDE4Ljc4M3YxMy4yMTdoMTMuMjE3eiIgZmlsbD0iI2ZmZiIvPjwvbWFzaz48ZyBtYXNrPSJ1cmwoI2IpIj48cGF0aCBkPSJNMjguODkgMy4xMUgyMS44OTJ2Ni45OThoNi45OTh6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI1LjM5MSAwQTYuNjA3IDYuNjA3IDAgMCAwIDE4Ljc4MyA2LjYwOWMwIDMuNjUxIDIuOTU3IDYuNjA5IDYuNjA5IDYuNjA5IDMuNjUxIDAgNi42MDkgLTIuOTU3IDYuNjA5IC02LjYwOVMyOS4wNDEgMCAyNS4zOTEgMG0tMS45ODMgOS45MTNoLTEuMzIydi02LjYwOWgxLjMyMnptNS4yODcgMGgtMy45NjV2LTEuMzIyaDMuOTY1em0wIC0yLjY0M2gtMy45NjV2LTEuMzIyaDMuOTY1em0wIC0yLjY0M2gtMy45NjV2LTEuMzIyaDMuOTY1eiIgZmlsbD0iI2VkMDFlZSIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik01LjU2NSA5LjczOWgxNi42OTZ2MTYuNjk2SDUuNTY1eiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg==');
			}
		</style>
		<?php
	}

	public function __construct() {
		add_action( 'in_admin_header', [ $this, 'admin_print_script' ] );
	}
}
