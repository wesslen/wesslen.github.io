---
title: "The Identity Problem: Banks Don't Know Who Your AI Agent Is"
date: 2026-04-25
description: "Banks are legally required to know their customers. But the Customer Identification Program rule was written for humans and legal entities. An AI agent is neither — and no banking law has a category for it."
tags: [payments, regulatory]
---

> **TL;DR:** The Customer Identification Program rule requires banks to verify the identity of every customer before opening an account or allowing transactions. It specifies the required customer identity data (name, date of birth, current address, and tax ID), and those elements apply to natural persons and legal entities. Software agents occupy neither category. No AAI customer category exists in U.S. banking law. Banks are currently extending a 2021 authentication guidance document written for machine and device credentials to cover AI agents without new formal rules. The card networks have built competing identity frameworks to fill part of this gap. None of them have been tested in a regulatory examination or a court case.

The [previous post in this series](post.html?slug=payments-liability-gap) established a specific problem: when an AI agent makes a payment that goes wrong, the consumer protection framework is largely inadequate — and the gaps are worst on the rails that agentic systems have the strongest incentive to use. That problem has a structural precondition I haven't covered yet: before you can allocate liability for a bad transaction, you need to know who — or what — you're dealing with.

Banks have a legal obligation to answer that question. The problem is that the law doesn't contemplate the entity type they're being asked to identify.

## The CIP rule and why it doesn't fit

That rule, codified at [31 CFR § 1020.220](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1020/subpart-B/section-1020.220), requires every bank to develop and implement a written CIP as part of its Bank Secrecy Act compliance program. The requirements are specific: before opening an account, the bank must collect minimum identifying information (full legal name, date of birth, residential address, and taxpayer identification number) and take "reasonable steps" to verify the customer's identity.[^1]

> [!TIP]
> **What is CIP?** CIP is the "know your customer" requirement at account opening — mandated by the USA PATRIOT Act (2001) and implemented through joint rulemaking in 2003. Every federally regulated bank must have a written CIP that specifies how it will collect and verify customer identity before opening new accounts. The purpose is anti-money laundering and counter-terrorism financing. CIP is separate from ongoing transaction monitoring and separate from customer due diligence for higher-risk customers.

Those four data elements are defined for two entity types: natural persons and legal entities. CIP interpretive guidance establishes that in agency situations, the bank must obtain identifying information for the principal. What the agent does is a matter for the principal to document.

An AI agent is neither a natural person nor a legal entity. It has no date of birth, no address, no taxpayer identification number in any conventional sense. It is software operating on behalf of a principal — but which principal, and with what scope of authority, may not be determinable from the transaction itself. No U.S. banking law has an AAI customer category. No regulatory guidance has created one.

The CIP gap has a specific downstream consequence for liability. If a bank cannot identify an AI agent as a distinct party to a transaction (with its own registered identity, scope of authority, and authorization record), then the only party the bank knows it's dealing with is the account holder. When something goes wrong, the entire dispute pathway runs through the account holder, regardless of whether the account holder actually instructed the specific transaction. This is part of why the "furnished access device" exception in Regulation E is so consequential: the bank sees a transaction originating from a known account, with no record of which agent initiated it or under what authorization.

The current framework may be adequate for enterprise-deployed agents operating at current scale — where the account holder relationship is clear and disputes route predictably — but it breaks specifically for the consumer DIY agent category and high-volume delegated action scenarios where authorization scope is genuinely ambiguous.

## FFIEC authentication guidance and the stretch problem

If CIP is the account-opening framework, FFIEC authentication guidance is the ongoing-access framework. The Federal Financial Institutions Examination Council's 2021 Authentication Guidance is the key supervisory document for how banks should manage authenticated access to their systems and services.[^2]

The 2021 guidance was designed for human users and managed system credentials. It predates autonomous agents as an entity class. Its framework for non-human authenticated principals covers the service accounts and device credentials that enterprises register and manage centrally; it states that banks should implement individual identity credentials, access controls, and risk assessments for each.

The consistent finding across published comment letters and reported examiner communications is that examiners are extending this "applications and devices" category to cover AI agents without new formal guidance, without a rulemaking process, and without a comment period. Each examiner is applying their own interpretation of how the 2021 framework maps onto an entity type that didn't exist when the guidance was written. The result is supervisory inconsistency: banks in different districts may receive different examination findings for materially similar agent deployments.

