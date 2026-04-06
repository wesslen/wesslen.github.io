---
title: "Inside the Claude Code Harness"
date: 2026-04-04
description: "Anthropic's source code leaked. Here's what it reveals about how a production-grade agent harness actually gets built — and how much of it looks like design versus survival."
tags: [GenAI, claude-code, agentic-engineering]
---

> **TL;DR:** Anthropic's Claude Code source recently leaked — about 1,900 TypeScript files. Walking through it is a study in the gap between how harnesses get described in theory and how they actually get built: four compaction layers where one would sound sufficient, a prompt cache split that amortizes cost across users, permission denials fed back to the model as tool results, and a comment in `query.ts` written in mock-medieval English to make sure nobody skims past it. The lesson isn't that Anthropic got everything right. It's that a production harness accumulates scars, and the scars are worth studying.

In a [recent post on agent harness design](post.html?slug=agent-harness-design), I wrote about what makes a harness. Compaction strategies, checkpoint artifacts, error recovery, state persistence across sessions. What I couldn't answer was how much of that gets designed upfront versus discovered after years of production failures. Then [Anthropic's Claude Code source code leaked](https://www.bloomberg.com/news/articles/2026-04-01/anthropic-scrambles-to-address-leak-of-claude-code-source-code).

About 1,900 files of TypeScript. Haseeb Qureshi read through the key modules and published a breakdown.[^1] I went back through it looking specifically for what maps to harness design — and what the implementation choices reveal about where the hard problems actually live.

## The core loop is an async generator

Every event — text chunks, tool calls, progress updates, errors, compaction boundaries — flows through a single `yield`-based stream. The CLI, the SDK, and the IDE bridge all consume the same event stream and just render it differently.

> [!TIP]
> **Plain terms:** A generator is a function that produces values one at a time, pausing between each — like a ticker tape printing one item at a time rather than dumping the whole roll at once. The `yield` keyword is what hands each value to whatever's listening. Claude Code builds its entire event loop on this pattern: every output (a word of text, a tool call, an error) passes through the same tape in order, and the terminal, IDE, and browser each just tap into it and display what arrives in their own way.

This matters architecturally. You can chain smaller generators into the main one (`yield*`) — like splicing tributaries into a river without rerouting the whole channel — which is probably why the same core loop can serve such different surfaces without a separate implementation for each. Composability was baked in, not bolted on.

The lifetime of a request follows what I'd expect from any sophisticated harness: input processing, system prompt assembly, file snapshotting, the agentic loop, transcript persistence. The interesting part is what happens inside each of those steps.

## The terminal UI is a React app

The CLI entrypoint is `src/entrypoints/cli.tsx`. That `.tsx` extension is not a typo. The entire terminal interface is a React component tree rendered with Ink — a library that takes React's web component model (buttons, text boxes, layouts) and outputs colored text and boxes to your terminal window instead of a browser.

Message bubbles, tool call displays, permission prompts, the markdown renderer — all React components. Same mental model as a web app, except the "DOM" is your terminal.

I mention this not because it's a harness decision exactly, but because it says something about the organizational tradeoff. A React-for-terminal approach means the same team that builds the web experience can contribute to the CLI. You trade some performance for a shared mental model across surfaces. Whether that's the right call depends entirely on your team.

## Four compaction layers, not one

I wrote in the last post that compaction strategy isn't a permanent architectural decision. Apparently it isn't even a single decision. Sebastian Raschka's breakdown of coding agent components identifies clipping and summarization as the two strategies a minimal coding harness needs to handle context bloat.[^5] Claude Code uses four distinct layers.

**Proactive compaction** monitors token count each turn. When it approaches the limit, it summarizes older messages into a compact boundary marker before sending to the API — so the user never sees a failure, just a brief summarization pass.

**Reactive compaction** is the fallback. If proactive misses — race condition, bad token estimate — and the API returns `prompt_too_long`, this catches the error, compacts retroactively, and retries. The user sees a brief delay instead of a crash.

**Snip compaction** is SDK and headless-mode only. Rather than summarizing, it truncates at defined boundaries to keep memory bounded in long automated sessions. Summarization has overhead; in fully automated runs, losing some history may be acceptable.

**Context collapse** — internally flagged as `marble_origami` — is the most interesting. It compresses verbose tool results mid-conversation without triggering full compaction. If a tool returned 500 lines of output three turns ago and you don't need it anymore, this collapses it to a shorter representation. Collapse commits are persisted to the transcript as `ContextCollapseCommitEntry` records, meaning they can be selectively un-compacted later.

Four layers is not elegant — it's the accumulated result of years of watching users hit the context ceiling in different ways and patching each failure mode as it surfaced.

## The prompt cache boundary trick

The system prompt is assembled from roughly 15 composable functions. A marker called `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` divides it into two halves.

Everything above the boundary is static: behavioral instructions, coding style, safety guidelines. Everything below is per-session: the user's `CLAUDE.md` files, MCP server instructions, environment info. The static half is cached with `scope: 'global'` — about 3,000 tokens cached globally across users. They fingerprint the static content using a hash function (Blake2b), so the API can recognize "I've seen this exact prefix before" and skip reprocessing it — even across completely separate users' sessions.[^2]

This is a clever amortization move. A larger prompt paid for once, then hits the cache for every subsequent request. Per-session context gets injected after the boundary, keeping the dynamic portion small while the expensive static half is essentially free after the first hit.

## Internal engineers get different instructions

A `process.env.USER_TYPE === 'ant'` check runs throughout prompt construction. Internal Anthropic engineers get different instructions than external users.

Some of the differences: internal users get "If you notice the user's request is based on a misconception, say so." External users don't. Internal users also get "Never claim 'all tests pass' when output shows failures" — a guardrail that, per the source comment, was needed badly enough to add explicitly. There's also a `<=25 words between tool calls` instruction, with a comment noting that "research shows ~1.2% output token reduction vs qualitative 'be concise.'" They A/B tested the specific phrasing and measured the delta.[^3]

> [!NOTE]
> The source also includes an `isUndercover()` mode that strips all model names and identifiers from the system prompt so internal model identifiers can't leak into public commits or PRs. The dead code elimination comments around it are written to be paranoid on purpose — the identifier being "built-time constant-folded" rather than hoisted to a variable so the bundler can eliminate the branch entirely in external builds.

This `ant` check pattern is worth thinking about beyond the implementation detail. It suggests Anthropic is running different quality bars internally — which implies they know the external product has safety margins baked in that internal engineers don't need. That's a reasonable call. It also means the prompt instructions the public sees are a conservative version of what Anthropic has decided is safe to expose.

## Session persistence is asymmetric on purpose

Transcript writes are fire-and-forget for assistant messages but `await`ed for user messages.

The source comment explains: if the process is killed before the API responds, the transcript needs to be resumable from the point the user message was accepted. Assistant messages are already durable in the API response and can be replayed. User messages aren't — if the process dies between the user hitting enter and the API responding, that message is gone unless you write it synchronously first.

> [!TIP]
> **Plain terms:** `await` means "stop and wait for this to finish before moving on" — like holding the door open until you hear the latch click. "Fire-and-forget" means send it and move on without waiting for confirmation. Claude Code uses the slower, safer `await` only for user messages because those can't be recovered if the process crashes mid-write. Assistant messages can always be reconstructed from the API response, so they don't need the guarantee.

This is a production scar. Someone lost a session. The fix is one targeted `await`. I find these sorts of asymmetries more instructive than the clean architectural decisions, because they reveal the failure modes you don't think of until they happen in production.

## The thinking rules comment

There's a comment in `query.ts` that I keep coming back to:

```typescript
The rules of thinking are lengthy and fortuitous. They
require plenty of thinking of most long duration and deep
meditation for a wizard to wrap one's noggin around.

Heed these rules well, young wizard. For they are the
rules of thinking, and the rules of thinking are the
rules of the universe. If ye does not heed these rules,
ye will be punished with an entire day of debugging and
hair pulling.
```

This is a warning from someone who lost a day to a subtle API constraint around how thinking blocks must be preserved across a trajectory, written in a style designed to make sure no one skims past it. The mock-medieval English is there to make sure nobody skims past it.

I find this more useful than any architecture diagram. The comments engineers write after something breaks tell you where the actual complexity lives — the parts that aren't obvious from first principles, that have to be learned through failure.

## Denial as tool output

The permission system runs every tool call through a pipeline: mode check, hook evaluation, rule matching, user prompt. That part is straightforward.

What I didn't anticipate: when a tool call is denied, the denial is wrapped as a tool result and fed back to the model as if the tool had returned an error. Claude sees "permission denied" as a tool output and adjusts its approach — trying an alternative rather than halting. The system also tracks all denials across a session and reports patterns to the SDK caller, so IDE integrations can surface things like "the user keeps denying bash commands in `/etc`."

> [!TIP]
> **Plain terms:** Most software hits a permission wall and stops — it throws an error and waits for a human to intervene. Claude Code instead packages the denial in the same format as any other tool response, so the model receives "permission denied" the same way it would receive "file not found" — as information to reason about and route around. The agent can try a different approach on the next turn without any human in the loop.

This is subtler than a permission wall. It means the agent can reason about its own boundaries, treating a denied action as feedback rather than a dead end. I described error recovery as a core harness concern in the last post; this is a specific implementation of that where the recovery loop runs through the model itself.

## The harness is where the years live

About 500K lines of TypeScript. The actual API call is maybe 200 of them.

Everything else is the harness. Four compaction layers. Prompt cache split at a precise boundary. Permission denial fed back as tool output. Asymmetric session persistence. Speculative pre-computation of likely next responses while the user is typing. Memory prefetch running during streaming so relevant `CLAUDE.md` content is available before the first tool executes.[^4]

None of this is visible from the outside. When Claude Code works well, it looks like model capability. When it doesn't, it's usually one of these layers.

Raschka makes a speculative but interesting claim: drop a capable open-weight model into a harness of this quality and it would likely perform comparably to the frontier models that run inside Claude Code or Codex today.[^5] I think that's probably right. Which reframes the question of what "model capability" means in the context of any shipped product — most of what we observe as capability is the harness doing its job invisibly.

The question I keep turning over: how much of this was designed from the beginning versus accumulated under production load? My guess is almost none of the four-compaction-layer hierarchy was planned. You don't start with `marble_origami`. You start with one compaction strategy, watch it fail in three different ways, and patch each failure. The architecture reflects the failures more than the design.

That's probably the most instructive part — and the hardest to communicate when you're building the first version.

[^1]: Haseeb Qureshi's breakdown is the primary source for this post: [gist.github.com/Haseeb-Qureshi/d0dc36844c19d26303ce09b42e7188c1](https://gist.github.com/Haseeb-Qureshi/d0dc36844c19d26303ce09b42e7188c1). I've reorganized around the themes that connect most directly to harness design; his original covers additional engineering details including the comparison to OpenAI's Codex.
[^2]: Blake2b is a fast cryptographic hash function. The implication is that they compute a hash of the static prompt prefix and use it as a cache key — ensuring globally identical static prefixes get cache hits across separate API calls from different users, not just within a single session.
[^3]: There are `@[MODEL LAUNCH]` markers throughout the source tracking A/B tests, with annotations like `capy v8 thoroughness counterweight (PR #24302)`. Anthropic is iterating on prompt wording the way ad companies iterate on copy — running experiments, measuring token output reductions, and committing the winners.
[^4]: Speculation (pre-computing likely next responses while the user types) and memory prefetch (loading relevant `CLAUDE.md` files during streaming using TC39's `using` keyword for explicit resource management) are both latency-hiding moves — work that can happen in parallel with something else, so it's not on the critical path. The `using` keyword ensures cleanup runs on all generator exit paths: normal completion, early abort, or error.
[^5]: Sebastian Raschka, ["Components of a Coding Agent"](https://magazine.sebastianraschka.com/p/components-of-a-coding-agent) (April 2026). His breakdown covers six core components — live repo context, prompt shape and cache reuse, structured tools and permissions, context reduction, transcripts and memory, and bounded subagent delegation — and is useful complementary reading to this post. The harness-vs-model speculation appears in his discussion of why Claude Code and Codex can feel significantly more capable than the same models in a plain chat interface.
