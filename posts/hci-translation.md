---
title: "The Last Mile That No One Owns"
date: 2026-05-26
description: "NIST AI 800-4 found that human-factors monitoring is the most underdeveloped category of post-deployment AI oversight. The cause is a field-boundary problem with a specific cost."
tags: [human-in-the-loop, banking, regulatory]
---

> **TL;DR:** Four decades of HCI and Human Factors research has produced a body of empirically grounded work on why automation oversight fails — and what can be done about it. That work sits in journals no agentic AI engineering team reads, attached to frameworks no supervisory guidance has cited. NIST AI 800-4 (March 2026) confirms what practitioners already suspect: human-factors monitoring is the most underdeveloped category of post-deployment AI oversight. International regulators have begun crossing this gap — EU AI Act Article 14, MAS FEAT, and the BIS Financial Stability Institute have all produced instruments that address it. US banking supervision has not. Banking's governance frameworks for agentic AI are being built as if Bainbridge was never published, and the ironies keep accumulating.

NIST AI 800-4 was published in March 2026. It synthesized findings from three practitioner workshops (over 200 experts, ten federal agencies among them) and an 87-paper literature review, to map the challenges of monitoring deployed AI systems. It identified six monitoring categories: functionality, operations, security, compliance, ethics/fairness, and human factors.[^1]

Human factors was the category practitioners found hardest to work with. Not the most technically demanding. Not the most resource-intensive. The one where they reported the greatest difficulty collecting information and gauging whether they were doing it at all.

This makes sense if you understand what the human-factors monitoring task actually requires. It is harder to explain if you've been told that "human oversight" is the primary control mechanism for high-risk AI systems.

## The field-boundary problem

The HCI and Human Factors research literature is substantial. Since Bainbridge's 1983 paper, the relevant work includes Sheridan and Verplank on levels of automation (1978), Parasuraman and Riley on automation overreliance (1997), Skitka et al. on automation bias (1999), and Bansal et al. on complementary team performance (2021). These papers appeared in aviation safety and industrial control journals. Model risk practitioners don't read them.

Two disciplines have spent forty years solving the same problem without once citing each other: human factors research and banking model risk management. The HCI literature produces empirical findings on when and how human operators fail to catch automated errors. The MRM literature produces governance frameworks for the same phenomenon. The crosswalk doesn't exist.

The vocabulary gap is not incidental. MRM practitioners use "effective challenge," "ongoing monitoring," and "qualified personnel." HCI researchers use "skill atrophy," "automation bias," "supervisory control," and "situation awareness." Both vocabularies describe the conditions under which oversight of deployed AI systems breaks down, with completely different terms and completely different operational implications. When the vocabulary doesn't connect, governance solutions can look correct from inside the framework while being systematically incomplete from outside it.

The disciplines also don't share career ladders. Building the crosswalk requires credibility in both fields simultaneously, and institutional incentive structures have not historically rewarded that combination. The crosswalk's absence is partly an information-transfer failure and partly a structural one.

## What a crosswalk would look like

The mapping is unbuilt, but not particularly complicated.

| HCI Concept | MRM Equivalent | Monitoring Implication | Owner |
|---|---|---|---|
| Skill atrophy (Bainbridge 1983) | Human override rate | Sustained low override rate in a high-error system flags loss of independent judgment; requires investigation before the next model cycle | Ongoing monitoring |
| Levels of automation (Sheridan-Verplank) | SR 26-2 governance tiers | Each tier requires different controls: alert-fatigue management (LOA 2–3), override-rate tracking (LOA 4–5), full architecture review (LOA 9–10) | Initial validation + governance design |
| Misuse / disuse / abuse (Parasuraman & Riley) | SR 26-2 risk categories | Misuse → model-use risk (§IV); disuse → operational risk; abuse → model-change risk | Three separate owners |
| Automation bias without normative baseline | Human-factors behavioral monitoring | Absent normative baseline, the term identifies a concern the governance framework cannot measure | MRM documentation |

