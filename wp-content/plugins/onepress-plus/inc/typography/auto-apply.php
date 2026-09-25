<?php
/**
 * This file help load typography automatically
 *
 * Auto add style for typography settings
 *
 * @see onepress_typography_helper_auto_apply
 */

onepress_typography_helper_auto_apply(
	'onepress_typo_p', // customize setting ID.
	'body, body p', // CSS selector.
	null,
	false,
	// Editor selector — needs to match BOTH `.editor-styles-wrapper`
	// (the iframe body itself in modern Gutenberg) AND its descendants.
	// `.editor-styles-wrapper *` alone misses the body, leaving the
	// parent theme's hard-coded `body { font-family: <theme-default> }`
	// in editor.css free to win on body's own font-family. Adding the
	// bare `.editor-styles-wrapper` selector applies the var to the
	// wrapper itself; the `*` keeps descendants covered.
	'.editor-styles-wrapper, .editor-styles-wrapper *',
	// CSS variable hand-off: the same rule assigns
	// --wp--preset--font-family--body so theme.json `styles` and any
	// block that consumes the preset (heading, paragraph, list, etc.)
	// inherits the Customizer-picked family without the plugin needing
	// to know which selectors the theme uses downstream.
	'--wp--preset--font-family--body'
);

onepress_typography_helper_auto_apply(
	'onepress_typo_site_title', // customize setting ID.
	'#page .site-branding .site-title, #page .site-branding .site-text-logo', // CSS selector.
	null,
	false,
	// Site Title block (FSE templates) + classic editor variants.
	'.editor-styles-wrapper .wp-block-site-title,
	.editor-styles-wrapper .wp-block-site-title a,
	.editor-styles-wrapper .site-title'
);

onepress_typography_helper_auto_apply(
	'onepress_typo_site_tagline', // customize setting ID.
	'#page .site-branding .site-description', // CSS selector.
	null,
	false,
	// Site Tagline block (FSE templates) + classic editor variant.
	'.editor-styles-wrapper .wp-block-site-tagline,
	.editor-styles-wrapper .site-description'
);

onepress_typography_helper_auto_apply(
	'onepress_typo_menu', // customize setting ID.
	'.onepress-menu a', // CSS selector.
	null,
	false,
	// Navigation block (FSE) + legacy menu selectors. .onepress-menu
	// isn't rendered inside the editor, so the legacy selector here is
	// a no-op — included only so the cascade is consistent with the
	// front-end output.
	'.editor-styles-wrapper .wp-block-navigation a,
	.editor-styles-wrapper .wp-block-navigation__container a,
	.editor-styles-wrapper .onepress-menu a'
);

onepress_typography_helper_auto_apply(
	'onepress_hero_heading', // customize setting ID.
	'.hero__content .hero-large-text, .hero__content .hcl2-content h1, .hero__content .hcl2-content h2, .hero__content .hcl2-content h3' // CSS selector.
);

onepress_typography_helper_auto_apply(
	'onepress_typo_heading', // customize setting ID.
	'body h1, body h2, body h3, body h4, body h5, body h6,
	.entry-header .entry-title,
	body .section-title-area .section-title, body .section-title-area .section-subtitle, body .hero-content-style1 h2', // CSS selector.
	null,
	false,
	// Editor selector — universal across both the classic Post Editor
	// (pre-5.9, .edit-post-visual-editor on host page) and the modern
	// iframe Post / Site / Widgets editors (5.9+, the iframe's body
	// carries .editor-styles-wrapper alone). The old combined selector
	// `.edit-post-visual-editor.editor-styles-wrapper h1` required BOTH
	// classes simultaneously and matched only the legacy editor.
	//
	// Also includes:
	//   .editor-post-title__input   — classic post-title field
	//   .wp-block-post-title         — block-based post title (FSE templates)
	'.editor-styles-wrapper h1,
	.editor-styles-wrapper h2,
	.editor-styles-wrapper h3,
	.editor-styles-wrapper h4,
	.editor-styles-wrapper h5,
	.editor-styles-wrapper h6,
	.editor-styles-wrapper .editor-post-title__input,
	.editor-styles-wrapper .wp-block-post-title',
	// CSS variable hand-off — see onepress_typo_p above. Heading blocks
	// in WP / FSE templates default to var(--wp--preset--font-family--heading);
	// assigning the var in our rule makes them all inherit the
	// Customizer-picked heading family.
	'--wp--preset--font-family--heading'
);

onepress_typography_helper_auto_apply(
	'onepress_slider_slide_typo_title', // customize setting ID.
	'.section-slider .section-op-slider .item--title' // CSS selector.
);

onepress_typography_helper_auto_apply(
	'onepress_slider_slide_typo_content', // customize setting ID.
	'.section-slider .section-op-slider .item--desc' // CSS selector.
);
