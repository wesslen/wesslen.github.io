---
title: "Who Pays When the Agent Gets It Wrong? A Rail-by-Rail Guide to the Liability Vacuum"
date: 2026-04-25
description: "Your AI agent made a payment that went wrong. Whether you're protected — and by how much — depends almost entirely on which payment rail it used. On the newest rails, the answer may be nobody."
tags: [payments, regulatory]
---

> **TL;DR:** Consumer protection for AI-agent-initiated payments isn't a single gap — it's five different gaps, one per payment rail. Credit card transactions have some protection. Debit and ACH transactions have less, and a specific statutory exception may eliminate it entirely for agentic transactions. Wires have almost none, with the key court case still pending. RTP and FedNow instant payments have none and are irrevocable. Stablecoin transactions, since the GENIUS Act passed in July 2025, have no federal floor whatsoever. The consumer-protection vacuum is worst precisely on the rails that agentic systems have the strongest economic incentive to use.

Say your AI assistant books a flight, and it books the wrong one — non-refundable, wrong city. Or it pays a bill twice. Or it's deceived by a spoofed merchant and sends $800 somewhere it shouldn't go. The question "who is liable for this?" has no clean answer under current U.S. law. The answer depends heavily on which payment rail the transaction traveled. And on the rails where agentic transactions are most likely to flow, the answer increasingly points toward you.

This is the first post in a three-part series on agentic AI in banking payments. [When Agents Talk to Agents](post.html?slug=a2a-risks) covered the delegation and trust problems at the protocol layer — prompt injection, compromised tool calls, unauthorized scope expansion. This series covers what those problems mean downstream: in the consumer's bank account, and in the courtroom.

## The four words at the center of the problem

Regulation E governs electronic fund transfers — the legal framework that says if someone steals your debit card and makes unauthorized purchases, your maximum loss is $50 if you report promptly. It's one of the most important consumer protections in the U.S. payments system. And it has an exception that was written for a specific scenario and now applies to a much broader one.

The exception: Regulation E excludes from the definition of "unauthorized EFT" any transfer "initiated by a person to whom the consumer has furnished the access device."[^1]

> [\!TIP]
> **What is Regulation E?** Regulation E implements the Electronic Fund Transfer Act (EFTA, 15 U.S.C. § 1693), the federal law governing electronic payments — debit cards, ACH transfers, ATM transactions, and most digital payment flows. Its most important consumer protection is the tiered liability cap for unauthorized transfers: $50 if you report within two days, $500 if you report within sixty days, unlimited liability after that. Regulation Z is the equivalent framework for credit cards. Both were written in the 1970s and 1980s.

The exception was designed for a simple case: you hand your debit card to your spouse, your spouse makes purchases, you later claim you didn't authorize them. Congress said you can't use Regulation E to dispute transactions initiated by someone you gave your card to. That's reasonable. The problem is that the same language applies — or may apply — to AI agents.

If you install an AI assistant and grant it access to your bank account, you have arguably "furnished" it access. If the agent then makes a transaction you didn't intend, that transaction may fall outside the "unauthorized EFT" definition entirely, stripping you of the $50/$500 liability cap. Some consumer advocates argue that granting API-level account access is categorically different from "furnishing" a physical or virtual access device — a distinction no court has yet drawn. No federal court has yet adjudicated an AI-agent-initiated transaction under this statute. That makes it the single most consequential untested legal question in consumer payments right now.[^2]

The credit card analog isn't much better. TILA's Regulation Z provides a §1666 billing-error framework (implemented at 12 CFR § 1026.13) that allows consumers to dispute charges within 60 days. But §1666 is drafted around contemporaneous human authorization — the procedures assume a human who reviewed and approved a charge is now claiming error. An AI-initiated transaction where the consumer never saw the specific authorization doesn't map cleanly.

## What protection you actually have, rail by rail

The liability picture isn't uniform across payment types. Here's the honest breakdown:

| Rail | Governing Law | Consumer Liability Risk (AAI Txn) | Dispute Rights | Key Gap |
|---|---|---|---|---|
| **Credit card** | TILA / Reg Z + network rules | $50 statutory cap; zero-liability typical — but "furnished access device" argument applies | §1666 billing error + network chargebacks | No agent-specific reason code; zero-liability policy may exclude delegated transactions |
| **Debit / ACH** | EFTA / Reg E + Nacha rules | Tiered $50/$500/unlimited based on notice timing — "furnished" exception may void all caps | Error-resolution + ACH return rights | Banks may decline agent traffic; "furnished" exception is the fatal structural gap |
| **Wire** | UCC 4A; EFTA applicability unsettled (*NY v. Citibank*) | Historically consumer-borne; recent SDNY ruling could extend EFTA | No consumer chargeback | Second Circuit ruling is the pivotal near-term legal signal |
| **RTP / FedNow** | UCC 4A + operator rules; Reg E applies to credit-push | Reg E applies in theory; "furnished" problem; irrevocable once sent | No true chargeback; no reversal mechanism | **Worst fit for agent errors** — speed + irrevocability is the highest-risk combination |
| **Stablecoin (post-GENIUS)** | GENIUS Act; Reg E effectively inapplicable | No federal floor; no fraud-recovery mandate | Wallet T&Cs only | **Largest gap** — agents may route here for near-zero recourse |

Credit cards are relatively best-protected — the $50 statutory cap, the network zero-liability policies, and the chargeback infrastructure provide meaningful consumer protection. The "furnished" exception is a real risk, but credit card networks have more developed dispute infrastructure than other rails. The outstanding gap is that no agent-specific chargeback reason code exists, so disputes flow through existing card-not-present or fraud categories that don't capture the agent-authorization ambiguity.

Debit and ACH are more exposed. Regulation E's tiered liability caps assume you'll notice the problem quickly and report it. A delegation relationship with an AI agent — where you may not review individual transactions in real time — is a poor fit for the two-day reporting clock. And if you granted the agent account access, the bank has a reasonable argument that you furnished the access device and the cap doesn't apply.

Wires have historically offered consumers almost no protection — UCC 4A treats them as institutional instruments with very limited consumer recourse. The most important pending development is *New York v. Citibank* (S.D.N.Y. 2025), in which Judge Oetken held that EFTA can reach the customer-to-bank leg of online-initiated wire transfers.[^3] Citibank has appealed to the Second Circuit. That reasoning, if affirmed, would apply directly to agent-initiated pushes on the same infrastructure.

> [\!WARNING]
> RTP and FedNow instant payment networks are the worst structural fit for agentic errors. They were designed for speed and finality — transactions typically settle in seconds and are irrevocable. There is no true chargeback mechanism. A human who accidentally clicks "send" on a wire can sometimes call the bank within minutes. An agentic system that misroutes a payment may execute dozens of transactions before any monitoring flag fires. There is no undo button on a settled FedNow transaction, and the "furnished" exception still applies to the delegated authorization that initiated it.[^4]

## The GENIUS Act's consumer protection gap

The GENIUS Act (Public Law 119-27), signed July 18, 2025, is the first U.S. federal framework for payment stablecoins. On the reserve and chartering side it does real work: 100% reserves in cash or short-term Treasuries, monthly attestation requirements, dual federal-state chartering, and a first-priority bankruptcy claim for holders.[^5]

These provisions meaningfully protect consumers against issuer insolvency. What the Act does not establish is any consumer protection floor for fraud recovery. The Act is silent on EFTA applicability. It imposes no mandatory redemption timeline, no federal insurance equivalent, no error-resolution mechanism, and no AAI-specific provisions: no wallet-custody rules for autonomous agents, no authorization standards for machine-initiated transactions, no liability allocation when an agent sends stablecoins to a wrong address.[^6]

The CFPB's January 2025 proposal to extend Regulation E explicitly to stablecoin wallets was withdrawn by Acting Director Vought in May 2025, along with 66 other guidance documents. In practice, no federal statutory framework governs what happens when an AI agent sends stablecoins to the wrong address. The only recourse is the wallet's terms and conditions. State consumer protection laws — particularly California's CCPA and UDAP provisions, and New York's consumer finance authority — may provide residual coverage in some jurisdictions, but no state has yet enacted agent-specific payment protection rules.

The policy implication is pointed: agentic AI systems have economic incentives to route around card rails — lower interchange fees, faster settlement, programmable conditions. The rails with the weakest consumer protection are precisely the ones that offer the most attractive economic terms. (Enterprise deployments built by regulated institutions may default to card rails for liability-management reasons; the routing risk is sharpest for consumer-assembled and third-party agents.) The liability vacuum and the incentive structure point in the same direction.

