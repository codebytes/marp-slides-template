---
name: drawio-diagrams
description: Create and edit draw.io / diagrams.net diagrams as editable .drawio.svg files for embedding in Marp slides or docs. Use when the user asks to "make a draw.io diagram", "create a .drawio.svg", "add an architecture/flowchart diagram I can edit in draw.io", or wants an SVG that both renders as an image and reopens editable in draw.io. Covers the editable .drawio.svg format, authoring the mxGraphModel XML, a dependency-free helper that renders a node/edge spec, extracting/editing embedded XML, and embedding the result in slides. Prefer Mermaid for quick throwaway diagrams; use this when the diagram must stay editable in draw.io.
---

# draw.io Diagrams (.drawio.svg)

## What `.drawio.svg` is

A `.drawio.svg` is a normal SVG **plus** an editable draw.io model. The root
`<svg>` element carries a `content="…"` attribute holding the draw.io `mxfile`
XML, HTML-escaped. Because of this dual nature the same file:

- **renders as an image** in Markdown, Marp, browsers, and GitHub, and
- **reopens fully editable** in [draw.io / diagrams.net](https://app.diagrams.net),
  the desktop app, or the *Draw.io Integration* VS Code extension
  (`hediet.vscode-drawio`).

Store diagrams under `slides/img/` (per project convention) and embed them like
any other image:

```markdown
![center](img/architecture.drawio.svg)
![bg right](img/architecture.drawio.svg)
```

> Marp exports SVGs fine; for **PDF/PPTX** export of *local* files pass
> `--allow-local-files` to Marp CLI (the Pages workflow already does for PDF).

## Two ways to author

### A. Helper script (recommended for boxes-and-arrows)

`make-drawio-svg.mjs` (in this folder) renders a small JSON node/edge **spec**
to SVG shapes *and* embeds a matching `mxGraphModel`, so the output is editable
in draw.io with **no draw.io install and no npm packages** (plain Node).

```bash
# Build an editable diagram from a spec
node .github/skills/drawio-diagrams/make-drawio-svg.mjs build spec.json -o slides/img/flow.drawio.svg

# Print the embedded draw.io XML of an existing file (to inspect or edit)
node .github/skills/drawio-diagrams/make-drawio-svg.mjs extract slides/img/flow.drawio.svg
```

Spec format (`example.spec.json` is a complete sample; `example.drawio.svg` is
its rendered output):

```json
{
  "nodes": [
    { "id": "a", "label": "Start", "x": 200, "y": 40,
      "width": 140, "height": 50,
      "fill": "#d5e8d4", "stroke": "#82b366", "rounded": true },
    { "id": "b", "label": "Do work", "x": 200, "y": 140,
      "width": 140, "height": 60, "fill": "#dae8fc", "stroke": "#6c8ebf" }
  ],
  "edges": [
    { "source": "a", "target": "b", "label": "next" }
  ]
}
```

Node fields: `id` (required, unique), `label` (use `\n` for line breaks),
`x`/`y`/`width`/`height` (required, pixels), `fill`, `stroke`, `fontColor`,
`rounded` (bool), and optional `style` for raw draw.io style fragments
(e.g. `"shape=cylinder"`). Edge fields: `source`, `target` (node ids), optional
`label`, optional `orthogonal: true` for elbow routing.

Layout tips: lay nodes top-to-bottom or left-to-right on a ~20px grid; give
~40–60px gaps so straight edges do not cross boxes. draw.io re-routes edges with
its own algorithm on open, so exact edge paths may shift slightly — the node
geometry is authoritative and preserved.

### B. Hand-authored mxGraphModel

For richer diagrams, write the `mxGraphModel` XML yourself and use draw.io's
renderer. The model uses `<mxCell>` elements under `<root>`:

- `<mxCell id="0"/>` and `<mxCell id="1" parent="0"/>` are the required root layers.
- A **vertex**: `<mxCell id="n1" value="Label" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="120" height="60" as="geometry"/></mxCell>`
- An **edge**: `<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="n1" target="n2"><mxGeometry relative="1" as="geometry"/></mxCell>`

Wrap it as `<mxfile><diagram name="Page-1"><mxGraphModel>…</mxGraphModel></diagram></mxfile>`.
To turn hand-written XML into a rendered, editable file without a local draw.io
install, use the draw.io desktop CLI or its headless Docker image, e.g.:

```bash
# draw.io desktop CLI (renders AND embeds the source for editability)
drawio --export --format svg --embed-diagram diagram.drawio -o slides/img/diagram.drawio.svg
```

## Editing an existing diagram

1. `extract` the embedded XML: `make-drawio-svg.mjs extract file.drawio.svg > model.xml`.
2. Edit `model.xml` (change labels, add cells, adjust geometry), **or** just edit
   the original spec JSON if the file was built from one.
3. Regenerate: rebuild from the spec, or (for hand-authored XML) re-export with
   the draw.io CLI so the rendered shapes and embedded `content` stay in sync.
4. Easiest of all: open the `.drawio.svg` directly in the *Draw.io Integration*
   VS Code extension and edit visually — it saves the SVG + embedded model for you.

## When to use this vs Mermaid

- **Mermaid** (already supported in this template): fast, text-only, great for
  quick flowcharts/sequence diagrams rendered live in the deck. Not editable in
  draw.io.
- **draw.io `.drawio.svg`**: pixel-level control, custom shapes/colors, and it
  stays editable in a visual editor. Prefer it for architecture diagrams or any
  figure that will be revised in draw.io later.

## Verifying output

- The file must be well-formed XML and its root `<svg>` must have a `content`
  attribute — otherwise it renders but is **not** editable in draw.io.
- Quick check: `make-drawio-svg.mjs extract file.drawio.svg` should print a
  `<mxfile>…</mxfile>` document without error.
