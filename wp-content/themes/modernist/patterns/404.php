<?php
/**
 * Title: 404
 * Slug: modernist/404
 * Inserter: no
 */
?>
<!-- wp:group {"tagName":"main","lock":{"move":true,"remove":true},"metadata":{"name":"Content Wrapper"},"style":{"spacing":{"padding":{"top":"2.5vh","bottom":"2.5vh"}},"dimensions":{"minHeight":"90dvh"}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="min-height:90dvh;padding-top:2.5vh;padding-bottom:2.5vh"><!-- wp:columns {"isStackedOnMobile":false,"align":"wide"} -->
<div class="wp-block-columns alignwide is-not-stacked-on-mobile"><!-- wp:column {"verticalAlignment":"stretch","width":"7.5%","metadata":{"name":"7.5"},"layout":{"type":"constrained"}} -->
<div class="wp-block-column is-vertically-aligned-stretch" style="flex-basis:7.5%"><!-- wp:template-part {"slug":"header","area":"header","className":"full-height"} /--></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"bottom","width":"92.5%","metadata":{"name":"92.5"},"layout":{"type":"constrained"}} -->
<div class="wp-block-column is-vertically-aligned-bottom" style="flex-basis:92.5%"><!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"verticalAlignment":"stretch","width":"35%","metadata":{"name":"35"}} -->
<div class="wp-block-column is-vertically-aligned-stretch" style="flex-basis:35%"><!-- wp:template-part {"slug":"author-cta"} /--></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"10%","metadata":{"name":"10"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:10%"></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"55%","metadata":{"name":"55"},"layout":{"type":"default"}} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:55%"><!-- wp:group {"metadata":{"name":"Content column"},"align":"wide","style":{"dimensions":{"minHeight":"100%"}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between","justifyContent":"stretch"}} -->
<div class="wp-block-group alignwide" style="min-height:100%"><!-- wp:group {"metadata":{"name":"Section Title"},"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:heading {"textAlign":"left","level":1,"style":{"typography":{"lineHeight":"1.15"}},"fontSize":"xx-large"} -->
<h1 class="wp-block-heading has-text-align-left has-xx-large-font-size" style="line-height:1.15"><?php esc_html_e('Oops... page not found.', 'modernist');?></h1>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Content Block"},"style":{"spacing":{"blockGap":"0","margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0"><!-- wp:paragraph {"align":"left"} -->
<p class="has-text-align-left"><?php /* Translators: 1. is a 'br' HTML element */ 
echo sprintf( esc_html__( 'It looks like nothing was found at this location.%1$sMaybe try a search?', 'modernist' ), '<br>' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"var:preset|spacing|30","metadata":{"name":"XS"}} -->
<div style="height:var(--wp--preset--spacing--30)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:search {"label":"","showLabel":false,"buttonText":"","buttonPosition":"button-inside","buttonUseIcon":true} /--></div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","area":"footer"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></main>
<!-- /wp:group -->