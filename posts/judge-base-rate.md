---
title: "The Judge and the Base Rate"
date: 2026-06-12
description: "LLM judges look reliable on balanced test sets and then quietly fail when it matters most in banking: catching failures that almost never happen. The arithmetic of why — and what a defensible LLM judge pipeline looks like at 1% prevalence."
tags: [evals, banking]
---

> **TL;DR:** At the failure rates that matter most in banking (sub-1% prevalence, severity out of proportion to frequency), a single LLM judge cannot work as a standalone detector, and the dashboard it feeds cannot tell you whether failures are rare or invisible. Statistical correction can fix the *measurement* (your reported failure rate) but not *detection* (catching the individual failure); those are different estimands with different fixes. The defensible design treats the judge as a noisy screening instrument rather than a detector: estimate its error rates on a gold set, propagate them into every reported number, and leave single-judge flags unvalidated until a tiered pipeline, ending in a human review queue sized and staffed as a deliberate HITL checkpoint, confirms them.

A bank deploys a payments assistant that handles 50,000 customer conversations a month. An LLM judge reviews every transcript for the failure the bank fears most: the agent waving through a payment that is actually a scam. The monitoring dashboard reads 0.2% flagged (n=100), and the number has been stable for three months.

There are two readings of that dashboard. The failure is genuinely rare, or the judge can't see it. The uncomfortable part is that the dashboard alone cannot tell you which. What it takes to find out is the question this post works through.

The [Eval Gap posts so far](post.html?slug=metrics-metrics-metrics) have argued that GenAI evaluation is a measurement problem: construct validity, [estimands, and error bars](post.html?slug=benchmark-uncertainty). This post pushes that argument to the rare-event setting where banking actually lives — the regime a field raised on 50/50 test sets keeps mistaking for an edge case.

Most eval research runs on balanced data; the failures risk committees care about are rare by construction and, in the fraud case, adaptive. Banking is where I live, but the arithmetic doesn't care: the same math governs any rare-event monitoring, from trust-and-safety queues to content moderation.

## The arithmetic, run at banking prevalence

Start with the number every judge vendor reports: accuracy. A judge with a 90% true positive rate (TPR) on failures and a 5% false positive rate (FPR) on normal traffic scores 95% accuracy when failures run at 1%. At low prevalence, accuracy mostly measures how often the judge says "you can pass" (the majority class). It sounds deployable.

A note on convention before the math: throughout this post, *positive* means failure — a scam payment, in the running example. TPR is the share of true failures (scam payments) the judge flags; FPR is the share of normal traffic it flags by mistake (legitimate payments flagged as fraud). This post uses signal-detection terms (TPR, FPR, etc.) rather than their ML/NLP synonyms (recall, precision); the glossary links spell out the equivalences.

Now let's assume a 1% true failure rate. The positive predictive value is:

$$\text{PPV} = \frac{\text{TPR} \cdot p}{\text{TPR} \cdot p + \text{FPR} \cdot (1 - p)} = \frac{0.90 \times 0.01}{0.90 \times 0.01 + 0.05 \times 0.99} \approx 15\%$$

Six out of seven flags are false alarms; the judge's output channel is mostly noise. This is the classic false-positive paradox, and it belongs to the base rate rather than to the judge. No amount of prompt-and-pray moves it.

| True failure rate | TPR 90% / FPR 5% "Good judge" | TPR 95% / FPR 1% "Great judge" | TPR 99% / FPR 0.1% "Near perfect judge" |
|:-:|:-:|:-:|:-:|
| 10% | 67% | 91% | 99% |
| 1% | 15% | 49% | 91% |
| 0.1% | 1.8% | 8.7% | 50% |

*PPV at three prevalence levels. Even a judge with a 99% TPR and a one-in-a-thousand FPR — better than any judge measured in the studies cited below — flips a coin at 0.1% prevalence.*

![Hand-drawn whiteboard chart titled WHERE FLAGS STOP MEANING ANYTHING. Y-axis: SHARE OF FLAGS THAT ARE REAL (PPV), 0% to 100%. X-axis: HOW RARE THE FAILURE IS, with ticks at 0.1%, 1%, and 10% and an arrow pointing left labeled RARER. Three curves labeled GOOD JUDGE (blue), GREAT JUDGE (dark blue), and NEAR-PERFECT JUDGE (green) all collapse toward zero as failures get rarer. An orange shaded zone on the rare end is labeled BANKING LIVES HERE. A stick figure analyst buried under a pile of flags asks WHICH ONE IS REAL? Annotation: SAME JUDGE. DIFFERENT BASE RATE.](../img/judge-base-rate-ppv.png)
*The same judge produces a usable review queue at 10% prevalence and generates noise at 0.1%. Nothing about the judge changed.*

