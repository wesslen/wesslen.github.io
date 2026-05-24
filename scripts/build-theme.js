#!/usr/bin/env node
/**
 * build-theme.js — Drift theme builder
 *
 * Reads theme.yaml, resolves a preset + overrides, derives the full CSS
 * variable palette, and rewrites the :root and [data-theme] blocks inside
 * style.css in-place.  Also updates the Google Fonts @import line.
 *
 * Usage:  node scripts/build-theme.js [--dry-run]
 */

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT    = path.resolve(__dirname, '..');
const THEME   = path.join(ROOT, 'theme.yaml');
const STYLE   = path.join(ROOT, 'style.css');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Preset definitions ────────────────────────────────────────────────────
const PRESETS = {
  'professional-light': {
    // Light surfaces (default / :root)
    bg:           '#ffffff',
    surface:      '#f8f9fa',
    surface2:     '#f1f3f4',
    border:       '#e8eaed',
    borderStrong: '#dadce0',
    text:         '#202124',
    muted:        '#5f6368',
    // Dark surfaces ([data-theme="dark"])
    dark: {
      bg:           '#1c2128',
      surface:      '#22272e',
      surface2:     '#2d333b',
      border:       '#373e47',
      borderStrong: '#444c56',
      text:         '#cdd9e5',
      muted:        '#768390',
    },
    // Alert semantic colours (same in both modes unless overridden)
    alertTip:     '#1e8e3e',
    alertWarn:    '#b45309',
    alertCaution: '#dc2626',
  },

  'dark-editorial': {
    bg:           '#0d1117',
    surface:      '#161b22',
    surface2:     '#1e2530',
    border:       '#30363d',
    borderStrong: '#444c56',
    text:         '#e6edf3',
    muted:        '#8b949e',
    dark: null,   // no dark toggle — already dark
    alertTip:     '#3fb950',
    alertWarn:    '#d29922',
    alertCaution: '#f85149',
  },

  'warm-minimal': {
    bg:           '#fafaf8',
    surface:      '#f5f4f0',
    surface2:     '#eeedea',
    border:       '#dedad4',
    borderStrong: '#c9c5be',
    text:         '#1a1916',
    muted:        '#6b6760',
    dark: {
      bg:           '#1a1916',
      surface:      '#232220',
      surface2:     '#2d2c29',
      border:       '#3d3b37',
      borderStrong: '#4d4b46',
      text:         '#e8e6e1',
      muted:        '#9e9b94',
    },
    alertTip:     '#2d7a3a',
    alertWarn:    '#a16207',
    alertCaution: '#c0392b',
  },
};

// ─── Colour helpers ────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbStr(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

// Darken a hex colour by a ratio (0–1)
function darken(hex, ratio) {
  const { r, g, b } = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.round(v * (1 - ratio)));
  return '#' + [d(r), d(g), d(b)].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ─── Build variable blocks ─────────────────────────────────────────────────
function buildVars(theme, surfaces, isDark) {
  const p  = theme.brand.primary;
  const s  = theme.brand.secondary;
  const r  = theme.surfaces.radius;
  const ci = theme.mode.code_dark_island;
  const ml = theme.edge.mono_ui_labels;

  const fontLabel = ml
    ? theme.typography.mono
    : theme.typography.body;

  // Code colours — dark island keeps code dark in light mode; off = follow page mode
  // Light mode light: GitHub-style off-white + near-black (Mac Terminal Basic feel)
  const codeBg   = isDark
    ? '#161b22'
    : (ci ? '#1e2228' : '#f6f8fa');
  const codeText = isDark
    ? '#e6edf3'
    : (ci ? '#79b8ff' : '#24292e');

  // Shadows — only for "elevated" style; empty strings for flat/outlined
  const elev = theme.surfaces.style === 'elevated';
  const shadowBase = isDark
    ? 'rgba(0,0,0,0.35)'
    : 'rgba(60,64,67,0.12)';
  const shadowBase2 = isDark
    ? 'rgba(0,0,0,0.25)'
    : 'rgba(60,64,67,0.07)';

  const shadowSm = elev
    ? `0 1px 3px ${shadowBase}, 0 1px 2px ${shadowBase2}`
    : 'none';
  const shadowMd = elev
    ? `0 2px 8px ${shadowBase}, 0 1px 4px ${shadowBase2}`
    : 'none';
  const shadowLg = elev
    ? `0 4px 20px ${shadowBase}, 0 2px 8px ${shadowBase2}`
    : 'none';

  return `
  /* ── Surfaces ── */
  --bg:            ${surfaces.bg};
  --surface:       ${surfaces.surface};
  --surface-2:     ${surfaces.surface2};
  --border:        ${surfaces.border};
  --border-strong: ${surfaces.borderStrong};
  --text:          ${surfaces.text};
  --muted:         ${surfaces.muted};

  /* ── Brand accent ── */
  --accent:        ${p};
  --accent-rgb:    ${rgbStr(p)};
  --accent-dim:    ${rgba(p, 0.10)};
  --accent-glow:   ${rgba(p, 0.22)};
  --accent-hover:  ${darken(p, 0.10)};

  /* ── Secondary accent (citations, h3, IMPORTANT) ── */
  --accent2:       ${s};
  --accent2-rgb:   ${rgbStr(s)};
  --accent2-dim:   ${rgba(s, 0.10)};

  /* ── Code ── */
  --code-bg:       ${codeBg};
  --code-text:     ${codeText};

  /* ── Shadows ── */
  --shadow-sm:     ${shadowSm};
  --shadow-md:     ${shadowMd};
  --shadow-lg:     ${shadowLg};

  /* ── Typography ── */
  --font-sans:     ${theme.typography.body};
  --font-mono:     ${theme.typography.mono};
  --font-label:    ${fontLabel};

  /* ── Geometry ── */
  --radius:        ${r};
  --transition:    0.2s ease;`.trimEnd();
}

