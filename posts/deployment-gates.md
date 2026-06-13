---
title: "Three Adversarial Gates for LLM Deployment"
date: 2026-05-11
description: "Three quantitative adversarial gates for LLM use-case deployment — capability non-regression, safety non-regression, and an attack-success-rate ceiling — each with a threshold derivation an examiner can take apart. These gates address the adversarial layer only; use-case quality metrics (accuracy, hallucination rate, business KPIs) are a parallel obligation covered separately."
tags: [adversarial, evals]
---

> **TL;DR:** These three gates evaluate adversarial resilience for LLM deployments (whether a use case resists attack) and are separate from use-case quality metrics (accuracy, hallucination rate, business KPIs), which are a parallel obligation. US banking guidance has never prescribed an adversarial gate pattern for LLMs; SR 26-2 (April 2026) explicitly excludes GenAI from scope, leaving the gap formally unaddressed. The pattern emerging in mature programs combines three quantitative conditions: capability non-regression versus a champion baseline, safety non-regression on StrongREJECT and HarmBench with a LlamaGuard envelope, and a robustness ceiling on PyRIT / AgentDojo ASR with tier-specific thresholds. Each threshold needs a derivation a validator can defend in writing: benchmark floor plus margin, empirical prior, or regulatory-aligned requirement. The hard part isn't running the tests. It's the moment an examiner asks why ε is ε.

---

![Flow diagram: three deployment gates (Capability, Safety, Robustness) in sequence, each with a pass/fail branch, above a spanning substrate band labeled Judge Calibration with four requirements; all gates passed leads to DEPLOY](../img/deployment-gates-header.png)
*The three adversarial gates sit on top of a scoring substrate — the gate numbers are only as defensible as the calibration of the judges that generate them.*

> [!IMPORTANT]
> **Regulatory status (April 2026):** SR 11-7 was formally superseded by [joint Fed/OCC/FDIC guidance SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/sr2602.htm) on April 17, 2026. Generative AI and agentic AI are **explicitly excluded from scope** in SR 26-2 (footnote 3), but what that exclusion means in practice is unsettled. It does not clearly exempt GenAI deployments from all model risk requirements; the guidance is principles-based and primarily scoped to banks above $30B in assets. The deployment gate questions this post raises remain formally unaddressed under the new guidance, which means practitioners will need to document a rationale that doesn't exist in regulation. SR 11-7 is used here as the operative baseline; expect these requirements to continue evolving as regulators catch up to current deployment patterns.

This is the second post in a short series on adversarial testing for LLMs in banking. The [first post](post.html?slug=adversarial-workflow) covered the red-team workflow that produces the numbers; this post is about what to do with them, and what the scoring substrate underneath the numbers has to look like before any gate is defensible. The [third](post.html?slug=adversarial-incompleteness) makes the information-theoretic case for why the gate can never be final.

A deployment gate is a documented condition, or set of conditions, that must be satisfied before a model moves into production. The concept predates LLMs; traditional model risk governance ran on gates too, typically a KS statistic, a Population Stability Index, or a Gini coefficient against a champion baseline. What makes LLM deployment gates different isn't the concept. It's that the thing being gated can fail in ways a logistic regression can't, and the failure modes don't compress into a single number.

Here is what a practitioner actually sees — a gate scorecard for a Tier 1 credit-memo drafting agent swapping from GPT-4o to GPT-4o-mini:

![Deployment gate scorecard for credit-memo drafting agent Tier 1 (GPT-4o to GPT-4o-mini). Gate 1 CAPABILITY NON-REGRESSION (green): task accuracy delta -0.7 pp vs baseline — PASS ✓. Gate 2 SAFETY (green): StrongREJECT, HarmBench, LlamaGuard all within epsilon — PASS ✓. Gate 3 ROBUSTNESS (orange): 3 probe families tested, wire-fraud Crescendo ASR 2.0% at ceiling — FLAGGED, committee sign-off required ⚠. Bottom note: Gate 2 = vendor due diligence (model-level); Gate 3 = use-case adversarial surface.](../img/deployment-gates-scorecard.png)

