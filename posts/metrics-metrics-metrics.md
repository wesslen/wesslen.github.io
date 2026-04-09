---
title: "Metrics, Metrics, Metrics"
date: 2026-04-03
description: "Everyone in GenAI wants a dashboard. The problem is that generic metrics aren't just uninformative — they actively mislead. Social scientists figured this out decades ago."
tags: [GenAI, evals, psychometrics, MRM]
---

> **TL;DR:** Generic GenAI metrics — helpfulness scores, coherence percentages, hallucination rates — produce the feeling of measurement without the reality of it. Finance learned this the hard way with VaR: even people who know a metric is imperfect anchor on it anyway, and the act of seeing a number tends to increase risk-taking rather than reduce it. The field practitioners most need to read isn't ML engineering literature — it's psychometrics, where social scientists spent a century developing tools for measuring latent constructs you can't observe directly, in contexts where the measurement instrument affects what it measures. That is also, vocabulary aside, an exact description of what GenAI evaluation is trying to do.

If you've worked on evaluating a GenAI application and sat in a meeting where someone asked "can we just get a dashboard for this?" — you've met the instinct I want to write about. There's a particular kind of managerial comfort that comes from seeing a number. Helpfulness: 4.2 out of 5. Coherence: 87%. Hallucination rate: 3%. It feels like understanding. It often isn't.

The question I keep stumbling over is this: if our metrics aren't measuring what we think they're measuring, are we better off with them or without them?

## The Brady Bunch Problem

In the Brady Bunch's third season, Marcia gets a broken nose right before homecoming and is convinced the world is ending. Her siblings mock her tunnel vision: "Marcia, Marcia, Marcia." It's a joke about how one fixation can crowd out everything else that matters.

GenAI evaluation has its own version of this. Metrics, metrics, metrics. Ask any team what their eval story is, and you'll hear about dashboards — rows of aggregate scores floating above a system nobody has actually looked at. What you won't hear much about is test design, failure taxonomies, eval pipeline engineering, or any of the harder scaffolding that makes metrics mean something.

