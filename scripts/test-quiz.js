#!/usr/bin/env node
/**
 * test-quiz.js
 * Unit tests for quiz-engine pure utility functions.
 * Uses Node's built-in test runner (node:test), available from Node 18+.
 *
 * Usage: node --test scripts/test-quiz.js
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const path   = require("path");
const fs     = require("fs");

// Load engine — the CommonJS shim exports the pure functions
const engine = require(path.resolve(__dirname, "../quizzes/quiz-engine.js"));
const { shuffle, sample, prepareQuestion, letterFor } = engine;

/* ── letterFor ────────────────────────────────────────── */

describe("letterFor", () => {
  test("returns A for 0", () => assert.equal(letterFor(0), "A"));
  test("returns B for 1", () => assert.equal(letterFor(1), "B"));
  test("returns D for 3", () => assert.equal(letterFor(3), "D"));
});

/* ── shuffle ──────────────────────────────────────────── */

describe("shuffle", () => {
  test("returns same length array", () => {
    const arr = [1, 2, 3, 4, 5];
    assert.equal(shuffle(arr).length, arr.length);
  });

  test("contains all original elements", () => {
    const arr = ["a", "b", "c", "d"];
    const result = shuffle(arr);
    assert.deepEqual([...result].sort(), [...arr].sort());
  });

  test("does not mutate the original array", () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    assert.deepEqual(arr, copy);
  });

  test("produces different orderings over many runs", () => {
    // Run 50 shuffles of [0,1,2,3] — at least one should differ from original
    const arr = [0, 1, 2, 3];
    const original = arr.join(",");
    const allSame = Array.from({ length: 50 }, () => shuffle(arr).join(","))
      .every((r) => r === original);
    assert.equal(allSame, false, "shuffle never changed order across 50 runs");
  });
});

/* ── sample ───────────────────────────────────────────── */

describe("sample", () => {
  test("returns n items when pool is larger", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert.equal(sample(arr, 5).length, 5);
  });

  test("returns all items when n >= pool size", () => {
    const arr = [1, 2, 3];
    assert.equal(sample(arr, 10).length, 3);
  });

  test("all returned items are from the original array", () => {
    const arr = ["x", "y", "z", "w"];
    const result = sample(arr, 3);
    result.forEach((item) => assert.ok(arr.includes(item)));
  });

  test("returns no duplicates", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sample(arr, 5);
    const unique = new Set(result);
    assert.equal(unique.size, result.length);
  });

  test("n=0 returns empty array", () => {
    assert.deepEqual(sample([1, 2, 3], 0), []);
  });
});

/* ── prepareQuestion ──────────────────────────────────── */

describe("prepareQuestion", () => {
  const baseQ = {
    id: "test-q01",
    post: "test-post",
    module: "test-module",
    objective: "boundary",
    question: "Which option is correct?",
    options: ["Wrong A", "Correct B", "Wrong C", "Wrong D"],
    correct: 1,
    explanation: "Option B is correct because of reasons.",
  };

  test("returns displayOptions with same length as options", () => {
    const prepared = prepareQuestion(baseQ);
    assert.equal(prepared.displayOptions.length, baseQ.options.length);
  });

  test("correctDisplayIdx points to the isCorrect option", () => {
    const prepared = prepareQuestion(baseQ);
    assert.equal(prepared.displayOptions[prepared.correctDisplayIdx].isCorrect, true);
  });

  test("only one option is marked isCorrect", () => {
    const prepared = prepareQuestion(baseQ);
    const correctCount = prepared.displayOptions.filter((o) => o.isCorrect).length;
    assert.equal(correctCount, 1);
  });

  test("all original option texts are present in displayOptions", () => {
    const prepared = prepareQuestion(baseQ);
    const texts = prepared.displayOptions.map((o) => o.text);
    baseQ.options.forEach((opt) => assert.ok(texts.includes(opt)));
  });

  test("original question fields are preserved", () => {
    const prepared = prepareQuestion(baseQ);
    assert.equal(prepared.id, baseQ.id);
    assert.equal(prepared.question, baseQ.question);
    assert.equal(prepared.explanation, baseQ.explanation);
    assert.equal(prepared.objective, baseQ.objective);
  });

  test("correctDisplayIdx changes across multiple prepares (randomization)", () => {
    // With 4 options, chance of same position 50 times in a row is (1/4)^49 ≈ 0
    const positions = new Set(
      Array.from({ length: 50 }, () => prepareQuestion(baseQ).correctDisplayIdx)
    );
    assert.ok(positions.size > 1, "correct answer never moved across 50 preparations");
  });

  test("works correctly when correct is index 0", () => {
    const q = { ...baseQ, options: ["Correct A", "Wrong B", "Wrong C"], correct: 0 };
    for (let i = 0; i < 20; i++) {
      const prepared = prepareQuestion(q);
      assert.equal(prepared.displayOptions[prepared.correctDisplayIdx].text, "Correct A");
    }
  });

  test("works correctly when correct is the last option", () => {
    const q = { ...baseQ, options: ["Wrong A", "Wrong B", "Correct C"], correct: 2 };
    for (let i = 0; i < 20; i++) {
      const prepared = prepareQuestion(q);
      assert.equal(prepared.displayOptions[prepared.correctDisplayIdx].text, "Correct C");
    }
  });
});

/* ── Integration: JSON pools round-trip ───────────────── */

describe("Question pool files", () => {
  const poolDir = path.resolve(__dirname, "../quizzes/posts");

  const poolFiles = fs.existsSync(poolDir)
    ? fs.readdirSync(poolDir).filter((f) => f.endsWith(".json"))
    : [];

  test("at least one pool file exists", () => {
    assert.ok(poolFiles.length > 0, "no pool files found in quizzes/posts/");
  });

  for (const file of poolFiles) {
    const slug = file.replace(".json", "");

    test(`${slug}: all questions survive prepareQuestion without error`, () => {
      const questions = JSON.parse(
        fs.readFileSync(path.join(poolDir, file), "utf8")
      );
      questions.forEach((q, i) => {
        const prepared = prepareQuestion(q);
        assert.equal(
          prepared.displayOptions[prepared.correctDisplayIdx].isCorrect,
          true,
          `question ${i} (${q.id}): correctDisplayIdx does not point to correct option`
        );
      });
    });

    test(`${slug}: sample(questions, 5) returns 5 unique questions`, () => {
      const questions = JSON.parse(
        fs.readFileSync(path.join(poolDir, file), "utf8")
      );
      if (questions.length < 5) return; // skip small pools
      const sampled = sample(questions, 5);
      const ids = sampled.map((q) => q.id);
      assert.equal(new Set(ids).size, 5, "duplicate questions in sample");
    });
  }
});
