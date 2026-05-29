# wesslen.github.io

Drift — an opinionated course on banking AI risk, published as a static blog.
Ten series (~30 posts) on GenAI and agentic-system risk in banking: governance, agent engineering, evals, adversarial testing, human oversight, and economics.
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
- Inter (body) + JetBrains Mono (code/UI labels) typography

## Deployment

Push to the `main` (or `gh-pages`) branch of `wesslen/wesslen.github.io`.
GitHub Pages will serve from the repo root at `https://wesslen.github.io/`.

No build step required.
---

## Theming

The blog uses a YAML-driven theme system. Edit **`theme.yaml`** in the repo root, then run:

```bash
npm install        # first time only — installs js-yaml
npm run build:theme
```

This rewrites the CSS custom properties in `style.css` in-place. No manual CSS editing needed for basic customization.

### Colors

```yaml
brand:
  primary: "#1a73e8"    # accent color — links, TOC active, h2 bars, progress bar, tags
  secondary: "#7c3aed"  # secondary accent — citations, h3 bars, IMPORTANT alert
```

Any valid CSS hex color works. After changing, run `npm run build:theme`.

### Fonts

```yaml
typography:
  body: "'Inter', system-ui, -apple-system, sans-serif"
  mono: "'JetBrains Mono', 'Fira Code', monospace"
  google_fonts: "https://fonts.googleapis.com/css2?family=Inter:..."
```

- `body` — prose text, nav, post titles
- `mono` — code blocks, inline code, and (if `edge.mono_ui_labels: true`) dates, read-time, and nav links
- `google_fonts` — update to match whichever fonts you specify above; the build script injects this as the `@import` at the top of `style.css`

### Presets

Three starting points are available via `preset:`:

| Preset | Description |
|--------|-------------|
| `professional-light` | White/light-gray surfaces, Google-blue accent, Inter + JetBrains Mono. Default. |
| `dark-editorial` | Dark navy background, amber accent, editorial feel. |
| `warm-minimal` | Off-white background, slate accent, warm sans. |

The preset sets all base values; individual `brand:`, `typography:`, and `surfaces:` keys override the preset.

### Surfaces & Radius

```yaml
surfaces:
  style: elevated    # elevated | flat | outlined
  radius: "8px"      # base border-radius; components scale relative to this
```

### Light / Dark Mode

```yaml
mode:
  default: light       # which theme loads on first visit: light | dark
  allow_toggle: true   # show the theme toggle button in the header
  code_dark_island: false  # keep code blocks dark even in light mode
```

### Personality flags

```yaml
edge:
  cursor_blink: true      # blinking › cursor appended to the site title
  mono_ui_labels: true    # dates, read-time, nav links use monospace font
  dot_grid_hero: true     # subtle dot-grid pattern in the hero background
  progress_bar: true      # thin reading-progress bar at viewport top
```

### Full example — swap to a purple-accented dark theme

```yaml
preset: dark-editorial
brand:
  primary: "#9f7aea"
  secondary: "#f6ad55"
typography:
  body: "'IBM Plex Sans', system-ui, sans-serif"
  mono: "'IBM Plex Mono', monospace"
  google_fonts: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400&display=swap"
surfaces:
  radius: "4px"
mode:
  default: dark
edge:
  mono_ui_labels: false
```

Then: `npm run build:theme`
