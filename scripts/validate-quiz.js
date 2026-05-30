#!/usr/bin/env node
/**
 * validate-quiz.js
 * Validates all quiz JSON files for schema correctness, cross-references,
 * and content quality. Exits 1 if any errors are found.
 *
 * Usage: node scripts/validate-quiz.js
 */

const fs   = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/* ── Helpers ──────────────────────────────────────────── */

function read(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function globJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f));
}

const ALLOWED_OBJECTIVES = new Set([
  "transfer", "boundary", "distinction", "scope",
  "mechanism", "synthesis", "misconception", "argument",
]);

const MIN_EXPLANATION_LEN = 80;
const MIN_POST_POOL       = 5;   // must have at least this many Qs per post
const MIN_MODULE_POOL     = 10;  // combined pool must cover the module's n

let errors   = [];
let warnings = [];

function error(msg)   { errors.push(`  ✗ ${msg}`); }
function warn(msg)    { warnings.push(`  ⚠ ${msg}`); }
function ok(msg)      { console.log(`  ✓ ${msg}`); }

/* ── Load reference data ──────────────────────────────── */

const indexPath  = path.join(ROOT, "posts", "index.json");
const slidesPath = path.join(ROOT, "slides", "slides.json");

if (!exists(indexPath))  { console.error("posts/index.json not found"); process.exit(1); }
if (!exists(slidesPath)) { console.error("slides/slides.json not found"); process.exit(1); }

const postIndex  = read(indexPath);
const slidesData = read(slidesPath);

const knownPostSlugs = new Set(postIndex.map((p) => p.slug));
const quizFlaggedDecks = slidesData.filter((d) => d.quiz === true);

/* ── 1. Validate post question pools ─────────────────── */

console.log("\n── Post question pools ───────────────────────────────");

const postPoolDir = path.join(ROOT, "quizzes", "posts");
const postPoolFiles = globJson(postPoolDir);

const allQuestionIds = new Map(); // id → source file
const poolsBySlug    = {};        // slug → questions[]

if (postPoolFiles.length === 0) {
  warn("No post question pools found in quizzes/posts/");
} else {
  ok(`Found ${postPoolFiles.length} post pool file(s)`);
}

for (const file of postPoolFiles) {
  const slug = path.basename(file, ".json");
  const rel  = `quizzes/posts/${slug}.json`;
  let questions;

  try {
    questions = read(file);
  } catch (e) {
    error(`${rel} — invalid JSON: ${e.message}`);
    continue;
  }

  if (!Array.isArray(questions)) {
    error(`${rel} — root must be an array`);
    continue;
  }

  if (questions.length < MIN_POST_POOL) {
    warn(`${rel} — only ${questions.length} question(s); recommend ≥ ${MIN_POST_POOL}`);
  }

  if (!knownPostSlugs.has(slug)) {
    warn(`${rel} — slug "${slug}" not found in posts/index.json`);
  }

  poolsBySlug[slug] = questions;
  const objectiveCounts = {};

  questions.forEach((q, i) => {
    const loc = `${rel}[${i}]`;

    // Required fields
    if (!q.id || typeof q.id !== "string")
      error(`${loc} — missing or invalid "id"`);

    if (!q.question || typeof q.question !== "string" || q.question.trim().length < 10)
      error(`${loc} — missing or too-short "question"`);

    if (!q.post || typeof q.post !== "string")
      error(`${loc} — missing "post"`);
    else if (q.post !== slug)
      warn(`${loc} — "post" field is "${q.post}" but file slug is "${slug}"`);

    if (!q.module || typeof q.module !== "string")
      error(`${loc} — missing "module"`);

    if (!q.objective || typeof q.objective !== "string")
      error(`${loc} — missing "objective"`);
    else if (!ALLOWED_OBJECTIVES.has(q.objective))
      error(`${loc} — unknown objective "${q.objective}". Allowed: ${[...ALLOWED_OBJECTIVES].join(", ")}`);
    else
      objectiveCounts[q.objective] = (objectiveCounts[q.objective] || 0) + 1;

    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4)
      error(`${loc} — "options" must be an array of 2–4 items`);
    else
      q.options.forEach((opt, oi) => {
        if (typeof opt !== "string" || opt.trim().length === 0)
          error(`${loc}.options[${oi}] — empty or non-string option`);
      });

    if (typeof q.correct !== "number" || !Number.isInteger(q.correct) ||
        q.correct < 0 || (Array.isArray(q.options) && q.correct >= q.options.length))
      error(`${loc} — "correct" must be an integer index into "options"`);

    if (!q.explanation || typeof q.explanation !== "string")
      error(`${loc} — missing "explanation"`);
    else if (q.explanation.trim().length < MIN_EXPLANATION_LEN)
      warn(`${loc} — explanation is short (${q.explanation.trim().length} chars); aim for ≥ ${MIN_EXPLANATION_LEN}`);

    if (typeof q.difficulty !== 'number' || ![1,2,3].includes(q.difficulty))
      error(`${loc} — "difficulty" must be 1 (foundational), 2 (applied), or 3 (synthesis)`);

    // Duplicate ID check (global)
    if (q.id) {
      if (allQuestionIds.has(q.id))
        error(`${loc} — duplicate id "${q.id}" (first seen in ${allQuestionIds.get(q.id)})`);
      else
        allQuestionIds.set(q.id, rel);
    }
  });

  const objSummary = Object.entries(objectiveCounts)
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");
  ok(`${rel} — ${questions.length} questions [${objSummary || "no objectives"}]`);
}

