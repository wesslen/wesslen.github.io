---
title: "Harness Design for Long-Running Agents"
date: 2026-03-30
description: "What context files can't do: designing agent harnesses for context management, error recovery, and multi-session continuity."
tags: [GenAI, claude-code, agentic-engineering]
---

> **TL;DR:** Context files tell an agent what to know; the harness is what keeps it alive across a long session with a filling context window, repeated tool failures, and the temptation to cut corners as it runs out of room. A well-designed harness — with a deliberate compaction strategy, structured inter-session state, checkpoint artifacts, and error recovery patterns — is the single largest lever for agent reliability in production. The underappreciated corollary: eval scores that look like model capability may actually be measuring harness design choices, and separating the two is harder than most teams assume.

Context files tell an agent what to know and how to behave. But there's a class of problems they simply can't solve — what happens when the context window fills at hour four of a six-hour coding session, a tool call fails three times in a row, and the model starts cutting corners to finish before it runs out of room. That's the harness's job.

A harness is the orchestration layer that transforms a stateless LLM call into a persistent, tool-using agent. It manages the execution loop, context window, tool routing, error recovery, and inter-session continuity. If you're thinking carefully about [context files](post.html?slug=context), the harness is the natural next question.

Anthropic's two engineering posts on harness design (from November 2025 and March 2026) make a compelling case that harness architecture is the single largest lever for agent reliability in production.[^1] A well-designed harness running a smaller model can outperform a naive setup with a much larger one.

## The core loop

Every modern agent framework converges on the same fundamental structure: a while loop that calls an LLM, checks for tool calls, executes them, and feeds results back. The loop terminates when the model returns a response with no further tool calls.

```python
while not done:
    if context_exceeds_budget(messages):
        messages = compact(messages)
    response = call_llm(messages)
    if response.tool_calls:
        results = execute_tools(response.tool_calls)
        messages.append(results)
    else:
        done = True
        return response
```

The engineering challenge is not the loop itself — that part is solved. It's the five subsystems that surround it: context management, tool routing, error recovery, human-in-the-loop checkpoints, and state persistence across sessions. Token scaling data makes clear why each matters: standard chat uses roughly 1x tokens; a single-agent loop uses ~4x; a multi-agent system uses ~15x.[^2]

## Context window management

**The compaction problem** is where most teams get caught off guard. The November 2025 engineering post identifies a tension: even with rolling summarization, agents exhibited two failure modes — attempting to one-shot complex work and leaving half-implemented features when context ran out, and declaring the job done prematurely when they saw existing progress in a partially-compacted conversation.

The March 2026 follow-up draws a sharp distinction between two strategies. *Compaction* preserves continuity by summarizing earlier conversation in place, but can't fully eliminate "context anxiety" — the agent's tendency to rush or cut corners as the window fills. A full *context reset* provides a clean slate at the cost of requiring a rich handoff artifact for the incoming agent to orient itself.

The lesson: compaction strategy is not a permanent architectural decision. It should track model capability and be revisited as models improve.[^3]

> [!IMPORTANT]
> `CLAUDE.md` and equivalent context files are re-injected with each request rather than stored in conversation history — they survive compaction by design. Any instruction that must persist across the entire agent lifecycle belongs in a context file. An initial system prompt will eventually be summarized away; a context file survives compaction by design.

**The lost-in-the-middle problem** affects everything else. Research measured a 30%+ accuracy drop when critical information moved from position 1 to position 10 in a 20-document context — models attend strongly to context boundaries and weakly to the middle. The harness-level responses: place critical instructions at prompt boundaries, minimize the tool surface (one team reduced from 175 tools consuming ~26% of context to 11 consuming ~1.6%), and use sub-agents with fresh context windows for discrete tasks.[^4]

## Checkpoint and resume patterns

Anthropic's foundational pattern for multi-session agents is a two-agent architecture: an *initializer* that sets up the environment on the first run and a *coding agent* that makes incremental progress each subsequent session. The initializer creates an `init.sh` script, a `claude-progress.txt` log, and a `feature_list.json` with all features marked failing. Each coding agent session begins by reading progress, checking git log, running a health check, and selecting one feature — preventing agents from wasting tokens rediscovering state that's already captured.

The March 2026 post evolves this into a three-agent GAN-inspired architecture: a planner that expands a brief into a full product spec, a generator that implements features sprint by sprint, and an evaluator that tests the running application. The adversarial relationship between generator and evaluator addresses a failure mode Anthropic observed directly: when asked to evaluate their own work, agents tend to praise it even when the quality is obviously mediocre. Tuning a standalone evaluator to be skeptical is far more tractable than making a generator critical of itself.

## State persistence across sessions

The choice of format for inter-session state matters more than it sounds. Anthropic's November 2025 post documents a deliberate decision to use JSON rather than Markdown for the feature list: "the model is less likely to inappropriately change or overwrite JSON files compared to Markdown files." Structured formats resist accidental agent modification.

The full set of inter-session artifacts in Anthropic's pattern: `claude-progress.txt` (a running log that lets fresh agents orient quickly), `feature_list.json` (structured pass/fail status), git history with descriptive commit messages (navigable, revertable), and `init.sh` (reproducible environment setup for any fresh session). The filesystem functions as a shared message bus: inspectable, replayable, and naturally persistent.

## Error handling and graceful degradation