[Hamel Husain made this point sharply](https://hamel.dev/blog/posts/revenge/) in a recent talk: teams reach for off-the-shelf eval frameworks and adopt their metrics wholesale. "The problem: you have no idea what is actually broken." Helpfulness and coherence scores sound reasonable. They're also generic enough to be useless for diagnosing what's failing in your specific application.[^1]

## We've Seen This Movie Before

This isn't new. Finance lived through exactly this problem with Value at Risk.

VaR became the standard metric for market risk in the 1990s: a single number that told you how much you could lose on a bad day, at a given confidence interval. Banks loved it. Regulators blessed it. It was legible, comparable, and auditable — qualities that made it irresistible to regulators and risk committees. It was also wrong in exactly the way that mattered: it performed beautifully in normal market conditions and catastrophically failed to capture tail risk. Nassim Taleb testified to Congress after the financial crisis that risk measurement of this kind has a systematic side effect — it *increases* risk-taking, even among people who know the measure isn't reliable. Seeing a number produces overconfidence. Knowing the number is imperfect doesn't protect you from anchoring on it.[^2]

The broader pattern has a name. Goodhart's Law: when a measure becomes a target, it ceases to be a good measure. Jerry Muller, in *The Tyranny of Metrics*, traces this across education, medicine, and government — the consistent failure mode where an institution starts optimizing the indicator instead of the underlying thing the indicator was supposed to track.[^3] The metric colonizes the goal.

GenAI benchmark-chasing is the same dynamic. When MMLU scores appear in model announcements and procurement conversations, they stop being measurements and become targets. Model developers train toward them. Buyers anchor on them. And the scores gradually decouple from anything that predicts real-world behavior.

> [!WARNING]
> Benchmark saturation is accelerating this problem. Analysis of 60 widely used benchmarks found that nearly half exhibit saturation — top models become statistically indistinguishable on aging benchmarks — the scores converge because models have learned to solve the specific items rather than the underlying skill.[^4]

## What Social Scientists Actually Know About This

Here's the part most ML practitioners skip: social scientists have been thinking about measurement theory for over a century, and they've developed real tools for it.

Psychometrics — the field that gave us standardized testing, survey design, and educational measurement — is fundamentally in the business of measuring things you can't see directly. You can't observe "reasoning ability" or "mathematical aptitude" any more than you can observe "safety" or "faithfulness" in a language model. What you observe are *indicators* — specific items, tasks, outputs. The hard question, the one psychometricians have been wrestling with since the 1950s, is whether your indicators actually measure the underlying construct.

They call this construct validity, and it's a harder problem than it sounds. A recent paper by Wallach and colleagues argues — convincingly, in my view — that GenAI evaluation is fundamentally a social science measurement challenge rather than an engineering one.[^5] The distinction matters because engineering disciplines tend to assume that if you can run the test, you're measuring what you want. Social scientists know you have to *verify* that assumption.

Item Response Theory offers one concrete example of how that verification works. IRT models the probability of a correct response as a function of both model ability *and* item characteristics — difficulty, discrimination, the probability of correct guessing through pattern matching alone. The interesting thing about the guessing parameter is that it maps almost directly onto hallucination: the probability that a model produces a plausible-sounding correct answer not because it understands the domain but because it's learned the distribution of correct-looking outputs.[^6]

Classical Test Theory does something else useful: it forces you to think about measurement error systematically. LLM performance isn't deterministic. Run the same prompt at temperature 0.7 twice and you get different outputs. CTT treats the "true score" as the expected performance across infinite replications under identical conditions — which gives you a way to reason about what's noise versus what's signal in your eval results.[^6]

## The Validity Problem Is Not Theoretical

Chess is a good case study because it's concrete. You can measure accuracy against engine ground truth, and frontier models achieve near-optimal scores on standard board positions. So when researchers tried rotating or mirroring the board, they found error rates jumped 600%.[^7]

The models weren't reasoning about chess. They were pattern-matching against a training distribution where the standard board orientation is heavily overrepresented. The metric (accuracy on standard positions) looked excellent. The construct (chess proficiency) was absent.

Clinical reasoning shows the same gap. In the mARC-QA benchmark, models including GPT-o1 and Claude scored well on standard medical exams but broke down when researchers introduced the "Einstellung effect" — scenarios where familiar clinical heuristics are invalidated by a blocking condition. Models adhered to the learned heuristic even when the context made it wrong. Physicians didn't.[^7] The benchmark measured memorization. It reported it as reasoning.

## The Bigger Picture: Evals Are Infrastructure

Hamel's framing that I find most useful is that LLM evaluation is fundamentally data science, and the test infrastructure is the hard part. It's not the metrics — it's the test design, the representative data construction, the judge validation, the CI/CD integration, the failure taxonomy. The metrics are outputs of that infrastructure. If the infrastructure is bad, the metrics are meaningless regardless of how legible they look in a dashboard.[^1]

This is where the social science parallel really bites. Psychometricians don't just report scores. They report reliability coefficients, factor structures, validity evidence. They distinguish between content validity (does the test cover the domain?), convergent validity (do scores correlate with related measures?), and predictive validity (do scores actually predict the real-world outcome we care about?). None of that verification happens automatically just because you ran the eval.

Automated LLM judges — increasingly the default for scalability — introduce their own construct validity problems. Research has documented at least 12 systematic biases in LLM-as-judge systems, among them verbosity bias (longer responses score higher regardless of quality), positional bias (swapping the order of pairwise comparisons can flip the winner 20–40% of the time), and self-preference bias (judges score outputs that "sound like" them higher due to lower perplexity).[^8] An unverified judge isn't a measurement instrument — it's a noise generator with high-end branding.

The practical implication is that verifying your judge should be treated like validating a classifier: get human labels, partition into train/dev/test, measure precision and recall, check for calibration drift. This is boring work. It's also the work that determines whether your eval system is telling you anything true.

## What I Keep Coming Back To

I've watched this play out in financial services, which has had formal model risk management obligations for fifteen years. SR 11-7 requires validation, documentation, and ongoing monitoring of quantitative models. You'd think that culture would transfer naturally to GenAI evaluation. In my experience, it mostly hasn't — partly because GenAI is arriving through product and engineering channels rather than risk management ones, and partly because the dashboards look authoritative enough that nobody asks what they're actually measuring.

Taleb's observation about VaR is worth sitting with: even people who *know* a metric is imperfect anchor on it anyway. The solution isn't to remove the number — it's to surround the number with the infrastructure that makes it meaningful. In finance, that meant stress testing, scenario analysis, and actual model validation. In GenAI, it means the same thing: test design, eval pipeline engineering, judge calibration, and an honest account of what your metrics can and can't tell you.

The field I think GenAI practitioners most need to read isn't ML engineering literature. It's psychometrics. Social scientists spent the better part of the 20th century developing tools for measuring things you can't observe directly, under conditions where your measurement instrument affects what it measures, in contexts where the constructs themselves are contested. That is also, with slight vocabulary changes, an exact description of what we're trying to do with GenAI evaluation.

Whether practitioners will actually read it — or whether the pull toward the dashboard is just too strong — is the question I don't have a clean answer to.

[^1]: Hamel Husain, ["The Revenge of the Data Scientist,"](https://hamel.dev/blog/posts/revenge/) PyAI Conf (2026). The five pitfalls Hamel identifies — generic metrics, unverified judges, bad experimental design, bad data and labels, and automating too much — map closely to the measurement failures described in psychometric literature.
[^2]: [Nassim Taleb, Congressional testimony to the House Financial Services Committee (July 2011)](https://www.govinfo.gov/content/pkg/CHRG-111hhrg51925/pdf/CHRG-111hhrg51925.pdf): "Risk measurement and prediction — any prediction — has side effects of increasing risk-taking, even by those who know that they are not reliable. We have ample evidence of so-called 'anchoring' in the calibration of decisions."
[^3]: David Shaywitz, ["We Are Not a Dashboard: Contesting the Tyranny of Metrics, Measurement, and Managerialism,"](https://www.aei.org/articles/we-are-not-a-dashboard-contesting-the-tyranny-of-metrics-measurement-and-managerialism/) AEI (2019), drawing on Jerry Muller's *The Tyranny of Metrics* (2018). Muller's core observation: "Not everything that is important is measurable, and much that is measurable is unimportant."
[^4]: Benchmark saturation analysis from the psychometric evaluation literature cited in [Wallach et al. (2025)](https://arxiv.org/abs/2502.00561): analysis of 60 widely used benchmarks found that nearly half exhibit saturation, with rates increasing as benchmarks age.
[^5]: [Wallach et al. (2025)](https://arxiv.org/abs/2502.00561), "Position: Evaluating Generative AI Systems is a Social Science Measurement Challenge." The paper applies the Adcock & Collier four-level framework — background concept → systematized concept → indicator → score — to AI evaluation, arguing that most current eval practice skips the first two levels entirely.
[^6]: Classical Test Theory and Item Response Theory applications to LLM evaluation are developed in detail in the psychometric literature. The three-parameter logistic model in IRT includes a "pseudo-guessing" parameter that researchers have mapped onto the probability of a model hallucinating a correct answer through pattern matching rather than genuine domain understanding. For IRT applied to LLM evaluation specifically: [ADVSCORE (NAACL 2025)](https://aclanthology.org/2025.naacl-long.27.pdf) builds on IRT to measure adversarialness grounded in human performance; [Diagnosing LLM-as-a-Judge via IRT](https://arxiv.org/abs/2602.00521) applies the Graded Response Model to assess judge reliability and human alignment; [LLM Psychometrics: A Systematic Review](https://arxiv.org/abs/2505.08245) surveys the broader landscape; and the [Awesome-LLM-Psychometrics](https://github.com/valuebyte-ai/Awesome-LLM-Psychometrics) repository is a useful starting point.
[^7]: The [chess accuracy-stability case study](https://arxiv.org/abs/2512.15033v1) (GPT-5.1, Claude Sonnet 4.5, Kimi K2 Turbo) and the [mARC-QA clinical reasoning benchmark](https://pmc.ncbi.nlm.nih.gov/articles/PMC12606185/) are both described in the psychometric AI evaluation literature as canonical examples of construct validity failure — high indicator scores masking the absence of the underlying latent capability.
[^8]: The 12 systematic biases in LLM-as-judge systems, including verbosity bias, positional (primacy/recency) bias, format bias, authority bias, and self-preference bias, are documented in the LLM evaluation literature. Positional bias flip rates of 20–40% are a serious problem for pairwise preference benchmarks like LMSYS Chatbot Arena.
