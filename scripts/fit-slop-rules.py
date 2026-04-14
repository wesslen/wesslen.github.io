#!/usr/bin/env python3
"""
fit-slop-rules.py — fit a custom slop-guard rule config from the blog corpus.

Run once (or re-run whenever posts change significantly):

    uv run --with slop-guard python scripts/fit-slop-rules.py

Writes:  scripts/slop-rules.jsonl

The fitted config de-weights patterns that appear in your legitimate writing
(e.g. technical uses of "harness") while keeping penalties high for genuine
AI-slop patterns.  check-slop.py picks up this file automatically when it
exists.

Why this matters:
  The default rules penalise "harness" as a slop word.  In this blog it's
  used precisely (agent harness, test harness).  Fitting on the actual corpus
  teaches the pipeline that the blog's authentic voice includes this word,
  and reduces its penalty weight accordingly.
"""

import sys
from pathlib import Path

try:
    from slop_guard.apps.fit import fit_main
except ImportError:
    print(
        "error: slop_guard.apps.fit not importable.\n"
        "Run via:  uv run --with slop-guard python scripts/fit-slop-rules.py",
        file=sys.stderr,
    )
    sys.exit(2)

REPO_ROOT = Path(__file__).parent.parent
POSTS_DIR = REPO_ROOT / "posts"
OUTPUT    = REPO_ROOT / "scripts" / "slop-rules.jsonl"

# Blog posts used as the positive corpus (authentic, non-slop writing).
# index.json and any draft/reference files are excluded.
EXCLUDED = {"index.json", "reference-audit.md"}

corpus = sorted(
    str(p) for p in POSTS_DIR.glob("*.md")
    if p.name not in EXCLUDED
)

if not corpus:
    print("error: no posts found in posts/*.md", file=sys.stderr)
    sys.exit(2)

print(f"Fitting on {len(corpus)} posts:")
for p in corpus:
    print(f"  {p}")
print(f"Output → {OUTPUT}\n")

args = ["--output", str(OUTPUT)] + corpus

exit_code = fit_main(args)

if exit_code == 0:
    print(f"\nDone. Custom rules written to {OUTPUT.relative_to(REPO_ROOT)}")
    print("check-slop.py will use this config automatically on next run.")
else:
    print(f"\nsg-fit exited with code {exit_code}", file=sys.stderr)

sys.exit(exit_code)
