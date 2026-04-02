---
title: "Welcome to the Machine: On Writing About AI"
date: 2026-03-22
description: "Why I'm starting a public blog about data science and GenAI — and what I hope to figure out by writing it."
tags: [meta, GenAI]
---

There's a particular kind of vertigo that comes from working inside a technology that's moving faster than anyone can document it. I've spent the better part of the last several years doing research and applied work with language models — and lately I've found myself reaching for words to describe what's happening that I simply don't have yet.

This blog is my attempt to find those words.

## Why Write in Public?

I've kept plenty of private notes. Notion documents, Obsidian vaults, markdown files scattered across three different machines. The problem with private notes is that they don't push back. They just sit there, agreeing with you.

Writing for an audience — even a small one, even an imaginary one — forces a different kind of honesty. You can't handwave past the part you don't quite understand. You can't leave a vague bullet point and promise yourself you'll come back to it. You have to say the thing, or admit you can't.

> The best way to understand something is to explain it to someone else. The second-best way is to try to write it down as if you were.

I'm also motivated by a quiet frustration with how GenAI gets discussed publicly. The coverage tends to oscillate between breathless hype and breathless doom, with very little in the middle — the messy, interesting, technically real middle where the actual work happens. I'd like to contribute something from that middle.

## What I Actually Do

My day-to-day involves a mix of things: fine-tuning and evaluating language models, building retrieval pipelines, doing annotation studies, and generally trying to figure out when and why these systems fail. A lot of it is less glamorous than the demos suggest.

Here's the kind of thing I mean. Say you're evaluating a model for a classification task. You might write something like this:

```python
from sklearn.metrics import classification_report
from transformers import pipeline

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

labels = ["positive", "negative", "neutral"]
texts  = [
    "The model performs surprisingly well on ambiguous inputs.",
    "Latency in production is completely unacceptable.",
    "Results were... mixed, I guess.",
]

for text in texts:
    result = classifier(text, candidate_labels=labels)
    top    = result["labels"][0]
    score  = result["scores"][0]
    print(f"{score:.2f}  {top:10s}  {text[:50]}")
```

The code is simple. The interesting part — the part that takes weeks — is deciding whether the labels are the right ones, whether the examples are representative, whether the score threshold you pick will hold up in deployment. That's where the actual thinking lives, and it's where I want to focus my writing.

## On the Weirdness of This Moment

I want to be careful not to be too knowing about all of this. It's easy to fall into a pose of world-weary expertise when you work with these systems every day — to treat the genuinely strange as mundane because you've seen a lot of model outputs.

But something real is happening. The models I work with today are qualitatively different from the ones I worked with two years ago, and the ones two years from now will almost certainly be different again in ways I can't predict. That's exciting and disorienting in roughly equal measure.

## What to Expect Here

I'm planning to write about:

- **Evaluation and benchmarking** — how to actually know if a model is good, and for what
- **RAG and retrieval** — the plumbing that makes LLMs useful in practice
- **Annotation and labeling** — the underrated, unsexy foundation of all of this
- **Tools and workflows** — what my actual working environment looks like
- **The bigger picture** — occasionally, when I feel like I have something real to say

Posts will vary in length and formality. Some will be close to polished essays. Others will be working notes — me thinking through a problem in real time, with no guarantee I've resolved it by the end.

If that sounds useful to you, I'm glad you're here. If it sounds like a bad idea, I'd genuinely like to hear why.

---

*Next up: a post on why I think the way we evaluate language model outputs is quietly broken, and what a more honest approach might look like.*
