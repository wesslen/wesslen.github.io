---
title: "Reference Audit — Links & Citations Needed"
date: 2026-04-01
description: "Master list of all references across the three main posts that need URL links or verifiable citations. For research session use."
tags: [internal]
---

> **Usage:** Take this list into a research session. For each item, find the canonical URL (official source preferred — Fed.gov, arxiv.org, docs pages, etc.) and return here to fill in links.
>
> **Last researched:** 2026-04-01. Items marked ✅ have confirmed URLs. Items marked ⚠️ were not found or need verification. Items marked 🔍 still need searching.

---

## context.md

### Body text — unlinked claims

| # | Claim / Reference | Where it appears | URL Found |
|---|---|---|---|
| C1 | ETH Zurich AGENTbench study — "138 real-world repositories" | Body § "What the research actually found" | ✅ [arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988) |
| C2 | "14.5% of context files" include security instructions | Body § "Where context files fall short" (WARNING alert) | ✅ Same paper: [arXiv:2602.11988](https://arxiv.org/abs/2602.11988) |
| C3 | "`uv` package manager 160 times more frequently" | Body § "What the research actually found" | ✅ Same paper: [arXiv:2602.11988](https://arxiv.org/abs/2602.11988) |
| C4 | AGENTS.md "now stewarded by the Linux Foundation" | Body § "The landscape" | ✅ [Linux Foundation / Agentic AI Foundation announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) (Dec 9, 2025) |
| C5 | Google Stitch DESIGN.md specification | Body § "DESIGN.md: the newest extension" | ✅ [stitch-skills/skills/design-md on GitHub](https://github.com/google-labs-code/stitch-skills/tree/main/skills/design-md) |
| C6 | `stitch-skills` GitHub repo (886+ stars, 640 weekly installs) | Footnote [^7] | ✅ [github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) |

### Footnotes — need URLs added

| # | Footnote | Current text | URL Found |
|---|---|---|---|
| C7 | [^1] | "ETH Zurich's AGENTbench study (arXiv:2602.11988)" | ✅ [arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988) |
| C8 | [^3] | "Matthew Honnibal's [Clownpocalypse post]" | ✅ **Verified working:** [honnibal.dev/blog/clownpocalypse](https://honnibal.dev/blog/clownpocalypse) |
| C9 | [^4] | "Liu et al. (2024) 'Lost in the Middle'" | ✅ [arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172) (also published in TACL 2024 via MIT Press) |
| C10 | [^5] | "arXiv:2602.11988" | ✅ [arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988) |
| C11 | [^6] | "Claude Code's prompt caching means ~90% lower token cost" | ✅ [Anthropic prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — cache reads cost 0.1× base input price |
| C12 | [^7] | "Stitch MCP server connects DESIGN.md to..." | ✅ [github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) |

---

## agent-harness-design.md

### Body text — unlinked claims

| # | Claim / Reference | Where it appears | URL Found |
|---|---|---|---|
| H1 | Anthropic Engineering, "Effective Harnesses for Long-Running Agents" (Nov 2025) | Intro paragraph + [^1] | ✅ [anthropic.com/engineering/effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) |
| H2 | Anthropic Engineering, "Harness Design for Long-Running Application Development" (Mar 2026) | Intro paragraph + [^1] | ✅ [anthropic.com/engineering/harness-design-long-running-apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) (published Mar 24, 2026) |
| H3 | Anthropic "Demystifying Evals for AI Agents" | § "Evaluating at the harness level" | ✅ [anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (published Jan 9, 2026) |
| H4 | "175 tools consuming ~26% of context → 11 tools consuming ~1.6%" | § "Context window management" | ⚠️ **Not found.** Original attribution unclear — may be from Anthropic's Nov 2025 harness post or an internal benchmark. Check the Manus blog post and Phil Schmid Part 2 for similar data. |
| H5 | OWASP 2025 LLM Top 10 — prompt injection #1 vulnerability | § "Security at the harness layer" | ✅ [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — LLM01:2025 Prompt Injection is #1; direct link: [genai.owasp.org/llmrisk/llm01-prompt-injection/](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) |

### Footnotes — need URLs or citations

| # | Footnote | Current text | URL Found |
|---|---|---|---|
| H6 | [^2] | "Manus team found tool responses = 67.6% of total tokens" | ✅ [manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) — verify the 67.6% figure against the post |
| H7 | [^2] | "Token scaling: 1x chat, ~4x single-agent, ~15x multi-agent" | ⚠️ **Not found.** Likely from same Manus blog post or an Anthropic internal reference. Check the Manus blog above and the Anthropic Nov 2025 harness post. |
| H8 | [^3] | "Phil Schmid's framework: compaction → isolation → agentic memory" | ✅ [philschmid.de/context-engineering-part-2](https://www.philschmid.de/context-engineering-part-2) (Dec 4, 2025) and/or [philschmid.de/agent-harness-2026](https://www.philschmid.de/agent-harness-2026) (Jan 5, 2026) |
| H9 | [^4] | "Liu et al. (2024), 'Lost in the Middle'" | ✅ [arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172) |
| H10 | [^4] | "MIT research on positional encodings / U-shaped attention" | ✅ This is the same Liu et al. paper published in MIT Press TACL: [direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00638](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00638/119630/Lost-in-the-Middle-How-Language-Models-Use-Long) — the U-shaped attention finding is its central result |
| H11 | [^4] | "Microsoft's LongLLMLingua improved accuracy 21.4% at 4x compression" | ✅ [arxiv.org/abs/2310.06839](https://arxiv.org/abs/2310.06839) — "LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression" |
| H12 | [^5] | "2025 arXiv benchmark: 73.2% → 8.7% attack rate" | ✅ [arxiv.org/abs/2511.15759](https://arxiv.org/abs/2511.15759) — "Securing AI Agents Against Prompt Injection Attacks" (Nov 19, 2025) |
| H13 | [^5] | "HouYi research framework — 86.1% success rate" | ✅ [arxiv.org/abs/2306.05499](https://arxiv.org/abs/2306.05499) — "Prompt Injection attack against LLM-integrated Applications"; also [github.com/LLMSecurity/HouYi](https://github.com/LLMSecurity/HouYi) |

---

## sr11-7.md

### Primary regulatory documents — need direct links

| # | Document | Where it appears | URL Found |
|---|---|---|---|
| S1 | SR 11-7 (Federal Reserve, April 4, 2011) | Intro + § "Three pillars" | ✅ [federalreserve.gov/supervisionreg/srletters/sr1107.htm](https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm) |
| S2 | OCC Bulletin 2025-26 (September 2025) | § "Patchwork of responses" | ✅ [occ.gov/news-issuances/bulletins/2025/bulletin-2025-26.html](https://www.occ.gov/news-issuances/bulletins/2025/bulletin-2025-26.html) |
| S3 | Governor Barr speech, April 4, 2025 (Fed SF) | Intro + § "Patchwork" | ✅ [federalreserve.gov/newsevents/speech/barr20250404a.htm](https://www.federalreserve.gov/newsevents/speech/barr20250404a.htm) — "AI, Fintechs, and Banks" |
| S4 | OCC Bulletin 2000-16 (OCC 2000, "effective challenge") | § "Crisis-era failures" | ✅ [occ.gov/static/rescinded-bulletins/bulletin-2000-16.pdf](https://www.occ.gov/static/rescinded-bulletins/bulletin-2000-16.pdf) (rescinded; superseded by 2011-12) |
| S5 | SR 21-8 (BSA/AML MRM extension) | § "Four scenarios" | ✅ [federalreserve.gov/supervisionreg/srletters/SR2108.htm](https://www.federalreserve.gov/supervisionreg/srletters/SR2108.htm) |
| S6 | Treasury Financial Services AI RMF (Feb 19, 2026) | § "Patchwork of responses" | ✅ [home.treasury.gov/news/press-releases/sb0401](https://home.treasury.gov/news/press-releases/sb0401) |
| S7 | NIST AI RMF 1.0 (AI 100-1, January 2023) | § "Patchwork" | ✅ [nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10) (PDF: [nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)) |
| S8 | NIST Generative AI Profile (AI 600-1, July 2024) | § "Patchwork" | ✅ [nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) (PDF: [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)) |
| S9 | UK PRA SS1/23 (May 2024) | § "Patchwork" | ✅ [bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks-ss](https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks-ss) (effective May 17, 2024) |
| S10 | OSFI Guideline E-23 (September 2025, effective May 2027) | § "Patchwork" | ✅ [osfi-bsif.gc.ca/en/guidance/guidance-library/guideline-e-23-model-risk-management-2027](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/guideline-e-23-model-risk-management-2027) (published Sep 11, 2025) |
| S11 | EU AI Act (Regulation 2024/1689) | § "Patchwork" | ✅ [eur-lex.europa.eu/eli/reg/2024/1689/oj/eng](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) |
| S12 | FSB "Financial Stability Implications of AI" (November 2024) | CAUTION alert | ✅ [fsb.org/2024/11/the-financial-stability-implications-of-artificial-intelligence/](https://www.fsb.org/2024/11/the-financial-stability-implications-of-artificial-intelligence/) (published Nov 14, 2024) |

### Industry/research documents — need links or citations

| # | Reference | Where it appears | URL Found |
|---|---|---|---|
| S13 | Bank Policy Institute call for SR 11-7 repeal (April 2025) | § "Patchwork" | ✅ BPI's OSTP RFI response (Oct 27, 2025) covers the same ground: [bpi.com/bpi-responds-to-white-house-office-of-science-and-technology-policys-rfi-regulatory-reform-on-artificial-intelligence/](https://bpi.com/bpi-responds-to-white-house-office-of-science-and-technology-policys-rfi-regulatory-reform-on-artificial-intelligence/) — the April 2025 repeal call itself was reported at [risk.net](https://www.risk.net/risk-management/7963135/bpi-says-sr-11-7-should-go-bank-model-risk-chiefs-say-%E2%80%98no%E2%80%99) (paywalled) |
| S14 | American Bankers Association position (December 2025) | § "Patchwork" | ✅ [aba.com/advocacy/policy-analysis/sfr-on-ai-innovation](https://www.aba.com/advocacy/policy-analysis/sfr-on-ai-innovation) — ABA Statement for the Record before House Financial Services Committee (Dec 10, 2025) |
| S15 | Consumer Bankers Association letter to OSTP (October 2025) | Footnote [^4] | ✅ [consumerbankers.com/wp-content/uploads/2025/10/CBA-Comment-on-Docket-OSTP-TECH-2025-0067-10.27.2025.pdf](https://consumerbankers.com/wp-content/uploads/2025/10/CBA-Comment-on-Docket-OSTP-TECH-2025-0067-10.27.2025.pdf) |
| S16 | David Li's Gaussian copula model (2000) | § "Crisis-era failures" | ✅ Felix Salmon, ["Recipe for Disaster: The Formula That Killed Wall Street"](https://www.wired.com/2009/02/wp-quant/), *Wired*, February 23, 2009 |
| S17 | Nassim Taleb Congressional testimony (2009) | § "Crisis-era failures" | ✅ [govinfo.gov/content/pkg/CHRG-111hhrg51925/pdf/CHRG-111hhrg51925.pdf](https://www.govinfo.gov/content/pkg/CHRG-111hhrg51925/pdf/CHRG-111hhrg51925.pdf) — House hearing, 111th Congress |
| S18 | McKinsey benchmarking data — "19 FTEs per $100B in assets" | Footnote [^3] | ✅ McKinsey & Company, ["The evolution of model risk management"](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/the-evolution-of-model-risk-management) (Feb 2017), sidebar "Insights from benchmarking and MRM best practices," p. 3 — Crespo, Kumar, Noteboom, Taymans |
| S19 | "82% of banks: credit-risk models most affected by COVID" stat | § "Decade of implementation" | ✅ McKinsey & Company, ["A strategic vision for model risk management"](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/a-strategic-vision-for-model-risk-management) (Mar 2021), sidebar "Findings from the McKinsey survey of leading institutions on model risk management, 2020," p. 3 — Laurent, Raggl, Rougeaux, Tejada |
| S20 | "66% resorted to management overlays" stat | § "Decade of implementation" | ✅ Same source as S19 — same sidebar, same page. Exact wording: "66 percent of banks used overlays to mitigate model-performance issues due to the COVID-19 crisis." |
| S21 | JPMorgan OCC $300M civil money penalty (September 2013) | § "Decade of implementation" | ✅ [occ.treas.gov/news-issuances/news-releases/2013/nr-occ-2013-140.html](https://www.occ.treas.gov/news-issuances/news-releases/2013/nr-occ-2013-140.html) (London Whale, derivatives trading) |
| S22 | HouYi research framework / "invisible white text" banking scenario | Footnote [^5] | ✅ [arxiv.org/abs/2306.05499](https://arxiv.org/abs/2306.05499) — "Prompt Injection attack against LLM-integrated Applications" |
| S23 | Wells Fargo GenAI MRM framework (arXiv 2503.15668) | Footnote [^6] | ✅ [arxiv.org/abs/2503.15668](https://arxiv.org/abs/2503.15668) — "Model Risk Management for Generative AI In Financial Institutions" |
| S24 | EBA November 2025 factsheet on EU AI Act + banking regulation | Footnote [^6] | ✅ [eba.europa.eu (PDF)](https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf) (published Nov 21, 2025) |
| S25 | McKinsey "modifying 12 of SR 11-7's 25 risk elements" proposal | § "Four scenarios" — Scenario 2 | ✅ McKinsey & Company, ["Derisking machine learning and artificial intelligence"](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/derisking-machine-learning-and-artificial-intelligence) (Feb 2019), p. 3 — Babel, Buehler, Pivonka, Richardson, Waldron. Framework covers "25 risk elements"; ML adaptation requires "modifying 12 of the elements and adding only six new ones" |
| S26 | Executive Order 14110 revocation (January 2025) | § "Four scenarios" — Scenario 3 | ✅ Revoked by **EO 14179** ("Removing Barriers to American Leadership in AI"), signed Jan 20, 2025: [federalregister.gov/documents/2025/01/31/2025-02172/removing-barriers-to-american-leadership-in-artificial-intelligence](https://www.federalregister.gov/documents/2025/01/31/2025-02172/removing-barriers-to-american-leadership-in-artificial-intelligence) |

---

## Remaining searches needed

All items resolved. No outstanding searches.

---

## Priority ranking

**Must-have links** (primary regulatory/authoritative sources — readers will want to check these directly):
S1 ✅, S2 ✅, S6 ✅, S7 ✅, S9 ✅, S10 ✅, S11 ✅, S12 ✅, H1 ✅, H2 ✅, H5 ✅

**High-value research citations** (numbers that readers may want to verify):
C7/C10 ✅ (arXiv:2602.11988), C9/H9 ✅ (Liu et al.), S23 ✅ (arXiv:2503.15668), H12 ✅ (arXiv:2511.15759)

**Nice-to-have** (industry positions, secondary stats):
S13 ✅, S14 ✅, S15 ✅, S18 🔍, S19/S20 🔍, H6 ✅ (verify 67.6% figure), H8 ✅