<details class="math-details">
<summary>The two failure regimes, formalized</summary>
<div class="math-inner">

<p>At prevalence \(p\), with judge \(\text{TPR}\) (share of true failures flagged) and false positive rate \(\text{FPR}\) (share of normal items flagged):</p>
\[\text{PPV} = \frac{\text{TPR} \cdot p}{\text{TPR} \cdot p + \text{FPR}(1-p)} \qquad \text{FNR} = 1 - \text{TPR}\]
<p><strong>Regime 1 — the flooded queue.</strong> Tune the judge for a high TPR (moderate FPR). As \(p \to 0\), the denominator is dominated by \(\text{FPR}(1-p)\) and PPV collapses toward \(\text{TPR} \cdot p / \text{FPR}\). Reviewer load scales with FPR times volume, independent of how rare the failure is.</p>

<p><strong>Regime 2 — the empty queue.</strong> Tune for a high PPV (low FPR), which in practice means low TPR — or get low TPR for free from the judge's own positive bias (next section). PPV looks respectable; the FNR \(=1-\text{TPR}\) does not appear anywhere on the dashboard.</p>

<p>Severity-weighting picks your poison: if a missed failure costs \(C_{FN}\) (fraud loss, reimbursement, enforcement exposure) and a false alarm costs \(C_{FP}\) (minutes of review labor), the threshold should be set where the expected-cost ratio \(C_{FN} \cdot p \cdot \text{FNR}\) vs. \(C_{FP}(1-p)\text{FPR}\) says it should — not where the queue feels manageable.</p>

</div>
</details>

The table assumes the judge fails toward false alarms. The published evidence says deployed judges mostly fail the other way — missing the rare positives, scams included. That's where this post is headed.

## Judges don't fail in the direction you'd guess

The cleanest peer-reviewed evidence comes from ReaLMistake, which had expert annotators label real errors in LLM outputs and then asked frontier models to find them. GPT-4's TPR on its own errors fell as low as 6.8–11.5% on fine-grained factuality and answerability tasks, against a human expert F1 of 95.7. Worse, the standard remedies didn't remedy: self-consistency sampling did nothing, and majority voting across twelve runs often *reduced* TPR.[^1]

The same study found that TPR on real errors correlates *negatively* with general capability: Spearman correlations around −0.77 between a model's Elo rating and its error-detection TPR. Stronger models have higher PPV and lower TPR, so for rare-failure detection, capability improvements move in the wrong direction.

The sharpest quantification of the asymmetry comes from a study of 14 frontier LLMs judging code feedback, where ≈7.5% of outputs were invalid against an expert-annotated gold set. Translated into this post's convention: the judges caught fewer than 25% of true failures, while flagging normal outputs at a rate under 4%. The one model that pushed its TPR to 53.5% (Gemini 2.5 Pro) paid for it by wrongly rejecting more valid outputs than any other judge, and 26% of failures were missed by *every one* of the 14 judges. The authors call this agreeableness bias: judges reliably confirm and unreliably reject.[^2] The same error redistribution shows up in [GUI-agent verifiers](post.html?slug=gui-agents-verifier), where swapping the judge's backbone model traded false alarms for misses without improving agreement with human labels.

And it shows up in production. A 2026 case study of a deployed multi-turn ordering agent found the built-in judge caught roughly 22% of human-confirmed defect patterns, and the authors estimate the system's reported defect rate undercounted the true rate by 3–6×. In one batch the judge flagged zero of 100 rounds in which human reviewers confirmed 23 distinct defects.[^3]

No single one of these studies carries the claim alone: one is judging code feedback, one is error-heavy by construction, one is a single deployment. What survives the triangulation is directional, and it is consistent everywhere anyone has looked with a real gold set: LLM judges systematically under-flag the rare class, and aggregate accuracy hides it completely.

> [!QUOTE]
> At 1% prevalence, a 95%-accurate judge buries every real failure under six false alarms. The judges actually measured do that while also missing three out of four actual failures.

One objection deserves naming. None of these three studies is a harm-detection task: judging code feedback or answer quality is a different shape of problem from asking *is this conversation a scam?* against an explicit rubric, and rubric-driven safety judges can fail in the opposite direction — the over-refusal literature is full of judges that flag too much. The direction of your judge's failure is an empirical property of your task. Which is the point: you don't know which regime you're in until you've measured it against a gold set, and the two regimes demand opposite responses.

