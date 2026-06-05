/* Node.js compat: polyfill window so the engine can be required in tests */
if (typeof window === "undefined") { global.window = {}; }

/**
 * quiz-engine.js
 * Post quizzes:   window.initQuiz(slug)
 * Module quizzes: window.initModuleQuiz(moduleId, containerEl, onClose)
 */
(function () {
  "use strict";

  const POST_QUIZ_N   = 5;   // questions per post quiz
  const MODULE_QUIZ_N = 10;  // questions per module test
  const MODULE_PASS_PCT = 0.9; // 90%+ required to pass a module test or final exam


  /* ── Progress tracking (localStorage) ────────────────── */

  const STORAGE_KEY = "drift-quiz-progress";

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }

  function writeProgress(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch { /* storage quota or private mode — fail silently */ }
  }

  /* ── Dev mode ───────────────────────────────────────── */

  function isDevMode() {
    try {
      const url = new URL(window.location.href);
      const param = url.searchParams.get("dev");
      if (param === "true")  { localStorage.setItem("drift-dev-mode", "true");  return true; }
      if (param === "false") { localStorage.removeItem("drift-dev-mode");        return false; }
      return localStorage.getItem("drift-dev-mode") === "true";
    } catch { return false; }
  }

  window.isDevMode = isDevMode;

  function recordAttempt(slug, score) {
    if (!slug) return;
    const data = readProgress();
    const prev = data[slug] || { attempts: 0, bestScore: 0 };
    data[slug] = {
      lastAttempted: new Date().toISOString().slice(0, 10),
      attempts: prev.attempts + 1,
      bestScore: Math.max(prev.bestScore || 0, score != null ? score : 0),
    };
    writeProgress(data);
  }

  function hasPerfectScore(slug) {
    if (isDevMode()) return true;
    const entry = readProgress()[slug];
    return !!(entry && entry.bestScore >= POST_QUIZ_N);
  }

  function getAttempt(slug) {
    return readProgress()[slug] || null;
  }

  function daysSince(isoDate) {
    const ms = Date.now() - new Date(isoDate).getTime();
    return Math.floor(ms / 86400000);
  }

  function recordModuleAttempt(moduleId, score, total) {
    if (!moduleId) return;
    const data = readProgress();
    const key = "module:" + moduleId;
    const prev = data[key] || { attempts: 0, bestScore: 0 };
    const passed = total > 0 && (score / total) >= MODULE_PASS_PCT;
    data[key] = {
      lastAttempted: new Date().toISOString().slice(0, 10),
      attempts: prev.attempts + 1,
      bestScore: Math.max(prev.bestScore || 0, score || 0),
      passed: passed || !!(prev.passed), // once passed, stays passed
    };
    writeProgress(data);
  }

  function hasPassedModuleTest(moduleId) {
    if (isDevMode()) return true;
    const entry = readProgress()["module:" + moduleId];
    return !!(entry && entry.passed);
  }

  /* ── Utilities ───────────────────────────────────────── */

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  function letterFor(i) {
    return String.fromCharCode(65 + i);
  }

  function prepareQuestion(q) {
    const indexed = q.options.map((text, i) => ({ text, isCorrect: i === q.correct }));
    const shuffled = shuffle(indexed);
    return {
      ...q,
      displayOptions: shuffled,
      correctDisplayIdx: shuffled.findIndex((o) => o.isCorrect),
    };
  }

  /* ── Question card renderer ──────────────────────────── */

  function renderQuestionCard(container, question, qIdx, total, onNext, opts = {}) {
    container.innerHTML = "";

    // Progress
    const progress = document.createElement("div");
    progress.className = "quiz-progress";
    if (opts.showBar) {
      const bar = document.createElement("div");
      bar.className = "quiz-progress-bar-wrap";
      const fill = document.createElement("div");
      fill.className = "quiz-progress-bar-fill";
      fill.style.width = `${Math.round((qIdx / total) * 100)}%`;
      bar.appendChild(fill);
      const label = document.createElement("span");
      label.className = "quiz-progress-label";
      label.textContent = `${qIdx + 1} / ${total}`;
      progress.appendChild(bar);
      progress.appendChild(label);
    } else {
      progress.textContent = `// question ${qIdx + 1} of ${total}`;
    }
    container.appendChild(progress);

    // Card
    const card = document.createElement("div");
    card.className = "quiz-card";

    if (question.objective) {
      const tag = document.createElement("div");
      tag.className = "quiz-objective-tag";
      tag.textContent = question.objective;
      card.appendChild(tag);
    }

    if (question.image) {
      const img = document.createElement("img");
      img.src = question.image;
      img.alt = question.imageAlt || "";
      img.className = "quiz-question-image";
      card.appendChild(img);
    }

    const qText = document.createElement("p");
    qText.className = "quiz-question";
    qText.textContent = question.question;
    card.appendChild(qText);

    const optList = document.createElement("div");
    optList.className = "quiz-options";
    let answered = false;

    question.displayOptions.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.type = "button";
      btn.innerHTML = `<span class="option-letter">${letterFor(i)}</span><span class="option-text">${opt.text}</span>`;

      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        const isCorrect = i === question.correctDisplayIdx;
        optList.querySelectorAll(".quiz-option").forEach((b) => (b.disabled = true));
        btn.classList.add(isCorrect ? "correct" : "incorrect");
        if (!isCorrect) {
          optList.querySelectorAll(".quiz-option")[question.correctDisplayIdx].classList.add("revealed-correct");
        }

        const expDiv = document.createElement("div");
        expDiv.className = "quiz-explanation";
        expDiv.innerHTML = `<div class="quiz-explanation-label">${isCorrect ? "// correct" : "// not quite — here's why"}</div><p class="quiz-explanation-text">${question.explanation}</p>`;
        card.appendChild(expDiv);

        const actions = document.createElement("div");
        actions.className = "quiz-actions";
        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "quiz-btn";
        nextBtn.textContent = qIdx + 1 < total ? "next →" : "see results →";
        nextBtn.addEventListener("click", () => onNext(isCorrect, question));
        actions.appendChild(nextBtn);
        card.appendChild(actions);
      });

      optList.appendChild(btn);
    });

    card.appendChild(optList);
    container.appendChild(card);
  }

  /* ── Flow engine (shared) ────────────────────────────── */

  function runFlow(container, questions, qIdx, results, onDone, opts = {}) {
    renderQuestionCard(
      container,
      questions[qIdx],
      qIdx,
      questions.length,
      (wasCorrect, question) => {
        const newResults = [...results, { question, wasCorrect }];
        if (qIdx + 1 < questions.length) {
          runFlow(container, questions, qIdx + 1, newResults, onDone, opts);
        } else {
          onDone(newResults);
        }
      },
      opts
    );
  }

  /* ── Post quiz end screen ────────────────────────────── */

  function renderPostEndScreen(container, results, onRetake) {
    container.innerHTML = "";
    const correct = results.filter((r) => r.wasCorrect).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);

    const end = document.createElement("div");
    end.className = "quiz-end";

    const score = document.createElement("div");
    score.className = "quiz-score";
    score.textContent = `${correct}/${total}`;
    end.appendChild(score);

    const label = document.createElement("p");
    label.className = "quiz-score-label";
    label.textContent =
      pct === 100 ? "perfect — you know this cold" :
      pct >= 60   ? "solid — review any explanations that surprised you" :
                    "good attempt — the explanations are worth a second read";
    end.appendChild(label);

    const endActions = document.createElement("div");
    endActions.className = "quiz-end-actions";
    const retakeBtn = document.createElement("button");
    retakeBtn.type = "button";
    retakeBtn.className = "quiz-btn";
    retakeBtn.textContent = "↺ new questions";
    retakeBtn.addEventListener("click", onRetake);
    endActions.appendChild(retakeBtn);
    end.appendChild(endActions);

    const note = document.createElement("p");
    note.className = "quiz-local-note";
    note.textContent = "progress saved in this browser only";
    end.appendChild(note);

    container.appendChild(end);
  }

  /* ── Module quiz end screen ──────────────────────────── */

  function renderModuleEndScreen(container, results, postTitles, onRetake, onClose) {
    container.innerHTML = "";
    const correct = results.filter((r) => r.wasCorrect).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);

    const end = document.createElement("div");
    end.className = "quiz-end quiz-end-module";

    // Score
    const score = document.createElement("div");
    score.className = "quiz-score";
    score.textContent = `${correct}/${total}`;
    end.appendChild(score);

    const passBadge = document.createElement("div");
    passBadge.className = pct >= 90 ? "quiz-module-pass" : "quiz-module-fail";
    passBadge.textContent = pct >= 90 ? "// passed" : "// 90% required to pass";
    end.appendChild(passBadge);

    const label = document.createElement("p");
    label.className = "quiz-score-label";
    label.textContent =
      pct === 100 ? "perfect — you know this module cold" :
      pct >= 90   ? "solid grasp — review the explanations that caught you" :
      pct >= 70   ? "good foundation — worth another pass through the posts" :
                    "this module has more to give — re-read before retaking";
    end.appendChild(label);

    // Per-post breakdown
    const byPost = {};
    results.forEach((r) => {
      const p = r.question.post;
      if (!byPost[p]) byPost[p] = { correct: 0, total: 0 };
      byPost[p].total++;
      if (r.wasCorrect) byPost[p].correct++;
    });

    const breakdown = document.createElement("div");
    breakdown.className = "quiz-breakdown";
    const breakdownLabel = document.createElement("div");
    breakdownLabel.className = "quiz-breakdown-label";
    breakdownLabel.textContent = "// by post";
    breakdown.appendChild(breakdownLabel);

    Object.entries(byPost).forEach(([slug, data]) => {
      const row = document.createElement("div");
      row.className = "quiz-breakdown-row";
      const name = document.createElement("span");
      name.className = "quiz-breakdown-name";
      name.textContent = postTitles[slug] || slug;
      const bScore = document.createElement("span");
      bScore.className = "quiz-breakdown-score";
      bScore.textContent = `${data.correct}/${data.total}`;
      if (data.correct === data.total) bScore.classList.add("perfect");
      row.appendChild(name);
      row.appendChild(bScore);
      breakdown.appendChild(row);
    });
    end.appendChild(breakdown);

    // Actions
    const endActions = document.createElement("div");
    endActions.className = "quiz-end-actions";

    const retakeBtn = document.createElement("button");
    retakeBtn.type = "button";
    retakeBtn.className = "quiz-btn";
    retakeBtn.textContent = "↺ retake";
    retakeBtn.addEventListener("click", onRetake);
    endActions.appendChild(retakeBtn);

    if (onClose) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "quiz-btn quiz-btn-ghost";
      closeBtn.textContent = "done";
      closeBtn.addEventListener("click", onClose);
      endActions.appendChild(closeBtn);
    }

    end.appendChild(endActions);
    container.appendChild(end);
  }

  /* ── Post quiz entry point ───────────────────────────── */

  function startQuiz(section, allQuestions, slug) {
    const old = section.querySelector(".quiz-body");
    if (old) old.remove();

    const body = document.createElement("div");
    body.className = "quiz-body";
    section.appendChild(body);

    const sampled = sample(allQuestions, POST_QUIZ_N).map(prepareQuestion);
    runFlow(body, sampled, 0, [], (results) => {
      const correct = results.filter((r) => r.wasCorrect).length;
      recordAttempt(slug, correct);
      updateRevisitNudge(section, slug);
      renderPostEndScreen(body, results, () => startQuiz(section, allQuestions, slug));
    });
  }

  window.initQuiz = async function (slug) {
    if (!slug) return;
    let questions;
    try {
      const res = await fetch(`./quizzes/posts/${encodeURIComponent(slug)}.json`);
      if (!res.ok) return;
      questions = await res.json();
      if (!Array.isArray(questions) || questions.length === 0) return;
    } catch {
      return;
    }

    const articleCol = document.getElementById("article-col");
    if (!articleCol) return;

    const section = document.createElement("section");
    section.className = "quiz-section";
    section.id = "quiz-section";
    section.setAttribute("aria-label", "Check your understanding");

    const header = document.createElement("div");
    header.className = "quiz-header";
    header.textContent = "// check your understanding";
    section.appendChild(header);

    const postNav = articleCol.querySelector(".post-nav");
    if (postNav) {
      postNav.parentNode.insertBefore(section, postNav);
    } else {
      const postContent = document.getElementById("post-content");
      postContent ? postContent.insertAdjacentElement("afterend", section) : articleCol.appendChild(section);
    }

    // Revisit nudge — shown if this post has been attempted before
    const prev = getAttempt(slug);
    if (prev) {
      section.appendChild(buildRevisitNudge(prev));
    }

    startQuiz(section, questions, slug);
  };

  function buildRevisitNudge(prev) {
    const days = daysSince(prev.lastAttempted);
    const timeStr = days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
    const nudge = document.createElement("div");
    nudge.className = "quiz-revisit-nudge";
    nudge.id = "quiz-revisit-nudge";
    nudge.textContent = `last attempted ${timeStr} · ${prev.attempts} attempt${prev.attempts !== 1 ? "s" : ""}`;
    return nudge;
  }

  function updateRevisitNudge(section, slug) {
    const prev = getAttempt(slug);
    if (!prev) return;
    const existing = section.querySelector("#quiz-revisit-nudge");
    const fresh = buildRevisitNudge(prev);
    if (existing) existing.replaceWith(fresh);
    else section.insertBefore(fresh, section.querySelector(".quiz-body"));
  }

  /* ── Module quiz entry point ─────────────────────────── */

  function startModuleQuiz(container, allQuestions, n, postTitles, onClose, moduleId) {
    container.innerHTML = "";

    const body = document.createElement("div");
    body.className = "quiz-body";
    container.appendChild(body);

    const sampled = sample(allQuestions, n).map(prepareQuestion);
    runFlow(
      body,
      sampled,
      0,
      [],
      (results) => {
        const mScore = results.filter((r) => r.wasCorrect).length;
        recordModuleAttempt(moduleId, mScore, results.length);
        renderModuleEndScreen(
          body,
          results,
          postTitles,
          () => startModuleQuiz(container, allQuestions, n, postTitles, onClose, moduleId),
          onClose
        );
      },
      { showBar: true }
    );
  }

  window.initModuleQuiz = async function (moduleId, containerEl, onClose) {
    if (!moduleId || !containerEl) return;

    // Show loading state
    containerEl.innerHTML = `<p class="quiz-loading">// loading questions…</p>`;

    let manifest;
    try {
      const res = await fetch(`./quizzes/modules/${encodeURIComponent(moduleId)}.json`);
      if (!res.ok) throw new Error("manifest not found");
      manifest = await res.json();
    } catch {
      containerEl.innerHTML = `<p class="quiz-loading" style="color:var(--muted)">Could not load quiz.</p>`;
      return;
    }

    // Fetch all post question pools
    const postTitles = {};
    let allQuestions = [];
    await Promise.all(
      manifest.posts.map(async (slug) => {
        try {
          const res = await fetch(`./quizzes/posts/${encodeURIComponent(slug)}.json`);
          if (!res.ok) return;
          const qs = await res.json();
          // Capture title from first question's post field (slug is fine as fallback)
          postTitles[slug] = (manifest.titles && manifest.titles[slug]) || slug;
          allQuestions = allQuestions.concat(qs);
        } catch {
          // skip missing pools silently
        }
      })
    );

    if (allQuestions.length === 0) {
      containerEl.innerHTML = `<p class="quiz-loading" style="color:var(--muted)">No questions available.</p>`;
      return;
    }

    startModuleQuiz(containerEl, allQuestions, manifest.n || MODULE_QUIZ_N, postTitles, onClose, moduleId);
  };
  /* ── Public: index page post badges ─────────────────── */

  window.initQuizBadges = function () {
    const progress = readProgress();
    document.querySelectorAll("[data-slug]").forEach((el) => {
      const slug = el.dataset.slug;
      if (!hasPerfectScore(slug)) return;
      if (el.querySelector(".quiz-done-badge")) return; // already added
      const badge = document.createElement("span");
      badge.className = "quiz-done-badge";
      const days = daysSince(progress[slug] ? progress[slug].lastAttempted : new Date().toISOString().slice(0,10));
      const label = days === 0 ? "quizzed today" : days === 1 ? "quizzed yesterday" : `quizzed ${days}d ago`;
      badge.title = label;
      badge.textContent = "✓";
      const title = el.querySelector(".row-a-title");
      if (title) title.appendChild(badge);
    });
  };

  /* ── Public: check if module test is unlocked ───────────── */

  window.isModuleUnlocked = function (slugs) {
    if (isDevMode()) return true;
    return Array.isArray(slugs) && slugs.length > 0 && slugs.every(hasPerfectScore);
  };

  window.hasCompletedAllModules = function (moduleIds) {
    if (isDevMode()) return true;
    return Array.isArray(moduleIds) && moduleIds.length > 0 &&
      moduleIds.every(hasPassedModuleTest);
  };

  /* ── Public: slides page module progress ─────────────── */

  window.initModuleProgress = function (postSlugs, targetEl) {
    const progress = readProgress();
    const attempted = postSlugs.filter((s) => progress[s]).length;
    if (attempted === 0) return;
    const existing = targetEl.querySelector(".module-progress-indicator");
    if (existing) existing.remove();
    const indicator = document.createElement("div");
    indicator.className = "module-progress-indicator";
    indicator.textContent = `${attempted}/${postSlugs.length} posts quizzed`;
    targetEl.appendChild(indicator);
  };

  /* ── CommonJS export shim (for Node.js tests) ───────── */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { shuffle, sample, prepareQuestion, letterFor };
  }

})();
