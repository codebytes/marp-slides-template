- All slides must be written in Markdown format and use the [Marp](https://marp.app/) framework.
- Each slide deck must include the following frontmatter:
  ```yaml
  ---
  marp: true
  theme: custom-default
  paginate: true
  math: mathjax
  ---
  ```
- Use HTML comments (`<!-- -->`) for speaker notes.
- Use local directives for slide-specific settings:
  - `<!-- _class: lead -->` for title slides
  - `<!-- _class: invert -->` for dark slides
  - `<!-- _class: columns -->` for two-column layout
  - `<!-- _class: small -->` for dense content
  - `<!-- _paginate: skip -->` to hide page number
- Include the Mermaid script tag when using diagrams:
  ```html
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
  ```
- Store slide decks in the `slides/` directory.
- Store custom themes in `slides/themes/`.
- Store images in `slides/img/`.
- Use CSS variables for theme customization (see `slides/themes/custom-default.css`).
- Ensure compatibility with Marp CLI v4 for PDF and presentation generation.
