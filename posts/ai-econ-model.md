---
title: "Econ 101, AI, and the Assumptions That Do All the Work"
date: 2026-04-27
description: "A simple comparative advantage model shows that under the right assumptions, large AI productivity gains make unskilled workers entirely obsolete. Here's where those assumptions crack — and an interactive model to explore it yourself."
tags: [economics, labor]
---

> **TL;DR:** A recent comparative advantage model uses Econ 101 to show that a large enough AI productivity gain makes unskilled workers entirely obsolete — because the time a skilled supervisor saves by not supervising them becomes worth more than their output. The model is elegant and the result is real under its assumptions. But three of those assumptions do most of the work: a fixed supervision ratio, a static skill distribution, and demand that's independent of whether workers are actually employed. Relax any of them, and the story shifts from an inevitable discontinuity to a race between AI productivity growth and the speed of skill diffusion, supervision efficiency, and redistribution.

In January, St. Louis Federal Reserve Economist Oksana Leukhina published a [short blog post](https://www.stlouisfed.org/on-the-economy/2026/jan/why-ai-advancements-may-push-some-worker-out-labor-force) that should make anyone thinking carefully about AI and employment stop and read slowly.[^1] The model requires only Econ 101 to follow — two sectors, two types of workers, one demand constraint — and its core implication is blunt: a sufficiently large improvement in AI productivity can make unskilled workers entirely and optimally unemployed.

The argument is unusually clean. I've been sitting with it for a few weeks, wanting to push on three of its assumptions. I think that pushback makes the model more interesting, not less.

## The Setup

The model is a [comparative advantage economy](https://en.wikipedia.org/wiki/Comparative_advantage) with two sectors: apples and computers. There are 100 skilled workers who can effectively use AI, and 40 unskilled workers who rely on conventional methods. The labels are a simplification — "skilled" means effective at harnessing AI productivity gains, which doesn't map cleanly onto education level or job title.

Productivity per worker:

| Worker type | Apples | Computers |
|---|---|---|
| Skilled (baseline) | 12 | 32 |
| Skilled (advanced AI — 4× gain) | 48 | 128 |
| Unskilled | 9 | 0 |

One structural assumption carries most of the weight: each unskilled worker requires one-fourth of a skilled worker's time for supervision, IT support, and professional inputs. Call this the supervision rate, σ = 0.25.

Consumers want a fixed basket — 8 computers for every 3 apples. The model finds the labor allocation that maximizes output while hitting that ratio.

> [!TIP]
> **Production possibilities frontier (PPF):** A PPF traces every combination of two goods an economy can produce given its resources and technology. Moving along the frontier means reallocating workers between sectors; expanding it means a productivity gain. The demand constraint — 8 computers per 3 apples — picks a single point on that frontier. When AI raises skilled productivity, the frontier expands outward, and the question becomes: how should the economy reorganize labor to reach the new optimal point?

In the baseline, the solution puts all 40 unskilled workers on apples, 10 skilled workers supervising them, 30 skilled workers also on apples, and 60 skilled workers on computers — yielding 720 apples and 1,920 computers.

| | Baseline | Advanced AI (4×) | Net impact |
|---|---|---|---|
| Unskilled workers | 40 | 0 | −40 |
| Skilled (supervision) | 10 | 0 | −10 |
| Skilled (apples) | 30 | 50 | +20 |
| Skilled (computers) | 60 | 50 | −10 |
| Apples output | 720 | 2,400 | +1,680 |
| Computers output | 1,920 | 6,400 | +4,480 |

When AI quadruples skilled productivity, the optimal allocation eliminates unskilled jobs entirely. The logic is tight: one unskilled worker produces 9 apples, but requires 0.25 of a skilled worker's time for supervision. At advanced AI, that quarter-unit of skilled time could instead produce 0.25 × 48 = 12 apples — more than the worker it was supervising. The rational response is to free the supervisor and put them directly into production. Output nearly triples. Forty workers leave the labor force.

## Three Assumptions Worth Arguing With

The model reaches its result cleanly because it's designed to. Three structural assumptions work together to produce the outcome. Change any one of them, and the conclusion changes.

### 1. The supervision rate is fixed

In Leukhina's model, σ = 0.25 is a constant. Every unskilled worker requires the same quarter-unit of skilled time regardless of what AI tools the supervisor has available. But AI is already changing supervision — code review, document analysis, scheduling, routine quality checks are all increasingly AI-assisted. If those tools reduce the skilled time required per unskilled worker, σ falls.[^3]

There's a precise threshold below which the arithmetic reverses. At advanced AI productivity, the break-even condition is σ* = 9/48 = 0.1875. If supervision tools allow one skilled worker to effectively oversee more than five unskilled workers instead of four, unskilled jobs remain viable. Organizations deploying AI management tools aren't just optimizing — they're also, implicitly, betting on which side of that threshold they'll land on.

This is the assumption that feels most tractable to change in the short run. Supervision costs are partly a tooling problem.

### 2. Skills don't diffuse

The model treats skilled and unskilled as fixed, exhaustive categories. In practice, the boundary moves. Workers acquire AI skills through on-the-job exposure, training programs, and gain familiarity with the tools over time — slowly, unevenly, and not without cost, but the distribution isn't static.[^4]

The relevant policy question isn't whether adoption eventually happens but how fast. A model with a fixed skill distribution produces a discontinuous outcome: at some threshold AI productivity, unskilled employment drops to zero in a jump. A model where skills diffuse produces a transition path instead — gradual adjustment rather than a cliff. The shape of that path, and who bears the cost of traversing it, is where training policy, community college curriculum, and accessible tooling enter the picture.

### 3. Demand is independent of employment

This is the assumption I find hardest to hold constant. The model maximizes output subject to a fixed demand ratio. But demand doesn't emerge from nowhere — it's funded by income. If 40 workers exit the labor force without any redistribution of the productivity gains, their purchasing power falls to zero. They stop buying apples. They stop buying computers.[^5]

The productivity gain from eliminating unskilled jobs is real in the model. But in an actual economy, part of that gain gets offset by the demand loss from workers who can no longer participate as consumers. Leukhina flags this directly — the headline result that "AI can raise consumption for everyone" has a conditional on redistribution buried in it. The model proves that a Pareto improvement is feasible; it doesn't model the mechanism by which it happens. That mechanism is policy.

## Explore the Scenarios

I built an interactive version of the model to work through these four cases — the baseline, variable supervision rate, skill diffusion, and demand effects with redistribution. Each tab lets you adjust the key parameter and observe how the production frontier and employment allocation shift.

<div class="model-embed">
  <div class="model-embed-header">
    <span class="model-embed-label">// interactive model &middot; desktop recommended</span>
    <a href="../tools/ai-econ-model.html" target="_blank" rel="noopener" class="model-embed-link">open in new tab ↗</a>
  </div>
  <iframe src="../tools/ai-econ-model.html" height="700" title="AI &amp; Comparative Advantage: An Interactive Model" loading="lazy"></iframe>
  <div class="model-embed-mobile-note">
    This interactive model is best viewed on a desktop browser. <a href="../tools/ai-econ-model.html" target="_blank" rel="noopener">Open it directly →</a>
  </div>
</div>

Tab 1 replicates Leukhina's baseline exactly. Tabs 2–4 each isolate one of the modified assumptions, letting you see how the employment and output results change as you move the parameter away from its baseline value.

## The Math, If You Want It

The four sections below formalize each scenario. Skip them if the prose argument is sufficient.

<details class="math-details">
<summary>Scenario 1 — Baseline model: full derivation</summary>
<div class="math-inner">
<p><strong>Workers and productivity.</strong> Let \(S = 100\) skilled workers and \(U = 40\) unskilled workers. Sector productivities are:</p>
\[a_S^A = 12, \quad a_S^C = 32, \quad a_U^A = 9, \quad a_U^C = 0\]
<p>where superscripts \(A\) and \(C\) denote apples and computers respectively.</p>
<p><strong>Supervision constraint.</strong> Each unskilled worker requires \(\sigma = 0.25\) units of skilled labor time. If \(U_A\) unskilled workers are employed in apple production, then:</p>
\[S_{sup} = \sigma \cdot U_A = 0.25 \cdot U_A\]
<p><strong>Allocation identity.</strong> Skilled workers are split across apples, computers, and supervision:</p>
\[S_A + S_C + S_{sup} = 100\]
<p><strong>Output.</strong> Total apple and computer output:</p>
\[Q_A = a_S^A \cdot S_A + a_U^A \cdot U_A = 12 S_A + 9 U_A\]
\[Q_C = a_S^C \cdot S_C = 32 S_C\]
<p><strong>Demand constraint.</strong> Consumers demand 8 computers per 3 apples:</p>
\[\frac{Q_C}{Q_A} = \frac{8}{3} \implies 3 Q_C = 8 Q_A\]
<p><strong>Solving for U<sub>A</sub> = 40 (full unskilled employment).</strong> Substituting \(S_{sup} = 10\), the demand constraint becomes:</p>
\[3 (32 S_C) = 8 (12 S_A + 360) \implies 96 S_C = 96 S_A + 2{,}880\]
<p>With \(S_A + S_C = 90\), we get \(S_A = 30\), \(S_C = 60\). Outputs:</p>
\[Q_A = 12(30) + 9(40) = 360 + 360 = 720 \qquad Q_C = 32(60) = 1{,}920\]
<p>Check: \(1920/720 = 8/3\) ✓</p>
</div>
</details>

<details class="math-details">
<summary>Scenario 2 — Advanced AI: the obsolescence threshold</summary>
<div class="math-inner">
<p><strong>Advanced AI productivity.</strong> Skilled productivity quadruples: \(a_S^{A'} = 48\), \(a_S^{C'} = 128\). Unskilled productivity is unchanged: \(a_U^A = 9\).</p>
<p><strong>The trade-off condition.</strong> Employing one unskilled worker in apple production generates:</p>
\[\text{Gain: } a_U^A = 9 \text{ apples}\]
<p>But it requires \(\sigma = 0.25\) units of skilled labor for supervision. That skilled time could instead produce:</p>
\[\text{Opportunity cost: } \sigma \cdot a_S^{A'} = 0.25 \times 48 = 12 \text{ apples}\]
<p>Since \(12 > 9\), employing the unskilled worker is net-negative for apple output. Eliminating unskilled jobs and redeploying supervisors into direct production raises total output.</p>
<p><strong>General obsolescence condition.</strong> Unskilled workers are optimally employed if and only if:</p>
\[a_U^A > \sigma \cdot a_S^{A'}\]
<p>The critical supervision threshold is:</p>
\[\sigma^* = \frac{a_U^A}{a_S^{A'}} = \frac{9}{48} = \frac{3}{16} \approx 0.1875\]
<p>At the baseline \(\sigma = 0.25 > \sigma^*\), unskilled workers are obsolete under advanced AI. If \(\sigma < 0.1875\), they remain employed.</p>
<p><strong>Optimal allocation at advanced AI (U = 0).</strong> With \(S_A + S_C = 100\) and the demand constraint \(3(128 S_C) = 8(48 S_A)\):</p>
\[384 S_C = 384 S_A \implies S_A = S_C = 50\]
\[Q_A = 48(50) = 2{,}400 \qquad Q_C = 128(50) = 6{,}400\]
<p>Check: \(6400/2400 = 8/3\) ✓</p>
</div>
</details>

<details class="math-details">
<summary>Scenario 3 — Supervision elasticity: σ(m) = 0.25 · m⁻ᵅ</summary>
<div class="math-inner">
<p><strong>Setup.</strong> Rather than fixing \(\sigma = 0.25\), let supervision costs fall with the AI productivity multiplier \(m\) according to an elasticity parameter \(\alpha \in [0, 1)\):</p>
\[\sigma(m) = 0.25 \cdot m^{-\alpha}\]
<p>When \(\alpha = 0\), supervision costs are fixed regardless of how powerful AI becomes (the Leukhina baseline). As \(\alpha\) rises, AI tools reduce the skilled time required per unskilled worker — modelling AI-assisted management, automated QA, and similar supervision aids.</p>
<p><strong>Deriving the displacement threshold.</strong> Substituting into the obsolescence condition \(a_U^A > \sigma(m) \cdot a_S^{A'}(m)\), where \(a_S^{A'}(m) = 12m\):</p>
\[9 > 0.25 \cdot m^{-\alpha} \cdot 12m = 3 \cdot m^{1-\alpha}\]
\[m^{1-\alpha} < 3\]
<p>Unskilled workers are displaced if and only if \(m > m^*\), where the threshold multiplier is:</p>
\[m^* = 3^{\,1/(1-\alpha)}\]
<p><strong>Breakpoints.</strong></p>
<table>
<thead><tr><th>α</th><th>m* (threshold)</th><th>Implication at m = 4×</th></tr></thead>
<tbody>
<tr><td>0</td><td>\(3^1 = 3\times\)</td><td>Displaced — baseline result</td></tr>
<tr><td>0.5</td><td>\(3^2 = 9\times\)</td><td>Not displaced — result reverses</td></tr>
<tr><td>0.75</td><td>\(3^4 = 81\times\)</td><td>Firmly not displaced</td></tr>
<tr><td>→ 1</td><td>\(\infty\)</td><td>Never displaced regardless of AI gain</td></tr>
</tbody>
</table>
<p><strong>Interpretation.</strong> At \(\alpha = 0.5\), displacement only occurs at AI gains above \(9\times\) — well beyond the blog's \(4\times\) case. At \(\alpha = 0.75\) it requires an \(81\times\) gain. The key insight is that even moderate improvements in supervision efficiency (small increases in \(\alpha\)) shift the threshold multiplier rapidly, because \(m^*\) grows as a power of 3.</p>
</div>
</details>
<details class="math-details">
<summary>Scenario 4 — Skill leveling: a_U(γ, m) = 9 + γ · 12 · (m − 1)</summary>
<div class="math-inner">
<p><strong>Setup.</strong> Let \(\gamma \in [0, 1]\) be a skill diffusion parameter. As \(\gamma\) rises, unskilled workers adopt AI tools, raising their productivity and simultaneously reducing their supervision needs:</p>
\[a_U^A(\gamma, m) = 9 + \gamma \cdot 12 \cdot (m - 1)\]
\[\sigma(\gamma) = (1 - \gamma) \cdot 0.25\]
<p>At \(\gamma = 0\) these collapse to the baseline. At \(\gamma = 1\) unskilled workers are fully AI-effective (same productivity as skilled) and require no supervision.</p>
<p><strong>Obsolescence condition.</strong> Substituting both modifications at AI multiplier \(m\):</p>
\[a_U^A(\gamma, m) > \sigma(\gamma) \cdot a_S^{A'}(m)\]
\[9 + 12\gamma(m-1) > 0.25(1-\gamma) \cdot 12m\]
\[9 + 12\gamma m - 12\gamma > 3(1-\gamma)m\]
\[9 - 12\gamma > m\,(3 - 15\gamma)\]
<p><strong>Displacement threshold.</strong> For \(\gamma < \tfrac{1}{5}\), the right-hand coefficient is positive and we can solve for the critical multiplier:</p>
\[m^* = \frac{9 - 12\gamma}{3 - 15\gamma}\]
<p>For \(\gamma \geq \tfrac{1}{5} = 0.2\), the denominator \((3 - 15\gamma) \leq 0\) and the inequality holds for all \(m\) — unskilled workers are never displaced regardless of the AI productivity gain.</p>
<p><strong>Breakpoints at m = 4×.</strong></p>
<table>
<thead><tr><th>γ</th><th>m* (threshold)</th><th>Implication at m = 4×</th></tr></thead>
<tbody>
<tr><td>0</td><td>\(9/3 = 3\times\)</td><td>Displaced — baseline result</td></tr>
<tr><td>0.1</td><td>\(7.8/1.5 = 5.2\times\)</td><td>Not yet displaced; result weakened</td></tr>
<tr><td>0.15</td><td>\(7.2/0.75 = 9.6\times\)</td><td>Threshold crossed — result reversed</td></tr>
<tr><td>0.2</td><td>\(\infty\)</td><td>Never displaced — denominator vanishes</td></tr>
</tbody>
</table>
<p><strong>Interpretation.</strong> Even modest skill diffusion (\(\gamma = 0.1\)) shifts the displacement threshold from \(3\times\) to \(5.2\times\), meaning the blog's \(4\times\) AI case no longer eliminates unskilled work. At \(\gamma = 0.15\) the threshold reaches \(9.6\times\). The denominator \(3 - 15\gamma\) approaching zero at \(\gamma = 0.2\) reflects a structural shift: once unskilled productivity gains outpace the supervision savings from replacing them, no level of AI advancement justifies their displacement.</p>
</div>
</details>

<details class="math-details">
<summary>Scenario 5 — Demand effects: demand scale = 1 − (1−ρ) · 1/6</summary>
<div class="math-inner">
<p><strong>Income shares at baseline.</strong> In the baseline allocation, unskilled workers contribute 360 apple-units of output out of 2,640 total — approximately one-sixth of aggregate income. When displaced workers receive no redistribution, that sixth of purchasing power disappears from the economy.</p>
<p><strong>Demand scale.</strong> Let \(\rho \in [0, 1]\) be the redistribution rate — the share of displaced workers' lost income that is replaced by transfers. Effective aggregate demand scales as:</p>
\[\text{demand scale} = 1 - (1 - \rho) \cdot \frac{1}{6}\]
<p><strong>Breakpoints.</strong></p>
<table>
<thead><tr><th>ρ</th><th>Demand scale</th><th>Effective demand retained</th></tr></thead>
<tbody>
<tr><td>0% (no redistribution)</td><td>\(1 - \tfrac{1}{6} = \tfrac{5}{6} \approx 83\%\)</td><td>Full output gain, but \(\tfrac{1}{6}\) of consumption capacity gone</td></tr>
<tr><td>50% (partial)</td><td>\(1 - \tfrac{1}{12} = \tfrac{11}{12} \approx 92\%\)</td><td>Half the shortfall recovered</td></tr>
<tr><td>100% (full redistribution)</td><td>\(1\)</td><td>Demand fully preserved — everyone can be better off</td></tr>
</tbody>
</table>
<p><strong>The wedge between output and consumption.</strong> At \(\rho = 0\), the advanced AI economy produces 8,800 combined units vs. a baseline of 2,640 — a \(3.3\times\) output gain. But effective demand is only \(\tfrac{5}{6}\) of that, reducing realised consumption gains. Output rises; the ability to absorb it does not keep pace unless redistribution fills the gap.</p>
<p><strong>Interpretation.</strong> The formula is deliberately simple: the \(\tfrac{1}{6}\) term is the demand shortfall that redistribution must cover. At \(\rho = 1\) the model's optimistic headline — "AI can raise consumption for everyone" — holds exactly. At \(\rho = 0\) it does not. The model does not choose \(\rho\); that is a policy variable. What the formula makes precise is that the gap between the feasible optimum and the no-redistribution outcome is a fixed sixth of total demand — modest enough that even partial redistribution recovers most of it.</p>
</div>
</details>

## What the Model Is Actually Saying

Leukhina closes her post with a line from the MIT Work of the Future task force: "No economic law dictates that the creation of new work must equal or exceed the elimination of old work. Still, history shows that they tend to evolve together."[^6] It's a carefully hedged equivocation. What her model is doing is more specific than that — it's identifying the conditions under which the good outcome depends entirely on choices that aren't automatic.

The three modifications all point in the same direction. Lower the supervision burden and unskilled workers stay employed. Diffuse AI skills more broadly and the "unskilled" population shrinks over time. Keep aggregate demand intact through redistribution and the productivity gain doesn't partly cancel itself. What's interesting is that the first two are at least partially tractable in the near term. Supervision costs fall as AI management tools improve. Skills diffuse if training is accessible and reasonably affordable.

That last part is where this lands personally. In the past, I have taught applied AI tools to graduate and professional students on evenings, alongside a full-time job.[^7] After each semester, the weight of it makes me question why do it? The model's implicit finding — that skill diffusion is the lever that matters most for keeping this from turning into a macro problem — keeps pointing back at the same unglamorous answer. Maybe I just need to keep teaching.

[^1]: Oksana Leukhina, "Why AI Advancements May Push Some Workers Out of the Labor Force," *St. Louis Fed On the Economy* (January 13, 2026), available at [stlouisfed.org](https://www.stlouisfed.org/on-the-economy/2026/jan/why-ai-advancements-may-push-some-worker-out-labor-force).
[^2]: She served as my undergraduate thesis advisor at UNC Chapel Hill. My thesis examined how [demographic change shapes long-run economic growth](https://sites.duke.edu/djepapers/files/2016/10/Wesslen.pdf).
[^3]: AI-assisted supervision tools include LLM-based code review (GitHub Copilot, Cursor), automated document QA, scheduling assistants, and process monitoring dashboards. The degree to which these reduce the skilled time required per supervised worker is an empirical question the field is beginning to study. Acemoglu and Restrepo's task-based model provides the framework: if AI automates tasks within supervision, the effective σ per worker falls.
[^4]: The skill-biased technical change literature (Card and DiNardo 2002; Autor, Levy, and Murnane 2003) documents that skill adoption in response to new technologies has historically taken 10–20 years to fully propagate through the workforce. The rate of diffusion depends on training access, educational infrastructure, and the cost of retraining relative to expected wage gains.
[^5]: The feedback loop between employment and demand is formalized in post-Keynesian economics and in models of secular stagnation. Lawrence Summers and colleagues have argued that demand-side constraints are underweighted in standard productivity-focused models of technological change. The demand shortfall from mass displacement is not a second-order effect — it is the mechanism by which a productivity gain can coincide with a recession.
[^6]: David Autor, David Mindell, and Elisabeth Reynolds, *The Work of the Future: Building Better Jobs in an Age of Intelligent Machines*, MIT Work of the Future Task Force (2020), available at [workofthefuture-taskforce.mit.edu](https://workofthefuture-taskforce.mit.edu/wp-content/uploads/2021/01/2020-Final-Report4.pdf).
[^7]: I have taught as an adjunct, which means the economics of teaching — low per-course pay, no benefits, high preparation overhead — actively discourage sustained engagement at the pace the model's implicit policy prescription would require. The individual cost of skill diffusion is real and is borne disproportionately by those doing the teaching outside of tenure-track positions.
