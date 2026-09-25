<?php
/**
 * Title: search
 * Slug: modernist/search
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
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:query-title {"type":"search","textAlign":"left","level":2,"showSearchTerm":false,"align":"wide"} /--></div>
<!-- /wp:group -->

<!-- wp:search {"showLabel":false,"buttonText":"","buttonPosition":"button-inside","buttonUseIcon":true,"style":{"border":{"radius":"2px"},"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}}} /-->

<!-- wp:query {"queryId":0,"query":{"perPage":20,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true,"taxQuery":null,"parents":[]},"enhancedPagination":true,"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"align":"wide","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<!-- wp:group {"metadata":{"name":"Post Template Wrapper"},"style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|30"}},"border":{"top":{"width":"1px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-top-width:1px;padding-top:0;padding-bottom:var(--wp--preset--spacing--30)"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"0"},"margin":{"top":"0","bottom":"0"}}}} -->
<div class="wp-block-columns" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"stretch","backgroundColor":"base"} -->
<div class="wp-block-column is-vertically-aligned-stretch has-base-background-color has-background"><!-- wp:group {"metadata":{"name":"Post detail wrappers"},"style":{"dimensions":{"minHeight":"100%"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"margin":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"top","justifyContent":"stretch"}} -->
<div class="wp-block-group" style="min-height:100%;margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--30)"><!-- wp:post-title {"isLink":true,"style":{"typography":{"lineHeight":"1.35"}}} /-->

<!-- wp:paragraph {"metadata":{"name":"Arrow"},"fontSize":"small","fontFamily":"inter"} -->
<p class="has-inter-font-family has-small-font-size"><?php esc_html_e('↗', 'modernist');?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top"} -->
<div class="wp-block-column is-vertically-aligned-top"><!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/9","height":""} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:group {"metadata":{"name":"Pagination Block"},"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide"><!-- wp:query-pagination {"align":"wide"} -->
<!-- wp:query-pagination-previous {"label":""} /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next {"label":""} /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results {"align":"wide"} -->
<!-- wp:paragraph {"placeholder":"Add text or blocks that will display when a query returns no results."} -->
<p><?php esc_html_e('Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'modernist');?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></main>
<!-- /wp:group -->