// ─── Main ─────────────────────────────────────────────────────────────────
function main() {
  // 1. Load theme.yaml
  const raw   = fs.readFileSync(THEME, 'utf8');
  const theme = yaml.load(raw);
  const pname = theme.preset || 'professional-light';
  const base  = PRESETS[pname];

  if (!base) {
    console.error(`Unknown preset "${pname}". Available: ${Object.keys(PRESETS).join(', ')}`);
    process.exit(1);
  }

  // 2. Read current style.css
  let css = fs.readFileSync(STYLE, 'utf8');

  // 3. Update Google Fonts @import
  const newImport = `@import url("${theme.typography.google_fonts}");`;
  css = css.replace(
    /@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);/,
    newImport
  );

  // 4. Build :root block  (light surfaces, or dark-only preset)
  const lightSurfaces = {
    bg:           base.bg,
    surface:      base.surface,
    surface2:     base.surface2,
    border:       base.border,
    borderStrong: base.borderStrong,
    text:         base.text,
    muted:        base.muted,
  };
  const isDarkPreset = (theme.mode.default === 'dark');
  const rootVars     = buildVars(theme, lightSurfaces, isDarkPreset);
  const rootBlock    = `:root {\n${rootVars}\n}`;

  // 5. Replace :root { … } block
  css = css.replace(
    /(:root\s*\{)[^}]*(\})/s,
    rootBlock
  );

  // 6. Build and replace [data-theme="light"] block
  //    We keep this convention so existing toggle JS continues to work.
  //    The block now holds the same "professional-light" values (already in
  //    :root), and we add a [data-theme="dark"] block beneath it.

  const lightBlock = `[data-theme="light"] {\n${buildVars(theme, lightSurfaces, false)}\n}`;

  // Replace the existing [data-theme="light"] { … } block
  css = css.replace(
    /(\[data-theme="light"\]\s*\{)[^}]*(\})/s,
    lightBlock
  );

  // 7. Inject [data-theme="dark"] block after the light block if dark surfaces exist
  if (base.dark) {
    const darkSurfaces = {
      bg:           base.dark.bg,
      surface:      base.dark.surface,
      surface2:     base.dark.surface2,
      border:       base.dark.border,
      borderStrong: base.dark.borderStrong,
      text:         base.dark.text,
      muted:        base.dark.muted,
    };
    const darkBlock = `[data-theme="dark"] {\n${buildVars(theme, darkSurfaces, true)}\n}`;

    // Replace existing [data-theme="dark"] block if present, otherwise append after [data-theme="light"]
    if (/\[data-theme="dark"\]\s*\{[^}]*\}/s.test(css)) {
      css = css.replace(
        /(\[data-theme="dark"\]\s*\{)[^}]*(\})/s,
        darkBlock
      );
    } else {
      css = css.replace(
        /(\[data-theme="light"\]\s*\{[^}]*\})/s,
        `$1\n\n${darkBlock}`
      );
    }
  }

  // 8. Write output
  if (DRY_RUN) {
    console.log('── DRY RUN ── would write:\n');
    // Print just the variable blocks for review
    const rootMatch  = css.match(/:root\s*\{[^}]*\}/s);
    const lightMatch = css.match(/\[data-theme="light"\]\s*\{[^}]*\}/s);
    const darkMatch  = css.match(/\[data-theme="dark"\]\s*\{[^}]*\}/s);
    if (rootMatch)  console.log(rootMatch[0]);
    if (lightMatch) console.log('\n' + lightMatch[0]);
    if (darkMatch)  console.log('\n' + darkMatch[0]);
  } else {
    fs.writeFileSync(STYLE, css, 'utf8');
    console.log(`✓ style.css updated (preset: ${pname})`);
    console.log(`  primary: ${theme.brand.primary}  secondary: ${theme.brand.secondary}`);
    console.log(`  surface style: ${theme.surfaces.style}  default mode: ${theme.mode.default}`);
    console.log(`  fonts: ${theme.typography.body.split(',')[0]} + ${theme.typography.mono.split(',')[0]}`);
  }
}

main();
