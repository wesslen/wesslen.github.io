---
title: "Token Transfer Pricing"
date: 2026-05-03
description: "The team running a reasoning model on email filtering isn't making a technical error. They're making a rational response to an internal pricing signal that doesn't exist. Banks built the solution to exactly this problem decades ago. They called it funds transfer pricing."
tags: [banking, evals]
---

> **TL;DR:** When wholesale funding tightens, a bank's treasury doesn't issue a memo telling the mortgage desk to slow down. It raises the internal FTP rate on long-duration assets, and the mortgage desk's spread compresses until the behavior changes itself. No mandate required; the price does the allocation. Banks treating LLM API spend as flat IT overhead are missing exactly this mechanism. Token Transfer Pricing applies the same logic: a central AI platform acts as a computational treasury, absorbs basis risk from external API price volatility, and charges internal departments based on latency tier and usage predictability. The result is allocation by price signal rather than by decree, using a governance structure banks already know how to build.

In March 2026, Jensen Huang told the audience at Nvidia's GPU Technology Conference that he planned to give engineers token budgets as part of their compensation — roughly half their base salary, on top of it. Tokens, he said, are becoming "one of the recruiting tools in Silicon Valley." His logic: engineers with token access are more productive, and attracting engineers who deploy agents well means paying them in the resource agents consume.[^1]

It's a genuine insight into the allocation problem. Tokens are scarce and increasingly valuable — a premium reasoning model's output tokens can run more than 400 times the cost of an ultra-low-cost model's. Individuals with their own allocation tend to use it more deliberately than when drawing from a pooled budget with no visible price tag. Ownership changes behavior.

But Huang's model is individual-level governance. It addresses how to motivate *this engineer* to use AI well. It doesn't address how the institution allocates its total token pool across business units, which use cases justify which model tiers, or what happens when an API price shock makes the entire organizational pool more expensive overnight. Those are organizational-level questions — and they require a different framework.

Imagine a regional bank, mid-cycle, when the wholesale funding market tightens overnight. Repo rates spike. The cost of short-term funding jumps 80 basis points in a session. The treasury's FTP model reprices automatically — internal charges on long-duration assets move with the funding curve. By the next morning, the mortgage desk's spread on 30-year originations has compressed enough that the product is barely worth booking.

Nobody calls the branch managers. Nobody issues an origination freeze. The desk migrates toward adjustable-rate products on its own, because the economics of the fixed-rate book no longer work at the new internal rate.

That's FTP working as designed. Executive control through a pricing mechanism. No mandate required. The scarce resource (wholesale funding) gets allocated to its highest-value use without anyone having to specify what that use is.

Now imagine the same institution gets its Q2 AI API bill and it's forty percent over budget.

What happens next? A memo. An approval workflow requiring sign-off on new API integrations. A freeze on "non-essential" AI projects that nobody can define precisely. Everything except the thing that already works.

## The Token Budget Nobody Owns

Most enterprise AI spending today is governed the way mainframe time was governed in 1975: as a centralized overhead cost pooled across the organization and allocated loosely or not at all. The business unit that builds a customer-facing agent on a reasoning model and the business unit that runs batch compliance summarization on a budget model both draw from the same undifferentiated pool. When the bill arrives, nobody is accountable for the spread between those choices.

The problem isn't the absolute cost; it's the price variance across model tiers that makes the pooling incoherent. As of mid-2026, that spread runs to 420x on output tokens:[^2]

| Model Tier | Input (per 1M tokens) | Output (per 1M tokens) | Output ratio |
|---|---|---|---|
| Ultra-Low Cost (e.g., GPT-5 Nano) | $0.05 | $0.40 | 1× |
| Budget / Mini (e.g., GPT-4o Mini) | $0.15 | $0.60 | 1.5× |
| Standard Flagship (e.g., Claude Sonnet 4.6) | $3.00 | $15.00 | 37.5× |
| Premium Reasoning (e.g., GPT-5.2 Pro) | $21.00 | $168.00 | 420× |

In a high-throughput banking environment, the decision of which model handles which workload is a capital allocation decision dressed up as a configuration setting. The spread matters most for workloads where model tier is a genuine choice, not forced by capability constraints — and in banking, there are more of those than most teams realize.

Cloud computing went through this same transition. The initial land-grab phase treated cloud spend as IT overhead until the bill got large enough that finance noticed. FinOps emerged as the discipline for governing cloud unit economics at the team and feature level. Token economics is following the same curve, except faster and with less visibility, because the cost driver is a behavior (how you prompt, what model you select, whether you cache) rather than a provisioned resource you can see in a dashboard.

