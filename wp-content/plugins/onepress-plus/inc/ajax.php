<?php
class OnePress_Plus_Ajax {

    public static function init(){

        $action = $_REQUEST['onepress_ajax_action'];
        if( method_exists( 'OnePress_Plus_Ajax', $action ) ) {
            self::$action();
        }

    }

    static function load_portfolio_details( ) {

        $post_id = absint( $_REQUEST['post_id'] );
        ob_start();
        if( $post_id > 0 ) {
            global $post;
            $post_id = apply_filters( 'wpml_object_id', $post_id, 'page', true );
            $post = get_post( $post_id );
            setup_postdata( $post );
            $contents =  explode( '<!--more-->', $post->post_content );
            ?>
            <div id="project-details-id-<?php echo esc_attr( $post_id ); ?>" data-id="<?php echo esc_attr( $post_id ); ?>" class="project-detail project-expander ">
                <div class="grid-row project-expander-contents clearfix">
                    <div class="project-trigger-close close"><?php _e( 'close', 'onepress-plus' ); ?></div>
                    <?php if ( count( $contents ) > 1 ) { ?>
                        <div class="row">
                            <div class="col-lg-8 col-sm-12 project-media">
                                <?php
                                echo  wpautop( preg_replace( '/<\/?p\>/', "\n", apply_filters( 'the_content', trim( $contents[1] ) ) ) . "\n" );
                                ?>
                            </div>
                            <div class="col-lg-4 col-sm-12 project-detail-content">
                                <div class="project-content-inside">
                                    <h2 class="project-detail-title"><?php the_title(); ?></h2>
                                    <div class="project-detail-entry">
                                       <?php
                                        echo apply_filters( 'the_content', $contents[ 0 ] );
                                       ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php } else { ?>
                        <div class="col-lg-12 col-sm-12 project-detail-content">
                            <div class="project-content-inside">
                                <h2 class="project-detail-title"><?php the_title(); ?></h2>
                                <div class="project-detail-entry">
                                    <?php
                                    the_content( );
                                    ?>
                                </div>
                            </div>
                        </div>

                    <?php } ?>
                </div>
            </div>
            <?php
        }

        $content = ob_get_clean();
        wp_send_json_success( $content );
        die();
    }
}

add_action( 'wp_ajax_onepress_plus_ajax', array( 'OnePress_Plus_Ajax', 'init' ) );
add_action( 'wp_ajax_nopriv_onepress_plus_ajax', array( 'OnePress_Plus_Ajax', 'init' ) );