/* ── 2. Validate module manifests ────────────────────── */

console.log("\n── Module manifests ──────────────────────────────────");

const moduleDir   = path.join(ROOT, "quizzes", "modules");
const moduleFiles = globJson(moduleDir);

const manifestById = {};

if (moduleFiles.length === 0) {
  warn("No module manifests found in quizzes/modules/");
} else {
  ok(`Found ${moduleFiles.length} module manifest(s)`);
}

for (const file of moduleFiles) {
  const id  = path.basename(file, ".json");
  const rel = `quizzes/modules/${id}.json`;
  let manifest;

  try {
    manifest = read(file);
  } catch (e) {
    error(`${rel} — invalid JSON: ${e.message}`);
    continue;
  }

  manifestById[id] = manifest;

  if (!manifest.id)
    error(`${rel} — missing "id"`);
  else if (manifest.id !== id)
    warn(`${rel} — manifest "id" is "${manifest.id}" but file is named "${id}.json"`);

  if (!manifest.title || typeof manifest.title !== "string")
    error(`${rel} — missing "title"`);

  if (!Array.isArray(manifest.posts) || manifest.posts.length === 0)
    error(`${rel} — "posts" must be a non-empty array`);

  const n = manifest.n || 10;
  if (typeof n !== "number" || n < 1)
    error(`${rel} — "n" must be a positive number`);

  // Check all referenced post pools exist and have enough questions
  let combinedCount = 0;
  (manifest.posts || []).forEach((slug) => {
    const postFile = path.join(postPoolDir, `${slug}.json`);
    if (!exists(postFile))
      error(`${rel} — references post "${slug}" but quizzes/posts/${slug}.json not found`);
    else if (poolsBySlug[slug])
      combinedCount += poolsBySlug[slug].length;

    if (!knownPostSlugs.has(slug))
      warn(`${rel} — post slug "${slug}" not in posts/index.json`);
  });

  if (combinedCount < n)
    error(`${rel} — combined pool has ${combinedCount} questions but n=${n}; need at least ${n}`);
  else
    ok(`${rel} — ${manifest.posts.length} posts, ${combinedCount} total questions, n=${n}`);
}

/* ── 3. Check quiz-flagged decks have manifests ──────── */

console.log("\n── Deck ↔ manifest cross-check ───────────────────────");

for (const deck of quizFlaggedDecks) {
  const manifestFile = path.join(moduleDir, `${deck.id}.json`);
  if (!exists(manifestFile))
    error(`slides.json deck "${deck.id}" has quiz:true but quizzes/modules/${deck.id}.json not found`);
  else
    ok(`Deck "${deck.id}" → quizzes/modules/${deck.id}.json ✓`);
}

if (quizFlaggedDecks.length === 0)
  warn("No decks with quiz:true found in slides/slides.json");

/* ── 4. Summary ──────────────────────────────────────── */

console.log("\n── Summary ───────────────────────────────────────────");

const totalQuestions = Object.values(poolsBySlug).reduce((s, qs) => s + qs.length, 0);
const objTotals = {};
Object.values(poolsBySlug).flat().forEach((q) => {
  if (q.objective) objTotals[q.objective] = (objTotals[q.objective] || 0) + 1;
});

console.log(`  Total posts with pools : ${Object.keys(poolsBySlug).length}`);
console.log(`  Total questions        : ${totalQuestions}`);
console.log(`  Unique IDs             : ${allQuestionIds.size}`);
console.log(`  Module manifests       : ${moduleFiles.length}`);
const diffTotals = {1: 0, 2: 0, 3: 0};
  Object.values(poolsBySlug).flat().forEach((q) => {
    if (q.difficulty) diffTotals[q.difficulty] = (diffTotals[q.difficulty] || 0) + 1;
  });
  console.log(`  Difficulty             : 1-foundational:${diffTotals[1]}  2-applied:${diffTotals[2]}  3-synthesis:${diffTotals[3]}`);
console.log(`  Objective distribution :`);
[...ALLOWED_OBJECTIVES].forEach((obj) => {
  const count = objTotals[obj] || 0;
  const bar   = "█".repeat(count);
  console.log(`    ${obj.padEnd(14)} ${String(count).padStart(3)}  ${bar}`);
});

/* ── 5. Report & exit ────────────────────────────────── */

if (warnings.length > 0) {
  console.log(`\n── Warnings (${warnings.length}) ────────────────────────────────`);
  warnings.forEach((w) => console.log(w));
}

if (errors.length > 0) {
  console.log(`\n── Errors (${errors.length}) ──────────────────────────────────`);
  errors.forEach((e) => console.log(e));
  console.log("\n✗ Validation failed.\n");
  process.exit(1);
} else {
  console.log("\n✓ All checks passed.\n");
}
