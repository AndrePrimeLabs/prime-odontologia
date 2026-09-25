---
name: Prime Odontologia
description: Odontologia de confiança — cuidado que respeita o seu sorriso
colors:
  primary: "#1b2a4a"
  background: "#ffffff"
  text: "#1f2733"
  secondary: "#5b6675"
  surface: "#f3f5f8"
  line: "#e4e8ee"
  accent: "#2457d6"
typography:
  display:
    fontFamily: "Public Sans"
    fontSize: 3.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  headline:
    fontFamily: "Public Sans"
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  body:
    fontFamily: "Public Sans"
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Public Sans"
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.08em
rounded:
  sm: 6px
spacing:
  section: 7rem
  gutter: 1.5rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 14px 28px
imagery:
  filter: "saturate(0.95)"
---

## Overview

A dental practice site that reassures through order and clarity. Pure white ground, navy for headlines and the primary button, cool gray surfaces for cards and alternate sections, and tidy rows of evidence — credentials, numbers, testimonials. The signature is a **tilted reel**: image strips run diagonally across the page, and text sits in the open wedges they leave. Clean and credible, with one memorable motion.

## Colors

Pure white is the ground. Navy `#1b2a4a` carries headlines and the primary button and one full navy section for the closing call to action. Cool gray surfaces (`#f3f5f8` for alternate sections, `#e4e8ee` for cards) hold content off the white. Text is `#1f2733`, secondary text `#5b6675`. A single accent, cobalt `#2457d6`, appears only on links, icons, and primary buttons — never as a surface.

## Typography

One neutral sans throughout — **Public Sans**. Headlines at 600–700 weight with `letter-spacing: -0.01em`, the hero at `clamp(2rem, 4.5vw, 3.5rem)`. Body at 1.0625rem/1.6. Labels are small uppercase with `letter-spacing: 0.08em`. Stats use tabular numerals so numbers line up. Nothing poster-scale; the type is calm and legible.

## Layout

Content width 1080px, wide 1280px, tuned for marketing pages. The signature concept is the **tilted reel**: every image on the site belongs to a full-width strip rotated a few degrees, running edge to edge (slightly wider than the viewport so the rotation never clips). Text groups sit in the open wedge above or below a strip, never overlapping it, and strips alternate rotation direction down the page. On mobile the strips lose the rotation and become horizontal scroll-snap rows.

### Layout map (home)

1. **Header**: floating over the hero, transparent background, logo + navy nav links that contrast with the hero scrim.
2. **Hero**: full-bleed cover, headline + CTA pinned center-left over a scrimmed image. Ends where the page begins to move.
3. **First reel**: a tilted image strip opening the page's motion.
4. **Story band**: gray surface; section title left, a note right, text beside an image on the wide grid.
5. **Services band**: white; three-card row for treatments on the wide grid, title left + link right above the cards.
6. **Second reel**: a tilted strip, rotating the opposite way.
7. **Numbers band**: gray surface; a tidy row of credentials/statistics on the wide grid.
8. **Closing band**: full navy section with white text and the call to action.
9. **Footer**: last band, gray or navy, with contact details.

## Elevation & Depth

Flat white surfaces. Cards sit on the gray surface with a 1px border in `#e4e8ee` and a single soft shadow (`0 1px 3px rgb(16 24 40 / 0.06)`). One navy section carries the numbers or the call to action. No gradients, no decorative depth.

## Shapes

`border-radius: 6px` on cards, buttons, inputs, and inline images. Hairline rules separate rows. A 3px accent bar tops a featured card. Checkmarks and simple line icons in the accent. Anything full-bleed stays square-cornered so it still meets the viewport edge; rounding goes on inner elements only.

## Components

- **Button (primary)**: navy background, white text, 6px radius, `14px 28px` padding. On hover a 2px lift and 150–200ms ease-out.
- **Card**: white on the gray surface, 1px `#e4e8ee` border, one soft shadow, 6px radius.
- **Section title row**: title left, short note or link right, aligned baseline.
- **Label**: small uppercase secondary text with wide tracking.

## Do's and Don'ts

- Do use navy for all headlines and the primary button.
- Do keep a neutral photographic grade (`saturate(0.95)`).
- Do use hairlines and 6px radii to keep things tidy.
- Don't use warm tints, cream, or gradients.
- Don't use more than one accent, decorative shapes, or poster-scale type.
- Don't center the hero; keep copy pinned center-left with the headline and one CTA.

## Imagery

Natural-light photography of people and places with a neutral grade (`filter: saturate(0.95)`). Images are the reel: full-width strips, wide and continuous rather than isolated cards. Avoid busy or overly colorful shots; the grade keeps everything calm.

## Motion

150–200ms ease-out transitions on hover; cards lift 2px. Links draw a subtle underline on hover. Nothing on scroll — the reel's tilt, not animation, carries the motion. All transitions disabled under `prefers-reduced-motion`.

## Voice

Reassuring, plain, and direct. Speak to the patient in Brazilian Portuguese, second person ("seu sorriso"). Use words like "cuidado", "confiança", "conforto", "seu sorriso". Avoid jargon and scare-talk; describe procedures without alarming language.