> [!WARNING]
> The examiner-by-examiner extension of the 2021 FFIEC guidance to AI agents means that banks have no reliable way to know in advance whether their agent identity and authentication architecture will satisfy examination. FinCEN's November 2024 Alert FIN-2024-A004 (on GenAI-enabled deepfakes being used to circumvent KYC verification) raises rather than lowers the authentication bar. Banks are operating in a guidance vacuum on a question that examiners are actively examining.

## Two competing visions for agent identity

The card networks have moved into this vacuum with competing frameworks that represent genuinely different design philosophies about what "agent identity" means.

Visa's Trusted Agent Protocol takes an identity-first approach. An agent registers with Visa and receives a durable credential. When it initiates a transaction, it signs the HTTP request with that credential using IETF RFC 9421 HTTP Message Signatures, attesting: this specific agent is initiating this transaction, this consumer has recognized this agent, and this tokenized payment credential is bound to this transaction. TAP's core question is whether this specific agent can be identified and whether a consumer has acknowledged it.

Mastercard's Agent Pay / Verifiable Intent framework takes an intent-first approach. Rather than certifying the agent's identity alone, it certifies the agent's authorization scope. The issuing bank registers the agent and issues it cryptographically signed, short-lived SD-JWT credentials that specify exactly what the agent is permitted to do: merchant category codes, spending caps, time windows, and five additional constraint types registered as first-class authorization limits. Mastercard's framework asks a different question: what is this agent authorized to do, and does this transaction fall within that scope?[^3]

Both questions matter. An authenticated agent can still exceed its mandate. A well-scoped mandate can be executed by an impersonator. The industry is building toward a stack where both are present, but as of April 2026 neither scheme has been tested through a formal regulatory examination or a court dispute.

### The invisible agent: consumer DIY and the framework gap

