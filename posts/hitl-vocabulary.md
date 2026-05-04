---
title: "Human-in-the-Loop Is a Borrowed Term"
date: 2026-04-26
description: "The phrase 'human-in-the-loop' is everywhere in AI governance conversation and almost nowhere in binding banking supervision. The sixty-year history of the term explains the gap — and why it's about to matter."
tags: [banking, regulatory]
---

> **TL;DR:** "Human-in-the-loop" is a 1978 teleoperation concept that regulators have almost never adopted as binding text, yet it now organizes most AI governance conversation in financial services. US banking supervisors use "effective challenge," "expert judgment," and "qualified personnel" to mean roughly the same thing — but the mapping is by analogy: SR 26-2 explicitly excludes generative and agentic AI from scope. Internationally, regulators have converged on "human oversight" with proportionality frameworks; the phrase "HITL" itself appears in exactly one principal US financial-services supervisory document. That terminology gap is not academic. Agentic AI operates at a speed and opacity that make the vocabulary mismatch a governance design problem.

Every AI governance deck in financial services promises "human-in-the-loop." The EU AI Act, SR 26-2, PRA SS1/23, the FINRA rulebook, the 2021 Interagency AI RFI, and both CFPB adverse action circulars don't use that phrase in their operative text. You cannot satisfy a supervisory expectation you cannot locate in the actual guidance.

That gap has a history. The term didn't originate in banking or in AI — it came from 1970s defense engineering and migrated through aviation, industrial automation, and machine learning before landing in financial services governance, trailing six decades of contested definition behind it. Understanding where the phrase came from explains why technologists and compliance officers using it often aren't describing the same control.

## A sixty-year borrowed concept

<img src="https://lightbits.github.io/telerobot/sheridan3.jpg" alt="Sheridan-Verplank ten-level automation scale, original 1978 diagram" style="max-width: 400px; width: 100%; display: block; margin: 0 auto;" />

