<?php
/**
 * The template for displaying single portfolio.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package OnePress
 */

get_header(); ?>

<div id="content" class="site-content">

    <div class="page-header">
        <div class="container">
            <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
        </div>
    </div>

    <?php echo onepress_breadcrumb(); ?>

    <div id="content-inside" class="container">
        <div id="primary" class="content-area">
            <main id="main" class="site-main" role="main">
                <?php
                global $post;
                while ( have_posts() ) : the_post(); ?>
                    <?php
                    $contents =  explode( '<!--more-->', $post->post_content );
                    ?>

                    <div class="row">
                        <?php if ( count( $contents ) > 1 ) { ?>
                            <div class="col-lg-9">
                                <?php echo wpautop( preg_replace( '/<\/?p\>/', "\n", apply_filters( 'the_content', trim( $contents[1] ) ) ) . "\n" ); ?>
                            </div>
                            <div class="col-lg-3">
                                <?php echo apply_filters( 'the_content', $contents[ 0 ] ); ?>
                            </div>
                        <?php } else { ?>
                            <div class="col-lg-12">
                                <?php the_content(); ?>
                            </div>
                        <?php } ?>
                    </div>
                <?php endwhile; // End of the loop. ?>

            </main>
        </div>

    </div>
</div>

<?php get_footer(); ?>
