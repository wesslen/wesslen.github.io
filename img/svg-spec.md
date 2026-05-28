# SVG Design Token Spec

Reference for creating and editing SVGs in `/img/`. All values are hardcoded hex — CSS variables do **not** resolve in external SVG files loaded via `<img src>`. Never use `var(--...)` in any SVG saved here.

---

## Non-negotiable rules

1. **No CSS variables.** Every color must be a literal hex, rgb(), or rgba() value.
2. **Always include accessibility attributes.** Add `role="img"` on the `<svg>` element, and a `<title>` + `<desc>` block inside it (or `aria-labelledby` pointing to them). See accessibility section below.
3. **Always include an explicit background rect.** SVGs load on both light and dark pages. Pick a background color that makes the diagram self-contained.
4. **Use hardcoded `viewBox`.** Standard width is 640–700px. Height varies by archetype.
5. **Font stacks must be self-contained.** No Google Fonts imports. Use system stacks (see typography section).

---

## Color tokens

### Dark editorial (scorecards, nested containment, terminal-style diagrams)

Dark-background SVGs that render as "dark islands" regardless of page theme. Matches the blog's code-block aesthetic.

**Backgrounds / surfaces**
```
#161b27   — deep navy canvas (primary dark background, most diagrams)
#0d0d0d   — near-black terminal (high-contrast scorecards)
#161b22   — dark code-bg (label popouts, callout rectangles)
#07111e   — dark blue tint (gate/section background)
#120e00   — dark amber tint (warning section background)
#130707   — dark red tint (danger section background)
```

**Primary violet accent** (headings, key borders, nesting rings)
```
#a78bfa                    — violet primary label text
rgba(167,139,250,0.05)     — nesting fill, outermost layer
rgba(167,139,250,0.08)     — nesting fill, layer 2
rgba(167,139,250,0.11)     — nesting fill, layer 3
rgba(167,139,250,0.15)     — nesting fill, layer 4
rgba(167,139,250,0.19)     — nesting fill, layer 5
rgba(167,139,250,0.27)     — nesting fill, innermost layer
rgba(167,139,250,0.22–0.72) — nesting border opacity, scales with depth
```

**Semantic accent colors** (color encodes meaning)
```
#4a9eff   — capability / info / Gate 1 (blue)
#2d5080   — muted blue for italic annotations
#f0a500   — warning / Gate 2 (amber)
#7a5e00   — muted amber for italic annotations
#e05252   — danger / collapse / Gate 3 (red)
#7a2020   — muted red for italic annotations
#5cb85c   — pass / success (green)
#d4a017   — borderline / at-ceiling (warning amber variant)
```

**Text on dark backgrounds**
```
#ddd      — primary label text
#ccc      — table data, body text
#aaa      — secondary data, deltas
#94a3b8   — metadata, descriptions, italic subtitles
#8b949e   — axis labels, zone labels, footers (GitHub slate)
#555      — footer/annotation text (very muted)
#444      — column headers (nearly invisible on dark, intentional)
```

**Structural lines on dark**
```
#2a2a2a   — separator lines
#1a2a40   — section dividers (blue-tinted dark)
#261e00   — section dividers (amber-tinted dark)
#260f0f   — section dividers (red-tinted dark)
#222      — outer frame border
```

---

### Light editorial (flowcharts, annotated formulas, process diagrams)

White/near-white background. Renders cleanly in both page themes since the background is explicit.

**Backgrounds / surfaces**
```
#f9fafb   — standard light canvas (Gray-50)
#fafaf9   — warm white (for math/formula diagrams)
#eff6ff   — light blue tint (decision diamond fill)
#fff1f2   — light red tint (exit / stop node)
```

**Text on light backgrounds**
```
#111827   — near-black, primary headings (Gray-900)
#374151   — body text, formula symbols (Gray-700)
#6b7280   — subtitle / secondary labels (Gray-500)
#9ca3af   — annotations, muted captions (Gray-400)
```

**Borders on light**
```
#d1d5db   — standard box border (Gray-300)
#e2e8f0   — outer frame / very subtle (Slate-200)
#fca5a5   — exit/error node border (Red-300)
#93c5fd   — decision diamond border (Blue-300)
```