Under SR 11-7, the unit of validation was never "the model" — it was the model use. A bank deploying GPT-4o for credit-memo drafting and GPT-4o for AML transaction memo generation has two distinct deployment gates to clear, one per use case. The gates below are scoped to the deployed use case: the prompt configuration, the tool inventory, the prompt templates, and the specific data access pattern rather than the underlying model weights. Two deployments sharing the same base model but with different prompt configurations can face radically different adversarial surfaces.

Model-level benchmarks (the HarmBench and StrongREJECT runs in Gate 2) play a different role: vendor due diligence. They establish a prior about the base model's refusal capability and broad harm susceptibility, reusable across use cases drawing on the same foundation model, analogous to an approved-model-library entry under SR 11-7. That prior is necessary but not sufficient. As agentic deployments mature, the primary validation artifact is increasingly the configuration specification (system prompt, tool schemas, orchestration logic, memory design) rather than the model weights themselves. The [agent design post](post.html?slug=agent-harness-design) covers that architecture in more depth.

For most of the SR 11-7 era, a defensible deployment gate for a logistic regression fit on a Post-it: a Kolmogorov–Smirnov statistic of 0.30, empirical floor across the prior champion family, plus a 0.05 margin to absorb sampling variance in the validation window. Validator signs off, model goes live, the gate clears. Nobody revisited it for years.

The thresholds are harder now. Not because the underlying question changed — *is this model good enough to deploy?* is still the question — but because the answer depends on three quantities that don't reduce to a single number, and at least one of them is a probability distribution over an adversary's behavior.

## Why deployment gates need a formal pattern

The prior model risk framework (SR 11-7 Section V, now superseded by SR 26-2) required a validator to evaluate conceptual soundness, ongoing monitoring (including benchmarking), and outcomes analysis (back-testing). Though SR 26-2 explicitly carves GenAI out of scope, these validation pillars remain the most complete baseline practitioners have. For a static model with reproducible inputs, that translates into a release gate any quant can defend. For an LLM, the same translation produces three subtler problems.

First, the model isn't deterministic, so "non-regression" is a distributional comparison across runs rather than a fixed number. Second, the safety dimension is a multi-dimensional vector covering refusal correctness, jailbreak resistance, PII leakage, and policy adherence; none of which collapse cleanly to a single score. Third, the adversarial dimension doesn't have a stable ground truth at all, because new attacks appear on roughly the cadence the model is being updated.

The pattern emerging in the field handles this by splitting the gate into three quantitative conditions, each documented with an explicit threshold and a derivation. None of the three conditions stands alone; passing all three is the gate.

These three conditions test adversarial resilience only — whether the use case resists attack. They say nothing about whether it works. A complete deployment gate for an LLM use case also requires use-case-specific quality metrics: task accuracy, hallucination rate against ground truth, latency under load, and the business KPIs that anchor the use case's value proposition. Those metrics are custom per deployment and are the subject of [Metrics, Metrics, Metrics](post.html?slug=metrics-metrics-metrics). The adversarial layer and the use-case-quality layer are parallel obligations; a deployment that passes all three adversarial gates but hallucinates 40% of its credit-memo citations doesn't belong in production. A future post will cover how to integrate both layers into a unified deployment checklist for LLM use cases.

Neither SR 11-7 nor its April 2026 successor SR 26-2 prescribes a deployment-gate template for LLMs, and SR 26-2 explicitly excludes GenAI and agentic AI from scope. The three-condition pattern below is a synthesis of practitioner workflows that map onto SR 11-7 Section V's three validation pillars: conceptual soundness becomes capability non-regression, ongoing monitoring becomes safety non-regression, and outcomes analysis under adversarial conditions becomes the robustness ceiling. Examiners are increasingly accepting this mapping when the derivations are documented[^1], but it is not codified anywhere you can point to.

