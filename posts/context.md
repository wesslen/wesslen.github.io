---
title: "Is the Future of Programming Just Managing Markdown?"
date: 2026-03-28
description: "What context files actually do, why they go stale, and what it means when the agent knows your codebase better than you do."
tags: [GenAI, claude-code, context-engineering]
---

> **TL;DR:** Context files like `CLAUDE.md` and `AGENTS.md` solve the cold-start problem for coding agents by injecting persistent project knowledge at every new session. They work — but ETH Zurich research shows LLM-generated context files can reduce task success rates while increasing costs, because agents follow bad instructions as faithfully as good ones. The harder problem is staleness: projects change faster than context files do, and in large teams where everyone works through agents, a stale file may be the last thin layer between developers and a codebase nobody reads anymore.

If you've used a GenAI coding tool — Claude Code, GitHub Copilot, Cursor — you've hit this wall: you start a new session, and the agent knows nothing. Which framework you're using, why you made that architectural call last week, that the port is 3002 not 3000. So you prompt it again.

Context files are the answer. You write a Markdown file — `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` — drop it in the right place, and the agent reads it at the start of every session. What used to be repeated conversation becomes persistent knowledge. This is what people call *context engineering*: instead of prompting the same things over and over, you codify them once in a version-controlled file.

The part that doesn't get discussed is that these files accumulate. Design directions get abandoned, but the file still says they're current. The agent reads it faithfully and confidently does the wrong thing.[^1] And if you're moving between tools (which most teams are), you're maintaining multiple files with overlapping, occasionally conflicting instructions.

There's a framing I keep coming back to. The arc from ad-hoc prompting to version-controlled, self-updating knowledge systems suggests that programming is becoming the art of managing Markdown files.

Conventions in `CLAUDE.md`. Capabilities in `SKILL.md`. Visual systems in `DESIGN.md`. The agent reads; the agent builds. I'm not sure whether that's a breakthrough or a warning.

## What context files actually do

The fundamental problem is cold start: every new agent session begins with a blank slate. A well-written `CLAUDE.md` or `AGENTS.md` solves this by injecting persistent, project-specific knowledge at the start of every interaction — the build commands, the architectural constraints, the non-obvious gotchas.

Beyond factual project knowledge, context files shape what the agent does and doesn't do. Claude Code's *auto-memory* system takes this further: the agent automatically saves useful discoveries — successful build commands, debugging insights — to a `MEMORY.md` that grows across sessions. Agent Skills extend the concept to on-demand capabilities that load only when relevant, rather than consuming window space permanently.[^2]

When a context file is committed to version control, every team member's AI assistant works from the same baseline. New developers and new agents alike inherit the project's conventions immediately. That's the promise.

> [!NOTE]
> Context files are advisory. Claude exercises judgment about which instructions apply in context. For truly mandatory constraints — "never run `rm -rf` on production" — use hooks: shell commands that fire at specific lifecycle events regardless of what the model decides.

## From Copilot to AGENTS.md: how the tooling evolved

The story starts with GitHub Copilot's 2021 launch: inline autocomplete with no persistent project knowledge. Developers who wanted to influence outputs used strategically placed code comments. Cursor introduced `.cursorrules` in 2023 — one of the first project-level context files. GitHub Copilot added `.github/copilot-instructions.md` in 2024.[^3]

