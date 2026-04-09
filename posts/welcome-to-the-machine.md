---
title: "Welcome to the Machine: On Writing About AI"
date: 2026-03-22
description: "Why I'm starting a public blog about data science and GenAI — and what I hope to figure out by writing it."
tags: [meta, GenAI]
---

There's a particular kind of vertigo that comes from working on a technology that's moving faster than anyone can document it. I've spent the better part of the last several years doing research and applied work with language models — and lately I've found myself reaching for words to describe what's happening that I simply don't have yet.

This blog is my attempt to find those words.

## Why Write in Public?

I've kept plenty of private notes: Google docs, Apple Notes, markdown files scattered across three different machines. The problem with private notes is that they don't push back. They just sit there, agreeing with you.

Writing for an audience — even a small one, even an imaginary one — forces a different kind of honesty. You can't handwave past the part you don't quite understand. You can't leave a vague bullet point and promise yourself you'll come back to it. You have to say the thing, or admit you can't.

> The best way to understand something is to explain it to someone else. The second-best way is to try to write it down as if you were.

I'm also motivated by a quiet frustration with how GenAI gets discussed publicly. The coverage tends to oscillate between breathless hype and breathless doom, with very little in the middle — the messy, interesting, technically real middle where the actual work happens. I'd like to contribute something from that middle.

## What I Actually Do

My day-to-day involves a mix of things: building and evaluating language models, thinking about the organizational infrastructure for governing them, and lately working out what it means to design agents that are reliable enough to trust with real decisions. A lot of it is less glamorous than the demos suggest, and a lot of it sits at an uncomfortable intersection between technical engineering and institutional risk management that neither field has fully claimed.

Here's the kind of thing I mean. A question I keep running into is how you apply fifteen-year-old governance frameworks to AI systems that barely existed five years ago. In financial services, banks are actively trying to apply [model risk guidance written for linear regression models](post.html?slug=sr11-7) to large language models making underwriting recommendations. The question is not rhetorical. The technical and organizational problems are both real, and they compound each other in ways that don't get discussed much outside of narrow specialist audiences.

That intersection is what I want to write about. The people who understand the engineering often don't spend much time in governance conversations, and vice versa. I'm interested in what happens when you try to hold both at once.

## On the Weirdness of This Moment

I want to be careful not to be too knowing about all of this. It's easy to fall into a pose of world-weary expertise when you work with these systems every day — to treat the genuinely strange as mundane because you've seen a lot of model outputs.

But something real is happening. The models I work with today are qualitatively different from the ones I worked with two years ago, and the ones two years from now will almost certainly be different again in ways I can't predict. That's exciting and disorienting in roughly equal measure.

## What to Expect Here

I'm planning to write about four areas. The first is [agentic engineering](post.html?slug=context): context files, orchestration design, multi-session continuity, and what it actually takes to build agents that hold up in production. The second is [financial AI and model risk](post.html?slug=sr11-7): what SR 11-7 requires, where it breaks down for modern AI, and what regulatory change is actually coming. The third is [guardrails and governance](post.html?slug=guardrails): what runtime controls mean in an autonomous system operating inside a regulated institution. And the fourth is [GenAI evals](post.html?slug=metrics-metrics-metrics): how to actually know if a system is working, and for what.

The blog sits at an intersection that doesn't have a lot of native coverage. If you work in model risk or AI governance, I hope the technical posts are readable. If you're an ML engineer, I hope the governance posts don't feel like compliance theater. I'm trying to write for both — which may mean occasionally failing both.

Posts will vary in length and formality. Some will be close to polished essays. Others will be working notes — me thinking through a problem in real time, with no guarantee I've resolved it by the end.

If that sounds useful to you, I'm glad you're here. If it sounds like a bad idea, I'd genuinely like to hear why.