## What Visa and Mastercard are building — and what it still can't do

The card networks have moved faster than regulators on agentic payments, and credit is due for that. But it's worth being precise about what they've built and what gaps remain.

Visa's Trusted Agent Protocol (TAP), launched October 14, 2025 with Cloudflare, uses IETF RFC 9421 HTTP Message Signatures to attest three things at transaction time: that a specific agent is initiating the transaction, that the consumer has recognized that agent, and that a tokenized payment credential is bound to the transaction. For the first time there's a technical mechanism to say "this transaction came from an identified agent with a recognized relationship to this consumer."[^7]

Mastercard's Agent Pay / Verifiable Intent framework, expanded in March 2026 co-built with Google, goes further on the authorization side. It registers and tokenizes each agent with an issuer, issues cryptographically signed credentials specifying merchant category, spending caps, and time windows, and has signaled two new dispute categories: "agent overreach" (the agent exceeded its mandate) and "mandate repudiation" (the consumer denies authorizing the mandate at all).[^8]

As of April 2026, neither scheme has published enforceable chargeback-rule amendments. Agent-initiated transactions still flow through Visa Core Rules as card-not-present e-commerce, meaning existing CNP chargeback liability continues to apply. Without enforceable rule changes, the private-sector frameworks are architecture without enforcement — and merchants with no clear dispute path are defaulting to blocking agentic traffic entirely.

