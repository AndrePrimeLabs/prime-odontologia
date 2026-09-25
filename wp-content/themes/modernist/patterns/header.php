<?php
/**
 * Title: header
 * Slug: modernist/header
 * Inserter: no
 */
?>
<!-- wp:group {"metadata":{"name":"Header Wrapper"},"align":"wide","style":{"spacing":{"blockGap":"0"},"dimensions":{"minHeight":"100%"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center","verticalAlignment":"space-between"}} -->
<div class="wp-block-group alignwide" style="min-height:100%"><!-- wp:group {"metadata":{"name":"Branding"},"style":{"border":{"radius":{"topLeft":"10px","topRight":"0px","bottomLeft":"10px","bottomRight":"0px"}},"layout":{"selfStretch":"fill","flexSize":null},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="border-top-left-radius:10px;border-top-right-radius:0px;border-bottom-left-radius:10px;border-bottom-right-radius:0px;padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:paragraph {"metadata":{"name":"Site logo"},"className":"no-underline","style":{"typography":{"lineHeight":"1"}},"fontSize":"xx-large"} -->
<p class="no-underline has-xx-large-font-size" style="line-height:1"><?php /* Translators: 1. is the start of a 'a' HTML element, 2. is the end of a 'a' HTML element */ 
echo sprintf( esc_html__( '%1$sM%2$s', 'modernist' ), '<a href="' . esc_url( '#' ) . '" data-type="page" data-id="294">', '</a>' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Site title and Nav"},"style":{"layout":{"selfStretch":"fit","flexSize":null},"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:site-title {"level":0,"textAlign":"center","style":{"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} /-->

<!-- wp:navigation {"overlayMenu":"always","icon":"menu","overlayBackgroundColor":"primary","overlayTextColor":"base","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"fontSize":"xx-large","layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->