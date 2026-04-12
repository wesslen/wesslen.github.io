---
title: "Everything Drifts"
date: 2026-03-22
description: "What drift means in AI — and why I named a blog after it."
tags: [meta, GenAI]
---

There's a word that keeps surfacing when I try to describe what I'm watching happen in AI right now: drift.

Not the technical kind — though that too. I mean something broader. Models drift from their stated behavior. Codebases drift from the developers who wrote them, as agents take on more of the work. Governance frameworks drift from the systems they were designed to govern. And organizations drift, sometimes gradually and sometimes all at once.

This blog — called Drift, for reasons that should be obvious by now — is my attempt to document that drift from the edges where it's most visible.

## Why Write in Public?

I've kept plenty of private notes: Google docs, Apple Notes, markdown files scattered across three different machines. The problem with private notes is that they don't push back. They just sit there, agreeing with you.

Writing for an audience — even a small one, even an imaginary one — forces a different kind of honesty. You can't handwave past the part you don't quite understand. You can't leave a vague bullet point and promise yourself you'll come back to it. You have to say the thing, or admit you can't.

> The best way to understand something is to explain it to someone else. The second-best way is to try to write it down as if you were.

I'm also motivated by a quiet frustration with how GenAI gets discussed publicly. The coverage tends to oscillate between breathless hype and breathless doom, with very little in the middle — the messy, technically real middle where the actual work happens. I'd like to contribute something from that middle, and specifically from its edges: the places where the frameworks haven't caught up, where the behavior is hardest to predict, where the governance questions are still open.

## What I Actually Do

My day-to-day involves a mix of things: building and evaluating language models, thinking about the organizational infrastructure for governing them, and lately working out what it means to design agents that are reliable enough to trust with real decisions. A lot of it is less glamorous than the demos suggest, and a lot of it sits at an uncomfortable intersection between technical engineering and institutional risk management that neither field has fully claimed.

The drift shows up here too. A question I keep running into is how you apply fifteen-year-old governance frameworks to AI systems that barely existed five years ago. In financial services, banks are actively trying to apply [model risk guidance written for linear regression models](post.html?slug=sr11-7) to large language models making underwriting recommendations. The question is not rhetorical. The technical and organizational problems are both real, and they compound each other in ways that don't get discussed much outside of narrow specialist audiences.

That edge — between what the frameworks cover and what the systems actually do — is what I want to write about. The people who understand the engineering often don't spend much time in governance conversations, and vice versa. I'm interested in what happens when you try to hold both at once.

## On the Speed of the Drift

I want to be careful not to be too knowing about all of this. It's easy to fall into a pose of world-weary expertise when you work with these systems every day — to treat the genuinely strange as mundane because you've seen a lot of model outputs.

But something real is happening. The models I work with today are qualitatively different from the ones I worked with two years ago, and the ones two years from now will almost certainly be different again in ways I can't predict. That's exciting and disorienting in roughly equal measure. The drift is real, and so is the uncertainty about where it's taking us.

There's also a certain irony embedded in the name. Drift is a useful shorthand — but as a measurement concept for agentic AI, it tends to get treated as more sufficient than it is. What you're actually looking for depends entirely on the system, the institution, and the specific failure mode you're trying to prevent. That gap between the clean general concept and the messy particular reality is one of the things I keep coming back to.

## What to Expect Here

I'm planning to write about four areas. The first is [agentic engineering](post.html?slug=context): context files, orchestration design, multi-session continuity, and what it actually takes to build agents that hold up in production — and stay on the rails when you're not watching. The second is [financial AI and model risk](post.html?slug=sr11-7): what SR 11-7 requires, where it breaks down for modern AI, and what regulatory change is actually coming. The third is [guardrails and governance](post.html?slug=guardrails): what runtime controls mean in an autonomous system operating inside a regulated institution. And the fourth is [GenAI evals](post.html?slug=metrics-metrics-metrics): how to actually know if a system is working, and for what.

The blog sits at an intersection that doesn't have a lot of native coverage. If you work in model risk or AI governance, I hope the technical posts are readable. If you're an ML engineer, I hope the governance posts don't feel like compliance theater. I'm trying to write for both — which may mean occasionally failing both.

Posts will vary in length and formality. Some will be close to polished essays. Others will be working notes — me thinking through a problem in real time, with no guarantee I've resolved it by the end.

If that sounds useful to you, I'm glad you're here.
