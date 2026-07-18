---
name: marp-slide-review
description: Review Marp slide decks for content overflow and layout problems before presenting or publishing. Use when the user asks to "review my slides", "check for overflow", "does my deck fit", "are any slides too full", "lint the deck", or wants to verify slides render correctly with the Marp CLI. Renders the deck headlessly and reports which slide numbers spill past the slide boundary. Do NOT use for authoring new slide content (use the marp agent) or for exporting to PDF/PPTX.
---

# Marp Slide Review

Marp/Marpit render every slide at a **fixed pixel size** (16:9 = 1280×720 by
default). When content is taller or wider than that box it is silently clipped
in exports — there is no error. This skill catches those overflows from the
command line so they can be fixed before a deck is presented or published to
GitHub Pages.

Marp CLI has **no native overflow check**. This skill renders the deck with the
CLI's `bare` template (all slides laid out at native size) and measures each
slide's `scrollHeight`/`scrollWidth` against its `clientHeight`/`clientWidth`
in headless Chromium.

## Script

`check-overflow.mjs` (in this skill folder) does the rendering and measuring.

### One-time setup

The template intentionally keeps no `package.json` at the repo root, so install
the tooling on demand (either globally, in a scratch folder, or as a dev
dependency of a throwaway `package.json`):

```bash
npm i -D playwright
npx playwright install chromium
```

Marp CLI is invoked via `npx --yes @marp-team/marp-cli@latest` by default — no
separate install needed. To reuse an existing Marp install or the Docker image,
set `MARP_CMD` (e.g. `MARP_CMD="marp"` or a full `docker run … marpteam/marp-cli`
command).

### Run

```bash
# Review the template deck (auto-detects slides/themes)
node .github/skills/marp-slide-review/check-overflow.mjs slides/Slides.md

# Multiple decks, custom tolerance, machine-readable output
node .github/skills/marp-slide-review/check-overflow.mjs --threshold 4 --json slides/*.md

# Decks that use local images
node .github/skills/marp-slide-review/check-overflow.mjs --allow-local-files slides/Slides.md
```

### Options

| Option | Purpose |
|--------|---------|
| `--theme-set <dir>` | Theme folder (defaults to `slides/themes` when present) |
| `--threshold <px>` | Overflow tolerance in pixels (default `2`) |
| `--wait <ms>` | Settle delay so webfonts/CDN CSS load before measuring (default `600`) |
| `--allow-local-files` | Forwarded to Marp for decks with local image paths |
| `--json` | Emit JSON (`{ ok, results: [{ deck, overflows: [...] }] }`) |
| `--keep-html` | Keep the rendered HTML and print its path (for debugging) |

### Exit codes

- `0` — no overflow (also prints `✅`)
- `1` — at least one slide overflows (prints each slide number, its heading, and by how much)
- `2` — usage error or missing tooling (Playwright/Marp)

Exit `1` makes the script usable as a CI gate.

## Interpreting results

Output looks like:

```
⚠️  slides/Slides.md: 1 slide(s) overflow
   • Slide 3 — "Speaker Notes with Images": over by 123px tall
```

"Slide N" is the 1-based slide number in the source Markdown. "tall" means
vertical overflow (most common); "wide" means horizontal overflow.

## Fixing overflow

Preferred remedies, roughly in order:

1. **Split the slide** — move some bullets/content to a new slide (`---`).
2. **Use the dense layout** — add `<!-- _class: small -->` to shrink text.
3. **Two/three columns** — wrap content in `<!-- _class: columns -->` /
   `columns3` (or the `<div class="columns">` wrapper) to use horizontal space.
4. **Right-size media** — cap image height, or use a split background
   (`![bg right](…)`) instead of an inline image that pushes text down.
5. **Trim words** — slides are for key points, not paragraphs.
6. **Auto-fit a heading** — `# <!--fit--> Title` scales a heading to width
   (headings only, not body copy).

After editing, re-run the script to confirm the slide now passes.

## Limitations & tips

- **Client-side rendered content** (Mermaid diagrams, MathJax that loads from a
  CDN) is drawn by JavaScript after load. Increase `--wait` (e.g. `--wait 2000`)
  so those finish before measuring, and be aware a diagram that grows on render
  may only overflow in a real browser.
- **Fonts change width.** The Font Awesome / webfont CSS is fetched from a CDN;
  the default `--wait` plus `document.fonts.ready` handles this, but bump
  `--wait` on slow networks.
- A tiny overflow (a few px) is usually harmless — that is what `--threshold`
  is for. Raise it if you get false positives from sub-pixel rounding.
- This checks **overflow only**. It is not a spell-checker or style linter;
  combine it with the Marp for VS Code overflow diagnostics
  (`markdown.marp.diagnostics.slideContentOverflow`) for live editor feedback.
