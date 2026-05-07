#!/usr/bin/env node
/**
 * build-search-index.js
 * Reads posts/index.json + all post markdown files + glossary.json.
 * Outputs search-index.json for BM25 client-side search.
 * Usage: node scripts/build-search-index.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const INDEX_PATH  = path.join(ROOT, 'posts', 'index.json');
const GLOSS_PATH  = path.join(ROOT, 'glossary.json');
const OUT_PATH    = path.join(ROOT, 'search-index.json');

/* Series membership — mirrors SERIES constant in index.html */
const SERIES_MAP = {
  'context':                    'Agentic Engineering',
  'agent-harness-design':       'Agentic Engineering',
  'claude-code-harness':        'Agentic Engineering',
  'skills-supply-chain':        'Agentic Engineering',
  'google-adk-a2a':             'Multi-Agent Systems',
  'a2a-risks':                  'Multi-Agent Systems',
  'a2a-case-studies':           'Multi-Agent Systems',
  'sr11-7':                     'Model Risk & Governance',
  'guardrails':                 'Model Risk & Governance',
  'effective-challenge':        'Model Risk & Governance',
  'hitl-vocabulary':            'Model Risk & Governance',
  'hitl-design':                'Model Risk & Governance',
  'metrics-metrics-metrics':    'Evals & Adversarial Testing',
  'adversarial-workflow':       'Evals & Adversarial Testing',
  'deployment-gates':           'Evals & Adversarial Testing',
  'adversarial-incompleteness': 'Evals & Adversarial Testing',
  'payments-liability-gap':     'Banking AI',
  'agent-identity-kyc':         'Banking AI',
  'agentic-commerce-gap':       'Banking AI',
  'ai-econ-model':              'Economics of AI',
  'token-transfer-pricing':     'Economics of AI',
  'molmoweb-data-flywheel':     'GUI Agents',
  'molmoweb-openness-gap':      'GUI Agents',
};

/* ── Markdown stripper ─────────────────────────────────────────────────────
 * NOTE: footnote *definitions* ([^N]: ...) are intentionally KEPT — they
 * contain author names, source titles, and key terms that are valuable for
 * search. Only inline reference markers ([^N]) are stripped.
 * ───────────────────────────────────────────────────────────────────────── */
function stripMarkdown(md) {
  return md
    .replace(/^---[\s\S]*?---\n/, '')              // YAML frontmatter
    .replace(/^>\s*\[!\w+\]\s*/gm, '')             // alert callout markers
    .replace(/^>\s*/gm, '')                         // blockquote markers
    .replace(/\[\^\d+\]/g, '')                     // inline footnote refs only
    // footnote definitions KEPT (contain rich source/author text)
    .replace(/<[^>]+>/g, ' ')                      // HTML tags
    .replace(/```[\s\S]*?```/g, ' ')               // fenced code blocks
    .replace(/`([^`\n]+)`/g, '$1')                 // inline code — keep text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')          // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       // links — keep label text
    .replace(/^#{1,6}\s+/gm, '')                   // ATX headings
    .replace(/^[=\-]{3,}\s*$/gm, '')               // setext heading underlines
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')    // bold / italic (*)
    .replace(/_{1,3}([^_\n]+)_{1,3}/g, '$1')       // bold / italic (_)
    .replace(/^[-*_]{3,}\s*$/gm, '')               // horizontal rules
    .replace(/^\|[-| :]+\|$/gm, '')                // table separator rows
    .replace(/\n{3,}/g, '\n\n')                    // excess blank lines
    .replace(/[ \t]{2,}/g, ' ')                    // excess spaces
    .trim();
}

/* ── Post documents ──────────────────────────────────────────────────────── */
const manifest = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

const postDocs = manifest.map((post) => {
  const { slug, title, date, description = '', tags = [], draft } = post;

  const candidates = draft
    ? [`posts/${slug}.draft.md`, `posts/${slug}.md`]
    : [`posts/${slug}.md`];

  let rawMd = '';
  for (const rel of candidates) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) { rawMd = fs.readFileSync(full, 'utf8'); break; }
  }

  return {
    type:        'post',
    slug,
    title,
    date,
    description,
    tags,
    series:      SERIES_MAP[slug] || null,
    draft:       !!draft,
    body:        rawMd ? stripMarkdown(rawMd) : description,
  };
});

/* ── Glossary documents ──────────────────────────────────────────────────── */
const glossary = JSON.parse(fs.readFileSync(GLOSS_PATH, 'utf8'));

const glossaryDocs = glossary.map((entry) => {
  const aliases = (entry.aliases || []).join(' ');
  /*
   * Body for BM25: term repeated (title-weight boost) + aliases + short + full definition.
   * The definition text is the richest source — it contains regulatory citations,
   * related terms, and practitioner context.
   */
  const body = [
    entry.term, entry.term,          // repeat for implicit title weighting
    entry.full  || '',
    aliases,
    entry.short || '',
    entry.definition || '',
  ].filter(Boolean).join(' ');

  return {
    type:    'glossary',
    slug:    entry.id,
    title:   entry.term,
    full:    entry.full    || '',
    short:   entry.short   || '',
    domain:  entry.domain  || '',
    aliases: entry.aliases || [],
    used_in: entry.used_in || [],
    body,
  };
});

/* ── Write output ────────────────────────────────────────────────────────── */
const allDocs = [...postDocs, ...glossaryDocs];
fs.writeFileSync(OUT_PATH, JSON.stringify(allDocs));

const postCount  = postDocs.length;
const glossCount = glossaryDocs.length;
console.log(`✓  search-index.json — ${allDocs.length} docs (${postCount} posts + ${glossCount} glossary)`);
console.log('\nPosts:');
postDocs.forEach((d) =>
  console.log(`  ${d.draft ? '[draft] ' : '        '}${d.slug.padEnd(35)} ${d.body.length.toLocaleString().padStart(6)} chars`)
);
const avgGloss = Math.round(glossaryDocs.reduce((s, d) => s + d.body.length, 0) / glossaryDocs.length);
console.log(`\nGlossary: ${glossCount} entries, avg ${avgGloss} chars/entry`);
