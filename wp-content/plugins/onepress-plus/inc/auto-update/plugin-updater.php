<?php

class FT_EDD_SL_Plugin_Updater extends FT_Base_EDD_SL_Plugin_Updater {

    /**
     * Set up WordPress filters to hook into WP's update process.
     *
     * @uses add_filter()
     *
     * @return void
     */
    public function init() {

        add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'check_update' ) );
        add_filter( 'plugins_api', array( $this, 'plugins_api_filter' ), 10, 3 );
        remove_action( 'after_plugin_row_' . $this->name, 'wp_plugin_update_row', 10 );
        add_action( 'after_plugin_row_' . $this->name, array( $this, 'show_update_notification' ), 10, 2 );
        add_action( 'after_plugin_row_' . $this->name, array( $this, 'remove_wp_notice' ), 1, 2 );
        add_action( 'admin_init', array( $this, 'show_changelog' ) );

    }

    function remove_wp_notice(){
        remove_action( 'after_plugin_row_' . $this->name, 'wp_plugin_update_row', 10 );
    }

    public function get_cached_version_info( $plugin_name = '' ) {
        // Do not cache
        return false ;

    }

    public function set_version_info_cache( $value = '', $cache_key = '' ) {
       // Do not cache
    }

    public function show_changelog() {

        global $edd_plugin_data;

        if( empty( $_REQUEST['edd_sl_action'] ) || 'view_plugin_changelog' != $_REQUEST['edd_sl_action'] ) {
            return;
        }

        if( empty( $_REQUEST['plugin'] ) ) {
            return;
        }

        if( empty( $_REQUEST['slug'] ) ) {
            return;
        }

        if( ! current_user_can( 'update_plugins' ) ) {
            wp_die( __( 'You do not have permission to install plugin updates', 'easy-digital-downloads' ), __( 'Error', 'easy-digital-downloads' ), array( 'response' => 403 ) );
        }

        $version_info = false;
        $update_cache = get_site_transient( 'update_plugins' );
        if ( is_array( $update_cache->response ) ) {
            if ( isset( $update_cache->response[ $_REQUEST['plugin'] ] ) ) {
                $version_info = $update_cache->response[ $_REQUEST['plugin'] ];
            }
        }

        if( false === $version_info ) {

            $api_params = array(
                'edd_action' => 'get_version',
                'item_name'  => isset( $data['item_name'] ) ? $data['item_name'] : false,
                'item_id'    => isset( $data['item_id'] ) ? $data['item_id'] : false,
                'slug'       => $_REQUEST['slug'],
                'author'     => $data['author'],
                'url'        => home_url(),
                'beta'       => ! empty( $data['beta'] )
            );

            $verify_ssl = $this->verify_ssl();
            $request    = wp_remote_post( $this->api_url, array( 'timeout' => 15, 'sslverify' => $verify_ssl, 'body' => $api_params ) );

            if ( ! is_wp_error( $request ) ) {
                $version_info = json_decode( wp_remote_retrieve_body( $request ) );
            }


            if ( ! empty( $version_info ) && isset( $version_info->sections ) ) {
                $version_info->sections = maybe_unserialize( $version_info->sections );
            } else {
                $version_info = false;
            }

            if( ! empty( $version_info ) ) {
                foreach( $version_info->sections as $key => $section ) {
                    $version_info->$key = (array) $section;
                }
            }

            $this->set_version_info_cache( $version_info, $cache_key );
        }

        if( ! empty( $version_info ) && property_exists(  $version_info, 'changelog' ) ) {
            $changelog = '';
            if ( is_array(  $version_info->changelog  ) ) {
                $changelog = current(  $version_info->changelog  );
            } else {
                $changelog =  $version_info->changelog ;
            }
            echo '<div style="background:#fff;padding:10px; font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif;">' .$changelog. '</div>';
        }

        exit;
    }
    /**
     * show update nofication row -- needed for multisite subsites, because WP won't tell you otherwise!
     *
     * @see wp_plugin_update_row
     * @param string  $file
     * @param array   $plugin
     */
    public function show_update_notification( $file, $plugin ) {


        if ( is_network_admin() ) {
            return;
        }

        if( ! current_user_can( 'update_plugins' ) ) {
            return;
        }

        if( is_multisite() ) {
            return;
        }

        if ( $this->name != $file ) {
            return;
        }

        // Remove our filter on the site transient
        remove_filter( 'pre_set_site_transient_update_plugins', array( $this, 'check_update' ), 10 );

        $update_cache = get_site_transient( 'update_plugins' );

        $update_cache = is_object( $update_cache ) ? $update_cache : new stdClass();

        if ( empty( $update_cache->response ) || empty( $update_cache->response[ $this->name ] ) ) {

            $version_info = $this->get_cached_version_info();

            if ( false === $version_info ) {
                $version_info = $this->api_request( 'plugin_latest_version', array( 'slug' => $this->slug, 'beta' => $this->beta ) );

                $this->set_version_info_cache( $version_info );
            }

            if ( ! is_object( $version_info ) ) {
                return;
            }

            if ( version_compare( $this->version, $version_info->new_version, '<' ) ) {

                $update_cache->response[ $this->name ] = $version_info;

            }

            $update_cache->last_checked = current_time( 'timestamp' );
            $update_cache->checked[ $this->name ] = $this->version;

            set_site_transient( 'update_plugins', $update_cache );

        } else {

            $version_info = $update_cache->response[ $this->name ];

        }


        // Restore our filter
        add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'check_update' ) );

        if ( ! empty( $update_cache->response[ $this->name ] ) && version_compare( $this->version, $version_info->new_version, '<' ) ) {

            if ( is_network_admin() || ! is_multisite() ) {
                if (is_network_admin()) {
                    $active_class = is_plugin_active_for_network($file) ? ' active' : '';
                } else {
                    $active_class = is_plugin_active($file) ? ' active' : '';
                }

                $notices = OnePress_Plus_Auto_Update::notices();
                extract($notices);

                // build a plugin list row, with update notification
                //$wp_list_table = _get_list_table( 'WP_Plugins_List_Table' );
                # <tr class="plugin-update-tr"><td colspan="' . $wp_list_table->get_column_count() . '" class="plugin-update colspanchange">
                echo '<tr class="plugin-update-tr '.$active_class.'" id="' . $this->slug . '-update" data-slug="' . $this->slug . '" data-plugin="' . $this->slug . '/' . $file . '">';
                echo '<td colspan="3" class="plugin-update colspanchange">';
                echo '<div class="update-message notice inline notice-warning notice-alt">';
                echo '<p>';

                $changelog_link = self_admin_url('index.php?edd_sl_action=view_plugin_changelog&plugin=' . $this->name . '&slug=' . $this->slug . '&TB_iframe=true&width=772&height=911');

                if ($status) {
                    if (empty($version_info->download_link)) {
                        printf(
                            __('There is a new version of %1$s available. %2$sView version %3$s details%4$s.', 'easy-digital-downloads'),
                            esc_html($version_info->name),
                            '<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">',
                            esc_html($version_info->new_version),
                            '</a>'
                        );
                    } else {
                        printf(
                            __('There is a new version of %1$s available. %2$sView version %3$s details%4$s or %5$supdate now%6$s.', 'easy-digital-downloads'),
                            esc_html($version_info->name),
                            '<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">',
                            esc_html($version_info->new_version),
                            '</a>',
                            '<a href="' . esc_url(wp_nonce_url(self_admin_url('update.php?action=upgrade-plugin&plugin=') . $this->name, 'upgrade-plugin_' . $this->name)) . '">',
                            '</a>'
                        );
                    }

                } else {
                    $enter_key_url = self_admin_url('themes.php?page=ft_onepress&tab=auto_update');

                    switch ($license_status) {
                        case  'expired':
                            $renewal_url = 'https://www.famethemes.com/checkout/?edd_license_key=' . $license . '&download_id=' . OnePress_Plus_Auto_Update::$download_id;
                            printf(__('There is a new version of %1$s available. %2$s.'),
                                $version_info->name,
                                '<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">' . sprintf(__('View version %1$s details', 'onepress-plus'), $version_info->new_version) . '</a>'
                            );

                            echo '<br/>';
                            printf(__('<strong>Your License Has Expired</strong> — Updates are only available to those with an active license. %2$s or %3$s.'),
                                $version_info->name,
                                '<strong><a target="_blank" href="' . esc_url($renewal_url) . '">' . __('Click here to Renewal', 'onepress-plus') . '</a></strong>',
                                '<a target="_blank"  href="' . esc_url($enter_key_url) . '">' . __('Check my license again ', 'onepress-plus') . '</a>'
                            );

                            break;
                        default:
                            printf(__('There is a new version of %1$s available. %2$s. Automatic update is unavailable for this plugin. %3$s'),
                                $version_info->name,
                                '<a target="_blank" class="thickbox" href="' . esc_url($changelog_link) . '">' . sprintf(__('View version %1$s details', 'onepress-plus'), $version_info->new_version) . '</a>',
                                '<strong><a target="_blank" href="' . esc_url($enter_key_url) . '">' . __('Enter valid license key for automatic updates', 'onepress-plus') . '</a></strong>'
                            );
                    }

                }

                do_action("in_plugin_update_message-{$file}", $plugin, $version_info);
                echo '</p>';
                echo '</div></td></tr>';

            }

        } // end if version compare
    }
}