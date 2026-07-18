#!/usr/bin/env node
/**
 * make-drawio-svg.mjs — author and inspect editable `.drawio.svg` diagrams.
 *
 * A `.drawio.svg` is an ordinary SVG (so it renders as an image anywhere) whose
 * root <svg> element also carries a `content="…"` attribute holding the draw.io
 * `mxfile` XML, HTML-escaped. draw.io / diagrams.net and the Draw.io Integration
 * VS Code extension read that attribute, so the same file both *displays* and
 * *re-opens fully editable*.
 *
 * This helper renders a simple JSON node/edge spec to SVG shapes AND embeds a
 * matching `mxGraphModel`, so the diagram is editable in draw.io with no draw.io
 * install required. Dependency-free — plain Node, no npm packages.
 *
 * Commands:
 *   build   <spec.json> -o <out.drawio.svg>   Render spec -> editable .drawio.svg (default)
 *   extract <in.drawio.svg>                    Print the embedded mxfile XML (for editing)
 *
 * Examples:
 *   node make-drawio-svg.mjs build spec.json -o slides/img/flow.drawio.svg
 *   node make-drawio-svg.mjs extract slides/img/flow.drawio.svg
 *
 * Spec format (see example.spec.json in this folder):
 *   {
 *     "nodes": [
 *       { "id": "a", "label": "Start", "x": 40, "y": 40,
 *         "width": 140, "height": 60,
 *         "fill": "#dae8fc", "stroke": "#6c8ebf", "fontColor": "#000000",
 *         "rounded": true }
 *     ],
 *     "edges": [
 *       { "source": "a", "target": "b", "label": "yes" }
 *     ]
 *   }
 */

import { readFileSync, writeFileSync } from 'node:fs';

// ---------- shared helpers ----------

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Value stored in the SVG `content` attribute (double-quoted), so escape for an
// attribute context and turn newlines into numeric entities.
function attrEscape(s) {
  return xmlEscape(s).replace(/\n/g, '&#10;');
}

function borderPoint(rect, towardX, towardY) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = rect.width / 2;
  const hh = rect.height / 2;
  const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

// ---------- build command ----------

function styleFor(node) {
  const parts = [];
  parts.push(node.rounded ? 'rounded=1' : 'rounded=0');
  parts.push('whiteSpace=wrap', 'html=1');
  if (node.fill) parts.push(`fillColor=${node.fill}`);
  if (node.stroke) parts.push(`strokeColor=${node.stroke}`);
  if (node.fontColor) parts.push(`fontColor=${node.fontColor}`);
  if (node.style) parts.push(node.style); // raw extra draw.io style
  return parts.join(';') + ';';
}

function buildModel(spec) {
  // mxGraphModel with matching geometry so draw.io reopens an identical diagram.
  const cells = ['<mxCell id="0" />', '<mxCell id="1" parent="0" />'];
  for (const n of spec.nodes) {
    cells.push(
      `<mxCell id="${xmlEscape(n.id)}" value="${attrEscape(n.label ?? '')}" ` +
      `style="${xmlEscape(styleFor(n))}" vertex="1" parent="1">` +
      `<mxGeometry x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" as="geometry" />` +
      `</mxCell>`
    );
  }
  let ei = 0;
  for (const e of spec.edges ?? []) {
    const id = e.id ?? `e${++ei}`;
    const edgeStyle = e.orthogonal
      ? 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;'
      : 'edgeStyle=none;rounded=0;html=1;';
    cells.push(
      `<mxCell id="${xmlEscape(id)}" value="${attrEscape(e.label ?? '')}" ` +
      `style="${xmlEscape(edgeStyle)}" edge="1" parent="1" ` +
      `source="${xmlEscape(e.source)}" target="${xmlEscape(e.target)}">` +
      `<mxGeometry relative="1" as="geometry" />` +
      `</mxCell>`
    );
  }
  const model =
    `<mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" ` +
    `tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" ` +
    `pageWidth="850" pageHeight="1100" math="0" shadow="0">` +
    `<root>${cells.join('')}</root></mxGraphModel>`;
  return `<mxfile host="make-drawio-svg" type="device">` +
    `<diagram id="page-1" name="Page-1">${model}</diagram></mxfile>`;
}

function renderNode(n) {
  const rx = n.rounded ? 8 : 0;
  const fill = n.fill ?? '#ffffff';
  const stroke = n.stroke ?? '#000000';
  const fontColor = n.fontColor ?? '#000000';
  const cx = n.x + n.width / 2;
  const lines = String(n.label ?? '').split('\n');
  const lineHeight = 16;
  const startY = n.y + n.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map((ln, i) =>
      `<tspan x="${cx}" y="${startY + i * lineHeight + 5}">${xmlEscape(ln)}</tspan>`)
    .join('');
  return (
    `<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" ` +
    `rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />` +
    `<text text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="13" fill="${fontColor}">${tspans}</text>`
  );
}