There is a blind spot underneath both regimes that no confusion matrix measures. The TPR figures above are charitable: they were scored on items where the failure was present in what the judge was shown. In production a judge grades only what entered the transcript — it cannot see the evidence the agent never retrieved, the policy check that never ran, or the riskier tool call it chose not to narrate. It is, in Agus Sudjianto's phrase, "complete with respect to what it sees and silent with respect to what the system failed to show it."[^9] A rationale that opens *based on the available information* sails through, and the word *available* carries weight the judge is structurally unequipped to notice. Sudjianto's deadpan satire — the *Unified Prompt and Pray Framework* — formalizes the exact pipeline this post opened with, instruct-the-agent-to-be-careful through strengthen-the-prompt-after-an-incident, precisely to show that none of it is a control.[^9]

For fraud specifically, there's a second-order problem stacked on top. The [adversarial-incompleteness post](post.html?slug=adversarial-incompleteness) argued that no finite test suite enumerates an adaptive attack surface. A judge rubric is a finite test suite. Scam tactics turn over fast for exactly the adversarial reason: the old ones started getting caught. Whatever TPR you measured at calibration time is a ceiling, and it starts decaying the day you measure it.

## Measurement and detection are different problems

Here is the distinction that makes this tractable, and it's the same estimand discipline [NIST AI 800-3 imposed on benchmark scores](post.html?slug=benchmark-uncertainty): *what is our failure rate?* and *catch the failures* are different questions with different math.

The first question, measurement, is largely solvable, and the fix starts with a reframe: the judge is a noisy measurement instrument. Noisy instruments are old territory for model development teams: estimate the error, propagate it, treat any uncorrected raw reading as provisional. If you know the judge's TPR and FPR from a gold set, the classic Rogan–Gladen correction recovers an unbiased prevalence estimate from biased judge counts, and prediction-powered inference (PPI) does the same job with tighter intervals by combining a small human-labeled sample with a large judge-labeled one. Recent work shows the naive approach of reporting the judge's raw flag rate as the failure rate produces confidence intervals whose coverage collapses to zero when judge bias is substantial. Corrected estimators restore nominal coverage with intervals roughly 3× narrower than Rogan–Gladen alone.[^4]

