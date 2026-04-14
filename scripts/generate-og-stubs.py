#!/usr/bin/env python3
"""
Generate per-post OG stub HTML files from posts/index.json.

Each stub lives at posts/{slug}.html and contains the correct Open Graph
and Twitter Card meta tags for that post. Social media crawlers (which do
not execute JavaScript) see the post-specific metadata. Human visitors are
immediately redirected to post.html?slug={slug}.

Usage:
    python3 scripts/generate-og-stubs.py

Run from the repo root. Intended to be called by the GitHub Action
.github/workflows/generate-og-stubs.yml on every push to main that
touches posts/index.json or the script itself.
"""

import html
import json
import os
import sys

# ── Configuration ──────────────────────────────────────────────────────────────
SITE_URL   = "https://wesslen.github.io"
SITE_NAME  = "Drift: Notes on AI on the Edges"
OG_IMAGE   = f"{SITE_URL}/og-default.png"
POSTS_DIR  = os.path.join(os.path.dirname(__file__), "..", "posts")
INDEX_PATH = os.path.join(POSTS_DIR, "index.json")

# ── Stub template ──────────────────────────────────────────────────────────────
def generate_stub(post: dict) -> str:
    slug        = post["slug"]
    title       = html.escape(post.get("title", slug))
    description = html.escape(post.get("description", ""))
    stub_url    = f"{SITE_URL}/posts/{slug}.html"
    redirect    = f"../post.html?slug={slug}"

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url={redirect}" />
    <title>{title} — {SITE_NAME}</title>

    <!-- Open Graph -->
    <meta property="og:type"        content="article" />
    <meta property="og:site_name"   content="{SITE_NAME}" />
    <meta property="og:title"       content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:url"         content="{stub_url}" />
    <meta property="og:image"       content="{OG_IMAGE}" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image"       content="{OG_IMAGE}" />
  </head>
  <body>
    <!-- JS redirect as fallback for browsers that ignore meta refresh -->
    <script>window.location.replace("{redirect}");</script>
    <p>Redirecting to <a href="{redirect}">{title}</a>…</p>
  </body>
</html>
"""


# ── Main ───────────────────────────────────────────────────────────────────────
def main() -> None:
    if not os.path.exists(INDEX_PATH):
        print(f"ERROR: {INDEX_PATH} not found.", file=sys.stderr)
        sys.exit(1)

    with open(INDEX_PATH, encoding="utf-8") as f:
        posts = json.load(f)

    generated = []
    for post in posts:
        slug      = post.get("slug", "")
        stub_path = os.path.join(POSTS_DIR, f"{slug}.html")
        content   = generate_stub(post)

        with open(stub_path, "w", encoding="utf-8") as f:
            f.write(content)

        generated.append(f"posts/{slug}.html")
        print(f"  ✓  {slug}.html")

    print(f"\nGenerated {len(generated)} stub file(s).")


if __name__ == "__main__":
    main()
