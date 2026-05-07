/**
 * search-modal.js — global search modal overlay for wesslen.github.io
 * Works on every page. Requires search.js (window.BlogSearch) loaded first.
 *
 * Opens via:  header #search-modal-btn click  |  Cmd/Ctrl+K
 * Closes via: Escape  |  backdrop click
 */
'use strict';

(function () {
  let modal    = null;  /* outer wrapper */
  let inputEl  = null;
  let panelEl  = null;
  let focusIdx = -1;
  let timer    = null;

  /* ── Helpers ──────────────────────────────────────────────── */
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /* All pages live at the root, so these paths work everywhere */
  function postUrl(slug, draft) {
    return draft
      ? `./post.html?slug=${encodeURIComponent(slug)}.draft`
      : `./post.html?slug=${encodeURIComponent(slug)}`;
  }

  /* ── DOM build (lazy — only on first open) ────────────────── */
  function buildModal() {
    const el = document.createElement('div');
    el.id = 'sm-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Site search');
    el.innerHTML = `
      <div id="sm-backdrop"></div>
      <div id="sm-panel">
        <div id="sm-input-row">
          <span id="sm-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.691 3.516a4.5 4.5 0 1 1 .707-.707l2.838 2.837a.5.5 0 0 1-.708.708L9.31 10.016Z"
                fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
          </span>
          <input id="sm-input" type="search" placeholder="Search posts and glossary…"
            autocomplete="off" spellcheck="false" aria-label="Search" />
          <kbd id="sm-esc-hint" title="Close">esc</kbd>
        </div>
        <div id="sm-results" aria-live="polite"></div>
        <div id="sm-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>⌘K</kbd> toggle</span>
        </div>
      </div>`;
    document.body.appendChild(el);

    modal   = el;
    inputEl = el.querySelector('#sm-input');
    panelEl = el.querySelector('#sm-results');

    el.querySelector('#sm-backdrop').addEventListener('click', close);
    el.querySelector('#sm-esc-hint').addEventListener('click', close);

    inputEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => runSearch(inputEl.value), 200);
    });

    inputEl.addEventListener('keydown', onKey);
  }

  /* ── Keyboard handler ─────────────────────────────────────── */
  function onKey(e) {
    const items = panelEl.querySelectorAll('.sm-item');

    if (e.key === 'Escape')     { close(); return; }
    if (!items.length)           return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIdx = Math.min(focusIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('sm-focused', i === focusIdx));
      items[focusIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIdx = Math.max(focusIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle('sm-focused', i === focusIdx));
      items[focusIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const target = items[focusIdx] ?? items[0];
      if (target) { e.preventDefault(); target.click(); }
    }
  }

  /* ── Results renderer ─────────────────────────────────────── */
  function renderResults(results, query) {
    focusIdx = -1;
    if (!query.trim()) { panelEl.innerHTML = ''; return; }
    if (!results.length) {
      panelEl.innerHTML = `<div class="sm-empty">no results for &ldquo;${query.trim()}&rdquo;</div>`;
      return;
    }

    let html = '';
    results.forEach((r, idx) => {
      if (r.type === 'glossary') {
        html += `<a class="sm-item" href="./glossary.html#${encodeURIComponent(r.slug)}" data-idx="${idx}">
          <div class="sm-item-header">
            <span class="sm-title">${r.title}</span>
            <span class="sm-badge sm-badge-glossary">glossary</span>
          </div>
          <div class="sm-snippet">${r.snippetHtml}</div>
        </a>`;
      } else {
        const badge = r.series ? `<span class="sm-badge">${r.series}</span>` : '';
        const date  = r.date   ? `<span class="sm-date">${fmtDate(r.date)}</span>` : '';
        const db    = r.draft  ? ' <span class="draft-badge">draft</span>' : '';
        html += `<a class="sm-item" href="${postUrl(r.slug, r.draft)}" data-idx="${idx}">
          <div class="sm-item-header">
            <span class="sm-title">${r.title}${db}</span>
            ${badge}${date}
          </div>
          <div class="sm-snippet">${r.snippetHtml}</div>
        </a>`;
      }
    });
    panelEl.innerHTML = html;
  }

  async function runSearch(q) {
    if (!q.trim() || q.length < 2) { panelEl.innerHTML = ''; return; }
    try {
      renderResults(await window.BlogSearch.search(q, 7), q);
    } catch (e) {
      console.error('BlogSearchModal error:', e);
    }
  }

  /* ── Open / close ─────────────────────────────────────────── */
  function open() {
    if (!modal) buildModal();
    modal.classList.add('sm-open');
    document.body.classList.add('sm-body-lock');
    requestAnimationFrame(() => inputEl.focus());
    if (window.BlogSearch) window.BlogSearch.load();
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('sm-open');
    document.body.classList.remove('sm-body-lock');
    inputEl.value  = '';
    panelEl.innerHTML = '';
    focusIdx = -1;
  }

  /* ── Global keyboard shortcut: Cmd/Ctrl+K ─────────────────── */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      modal && modal.classList.contains('sm-open') ? close() : open();
    }
  });

  /* ── Wire header button once DOM is ready ─────────────────── */
  function wireButton() {
    document.getElementById('search-modal-btn')
      ?.addEventListener('click', open);
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', wireButton)
    : wireButton();

  window.BlogSearchModal = { open, close };
})();