## What FTP Actually Solved

Funds Transfer Pricing didn't start as a cost-accounting exercise. It started as a solution to a specific failure mode: business units that optimized their own margins by exploiting gaps in the bank's internal funding rates.[^3]

In the pre-FTP world, a business unit running a long-duration mortgage book could show excellent margins — because it was implicitly borrowing short to lend long, pocketing the term premium, and leaving the interest rate risk with the treasury. The treasury had the exposure; the mortgage desk had the credit. FTP was designed to make that cross-subsidy visible by charging each product the true internal cost of the funds it consumed, adjusted for duration, liquidity, and embedded optionality.

Four mechanics matter for the token parallel: the charge/credit structure (internal pricing for resource consumption), matched maturity (pricing based on duration — or in the token world, latency tier), the liquidity premium (a surcharge for on-demand versus scheduled capacity access), and basis risk absorption (the treasury takes the volatility of external funding markets so business units get stable internal rates to plan against).

The "gold standard" is Matched Maturity FTP: each loan or deposit is matched to a specific point on the bank's internal funding curve, eliminating cross-subsidization between short-term and long-duration products.[^4] A mortgage desk can no longer benefit from a steep yield curve without paying the term premium in its internal funding charge. The price signal carries the policy.

The arbitrage prevention function is the one worth dwelling on. FTP isn't just accounting — it's behavioral design. When the internal rate correctly reflects the cost of the resource, the business unit's incentive is to use it efficiently. When the rate is invisible, the incentive is to consume without constraint.

## Token Transfer Pricing

Applying FTP logic to LLM usage transforms the central AI platform into a computational treasury. The platform "buys" capacity from external providers (or from internal GPU clusters) and "lends" that capacity to internal departments at stable internal transfer prices, absorbing the basis risk of API price volatility that departments can't hedge against individually.[^5]

| FTP Component | Bank Definition | Token Equivalent |
|---|---|---|
| Charge/Credit | Internal rate for borrowing/lending funds | Internal charge per token tier consumed by BU |
| Matched Maturity | Pricing based on loan duration/tenor | Pricing based on latency tier (real-time vs. batch) |
| Liquidity Premium | Cost for on-demand access to liquid funds | Premium for synchronous vs. asynchronous inference |
| Basis Risk Absorption | Treasury absorbs index mismatch volatility | AI platform absorbs external API price swings |
| Arbitrage Prevention | Stops units from gaming the funding curve | Stops units from using reasoning models for mini tasks |

The latency tier mapping is where the insight gets concrete. A customer-facing fraud agent requiring real-time inference is, in FTP terms, a high-liquidity demand: think demand deposit. A batch compliance report running overnight is scheduled and predictable, closer to a term loan. They should carry different internal rates, because they impose different demands on the platform's capacity management. Charging the same blended rate for both is the token equivalent of originating demand deposits and 30-year mortgages at the same internal funding cost.

The AI platform can itself become a profit center (an efficiency accounting center, if not a literal revenue one) on this model. Its margin comes from managing the firm's total compute footprint efficiently: routing the majority of firm requests to budget-tier models, securing committed capacity discounts for predictable workloads, and passing the savings back as lower internal rates. The previously invisible cross-subsidy becomes legible. The fraud team's real-time reasoning workload gets priced at its true cost; the compliance team's batch work gets the discount it earned by scheduling predictably.

## Token Maxing and the Measurement Design Problem

The behavioral risk in a misaligned token economy has a name: Token Maxing.[^6] When AI usage becomes a KPI — when teams are rewarded for demonstrating that they're "AI-integrated" — the predictable response is to optimize what's being measured. Redundant prompting, task inflation, delegation theater. Goodhart's Law at the compute layer. [When a measure becomes a target, it ceases to be a good measure.](post.html?slug=metrics-metrics-metrics)

FTP solved an isomorphic problem in lending. Before internal pricing was right-sized to duration and risk, business units maximized origination volume because that's what their performance metrics rewarded. FTP changed the denominator: volume wasn't the variable, *profitable-after-funding-cost* volume was. The behavior changed because the measurement changed — no policy update required.

The token equivalent is replacing activity metrics (prompts per day, tokens consumed, AI interactions logged) with cost-per-outcome metrics. Not how much compute a team consumed this quarter, but what it produced: reduction in time-to-close on a credit memo, compliance coverage per analyst hour, false-positive escalation rate. This requires metering granularity at the feature or workflow level: department-level budgets tell you a unit overspent but not which workload drove it.[^7] And it requires [effective challenge](post.html?slug=effective-challenge) on model selection before deployment, when the choice can still change: someone whose job it is to ask whether a reasoning model is actually warranted for this task, or whether the team reached for it because it was available at zero marginal internal cost.