The same engineering post documents four specific failure modes. *Premature completion* — declaring a feature done because simpler tests passed — is solved by requiring end-to-end testing against full spec before marking anything as passing. *Broken environment state* is solved by git plus progress files that let a fresh agent diagnose the situation rather than fail silently. *Premature feature marking* requires strongly-worded instructions with explicit consequences. *Wasted startup time* is solved by `init.sh` establishing a reproducible baseline.

Common patterns across frameworks: schema enforcement via Pydantic, step budgets with hard-kill thresholds, max three retries per agent with exponential backoff, and dead-letter queues for tasks failing past retry limits. Claude Code self-heals when a tool is denied — the agent receives the rejection as a tool result and attempts an alternative rather than halting.

## Security at the harness layer

Prompt injection is the #1 critical vulnerability in [OWASP's 2025 LLM Top 10](https://genai.owasp.org/llmrisk/llm01-prompt-injection/), appearing in 73%+ of production AI deployments — and the harness is the primary enforcement layer.[^5] Key strategies: input separation that distinguishes trusted from untrusted inputs with explicit delimiters, instruction hierarchy where system-level instructions take priority through adversarial training, and sandboxed execution so that even a successful injection can't make harmful system changes.

Claude Code implements three permission layers: `allowed_tools` (auto-approve), `disallowed_tools` (block, overrides allow), and `permission_mode` as fallback. This three-layer model provides defense in depth that operates independently of the context file. Context files express intent; harness permissions enforce it deterministically.

## How harness design and context files divide responsibility

The simplest framing: context files encode what the agent should know; harness logic encodes what the agent cannot do reliably without structured support. This division evolves as models improve — instructions that once required harness enforcement may become reliable enough to express as context-file guidelines.

| Concern | Belongs In | Rationale |
|---------|-----------|-----------|
| Coding standards and conventions | Context file | Survives compaction; applies uniformly |
| Tool usage guidelines | Context file | Advisory; agent applies with judgment |
| Absolute tool prohibitions | Harness (`disallowed_tools`) | Must be deterministic |
| Inter-session project state | Structured files (JSON) | Read by harness startup sequence |
| Context window monitoring | Harness | Requires programmatic measurement |
| Human approval gates | Harness hooks | Cannot be expressed as model instructions |
| Retry logic and error recovery | Harness | Deterministic behavior required |

Anthropic documented the practical interaction in that post: without explicit harness logic prompting agents to read progress files first, they skip them and start from scratch — even when the files are present and well-structured. The context file provides the right knowledge; the harness startup sequence enforces that the agent actually uses it. Neither works well without the other.

## Evaluating at the harness level

Anthropic's ["Demystifying Evals for AI Agents"](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) draws a distinction that reframes how teams think about measurement: when you evaluate "an agent," you're evaluating the harness and the model working together. Eval scores that appear to reflect model capability may actually be measuring harness design choices.

The concrete illustration: Opus 4.5 solved a benchmark problem about booking a flight by discovering a policy loophole. It failed the evaluation as written but actually found a better solution for the user. The evaluation harness had defined success too narrowly. The lesson is that eval scores should not be taken at face value until someone reads actual transcripts and verifies the grading criteria reflect genuine task success.

Calibrating an evaluator agent requires the same iterative refinement as calibrating a task agent.[^6] The loop looks like this: read the evaluator's logs, find where its judgment diverged from a human reviewer's, update the QA prompt, repeat. Three or four cycles of this moved Claude from "talks itself into approving mediocre work" to "flags real issues and escalates them." That refinement is harness work, which is easy to forget when the bottleneck looks like model behavior.

[^1]: Anthropic Engineering, ["Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (November 2025) and ["Harness Design for Long-Running Application Development"](https://www.anthropic.com/engineering/harness-design-long-running-apps) (March 2026). The March post also documents the three-agent planner/generator/evaluator pattern and concrete experience tuning evaluator agents.
[^2]: Token scaling from Anthropic internal data. The [Manus team](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) found tool responses alone account for 67.6% of total tokens in agent runs — which is why tool surface minimization is a first-order cost and context lever, not merely a hygiene choice.
[^3]: Anthropic found Sonnet 4.5 required explicit context resets; Opus 4.5 largely eliminated the need; Opus 4.6 improved further to the point that one continuous session with automatic compaction was sufficient for long builds. [Phil Schmid's framework](https://www.philschmid.de/context-engineering-part-2) formalizes three strategies: compaction, isolation (sub-agents with fresh context), and agentic memory (external persistent storage). Preference order: raw context → compaction → summarization.
[^4]: Liu et al. (2024), ["Lost in the Middle: How Language Models Use Long Contexts"](https://arxiv.org/abs/2307.03172). MIT research traced the effect to positional encodings creating a U-shaped attention pattern. Microsoft's [LongLLMLingua](https://arxiv.org/abs/2310.06839) improved accuracy by up to 21.4% at 4x compression using context compression techniques.
[^5]: A [2025 arXiv benchmark](https://arxiv.org/abs/2511.15759) found that well-layered prompt injection defense reduces successful attack rates from 73.2% to 8.7% while maintaining 94.3% of baseline task performance. The [HouYi research framework](https://arxiv.org/abs/2306.05499) achieved an 86.1% success rate in prompt injection attacks across 36 LLM-integrated applications when defenses were minimal.
[^6]: From the March 2026 Anthropic post: "Out of the box, Claude is a poor QA agent. In early runs, I watched it identify legitimate issues, then talk itself into deciding they weren't a big deal and approve the work anyway." Calibration required multiple iterations: read the evaluator's logs, find where its judgment diverged from human judgment, update the QA prompt. The same loop as calibrating any other eval.
