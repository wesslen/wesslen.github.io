---
title: "Fast Technology, Slow Law, Narrowing Merchants"
date: 2026-05-16
description: "A three-tier banking market is forming around agentic AI. Open banking is in regulatory limbo. Flagship deployments have underperformed. And the U.S. is choosing private ordering over consumer protection at precisely the moment other jurisdictions are going the other direction."
tags: [payments, regulatory]
---

> **TL;DR:** The previous posts in this series mapped two specific gaps in agentic AI payments: liability vacuums across payment rails, and identity infrastructure that can't handle the entity type. This final post steps back and asks what the pattern means at the system level. The answer is a three-tier market forming along regulatory fault lines, an open banking framework that got enjoined at the worst possible moment, flagship deployments that have underperformed their launch claims, and a U.S. regulatory posture betting on private ordering and case-by-case litigation to do the work that consumer protection legislation would otherwise do. That bet may be correct. The risk is not evenly distributed.

The five-word summary of where agentic AI in banking payments stands today is borrowed from the research that frames this series: **fast technology, slow law, narrowing merchants.**

The technology half has been moving quickly and visibly. Visa TAP launched in October 2025. Mastercard Verifiable Intent shipped in March 2026. Google's Universal Commerce Protocol debuted at NRF in January 2026. Three prior posts in this series have documented what the law and identity infrastructure half looks like. This post is about the "narrowing merchants" half, and what it means for the competitive structure of the industry and the consumers moving through it.

## A three-tier market is forming, and regulation is the moat

Something structural is happening to the U.S. banking market around agentic AI, and it has less to do with technology capability than with data access and regulatory position.

Tier 1 (money-center banks: JPMorgan Chase, Citi, etc.) is simultaneously building proprietary AAI capability and monetizing external access to their customer data. JPMorgan confirmed approximately 1.89 billion monthly third-party data requests on its Q2 2025 earnings call and began charging for them in late June 2025. Initial proposals reportedly totaled up to $300M annually, though negotiated pricing came in lower after deals with Plaid, Yodlee, Morningstar, and Akoya covered more than 95% of third-party pulls by mid-November 2025.[^1] The higher pricing tiers are for payments-related data pulls — exactly the high-frequency refresh that AAI requires.

Tier 2 (fintechs and neobanks: Chime, SoFi, Block/Square, PayPal/Venmo) has AAI-native infrastructure through Plaid, MX, and Stripe, but now pay to reach Tier 1 customer data at rates set by the banks they're competing with. Plaid launched an MCP server for external agents in June 2025 and positions "Plaid Intelligence" as an agentic commerce identity and wallet-funding layer. It is now paying JPMorgan for the data access its business model requires.

Tier 3 (community banks and smaller credit unions) lacks the engineering resources to build FDX-compliant APIs at all. Approximately 62% of community banks struggle to integrate multi-source data, per a 2025 industry survey, and ICBA has lobbied for an exemption for banks under $10B from the most burdensome open banking requirements.[^2]

