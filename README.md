# Marp Slides Template

[Use this template!](https://github.com/codebytes/marp-slides-template/generate)

Create a Marp presentation site that can be built and published on [GitHub Pages] using this minimal template. The site features:

- Marp integration with CSS variable-based theming
- A GitHub Pages / Actions workflow for build and publish ([See a preview](http://chris-ayers.com/marp-slides-template/))
- A DevContainer/CodeSpace configuration with Marp and Markdown preview extensions
- Support for PDF and PowerPoint export via Marp CLI v4

## Customization

Feel free to customize the sites created with this template as you like!

## Getting Started

1. Click "[use this template]" to create a new site.
2. Update the content of `slides/Slides.md` with your own presentation.

## Custom Themes

This template includes four custom themes in the `slides/themes` folder:

- **custom** - A minimal base theme
- **custom-default** - Based on the built-in default theme (recommended)
- **custom-gaia** - Based on the built-in gaia theme
- **custom-uncover** - Based on the built-in uncover theme

### Theme Customization with CSS Variables

All themes support CSS variable customization (Marp v4+ best practice):

```css
:root {
  --color-background: #ffffff;
  --color-foreground: #333333;
  --color-highlight: #0366d6;
  --color-dimmed: #6a737d;
}
```

### Available Theme Classes

| Class | Description |
|-------|-------------|
| `lead` | Centered title slide layout |
| `invert` | Dark theme for emphasis slides |
| `columns` | Two-column grid layout |
| `columns3` | Three-column grid layout |
| `small` | Smaller text for dense content |

Use with `<!-- _class: classname -->` directive, or combine: `<!-- _class: lead invert -->`

### Using a Theme

Add the theme reference in the frontmatter of your slide deck:

```markdown
---
marp: true
theme: custom-default
paginate: true
math: mathjax
---
```

For additional themes, add them to the devcontainer and follow the [Marp custom theme documentation](https://marpit.marp.app/theme-css).

## Marp Directives Quick Reference

| Directive | Description |
|-----------|-------------|
| `paginate: true` | Enable page numbers (frontmatter) |
| `math: mathjax` | Enable math equations (frontmatter) |
| `<!-- _paginate: skip -->` | Skip pagination on current slide |
| `<!-- _class: lead -->` | Centered title slide |
| `<!-- _class: invert -->` | Dark theme slide |
| `![bg](url)` | Full background image |
| `![bg left](url)` | Split background (left) |
| `![bg right](url)` | Split background (right) |
| `![bg opacity:0.3](url)` | Background with opacity |
| `# <!--fit--> Text` | Auto-fit text to slide width |

## Math Equations

Enable with `math: mathjax` in frontmatter:

```markdown
Inline: $E = mc^2$

Block:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## Mermaid Diagrams

Include this script tag once per slide deck to enable Mermaid diagrams:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

Then use Mermaid syntax in a div:

```html
<div class="mermaid">
flowchart LR
    A[Start] --> B[End]
</div>
```

## Publishing on GitHub Pages

1. In your GitHub repo, navigate to `Settings` > `Pages` > `Build and deployment`.
2. Select `Source`: `GitHub Actions`.
3. If any Actions failed, go to the `Actions` tab and click on `Re-run jobs`.

## Local Build and Preview

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install the [Marp for VS Code extension](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode).
3. Open `slides/Slides.md` in VS Code.

### CLI Export (Optional)

Install Marp CLI for PDF/PPTX export:

```bash
npm install -g @marp-team/marp-cli

# Export to PDF
marp --theme-set slides/themes --pdf slides/Slides.md

# Export to PPTX
marp --theme-set slides/themes --pptx slides/Slides.md
```

> **Note:** Marp CLI v4 requires Node.js 18+ and supports both Chrome and Firefox for rendering.

## Licensing and Attribution

This repository is licensed under the [MIT License]. Reuse or extend the code as you wish, but include the original license. The deployment GitHub Actions workflow is based on GitHub's starter workflows.

## Resources

- [Use this template](https://github.com/codebytes/marp-slides-template/generate)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [CommonMark Markdown Syntax](https://commonmark.org/help/)
- [Marp Official Repository](https://github.com/marp-team/marp)
- [Marpit Framework Documentation](https://marpit.marp.app/markdown)
- [Marp CLI v4 Documentation](https://github.com/marp-team/marp-cli)
- [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)