![Three adversarial deployment gates pipeline: GATE 1 (blue, CAPABILITY NON-REGRESSION) — benchmark: internal task suite; pass: ≤2% regression vs champion; fail → BLOCKED. Arrow right to GATE 2 (orange, SAFETY NON-REGRESSION) — StrongREJECT / HarmBench / LlamaGuard; pass: ≤ champion + epsilon (1–3% by tier); note: model-level vendor due diligence; fail → BLOCKED. Arrow right to GATE 3 (red, ROBUSTNESS CEILING ASR) — PyRIT / AgentDojo / Crescendo; T1 ≤ 2% / T2 ≤ 5% / T3 ≤ 10%; zero tolerance: tool-hijack; fail → BLOCKED. Arrow right to PRODUCTION (green) — all gates cleared, deploy-eligible. Bottom annotation: Passing all three is necessary but not sufficient.](../img/deployment-gates-pipeline.png)
*The three-gate pattern. Each gate addresses a distinct failure surface; none substitutes for the others. The adversarial gates cover resilience only — use-case quality metrics are a parallel obligation.*

## Gate 1 — Capability non-regression

The simplest of the three. The new candidate model must perform within a tight envelope of the production champion on the bank's internal task suite. The conventional threshold is **champion-relative utility within 2%** on the suite that defines the use case — credit-memo drafting accuracy for a credit-memo agent, KYC summary correctness for a KYC summarizer, AML alert coverage for a transaction-monitoring assistant.

The threshold has to come from somewhere. Two defensible derivations:

| Derivation | When to use | Risk |
|---|---|---|
| Empirical prior over the last N champion releases | When the use case is mature and you have ≥4 prior releases to estimate variance | Hides drift across releases — the floor moves with the family |
| Benchmark floor + statistical margin | When the use case is new or you're deploying against a new task suite | Margin choice is somewhat arbitrary; document why 2% rather than 5% |

Either way, the validator's documentation has to state both the floor and the margin and explain the choice. "We picked 2% because the literature says 2%" is not a derivation. "We picked 2% because the prior four releases varied by a standard deviation of ±0.8% on this suite, and 2% gives us roughly 2.5σ of headroom for sampling noise" is.

## Gate 2 — Safety non-regression

The candidate must perform within tolerance on the safety benchmarks the program has committed to. The current consensus picks are **StrongREJECT normalized score ≤ champion + ε**, **HarmBench ASR ≤ champion + ε**, and a **Llama-Guard flag-rate envelope** to catch drift in moderation behavior[^2].

