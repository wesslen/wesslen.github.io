---
title: "Everything Drifts"
date: 2026-03-22
description: "Why I named it Drift — and why it's now a course."
tags: []
---

There's a word that keeps surfacing when I try to describe what I'm watching happen in AI right now: drift.

Not the technical kind — though that too. I mean something broader. Models drift from their stated behavior. Codebases drift from the developers who wrote them, as agents take on more of the work. Governance frameworks drift from the systems they were designed to govern. And organizations drift, sometimes gradually and sometimes all at once.

This blog — called Drift, for reasons that should be obvious by now — is my attempt to document that drift from the edges where it's most visible.

## Why Write in Public?

I've kept plenty of private notes: Google docs, Apple Notes, markdown files scattered across three different machines. The problem with private notes is that they don't push back. They just sit there, agreeing with you.

Writing for an audience — even a small one, even an imaginary one — forces a different kind of honesty. You can't handwave past the part you don't quite understand. You can't leave a vague bullet point and promise yourself you'll come back to it. You have to say the thing, or admit you can't.

> [!QUOTE]
> The best way to understand something is to teach it to someone else. The second-best way is to try to write it down as if you were. So here I am.

I'm also motivated by a quiet frustration with how GenAI gets discussed publicly. The coverage tends to oscillate between breathless hype and breathless doom, with very little in the middle — the messy, technically real middle where the actual work happens. I'd like to contribute something from that middle, and specifically from its edges: the places where the frameworks haven't caught up, where the behavior is hardest to predict, where the governance questions are still open.

## What I Actually Do

My day-to-day involves a mix of things: building and evaluating language models, thinking about the organizational infrastructure for governing them, and lately working out what it means to design agents that are reliable enough to trust with real decisions. A lot of it is less glamorous than the demos suggest, and a lot of it sits at an uncomfortable intersection between technical engineering and institutional risk management that neither field has fully claimed.

The drift shows up here too. A question I keep running into is how you apply fifteen-year-old governance frameworks to AI systems that barely existed five years ago. In financial services, banks are actively trying to apply [model risk guidance written for linear regression models](post.html?slug=sr11-7) to large language models making underwriting recommendations. The question is not rhetorical. The technical and organizational problems are both real, and they compound each other in ways that don't get discussed much outside of narrow specialist audiences.

That edge — between what the frameworks cover and what the systems actually do — is what I want to write about. The people who understand the engineering often don't spend much time in governance conversations, and vice versa. I'm interested in what happens when you try to hold both at once.

## On the Speed of the Drift

I want to be careful not to be too knowing about all of this. It's easy to fall into a pose of world-weary expertise when you work with these systems every day — to treat the genuinely strange as mundane because you've seen a lot of model outputs.

But something real is happening. The models I work with today are qualitatively different from the ones I worked with two years ago, and the ones two years from now will almost certainly be different again in ways I can't predict. That's exciting and disorienting in roughly equal measure. The drift is real, and so is the uncertainty about where it's taking us.

There's also a certain irony embedded in the name. Drift is a useful shorthand — but as a measurement concept for agentic AI, it tends to get treated as more sufficient than it is. What you're actually looking for depends entirely on the system, the institution, and the specific failure mode you're trying to prevent. That gap between the clean general concept and the messy particular reality is one of the things I keep coming back to.

## From Notes to a Course

When I started, I said I'd write about four things. That number didn't survive contact with the subject. What began as scattered notes has turned into something with a shape: ten series, around thirty posts, each series roughly a lecture's worth of argument. Somewhere along the way it stopped being a blog I was adding to and started being a curriculum I was, apparently, writing.

So I'm going to call it what it is: an opinionated course on the risk of GenAI and agentic systems in banking. Opinionated because I'm not pretending to neutrality — I have views about what's overbuilt, what's underbuilt, and where the governance is theater. A course because the pieces build on each other in an order, even if you can read them in any order you like.

The arc runs roughly like this. It starts with [the governance baseline](post.html?slug=sr11-7) — the fifteen-year-old model risk framework banks are stretching over systems it was never written for — and where it cracks. Then how agents are [actually built](post.html?slug=context), and what happens when they [start calling each other](post.html?slug=a2a-risks) or [driving a screen](post.html?slug=molmoweb-data-flywheel). Then the hard part: whether you can [measure](post.html?slug=metrics-metrics-metrics) any of it, whether you can [break it](post.html?slug=adversarial-workflow) before someone else does, and what [keeping a human in the loop](post.html?slug=hitl-design) actually buys you — a question the [human-factors literature](post.html?slug=bainbridge-ironies) answered, in part, decades ago. It ends where the stakes are most concrete: [money, identity, and liability](post.html?slug=payments-liability-gap) when an agent transacts, and the [economics](post.html?slug=ai-econ-model) of adopting all of it.

I built it so it can be taught more than one way — a ten-week lunch-and-learn, a semester, or read at your own pace. Each series stands on its own; together they're the course.

The blog sits at an intersection that doesn't have a lot of native coverage. If you work in model risk or AI governance, I hope the technical posts are readable. If you're an ML engineer, I hope the governance posts don't feel like compliance theater. I'm trying to write for both — which may mean occasionally failing both.

Posts will vary in length and formality. Some are close to polished essays. Others are working notes — me thinking through a problem in real time, with no guarantee I've resolved it by the end. That's true of the course, too: it documents a moving target, which means part of its job is to keep going stale and getting rewritten.

If that sounds useful to you, I'm glad you're here.

## How the Quizzes Work

Each post that has a question pool shows a **// check your understanding** section at the bottom, just above the "more posts" links. It draws five questions at random from a larger pool and randomizes the option order every time, so retaking gives you a genuinely different pass through the material rather than a memory test for answer positions.

The questions are designed for learning, not assessment. Every answer — right or wrong — shows an explanation. The score at the end is there to orient you, not grade you. The goal is that the explanation for a wrong answer is worth as much as getting it right.

Each module also has a **module test**, accessible from the [Modules page](slides.html). It draws ten questions from across all posts in the module — so it tests whether concepts from different posts are connecting, not just whether you remember a single post's argument.

Progress is saved in your browser. A small ✓ badge appears on the post list once you've attempted a quiz, and the module page shows how many posts in each module you've covered. If you clear your browser history, switch browsers, or open the site in a private window, the progress doesn't carry over — there's no account system. This is a static site, and that's a deliberate trade-off: nothing to log in to, nothing stored anywhere but your own machine.

A few things worth knowing before you start. The quizzes cover the *argument* each post makes — why something is true, what a framework implies, where a concept breaks down — not the trivia. If a question asks about the London Whale, the right answer won't depend on the dollar figure; it'll depend on which failure mode the case study illustrates. If you find a question that seems to test the wrong thing, or an explanation that misses the point, the [GitHub repo](https://github.com/wesslen/wesslen.github.io) is the right place to flag it.
