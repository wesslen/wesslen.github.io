---
title: "Why Adversarial Red-Teaming Can Never Finish — and Why That's Not a Reason to Stop"
date: 2026-05-14
description: "A recent NIST publication establishes that no finite test suite can enumerate all adversarial inputs to a language model. The practical upshot isn't paralysis — it's a different kind of program: not a gate you clear, but a monitoring function you sustain."
tags: [adversarial, evals]
---

> **TL;DR:** A 2025 NIST publication establishes an information-theoretic result: for any finite guardrail policy, the set of adversarial prompts that circumvent it is countably infinite. No finite red-team suite can enumerate the full attack surface. The practical upshot isn't to abandon adversarial testing; it's to abandon the certification frame, in which red-teaming is something you complete before release. The right frame is continuous adversarial monitoring: a program that runs in parallel with production, adapts to new threat surfaces, and produces control-effectiveness evidence over time rather than a point-in-time clearance. Recent work by researchers at Capital One on adaptive instruction composition, a Neural Thompson Sampling-based approach that explores 8+ trillion tactic combinations and outperforms static red-teaming on both attack success rate and diversity, suggests what the adaptive alternative looks like at scale.

---

> [!IMPORTANT]
> **Regulatory status (April 2026):** SR 11-7 was formally superseded by [joint Fed/OCC/FDIC guidance SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/sr2602.htm) on April 17, 2026. SR 26-2 explicitly excludes generative AI and agentic AI from scope (footnote 3), leaving the adversarial testing obligation formally unaddressed. The [NIST AI RMF Generative AI Profile](https://airc.nist.gov/Docs/2) remains the closest operational playbook; its MEASURE 2.5–2.7 actions direct organizations toward continuous, adaptive safety evaluation rather than treating red-teaming as a completion event before release.

This is the third post in a short series on adversarial testing for LLMs in banking. The [first post](post.html?slug=adversarial-workflow) covered the five-phase red-team engagement. The [second](post.html?slug=deployment-gates) covered the three-gate deployment pattern and the calibration requirements that make those gates defensible. This post asks what it means that neither of those things is ever finished.

The question has a precise mathematical form. A 2025 NIST publication[^1] (updated April 2026) frames it as follows: for any language model policy Π that rejects a set of unacceptable outputs, the set of prompts that can elicit those outputs cannot be finitely enumerated. The scope of possible adversarial inputs is not large. It is unbounded.

## The incompleteness result in plain terms

Vassilev introduces a useful term: OOPS — Out-Of-Policy Speech. OOPS is the set of prompts a policy Π deems unacceptable: a policy violation, a jailbreak, or a harmful generation, depending on what Π is trying to prevent. The question they ask is whether OOPS can be enumerated.

The answer is no. The argument is a diagonalization construction: for any finite list of "blocked" prompts, you can construct a new prompt (by systematically modifying each element on the list) that produces unacceptable output but isn't on the list. Because the construction works for any finite list, no finite list suffices. OOPS is countably infinite.[^2]

The practical implication for adversarial testing is stark. A red-team test suite is a finite list. By the Vassilev result, every finite test suite, no matter its size, leaves an infinite residual of uncovered adversarial inputs. That is a structural fact about what finite evaluation can and cannot establish.

What finite evaluation *can* establish is narrower and more useful: it can establish that the model fails on *these specific probes*, or that it resists *this family of attacks*, or that it regressed since the last evaluation. That's the right scope for a deployment gate, and the reason the [previous post](post.html?slug=deployment-gates) framed thresholds as evidence about a specific snapshot rather than guarantees about the future.

The deeper implication is about the governance frame. In the SR 11-7 era, model validation was implicitly a completion event: you validate the model, sign off, and it's done until the next periodic review. For a static credit scorecard, that frame is approximately correct; the threat environment doesn't change between reviews. For a language model deployed into a threat environment that shifts as capabilities and integrations change, the completion frame is wrong at the conceptual level.

## Why static red-teaming is the wrong response

Static red-teaming treats the attack surface as a fixed set of known techniques: DAN, Crescendo, PAIR, Skeleton Key, and whatever else the team can enumerate from public sources. Probe the model against the list, measure ASR, report findings, retest after mitigation. The workflow has value: it catches known attacks, produces auditable artifacts, and satisfies the most visible examiner expectation. The [first post in this series](post.html?slug=adversarial-workflow) is a guide to doing that workflow well.

What static red-teaming misses is the dynamic half. The model updates. Tools are added to the agent's inventory. New attack families appear in the public record. The deployment context shifts: a new user population, a new integration, a new MCP server. Any of these expands the model's effective exposure, without necessarily triggering a re-run of the existing test battery.

The pattern the Vassilev result most directly criticizes is the certification trap: treating a passed deployment gate as evidence that the model is safe, rather than evidence that it resisted the specific attacks in the suite on the specific version tested. Banks are particularly exposed to this trap because the MRM apparatus was built around completion events (model approval, model validation, periodic review), rather than around continuous monitoring of a system that may never reach a stable state. The [guardrails post](post.html?slug=guardrails) touched on a related version of this: the guardrail that passed its initial gate is still running against a threat environment that has moved.

The vocabulary of [HITL timing regimes](post.html?slug=hitl-design) is useful here. Design-time and deploy-time gates are necessary but not sufficient without a runtime monitoring layer that detects when the threat environment has moved. The adversarial testing parallel is direct: pre-deployment red-teaming and deployment gates are necessary; continuous adversarial monitoring is the runtime layer that makes them meaningful over time.

> [!QUOTE]
> The scope of possible adversarial inputs is not large. It is unbounded.

## The adaptive alternative

The incompleteness result establishes that full enumeration is impossible. It does not follow that all test suites are equally incomplete. Some are more likely to cover the territory that actually matters for a given model in a given deployment context. That's the design problem researchers at Capital One have addressed.

Zymet et al. (2026)[^3] introduce Adaptive Instruction Composition (AIC), a Neural Thompson Sampling-based approach to automated adversarial testing that learns which tactic combinations are most likely to succeed against a given model and explores the remaining space accordingly. The core insight is that adversarial prompt construction involves combinatorially many choices: persona, framing, encoding, injection method, conversation structure. The useful space can be identified adaptively rather than by exhaustive enumeration.

At scale, the combinatorial space is large: 50,000+ queries × 13,000+ tactics produces more than 8 trillion possible combinations. Static approaches sample this space uniformly or via curated libraries. AIC samples it using a contextual bandit that balances exploration of new regions against exploitation of known high-ASR regions. The exploration-exploitation tradeoff is governed by a parameter λ: high λ (λ = 1) produces a "subtle" bandit that prioritizes broad coverage; low λ (λ = 0.01) produces an "aggressive" bandit that concentrates on the most promising attack vectors.[^4] Both outperform random sampling on attack success rate and on diversity of successful prompts, meaning they find more attacks, and find attacks that static libraries miss.

The technical substrate is a contrastive SBERT embedding that represents each (prompt, response) pair in a semantic space, combined with UMAP dimensionality reduction to maintain a live picture of coverage. The bandit learns which regions of that space have not been adequately probed and directs testing resources toward them.

For MRM practitioners, the operationally relevant finding is the diversity result. Static curated libraries produce high rates of surface variation but low rates of genuinely novel attack success. They find many variants of attacks already catalogued, while missing vectors in adjacent or novel territory. AIC's adaptive sampling identifies attack vectors that static libraries miss, at a coverage-per-query rate that makes it feasible as a continuous monitoring tool rather than only a quarterly campaign runner.

This is what the adaptive alternative looks like technically. Whether that capacity translates into a continuous monitoring program depends less on tooling than on people and process, which is where the governance question becomes unavoidable.

## What a continuous adversarial monitoring program looks like

The program the incompleteness result calls for has three properties that distinguish it from the five-phase engagement in the [first post](post.html?slug=adversarial-workflow).

| Cadence | Trigger | Primary Output |
|---------|---------|----------------|
| PR-level (automated) | Every model update or probe change | Regression signal: pass/fail against known-attack battery |
| Nightly (adaptive) | Scheduled; updates when new attack-family intelligence arrives | Time-series of ASR across evolving threat surface |
| Quarterly (manual) | Calendar + deployment-context changes; annual external red team | Creative adversarial coverage beyond automated tool reach |

A bank with ten LLM deployments has ten monitoring obligations, each scoped to its deployment context. The shared foundation model is vendor infrastructure; the probe suite for each deployment is what gets validated. PR-level automated probes catch capability and safety regressions before they reach production (for tooling and threshold details, see the [deployment-gates post](post.html?slug=deployment-gates)). Nightly runs with adaptive red-teaming tools maintain coverage of a shifting threat surface. Quarterly manual campaigns, augmented by external red-team engagements annually, add the creative adversarial intelligence that automated systems currently cannot replicate. The critical feature is that all three cadences produce a time-series of control-effectiveness evidence rather than a sequence of disconnected point-in-time reports.

When a new attack family appears in the public CVE record or in threat-intelligence feeds, the test suite updates to include it. When the deployment context changes (new tools, new MCP servers, new integration points), the trust boundary register updates and the probes targeting those boundaries re-run. The reason this trigger condition must be that broad is precisely the incompleteness result: after any such change, the model faces a different threat configuration, and the probe suite optimized for the prior configuration may systematically miss the new exposure.

Control-effectiveness evidence from continuous monitoring has to route somewhere with authority to act on it. In practice, that means a named owner, typically in the AI governance or 2nd-line MRM function, with the authority to require re-validation or suspend deployment when monitoring surfaces a material regression. The [effective challenge triad](post.html?slug=effective-challenge) sets the conditions for that authority to function: incentives (the monitoring function can't be staffed by people whose advancement depends on positive findings), competence (adversarial-ML expertise alongside MRM process familiarity), and influence (findings must reach the governance body with enough lead time to act before the next deployment). A continuous monitoring program without a named owner is a metrics pipeline with nowhere to go — which provides less control than the original deployment gate.

The program produces, when run well, something more useful than a certificate of safety: a time-series of control-effectiveness evidence that tells you whether the adversarial resilience of a specific deployment is improving, degrading, or stable, against the attacks you know about. The attacks you don't know about are what the incompleteness result is describing. The honest answer is that you won't catch all of them. That's been true of every model risk control since 2011, and it didn't make the controls worthless. It made the quality of the ongoing monitoring program the thing that actually mattered.[^5]

The [metrics post](post.html?slug=metrics-metrics-metrics) argued that measuring the wrong thing is worse than not measuring at all, because the number creates the feeling of control without the reality. The adversarial testing corollary is that a static red-team suite maintained past its useful life does the same thing. The ASR is real. The threat model it was built against is not.

> [!QUOTE]
> The question isn't whether your red-team program is finished. It can't be. The question is whether it's still running.

[^1]: Vassilev, A., *[Robust AI Security and Alignment: A Sisyphean Endeavor](https://www.nist.gov/publications/robust-ai-security-and-alignment-sisyphean-endeavor)*, NIST (2025, updated April 2026). Also available as [arXiv:2512.10100](https://arxiv.org/abs/2512.10100). The Sisyphean framing of the title is not rhetorical: the authors argue explicitly that AI security against adversarial inputs is, in the mathematical sense, an asymptotic pursuit. The NIST sponsorship matters for MRM practitioners because NIST publications carry weight with OCC examiners through the AI RMF citation chain, even when they are not formally binding on US banks.

[^2]: The diagonalization *method* is the same family of argument Cantor and Gödel employed — though the result here is weaker than Cantor's. Cantor's diagonalization shows the real numbers are *uncountably* infinite (a strictly larger infinity than the natural numbers); the OOPS result is the more modest claim that the set of adversarial prompts is *countably* infinite — it cannot be finitely enumerated, but it does not exceed the cardinality of the natural numbers. The specific application to adversarial prompts turns on the observation that natural language permits infinite variation — paraphrase, encoding, persona framing, multi-turn composition — meaning any finite enumeration of "blocked" prompts can always be extended by one more. Vassilev et al. formalize this for the LLM policy setting in Section 3 of the paper.

[^3]: Zymet, A. et al., *Adaptive Instruction Composition for Diverse and Targeted Red-Teaming of Large Language Models*, Capital One / George Mason University (2026). Available as [arXiv:2604.21159](https://arxiv.org/abs/2604.21159). The Neural Thompson Sampling implementation, the SBERT contrastive embedding design, and the λ-parameterized explore-exploit results are in Sections 3 and 4.

[^4]: The λ parameter in AIC controls the exploration-exploitation balance via the Thompson Sampling posterior. λ = 1 places equal probability on all untried regions (wide exploration); λ = 0.01 concentrates probability mass on the most promising regions identified so far (exploitation of known high-ASR vectors). The paper evaluates both against uniform random sampling and the WildTeaming baseline ([arXiv:2406.18510](https://arxiv.org/abs/2406.18510)), measuring both ASR and the diversity of successful attacks. The diversity metric — the fraction of successful attacks that are semantically distinct from prior successes in the SBERT embedding space — is the operational measure of coverage beyond known attack vectors.

[^5]: The FSB's [2024 Annual Report on AI in Financial Services](https://www.fsb.org/wp-content/uploads/P270124.pdf) and FSOC's [December 2024 Annual Report](https://home.treasury.gov/system/files/261/FSOC2024AnnualReport.pdf) both flag the absence of standardized continuous monitoring frameworks for LLMs as a systemic gap. Neither prescribes what continuous adversarial monitoring looks like; both signal an emerging regulatory expectation that something analogous to ongoing model performance monitoring exists for GenAI deployments, even in the absence of formal rulemaking.