[Bainbridge's skill-atrophy irony](post.html?slug=bainbridge-ironies) maps onto a specific monitoring metric: the human override rate. A credit officer whose model-override rate falls below, say, 5% over a sustained period is exhibiting a skill-atrophy signal. The threshold is illustrative; the underlying concern is a very low override rate in a system that makes consequential errors, which indicates the human is no longer performing independent judgment. The current MRM framework treats a low override rate as a sign the model is working. The human-factors framework treats it as a flag requiring investigation. No empirical baseline for this threshold currently exists in banking; establishing one is precisely what the crosswalk makes possible.

The [Sheridan-Verplank levels of automation](post.html?slug=hitl-vocabulary) map onto SR 26-2 governance tiers. A Level 2–3 system (the computer presents; the human investigates) requires alert-fatigue management and false-positive-rate controls that are meaningless for a Level 4–5 system. At LOA 9–10, the required oversight architecture differs from anything SR 26-2 contemplated, which is why footnote 3 of SR 26-2 simply excludes those systems from scope.[^2]

[Parasuraman and Riley's misuse/disuse/abuse taxonomy](post.html?slug=automation-bias-banking) maps onto risk categories MRM teams already use. Misuse (automation bias) is a model-use risk belonging in ongoing monitoring under SR 26-2 Section IV. Disuse (alert fatigue leading to missed events) is an operational risk belonging in outcomes analysis. Abuse (deploying automation beyond its validated scope) is a model-change risk belonging in change management. The governance infrastructure for this translation already exists; what's missing is the vocabulary bridge.

None of this is waiting for new research. The concepts exist. The empirical baselines exist. What doesn't exist is an institutional owner for the translation.

Practitioners can start without one. Override rate tracking can be added to ongoing monitoring templates now. Documenting the automation tier (LOA 2–3 vs. 4–5 vs. 9–10) in the model inventory creates the prerequisite for tier-appropriate control selection. Classifying human-factors incidents using the misuse/disuse/abuse taxonomy assigns them to existing risk category owners rather than leaving them orphaned.

## The normative model the vocabulary doesn't supply

There is a liability in the "automation bias" framing that the crosswalk should address before it exports the term into governance documentation. Bias is always measured as deviation from a normative baseline; in industry contexts that baseline is almost never specified. Ask a product manager what the analyst's behavior is biased *relative to*, and the conversation typically stops. Gigerenzer and Brighton establish why: a heuristic's accuracy is always relative to the structure of the environment rather than to a universal logical ideal.[^8] The AML analyst running a 96%-false-positive queue who develops rote dismissal patterns may be exhibiting approximately rational behavior given the constraints the system has imposed. The behavior reflects the system design. This doesn't make it costless — missed true positives carry real regulatory weight — but it reattributes the governance problem. If dismissal is locally rational under current system conditions, training the analyst toward careful review is an intervention at the wrong point. The targets are the false-positive rate, the alert design, and the cognitive load the system imposes on the reviewer.

Lieder and Griffiths formalize this into a framework directly applicable to governance design.[^9] They propose "resource rationality" as the appropriate normative standard: the best achievable behavior given actual time and computational limits. Applied to banking AI oversight, a credit officer's override behavior should be assessed against the constraints the deployment imposes, with "what does optimal behavior look like given this system's actual demands?" as the governance question rather than "is this person sufficiently attentive?" Until baselines exist per automation tier and task load, "automation bias" identifies a concern the governance framework cannot measure. That difficulty reflects the absent baseline, which can be specified. The fourth row of the table above is the implication: borrowing the term without specifying the baseline leaves governance with a label it cannot operationalize.

## Where international regulators got further

Three international instruments have moved closer to this crosswalk than US banking supervision has.

| Jurisdiction | Instrument | HCI concept addressed | Binding? | Effective date |
|---|---|---|---|---|
| EU | AI Act Article 14(4)(b) | Detect and address automation bias; operator training | Yes (regulation) | August 2, 2026 |
| Singapore | MAS FEAT + Veritas toolkit | Human oversight operational assessment; co-developed with major banks | Principles-based | 2018–2023 (ongoing) |
| International | BIS FSI Insights No. 63 | Human-in-control framework; expertise requirements for AI-managing staff | Guidance only | December 2024 |
| US banking | SR 26-2 | Human oversight as principle; GenAI/agentic excluded from scope (fn. 3) | Principles-based | April 17, 2026 |

Article 14 of the EU AI Act requires that operators of high-risk AI systems be able to detect automation bias and take steps to address it, with users trained accordingly.[^3] The creditworthiness-assessment use case is explicitly in scope. This is the Parasuraman-Riley misuse failure mode translated into binding regulatory text. The obligation is real: Article 14(4)(b) requires detection and address, and implementing guidance on what "address" requires in practice is still to be developed. EU-supervised banks building credit AI have a regulatory mandate to address what US-supervised banks do not.

The MAS FEAT principles and Veritas initiative (2018–2023) produced operational assessment methodologies for human oversight in financial AI, co-developed with major banks including BNY Mellon, HSBC, DBS, and Standard Chartered.[^4] The Veritas toolkit is open-source and was explicitly designed to be portable; nothing in it is specific to Singaporean banking regulation.

Insights No. 63 from the BIS Financial Stability Institute (December 2024) articulates a "human-in-control" framework, the most explicit human-oversight framing in any international banking-supervisory document.[^5] It calls on authorities to clarify the expertise and skills required for staff managing AI deployments; this is Bainbridge's training paradox in regulatory language. As AI takes over the routine, the humans left with the exceptional cases need *more* expertise, and supervisors need to specify what that expertise looks like.

US prudential banking supervisors have none of this. The research is available. The frameworks are applicable. The field-boundary problem simply hasn't been identified as a governance problem requiring a governance solution.

## The one thing NIST AI 800-4 didn't write

NIST AI 800-4 maps the gaps. It does not fill them. The report explicitly states that it describes challenges to monitoring rather than methods for monitoring; it provides no prescriptive guidance on how to conduct human-factors monitoring because that guidance does not yet exist in a form ready for publication.[^6]

This is the honest position. The gap is real.

What the report establishes is that practitioners deploying AI systems know they cannot do this part. They report the overhead of collecting user feedback as their dominant challenge. Human-factors monitoring's importance is understood. The vocabulary and institutional frameworks to make it tractable are what's missing.

That vocabulary and those methods exist in the HCI literature. They have existed, in empirically validated form, since at least 1997. The crosswalk is the missing piece.

> [!NOTE]
> The NIST Human-Centered AI program ([nist.gov/programs-projects/human-centered-ai](https://www.nist.gov/programs-projects/human-centered-ai)) includes trust-in-automation scale validation explicitly grounded in the ISO 9241-210:2010 human-centered design standard. Combined with the NIST AI RMF's four functions (GOVERN, MAP, MEASURE, MANAGE), this provides the most concrete current US bridge between HCI concepts and AI governance frameworks, though it carries no regulatory force comparable to SR 26-2.

Banking's governance frameworks for agentic AI are being assembled right now, in model risk committees and vendor evaluations and SR 26-2 implementation working groups. The people doing that assembly are capable practitioners working in good faith. They are working without the research that most applies to what they are doing.

Every governance framework built without a crosswalk to the HCI literature will reproduce, in a fourth variant, the ironies Bainbridge identified in the first. Reproducing them is a choice, made by default, by people who haven't been told the choice exists.

The field didn't need to start from scratch. The governance frameworks just did anyway.[^7]

[^1]: NIST AI 800-4, *Challenges to the Monitoring of Deployed AI Systems*, Rao et al. (March 2026), [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-4.pdf). The six monitoring categories are: functionality, operations, security, compliance, ethics/fairness, and human factors. Human factors was identified as the category with the highest practitioner-reported difficulty in collecting and gauging feedback.

[^2]: SR 26-2 (April 17, 2026), footnote 3: "Generative AI and agentic AI models are novel and rapidly evolving. As such, they are not within the scope of this guidance." [Federal Reserve SR2602a1.pdf](https://www.federalreserve.gov/supervisionreg/srletters/SR2602a1.pdf). For the governance vacuum this creates, see [SR 11-7 at Fifteen](post.html?slug=sr11-7) and [Effective Challenge Is Worth Keeping](post.html?slug=effective-challenge).

[^3]: EU AI Act, Article 14, Regulation EU 2024/1689, [artificialintelligenceact.eu/article/14/](https://artificialintelligenceact.eu/article/14/). Article 14(4)(b) specifies that operators must be able to detect and address automation bias; Article 26(4) requires providers to ensure users can interpret AI system outputs. Annex III §5(b) lists creditworthiness assessment as a high-risk use case; obligations under Article 14 apply from August 2, 2026.

[^4]: MAS FEAT Principles (November 12, 2018), [clearyfintechupdate.com](https://www.clearyfintechupdate.com/2018/11/meet-feat-singapores-new-ai-data-analytics-principles-financial-sector/); MAS Veritas Initiative (2019–2023), open-source toolkit at [github.com/veritas-toolkit](https://github.com/veritas-toolkit), program page at [mas.gov.sg](https://www.mas.gov.sg/schemes-and-initiatives/veritas).

[^5]: BIS FSI Insights No. 63, Crisanto, Leuterio, Prenio & Yong, "Regulating AI in the Financial Sector: Recent Developments and Main Challenges" (December 2024), [bis.org/fsi/publ/insights63_summary.pdf](https://www.bis.org/fsi/publ/insights63_summary.pdf).

[^6]: NIST AI 800-4, §3.1.2. The report also flags deceptive AI behavior as an additional monitoring challenge, citing Balesni et al. on models that present as cooperative when monitored while pursuing different goals when detection risks are low.

[^7]: This post closes the Bainbridge's Debt series. The upstream argument for why the HCI debt accumulated is in [Six Pages That Keep Coming True](post.html?slug=bainbridge-ironies). The empirical evidence for the specific failure modes is in [Why 'The Analyst Will Catch It' Is an Empirically Unreliable Control](post.html?slug=automation-bias-banking). For the governance design question (where to put humans, and what that requires), see the [HITL Design post](post.html?slug=hitl-design).

[^8]: Gerd Gigerenzer & Henry Brighton, "Homo Heuristicus: Why Biased Minds Make Better Inferences," *Topics in Cognitive Science* 1(1), 107–143 (2009). The ecological rationality formulation ("the rationality of heuristics is therefore ecological, not logical," p. 116) is the paper's core claim. Bias is defined as "the difference between human judgment and a rational norm, often taken as a law of logic or probability" (p. 117); the resource-rationality framework substitutes a more tractable standard.

[^9]: Falk Lieder & Thomas L. Griffiths, "Resource-rational analysis: understanding human cognition as the optimal use of limited computational resources," *Behavioral and Brain Sciences* 43, e1 (2020), doi:10.1017/S0140525X1900061X. The paper explicitly proposes redefining cognitive bias as "a violation of resource rationality rather than as a violation of logic, probability theory, or expected utility theory" (p. 13), converting the MRM question from "are operators biased?" to "what is the optimal oversight behavior given the constraints this deployment imposes?" The resource-rational standard is "attainable by its very definition" (p. 4), which the Bayesian ideal is not.
