<?php

function onepress_plus_team_member_socials($member)
{
	$member = wp_parse_args(
		$member,
		array(
			'url'         => '',
			'facebook'    => '',
			'twitter'     => '',
			'google_plus' => '',
			'linkedin'    => '',
			'email'       => '',
		)
	);
?>
	<div class="member-profile">
		<?php if ($member['url'] != '') { ?>
			<a href="<?php echo esc_url($member['url']); ?>"><span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-globe fa-stack-1x fa-inverse"></i></span></a>
		<?php } ?>
		<?php if ($member['twitter'] != '') { ?>
			<a href="<?php echo esc_url($member['twitter']); ?>"><span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa-brands fa-x-twitter fa-stack-1x fa-inverse"></i></span></a>
		<?php } ?>
		<?php if ($member['facebook'] != '') { ?>
			<a href="<?php echo esc_url($member['facebook']); ?>"><span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-facebook fa-stack-1x fa-inverse"></i></span></a>
		<?php } ?>
		<?php if ($member['linkedin'] != '') { ?>
			<a href="<?php echo esc_url($member['linkedin']); ?>"><span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-linkedin fa-stack-1x fa-inverse"></i></span></a>
		<?php } ?>
		<?php if ($member['email'] != '') { ?>
			<a href="mailto:<?php echo antispambot($member['email']); ?>"><span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-envelope-o fa-stack-1x fa-inverse"></i></span></a>
		<?php } ?>
	</div>
<?php
}

add_action('onepress_section_team_member_media', 'onepress_plus_team_member_socials');

/**
 * Add docs links
 */
function onepress_plus_dashboard_theme_links()
{
?>
	<p>
		<a href="http://docs.famethemes.com/category/50-onepress-plus" target="_blank" class="button button-primary"><?php esc_html_e('OnePress Plus Documentation', 'onepress-plus'); ?></a>
	</p>
<?php
}
add_action('onepress_dashboard_theme_links', 'onepress_plus_dashboard_theme_links');

/**
 * Change theme footer info
 */
function onepress_plus_add_theme_footer_info()
{
	$c = get_theme_mod('onepress_footer_copyright_text', sprintf(esc_html__('Copyright %1$s %2$s %3$s', 'onepress-plus'), '&copy;', esc_attr(date('Y')), esc_attr(get_bloginfo())));
	$d = get_theme_mod('onepress_hide_author_link');
	if (!$d) {
		if ($c) {
			$c .= '<span class="sep"> &ndash; </span>';
		}
		$c .= sprintf(esc_html__('%1$s theme by %2$s', 'onepress-plus'), '<a href="' . esc_url('https://www.famethemes.com/themes/onepress', 'onepress-plus') . '">OnePress</a>', 'FameThemes');
	}
	echo wp_kses_post($c);
}

/**
 * Chang theme footer info
 *
 * @todo Remove default theme hook
 * @todo Add new plugin hook
 */
function onepress_plus_change_theme_footer_info()
{
	remove_action('onepress_footer_site_info', 'onepress_footer_site_info');
	add_action('onepress_footer_site_info', 'onepress_plus_add_theme_footer_info');
}
add_action('wp_loaded', 'onepress_plus_change_theme_footer_info');

if (!function_exists('onepress_is_selective_refresh')) {
	function onepress_is_selective_refresh()
	{
		return isset($GLOBALS['onepress_is_selective_refresh']) && $GLOBALS['onepress_is_selective_refresh'] ? true : false;
	}
}