The three-tier structure describes the institutional market. But a fourth category is growing outside it entirely: consumer-built agents assembled individually using tools like [Yutori's n1 model](https://yutori.com/blog/introducing-n1) or [Claude's Chrome integration](https://code.claude.com/docs/en/chrome). These are not enterprise deployments: personally configured browser workflows that individual consumers create to automate financial tasks, bill payment, and purchases. They don't appear in any tier, they can't be registered with card networks, and no identity or liability framework currently addresses them. The volume is still small, but the tooling is becoming accessible enough that this category will grow faster than any of the three tiers above it.

Whether this three-tier structure produces durable competitive advantage depends on what happens to the regulatory framework that could constrain it — which is where Section 1033 enters. (FDX — the Financial Data Exchange — is the CFPB-recognized standards body for open banking data sharing in the U.S.; building compliant APIs is trivial for Tier 1 banks and a real burden for community banks.)

## Section 1033: enjoined at the worst possible moment

The CFPB's October 2024 Personal Financial Data Rights rule (the U.S. implementation of open banking rights under Section 1033 of the Dodd-Frank Act) was designed to give consumers and their authorized representatives a legal right to access their own financial data in machine-readable form. For agentic AI, this was the floor: without a clear data access right, an AI agent acting on a consumer's behalf has no guaranteed way to retrieve the account data it needs to function.

The rule faced immediate legal challenge. The CFPB ultimately abandoned its defense, pivoting from defending it to asking the court to stay litigation pending reconsideration, and Judge Danny C. Reeves granted a preliminary injunction on October 29, 2025, staying compliance deadlines.[^3] The court's reading of the statutory term "representative" is the critical detail: the court held that "representative" under § 1033 likely requires a fiduciary-like relationship, which would exclude commercial third-party aggregators from the statutory right of access.

If that reading holds in a revised rule, AI agents routed through aggregators like Plaid would lose any statutory right to the data they need, dependent entirely on whatever commercial terms Tier 1 banks choose to offer. The CFPB signaled in December 2025 that it would issue an interim final rule rather than a full NPRM, then missed its own December 2025 target. As of May 2026, no new rule has been published. Data access for agentic systems is currently governed by private commercial agreements. Federal consumer protection law plays no role.

The FDX Agentic AI initiative (launched April 14, 2026, Call for Input due May 29, 2026) covers agent identification, consent delegation, and data security. As the CFPB-recognized standard-setting body under Section 1033, its specifications carry weight in examination and in any eventual revised rule. The participation quality will indicate whether the industry is serious about self-regulation or waiting for something else to force the issue.

## What the flagship deployments actually produced

The headline deployments of 2025 have produced more data about what doesn't work than about what does. The most important data point is OpenAI's March 2026 pullback of ChatGPT Instant Checkout.

Launched September 29, 2025 with Etsy, Shopify, Walmart, Target, and Expedia integrations via the Stripe-co-built Agentic Commerce Protocol, the product is now redirecting users to merchant apps rather than completing checkout natively. According to *The Information*, only 12–30 Shopify merchants went live out of millions available; OpenAI had not built state sales-tax remittance infrastructure; conversion was poor due to single-item carts, no discount code support, and stale product data. OpenAI's own statement: "the initial version of Instant Checkout did not offer the level of flexibility that we aspire to provide" drew a TD Cowen analyst note calling it an unexpected concession. Forrester's March 2026 ConsumerVoices research found that completing a purchase within an AI answer engine was consumers' least-adopted agentic use case.[^4]

The other deployments are in earlier stages with limited independent metrics. Amazon attributed roughly $12 billion in 2025 sales to its Rufus AI assistant, though this figure is self-reported and includes discovery as well as transaction completion. No error rate, dispute rate, or fraud rate data has been published for any major deployment.[^5]

That absence of data is not a minor gap. It means the vendor-favorable claims — "hundreds of secure AI transactions," Coinbase x402's aggregated 140 million agentic transactions — cannot be independently evaluated. Visa Group President Oliver Jenkyn warned in December 2025 that "2026 will, unfortunately, see a material increase in the sophistication and volume of AI-powered identity attacks." Mastercard's 2026 global fraud estimate exceeds $485 billion but is not AAI-specific. Until independent dispute-rate data exists, the risk profile of agentic payments is genuinely unknown.

Shopify's position has become the industry's most-cited merchant control model. Its July 2025 robots.txt update stated: "Checkouts are for humans. Automated scraping, 'buy-for-me' agents, or any end-to-end flow that completes payment without a final review step is not permitted." This reflects the merchant-side response to the authorization ambiguity documented throughout this series. Sanctioned exceptions flow through the Agentic Storefronts Supplemental Terms, covering ChatGPT, Copilot, Google AI Mode, Gemini, and Perplexity via PayPal. Merchants not on the approved list are treated as agentic traffic to be blocked.

The structural reason merchants are narrowing is the one Davis Wright Tremaine identified in October 2025: without a reliable, accepted proof-of-authorization model, fraud controls block agentic transactions by default. Until Visa TAP or Mastercard Verifiable Intent produce enforceable chargeback-rule amendments, merchants have no commercial reason to accept the risk.

## The U.S. vs. EU divergence and what it means for practitioners

The U.S. and EU are taking fundamentally different approaches to the same regulatory problem, and the divergence has practical consequences for any bank or fintech operating across both markets.

The EU's approach is layered and prescriptive. MiCA (fully applicable since December 2024) imposes hard caps on significant non-EUR stablecoin transactions to protect monetary sovereignty. PSD3/PSR explicitly permits and regulates delegated Strong Customer Authentication. The AI Act classifies credit scoring AI as high-risk with binding documentation and oversight requirements effective August 2026. The eIDAS 2.0 digital identity wallet mandate creates government-rooted verifiable credentials by December 2026. None of these frameworks specifically address AAI, but together they create structural friction (and accountability) that the U.S. system doesn't require.[^6]

The U.S. approach is permissive and litigation-dependent. Congressional testimony in January 2026 favored applying "existing principles" to the agentic context. ETA formally opposed new legislation. The Consumer Bankers Association endorsed private network rules as the preferred mechanism. The administration's pro-innovation posture, codified in Executive Order 14179 (January 2025, revoking the Biden-era EO 14110 on AI safety), reinforces a lighter-touch federal stance.

Trans-Atlantic friction follows for any institution building agentic payment products at scale. A product that relies on AAI-initiated stablecoin transactions needs to comply with GENIUS Act reserve requirements in the U.S., MiCA transaction caps and reserve rules in the EU, HKMA custody requirements in Hong Kong, and the UK FCA's forthcoming stablecoin framework. Products designed for U.S. permissiveness will have structural barriers to EU deployment, and vice versa.

## What to watch in 2026–2027

Five developments will substantially shape agentic payments over the next eighteen months.

The **Second Circuit ruling in *New York v. Citibank*** will determine whether EFTA reaches the customer-to-bank leg of online-initiated wire transfers, and the reasoning will be applied directly to agent-initiated pushes on RTP, FedNow, and similar rails. It's the single most important near-term legal signal in this space.

The **CFPB's revised Section 1033 rule** will resolve whether AI agents routed through aggregators qualify as statutory "representatives" with a right of access, and whether data-access fees are permitted. If the revised rule adopts the court's fiduciary-relationship reading, Tier 1 banks' data fee advantage becomes structural and permanent.

**GENIUS Act implementation rules** (expected late 2026 to early 2027 from OCC, FDIC, and Treasury) will either fill in the consumer-protection gaps the statute left open or confirm they remain open. The most important question is whether any AAI-specific provisions appear: wallet-custody standards for autonomous agents, authorization standards for machine-initiated stablecoin transactions, liability allocation for agent errors.

**The first published fraud and dispute-rate data** from Visa Intelligent Commerce, Mastercard Agent Pay, or Google AP2 pilots will either validate or undercut the private-sector safety case. Actual numbers will force a reckoning that the current absence of data is preventing.

**The FDX Agentic AI Call for Input** (response deadline May 29, 2026) is the live near-term process most likely to produce usable standards on agent identification and consent delegation. Its outputs are voluntary, but as the CFPB-recognized standard-setting body, its specifications carry weight in examination.

## The honest accounting

This series has covered a lot of institutional ground: MRM frameworks, payment rail liability, identity infrastructure, market structure, open banking, deployment performance. The honest accounting compresses to a few sentences.

The technology is real and it's moving. The card network frameworks are genuine progress on the authentication and authorization problem. The stablecoin infrastructure is scaling. Agentic commerce is arriving.

The consumer protection infrastructure is not keeping pace. The liability gaps documented in the [first post](post.html?slug=payments-liability-gap) are real and largely unlitigated. The identity gaps documented in the [second post](post.html?slug=agent-identity-kyc) are structural. Neither has a regulatory solution on any near-term horizon.

The risk isn't evenly distributed. Tier 1 banks are positioned to benefit from regulatory uncertainty as a competitive moat. Tier 3 community banks and their customers are most exposed to the infrastructure gaps. And consumers who delegate payment authority to AI agents, on instant payment or stablecoin rails, are accepting risks that neither they nor the agents fully understand.

The right question before deployment isn't "is this product legal?" It's "when something goes wrong, and something will go wrong, do the people most exposed to the consequence have any meaningful recourse?"

Right now, on the newest rails, the honest answer is often no.

[^1]: JPMorgan data fee regime: Fortune reporting on the ~$300M annual estimate at [fortune.com](https://fortune.com/2025/07/16/jpmorgan-chase-fees-fintechs-plaid-finicity-crypto-wall-street-citigroup-bank-of-america-wells-fargo/); CNBC confirmation of negotiated deals covering 95%+ of pulls at [cnbc.com](https://www.cnbc.com/2025/11/14/jpmorgan-chase-fintech-fees.html); Payments Dive on Plaid's pricing arrangement at [paymentsdive.com](https://www.paymentsdive.com/news/plaid-to-pay-for-jpmorgan-data-open-banking-fintechs/760192/).

[^2]: Community bank statistics: ICBA's lobbying for an exemption for banks under $10B at [icba.org](https://www.icba.org/w/court-halts-1033-rule-compliance-deadline). The 62% community bank figure comes from a 2025 industry survey cited in the deep research on banking market structure.

[^3]: *Forcht Bank v. CFPB*, No. 5:24-cv-00304-DCR (E.D. Ky.). Moore & Van Allen analysis of the preliminary injunction at [mvalaw.com](https://www.mvalaw.com/data-points/cfpb-enjoined-from-enforcing-personal-financial-data-rights-rule-1033). ABA Banking Journal on the "representative" holding at [bankingjournal.aba.com](https://bankingjournal.aba.com/2025/11/kentucky-federal-court-enjoins-cfpb-from-enforcing-current-1033-final-rule/).

[^4]: OpenAI Instant Checkout pullback: *The Information* reporting on the ~12-30 merchant live count and tax infrastructure gap; TD Cowen analyst commentary; Forrester ConsumerVoices research (March 2026). The Stripe collaboration on the Agentic Commerce Protocol is documented in Stripe's blog at [stripe.com](https://stripe.com/blog/10-lessons).

[^5]: Amazon "Buy for Me" expansion figures (65K to 500K SKUs) and the $12B Rufus attribution are from Amazon's self-reported data. No independent verification or error-rate disclosure existed at the time of publication. The Coinbase x402 secondary-aggregated figure of 140 million agentic transactions is from the x402 foundation announcement; the methodology for this figure has not been independently verified.

[^6]: EU regulatory stack: MiCA overview from [Hogan Lovells](https://www.hoganlovells.com/en/publications/the-eus-markets-in-crypto-assets-mica-regulation-a-status-update); MiCA vs. GENIUS Act comparison at [eu.ci](https://eu.ci/mica-vs-genius-act-2025/). Morgan Lewis fiat-backed stablecoin regulatory comparison across UK, EU, Hong Kong, and U.S. at [morganlewis.com](https://www.morganlewis.com/pubs/2025/06/fiat-backed-stablecoin-regulation-compared-uk-eu-hong-kong-and-us). Executive Order 14179 (January 23, 2025) revoking EO 14110 at [federalregister.gov](https://www.federalregister.gov/documents/2025/01/31/2025-02172/removing-barriers-to-american-leadership-in-artificial-intelligence).
