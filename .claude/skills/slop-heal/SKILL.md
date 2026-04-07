# slop-heal — Cowork Anti-Slop Self-Heal Skill

## Purpose

After writing or editing a blog post, this skill runs the slop-guard prose
linter and automatically revises the post to eliminate flagged AI-slop patterns.
It retries up to **3 times** and then stops, requiring human intervention if
the score hasn't cleared the threshold.

## When to invoke

Invoke this skill automatically any time you (Claude in Cowork) have:
- Written a new blog post draft
- Substantially edited an existing post (> 5 sentence changes)
- Been asked to "clean up" or "de-slop" a post

You do not need the user to ask — run it as a final quality gate before
declaring the post done.

## Threshold and scoring bands

The target threshold is **70/100** ("light" or better).

| Score | Band     | Action                          |
|-------|----------|---------------------------------|
| 80–100 | Clean   | ✅ Done                         |
| 60–79  | Light   | ✅ Done (passes threshold 70)   |
| 40–59  | Moderate | ❌ Retry needed                 |
| 20–39  | Heavy    | ❌ Retry needed                 |
| 0–19   | Saturated | ❌ Retry needed (severe)       |

## Step-by-step workflow

### Step 0 — Initial check

Run the linter on the post file:

```bash
cd /path/to/wesslen.github.io
uv run --with slop-guard python scripts/check-slop.py \
  --threshold 70 --verbose posts/<filename>.md
```

Record: `score`, `band`, `advice[]`, and `violations[]`.

If the file passes (score ≥ 70), **stop here**. Tell the user the score and
move on.

---

### Step 1–3 — Retry loop (max 3 attempts)

**For each retry attempt (1, 2, 3):**

#### 1. Parse the violations report

Focus on the highest-penalty violations first. Common categories and fixes:

| Rule category     | What it catches                        | Fix strategy                                          |
|-------------------|----------------------------------------|-------------------------------------------------------|
| `slop_word`       | Buzzwords: *harness, robust, leverage* | Replace with concrete, specific alternatives          |
| `em_dash`         | Em dash overuse (> ~1 per 150 words)   | Rewrite with period, comma, or restructured sentence  |
| `setup_resolution`| "X is Y. In Z, that's…" pattern       | State the point directly without the rhetorical pivot |
| `structural`      | Bold bullet listicles, triadic lists   | Collapse into prose; vary sentence structure          |
| `weasel`          | "Many experts believe…" unattributed   | Cite specifically or rephrase as your own view        |
| `assistant_tone`  | "It's worth noting…", "Let's explore" | Cut or rephrase in first person                       |
| `copula_chain`    | "The thing is that it is…"             | Tighten to active construction                        |
| `aphoristic`      | Punchy "X is Y." closers               | Embed in a longer sentence or cut                     |

#### 2. Edit the post

Make targeted edits. Rules to follow during revision:
- **Do not change the author's voice** — this is Ryan's first-person, wry blog.
  Fix the mechanical pattern, not the idea.
- **Do not add new slop** — avoid introducing replacement buzzwords.
- **Footnotes are exempt** — slop-guard checks prose only; don't rewrite
  footnotes to hit the score.
- **The `harness` flag is a false positive** when used technically (e.g.,
  "agent harness"). Add a note but don't change the word if it's precise.
- Do not convert bullets to prose if bullets are clearly intentional
  structural choices by Ryan (check memory: his convention is 2-3 sentence
  paragraphs, not listicles).

#### 3. Re-run the linter

```bash
uv run --with slop-guard python scripts/check-slop.py \
  --threshold 70 --verbose posts/<filename>.md
```

If score ≥ 70 → **done**. Report the final score to the user.

---

### After 3 failed attempts — Human escalation

If the score is still below 70 after 3 retry loops:

1. **Stop revising.** Do not attempt a 4th pass.
2. Report to the user with this exact structure:

```
slop-heal: ❌ Could not reach threshold 70 after 3 attempts.

Current score: <score>/100 [<band>]
Remaining violations requiring human judgment:

<list each remaining violation type with the specific match and advice>

Next step: Please review and revise these phrases manually, then re-run:
  uv run --with slop-guard python scripts/check-slop.py --threshold 70 --verbose posts/<filename>.md
```

3. Do NOT commit the file. Leave it in its current (best-effort) state for
   the human to finish.

---

## Known pitfalls and side-effects

### Removing `---` horizontal rules leaves double blank lines (MD012)

The `horizontal_rule` slop penalty fires when a post contains 4+ `---`
section separators. The natural fix is to delete those lines — but each `---`
is typically surrounded by one blank line on each side, so removing it leaves
two consecutive blank lines. `markdownlint` (CI rule MD012) rejects this.

**Fix:** after removing any `---` lines, collapse runs of 3+ newlines to 2:

```python
import re, pathlib
p = pathlib.Path("posts/<filename>.md")
text = p.read_text()
p.write_text(re.sub(r'\n{3,}', '\n\n', text))
```

Or as a one-liner:

```bash
python3 -c "
import re, pathlib
p = pathlib.Path('posts/<filename>.md')
p.write_text(re.sub(r'\n{3,}', '\n\n', p.read_text()))
"
```

Run `npx markdownlint-cli "posts/<filename>.md"` to confirm no MD012 errors
remain before committing.

---

## Notes on the scoring model

- Scoring uses exponential decay: `score = 100 × exp(−λ × density)`
  where density is the weighted penalty sum per 1,000 words.
- Claude-specific patterns (setup-resolution, contrast pairs, pithy fragments)
  carry a **concentration multiplier** — repeated use of the same tic costs
  exponentially more.
- Posts under 10 words always score 100 (trivially clean).
- The linter is purely rule-based — no LLM, no API calls. It will not catch
  every stylistic issue, only the most common AI-slop fingerprints.

## Current baseline scores (as of 2026-04-07, with corpus suppression active)

Corpus suppression (`scripts/slop-rules.jsonl`) suppresses `harness`,
`orchestrate` (technical nouns, not slop verbs), and `blockquote_density`
(TL;DR + `[!TIP]` alerts are intentional design, not thesis-statement slop).

| Post                        | Score | Band     |
|-----------------------------|-------|----------|
| sr11-7.md                   | 91    | clean ✅  |
| welcome-to-the-machine.md   | 86    | clean ✅  |
| context.md                  | 86    | clean ✅  |
| metrics-metrics-metrics.md  | 86    | clean ✅  |
| claude-code-harness.md      | 86    | clean ✅  |
| agent-harness-design.md     | 85    | clean ✅  |
| guardrails.md               | 82    | clean ✅  |
| google-adk-a2a.md           | 77    | light ✅  |

All posts pass the 70-point threshold. Without suppression, `harness`-heavy
posts (`agent-harness-design.md`, `claude-code-harness.md`) score in the
teens — the suppression is load-bearing for those two.

## Emergency bypass

If a post needs to be committed without passing the check:

```bash
SLOP_SKIP=1 git commit -m "..."
```

This bypasses the local pre-commit hook. The CI gate in GitHub Actions is
not bypassable from the command line — only the PR author can override it
by merging with admin privileges (which should be rare and intentional).