**Semantic colors on light backgrounds**
```
#15803d   — guessing floor / floor values (Green-700)
#b45309   — discrimination / slope parameter (Amber-700)
#6d28d9   — model ability / key variable (Violet-700)
#b91c1c   — item difficulty / hard threshold (Red-700)
#dc2626   — EXIT / stop state (Red-600)
#2563eb   — branch labels / interactive (Blue-600)
```

---

### Data visualization (charts, timelines, welfare curves)

**Curve / line colors**
```
#38bdf8   — primary data line (sky blue, high contrast on dark)
#d4a843   — secondary data line (gold, warm contrast)
#a78bfa   — threshold / optimum markers (violet)
#e05252   — collapse / danger curve
#8b949e   — reference / baseline / muted dotted curves
```

**Zone fill alphas**
```
rgba(56,189,248,0.07)    — info zone tint (sky blue, light)
rgba(56,189,248,0.05)    — info zone tint (sky blue, very light)
rgba(167,139,250,0.05)   — neutral zone tint (violet, light)
rgba(139,148,158,0.04)   — gray zone tint (very muted)
rgba(224,82,82,0.09)     — danger zone tint (red)
```

**Axes and structure**
```
#444c56   — axis lines, tick marks
#8b949e   — axis labels, legend text
```

**Annotation callouts**
```
#d97706   — cost/warning callout text (Amber-600)
#a78bfa   — key-point callout text (violet)
```

---

## Typography

Each diagram type has a primary font stack. Never mix stacks within a single diagram.

**`monospace`** — data tables, scorecards, gate diagrams, anything with numbers in columns
```
font-family="ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace"
```

**`sans-serif`** — flowcharts, process diagrams, labeled boxes with prose
```
font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
```
or as a style attribute on the `<svg>` element:
```
style="font-family:ui-sans-serif,system-ui,sans-serif;"
```

**`serif`** — annotated mathematical formulas only
```
font-family="Georgia,'Times New Roman',serif"
```

**Font sizes**
```
8–8.5px    — column headers, footnote captions, axis ticks
9–9.5px    — annotations, callout labels, table subtitles
10–11px    — axis labels, zone labels, metadata
12–13px    — body labels, standard text
13.5px     — section headings in nested diagrams
22px       — formula symbols (serif math diagrams only)
```

---

## ViewBox conventions

Standard width is 640–700px. Always specify `viewBox` (not `width`/`height`) so the browser scales it.

```
viewBox="0 0 640 165"   — formula/annotation strip (single equation)
viewBox="0 0 640 250"   — compact timeline / two-phase diagram
viewBox="0 0 640 320"   — line chart / data viz
viewBox="0 0 640 360"   — nested containment diagram
viewBox="0 0 700 388"   — table/scorecard (wide columns need room)
viewBox="0 0 680 620"   — tall flowchart (6+ steps)
```

Always include `xmlns="http://www.w3.org/2000/svg"` on the root element.

---

## Accessibility template

Every SVG must include these attributes. The `<title>` is the short alt text; `<desc>` is the detailed description for screen readers.

```svg
<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" role="img"
     font-family="ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace">
  <title>Short, specific title (same as the img alt text in the post)</title>
  <desc>Full description: what the diagram shows, what the key values or
  relationships are, and what conclusion a reader should draw.</desc>

  <!-- diagram content -->
</svg>
```

---

## Arrow markers

Standard reusable `<defs>` block for directed arrows. Copy as needed:

```svg
<defs>
  <!-- Primary arrow (dark, for main flow on light backgrounds) -->
  <marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#374151"/>
  </marker>
  <!-- Loop arrow (muted, for dashed return paths) -->
  <marker id="arr-loop" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#9ca3af"/>
  </marker>
</defs>
```

Usage: `marker-end="url(#arr)"` on any `<line>` or `<path>`.

---

## Diagram archetypes

### 1. Nested containment
**When:** Hierarchical abstraction (e.g., eval-stack-diagram.svg — logs > traces > rollouts > metrics).
**Background:** `#161b27`. Layers use violet alpha fills increasing in opacity inward.
**Font:** `ui-sans-serif,system-ui,sans-serif`
**Pattern:** Concentric `<rect>` elements. Label at top-left in `#a78bfa`. Subtitle at top-right in `#94a3b8` italic. Bottom-left corner holds axis legend text.

