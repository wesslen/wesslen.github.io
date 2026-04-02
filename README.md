# wesslen.github.io

A static blog for data science, machine learning, and GenAI writing.
No build step. No Jekyll. Just HTML, CSS, JavaScript, and `.md` files.

---

## How it works

- **`index.html`** — fetches `posts/index.json` and renders the post list
- **`post.html`** — reads `?slug=foo` from the URL, fetches `posts/foo.md`, and renders it with `marked.js`
- **`style.css`** — all styles (dark/light theme, dot-grid, animations)
- **`posts/index.json`** — the post manifest (title, slug, date, description, tags)
- **`posts/*.md`** — the actual post content with YAML frontmatter

## Adding a new post

**Step 1:** Drop a `.md` file into `posts/`.

```
posts/my-new-post.md
```

Use YAML frontmatter at the top:

```markdown
---
title: "My Post Title"
date: 2026-04-01
description: "A short description for the post card."
tags: [python, GenAI]
---

Your content here...
```

**Step 2:** Add an entry to `posts/index.json`:

```json
{
  "slug": "my-new-post",
  "title": "My Post Title",
  "date": "2026-04-01",
  "description": "A short description for the post card.",
  "tags": ["python", "GenAI"]
}
```

That's it. Commit and push — GitHub Pages serves it automatically.

---

## Running locally

Since `index.html` and `post.html` use `fetch()` for relative paths, you need a local HTTP server (not `file://`):

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

## Features

- Dark/light mode toggle (persists in `localStorage`)
- Reading progress bar at top of viewport
- Estimated read time (calculated from word count)
- Auto-generated table of contents from `<h2>` and `<h3>` headings
  - Sticky sidebar on wide screens (≥ 1200px)
  - Collapsible panel on mobile
- Active heading tracking in TOC
- Syntax highlighting via highlight.js (GitHub Dark theme)
- Copy button on code blocks
- Tag pills with deterministic per-tag color
- Hover shimmer + accent left border on post cards
- Dot-grid notebook background on hero
- IBM Plex Mono + IBM Plex Sans typography

## Deployment

Push to the `main` (or `gh-pages`) branch of `wesslen/wesslen.github.io`.
GitHub Pages will serve from the repo root at `https://wesslen.github.io/`.

No build step required.