Both frameworks also assume the agent is a known, registerable entity — something that can be enrolled by an issuer or a developer console. That assumption fails for consumer-built browser agents assembled with tools like [Yutori's Scouts](https://scouts.yutori.com/) or [Claude's Chrome integration](https://code.claude.com/docs/en/chrome). These are individually configured, unregistered, and invisible to the card networks' identity frameworks. The "furnished access device" liability exposure is worst precisely for the agents that are becoming most accessible to ordinary consumers — not enterprise deployments, but one-off browser workflows a person built themselves.

## The reform debate and where it stands

The most developed U.S. reform proposal is Thomas Brown's May 2025 paper, *Paying by Robot*, published via the CPI TechREG Chronicle. Brown argues that the mobile-wallet analogy fails because TILA and EFTA assume contemporaneous human authorization at the moment of each transaction — an agent operating under a standing delegation doesn't provide that. His three proposed fixes: amend the "unauthorized EFT" definition to give delegated agentic transactions clear authorization status; create a tokenization-based mandate safe harbor binding consent to defined parameters; and establish a cross-network liability-allocation regime distributing responsibility based on fault.[^9]

The Consumer Bankers Association's January 2026 white paper proposes private network rules — industry-agreed standards with contractual enforcement, not government mandates — analogous to how NACHA and Visa Core Rules operate today. The Center for Data Innovation takes a different position: clarify through regulatory interpretation that consumer-authorized agents do not waive Regulation E error-resolution rights. Neither approach had legislative momentum as of early 2026.

The most important near-term legal signal is the Second Circuit's ruling in *New York v. Citibank* — expected in late 2026. A ruling for EFTA coverage would significantly strengthen the consumer protection argument for agentic transactions on wire-like rails. A ruling for Citibank would leave the liability vacuum intact and potentially precedent-set the "existing law doesn't cover this" interpretation for agentic transactions broadly. That one ruling matters more than any pending rulemaking.

The deeper structural problem is that consumer-protection gaps are concentrated on precisely the payment rails that agentic systems have the strongest incentives to use. Until that inversion is addressed — through statutory extension or enforceable network rules — consumers who delegate payment authority to AI agents are accepting risks they likely don't know they're taking. The agents know how to route. The law doesn't know how to follow.

*The [next post in this series](post.html?slug=agent-identity-kyc) examines the infrastructure problem underneath the liability gap: banks have no legal category for an AI agent as a party to a transaction, and no established framework for authenticating one.*

[^1]: 12 CFR § 1005.2(m) defines "unauthorized electronic fund transfer" and the "furnished access device" exception. The Electronic Fund Transfer Act is codified at 15 U.S.C. § 1693 et seq. The Consumer Bankers Association's January 2026 Agentic Symposium White Paper provides a thorough analysis of how this exception interacts with agentic delegation, available at [consumerbankers.com](https://consumerbankers.com/wp-content/uploads/2026/01/CBA-Agentic-Symposium-White-Paper-2026-01v2.pdf).

[^2]: The absence of adjudicated precedent on AI-agent-initiated transactions under EFTA or TILA was confirmed as of April 2026. Baird Holm LLP's October 2025 analysis notes that "no federal court has yet adjudicated an AI-agent-initiated transaction under either statute" and characterizes the "furnished access device" exception as "potentially fatal" to Regulation E protection in delegation scenarios. Available at [bairdholm.com](https://www.bairdholm.com/blog/shoppers-paradise-or-nightmare-the-implications-of-ai-shopping-agents-and-agentic-payments/).

[^3]: *New York v. Citibank* (S.D.N.Y. 2025), in which Judge Oetken held that EFTA can reach the customer-to-bank leg of online-initiated wire transfers. Citibank's appeal to the Second Circuit is fully briefed; analysis from [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2025/12/second-circuit-poised-to-rule-on-what-law-applies-to-consumer-wire-fraud). The CFPB withdrew its Statement of Interest in the district court proceedings in 2025, removing federal consumer protection advocacy from the case.

[^4]: Covington & Burling's FedNow overview covers the UCC 4A framework and the irrevocability of settled RTP/FedNow transactions. Available at [cov.com](https://www.cov.com/-/media/files/corporate/publications/2023/08/what-to-know-about-fednows-instant-payments.pdf).

[^5]: GENIUS Act, Public Law 119-27, signed July 18, 2025. Full text at [congress.gov](https://www.congress.gov/119/plaws/publ27/PLAW-119publ27.pdf). Implementation is proceeding through parallel OCC, FDIC, and Treasury NPRMs; the statutory effective date is the earlier of January 18, 2027 or 120 days after final rules are issued. Latham & Watkins overview at [lw.com](https://www.lw.com/en/insights/the-genius-act-of-2025-stablecoin-legislation-adopted-in-the-us).

[^6]: The GENIUS Act's consumer protection gaps are documented in the Stinson LLP analysis at [stinson.com](https://www.stinson.com/newsroom-news-witherspoon-examines-stablecoin-regulation-in-law360) and the Consumer Reports critique at [advocacy.consumerreports.org](https://advocacy.consumerreports.org/press_release/house-passes-genius-act-that-fails-to-protect-consumers-in-stablecoin-market/). The CFPB's January 2025 stablecoin proposal was withdrawn on May 12, 2025, along with 66 other guidance documents.

[^7]: Visa Trusted Agent Protocol announcement, October 14, 2025, at [investor.visa.com](https://investor.visa.com/news/news-details/2025/Visa-Introduces-Trusted-Agent-Protocol-An-Ecosystem-Led-Framework-for-AI-Commerce/default.aspx). Technical analysis at [Oscilar](https://oscilar.com/blog/visatap) and [Sam Boboev's deep dive](https://samboboev.medium.com/deep-dive-the-role-of-visas-trusted-agent-protocol-in-agentic-commerce-2a78e61efce7).

[^8]: Mastercard Agent Pay was initially announced in April 2025; the "Verifiable Intent" expansion was announced March 5, 2026, co-developed with Google. Details at [mastercard.com](https://www.mastercard.com/us/en/news-and-trends/stories/2026/agentic-commerce-rules-of-the-road.html) and [digitalapplied.com](https://www.digitalapplied.com/blog/mastercard-verifiable-intent-trust-agentic-commerce). Finextra comparison at [finextra.com](https://www.finextra.com/blogposting/31107/deep-dive-mastercard-verifiable-intent-vs-visa-trusted-agent-protocol).

[^9]: Thomas Brown, *Paying by Robot: Clearing the Regulatory Obstacles to Agentic Payments*, Paul Hastings / CPI TechREG Chronicle (May 2025). PYMNTS summary at [pymnts.com](https://www.pymnts.com/cpi-posts/paying-by-robot-clearing-the-regulatory-obstacles-to-agentic-payments/). Davis Wright Tremaine's merchant-and-issuer analysis at [dwt.com](https://www.dwt.com/blogs/artificial-intelligence-law-advisor/2025/10/agentic-ai-concerns-for-merchants-and-issuers).