function renderEdge(e, byId) {
  const s = byId.get(e.source);
  const t = byId.get(e.target);
  if (!s || !t) throw new Error(`Edge references unknown node: ${e.source} -> ${e.target}`);
  const sc = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
  const tc = { x: t.x + t.width / 2, y: t.y + t.height / 2 };
  const p1 = borderPoint(s, tc.x, tc.y);
  const p2 = borderPoint(t, sc.x, sc.y);
  const path =
    `<path d="M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}" fill="none" ` +
    `stroke="#333333" stroke-width="1.5" marker-end="url(#arrow)" />`;
  let label = '';
  if (e.label) {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const w = String(e.label).length * 7 + 8;
    label =
      `<rect x="${mx - w / 2}" y="${my - 10}" width="${w}" height="18" ` +
      `fill="#ffffff" stroke="none" />` +
      `<text x="${mx}" y="${my + 3}" text-anchor="middle" ` +
      `font-family="Helvetica, Arial, sans-serif" font-size="12" ` +
      `fill="#333333">${xmlEscape(e.label)}</text>`;
  }
  return path + label;
}

function build(spec) {
  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) {
    throw new Error('Spec must contain a non-empty "nodes" array.');
  }
  for (const n of spec.nodes) {
    for (const k of ['id', 'x', 'y', 'width', 'height']) {
      if (n[k] === undefined) throw new Error(`Node "${n.id ?? '?'}" missing "${k}".`);
    }
  }
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const pad = 20;
  const maxX = Math.max(...spec.nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...spec.nodes.map((n) => n.y + n.height));
  const width = maxX + pad;
  const height = maxY + pad;

  const defs =
    `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" ` +
    `orient="auto" markerUnits="strokeWidth">` +
    `<path d="M0,0 L8,3 L0,6 Z" fill="#333333" /></marker></defs>`;
  const edges = (spec.edges ?? []).map((e) => renderEdge(e, byId)).join('');
  const nodes = spec.nodes.map(renderNode).join('');
  const content = attrEscape(buildModel(spec));

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" ` +
    `content="${content}">` +
    defs +
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />` +
    edges + nodes +
    `</svg>\n`
  );
}

// ---------- extract command ----------

function unescapeAttr(s) {
  return s
    .replace(/&#10;/g, '\n')
    .replace(/&#xa;/gi, '\n')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

function extract(svgText) {
  // Grab the root <svg …> tag and read its content="" attribute.
  const openTag = svgText.match(/<svg\b[^>]*>/s);
  if (!openTag) throw new Error('No <svg> element found.');
  const m = openTag[0].match(/\scontent="([\s\S]*?)"/);
  if (!m) {
    throw new Error('This SVG has no embedded draw.io "content" attribute — it is not an editable .drawio.svg.');
  }
  return unescapeAttr(m[1]);
}

// ---------- CLI ----------

function parse(argv) {
  const args = { cmd: 'build', input: null, out: null };
  const rest = [...argv];
  if (rest[0] && !rest[0].startsWith('-')) {
    if (['build', 'extract'].includes(rest[0])) args.cmd = rest.shift();
  }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '-o' || a === '--out') args.out = rest[++i];
    else if (a === '-h' || a === '--help') { args.help = true; }
    else if (!a.startsWith('-') && args.input == null) args.input = a;
    else { throw new Error(`Unexpected argument: ${a}`); }
  }
  return args;
}

const HELP = `Author and inspect editable .drawio.svg diagrams.

Usage:
  node make-drawio-svg.mjs build <spec.json> -o <out.drawio.svg>
  node make-drawio-svg.mjs extract <in.drawio.svg>

build    Render a JSON node/edge spec to an editable .drawio.svg (default)
extract  Print the embedded draw.io mxfile XML from a .drawio.svg`;

function main() {
  let args;
  try { args = parse(process.argv.slice(2)); }
  catch (e) { console.error(e.message); process.exit(2); }
  if (args.help || !args.input) { console.log(HELP); process.exit(args.input ? 0 : 2); }

  try {
    if (args.cmd === 'extract') {
      const svg = readFileSync(args.input, 'utf8');
      process.stdout.write(extract(svg) + '\n');
      return;
    }
    // build
    const spec = JSON.parse(readFileSync(args.input, 'utf8'));
    const svg = build(spec);
    if (args.out) {
      writeFileSync(args.out, svg);
      console.error(`Wrote ${args.out}`);
    } else {
      process.stdout.write(svg);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(2);
  }
}

main();
