- All slides must be written in Markdown format and use the [Marp](https://marp.app/) framework.
- frontmatter Each slide deck must include the following frontmatter:
   ```yaml
   ---
   marp: true
   theme: custom-default
   ---
   ```
- speaker notes - Use HTML comments (`<!-- -->`) for speaker notes.
- Mermaid diagrams - Include the necessary `<script>` tag for Mermaid.js when diagrams are used.
- Slide decks should be stored in the `slides` directory.
- Custom themes or assets should be stored in appropriate subdirectories under `slides`.
- Follow Marp best practices for layout and styling.
- Ensure compatibility with Marp CLI for PDF and presentation generation.
