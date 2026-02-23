---
marp: true
theme: custom-default
paginate: true
footer: 'https://example.com'
math: mathjax
---

<!-- _paginate: skip -->
<!-- _footer: "" -->
<!-- _class: lead -->

# Sample Presentation

A template demonstrating Marp best practices

![bg right](https://picsum.photos/800/600)

---

## Speaker Notes and Lists

<!-- Speaker notes go in HTML comments like this -->

- Use HTML comments for speaker notes
- Notes are visible in presenter view
- Keep bullet points concise

<!-- You can have multiple comment blocks on a slide -->

---

## Speaker Notes with Images

<!-- Multiline speaker notes work too.
This will all appear in presenter view. -->

![Image](https://picsum.photos/800/600)

---

## Centered Images

Use `![center]` alt text to center images

![center](https://picsum.photos/400/300)

---

## Blockquotes

> "Keep slides concise with key points only."
>
> — Marp Best Practices

---

## Tables

| Feature | Description |
|---------|-------------|
| Themes  | Built-in and custom CSS |
| Images  | Background and inline |
| Export  | HTML, PDF, PPTX |

---

# Two-Column Layout

<div class="columns">

<div>

## Left Column

- Point 1
- Point 2
- Point 3

</div>
<div>

## Right Column

- Point A
- Point B
- Point C

</div>
</div>

---

<!-- _class: columns -->

# Two-Column Layout (Class)

## Left Column

- Point 1
- Point 2
- Point 3

## Right Column

- Point A
- Point B
- Point C

---

![bg opacity:0.3](https://picsum.photos/800/600?image=53)

## Background with Opacity

Use `![bg opacity:0.3]` for subtle backgrounds

---

<!-- _class: invert -->

## Dark Slide (Invert)

Use `<!-- _class: invert -->` for dark themed slides

- Great for emphasis
- Improved contrast for certain content
- Works with code blocks too

---

## Math Equations

Enable with `math: mathjax` in frontmatter

Inline: $E = mc^2$

Block equation:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

---

## Social Icons

<i class="fa-brands fa-github"></i> GitHub
<i class="fa-brands fa-linkedin"></i> LinkedIn
<i class="fa-brands fa-mastodon"></i> Mastodon
<i class="fa-brands fa-bluesky"></i> Bluesky
<i class="fa-brands fa-youtube"></i> YouTube
<i class="fa fa-window-maximize"></i> Blog

---

# <!--fit--> Auto-fit Text

Use `<!--fit-->` to scale text to slide width

---

<!-- Mermaid.js for diagrams - place script once per deck -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>

## Mermaid Diagrams

<div class="mermaid">
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
</div>

---

## Code Blocks

```javascript
// Syntax highlighting works out of the box
const greeting = (name) => {
  return `Hello, ${name}!`;
};
```

---

<!-- _class: small -->

## Dense Content (Small Text)

Use `<!-- _class: small -->` for slides with more content

| Method | Description | Returns |
|--------|-------------|---------|
| `GET` | Retrieve resource | 200 OK |
| `POST` | Create resource | 201 Created |
| `PUT` | Update resource | 200 OK |
| `DELETE` | Remove resource | 204 No Content |

- Additional bullet points fit better
- More information per slide when needed
- Use sparingly for readability

---

<!-- _paginate: skip -->
<!-- _footer: "" -->
<!-- _class: lead invert -->

# <!--fit--> Thank You!

Questions?
