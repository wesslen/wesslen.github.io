/**
 * search.js — BM25 full-text search for wesslen.github.io
 * No external dependencies. Exposes window.BlogSearch = { search, load }.
 * Loaded via <script src="./search.js" defer> in index.html.
 */
/* global fetch */
'use strict';

(function () {
  /* BM25 hyperparameters */
  const k1 = 1.5;
  const b  = 0.75;
  const SNIPPET_LEN = 160; /* target character window for excerpt */

  let _docs    = null;
  let _index   = null; /* term → { df, postings: { docId → tf } } */
  let _avgdl   = 0;
  let _loading = null;

  /* ── Tokeniser ──────────────────────────────────────────── */
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((t) => t.length > 1);
  }

  /* ── Index builder ──────────────────────────────────────── */
  function buildIndex(docs) {
    const index  = Object.create(null);
    let totalLen = 0;

    docs.forEach((doc, id) => {
      /*
       * Field weighting via repetition before tokenising:
       *   title ×3, description ×2, body ×1
       * This keeps the scorer simple (single TF per term per doc)
       * while biasing toward title / description matches.
       */
      const titleRep = (doc.title + ' ').repeat(3);
      const descRep  = ((doc.description || '') + ' ').repeat(2);
      const tokens   = tokenize(titleRep + descRep + (doc.body || ''));

      doc._tokens = tokens;
      totalLen   += tokens.length;

      /* Term frequency map for this doc */
      const freq = Object.create(null);
      for (const t of tokens) freq[t] = (freq[t] || 0) + 1;

      for (const [term, tf] of Object.entries(freq)) {
        if (!index[term]) index[term] = { df: 0, postings: Object.create(null) };
        index[term].df            += 1;
        index[term].postings[id]   = tf;
      }
    });

    _avgdl = totalLen / docs.length;
    return index;
  }

  /* ── BM25 scoring ───────────────────────────────────────── */
  function bm25Score(queryTerms) {
    const N      = _docs.length;
    const scores = new Float64Array(N);

    for (const term of queryTerms) {
      const entry = _index[term];
      if (!entry) continue;
      const idf = Math.log((N - entry.df + 0.5) / (entry.df + 0.5) + 1);

      for (const [idStr, tf] of Object.entries(entry.postings)) {
        const id = +idStr;
        const dl = _docs[id]._tokens.length;
        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * dl) / _avgdl));
        scores[id] += idf * tfNorm;
      }
    }
    return scores;
  }

  /* ── Snippet extraction ─────────────────────────────────── */
  function extractSnippet(body, queryTerms) {
    if (!body) return '';
    const lower = body.toLowerCase();

    /* Find the character position with the densest cluster of query terms */
    let bestPos     = 0;
    let bestDensity = 0;

    for (const term of queryTerms) {
      let pos = lower.indexOf(term);
      while (pos !== -1) {
        const wStart  = Math.max(0, pos - 100);
        const wEnd    = Math.min(lower.length, pos + 100);
        const window  = lower.slice(wStart, wEnd);
        const density = queryTerms.reduce((n, t) => n + (window.includes(t) ? 1 : 0), 0);
        if (density > bestDensity) { bestDensity = density; bestPos = pos; }
        pos = lower.indexOf(term, pos + 1);
      }
    }

    /* Expand a SNIPPET_LEN-char window centred on bestPos, snap to word boundaries */
    let start = Math.max(0, bestPos - Math.floor(SNIPPET_LEN / 2));
    while (start > 0 && body[start] !== ' ') start--;

    let end = Math.min(body.length, start + SNIPPET_LEN);
    while (end < body.length && body[end] !== ' ') end++;

    let snippet = body.slice(start, end).trim();
    if (start > 0)              snippet = '…' + snippet;
    if (end < body.length)      snippet = snippet   + '…';
    return snippet;
  }

  /* ── Snippet HTML with <mark> highlights ────────────────── */
  function highlightSnippet(snippet, queryTerms) {
    /* Escape HTML before inserting <mark> tags */
    let html = snippet
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    /* Sort longest-first to avoid partial overlaps */
    const sorted = [...queryTerms].sort((a, z) => z.length - a.length);
    for (const term of sorted) {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
    }
    return html;
  }

  /* ── Lazy fetch + index build ───────────────────────────── */
  function load() {
    if (_docs)    return Promise.resolve();
    if (_loading) return _loading;

    _loading = fetch('./search-index.json')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((docs) => { _docs = docs; _index = buildIndex(docs); _loading = null; });
    return _loading;
  }

  /* ── Public API ─────────────────────────────────────────── */
  async function search(query, maxResults = 8) {
    await load();
    const terms = [...new Set(tokenize(query))].filter((t) => t.length > 1);
    if (!terms.length) return [];

    const scores = bm25Score(terms);

    const ranked = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > 0) ranked.push({ i, s: scores[i] });
    }
    ranked.sort((a, z) => z.s - a.s);

    return ranked.slice(0, maxResults).map(({ i }) => {
      const doc = _docs[i];
      const snippet = extractSnippet(doc.body || doc.description, terms);
      return {
        type:        doc.type,
        slug:        doc.slug,
        title:       doc.title,
        date:        doc.date,
        tags:        doc.tags,
        series:      doc.series,
        domain:      doc.domain,
        draft:       doc.draft,
        snippetHtml: highlightSnippet(snippet, terms),
      };
    });
  }

  window.BlogSearch = { search, load };
})();
