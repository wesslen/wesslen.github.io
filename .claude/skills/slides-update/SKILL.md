---
name: slides-update
description: >
  Workflow guide for editing, rebuilding, and publishing slide decks across the my-deck + wesslen.github.io system.
  Use this skill whenever the user wants to: edit existing slides in my-deck, add new slides to a series, rebuild a deck
  after making changes, mark a deck as published in slides.json, push slides live to GitHub Pages, add a brand-new series,
  fix a deck that looks broken, or understand how the slides pipeline works. Trigger on phrases like "update the slides",
  "fix the deck", "rebuild the slides", "push the slides live", "publish the deck", "add a new series", "the slides look
  wrong", or any request that touches either the my-deck or wesslen.github.io/slides/ directories.
---

# Slides Update Workflow

The slides system has two repos and three phases:

```
my-deck/slides/<series-id>/   ← source of truth (React/TSX slide content)
         │
         │  npm run build:static <series-id>
         ▼
wesslen.github.io/slides/<series-id>/   ← built output (HTML + hashed JS bundle)
         │
         │  git push origin main
         ▼
GitHub Pages  ←  live at wesslen.github.io/slides/<series-id>/
```

The key constraint: open-slide's SPA uses BrowserRouter with no basename, so it can only run at a domain root. Static export (one Vite build per series) produces a self-contained `index.html` + hashed bundle that deploys from any subdirectory.

---

## Phase 1 — Edit slides in my-deck

Slide content lives in:
```
my-deck/slides/<series-id>/index.tsx   ← slide components + meta export
my-deck/slides/<series-id>/index.ts    ← (some series use .ts instead of .tsx)
my-deck/assets/                        ← shared images/icons
```

The `index.tsx` file must export:
- A **default export** — the slide deck array (array of React components or objects the Viewer knows how to render)
- A named **`meta` export** — `{ title: string }` used for the browser tab title and the slides.html card

**Series ID rule**: every folder name under `my-deck/slides/` must be a valid `SeriesId` as defined in `my-deck/scripts/series-map.ts`. TypeScript will error at build time if the name isn't in the union type.

---

## Phase 2 — Build (dev preview)

From the `my-deck/` directory:

```bash
# Build one deck
npm run build:static <series-id>

# Example
npm run build:static adversarial-testing
```

Output lands in `wesslen.github.io/slides/<series-id>/`:
- `index.html` — HTML shell referencing the new hashed bundle
- `assets/index-<hash>.js` — full React + Viewer + deck bundle

**Known filesystem constraint:** `emptyOutDir: false` in the Vite config means old bundles accumulate in `assets/` when you rebuild. The old `.js` files are never referenced by `index.html` and don't affect the live site — but they add dead weight. Delete them manually if you have direct filesystem access; they can't be deleted from the mnt sandbox.

After building, open `wesslen.github.io/slides/<series-id>/index.html` locally to confirm the deck renders correctly before publishing.

---

## Phase 2b — Export PDF

The PDF is generated manually using open-slide's built-in UI export. The output must be saved as `index.pdf` in the same deck folder:

```
wesslen.github.io/slides/<series-id>/index.pdf
```

Steps:
1. Open the deck locally (or at the live URL) in the open-slide viewer
2. Use open-slide's PDF export feature (built into the UI) to export all slides
3. Save the result as `index.pdf` directly into `wesslen.github.io/slides/<series-id>/`

The `slides.html` landing page links to `./${deck.dir}/index.pdf` with a `download` attribute — this only works if `index.pdf` exists. Without it the download button 404s. **Always export the PDF before marking a deck published.**

Future automation: Puppeteer or a headless Chrome screenshot pipeline could replace this manual step, but the open-slide UI export produces clean output and is the current process.

---

## Phase 3 — Publish

Three steps before pushing:

**1. Confirm `index.pdf` exists** in `wesslen.github.io/slides/<series-id>/` — see Phase 2b above. If it doesn't exist, the download button on slides.html will 404.

