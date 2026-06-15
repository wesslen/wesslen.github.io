---
title: "The Economic Case for Inferior LLMs"
date: 2026-05-16
description: "A new MIT working paper shows that maximizing AI accuracy can destroy the knowledge that makes AI recommendations valuable in the first place. The welfare-optimal policy is deliberately less accurate AI — and it is the first-best choice, not a concession."
tags: [economics, labor]
series: ai-economy
---

> **TL;DR:** A [new MIT working paper](https://economics.mit.edu/sites/default/files/2026-02/AI%2C%20Human%20Cognition%20and%20Knowledge%20Collapse%2002-20-26.pdf) by Acemoglu et al. shows that AI recommendations and human learning are substitutes — and the substitution runs deep enough to eventually eliminate the community's shared knowledge stock entirely. Welfare is non-monotone in AI accuracy: beyond an interior optimum, a more precise model makes society worse off. The paper's policy implication is counterintuitive but precise: the welfare-maximizing information design involves deliberately adding noise to AI recommendations. The goal isn't error hedging; it's preserving the learning incentives that sustain institutional knowledge. In banking, this isn't theoretical — it's the argument that was always implicit in requiring human review of model outputs, just never formalized.

Stack Overflow's question volume has been declining since 2022, and the decline accelerated sharply in the months after ChatGPT launched.[^1] The first explanation most people reach for (developers are getting answers faster now) is true. But the same paper suggests there's a second-order effect worth worrying about: if developers stop writing questions, they also stop writing answers, and the community's accumulated knowledge stops compounding.[^2]

The paper isn't primarily about Stack Overflow. It's a formal model of what happens when agentic AI provides context-specific recommendations that substitute for individual learning effort. The central result is uncomfortable: in equilibrium, the knowledge stock can collapse to zero. The mechanism is counterintuitive: the AI gives good enough answers that people stop building the base that would let them ask better questions.

![Circular feedback loop diagram showing the knowledge collapse externality: four boxes connected by clockwise arrows — AI GIVES PRECISE RECOMMENDATIONS (blue, top) → INDIVIDUALS STOP LEARNING (orange, right, stick figure asking 'WHY BOTHER?') → COMMUNITY KNOWLEDGE STOCK FALLS (red, bottom) → AI MUST SUBSTITUTE MORE (orange, left) → back to top. Center label: KNOWLEDGE COLLAPSE. A dashed green arrow from outside the loop points inward labeled 'GARBLING POLICY: CAP PRECISION AT τ*' — the intervention that breaks the cycle. Bottom annotation: 'Each individual acts rationally. The community pays the external cost.' (Acemoglu, Kong & Ozdaglar 2026).](../img/knowledge-collapse-cycle.png)
*The self-reinforcing mechanism. More precise AI crowds out individual learning effort; reduced learning erodes the community knowledge stock; a weaker knowledge stock increases dependence on AI. The garbling policy (capping precision at $τ*$) is the only intervention that breaks the loop.*

## Learning as a joint production problem

The model's key insight is that human learning effort produces two things simultaneously: a private signal about your specific problem, and a thin contribution to the community's general knowledge stock. These share the same production function; you can't acquire one without the other. Economists call this economies of scope in learning.

When agentic AI provides the recommendation directly, it eliminates the private reason to learn. And because the private signal and the public contribution are jointly produced, eliminating the private incentive also eliminates the public contribution. Each individual acts rationally; the community pays the external cost.

This is a learning externality in the precise technical sense. Each analyst who skips working through the problem because the model already answered it is making the individually correct choice. The problem is that "what's the marginal contribution of my learning to the community's knowledge stock" doesn't appear anywhere in their optimization problem.

| Knowledge type | Nature | Relationship to human effort | Relationship to agentic AI |
|---|---|---|---|
| General knowledge (X) | Public, shared — accumulated via community | Complementary: more general knowledge raises the marginal return to learning | Not directly substituted |
| Context-specific knowledge (Y) | Private, idiosyncratic — acquired via individual effort | Substitutable: AI replaces the need for private effort | Perfectly substituted by AI recommendations |

The substitution is the trap. AI perfectly replaces the private incentive to learn, and in doing so destroys the public externality that private learning was always quietly generating.

## The welfare trap

The paper's most pointed result is that more accurate AI does not reliably produce better outcomes for society. An agentic model that provides more precise recommendations crowds out more learning effort. Up to some interior optimum — call it $τ*$— higher precision raises welfare because the quality of recommendations increases faster than the knowledge lost to reduced learning. Past $τ*$, the substitution effect dominates: more accurate AI erodes the knowledge stock faster than it adds decision-support value, and welfare falls.

The authors also identify a complete-collapse threshold $τ_A^c$. If AI accuracy exceeds this level, the high-knowledge steady state disappears entirely. Starting from a world where deep institutional knowledge is widespread, a sufficiently precise AI can make that world unreachable as a future state, regardless of where you begin. Initial conditions stop mattering.

![Welfare curve diagram: X-axis AI PRECISION, Y-axis SOCIAL WELFARE. A hand-drawn curve rises from left to a peak at tau-star (FIRST-BEST POLICY CAP, vertical dashed line), then falls back down past a horizontal dashed BASELINE WELFARE line. A second vertical dashed red line marks tau-A-c (HIGH-KNOWLEDGE STEADY STATE DISAPPEARS). Three zones labeled along the curve: WELFARE-IMPROVING (green, left of tau-star), PAST OPTIMUM (orange, between tau-star and tau-A-c), COLLAPSE (red, right of tau-A-c where curve falls below baseline).](../img/knowledge-collapse-welfare-curve.png)
*Welfare as a function of AI precision. More accurate AI raises welfare up to $τ*$, then erodes it. Past $τ_A^c$, the high-knowledge steady state ceases to exist.*

One clarification: this is not a claim that AI makes individuals less capable. The model holds individual ability constant throughout. The collapse happens at the community level, through the externality on shared knowledge, which means the damage is diffuse and slow-moving, largely invisible until it has already happened.

## The inferior model as first-best policy

Here is where the paper arrives somewhere I didn't expect. The welfare-optimal information design policy is to deliberately add noise to AI recommendations. The authors call this garbling. Constraining the AI's effective precision to $τ*$ — even when the underlying model could achieve higher accuracy — preserves the learning incentives that keep the knowledge stock alive.

The paper establishes this as the first-best policy outcome. A governance committee that defaults to the more accurate vendor is making a mistake: accuracy beyond $τ*$ trades long-run community knowledge for short-run decision quality. The tradeoff only becomes visible at the community level, and only over time. The more accurate model wins the procurement scorecard and loses the institutional capability race.

The paper also prescribes a specific transition sequence if an organization has already crossed the collapse threshold: first suppress AI recommendations entirely to let the knowledge stock rebuild, then restore precision capped at $τ*$. The optimal path requires the inferior model for two reasons: the right steady-state design when below the collapse threshold, and the recovery mechanism when the organization has already crossed it.[^3]

![Two-phase garbling policy timeline. Left phase (PHASE 1: SUPPRESSION, blue): AI PRECISION held at zero; KNOWLEDGE STOCK shows a rising curve labeled REBUILDS. Note: organization has crossed collapse threshold. Right phase (PHASE 2: STEADY STATE, green): AI PRECISION flat line labeled CAPPED AT tau-star PERMANENTLY; KNOWLEDGE STOCK flat stable line labeled HOLDS. Bottom annotation: ACCURACY BEYOND tau-star TRADES LONG-RUN KNOWLEDGE FOR SHORT-RUN QUALITY. Neither phase uses the most accurate model.](../img/knowledge-collapse-garbling-policy.png)
*The optimal two-phase policy. Suppress AI precision entirely to rebuild the knowledge stock (Phase 1), then restore it permanently capped at $τ*$ (Phase 2). Neither phase uses the most accurate available model.*

## The banking translation

Lisanne Bainbridge observed in 1983 that automating most of a task leaves human operators with degraded manual skills and diminished vigilance precisely when intervention is most needed — because they have stopped practicing the skills that full-time operation builds.[^4] The automation literature has known this for forty years. The Acemoglu et al. model gives the observation a formal structure it never had: the problem isn't only individual skill atrophy through disuse, but a community-level knowledge collapse driven by a learning externality, where each individual's rational choice not to learn compounds into a structural loss that no single operator can observe or reverse.

> [!QUOTE]
> Competence is not static. It compounds when practitioners learn, and it depreciates when the learning incentive disappears.

I've been thinking about this in terms of junior analyst development in MRM shops. The model risk lifecycle under SR 11-7 required that validators understand the assumptions, data generating processes, and failure modes of the models they reviewed, not merely whether outputs passed spot checks. That requirement, enforced through documentation standards and validation depth requirements, produced a kind of institutional knowledge stock: practitioners who had worked through enough model internals to recognize when something was wrong.[^5]

Agentic AI that drafts model documentation, flags statistical tests, and writes validation findings changes the marginal return to working through model internals yourself. The recommendation is there. You can sign off or push back. But "push back on what basis?" requires familiarity that accumulates from having done the work. That familiarity is exactly what the learning externality erodes.

[Effective challenge](post.html?slug=effective-challenge), the third pillar of model governance, requires that reviewers have the competence to mount it. Competence is not static. It compounds when practitioners learn, and it depreciates when the learning incentive disappears.

What the effective challenge framework demands of the organization is precisely the capacity that agentic AI, at high enough precision, systematically undermines. The economic argument for which tasks get automated first — and why that sequencing compounds the knowledge externality by removing the practice substrate for exactly the judgment tasks AI cannot yet replace — is developed in [Automating the Wrong Links](post.html?slug=weak-links-banking).

SR 26-2 (which superseded SR 11-7 on April 17, 2026) explicitly excludes GenAI and agentic AI from its scope. The formal MRM framework does not speak to the systems creating the knowledge externality described here.

The governance gap and the knowledge externality are, in that sense, the same problem wearing different coats.

## Aggregation capacity is the one free parameter

| Parameter | Welfare effect | Tradeoff? | Controllable by org? |
|---|---|---|---|
| AI precision (τ) | ↑ up to $τ*$, then ↓ | Yes — non-monotone | Partially: vendor selection, garbling policy |
| Aggregation capacity (I) | ↑ always | None | Yes: mentorship, documentation, review practices |

The paper identifies one parameter that is unambiguously welfare-improving without any tradeoff: the size of the knowledge-sharing community. The authors call this aggregation capacity — roughly, how effectively practitioners pool and transmit general knowledge across time and context. Larger communities, better documentation practices, stronger mentorship structures, and deliberate knowledge transfer all raise this parameter without triggering the non-monotone dynamics that apply to AI accuracy.

This is a less glamorous finding than the garbling result, but it is the lever practitioners can actually pull. You cannot easily control how accurate your AI vendor's model is at the point of procurement. You can control whether junior analysts present their reasoning to senior reviewers, whether validation decisions get written up in ways that build the institutional record, and whether the team treats knowledge transfer as a product of the work rather than a distraction from it.

The [HITL checkpoint](post.html?slug=hitl-design) that felt like compliance overhead turns out to have a second function: it's one of the few remaining mechanisms that forces the learning interaction. If agentic AI handles the draft and a human approves the output, that's not the same learning process as a human who worked through the problem and used the AI as a check. The checkpoint matters, but so does what happens inside it.

## What I think I know, and what I don't

The model establishes a non-monotone relationship between AI precision and long-run welfare, and shows that the welfare-optimal policy caps precision below its technical maximum. I find this analytically credible. The economies-of-scope insight (that private learning and public knowledge contribution share the same production function) is the kind of structural observation that doesn't depend on the numerical specifics.

What I can't close is the empirical calibration.[^6] Where is $τ*$ for a credit model validation team? The paper derives it as a function of learning effort elasticity, community size, and how quickly general knowledge depreciates. None of those parameters are observable in the way that asset yields or default rates are. The model tells you the right question to ask without giving you the instrument to measure the answer.

The Stack Overflow evidence is real and the Wikipedia patterns are accumulating. Whether banking institutions are still in the welfare-improving range or have already crossed toward the interior optimum: that I genuinely don't know. What I think I know: the right answer is not to keep purchasing the most accurate model available.

[^1]: del Rio-Chanona et al., "Quantifying the Impact of AI on Knowledge Sharing Platforms," *PNAS* (2024). The study documents a substantial decline in Stack Overflow question volume in the months following ChatGPT's November 2022 launch, with the steepest declines in areas where ChatGPT's answers received the highest user ratings.

[^2]: Acemoglu, Kong & Ozdaglar, "[AI, Human Cognition and Knowledge Collapse](https://economics.mit.edu/sites/default/files/2026-02/AI%2C%20Human%20Cognition%20and%20Knowledge%20Collapse%2002-20-26.pdf)," MIT working paper (February 20, 2026). The model is a rational expectations framework where agentic AI provides context-specific recommendations and individuals choose learning effort given the AI's precision. General knowledge is a community-level state variable that evolves across periods through the aggregation of individual learning efforts.

[^3]: The paper formalizes this in Proposition 13 as an information design result. The regulator solves for the precision-capping rule that maximizes social welfare, taking as given that individuals respond rationally to whatever precision is available to them. The two-phase transition (full suppression followed by capped restoration) is the optimal path when the knowledge stock has already been depleted past the recovery threshold.

[^4]: Lisanne Bainbridge, "Ironies of Automation," *Automatica* 19(6), 775–779 (1983). Bainbridge identified that the more automated a system becomes, the more operators lose the capacity to intervene when automation fails — creating an inverse relationship between automation reliability and operator competence at the moment of failure. The concept is discussed further in the context of AI governance in the [HITL vocabulary post](post.html?slug=hitl-vocabulary).

[^5]: SR 11-7 (April 4, 2011) was the Federal Reserve and OCC's model risk management guidance. It was superseded by SR 26-2 on April 17, 2026. The explicit exclusion of GenAI from SR 26-2 means the institutional knowledge effects described here currently fall outside the formal MRM perimeter. See the [SR 11-7 post](post.html?slug=sr11-7) for a longer discussion of what that supersession leaves open.

[^6]: Lyu et al. (2025) document declines in Wikipedia article quality and edit rates in categories with high AI answer availability, consistent with the knowledge externality mechanism in the Acemoglu et al. model. Both the Stack Overflow and Wikipedia evidence are observational, and other explanations for declining platform engagement are plausible. The model's value is structural — it identifies the mechanism and its welfare implications — rather than claiming precise empirical calibration.