Claude Code arrived in February 2025, introducing `CLAUDE.md` with a sophisticated hierarchy (enterprise policies, user preferences, project conventions, directory-scoped rules) and popularizing the term "context engineering." July 2025 brought `AGENTS.md`, a vendor-neutral standard now stewarded by the [Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) and supported across Claude Code and all major coding agents. March 2026 added [`DESIGN.md` from Google Stitch](https://github.com/google-labs-code/stitch-skills/tree/main/skills/design-md), the first context file designed for visual design systems.

The options available to someone starting today:

| Tool | Context File | Notes |
|------|-------------|---------|
| Claude Code | `CLAUDE.md` + hierarchy | Multi-level; survives compaction |
| GitHub Copilot | `.github/copilot-instructions.md` | Auto-attached to all requests |
| Cursor | `.cursor/rules/*.mdc` | Four activation modes |
| Windsurf | `.windsurf/rules/` | Strict 6K char limit per file |
| Any agent | `AGENTS.md` | Vendor-neutral; symlink your way to one source |

## Claude Code's hierarchy in practice

Claude Code's context system is the one I've found most useful, and the one I spend the most time maintaining. That's an honest reflection of how powerful and how demanding the hierarchy is. Files load from highest to lowest precedence: managed enterprise policy, then user global (`~/.claude/CLAUDE.md`), then project root (`./CLAUDE.md`), then local project (`./CLAUDE.local.md`), then subdirectories on demand.

The `.claude/rules/` directory lets you split instructions across files with path-based activation:

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API Design Rules
- All handlers return { data, error } shape
- Use zod for request body validation
```

A practical project-level `CLAUDE.md` is usually shorter than people expect:

```markdown
## Commands
- Dev: `bun run dev` (port 3002)
- Build: `bun run build && bun run typecheck:fast`
- Test: `bun test` (not npm test)

## Conventions
- TypeScript strict mode — no `any` types
- All DB access through Drizzle ORM, never raw SQL

## Gotchas
- .env.local required locally — see docs/setup.md
```

## Where context files fall short

**The staleness problem** is the one I keep bumping into. Projects change fast; context files often don't. An architecture decision that was current in week two gets abandoned by week six, but the file still describes it as canonical. The agent reads faithfully and starts confidently doing the wrong thing. I've spent more time than I'd like debugging agent behavior that turned out to be perfectly rational given stale instructions.

**Context window bloat** compounds it. You add rules because they seem useful; a few months later you have a sprawling file that the model is probably half-ignoring due to the "lost-in-the-middle" problem, a documented tendency for models to attend strongly to context boundaries and weakly to everything in the middle.[^4]

**Conflicting instructions** emerge in multi-tool setups. My workflow involves Claude Code as the primary tool, with Copilot and Cowork alongside it. Reconciling context files across multiple surfaces multiplies the maintenance burden by the number of tools you're using.

One thing that doesn't show up enough: security instructions. [Analysis of real-world repositories](https://arxiv.org/abs/2511.12884v1) found them in only 14.5% of context files. If you're defining what the agent *can* do, also define what it *can't* — especially around destructive operations and credential handling.

> [!CAUTION]
> The security exposure from skills files runs deeper than what belongs in a context file. Skills marketplaces have grown to thousands of entries with minimal gatekeeping — one audit found 824 confirmed malicious skills in a single marketplace. Invisible Unicode codepoints can embed instructions that survive human code review entirely. And agents with filesystem access can write new skills into their own environment, establishing persistence across future sessions. For the full picture, [see the companion post on the skills supply chain problem](post.html?slug=skills-supply-chain).

## What the research actually found

The most useful evaluation comes from an ETH Zurich study that tested whether context files actually improve agent performance across 138 real-world repositories.[^5] The headline finding surprised me: LLM-generated context files *reduced* success rates by ~2% while increasing costs by 20–23%. The problem wasn't disobedience. Agents followed instructions faithfully, but following unnecessary instructions (style guides, sprawling directory overviews) consumed tokens and thinking time without benefit.

The same obedience that makes guardrails effective also creates brittleness. When a context file mentions the `uv` package manager, agents use it 160 times more frequently than without the instruction. The mechanism works — which means bad instructions work just as reliably as good ones.

Which raises an uncomfortable question: how much of what we're putting into context files is actually helping, versus creating the feeling that we're doing something useful? I don't have a clean answer, and I'm not sure the field does either.

## What actually belongs in a context file

The research confirms: keep it surgical. Sweeping overviews and style guides don't improve agent performance.[^6] What works: non-obvious tooling choices, project-specific gotchas, critical architectural constraints, and exact commands.

| Type | Where it belongs |
|------|-----------------|
| Coding standards, conventions | Context file — survives compaction |
| Tool usage guidelines | Context file — advisory |
| Absolute tool prohibitions | Agent runtime `disallowed_tools` — deterministic |
| Build commands, gotchas | Context file — factual |
| Human approval gates | Hooks — not expressible as model instructions |

The defense-in-depth principle matters more than file size: context files set guidelines; static analysis enforces them. Linters, formatters, type checkers, and hooks catch violations regardless of whether the model followed the instruction.

## DESIGN.md: the newest extension

March 2026 introduced `DESIGN.md` from Google Stitch — the first context file designed for visual design systems rather than code. Where `AGENTS.md` defines build commands and conventions, `DESIGN.md` captures color palettes, typography hierarchies, component styling, and spatial relationships in natural language paired with precise values.[^7]

The distinctive choice is semantic language over raw values: a border radius of `rounded-full` becomes "Pill-shaped"; shadows are described as "Whisper-soft diffused shadows" rather than `shadow-lg`. This optimizes for the actual consumer — an AI model that benefits more from design intent than mechanical reproduction.

`DESIGN.md` represents the broader principle: any specialist knowledge an agent needs can live in a purpose-built, version-controlled Markdown file. The pattern generalizes to `API.md` for endpoint conventions, `SCHEMA.md` for data relationships, `COMPLIANCE.md` for regulatory constraints.

## The question I keep coming back to

Val Town's engineering blog made a point that stuck: [vibe coding is legacy coding](https://blog.val.town/vibe-code). The argument is that code becomes legacy when nobody understands it anymore — and vibe coding produces exactly that by design. If you're prompting an agent to build something you couldn't reconstruct yourself, you haven't built software; you've generated technical debt with a nicer interface.

Context files live uncomfortably close to this critique. At their best, a well-written `CLAUDE.md` is a forcing function — you can't write it without articulating why your conventions exist, what the tradeoffs were, where the bodies are buried. Done well, it's documentation-as-understanding. But I've also written context files that are closer to the ritual version: files that gesture at a codebase without capturing it, that make it easier to keep prompting without stopping to think about what the code is doing.

The organizational version worries me more. In a large team where everyone works through agents, the context file may become the last thin layer between developers and a codebase they've already stopped reading closely. When that file goes stale — and we've established it will — there may be nobody left who can tell the difference. The specific failure I keep imagining is a production incident where nobody can triage it. The logs are present, but nobody has read this part of the codebase in months.

The context file works best when writing it forces you to understand the system you're describing. When it becomes a substitute for that understanding — when it makes prompting smoother without making the codebase less obscure — the file has optimized for the wrong thing.

[^1]: ETH Zurich's AGENTbench study ([arXiv:2602.11988](https://arxiv.org/abs/2602.11988)) tested 138 repositories with developer-committed context files and found agents are "too obedient" — they follow instructions faithfully, but following unnecessary instructions consumes tokens and thinking time without improving task completion.
[^2]: Skills use progressive disclosure: at startup, only metadata loads (~50–100 tokens per skill). When a skill matches the user's prompt, the full body loads. A project with 20 skills consumes roughly 2,000 tokens at startup versus loading everything upfront.
[^3]: Matthew Honnibal's [Clownpocalypse post](https://honnibal.dev/blog/clownpocalypse) captures the early chaos well: aggregator sites appeared overnight, and the shared templates couldn't even handle HTML comments in Markdown — meaning any skill browsed on a website could contain hidden instructions not rendered to the human reader. His broader thesis is that the shared-skills pattern is reproducing every supply chain vulnerability from npm and PyPI, just faster. The [companion post on skills security](post.html?slug=skills-supply-chain) covers the full attack surface.
[^4]: Liu et al. (2024) ["Lost in the Middle: How Language Models Use Long Contexts"](https://arxiv.org/abs/2307.03172) measured a 30%+ accuracy drop when critical information moved from position 1 to position 10 in a 20-document context. The practical implication: put the most critical constraints at the top of the file.
[^5]: The full paper: ["Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"](https://arxiv.org/abs/2602.11988) (ETH Zurich, arXiv:2602.11988, 2026). Human-written context files showed ~4% improvement over no context files, but only in poorly-documented codebases where they substitute for missing documentation.
[^6]: Recommended sizes from the research: primary context files under 200 lines; directory-scoped rules under 60 lines; Agent Skills bodies under 5,000 tokens. Claude Code's [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) means `CLAUDE.md` content serves at roughly 90% lower token cost after the first turn.
[^7]: The Stitch MCP server connects `DESIGN.md` to Claude Code, Cursor, Gemini CLI, and OpenAI Codex. The [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) repository had accumulated 886+ stars and ~640 weekly installs across six agents as of early 2026.