**2. Update `wesslen.github.io/slides/slides.json`** — this controls what appears on the slides landing page. Find the deck's entry and set `published: true` and `date` to today:

```json
{
  "id": "adversarial-testing",
  "title": "Adversarial Testing",
  "description": "...",
  "postUrl": "/posts/adversarial-workflow",
  "published": true,
  "date": "2026-05-18"
}
```

Decks with `published: false` show as "coming soon" cards on `wesslen.github.io/slides.html` and don't link to the viewer.

**3. Push `wesslen.github.io` to remote main:**

```bash
cd wesslen.github.io
git add slides/<series-id>/ slides/slides.json
git commit -m "slides: publish <series-id> deck"
git push origin main
```

GitHub Pages rebuilds automatically. The deck goes live within ~1 minute at:
`https://wesslen.github.io/slides/<series-id>/`

---

## Adding a new series

1. **Register the series ID** — add it to the `SeriesId` union type in `my-deck/scripts/series-map.ts`, and add the deck to `DECK_IDS` when you're ready to build it.

2. **Create the slide folder** — `my-deck/slides/<new-series-id>/index.tsx` with a default export (deck array) and named `meta` export.

3. **Add to slides.json** — add a new entry in `wesslen.github.io/slides/slides.json` with `published: false` initially.

4. **Build and preview** — `npm run build:static <new-series-id>` from `my-deck/`.

5. **Export PDF** — open the built deck in open-slide, use the UI export, save as `wesslen.github.io/slides/<new-series-id>/index.pdf`.

6. **Publish** — set `published: true` in slides.json and push.

---

## Viewer behavior

The Viewer (`my-deck/scripts/viewer/Viewer.tsx`) uses a two-wrapper CSS scale pattern:
- **Outer wrapper**: sized to `scaledW × scaledH` — this is what flexbox sees
- **Inner canvas**: 1920×1080 with `transform: scale(s)` and `transformOrigin: '0 0'`

This prevents the classic CSS transform/layout mismatch where scaling doesn't affect the layout box. If slides appear clipped or offset, the Viewer.tsx is likely the culprit — re-check that `scaledW = round(1920 * scale)` and the inner div uses `position: absolute; top: 0; left: 0`.

---

## Key file reference

| File | Purpose |
|------|---------|
| `my-deck/scripts/series-map.ts` | Single source of truth — SeriesId union type + DECK_IDS |
| `my-deck/scripts/build-static.ts` | Per-series Vite build orchestrator |
| `my-deck/scripts/viewer/Viewer.tsx` | Slide viewer component (two-wrapper scaling) |
| `wesslen.github.io/slides/slides.json` | Manifest — controls which decks appear on the landing page |
| `wesslen.github.io/slides.html` | Landing page that reads slides.json |
| `wesslen.github.io/slides/<id>/index.html` | Built viewer entry point (references hashed bundle) |
| `wesslen.github.io/slides/<id>/index.pdf` | PDF export for download (manually exported from open-slide UI) |

---

## Quick reference

```bash
# Edit slides
vim my-deck/slides/<series-id>/index.tsx

# Build
cd my-deck && npm run build:static <series-id>

# Preview (open in browser)
open wesslen.github.io/slides/<series-id>/index.html

# Publish
# 1. Set published: true in wesslen.github.io/slides/slides.json
# 2. git add + commit + push in wesslen.github.io

# Build all decks at once
cd my-deck && for deck in agentic-governance agentic-engineering multi-agent human-in-the-loop adversarial-testing banking-ai; do npm run build:static $deck; done
```

---

## Known gaps

- **Stale bundles**: Old hashed `.js` files accumulate in `assets/` on rebuild. Harmless, but worth manual cleanup when you have direct filesystem access.
- **PDF automation**: PDF export is currently manual (open-slide UI). A future Puppeteer pipeline could automate this, but the current manual export is clean and reliable.