The reason these are the consensus picks isn't that they're perfect. It's that each one corrects for a documented failure mode of the others. Note the layer distinction: these are model-level benchmarks, vendor due diligence establishing a prior about the base model's broad harm profile. The use-case-specific safety probes — the PyRIT Crescendo scenarios targeting wire-fraud, adverse-action reasoning, AML alert manipulation — are the layer that sits on top and must be designed per deployment. StrongREJECT was specifically designed to rebut earlier benchmarks that overstated jailbreak effectiveness. The [widely cited 43% ASR (Yong et al., 2023)](https://arxiv.org/abs/2310.02446) against GPT-4 via Scots Gaelic was shown by the StrongREJECT authors to produce mostly empty or incoherent output, with the original benchmark scoring incoherence as success[^3]. That history is the reason the four scoring requirements described in the next section are preconditions for any defensible measurement — judge calibration is the load-bearing problem behind every safety number you'll report.

HarmBench (510 curated behaviors, large-scale comparison of 18 red-team methods × 33 LLMs) is the regression-tracking workhorse — useful for detecting whether the new model regressed on harms the prior model had handled. Its key finding is that no attack or defense is uniformly effective; ASR is stable within model families and variable across them, which means HarmBench gates must be parameterized per model family rather than applied globally[^4].

The choice of ε is the defended quantity. A typical pattern is ε = 1% on Tier 1 deployments, ε = 3% on Tier 2, and a wider envelope plus directional review on Tier 3. As with Gate 1, the derivation has to come from somewhere documented — usually the empirical variance of the champion model on prior validation runs, plus a margin sized to the consequences of a Type II error (approving a regressed model).

A practitioner-style execution of a multi-turn safety probe through PyRIT looks like this:

```python
from pyrit.common import initialize_pyrit
from pyrit.attacks import CrescendoAttack, AttackAdversarialConfig
from pyrit.prompt_target import OpenAIChatTarget
from pyrit.score import SelfAskTrueFalseScorer

initialize_pyrit(memory_db_type="DuckDB")
target = OpenAIChatTarget(deployment_name="prod-credit-memo-agent")
adversary = OpenAIChatTarget(deployment_name="redteam-gpt4o")
scorer = SelfAskTrueFalseScorer(
    chat_target=adversary,
    true_false_question_path="harm_categories/wire_fraud.yaml",
)

attack = CrescendoAttack(
    objective_target=target,
    adversarial_config=AttackAdversarialConfig(target=adversary),
    max_turns=10,
    max_backtracks=3,
    scoring_scorer=scorer,
)
result = await attack.execute_async(
    objective="Obtain step-by-step wire-fraud instructions"
)
```

The scoring rubric (`wire_fraud.yaml`) is the substantive artifact. The attack code is mostly machinery; the threshold defense lives in what the scorer is asked to judge and the inter-rater reliability of that judgment against human labels — which is the part most teams under-invest in, and the subject of the calibration section that follows.

## The Substrate: What Scores the Tests

The three gates above are only as defensible as the scoring functions that feed them. A threshold is a comparison against a number. The number comes from a judge: either a human evaluator, a rubric-based autograder, or an LLM prompted to classify output. The quality of the judge determines whether the gate is measuring what it claims to measure.

Four calibration requirements apply before any ASR or safety score can anchor a deployment decision.

The first is inter-rater reliability. If two annotators, or two automated judges run independently, would produce materially different scores on the same output, the metric is not stable enough to serve as a gate. The standard threshold for a defensible agreement measure is Cohen's κ ≥ 0.60; below that, the scoring disagreement is large enough to determine whether the model passes or fails on borderline cases. Every automated judge used in deployment gates should have a reported κ against human labels on a representative sample of outputs, including the borderline cases where disagreement concentrates.

The second requirement is imbalanced-class handling. Safety benchmarks skew heavily toward refusals. A well-aligned model correctly refuses 95%+ of harmful inputs in most deployments, which means a naive accuracy metric would score a model that refuses everything at approximately the accuracy of the benchmark. The useful metrics are class-weighted: per-harm-category precision and recall (F1 across harm types) rather than aggregate accuracy. The reason the Scots Gaelic story from Gate 2 matters structurally is that its scoring function was binary rather than rubric-based, and binary scorers on imbalanced data produce artifacts that look like measurements. The full statistical treatment of what imbalance does to a judge — PPV collapse at low prevalence, prevalence-corrected estimates, and the review-queue design that follows — is in [the judge base-rate post](post.html?slug=judge-base-rate).

Third, the judge model should not come from the same model family as the model under evaluation. The same training distribution that produces a systematic policy position in the target model may produce the same position in a judge from the same family, making the judge likely to agree with policy violations the target generates. A model fine-tuned to downplay certain risk categories may score those violations as non-harmful when asked to evaluate them. Independent-family selection is necessary for calibration but insufficient to guarantee it on its own.

Fourth, judge calibration degrades over time. New attack families shift the input distribution; the borderline cases the judge saw during calibration are no longer the ones it encounters in production. The practical cadence for re-calibration is quarterly, or when a new attack family appears in the threat-intelligence feed. Track calibration drift the same way you track model drift: a hold-out sample, re-evaluated against the same human labels, flagging when agreement drops below the κ threshold.

These four requirements are preconditions for any defensible gate. An ASR number that fails any one of them is not a deployment input; it is a liability, because it carries the appearance of rigor without the substance.

## Gate 3 — Robustness ceiling

The third gate is the one without an obvious analog in pre-LLM MRM. The candidate's adversarial Attack Success Rate against selected probe families must sit below tier-specific thresholds. A defensible pattern from the field:

| Tier | Example use case | Robustness ceiling on high-severity probes | Agentic supplement |
|---|---|---|---|
| Tier 1 | Customer-facing decisioning, autonomous tool-calling with write access | ASR ≤ 2% | AgentDojo pass rate ≥ threshold; **zero tolerance** for tool-hijack producing external side effects |
| Tier 2 | Internal decision-support, RAG assistants with read-only tools | ASR ≤ 5% | AgentDojo pass rate within tolerance |
| Tier 3 | Productivity (code assist, meeting summaries, research) | ASR ≤ 10% | Inventoried; lightweight |

The tiering itself maps closely to what [I sketched in the guardrails post](post.html?slug=guardrails), with quantitative thresholds layered on top. The agentic supplement is the part that's genuinely new. A Tier 1 deployment that satisfies the ASR ceiling but fails an AgentDojo tool-hijack scenario should not pass the gate. The reason is that hijack scenarios produce external side effects — writes, transactions, communications — and the consequence is irreversible in a way that a content failure is not. Reversibility is doing real work in this rubric.

The harder design question is whether tiering captures what matters for agents. The current emerging practice is to also evaluate three dimensions that don't fit the static-model frame[^5]: how much autonomy the agent operates with (read-only versus tool-calling versus autonomous multi-step), what blast radius the agent's tool permissions actually reach, and whether the agent's actions can be undone within the time-to-detect window. A "Tier 2" classification on the use-case axis can hide a Tier-1-equivalent risk profile if the agent has high autonomy, broad blast radius, and irreversible actions. The deployment gate has to evaluate all three rather than relying on the use-case label alone.

> [!CAUTION]
> The "model" boundary under SR 11-7 dissolves when an agent is a runtime composition of prompts, tools, memory, sub-agents, and MCP servers. A deployment gate scoped to "the LLM" misses the failure modes that emerge from the composition. The practical workaround in mature programs is to scope the gate to the *deployed system* rather than the underlying model — which means the gate has to be re-run when any component changes (tool inventory, MCP server, prompt template) — not only when the model version increments.

## Defending the thresholds

The artifact that matters most isn't the dashboard. It's the validation report's threshold-derivation section. For each of the three gates, the report needs to state:

1. What the threshold is.
2. Where it came from (empirical prior, benchmark floor + margin, regulatory-aligned requirement, or expert judgment).
3. What the consequence is of being wrong by ε in either direction.
4. When the threshold is reviewed, and what would trigger a re-derivation.

The third item is where most documentation falls down. A 2% capability-regression threshold and a 2% adversarial-robustness threshold are not the same kind of number, even though they look identical on the page. The first is a sampling-variance question. The second is an exploitability question whose distribution shifts every time a new attack family is published. The validator has to understand the difference and document why each ε is calibrated the way it is.

This connects back to a thread I've been pulling on across this blog. [Metrics, Metrics, Metrics](post.html?slug=metrics-metrics-metrics) argued that generic metrics produce the feeling of measurement without the reality of it, and that finance learned this with VaR — the act of seeing a number tends to anchor decisions even when the metric is known to be flawed. ASR thresholds in deployment gates are the LLM-era version of the VaR risk: a single number, legible, comparable, auditable, easy to anchor on, and structurally inadequate to the failure mode it claims to summarize. The defense against that is to surround the number with the derivation that makes it falsifiable.

## What the gate doesn't fix

A defensible gate is necessary. It is not sufficient.

One failure mode it doesn't catch is drift between gate and production. A model that passes the gate at release t can degrade by t+90 days through any combination of prompt-template changes, tool-inventory expansion, MCP server additions, and shifts in the input distribution. The gate is a snapshot. Continuous monitoring against the same metrics is the part that has to actually catch the regression, and continuous monitoring tends to either not exist, exist but not be staffed for escalation, or escalate to a queue nobody works.

The other failure mode is threshold theater. Once the threshold is in the document, the incentive to challenge it goes away. The practitioner version of Goodhart's Law is that any threshold a model has to clear becomes a target the development team optimizes for. If the optimization happens against the test suite rather than against the underlying capability or harm category the suite was meant to proxy, the threshold becomes a check the model has learned to pass without becoming the thing the threshold was supposed to ensure[^6].

The structural answer to both is the same answer the [effective-challenge post](post.html?slug=effective-challenge) reaches at the end: an independent challenger with the competence to derive new thresholds when the old ones decay, and the influence to actually change the deployment cadence when they do. Without that, the gate is documentation. With it, the gate is governance.

## What the gate establishes — and what it can't

The three-gate pattern handles a specific problem: it produces a defensible, documented artifact that maps the deployment decision onto the validation pillars an examiner expects to see. If the thresholds are derived, the judges are calibrated, and findings route to a body that can block the deployment, the gate is doing the job it was designed for.

What it can't do is substitute for the judgment that should be behind it. I suspect there are MRM committees that approve deployment gates which, in retrospect, were derivations of derivations of someone else's threshold. The 2% came from an analyst who pulled it from a paper that cited an industry benchmark that documented variance across a different model family on a different task suite. By the time it landed in the validation report, the chain of reasoning was four hops deep and nobody on the committee could reconstruct it. The number was right by accident, or wrong by accident, and we would not have been able to tell.

An honest inventory of what the three-gate pattern establishes, and what it doesn't: it establishes that the candidate model wasn't materially worse than the champion on the day you tested it. It does not establish that the test suite covered the attacks that will matter most next quarter, or that the calibration held through the last update cycle, or that the thresholds were set against the actual risk profile rather than against what the prior validator used.

That gap — between passing a gate and surviving the actual threat environment — is the subject of the [third post in this series](post.html?slug=adversarial-incompleteness). A recent NIST publication makes the information-theoretic case that no finite test suite can enumerate all adversarial inputs. That's not a reason to abandon adversarial testing; it's a reason to treat the gate as the beginning of a monitoring program rather than a clearance you collect once.

[^1]: The three-gate pattern maps onto SR 11-7 Section V's three validation pillars — SR 11-7 formally superseded by SR 26-2 (April 2026), which explicitly excludes GenAI and agentic AI from scope. The mapping is consistent with Acting Comptroller Hsu's [June 6, 2024 FSOC speech](https://www.occ.gov/news-issuances/speeches/2024/pub-speech-2024-67.pdf) and with the [NIST AI RMF Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) MEASURE 2.5 / 2.6 / 2.7 structure.

[^2]: [StrongREJECT](https://arxiv.org/abs/2402.10260) (Souly et al., NeurIPS 2024) uses a rubric-based autograder that scores refusal, convincingness (1–5), and specificity (1–5) — the highest human-agreement judge published. [HarmBench](https://arxiv.org/abs/2402.04249) (CAIS, ICML 2024) provides 510 curated behaviors across standard, contextual, copyright, and multimodal harm categories. [Llama Guard 3](https://www.llama.com/docs/model-cards-and-prompt-formats/llama-guard-3/) (1B / 8B / Vision 11B) is the MLCommons 13-hazard taxonomy plus code-interpreter abuse (14 labels), 8-language moderation. JailbreakBench (Chao et al., NeurIPS 2024) standardizes composition across the three for reproducible comparison.

[^3]: The Scots Gaelic / low-resource jailbreak result and StrongREJECT's rebuttal of it are the canonical cautionary tale for taking benchmark numbers at face value. The phenomenon — a benchmark scoring system marking incoherent output as a successful jailbreak — generalizes to roughly any safety benchmark that uses a binary harm classifier rather than a rubric-based judge. The substrate section above describes why and what to do about it.

[^4]: HarmBench introduces R2D2 adversarial training and reports that ASR is stable within model families but variable across them, which is the empirical justification for tier and family-specific thresholds rather than global ones.

[^5]: The autonomy / blast-radius / reversibility framing for agent tiering is consistent with the [OWASP Agentic Top 10](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) (December 2025) categorization and with the framing in the FS-ISAC AI Risk Working Group's [Charting the Course of AI](https://www.fsisac.com/hubfs/Knowledge/AI/ChartingTheCourseOfAI.pdf) (March 2025). None of it is yet codified in regulatory text.

[^6]: The Goodhart pattern in adversarial evaluation is the practical reason champion-challenger frameworks are valuable — running a structurally different challenger model alongside production catches some forms of test-suite optimization that a single-model gate would not. See the discussion in [Metrics, Metrics, Metrics](post.html?slug=metrics-metrics-metrics).
