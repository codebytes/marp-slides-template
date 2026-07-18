#!/usr/bin/env node
/**
 * check-overflow.mjs — detect content overflow in Marp slide decks.
 *
 * Marp CLI has no built-in overflow check, so this script:
 *   1. Renders the deck to a standalone HTML file with Marp CLI's `bare`
 *      template (every slide becomes a laid-out <section id="N"> at the deck's
 *      native pixel size, e.g. 1280x720).
 *   2. Loads that HTML in headless Chromium (Playwright) and, for each slide,
 *      compares scrollHeight/scrollWidth against clientHeight/clientWidth.
 *   3. Reports any slide whose content spills past the slide boundary and exits
 *      non-zero so it can gate CI.
 *
 * Usage:
 *   node check-overflow.mjs [options] <deck.md> [moreDeck.md ...]
 *
 * Options:
 *   --theme-set <dir>   Theme folder passed to Marp (default: slides/themes if it exists)
 *   --threshold <px>    Overflow tolerance in pixels (default: 2)
 *   --wait <ms>         Settle delay after load for fonts/CDN CSS (default: 600)
 *   --allow-local-files Pass --allow-local-files to Marp (needed for local images)
 *   --json              Emit machine-readable JSON instead of a table
 *   --keep-html         Do not delete the rendered HTML (prints its path)
 *   -h, --help          Show help
 *
 * Requirements (installed on demand, kept out of the repo root):
 *   npm i -D playwright && npx playwright install chromium
 *   Marp CLI is invoked via `npx --yes @marp-team/marp-cli@latest` by default;
 *   override with the MARP_CMD env var (e.g. MARP_CMD="marp" or a docker run line).
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const HELP = `Detect content overflow in Marp slides.

Usage: node check-overflow.mjs [options] <deck.md> [moreDeck.md ...]

Options:
  --theme-set <dir>   Theme folder passed to Marp (default: slides/themes)
  --threshold <px>    Overflow tolerance in pixels (default: 2)
  --wait <ms>         Settle delay for fonts/CDN CSS (default: 600)
  --allow-local-files Pass --allow-local-files to Marp (local images)
  --json              Emit JSON instead of a table
  --keep-html         Keep the rendered HTML and print its path
  -h, --help          Show this help

Exit code: 0 = no overflow, 1 = overflow found, 2 = usage/tooling error.`;

function parseArgs(argv) {
  const opts = {
    themeSet: null,
    threshold: 2,
    wait: 600,
    allowLocalFiles: false,
    json: false,
    keepHtml: false,
    decks: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { console.log(HELP); process.exit(0); }
    else if (a === '--theme-set') opts.themeSet = argv[++i];
    else if (a === '--threshold') opts.threshold = Number(argv[++i]);
    else if (a === '--wait') opts.wait = Number(argv[++i]);
    else if (a === '--allow-local-files') opts.allowLocalFiles = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--keep-html') opts.keepHtml = true;
    else if (a.startsWith('--')) { console.error(`Unknown option: ${a}`); process.exit(2); }
    else opts.decks.push(a);
  }
  return opts;
}

async function loadChromium() {
  try {
    const { chromium } = await import('playwright');
    return chromium;
  } catch {
    console.error(
      'Playwright is not installed. Install it with:\n' +
      '  npm i -D playwright && npx playwright install chromium'
    );
    process.exit(2);
  }
}

function renderDeck(deck, tmpDir, opts) {
  const outHtml = join(tmpDir, 'deck.html');
  const marpCmd = process.env.MARP_CMD || 'npx --yes @marp-team/marp-cli@latest';
  const args = ['--html', '--template', 'bare'];
  if (opts.themeSet) args.push('--theme-set', quote(opts.themeSet));
  if (opts.allowLocalFiles) args.push('--allow-local-files');
  args.push('-o', quote(outHtml), '--', quote(deck));
  const cmd = `${marpCmd} ${args.join(' ')}`;
  try {
    // Capture Marp output; only surface it if the render fails.
    execSync(cmd, { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (err) {
    const detail = (err.stderr || '').toString().trim();
    console.error(`Marp render failed for ${deck}` + (detail ? `:\n${detail}` : ''));
    process.exit(2);
  }
  return outHtml;
}

function quote(p) {
  return `'${String(p).replace(/'/g, `'\\''`)}'`;
}

async function measure(chromium, htmlPath, opts) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('file://' + resolve(htmlPath), { waitUntil: 'load' });
    // Let webfonts (Font Awesome) and any CDN CSS settle so widths are real.
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(opts.wait);
    return await page.evaluate((threshold) => {
      const rows = [];
      // Real content slides carry a numeric id; Marpit's split-background helper
      // sections do not, so `section[id]` isolates the true slides.
      for (const el of document.querySelectorAll('section[id]')) {
        const overY = el.scrollHeight - el.clientHeight;
        const overX = el.scrollWidth - el.clientWidth;
        const overflow = overY > threshold || overX > threshold;
        if (!overflow) continue;
        const heading = el.querySelector('h1, h2, h3, h4');
        rows.push({
          slide: Number(el.id),
          title: (heading ? heading.textContent : '').trim().slice(0, 48),
          overflowY: Math.max(0, Math.round(overY)),
          overflowX: Math.max(0, Math.round(overX)),
        });
      }
      return rows.sort((a, b) => a.slide - b.slide);
    }, opts.threshold);
  } finally {
    await browser.close();
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.decks.length === 0) { console.error(HELP); process.exit(2); }
  if (opts.themeSet == null && existsSync('slides/themes')) opts.themeSet = 'slides/themes';

  const chromium = await loadChromium();
  const results = [];
  let hadOverflow = false;

  for (const deck of opts.decks) {
    if (!existsSync(deck)) { console.error(`Deck not found: ${deck}`); process.exit(2); }
    const tmpDir = mkdtempSync(join(tmpdir(), 'marp-overflow-'));
    try {
      const html = renderDeck(deck, tmpDir, opts);
      const overflows = await measure(chromium, html, opts);
      results.push({ deck, overflows });
      if (overflows.length) hadOverflow = true;
      if (opts.keepHtml) console.error(`Rendered HTML kept: ${html}`);
    } finally {
      if (!opts.keepHtml) rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({ ok: !hadOverflow, results }, null, 2));
  } else {
    for (const { deck, overflows } of results) {
      if (!overflows.length) {
        console.log(`✅ ${deck}: no overflow detected`);
        continue;
      }
      console.log(`⚠️  ${deck}: ${overflows.length} slide(s) overflow`);
      for (const o of overflows) {
        const dir = [];
        if (o.overflowY) dir.push(`${o.overflowY}px tall`);
        if (o.overflowX) dir.push(`${o.overflowX}px wide`);
        console.log(`   • Slide ${o.slide}${o.title ? ` — "${o.title}"` : ''}: over by ${dir.join(', ')}`);
      }
    }
  }
  process.exit(hadOverflow ? 1 : 0);
}

main().catch((err) => { console.error(err?.stack || String(err)); process.exit(2); });