![Left-to-right correction flow titled CORRECTING A BIASED JUDGE READING. A crooked gauge labeled JUDGE'S RAW FLAG RATE feeds a ROGAN–GLADEN CORRECTION box, which also takes TPR and FPR from a GOLD SET, producing a clean gauge labeled TRUE FAILURE RATE with a green error bar. A PPI inset shows a wide HUMAN LABELS ALONE error bar above a narrow PPI: HUMANS + JUDGE bar. Bottom caption: FIXES THE RATE — NOT WHICH TRANSCRIPT.](../img/judge-base-rate-rogan-gladen.png)
*Rogan–Gladen treats the judge as a miscalibrated instrument: run its raw flag rate through the TPR/FPR measured on the gold set to recover an unbiased failure rate, and PPI tightens the interval with a few human labels — but neither can tell you which transcript was the failure.*

<details class="math-details">
<summary>Rogan–Gladen and prediction-powered inference</summary>
<div class="math-inner">

<p><strong>Rogan–Gladen (1978).</strong> If the judge flags an observed share \(\hat{p}_{\text{obs}}\) of traffic, and its sensitivity \(Se\) (TPR) and specificity \(Sp\) (1 − FPR) are known from a gold set, the corrected prevalence is:</p>
\[\hat{\pi} = \frac{\hat{p}_{\text{obs}} + Sp - 1}{Se + Sp - 1}\]
<p>Note the data provenance: \(Se\) and \(Sp\) come from the gold set; \(\hat{p}_{\text{obs}}\) must come from production traffic. An enriched gold set cannot supply the prevalence — enrichment is precisely what destroyed that information.</p>

<p>Two degeneracies matter in the rare-failure regime. If \(\hat{p}_{\text{obs}} \le 1 - Sp\) (the judge flags no more than its own false alarm rate), the corrected estimate hits zero and the data cannot distinguish "no failures" from "failures the judge can't see." And the estimator inherits a <em>stability assumption</em>: the TPR/FPR estimated on the gold set must hold on current traffic. Self-preference bias (a judge rating its own model family's outputs more favorably) and tactic drift both violate it.</p>

<p><strong>Prediction-powered inference.</strong> PPI treats the judge as an auxiliary predictor: a small human-labeled sample estimates the judge's error, a large judge-labeled sample supplies volume, and the combination yields valid confidence intervals far tighter than the human sample alone would support. Extensions now handle ranking metrics with as few as ≈100 human-annotated items against ≈10,000 judge-labeled ones (sources in footnote 4).</p>

</div>
</details>

The second question, detection, is not solvable this way. Correction adjusts the aggregate; it cannot reach back into the 50,000 transcripts and tell you *which* conversation was the scam. A corrected prevalence estimate with honest intervals is a monitoring metric. Catching the individual failure before the payment settles is a control. The [guardrails post](post.html?slug=guardrails) drew exactly this line: metrics tell you the rate at which cars go off the cliff; the guardrail is what stops the car. The statistics respect the same boundary.

I suspect most GenAI monitoring decks conflate the two: a judge-produced "failure rate" presented simultaneously as evidence the rate is low and as the mechanism that catches failures. At 1% prevalence it is defensibly neither, until the gold-set work is done.

## What a defensible pipeline looks like

Everything starts with a gold set that contains the rare class. Before any judge score means anything, you need 1,000–2,000 expert-labeled items with deliberate enrichment of confirmed failures, sampled from real traffic, fraud-ops case files, customer complaints, and red-team output — double-annotated, with the inter-annotator agreement reported, because the confusion matrix inherits every disagreement in the labels. From it: the judge's full confusion matrix, per-class TPR with intervals, and a prevalence-independent selection metric. 

Every familiar metric (accuracy, precision, recall, F1) shifts with class balance and can rank judges differently at deployment prevalence than on your test set; Youden's J (TPR + TNR − 1) doesn't, which makes it the right yardstick for comparing judges.[^5] Credit-risk readers have used this measure for decades under another name: maximized across a score's thresholds, Youden's J is exactly the KS statistic from scorecard modeling. Two caveats: J gets volatile exactly when rare-class annotations are sparse or noisy, so report the per-class counts alongside it. And J answers which judge to use; the deployed threshold is a separate decision that at banking severity ratios belongs far to the TPR side of J's balanced optimum.

<img src="../img/judge-base-rate-youdens-j.png" alt="Hand-drawn whiteboard ROC plot titled WHAT YOUDEN'S J ACTUALLY MEASURES. X-axis labeled FALSE POSITIVE RATE from 0 to 1; Y-axis labeled TRUE POSITIVE RATE from 0 to 1. A dashed diagonal from bottom-left to top-right labeled CHANCE LINE (J=0). A concave dark-blue ROC curve bows above the diagonal, with a dot at its best operating point. A thick green vertical segment marks the maximum gap between the curve and the diagonal, labeled YOUDEN'S J = TPR + TNR − 1 and noted = KS STATISTIC (CREDIT SCORECARDS). Orange annotation along the bottom: ACCURACY & F1 SLIDE WITH THE BASE RATE. THIS GAP DOESN'T.">

*Youden's J is the ROC curve's maximum height above the chance diagonal — the same quantity credit-risk teams know as the KS statistic, and the one summary that doesn't move when the base rate does.*

> [!NOTE]
> **Bootstrapping the gold set without a labeling marathon.** The count isn't the bottleneck — the rare positives are. Labeling a thousand random transcripts is fast; finding the scams inside them is not, since at 0.2% prevalence a random thousand holds about two. So every shortcut answers one question — *how do I get confirmed positives cheaply?* — and they sort by effort-to-yield:
>
> - **Harvest the labels you already own.** Confirmed-fraud case files, SAR filings, reimbursement claims, chargebacks, and investigated rules-engine alerts are already-adjudicated positives; join their IDs back to the transcripts and you seed hundreds with no new annotation.
> - **Sample where positives concentrate.** Over-sample high-value transfers, new payees, rules-flagged accounts, and scam-keyword hits instead of drawing uniformly — but keep a separate unenriched random stream for the prevalence denominator, which enrichment destroys.
> - **Generate positives from known playbooks.** Have fraud SMEs or a prompted model write realistic scam-coaching transcripts to cover tactic variants; flag them as synthetic and keep them a minority so you can check that performance on synthetic tracks performance on real.
> - **Spend experts only where it's hard.** Clear the abundant, obvious negatives with cheap labelers, and reserve scarce expert hours for the rare positives and the disagreements, double-annotating the rare class.
> - **Don't wait for the full set.** Ship in screening-only mode with what you've harvested, then let human-confirmed review-queue cases and the scheduled random audit sample grow the set over weeks.
>
> More traditional ML levers — active learning (label only the items near a cheap model's decision boundary) and weak supervision (turn existing heuristics into programmatic labels, then audit a sample) — accelerate this where you have the capacity, but neither can be trusted to surface the rare positives on its own. The gold set isn't built so much as assembled: most of it from labels the bank already owns, plus a random stream that never stops.

With the gold set in place, the detection layer is a cascade, ordered by the economics.

The first screen is a trained classifier covering known scammers' tactics. Where labeled examples exist, a fine-tuned classifier can beat a zero-shot judge on imbalanced data, and it does something a prompted judge structurally can't: emit a probability you can threshold, which is what makes TPR tuning possible at all. The honest caveat is that even purpose-built moderation classifiers miss large fractions of complex violations under independent stress tests, so this layer buys a tunable floor on known patterns and nothing more.[^6]

Behind it, the LLM judge patrols for novel tactics. Its comparative advantage is precisely the thing the classifier can't do: open-ended pattern recognition on failures nobody has labeled yet. That is also exactly the fraud problem: last quarter's classifier doesn't know this quarter's tactic. Run the judge at high TPR and treat its flags as triage for the next stage rather than as verdicts.

Uncertainty routes to humans through an abstention cascade. The judge renders a verdict only when its confidence clears a calibrated bar; everything else escalates. Cascaded selective evaluation gives this a formal footing (a threshold calibrated so judge–human agreement is provably above a target whenever the judge does rule), and a panel of small, diverse judges with a minority-veto rule (flag if *any* few say failure) attacks the agreeableness asymmetry directly, though that evidence is thinner and single-domain.[^2][^7]

Human-confirmed cases then feed back into the gold set. Every confirmed failure becomes a label; enough labels turn a novel scammer tactic into a known one and move it from the judge's beat to the classifier's. Over months, the classifier absorbs the head of the distribution while the judge and humans patrol the tail.

What keeps that loop honest is a random audit stream. If new labels only come from flagged items, the gold set inherits every blind spot the judge has: the 26% of failures invisible to all 14 judges would never enter it. A fixed random sample of unflagged traffic, expert-labeled on a schedule, is the only input that can surface what the whole pipeline misses. It is also where the first confirmed failures come from when you are starting from zero, before any enriched gold set exists.

![Hand-drawn whiteboard flow chart titled SCREENING, NOT DETECTING. Four boxes left to right connected by blue arrows: ALL TRAFFIC (50,000/MO), CLASSIFIER: KNOWN TACTICS, LLM JUDGE: NOVEL TACTICS, and HUMAN REVIEW QUEUE with a stick figure reviewer at a desk. Orange annotation under the judge box: CATCHES LESS THAN 25% ALONE. A green return arrow runs from the review queue to a GOLD SET box, labeled CONFIRMED FAILURES BECOME LABELS, then back up into the classifier. A green dashed arrow arcs over the top from ALL TRAFFIC directly to the review queue, labeled RANDOM AUDIT SAMPLE. Bottom annotation: CLASSIFIERS ABSORB THE HEAD. HUMANS PATROL THE TAIL.](../img/judge-base-rate-pipeline.png)
*Each component gets a job it can statistically perform — and the random audit stream is the only input that can surface what everything else misses.*

One design decision spans all the layers: where the pipeline sits relative to the action. A judge reading transcripts after the fact is a monitoring instrument; nothing it flags stops a payment that settled in seconds. For action classes with [narrow reversibility windows](post.html?slug=hitl-design) (wires, instant payments), the screening layer has to run inline, before execution, on a latency budget the classifier can meet and the judge usually can't. An honest design document names which layers are inline controls and which are post-hoc measurement.

This is more machinery than a single judge prompt — and, per the arithmetic above, the minimum that works.

## The review queue is a checkpoint someone has to design

Let's go through the worked example. The payments agent's 50,000 monthly conversations carry a true scam-coaching rate of 0.2%: 100 real failures.

| Judge | Flags/month | PPV | Reviews/day | Caught (of 100) | Missed |
|---|:-:|:-:|:-:|:-:|:-:|
| The judge you think you deployed (TPR 90%, FPR 5% — illustrative) | ≈2,585 | 3.5% | ≈120 | 90 | 10 |
| The judge as measured (TPR 25%, FPR 4% — per Jain et al.[^2]) | ≈2,021 | 1.2% | ≈95 | 25 | 75 |

The first row is the clean trade-off the arithmetic section promised: a flooded queue that at least contains the failures. The second row is what the best available measurement implies, and it is worse on both axes at once: the queue still runs to nearly a hundred reviews a day, and three of four failures never enter it. The flooded-or-empty dichotomy was the optimistic case.

That choice is not an eval-pipeline detail. It is the design of a runtime human checkpoint, and everything the [HITL design post](post.html?slug=hitl-design) established applies. A reviewer clearing 29 to 80 flags to find one real failure is operating in the alert fatigue regime where [override and vigilance failures are best documented](post.html?slug=automation-bias-banking); Knight Capital's 97 unread alert emails in 89 minutes are the canonical case of a monitoring channel whose PPV had trained its recipients to ignore it. A checkpoint fed by an uncalibrated judge inherits the judge's base-rate problem and adds a human one on top.

The deploy-time questions from that post translate directly. *Competence:* did anyone test the queue at production flag volume, or did validation accept "a human reviews all flags" the way Knight's accepted "alerts are configured"? *Influence:* who can halt the agent (or hold a payment) on judge evidence alone, and is that authority written down? *Incentives:* is anyone rewarded for asking what the queue's PPV will be before launch, when the answer might delay it?

This is no longer only an internal-governance concern. The FSB's June 2026 consultation on responsible AI adoption tells institutions to watch for automation bias and to investigate cases where humans *consistently approve agent recommendations without modification* — it names the pattern rubber-stamping directly.[^10] The same document asks that assessment cover not only whether an agent achieved its objective but whether the actions it took to get there were appropriate: a correct disposition reached through an unauthorized path is still a control failure. A review queue fed by an uncalibrated judge is exactly the apparatus that manufactures approve-without-modification at scale, and it is now on the examination radar.

> [!QUOTE]
> The question your validation report has to answer isn't whether the judge agrees with humans. It's what fraction of the failures that occurred the judge ever saw.

The severity asymmetry is what makes the queue worth funding. A false alarm costs minutes of analyst time; a missed scam-coaching conversation costs a customer their savings, and costs the bank a reimbursement dispute whose outcome [depends on the rail](post.html?slug=payments-liability-gap), a UDAAP finding, or both. At a realistic ten to fifteen minutes per transcript, 120 reviews a day is on the order of three to four full-time analysts. Illustrative numbers, but the comparison they set up is not: a single coached scam that reaches litigation or an enforcement action can exceed that team's annual cost. Your figures will differ; the asymmetry won't.

When $C_{FN}/C_{FP}$ runs to four figures, the expected-cost math tolerates a great deal of queue noise before it tolerates a single point of lost TPR. That is an argument for the flooded-queue branch, *staffed for it*. One caveat the math forces: the system's effective TPR is the judge's TPR times the reviewer's hit rate, and reviewer hit rates degrade as queue quality falls. Staffing buys capacity. It does not, by itself, buy vigilance.

## What goes in the MRM artifact

I spent enough years in second-line governance — the independent risk function that checks the first line's work — to know what happens to a monitoring metric nobody interrogates: it becomes a control by reputation. Here is what I'd want documented before a judge-based monitoring claim supports a deployment decision; it is the [Stage-3 qualified-claims discipline](post.html?slug=nist-benchmark-evals) applied to the judge itself.

| Artifact | What it has to establish |
|---|---|
| Confusion matrix | Measured on a gold set that contains the rare class, with per-class counts and intervals plus the gold set's inter-annotator agreement. |
| Estimand declaration | In the [800-3 sense](post.html?slug=benchmark-uncertainty): is the reported number the judge's raw flag rate or a corrected prevalence estimate, and by which method? |
| Operating point and rationale | TPR, FPR, the implied PPV and queue load at declared prevalence, and the cost ratio that justifies the threshold. |
| Sampling budget | Singapore's IMDA testing guidance is unusually candid that characterizing a 0.01% failure rate at high confidence takes on the order of 10,000 test prompts per risk category, the honest price of claims about very rare events.[^8] |
| Recalibration cadence | Tied to scammer tactic drift rather than the calendar. The [deployment-gates substrate requirements](post.html?slug=deployment-gates) (κ against human labels, imbalanced-class metrics, independent judge family, drift tracking) are the quarterly mechanics this post extends to the rare-failure case. |

> [!IMPORTANT]
> **SR 26-2 and scope.** SR 26-2 (April 2026) explicitly excludes generative and agentic AI from its formal scope (footnote 3), so none of the above is a formal supervisory expectation under SR 26-2 today — though general safety-and-soundness and third-party risk-management expectations still reach the deployment the judge monitors. The gap is beginning to close from outside the US: the FSB's June 2026 consultation on responsible AI adoption — non-binding, open for comment until 22 July 2026 — addresses agentic systems directly and is the kind of guidance supervisors turn into examination questions.[^10] The list is ordinary measurement discipline applied to an instrument banks are already using in production. If your institution applies [effective challenge](post.html?slug=effective-challenge) to GenAI by analogy, the judge's confusion matrix is the single page where a validator's questions accomplish the most.

## The empty queue

The flooded queue announces itself: reviewers complain, costs show up in a budget line, someone recalibrates. The empty queue is the seductive one. The dashboard is green, the flag rate is low and stable, and the judge that produces it has never been confronted with a gold set containing the thing it's supposed to catch.

Meanwhile the gold set ages, the scammers' tactics drift, and the judge's blind spots stay exactly where they were. Those misses are not independent coin flips that a bigger sample would wash out — the production study found the judge's blind spots were structured, clustered in exactly the defect categories its rubric had no language for, and in the 14-judge study 26% of failures were invisible to *every* judge tested.[^2] A judge that can't see a failure class flags none of it, no matter how much traffic flows past.

Zero flags isn't zero failures. At these base rates, it isn't even evidence of it.

[^1]: Kamoi et al. (2024), ["Evaluating LLMs at Detecting Errors in LLM Responses"](https://arxiv.org/abs/2404.03602) (ReaLMistake, COLM 2024, arXiv:2404.03602). GPT-4-0613 judging GPT-4 outputs reached a TPR (recall) of ≈6.8% (fine-grained factuality) and ≈11.5% (answerability) while PPV (precision) often ran 75–100%; Claude 3 Opus managed ≈26–39%. TPR–Elo Spearman correlations: −0.77 and −0.75. A scope note: ReaLMistake is error-heavy by construction (≈62–80% error rates). TPR is arithmetically prevalence-independent, but if judges anchor on expected error rates (a behavioral hypothesis that remains unmeasured), performance at 1% prevalence would be even worse than these figures.

[^2]: Jain et al. (2025), ["Beyond Consensus: Mitigating the Agreeableness Bias in LLM Judge Evaluations"](https://arxiv.org/abs/2510.11822) (arXiv:2510.11822). 14 frontier LLMs judging feedback on 366 buggy Python programs (≈7.5% invalid) against a 200-person-hour expert gold set. Note the paper's convention is the reverse of this post's: it codes *valid output* as the positive class, reporting TPR >96% (valid outputs confirmed) and TNR <25% (invalid outputs caught) — translated here as a failure-class TPR (recall) below 25% with FPR under 4%. Minority-veto ensembling lifted failure-catch rates from 19.2% (majority vote) to 30.9%. A source-criticism note: the paper was [rejected at ICLR 2026](https://openreview.net/forum?id=3IsAoRHi9n), and the public reviews are worth reading. The grounds were generalizability — one domain, one dataset — not the validity of the within-domain measurement, which the public reviews did not contest and which Thakur et al. (2024) and Kamoi et al. (footnote 1) corroborate directionally. I'm citing it with that weight: the cleanest quantification of an asymmetry several independent lines of evidence point at, rather than a general result. There's an irony worth pausing on: the reviewers asked for validation on cross-domain gold sets that cost ≈200 expert person-hours apiece to build — the same scarcity this post's gold-set prescription asks banks to budget for. The review process working in public is also, incidentally, what [effective challenge](post.html?slug=effective-challenge) looks like when it functions.

[^3]: Zhang, Wang & Lei (2026), ["Catching One in Five: LLM-as-Judge Blind Spots in Production Multi-Turn Transaction Agents"](https://arxiv.org/abs/2606.10315) (arXiv:2606.10315). A deployed multi-turn ordering agent's built-in judge caught ≈22% of human-confirmed defect patterns (2 of 9 in one batch) and flagged zero of 100 rounds in a batch where humans confirmed 23 distinct defects; the authors estimate a 3–6× undercount of the true defect rate. Caveat per the paper itself: the zero-flag result was a routing-and-wiring artifact — the three-axis rubric had no category for the behavioral defects where most problems clustered — so the ≈22% pattern-level TPR (recall) figure is the more transferable number. The paper's sharper finding is that the blind spots were *structured, not random*: the judge caught turn-local issues and systematically missed cross-turn state issues. That a rubric can silently lack a category for the failure that actually occurs is its own lesson.

[^4]: Rogan & Gladen (1978), ["Estimating Prevalence from the Results of a Screening Test,"](https://doi.org/10.1093/oxfordjournals.aje.a112510) *Am. J. Epidemiology* 107(1). For the LLM-judge application: Chen et al. (2026), ["Efficient Inference for Noisy LLM-as-a-Judge"](https://arxiv.org/abs/2601.05420) (arXiv:2601.05420) shows naive-estimator coverage collapsing to 0% under substantial judge bias, with corrected estimators achieving nominal coverage at ≈3× narrower intervals than Rogan–Gladen. Prediction-powered inference originates with Angelopoulos et al. (2023), ["Prediction-Powered Inference"](https://arxiv.org/abs/2301.09633); Amazon's [PRECISE](https://arxiv.org/abs/2601.18777) (arXiv:2601.18777) extends it to ranking metrics with ≈100 human-annotated queries, and ["Noisy but Valid"](https://arxiv.org/abs/2601.20913) (arXiv:2601.20913) recasts judge reliability as a hypothesis test with a variance-corrected rejection threshold. All of these inherit the stability assumption: the judge's TPR/FPR measured at calibration must hold on the traffic being corrected.

[^5]: Collot et al. (2025), ["Balanced Accuracy: The Right Metric for Evaluating LLM Judges — Explained through Youden's J Statistic"](https://arxiv.org/abs/2512.08121) (arXiv:2512.08121; EACL 2026 Industry Track). Shows that the standard metrics (accuracy, precision, recall, F1) are sensitive both to class imbalance and to the arbitrary choice of positive class, and can favor judges that distort prevalence estimates; advocates Youden's J / balanced accuracy as the invariant alternative — while noting that equal class weighting can be volatile for long-tailed labels with sparse rare-class annotations. Gold-set sizing (1,000–2,000 expert-labeled items) follows their recommendation.

[^6]: Llama Guard (Inan et al. 2023, [arXiv:2312.06674](https://arxiv.org/abs/2312.06674)) is the canonical fine-tuned safety classifier, evaluated by AUPRC (0.945/0.953 on its own test sets) — a metric zero-shot GPT-4 judging couldn't even be scored on, since prompted judges return no probability. On R-Judge ([arXiv:2401.10019](https://arxiv.org/abs/2401.10019)), Llama-Guard-2-8B outperformed GPT-4o; the original 7B version flagged essentially nothing (F1 0.66 at specificity 100) — a reminder that "fine-tuned" is not a guarantee either. For the independent stress tests: ["No Free Lunch with Guardrails"](https://arxiv.org/abs/2504.00441) (arXiv:2504.00441) documents moderation true-positive rates as low as 43.1% on complex violations.

[^7]: Gao et al. (2024), ["Trust or Escalate: LLM Judges with Provable Guarantees for Human Agreement"](https://arxiv.org/abs/2407.18370) (ICLR 2025, arXiv:2407.18370): without abstention, GPT-4 reached only 63.2% human agreement on Auto-J; the cascade guarantees a user-set agreement target while cutting API cost ≈40%. Verga et al. (2024), ["Replacing Judges with Juries"](https://arxiv.org/abs/2404.18796) (PoLL, arXiv:2404.18796) finds a panel of three smaller diverse judges beats a single large judge at 7–8× lower cost — validated on balanced preference tasks rather than rare-event detection, so treat the transfer as plausible but unshown. On why raw judge confidence can't be trusted for any of this without calibration: ["Overconfidence in LLM-as-a-Judge"](https://arxiv.org/abs/2508.06225) (arXiv:2508.06225).

[^8]: IMDA, [*Starter Kit for Testing LLM-Based Applications for Safety and Reliability*](https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/starter-kit-for-testing-llm-based-applications-for-safety-and-reliability.pdf). Voluntary guidance consolidating practices from the AI Verify Foundation / IMDA Global AI Assurance Pilot (real-world testing across 30+ companies) plus a public consultation with 60+ firms. The sampling arithmetic — roughly 10,000 prompts per risk category to characterize a 0.01% failure rate at 99.99% confidence — is the starter kit's, and its corollary matches this post's: static judge-based evaluation has to be supplemented by [adversarial red-teaming](post.html?slug=adversarial-workflow) for the long tail, because no affordable sample characterizes it passively.

[^9]: Sudjianto, A. (2026), *Toward Unified Prompt and Pray Framework for Agentic AI Systems*, [SSRN 6932339](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6932339). A deliberately straight-faced satire — theorems, a convergence "proof," and a post-incident remediation strategy that appends *be extra careful* to the prompt — that formalizes the prompt-as-control pattern to argue the inverse: a prompt is not a control plane, a Markdown file is not state management, an LLM judge is not independent validation, and a human-in-the-loop is not oversight unless the human can inspect evidence, policy, tool calls, and system state. The "complete with respect to what it sees" framing, and the application to the AML alert-review workflow, are from the companion essay, ["Prompt and Pray Will Not Survive the FSB"](https://agussudjianto.substack.com/p/prompt-and-pray-will-not-survive) (June 2026).

[^10]: Financial Stability Board (2026), *Sound Practices for Responsible Adoption of Artificial Intelligence (AI)* — consultation report, published 10 June 2026: [report page](https://www.fsb.org/2026/06/sound-practices-for-responsible-adoption-of-artificial-intelligence-ai-consultation-report/) ([PDF](https://www.fsb.org/uploads/P100626.pdf)). A non-binding menu of 12 sound practices spanning firm-wide governance, AI-lifecycle risk management, and cyber/third-party risk, explicitly proportionate to risk. Comments due 22 July 2026; final report expected October 2026. The consultation flags automation bias, instructs institutions to investigate humans who consistently approve agent recommendations without modification ("rubber-stamping"), and asks that assessment consider whether an agent's actions — not only its outcome — were appropriate.