// based on https://gist.github.com/cosmocatalano/4544576
if (!function_exists('onepress_get_instagram_images_from_content')) {
	/**
	 * Get instagram image from html content.
	 *
	 * @since 1.2.6
	 * @param string $content HTML data of user instagram.
	 * @return array
	 */
	function onepress_get_instagram_images_from_content($content)
	{
		$shards      = explode('window._sharedData = ', $content);
		if (is_array($shards) && !empty($shards) && isset($shards[1])) {
			$insta_json  = explode(';</script>', $shards[1]);
			$insta_array = json_decode($insta_json[0], true);
			if (!$insta_array) {
				return false;
			}
			if (isset($insta_array['entry_data']['ProfilePage'][0]['graphql']['user']['edge_owner_to_timeline_media']['edges'])) {
				$images = $insta_array['entry_data']['ProfilePage'][0]['graphql']['user']['edge_owner_to_timeline_media']['edges'];
			} else {
				return false;
			}
			if (!is_array($images)) {
				return false;
			}
			$instagram = array();
			foreach ($images as $image) {
				if (true === $image['node']['is_video']) {
					$type = 'video';
				} else {
					$type = 'image';
				}
				$caption = __('Instagram Image', 'onepress-plus');
				if (!empty($image['node']['edge_media_to_caption']['edges'][0]['node']['text'])) {
					$caption = $image['node']['edge_media_to_caption']['edges'][0]['node']['text'];
				}
				$instagram[] = array(
					'title'     => strip_tags($caption),
					'link'      => trailingslashit('//instagram.com/p/' . $image['node']['shortcode']),
					'thumbnail' => preg_replace('/^https?\:/i', '', $image['node']['thumbnail_resources'][4]['src']),
					'small'     => preg_replace('/^https?\:/i', '', $image['node']['thumbnail_resources'][2]['src']),
					'large'     => preg_replace('/^https?\:/i', '', $image['node']['thumbnail_resources'][4]['src']),
					'full'      => preg_replace('/^https?\:/i', '', $image['node']['thumbnail_resources'][4]['src']),
					'original'  => preg_replace('/^https?\:/i', '', $image['node']['display_url']),
				);
			}
			return $instagram;
		} else {
			return false;
		}
	}
}


if (!function_exists('onepress_plus_remove_customizer_emoji')) {
	function onepress_plus_remove_customizer_emoji()
	{
		if (is_customize_preview()) {
			if (function_exists('print_emoji_detection_script')) {
				remove_action('wp_head', 'print_emoji_detection_script', 7);
				remove_action('admin_print_scripts', 'print_emoji_detection_script');
			}
			if (function_exists('print_emoji_styles')) {
				remove_action('wp_print_styles', 'print_emoji_styles');
				remove_action('admin_print_styles', 'print_emoji_styles');
			}
			if (function_exists('wp_staticize_emoji')) {
				remove_filter('the_content_feed', 'wp_staticize_emoji');
				remove_filter('comment_text_rss', 'wp_staticize_emoji');
			}
			if (function_exists('wp_staticize_emoji_for_email')) {
				remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
			}
			if (function_exists('disable_emojis_tinymce')) {
				// Remove from TinyMCE.
				add_filter('tiny_mce_plugins', 'disable_emojis_tinymce');
			}
		}
	}
}
add_action('init', 'onepress_plus_remove_customizer_emoji', 1000);


if (!function_exists('onepress_get_instagram_data_via_proxy')) {
	/**
	 * Get instagram data via proxy
	 *
	 * @since 1.2.6
	 * @param string  $url URL to instagram.
	 * @param integer $api_index Index of api key.
	 * @param bool    $auto_break Auto break if loop over the valid api keys.
	 * @return array
	 */
	function onepress_get_instagram_data_via_proxy($url, $api_index = 0, $auto_break = false)
	{
		$api_keys = array(
			'4a390d281ed2b140d734ed5248cb480f',
			'bf93753208fc5b3dc7ced4c1eef0fe21',
			'99c74bf992611bad81192647c9633e6a',
			'4169f211c64e2699b52eeb4adef99abf',
			'e5f78fe9fc12bcce89a0fda5b1580be7',
			'10770c80326f6b00d592394d4b54e987',
		);
		if ($api_index >= count($api_keys) || !isset($api_keys[$api_index])) {
			$api_index = 0;
		}
		$post_url = 'http://api.scraperapi.com?api_key=' . trim($api_keys[$api_index]) . '&url=' . urlencode($url);
		$remote   = wp_remote_get($post_url);
		if (is_wp_error($remote)) {
			if ($auto_break && $api_index == count($api_keys)) {
				return array();
			} else {
				return onepress_get_instagram_data_via_proxy($url, $api_index + 1, true);
			}
		} else {
			$body = $remote['body'];
			if (false !== strpos($body, 'hit the request limit') || false !== strpos($body, 'contact support@scraperapi.com')) {
				return onepress_get_instagram_data_via_proxy($url, $api_index + 1, true);
			} else {
				return $remote;
			}
		}
	}
}