## Who Builds the AI Treasury

The governance gap is the same one that runs through every cross-cutting AI problem: nobody owns it cleanly. The AI platform team owns the infrastructure but not the business unit P&L. Finance owns the budget but not the technical levers. The 1st-line business units own the use cases but not the platform pricing. [Guardrails](post.html?slug=guardrails) face the same diffusion: who holds accountability when a system that crosses functional lines produces the wrong result?

A Token Transfer Pricing framework requires three things that don't exist at most institutions yet: a metering layer with granularity below the department level, an internal pricing policy that distinguishes between latency tiers, and an explicit owner — a function that spans AI platform management, financial oversight, and second-line governance, with clear authority to set internal transfer prices. That last element is the hard part. The mechanics are straightforward. The organizational authority to set and enforce internal transfer prices is not — and under SR 26-2, which explicitly excludes GenAI and agentic systems from its scope, the 2nd-line governance seat at that table currently lacks formal regulatory scaffolding. Institutions are working through that gap without guidance.

Banks know what happens when that authority doesn't exist. They wrote the case study in the 1980s.[^8]

[^1]: Jensen Huang, remarks at Nvidia GPU Technology Conference (March 2026), reported in CNBC, ["Nvidia's Huang Pitches AI Tokens on Top of Salary as Agents Reshape How Humans Work."](https://www.cnbc.com/2026/03/20/nvidia-ai-agents-tokens-human-workers-engineer-jobs-unemployment-jensen-huang.html) Huang proposed allocating roughly 50% of base salary in token budgets on top of compensation, describing tokens as an emerging Silicon Valley recruiting tool and productivity multiplier.

[^2]: Model tier pricing as of mid-2026, per Silicon Data, ["Understanding LLM Cost Per Token: A 2026 Practical Guide."](https://www.silicondata.com/blog/llm-cost-per-token) Rates vary by vendor and volume tier; the spread ordering is consistent across major providers.

[^3]: The historical mechanics of FTP and the cross-subsidization problem it was designed to solve are detailed in Moorad Choudhry, ["Best-Practice Funds Transfer Pricing Principles,"](https://btrm.org/wp-content/uploads/2024/09/Choudhry_FTP_ThoughtPiece_Jan2017.pdf) Bank Treasury Risk Management (2017). The core function — making the true cost of funding visible at the product level — is what distinguishes FTP from simple cost accounting.

[^4]: Matched Maturity FTP is described in CostPerform, ["What Is Funds Transfer Pricing in Banking?"](https://www.costperform.com/what-is-funds-transfer-pricing-a-complete-guide-for-banks/) and the Finastra FTP Primer. The key property: each product is matched to a specific point on the funding curve, eliminating term-structure arbitrage at the business unit level.

[^5]: The "computational treasury" framing — central AI platform as clearinghouse, basis risk absorption, internal rate stability — is developed in [Deloitte, "AI Token Spend Dynamics" (2026)](https://www.deloitte.com/us/en/insights/topics/emerging-technologies/ai-tokens-how-to-navigate-spend-dynamics.html)

[^6]: Token Maxing is documented in Ellen Mahloy, ["Token Maxing: When AI Metrics Incentivize the Wrong Work,"](https://medium.com/illumination/token-maxing-when-ai-metrics-incentivize-the-wrong-work-866a63525267) *Medium* (2025). The behavioral patterns — redundant prompting, task inflation, delegation theater — follow directly from rewarding AI usage volume rather than outcomes.

[^7]: Feature- and workflow-level metering is the prerequisite for any chargeback or transfer pricing system. Without it, a department-level budget ceiling tells you a unit overspent but not which workload drove it or whether the spend was justified. See Parsuram, ["FinOps for LLM Systems: Why Every Token Matters in Enterprise AI."](https://medium.com/@parsuram/finops-for-llm-systems-why-every-token-matters-in-enterprise-ai-b16bbf5c068a)

[^8]: The savings and loan crisis is the canonical example. S&Ls funded long-duration fixed-rate mortgages with short-term deposits — implicitly borrowing short to lend long, pocketing the term premium, and leaving duration risk with the institution. There was no internal pricing signal to surface the mismatch. When interest rates spiked in 1979–1982, funding costs exceeded asset yields across the industry. The resolution cost U.S. taxpayers roughly $130 billion. FTP was developed in response to exactly this class of cross-subsidy failure.