Both frameworks share a structural assumption: the agent is a known, registerable entity — something an issuer, a network, or a developer console can enroll and credential. That assumption breaks for a growing category of agents that no enterprise deployed. Tools like [Yutori's Scouts](https://scouts.yutori.com/) and [Claude's Chrome browser integration](https://code.claude.com/docs/en/chrome) let individual consumers build and run their own computer-use agents that are personally configured, unique per user, with no enrollment in any financial network or developer console. A consumer who assembles a browser agent to automate bill payments has "furnished access" to their account in the Regulation E sense, but there is no Visa TAP credential for that agent, no Mastercard-registered mandate, no issuing bank that certified its scope. These decentralized, DIY agents are invisible to every identity framework currently being built.

When something goes wrong with a DIY agent transaction, the failure mode is specific: there is no agent identity record for the bank to examine, no authorization scope to check against, and no enrollment event to produce in a dispute. The dispute process runs through the account holder, who may have authorized the agent in general terms without specifying this particular transaction. The bank cannot distinguish "account holder authorized this" from "account holder authorized an agent that exceeded its understood scope" because neither the agent nor its scope was ever registered. As browser-based computer-use tools proliferate, this represents a rapidly growing category of agentic payment activity that the frameworks currently being built were not designed to reach.

The OpenID Foundation's draft OpenID Connect for Agents (OIDC-A) 1.0 specification is the leading public standards work on agent identity more broadly.[^4] It extends the existing OIDC protocol (the same standard used for "Sign in with Google") to accommodate agent-on-behalf-of-human delegation with explicit authorization scope and defined revocation mechanisms. It remains an individual contributor draft, still awaiting formal OIDF Working Group adoption. No major banking institution has adopted it.

## MCP in banking: useful in fintech, dangerous in core banking

The Model Context Protocol, originally developed by Anthropic and now widely adopted, is rapidly becoming the standard interface for AI agents to access external data and services. In financial services, the deployments are visible: Plaid launched an MCP server for external agents in June 2025, Bud Financial launched a transaction enrichment server, Modern Treasury built a payment-ops server, and Anthropic partnered with LSEG in November 2025.[^5] The protocol is attractive because it gives agents a standardized way to connect to financial data without custom integrations for every source.

"Widely adopted in fintech" and "safe for core banking" are not the same thing, and the security research is not reassuring.

A June 2025 empirical study of 1,899 open-source MCP servers found that 7.2% had general security vulnerabilities and 5.5% exhibited MCP-specific tool poisoning vulnerabilities — where a malicious server injects instructions that cause an AI agent to take unauthorized actions.[^6] CVE-2026-33032 (CVSS 9.8), a critical vulnerability in an Nginx-ui MCP integration, was actively exploited in production. The empirical record is not favorable.

Several vulnerability classes appear most frequently in MCP deployments: confused deputy attacks, token passthrough, session hijacking, and over-broad scope grants. These stem from the protocol's authentication model and reflect patterns common across tool-calling interfaces rather than careless one-off implementations. (For the supply chain angle on how these vulnerabilities propagate through skills and plugin ecosystems, see [Skills Are Code: The Supply Chain Problem Nobody Wants to Own](post.html?slug=skills-supply-chain).) JPMorgan's CAO has publicly identified "access management and entitlements of agents" as "an unsolved problem needing industry uplift," a candid acknowledgment that MCP access control falls short of production banking requirements even at the most sophisticated institutions.[^7]

## What good design looks like — lessons from outside the U.S

The most useful design patterns for agentic authentication come from sectors and jurisdictions that have already grappled with delegated authority at scale.

Under eIDAS 2.0, each EU member state must deploy government-rooted digital identity wallets to all eligible citizens by December 2026, with private-sector acceptance mandated by December 2027.[^8] The relevant design feature: an AI agent acting on behalf of a citizen could present a cryptographically signed, government-issued credential establishing both who the principal is and the scope of the agent's delegation. There is no U.S. analog to this infrastructure.

PSD3/PSR, the EU's proposed payment services legislation currently in final negotiations, would explicitly permit delegated Strong Customer Authentication as regulated outsourcing, meaning a consumer could authorize a third-party provider to authenticate transactions on their behalf, within a defined scope, with clear regulatory accountability. This is the legal foundation that agentic payments need and that U.S. law currently doesn't provide.

The UK Variable Recurring Payments scheme is the closest existing production analog to agentic delegated payments. It works because it has all three required elements: explicit consumer authorization, defined scope constraints, and a clear revocation mechanism at the originating bank. Agentic payment architectures in the U.S. are trying to build equivalent functionality through private network rules without the regulatory foundation.

SMART on FHIR's scope design — the standard used for delegated access to medical records — offers a technical template.[^9] The FHIR scope syntax creates machine-readable, auditable permission grants at the resource level. A banking analog might look like `agent/account.transact.limit=$500.merchant=grocery`. The scope is specific, constrained, auditable, and revocable. No U.S. bank has published a production version of this architecture — the barrier appears to be coordination costs combined with the absence of a regulatory mandate to force that coordination. The design pattern itself is mature, and the underlying technology is available.

## The practical state of things

On the regulatory side: no new CIP rule is imminent for AI agents. No FFIEC guidance on agent authentication is pending. The FDX — the CFPB-approved standard-setting body for open banking — launched an Agentic AI initiative on April 14, 2026, with a Call for Input due May 29, 2026 covering agent identification, consent delegation, and security.[^10] That's the live process most likely to produce industry standards in the near term.

On the operational side: the card network frameworks give banks a workable starting point for agent identity in payment contexts. Neither is sufficient as a standalone KYC solution, but both provide more than nothing. For banks building or deploying agents internally, the FFIEC 2021 guidance's "applications and devices" category is what examiners are currently using: per-agent credentials, access controls scoped to the task, and documented risk assessments for each deployment.

The harder problem is the one nobody has solved: how a bank registers and authenticates an agent owned by a third party (a consumer's AI assistant or a business's workflow tool) in a way that satisfies CIP, supports Regulation E dispute resolution, and doesn't create a new attack surface. The EU has established the infrastructure foundation for government-rooted agent credentials. The U.S. is relying on private network rules, voluntary standards, and litigation to produce an equivalent: a bet on private ordering to deliver what the EU is mandating through regulation.

The [final post in this series](post.html?slug=agentic-commerce-gap) is the accounting of that bet: where the commercial deployments actually stand, what the regulatory divergence means for consumer exposure, and which institutions are positioned to absorb the risk the current framework leaves unallocated. The identity gap described here is the precondition. The question the next post answers is who ends up holding it.

[^1]: 31 CFR § 1020.220 — Customer Identification Programs for banks and savings associations, implementing § 326 of the USA PATRIOT Act. The minimum data elements and verification requirements are specified in § 1020.220(a)(2). Available at [ecfr.io](https://ecfr.io/Title-31/Section-1020.220); the FFIEC BSA/AML manual section on CIP is at [bsaaml.ffiec.gov](https://bsaaml.ffiec.gov/manual/AssessingComplianceWithBSARegulatoryRequirements/01).

[^2]: FFIEC Authentication and Access to Financial Institution Services and Systems (August 2021), available at [ffiec.gov](https://www.ffiec.gov/sites/default/files/media/press-releases/2021/authentication-and-access-to-financial-institution-services-and-systems.pdf). The guidance updates the 2005 Authentication Guidance and the 2011 Supplement.

[^3]: Mastercard Verifiable Intent framework details at [mastercard.com](https://www.mastercard.com/us/en/news-and-trends/stories/2026/agentic-commerce-rules-of-the-road.html). The SD-JWT (Selective Disclosure JSON Web Token) format is an IETF standard for issuing credentials with selective disclosure properties. Finextra's comparison of Visa TAP and Mastercard Verifiable Intent is at [finextra.com](https://www.finextra.com/blogposting/31107/deep-dive-mastercard-verifiable-intent-vs-visa-trusted-agent-protocol).

[^4]: OpenID Connect for Agents (OIDC-A) 1.0, arXiv:2509.25974, available at [arxiv.org](https://arxiv.org/abs/2509.25974). The OpenID Foundation published an Identity Management for Agentic AI whitepaper in October 2025 that frames the requirements, but the formal standards process has not produced a finalized protocol.

[^5]: Financial services MCP deployments: Plaid MCP server launch, June 2025, at [plaid.com](https://plaid.com/blog/openai-plaid-mcp/); Bud Financial MCP launch at [thefintechtimes.com](https://thefintechtimes.com/bud-financial-launches-model-context-protocol-to-ground-ai-in-bank-grade-data/); Anthropic-LSEG partnership, November 2025, at [fintech.global](https://fintech.global/2025/11/14/how-mcp-is-reshaping-ai-workflows-in-finance/).

[^6]: arXiv:2506.13538, "MCP at First Glance," June 2025, available at [arxiv.org](https://arxiv.org/abs/2506.13538). eSentire's analysis of Microsoft Defender findings and CVE-2026-33032 at [esentire.com](https://www.esentire.com/blog/model-context-protocol-security-critical-vulnerabilities-every-ciso-should-address-in-2025). MCP specification-level security best practices at [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices).

[^7]: JPMorgan's Derek Waldron's "access management and entitlements" comment from McKinsey's interview at [mckinsey.com](https://www.mckinsey.com/industries/financial-services/our-insights/jpmorgan-chases-derek-waldron-on-building-an-ai-first-bank-culture) and the PYMNTS announcement of JPMorgan's Mirakl partnership at [pymnts.com](https://www.pymnts.com/artificial-intelligence-2/2026/jpmorgan-payments-and-mirakl-form-agentic-commerce-pact/).

[^8]: EU Digital Identity Wallet mandate under eIDAS 2.0: member states must deploy wallets to all eligible citizens by December 2026; private-sector acceptance required by December 2027. Overview at [britepayments.com](https://britepayments.com/resources/article/eidas-explained/).

[^9]: SMART on FHIR is a standard for delegated, scoped access to healthcare data, built on OAuth 2.0 and maintained by HL7 International. The scope syntax design — specifying resource type, action, and constraints in a machine-readable format — is the relevant design pattern for banking, independent of the healthcare context.

[^10]: FDX Agentic AI Initiative announcement, April 14, 2026, at [globenewswire.com](https://www.globenewswire.com/news-release/2026/04/14/3273814/0/en/As-AI-Agents-Get-Involved-in-Financial-Data-Sharing-Leading-Standards-Body-Launches-Initiative-to-Stay-Ahead.html). FDX was approved by the CFPB as the first Section 1033 standard-setting body in January 2025.