if (!function_exists('onepress_scrape_instagram')) {
	/**
	 * Get instagram data
	 *
	 * @since 1.2.6
	 * @param string $username instagram user name.
	 * @return array
	 */
	function onepress_scrape_instagram($username, $limit = 100)
	{
		$username  = strtolower($username);
		$username  = str_replace('@', '', $username);
		$cache_key = 'onepress_gallery_instagram_' . $username . $limit;
		if (!isset($_GET['skip_cache'])) {
			$instagram = get_transient($cache_key);
		}


		if (isset($instagram) && !empty($instagram)) {
			return $instagram;
		}
		$instagram = onepress_plus_instagram()->get_current_user_items_formatted($limit);
		if (!$instagram || empty($instagram)) {
			return array();
		}
		set_transient($cache_key, $instagram, 12 * HOUR_IN_SECONDS);
		return $instagram;
	}
}


if (!function_exists('onepress_plus_get_section_gallery_data')) {
	/**
	 * Get Gallery data
	 *
	 * @since 1.2.6
	 *
	 * @return array
	 */
	function onepress_plus_get_section_gallery_data()
	{
		$source = get_theme_mod('onepress_gallery_source', 'page');

		$data = apply_filters('onepress_plus_get_section_gallery_data', false);

		if ($data) {
			return $data;
		}
		$data        = array();
		$number_item = absint(get_theme_mod('onepress_g_number', 10));
		if (!$number_item) {
			$number_item = 10;
		}
		$transient_expired = apply_filters('onepress_plus_gallery_data_cache_time', 12 * HOUR_IN_SECONDS);
		$no_cache = isset($_GET['skip_cache']);

		switch ($source) {
			case 'shortcode':
				$data = !empty(get_theme_mod( 'onepress_gallery_source_shortcode')) ? get_theme_mod( 'onepress_gallery_source_shortcode') : '';
				if(!empty($data)) {
					echo do_shortcode($data);
				}
				break;
			case 'instagram':
				// Example:  https://www.instagram.com/taylorswift/media/
				$user_id = wp_strip_all_tags(get_theme_mod('onepress_gallery_source_instagram', ''));
				if (!$user_id) {
					return $data;
				}

				$cache_key = 'onepress_gallery_' . $source . '_' . $user_id . $number_item;
				if (!$transient_expired) {
					delete_transient($cache_key);
				}
				// Check cache
				// delete_transient( 'onepress_gallery_'.$source.'_'.$user_id );
				if (!$no_cache) {
					$data = get_transient($cache_key);
					if (false !== $data && is_array($data)) {
						return $data;
					}
				}


				$data = onepress_scrape_instagram($user_id, $number_item);

				if (!empty($data)) {
					set_transient($cache_key, $data, $transient_expired);
				} else {
					delete_transient($cache_key);
				}

				break;
			case 'flickr':
				$api_key = get_theme_mod('onepress_gallery_api_flickr', 'a68c0befe246035b74a8f67943da7edc');
				if (!$api_key) {
					return $data;
				}
				$user_id = wp_strip_all_tags(get_theme_mod('onepress_gallery_source_flickr'));
				if (!$user_id) {
					return $data;
				}

				$cache_key = 'onepress_gallery_' . $source . '_' . $user_id . $number_item;
				if (!$transient_expired) {
					delete_transient($cache_key);
				}
				// Check cache
				$data = get_transient($cache_key);
				if (false !== $data && is_array($data)) {
					return $data;
				}

				$flickr_api_url = 'https://api.flickr.com/services/rest/';
				// @see https://www.flickr.com/services/api/explore/flickr.people.getPhotos
				$url = add_query_arg(
					array(
						'method'         => 'flickr.people.getPhotos',
						'api_key'        => $api_key,
						'user_id'        => $user_id,
						'per_page'       => $number_item,
						'format'         => 'json',
						'nojsoncallback' => '1',
					),
					$flickr_api_url
				);

				$res = wp_remote_get($url);
				if (wp_remote_retrieve_response_code($res) == 200) {
					$res_data = wp_remote_retrieve_body($res);
					$res_data = json_decode($res_data, true);
					if ($res_data['stat'] == 'ok' && $res_data['photos']['photo']) {

						foreach ($res_data['photos']['photo'] as $k => $photo) {
							$image_get_url = add_query_arg(
								array(
									'method'         => 'flickr.photos.getSizes',
									'api_key'        => $api_key,
									'photo_id'       => $photo['id'],
									'format'         => 'json',
									'nojsoncallback' => '1',
								),
								$flickr_api_url
							);

							$img_res = wp_remote_get($image_get_url);
							if (wp_remote_retrieve_response_code($img_res) == 200) {
								$img_res = wp_remote_retrieve_body($img_res);
								$img_res = json_decode($img_res, true);
								if (isset($img_res['sizes']) && $img_res['stat'] == 'ok') {

									$img_full = false;
									$tw       = 0;
									$images   = array();
									foreach ($img_res['sizes']['size'] as $img) {
										if ($tw < $img['width']) {
											$tw       = $img['width'];
											$img_full = $img['source'];
										}
										$images[$img['label']] = $img['source'];
									}

									$data[$photo['id']] = array(
										'id'        => $photo['id'],
										'thumbnail' => $img_full,
										'full'      => $img_full,
										'sizes'     => $images,
										'title'     => $photo['title'],
										'content'   => '',
									);
								}
							}
						}
					}
				}

				if (!empty($data)) {
					set_transient($cache_key, $data, $transient_expired);
				} else {
					delete_transient($cache_key);
				}

				break;
			case 'facebook':
				$album_id  = false;
				$album_url = get_theme_mod('onepress_gallery_source_facebook', '');
				preg_match('/a\.(.*?)\.(.*?)/', $album_url, $arr);
				if ($arr) {
					$album_id = $arr[1];
				}

				if (!$album_id) {
					$tpl      = explode('album_id', $album_url);
					$album_id = end($tpl);
					$album_id = str_replace('=', '', $album_id);
				}

				if (!$album_id) {
					$tpl      = explode('album_id', $album_url);
					$album_id = end($tpl);
					$album_id = str_replace('=', '', $album_id);
				}

				if (!$album_id) {
					return false;
				}
				$token = get_theme_mod('onepress_gallery_api_facebook', '');
				if (!$token) {
					return false;
				}
				$cache_key = 'onepress_gallery_' . $source . '_' . $album_id . $number_item;
				if (!$transient_expired) {
					delete_transient($cache_key);
				}
				// Check cache.
				$data = get_transient($cache_key);
				if (false !== $data && is_array($data)) {
					return $data;
				}

				$url = 'https://graph.facebook.com/v3.2/' . $album_id;
				$url = add_query_arg(
					array(
						'fields'       => 'photos.limit(' . $number_item . '){images,link,name,picture,width}',
						'access_token' => $token,
					),
					$url
				);
				$res = wp_remote_get($url);

				if (wp_remote_retrieve_response_code($res) == 200) {
					$res_data = wp_remote_retrieve_body($res);
					$res_data = json_decode($res_data, true);

					if (isset($res_data['photos']) && isset($res_data['photos']['data'])) {
						foreach ($res_data['photos']['data'] as $k => $photo) {

							$img_full = false;
							$tw       = 0;
							foreach ($photo['images'] as $img) {
								if ($tw < $img['width']) {
									$tw       = $img['width'];
									$img_full = $img['source'];
								}
							}
							$data[$photo['id']] = array(
								'id'        => $photo['id'],
								'thumbnail' => $img_full,
								'full'      => $img_full,
								'title'     => isset($photo['name']) ? $photo['name'] : '',
								'content'   => '',
							);
						}
					}
				}

				if (!empty($data)) {
					set_transient($cache_key, $data, $transient_expired);
				} else {
					delete_transient($cache_key);
				}

				break;
			case 'page':
				$page_id = get_theme_mod('onepress_gallery_source_page');
				$images  = '';
				if ($page_id) {
					if (function_exists('onepress_get_gallery_image_ids')) {
						$images = onepress_get_gallery_image_ids($page_id);
					}
				}

				$display_type = get_theme_mod('onepress_gallery_display', 'grid');
				if ($display_type == 'masonry' || $display_type == ' justified') {
					$size = 'large';
				} else {
					$size = 'onepress-small';
				}

				$image_thumb_size = apply_filters('onepress_gallery_page_img_size', $size);
				if (!empty($images)) {
					if (!is_array($images)) {
						$images = explode(',', $images);
					}
					foreach ($images as $post_id) {
						$post = get_post($post_id);
						if ($post) {
							$img_thumb = wp_get_attachment_image_src($post_id, $image_thumb_size);
							if ($img_thumb) {
								$img_thumb = $img_thumb[0];
							}

							$img_full = wp_get_attachment_image_src($post_id, 'full');
							if ($img_full) {
								$img_full = $img_full[0];
							}

							$image_alt = get_post_meta($post_id, '_wp_attachment_image_alt', true);

							if ($img_thumb && $img_full) {
								$data[$post_id] = array(
									'id'        => $post_id,
									'thumbnail' => $img_thumb,
									'full'      => $img_full,
									'title'     => $post->post_title,
									'content'   => $post->post_content,
									'alt'       => $image_alt,
								);
							}
						}
					}
				} else {
					/**
					 * Get gallery in gutenberg blocks.
					 *
					 * @since 2.2.1
					 */
					if ($page_id && function_exists('onepress_get_gallery_image_ids_by_urls')) {
						$gallery_image_urls = onepress_get_gallery_image_ids_by_urls($page_id);
						$image_thumb_size = apply_filters('onepress_gallery_page_img_size', $size);
						foreach ($gallery_image_urls as $key => $value) {
							$img_id = attachment_url_to_postid($value);
							$content = '';
							$title = '';
							$alt = '';
							$thumbnail = $value;
							$full = $value;
							if ($img_id) {
								$post = get_post($img_id);
								if ($post) {
									$content = $post->post_title;
									$title = $post->post_content;
									$alt = get_post_meta($img_id, '_wp_attachment_image_alt', true);
									$img_thumb = wp_get_attachment_image_src($img_id, $image_thumb_size);
									if ($img_thumb) {
										$thumbnail = $img_thumb[0];
									}
									$img_full = wp_get_attachment_image_src($img_id, 'full');
									if ($img_full) {
										$full = $img_full[0];
									}
								}
							}

							$data[$key] = array(
								'id'        => $img_id,
								'thumbnail' => $thumbnail,
								'full'      => $full,
								'title'     => $title,
								'content'   => $content,
								'alt'       => $alt,
							);
						}
					}
				}

			break;
		}

		return $data;
	}
}

add_filter('onepress_get_section_gallery_data', 'onepress_plus_get_section_gallery_data');


/**
 * Support full width section
 * Check Section order & styling
 *
 * @param string $class
 * @param string $section_id
 * @return string
 */
function onepress_plus_section_fullwidth_class($class = '', $section_id = '')
{
	global $section;
	if (!empty($section) && is_array($section)) {
		if ($section['section_id'] == $section_id) {
			if (isset($section['fullwidth']) && $section['fullwidth']) {
				$class = 'container-fluid';
			}
		}
	}
	return $class;
}
add_filter('onepress_section_container_class', 'onepress_plus_section_fullwidth_class', 15, 2);


function onepress_number_projects($query)
{
	if (is_tax('portfolio_cat')) {
		$query->set('posts_per_page', apply_filters('onepress_plus_projects_number', 15));
	}
}
add_action('pre_get_posts', 'onepress_number_projects');
