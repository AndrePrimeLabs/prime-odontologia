# AGENTS.md — OnePress Plus

Operational index for coding agents working in this plugin. Read this file
first, then read the relevant spec under `docs/` before touching code.
Update the specs when conventions change.

---

## What this is

**OnePress Plus** is a premium companion plugin for the **OnePress**
WordPress theme by famethemes. It is **not standalone** — it hard-depends
on the parent theme (>= 2.2.0). For a longer description and the
repository layout, see `docs/spec-overview.md`.

---

## Must-read before any change

Four rules cover ~80% of the bugs:

1. **Commits follow Conventional Commits with a mandatory `BC:` footer.**
   `<type>(<scope>): <subject>` on the first line, then a body, then a
   `BC: <none|visual|deprecation|breaking> — <reason>` footer. Stage by
   name (never `git add -A`), English only, no `Co-Authored-By`, no
   `--amend` on published commits.
   → `docs/spec-commits.md`

2. **Plugin owns typography unconditionally.** The legacy
   `has_theme_support_typeography()` gate is retired — it now always
   returns `false`, so the plugin always registers its typography panel
   and pipeline regardless of parent theme version. On theme >= 2.3.18,
   the theme's own typography surface coexists.
   → `docs/spec-parent-theme.md`, `docs/spec-typography.md`

3. **Theme mods live in the `onepress_*` namespace**, NOT
   `onepress_plus_*`. Settings registered by this plugin must use the
   theme's namespace so the theme can read them.
   → `docs/spec-parent-theme.md`, `docs/spec-conventions.md`

4. **The hook `onerpess_plus_loaded_customize_configs` is a public-API
   typo.** Do not "fix" it. Same for `onepress_reepeatable_max_item` on
   the theme side.
   → `docs/spec-conventions.md`

---

## Specs

| Spec                                | Covers                                                                 |
|-------------------------------------|------------------------------------------------------------------------|
| `docs/spec-overview.md`             | What the plugin is, quick facts, repository layout                     |
| `docs/spec-bootstrap.md`            | Bootstrap, `OnePress_Plus::init()` order, singleton access             |
| `docs/spec-parent-theme.md`         | Version gates, integration hooks, theme mod namespace                  |
| `docs/spec-customizer.md`           | `Onepress_Customize` registry, `Onepress_Section_Base`, Shape A vs B   |
| `docs/spec-typography.md`           | Legacy typography subsystem + Google Fonts downloader                  |
| `docs/spec-sections.md`             | Front-page section parts, template override chain, page templates      |
| `docs/spec-build.md`                | Grunt tasks (`css`, `release`, `zipfile`), what ships in the zip       |
| `docs/spec-auto-update.md`          | EDD-based plugin updater + licensing                                   |
| `docs/spec-conventions.md`          | Naming table, public-API typos, Do / Don't                             |
| `docs/spec-commits.md`              | Conventional Commits format, scope list, mandatory `BC:` footer        |
| `docs/spec-recipes.md`              | Copy-pasteable recipes for the common tasks                            |
| `docs/spec-line-endings.md`         | LF-only rule, audit command, fix recipe, commit rules                  |
| `docs/spec-gotchas.md`              | Symptom → cause table for debugging                                    |

---

## Decision tree — which spec to open

| If you're about to…                              | Open                                    |
|--------------------------------------------------|-----------------------------------------|
| Write a commit message                           | `spec-commits.md`                       |
| Add or modify a Customizer setting               | `spec-customizer.md` + `spec-recipes.md` |
| Add or override a front-page section             | `spec-sections.md` + `spec-recipes.md`  |
| Touch anything in `inc/typography/`              | `spec-typography.md` + `spec-parent-theme.md` |
| Touch the Google Fonts downloader                | `spec-typography.md`                    |
| Compile CSS / bump version / build the zip       | `spec-build.md`                         |
| Change the updater or license flow               | `spec-auto-update.md`                   |
| Add a new hook in `init()`                       | `spec-bootstrap.md`                     |
| Normalize line endings                           | `spec-line-endings.md`                  |
| Debug a bug that looks vaguely familiar          | `spec-gotchas.md`                       |

---

## Quick rules

- **Commit format**: `<type>(<scope>): <subject>` ≤ 72 chars, body
  explains *why*, ends with `BC: <category> — <reason>` footer.
  See `docs/spec-commits.md`.
- English only in commit messages and any new file content.
- Stage by explicit path: `git add path1 path2`. Never `git add -A`.
- Never add a `Co-Authored-By` trailer.
- Never `--amend` a published commit; never `--no-verify`.
- Never edit anything under `build/` by hand. Edit `src/` and run
  `pnpm run build` (or `pnpm start` for watch).
- `build/` is gitignored — do NOT commit built artifacts.
- LF (`\n`) only. UTF-8 only. Final newline required. See
  `docs/spec-line-endings.md`.

## Common commands

| Command            | What it does                                              |
|--------------------|-----------------------------------------------------------|
| `pnpm install`     | Install deps (run after `git clone`)                      |
| `pnpm start`       | Watch `src/` and rebuild `build/` on change               |
| `pnpm run build`   | One-shot production build                                 |
| `pnpm run release` | Build + bump version + zip                                |

---

## Updating this docs set

- One spec = one concern. If a spec starts covering two unrelated
  subsystems, split it.
- Spec files are named `spec-<concern>.md` under `docs/`. Add new ones to
  the table above when introduced.
- When a recipe in `spec-recipes.md` repeats more than three steps from a
  spec file, move the long-form explanation into that spec and keep the
  recipe a thin pointer.
- When you spend > 30 minutes on a bug, add a row to
  `docs/spec-gotchas.md`.
