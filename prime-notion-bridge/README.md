# Prime Notion Bridge — manual draft importer

Version 0.1. Development starter, not production-certified. Node.js 22+; no npm dependencies. This is a command-line connector using Notion and WordPress REST APIs, NOT an installed WordPress plugin. It runs alongside the Studio/GitHub project and does not change WordPress core, themes, PrimeOS, or Notion schemas.

## Files
- bridge.mjs: executable importer.
- test.mjs: offline conversion/safety tests with mocked HTTP.
- meu-sorriso.md: Brazilian Portuguese replacement text draft for clinical/editorial review.

## Installation
Place these files in a separate tools/prime-notion-bridge folder in your local project. Never paste them over existing PrimeOS or WordPress core files.
Check Node with `node --version`. Run `node --check bridge.mjs` and `node test.mjs` before configuring real access.

## Credentials and configuration
Use your operating system/IDE's secure environment configuration. Do not put real credentials in these files, GitHub, chat, screenshots, or a committed .env file.

Required environment variables:
- NOTION_TOKEN: read-content-only internal integration token; grant access only to intended pages.
- NOTION_ALLOWED_PAGES: comma-separated real Notion page IDs or URLs. Each source must be individually allowlisted. This is not a database ID.
- WP_BASE_URL: Studio URL reported by Studio, or the HTTPS staging-site URL; no wp-admin suffix.
- WP_USER: dedicated WordPress integration user's login.
- WP_APP_PASSWORD: WordPress Application Password for that user. The account needs create/edit posts/pages and upload files; avoid administrator privileges where possible.
- BRIDGE_STATE_FILE: optional absolute local path, outside the repository, to persistent bridge-state.json. Default is ./bridge-state.json. Keep it across runs; it prevents duplicate drafts and detects manual edits.

WordPress must allow REST API Application Password authentication. Studio/local HTTP authentication may be unavailable depending on configuration. If it is unavailable, use an authenticated HTTPS staging site; do not weaken production authentication. Do not enable unauthenticated REST writes.

## Commands
`node bridge.mjs "REAL_NOTION_PAGE_URL_OR_UUID" page`
`node bridge.mjs "REAL_NOTION_BLOG_ENTRY_URL_OR_UUID" post`

Standalone website pages use page. Blog database entries use post and require the exact existing Review status option Approved. Published is not accepted in this MVP. The importer deliberately does NOT enumerate the database or schedule bulk jobs.

## Output and safety
Creates a NEW draft with a notion-draft- prefix, not the live permalink. Later runs update only that same tracked draft. Published destinations are refused. Local WordPress content edits stop a resync. A pending write flag blocks blind retries after ambiguous failures. Preserve the state file and inspect WordPress before reconciling a pending record. Never delete state simply to force a retry.

Read content from the draft in Gutenberg. After review, manually copy chosen text into the existing live page, preserving its title/slug, navigation, images, forms, SEO settings and tracking. Do not replace a production database with a Studio database dump for this task.

## Supported conversion
Paragraphs, headings 1–3, quotes without children, grouped ordered/unordered lists including nested lists, dividers, basic todos, simple callouts without children, bookmarks, basic rich text, and JPEG/PNG/WebP/GIF images. Callout icons/colors and checklist interactivity are simplified; Notion visual styling is not cloned. Image caption text is used as initial alt text and should be reviewed.

Unsupported embeds, maps, databases, columns, toggles, tables, synced blocks and certain nested structures stop the import instead of silently disappearing. Prepare a separate simplified source copy or manually rebuild those pieces in Gutenberg. Rich-text equations also stop conversion. Notion internal links are not rewritten; inspect all internal links before publishing.

Images are downloaded over HTTPS from a narrow explicit host allowlist, with redirects refused, a 10 MB limit, MIME/signature checks, and WordPress Media Library upload. A different approved host or redirect requires developer review. Existing image-block mappings are reused; automatic refresh of changed images is not implemented. Images uploaded before a later error may remain unattached in WordPress; review them manually. Image-upload ambiguity can require manual reconciliation.

## Current schema
Post → title; Desired slug → prefixed draft slug on first import; Review status → Approved gate; body → content. Source URL, Author, Original publish date, Published URL and Conversion warnings are not automatically written/mapped in v0.1. In particular, no publish-status or URL writeback to Notion occurs. Never interpret Approved as automatic clinical certification.

## Validation
Node syntax checks and offline mock tests passed at generation time. Actual Notion authentication, WordPress/Studio authentication, media sideloads, Gutenberg block validation, theme rendering and production deployment were NOT tested. In Studio, check for invalid blocks, Portuguese accents, all links, images, mobile display, repeat-import behavior, manual-edit rejection, and published-destination rejection. No credentials are supplied with this package.

## Next development milestone
After the single-page workflow works in staging, add schema-aware database selection, explicit author/date mapping, richer block conversion, image refresh, media rollback/reconciliation, and controlled publication/writeback as separately reviewed features. Do not add automatic publication or overwrite-by-slug as a shortcut.