### 2. Gate / scorecard table
**When:** Tabular comparison with pass/fail status (e.g., deployment-gates-scorecard.svg).
**Background:** `#0d0d0d`. Each section has its own background tint and border color.
**Font:** `ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace`
**Pattern:** Color-coded header strip per section (blue/amber/red). Column headers in `#444`. Alternating row tints. Status in `#5cb85c` (pass) or `#e05252` (fail). Summary bar at bottom.

### 3. Flowchart
**When:** Step-by-step process with a decision branch (e.g., molmoweb-harness-loop.svg).
**Background:** `#f9fafb`. Boxes use `#f9fafb` fill, `#d1d5db` border.
**Font:** `-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`
**Pattern:** Rectangular process boxes, diamond decision node via `<polygon>`, arrows via `<marker>`. Loop paths are dashed with `#9ca3af`. YES/NO labels in `#2563eb` italic. Exit node: `#fff1f2` / `#fca5a5`.

### 4. Annotated formula
**When:** A single mathematical equation with labeled terms (e.g., irt-3pl-annotated.svg).
**Background:** `#fafaf9` with `#e2e8f0` frame.
**Font:** Serif (`Georgia`) for formula; sans-serif for annotation labels.
**Pattern:** Formula centered ~y=90. Callout lines (`stroke-width="1.5"`) with short tick marks at ends. Labels above/below in semantic colors per term. Footer caption in `#9ca3af`.

### 5. Line chart / data viz
**When:** Curves over a continuous variable, threshold markers (e.g., knowledge-collapse-welfare-curve.svg).
**Background:** Transparent (no explicit fill rect) — relies on zone fills for visual grounding.
**Font:** `ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace`
**Pattern:** `<line>` axes in `#444c56`. Dashed vertical thresholds in semantic color. Curves as `<path>` with `stroke-linecap="round"`. Key-point `<circle>` dots at r=5. Zone fills as `<rect>` alphas behind everything. Callout rects with `#161b22` fill for label contrast.

### 6. Two-phase timeline
**When:** Before/after or suppression/restoration patterns (e.g., knowledge-collapse-garbling-policy.svg).
**Background:** Phase fills as `rgba` tints. No outer background rect.
**Font:** `ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace`
**Pattern:** Vertical dashed divider at phase boundary. Phase header labels in accent colors. Two lines (curved + flat) for dual variables. Inline rect labels with `#161b22` fill.

---

## SVG index

| File | Archetype | Status | Posts |
|------|-----------|--------|-------|
| `eval-stack-diagram.svg` | Nested containment | ✓ Good | nist-benchmark-evals |
| `deployment-gates-scorecard.svg` | Gate scorecard | ✓ Good | deployment-gates |
| `molmoweb-harness-loop.svg` | Flowchart | ✓ Good | molmoweb-openness-gap |
| `irt-3pl-annotated.svg` | Annotated formula | ✓ Good | metrics-metrics-metrics |
| `knowledge-collapse-welfare-curve.svg` | Line chart | ✓ Good | knowledge-collapse-economics |
| `knowledge-collapse-garbling-policy.svg` | Two-phase timeline | ✓ Good | knowledge-collapse-economics |
| `accuracy-estimands.svg` | Line chart (estimands) | ✗ CSS vars — needs fix | benchmark-uncertainty |
| `glmm-hierarchy.svg` | Nested/hierarchy | ✗ CSS vars — needs fix | benchmark-uncertainty |
| `process-outcome-2x2.svg` | 2×2 matrix | ✗ CSS vars — needs fix | gui-agents-verifier |
| `deployment-gates-pipeline.svg` | Pipeline flow | ✗ Orphaned + CSS vars | (unreferenced) |

---

## Pre-save checklist

- [ ] Zero instances of `var(--` anywhere in the file
- [ ] `role="img"` on root `<svg>`
- [ ] `<title>` and `<desc>` present and accurate
- [ ] Explicit background `<rect>` (or intentionally transparent with documented reason)
- [ ] `viewBox` set; no absolute `width`/`height` on root element
- [ ] File saved to `/img/` with a descriptive kebab-case name
- [ ] Post references the file as `../img/filename.svg`
- [ ] Alt text on the post-side `<img>` matches the SVG's `<title>`
