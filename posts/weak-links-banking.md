---
title: "Automating the Wrong Links"
date: 2026-06-04
description: "A new Stanford growth accounting paper shows that in a complementary task economy, output is bounded by the least-automated tasks — the weak links. In banking, those weak links are judgment tasks. The tasks being automated first are not the binding constraints. And following Bainbridge, automating routine practice tasks erodes the human capital the binding constraints depend on."
tags: [economics, banking]
series: ai-economy
---

> **TL;DR:** Jones & Tonetti (2026) show that when production requires complementary tasks, automating most of them leaves output bounded by the remainder — the weak links. Applied to banking: automating document generation, alert triage, and report production doesn't move the binding constraint on institutional performance, which is credit judgment, effective challenge, and regulatory interpretation. Worse, following Bainbridge, the tasks being automated first are the practice tasks that build the judgment the binding constraints require. Small productivity gain. Accelerating skill atrophy in exactly the tasks that limit performance. The two dynamics compound. Each of us has essentially infinite computing power on our desks compared to an economist in 1970. We are not infinitely more productive. Jones and Tonetti formalized why.

In a [May 2026 working paper](https://web.stanford.edu/~chadj/JonesTonetti_Automation.pdf), Jones and Tonetti perform seventy years of growth accounting using a task-based model of the U.S. economy.[^1] Their central mechanism is "weak links": when production requires many complementary tasks — all essential, none substitutable — total output is bounded by the task with the lowest productivity, not the average. Machines have improved roughly 3.8 percentage points per year faster than people in the U.S. private business sector since 1950. Most of that gap has driven TFP growth by expanding the share of tasks performed by rapidly-improving machines instead of slowly-improving humans. But the gains are bounded by the tasks that remain with humans.

The authors demonstrate this with a static exercise: what happens if you fully automate all tasks currently performed by software — with infinite productivity? Software constitutes roughly 2% of U.S. GDP. The answer, under their calibrated model, is that aggregate output rises by approximately 2%. Infinitely productive software raises GDP by about its own GDP share. The remaining 98% of the economy, still organized around human judgment and complementary tasks, keeps constraining output.

That result is not a quirk of extreme assumptions. It follows from a production structure where tasks are complements rather than substitutes — where making one input infinitely abundant doesn't save you if the others remain scarce.

## What weak links actually mean

The technical condition is an elasticity of substitution across tasks below one. Jones and Tonetti calibrate this to σ = 0.2, consistent with decades of empirical estimates of the capital-labor substitution elasticity.[^2] The economic implication: infinite productivity on some tasks leaves total output finite, because the remaining tasks still bind. You cannot route around a weak link by being very good at the other links.

The paper's table of LLM-estimated automation rates across U.S. task categories — calibration inputs for the model, not independently measured workplace statistics — is worth reading carefully. At the bottom of the automation distribution: classroom instruction (21% automated), administering vaccinations (22%), assisting at surgery (22%), basic wound care (22%). At the top: threshing harvested grain (99% automated), executing interbank funds transfers (99%), grain milling (99%), textile spinning (99%).[^3]

| Task | Automation rate (β) |
|------|---------------------|
| Execute interbank funds transfer | 99% |
| Threshing harvested grain | 99% |
| Grain milling | 99% |
| Textile spinning | 99% |
| Classroom instruction | 21% |
| Administering vaccinations | 22% |
| Assisting at surgery | 22% |
| Basic wound care | 22% |

*Source: Jones & Tonetti (2026), Table 3. Tasks involving credit judgment, regulatory interpretation, and effective challenge do not appear in the calibrated table — they fall outside the occupation categories included in the paper's calibration and have not saturated their automation frontier.*

The interbank funds transfer entry is the banking entry on that list. It is nearly fully automated. And it is not the binding constraint on banking performance. The binding constraint is what the institution decides to do with those funds, on what terms, to whom, under what risk parameters. That decision is nowhere near the fully-automated end of the distribution.

The weak links logic says: automating the interbank transfer faster than you already have produces negligible aggregate gains, because it is not what is constraining output. The gains are bounded by the tasks that remain.

> [!QUOTE]
> "In a world of weak links, the benefits of A.I. may arrive slowly while the dangers can arrive quickly."
> — Jones & Tonetti (2026)

## The banking weak links

Think about what is genuinely difficult to automate in a bank — difficult in the way Jones and Tonetti think about task automation: the point where a machine's productivity-per-dollar would need to exceed a human's before substitution becomes rational.

Credit underwriting judgment for non-standard borrowers — the file where the debt service coverage ratio is marginal, the guarantor's history is complicated, and the collateral has a story. [Effective challenge](post.html?slug=effective-challenge) of a model's assumptions when the data generating process has shifted but the validation framework hasn't caught up yet. Regulatory interpretation in genuinely ambiguous situations, where the answer depends on how you read the intent of guidance that was written before the instrument existed. Relationship-based risk assessment — understanding why a borrower's cash flows look the way they do, because you know the business and the market.

In 2011–2013 I did secondary review of high-credit-line small business applications as a second-line risk manager. A credit scorecard summarizes borrower risk into a number; what it can't do is read the story — why margins look thin this year, whether the collateral assumption still holds, what the character and conditions imply about a borrower the model has never seen before. The five C's aren't a checklist; they're a narrative, and reading it requires pattern recognition that accumulates from having worked hundreds of files, not from having optimized a loss function.

These are the banking equivalent of surgical assistance. High judgment, low substitutability, essential to the institution's function. They are also, predictably, the tasks where AI assistance is most carefully circumscribed by governance frameworks — because the stakes of automation failure are highest and the auditability of AI-generated outputs is lowest.

Jones and Tonetti's model says: improving AI productivity on everything else — report generation, document drafting, alert triage, regulatory filing — does not move the binding constraint. The complementary structure of banking work means the institution's performance is bounded by the quality of those judgment calls.

## The Bainbridge collision

![Two-panel whiteboard diagram: left panel shows automated routine tasks (AML triage, credit memo drafting, report generation) with a blue arrow to a small 'productivity gain' box annotated 'weak links bound the gain'; right panel shows binding constraint tasks (credit judgment, effective challenge) in orange; a dashed arrow labeled 'also the practice curriculum' drops from the left panel, turns orange with a red X, and rises as 'skill atrophy' into the binding constraint boxes; stick figure in the gap with speech bubble 'I approved 400 of these. Never had to think about one.'](../img/weak-links-banking-header.png)
*Automating the routine tasks produces gains bounded by the remaining judgment tasks — while simultaneously removing the practice curriculum that builds judgment for those binding constraints. Both dynamics compound.*

Here is where the two literatures converge, and the problem compounds.

The tasks banks are automating most aggressively are the high-volume routine ones: AML alert triage, loan document review, regulatory report generation, internal audit workpapers, credit memo drafting. These are not the binding constraints. But they are the practice tasks.

Working through four hundred AML alerts in a shift — even a shift that feels like a treadmill — teaches you which patterns resolve easily and which ones require judgment. Drafting credit memos teaches you what information is material to a credit decision, because you have to organize it and defend it. Reviewing model documentation builds the intuition that effective challenge requires, because you encounter enough edge cases to develop a feel for where the gaps are. The routine is the curriculum.

Lisanne Bainbridge named the consequence of removing it in 1983: automating the ordinary leaves humans responsible for the extraordinary, without having rehearsed the path.[^4] The skill atrophy is not general disuse — it is the specific loss of the practice that maintained the skill needed for exceptional cases. The more you automate the routine, the more you depend on human judgment for the non-routine, and the less ready that judgment is when called. The RPA wave provides the empirical anchor in banking for this mechanism — and whether the same pathway applies with equal force to judgment-intensive binding constraints like credit underwriting and effective challenge, where expertise may compound through high-stakes case exposure rather than volume repetition, is the open question the final section takes up.

The RPA wave in banking already documented this at scale. Organizations that automated their back-office rules-based tasks through the 2010s produced exception queues staffed by analysts who had never worked the full process — analysts who inherited the hard twenty percent without the daily repetitions that built pattern recognition for it. A decade into deployment, the knowledge was frequently undocumented, the logic was held by people who had moved departments, and successors were processing exceptions they couldn't fully explain.[^5]

The agentic wave repeats this dynamic faster. Agentic AI that drafts credit memos, flags AML alerts for resolution, and generates validation findings changes the marginal return to working through those problems yourself. The AI recommendation is there. You can approve or push back. But pushing back on what basis requires familiarity that accumulates from having done the work, and that is exactly what the automation removes.

> [!QUOTE]
> The routine is the curriculum. Automating it doesn't just change what analysts do. It removes the mechanism by which the next generation learns what good judgment looks like.

## Double jeopardy

The two dynamics are independent but they compound.

You automate the high-volume routine tasks, get productivity gains bounded by the complementary structure of remaining work,[^6] and simultaneously remove the practice substrate for the judgment tasks that are the actual binding constraints. You are moving faster toward a constraint that is harder to push against, because the people responsible for pushing against it have had progressively less practice doing so.

Knowledge collapse adds the third layer.[^7] The Acemoglu, Kong, and Ozdaglar model establishes that this is not just individual skill atrophy — it is a community-level learning externality. Each analyst who defers to the AI recommendation rather than working through the problem is making a rational individual choice. The aggregate of those choices is a depreciation in the institutional knowledge stock that no single person observes or can reverse. The garbling result — that the welfare-optimal policy caps AI precision below its technical maximum — is counterintuitive precisely because this damage is diffuse and invisible until it has already happened. The effective challenge function requires reviewers who have accumulated the competence to mount it. That competence does not accumulate when the practice is automated away.

> [!IMPORTANT]
> **SR 26-2 and the sequencing question.** [SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/sr2602.htm) (April 17, 2026) superseded SR 11-7 as the joint Federal Reserve, OCC, and FDIC model risk management guidance, primarily scoped to banks above $30B in assets. Footnote 3 of SR 26-2 explicitly excludes GenAI and agentic AI from the guidance's scope. SR 26-2's supervisory guidance does not ask which tasks a bank is automating, in what sequence, or what the downstream effects on judgment-intensive work will be. The sequencing question — which tasks to automate first, and what the human capital implications are — is currently outside the guidance's scope for covered institutions.

## The sequencing question

Jones and Tonetti's analysis is at the sector level. The same analysis can be done at the institution level, and the question it asks is one that current governance frameworks do not require.

Which tasks are the binding constraints on this bank's credit performance? On its model risk governance? On its AML effectiveness? The answers differ by institution, by line of business, by the depth of its talent bench in different functions. A bank with a strong junior analyst pipeline in credit has more tolerance for automating credit memo drafting than one where the pipeline is already thin. A pre-SR 26-2 model development team that has maintained rigorous technical depth can absorb AI-assisted documentation drafting differently, likely much more successfully, than one that has never attempted writing model documentation.

The automation sequence that maximizes near-term efficiency is to start with the high-volume, low-judgment tasks — exactly what I suspect institutions are doing. That sequence front-loads the Bainbridge damage, because those tasks are the practice substrate for the binding-constraint tasks. Whether the efficiency gain justifies the human capital cost depends on facts about the institution's current talent depth that no external framework is currently designed to elicit.

The most direct response to the Bainbridge concern is formal training — simulation, mentored case review, and structured rotations designed to preserve skill exposure even as automation removes the on-the-job version. Medicine has evolved exactly this approach: simulation labs and structured deliberate practice maintain procedural competence even when certain procedures have become rare. The question is whether banking governance functions have the institutional incentive, budget priority, and measurement infrastructure to build that substitute before the skill atrophy is measurable. The evidence from the RPA wave is that they didn't — exception queues were staffed before training programs were designed to compensate. That is not an argument against formal training; it is a prior on how often institutions invest in it proactively rather than reactively.

Automating in the other direction — starting with augmenting the binding-constraint tasks rather than eliminating the practice ones — is harder, slower, and more expensive. It requires solving the harder AI problem (augmenting judgment under uncertainty) rather than the easier one (automating routine). It also preserves the practice substrate that develops the judgment being augmented. Whether it produces better institutional outcomes is an empirical question the industry is not yet positioned to answer, because the measurement frameworks for the human capital side of the ledger do not exist.

## What the productivity accounting misses

Jones and Tonetti find that the rate at which human labor productivity improves is approximately 0.5% per year — and that humans stripped of computers are barely more productive than they were in 1950. The NAEP long-term trend assessment for thirteen-year-olds shows essentially zero cumulative progress in reading and mathematics scores since 1973.[^8] Human task productivity is slow, and it has been slow for a long time.

What the accounting cannot capture is whether that 0.5% will hold for the specific subset of tasks that remain in human hands — the binding-constraint tasks — as agentic automation removes the practice substrate that the 0.5% was built on. Judgment tasks may have a different human learning function than routine tasks. If the binding-constraint tasks become harder to staff with competent practitioners because the curriculum for those tasks has been automated away, the effective human productivity growth rate for the binding constraints falls — and the weak link tightens precisely as the institution becomes more dependent on it.

The automation sequence matters. We know how to measure efficiency gains from automating the easy tasks. We do not have the measurement infrastructure to track what that does to the human capital in the hard ones. The question the industry is not asking: in which order are you automating your weak links, and what does that do to the ones that remain?

[^1]: Charles I. Jones and Christopher Tonetti, "Past Automation and Future A.I.: How Weak Links Tame the Growth Explosion," Stanford GSB and NBER, May 2026 (Version 0.5). The paper performs growth accounting using a task-based model for agriculture, motor vehicles, computers, retail trade, software, and the aggregate U.S. private business sector from 1950–2023. Automation rates are estimated via LLM API queries (GPT-5.5 and Claude Opus 4.7, 25 draws each, pooled). The calibrated elasticity of substitution across tasks is σ = 0.2.

[^2]: The meta-analysis by Gechert et al. (2022) finds a mean capital-labor substitution elasticity estimate of 0.3 across the empirical literature. Oberfield and Raval (2021) find 0.5–0.7; Young (2025) finds 0.4–0.5. Jones and Tonetti use σ = 0.2, noting that the task-level elasticity is a lower bound on the observed capital-labor substitution elasticity, because the automation set adjusts endogenously. The weak links structure requires only σ < 1; the specific value affects the magnitude of the gain calculations but not their direction.

[^3]: Jones and Tonetti, Table 3. β is the fraction of tasks in each category estimated to be performed by capital rather than labor, pooled across 50 LLM draws (25 from GPT-5.5, 25 from Claude Opus 4.7). For each task category and period, the LLM is asked to estimate what fraction of work was performed by machines vs. humans — the model serves as a calibration device for historical automation rates where occupational microdata does not exist. "Execute interbank funds transfer" reaches β = 0.989. The fact that interbank transfer automation appears in the same table as grain threshing is itself a data point: both tasks have essentially saturated their automation frontier, and neither is the binding constraint in its respective sector.

[^4]: Lisanne Bainbridge, "Ironies of Automation," *Automatica* 19(6), 775–779 (1983). The full argument — three ironies, four banking waves, and the specific failure modes each wave produced — is developed in [Six Pages That Keep Coming True](post.html?slug=bainbridge-ironies). The sequencing dynamic described here is the economic complement to Bainbridge's human-factors argument: the routine tasks that automation removes are the same tasks that build the judgment the institution still depends on.

[^5]: Eulerich et al. (2024), as cited in [Six Pages That Keep Coming True](post.html?slug=bainbridge-ironies). The direct observation — "bots are often done by some eager person who wants to automate their daily tasks. That person changes the department. Their successor may know more or less what the bot is doing, but the second successor often doesn't have a clue" — captures the generational version of Bainbridge's training paradox: institutional knowledge encoded in automation logic, inaccessible to the people responsible for its exceptions.

[^6]: Jones and Tonetti formalize this in equation (24). With σ = 0.2, the output gain from automating a set of tasks with GDP share s∞ approaches (σ/(1−σ)) × s∞ = 0.25 × s∞ for small s∞. Automating tasks worth 10% of GDP (with infinite productivity) raises output by roughly 2.5%, not 10%. The complementary structure captures most of what linear projections attribute to the automated tasks.

[^7]: Daron Acemoglu, Simon Kong, and Asuman Ozdaglar, "[AI, Human Cognition and Knowledge Collapse](https://economics.mit.edu/sites/default/files/2026-02/AI%2C%20Human%20Cognition%20and%20Knowledge%20Collapse%2002-20-26.pdf)," MIT working paper (February 2026). The model is a rational expectations framework where AI precision determines individual learning incentives, and community knowledge evolves as the aggregate of those learning choices. The welfare-optimal policy caps AI precision below its technical maximum — the garbling result. The banking application, including the MRM junior analyst development example and the effective challenge implication, is developed in [The Economic Case for Inferior LLMs](post.html?slug=knowledge-collapse-economics).
[^8]: National Center for Education Statistics, [NAEP Long-Term Trend Assessment Results: Reading and Mathematics](https://www.nationsreportcard.gov/ltt/), National Assessment of Educational Progress. The long-term trend assessments for 13-year-olds in reading (conducted since 1971) and mathematics (since 1973) show negligible net score movement across five decades, consistent with Jones and Tonetti's estimate of approximately 0.5% annual human-task productivity growth since 1950.
