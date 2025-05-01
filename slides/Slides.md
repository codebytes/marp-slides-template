---
marp: true
theme: custom-default
footer: 'https://example.com'
---

# 1. Sample Presentation
![bg right](https://picsum.photos/800/600)

---

<!-- Speaker Notes -->
## 2. Speaker nots and Lists

- Item 1
- Item 2
- Item 3
<!-- Can have multiple on a slide -->

---

## 3. Speaker notes and images
<!-- Can also do a multiline
comment that will show in notes -->

![Image](https://picsum.photos/800/600)

---

## 4. Centered images

You can center images

![center](https://picsum.photos/800/600)

---

## 5. Slide 4

> This is a quote.

---

## 6. Tables

| Column 1 | Column 2 |
| -------- | -------- |
| Item 1   | Item 2   |
| Item 3   | Item 4   |

---

![bg opacity](https://picsum.photos/800/600?image=53)
## 7. Columns

<div class="columns">
<div>

## Left

- 1
- 2

</div>
<div>

## Right

- 3
- 4

</div>
</div>

---

## 8. Icons

<i class="fa-brands fa-twitter"></i> Twitter: 
<i class="fa-brands fa-mastodon"></i> Mastodon: 
<i class="fa-brands fa-linkedin"></i> LinkedIn: 
<i class="fa fa-window-maximize"></i> Blog: 
<i class="fa-brands fa-github"></i> GitHub: 

---

# 9. <!--fit--> Large Text

---

<!-- Needed for mermaid, can be anywhere in file except frontmatter -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>

# 10. Mermaid

<div class="mermaid">
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
</div>