*Original figure from [Sheridan & Verplank (1978)](https://apps.dtic.mil/sti/tr/pdf/ADA057655.pdf). Reproduced in Simen Haugo, "Working From Home: A History of Telerobot Displays," NTNU Department of Engineering Cybernetics (May 2018), via [lightbits.github.io/telerobot](https://lightbits.github.io/telerobot/).*

The modern HITL concept traces to a 1978 MIT report by Sheridan and Verplank "[Human and Computer Control of Undersea Teleoperators](https://apps.dtic.mil/sti/tr/pdf/ADA057655.pdf)," which introduced a ten-level scale of decision automation running from level 1 ("the human operator does it all") to level 10 ("the computer decides everything and acts autonomously, ignoring the human").[^1] It was designed for remotely operated underwater vehicles. That one-dimensional continuum became the default mental model for human-automation trade-offs across aviation and industrial automation for the next three decades.

| Level | Description |
|:-----:|-------------|
| **10** | The computer decides everything, acts autonomously, ignoring the human |
| **9** | Informs the human only if it, the computer, decides to |
| **8** | Informs the human only if asked |
| **7** | Executes automatically, then necessarily informs the human |
| **6** | Allows the human a restricted time to veto before auto-execution |
| **5** | Executes that suggestion if the human approves |
| **4** | Suggests one alternative |
| **3** | Narrows the selection down to a few |
| **2** | Offers a complete set of decision/action alternatives |
| **1** | Offers no assistance: human must take all decisions and actions |

*Levels of automation from Parasuraman et al. (2000), "A Model for Types and Levels of Human Interaction with Automation," IEEE Trans. Syst. Man Cybern.*

Parasuraman et al. (2000) broke that continuum by decoupling the *stage* of automation from the *degree*.[^2] They distinguished four information-processing stages (data acquisition, analysis, decision-selection, and execution) and argued the Sheridan-Verplank levels could be applied independently to each. A system might exhibit high automation for data acquisition but low automation for final decision. That distinction is why "HITL" now means different things at different points in a pipeline — and why an engineer describing a training-time labeling workflow and a regulator describing a validation committee are both technically correct when they call what they're doing "human-in-the-loop."

The canonical warning came three years before Parasuraman's refinement. Lisanne Bainbridge's 1983 paper "Ironies of Automation" observed that automating most of the work leaves humans with degraded manual skills and diminished vigilance precisely when intervention is most needed.[^3] Much of the contemporary debate about agentic AI oversight is restating Bainbridge's point. The paper is worth reading in full; the irony it identifies is architectural: automation reliably creates the conditions for its own oversight failure.

## Six variants with consequential distinctions

Six terms now circulate in AI governance, often interchangeably, with meaningful differences between them.

**Human-in-the-loop (HITL)** originates in 1970s control theory and military simulation. In machine learning, the term drifted to describe human labelers and preference-raters in active learning and RLHF pipelines. In autonomous-weapons doctrine it denotes semi-autonomous systems where humans select individual targets. These are not the same thing, and the governance implication of each is different.

**Human-on-the-loop (HOTL)** corresponds to human-supervised autonomy — systems the human monitors and can halt but does not drive. This framing appears in commentary on [DoD Directive 3000.09](https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf) (issued November 2012, updated January 2023), which itself uses the terms "semi-autonomous" and "operator-supervised autonomous" rather than HOTL. The oversight structure is real; the shorthand is an analytical overlay.

**Human-out-of-the-loop (HOOTL)** has two separate meanings that are worth keeping distinct. In defense it denotes lethal autonomous weapon systems. In human factors research it denotes the performance decrement Bainbridge identified: degraded human capability from extended periods outside the control loop. Conflating these in governance discussions produces different mistakes: one is about accountability for autonomous action, the other is about the design of oversight mechanisms.

**Human-in-command (HIC)** was introduced by the EU High-Level Expert Group on AI in its [April 2019 Ethics Guidelines for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai). The HLEG defined three tiers. HITL requires “intervention in every decision cycle.” HOTL involves “intervention during the design cycle and monitoring.” HIC sits at the top: “the capability to oversee the overall activity of the AI system and the ability to decide when and how to use the system.” HIC is the strongest oversight concept in the EU governance vocabulary short of meaningful human control.

**Meaningful human control (MHC)** was coined by [UK NGO Article 36](https://article36.org/wp-content/uploads/2013/04/Policy_Paper1.pdf) in 2013 as a political concept for autonomous-weapons negotiations. The canonical philosophical treatment is Santoni de Sio and van den Hoven's 2018 paper, which specifies two conditions: a tracking condition (the system is responsive to human moral reasons and environmental facts) and a tracing condition (outcomes can always be traced back to at least one human with proper moral understanding). MHC carries the strongest normative charge of any term in this family and appears rarely in financial regulation.

**"Human oversight"** is the EU regulatory workhorse, codified in [Article 14 of the EU AI Act](https://artificialintelligenceact.eu/article/14/) (Regulation EU 2024/1689, entered into force August 2024). It requires that high-risk systems be "effectively overseen by natural persons" with capacity to understand the system's limitations, remain aware of automation bias, correctly interpret outputs, and intervene or stop operation. Article 14's high-risk-system obligations apply from 2 August 2026; creditworthiness assessment of natural persons under Annex III is among the listed categories.[^5]

The point of this taxonomy is not the categories themselves. It's that engineers and regulators using the same word are often describing controls at completely different points in the stack, with different human actors, different timing, and different authority structures. That is the gap that creates compliance risk.

## What banking regulators actually say

The phrase "human-in-the-loop" appears in exactly one principal US financial-services self-regulatory organization supervisory document: FINRA's 2026 Annual Regulatory Oversight Report, which asks firms deploying AI agents to consider "where to have 'human in the loop' agent oversight protocols or practices."[^4] FINRA is a broker-dealer self-regulatory organization with no prudential banking supervisory authority; this framing addresses broker-dealer agent deployments and does not constitute banking supervisory guidance.

None of the federal prudential supervisors have used the phrase in SR 11-7, SR 26-2, the 2021 Interagency AI RFI, or any subsequent guidance.

What banking regulators do say maps onto the HITL concept through different vocabulary:

| HITL concept | Regulatory language | Primary source | Status |
|---|---|---|---|
| Independent human review | "Effective challenge" | SR 11-7 (2011); SR 26-2 (2026) | Prudential guidance |
| Authority to override AI | "Qualified personnel" with "explicit authority to require changes" | SR 11-7 §V | Prudential guidance |
| Human judgment in edge cases | "Expert judgment"; "conservative adjustments" | SR 11-7 §IV | Prudential guidance |
| Consumer fallback | "Human Alternatives…and Fallback"; "offramp to a human representative" | White House AI Bill of Rights (2022) *(non-binding)*; CFPB Chatbots Spotlight (June 2023) | Non-binding / Agency guidance |
| Agent-level oversight | HITL agent oversight protocols | FINRA 2026 Annual Oversight Report | SRO guidance |
| Adverse action explainability | "Specific and accurate reasons" | CFPB Circular 2023-03; ECOA/Reg B | Statute + regulation |
| Deployable stop capability | "Kill-switch" | IOSCO FR06/2021[^8]; EU AI Act Art. 14(4)(e) | International / Binding (EU) |

> [!IMPORTANT]
> SR 26-2 (April 17, 2026) explicitly excludes generative AI and agentic AI from its scope in footnote 3. The exclusion defines the outer limit of SR 26-2’s coverage as currently written; these system types fall outside the framework, with no committed timeline for supplemental guidance. Every row in this table that references "effective challenge" or "qualified personnel" describes a supervisory expectation developed for traditional statistical and ML models. Banks applying these standards to agentic deployments are doing so by analogy — there is no governing directive requiring it, and no guidance specifying what the standards mean for systems that compose tools and execute multi-step plans at machine speed. That gap is the governance design question the field has not answered. For the full MRM context of SR 26-2, see [SR 11-7, SR 26-2, and the Four Scenarios](post.html?slug=sr11-7); for what the effective challenge standard imposes on validators, see [Effective Challenge Under GenAI](post.html?slug=effective-challenge).

Internationally, the vocabulary is tighter but the specificity varies. The UK's PRA Supervisory Statement SS1/23 uses "expert judgement," "board challenge," "override," and "post-model adjustment" — not "human-in-the-loop." MAS's November 2025 consultation paper on AI risk management[^6] scales required oversight to each system's potential impact and the degree of autonomy it has been granted (what the paper terms "reliance"), with operational complexity as a further factor. OSFI Guideline E-23 (Canadian prudential regulator, effective May 2027) makes autonomy a model-risk rating factor directly. The US Treasury's February 2026 AI risk management resources for the financial sector are non-binding implementation tools that carry no supervisory force.[^7]

The obvious counterargument is that vocabulary is incidental — that “effective challenge” and “qualified personnel” are functionally adequate, and what’s actually missing is guidance specificity on what those standards require for agentic systems. That’s partly right. But vocabulary and institutional design aren’t independent: the terms a bank uses to specify its oversight structure shape what that structure looks like, who owns it, and what an examiner will ask for. A governance committee built around “HITL checkpoints” and one built around “effective challenge with qualified validators” will allocate both responsibility and accountability differently when something goes wrong.

The convergence across jurisdictions is on a core set of expectations: board-level accountability, independent validation, override capability, human review of material or customer-facing decisions, and the principle that AI deployment does not dilute human accountability. The convergent term is "human oversight." A compliance program drafted around the former without grounding it in the vocabulary of the latter cannot satisfy a regulatory examination.

## What's categorically different now

Earlier automation waves produced human-readable state at every stage. An operator could look at the system and understand exactly what it was doing, even if intervention was difficult.

Agentic AI changes what oversight requires in three specific ways, each structural rather than incremental.

First, intermediate steps are opaque: the human checkpoint sees an artifact produced by multi-step reasoning it cannot inspect. In algorithmic trading or industrial control, each decision step is a deterministic function of auditable inputs; in an agentic pipeline, the reasoning trace is a chain of probabilistic outputs that doesn’t reproduce exactly under re-inspection, which means post-hoc review cannot reconstruct how an output was reached.

Second, errors compound across agents before any monitoring flag fires — a small reasoning error at step one propagates through subsequent steps in ways that point-in-time review cannot catch after the fact. Unlike cascade failures in distributed systems, where error propagation follows explicit inter-service call paths and produces structured logs, multi-agent error propagation occurs through natural-language context that leaves no structured audit trail to diagnose.

Third, agentic systems can update their response patterns based on accumulated context and state, meaning the behavior validated before deployment is not guaranteed to be what executes under novel inputs tomorrow. This differs from standard model drift: conventional online-learning drift is measured against known distribution statistics and triggers a revalidation event; agentic behavioral drift accumulates through context-window state that existing monitoring frameworks have no established metric to capture.

These aren't incremental differences from [Knight Capital](post.html?slug=a2a-case-studies) or the 2010 Flash Crash. They change what effective oversight requires structurally: monitoring instrumentation calibrated to each pipeline stage; coverage metrics are the wrong frame. The [effective-challenge triad](post.html?slug=effective-challenge) was designed for validators reviewing static models. For an agentic system whose intermediate steps are invisible and whose behavior can shift across sessions, the "competence" leg faces a problem the original framework wasn't designed to solve.

The supervisory question for agentic AI isn't whether a human is in the loop. It's whether the loop still runs at a speed and transparency at which human judgment can matter — and what to do in financial services when the answer is no. The [second post in this series](post.html?slug=hitl-design) takes up that design question directly.

[^1]: Thomas B. Sheridan and William L. Verplank, *Human and Computer Control of Undersea Teleoperators* (MIT Man-Machine Systems Laboratory, 1978), available via [WorldCat](https://search.worldcat.org/title/human-and-computer-control-of-undersea-teleoperators/oclc/8544670) and [ResearchGate](https://www.researchgate.net/publication/23882567_Human_and_Computer_Control_of_Undersea_Teleoperators).

[^2]: Raja Parasuraman, Thomas B. Sheridan & Christopher D. Wickens, "A Model for Types and Levels of Human Interaction with Automation," *IEEE Trans. Syst. Man Cybern.* 30(3), 286–297 (2000), [IEEE Xplore](https://ieeexplore.ieee.org/document/844354).

[^3]: Lisanne Bainbridge, "Ironies of Automation," *Automatica* 19(6), 775–779 (1983), [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/0005109783900468). A scanned copy is available at [ckrybus.com](https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf).

[^4]: FINRA, *2026 Annual Regulatory Oversight Report*, GenAI section (released December 9, 2025), [finra.org](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/gen-ai). The Federal Reserve Board's Compliance Plan for OMB Memorandum M-25-21 also uses the phrase — but in reference to the Board's own internal AI operations rather than institutions under its supervision.

[^5]: European Banking Authority, *Report on Big Data and Advanced Analytics* (EBA/REP/2020/01), January 2020. The EBA's August 2023 follow-up report on ML for IRB models (EBA/REP/2023/28) subsequently maps existing IRB validation requirements onto obligations under Article 14 of Regulation EU 2024/1689, concluding that existing frameworks largely encompass Article 14's substance with different vocabulary. Both documents are available at eba.europa.eu.

[^6]: Monetary Authority of Singapore, *Consultation Paper on Guidelines on AI Risk Management* (November 13, 2025), [mas.gov.sg](https://www.mas.gov.sg/publications/consultations/2025/consultation-paper-on-guidelines-on-ai-risk-management). This consultation paper is pending finalization.

[^7]: US Department of the Treasury, AI risk management resources for the financial sector (February 2026), [home.treasury.gov](https://home.treasury.gov/news/press-releases/sb0401). Released by Treasury's AI Executive Oversight Group as non-binding implementation tools.

[^8]: IOSCO, Final Report FR06/2021, [iosco.org](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD684.pdf). IOSCO is the International Organization of Securities Commissions; its reports represent international consensus standards and are not directly binding on US prudential banking supervisors. Article 14(4)(e) of Regulation EU 2024/1689 (the kill-switch provision) is binding on covered AI system providers under EU law.
