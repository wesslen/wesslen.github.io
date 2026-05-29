#!/usr/bin/env python3
"""
fix-footnotes.py

Renumbers footnotes in blog post Markdown files so that inline references
[^N] are numbered sequentially in the order they first appear in the text,
and the definition block [^N]: at the bottom is reordered to match.

Usage:
  # Dry-run all posts (shows what would change, writes nothing):
  python3 scripts/fix-footnotes.py --dry-run

  # Fix all posts:
  python3 scripts/fix-footnotes.py

  # Fix only git-modified posts:
  python3 scripts/fix-footnotes.py --git-modified

  # Fix a single file:
  python3 scripts/fix-footnotes.py posts/my-post.md
"""

import re
import subprocess
import sys
from pathlib import Path

POSTS_DIR = Path(__file__).parent.parent / "posts"

# Matches inline refs like [^1], [^12]
INLINE_REF = re.compile(r'\[\^(\d+)\](?!:)')
# Matches definition lines like [^1]: some text
DEF_LINE = re.compile(r'^\[\^(\d+)\]:')


def get_git_modified_files():
    """Return .md files in posts/ that are modified or untracked per git."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True, text=True, cwd=POSTS_DIR.parent
        )
        modified = set(result.stdout.strip().splitlines())
        result2 = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            capture_output=True, text=True, cwd=POSTS_DIR.parent
        )
        untracked = set(result2.stdout.strip().splitlines())
        all_changed = modified | untracked
        return [
            POSTS_DIR.parent / p
            for p in all_changed
            if p.startswith("posts/") and p.endswith(".md")
        ]
    except Exception as e:
        print(f"git error: {e}", file=sys.stderr)
        return []


def fix_footnotes(path: Path, dry_run: bool = False) -> bool:
    """
    Renumber footnotes in `path` so inline refs are sequential by first
    appearance. Returns True if the file was (or would be) changed.
    """
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    # --- Pass 1: find order of first appearance of each footnote number ---
    seen_order = []  # old numbers in first-appearance order
    seen_set = set()
    for line in lines:
        # Skip definition lines — we only care about inline refs
        if DEF_LINE.match(line):
            continue
        for m in INLINE_REF.finditer(line):
            n = m.group(1)
            if n not in seen_set:
                seen_set.add(n)
                seen_order.append(n)

    if not seen_order:
        return False  # no footnotes

    # Build old->new mapping
    old_to_new = {old: str(i + 1) for i, old in enumerate(seen_order)}

    # Check if already in order (no change needed)
    if all(old == new for old, new in old_to_new.items()):
        return False

    # --- Pass 2: collect definition blocks (may span multiple lines) ---
    def_blocks = {}  # old_number -> list of lines (including the [^N]: line)
    i = 0
    while i < len(lines):
        m = DEF_LINE.match(lines[i])
        if m:
            n = m.group(1)
            block = [lines[i]]
            i += 1
            # Consume continuation lines (indented or blank between defs)
            while i < len(lines):
                next_line = lines[i]
                if DEF_LINE.match(next_line):
                    break
                if next_line.strip() == "":
                    # Blank line: peek ahead; if next non-blank is a def, stop
                    j = i + 1
                    while j < len(lines) and lines[j].strip() == "":
                        j += 1
                    if j < len(lines) and DEF_LINE.match(lines[j]):
                        break
                    block.append(next_line)
                    i += 1
                elif next_line.startswith("  ") or next_line.startswith("\t"):
                    block.append(next_line)
                    i += 1
                else:
                    break
            def_blocks[n] = block
        else:
            i += 1

    # --- Pass 3: rewrite the file ---
    new_lines = []
    def_section_written = False

    for line in lines:
        if DEF_LINE.match(line):
            # On first def line encountered, emit ALL definitions in new order
            if not def_section_written:
                for old_n in seen_order:
                    if old_n in def_blocks:
                        block = def_blocks[old_n]
                        new_n = old_to_new[old_n]
                        # Rewrite the [^N]: header of this block
                        first = re.sub(
                            r'^\[\^' + re.escape(old_n) + r'\]:',
                            f'[^{new_n}]:',
                            block[0]
                        )
                        new_lines.append(first)
                        new_lines.extend(block[1:])
                def_section_written = True
            # Skip all original def lines (already emitted above)
            continue

        # Rewrite inline refs on non-definition lines
        def replace_ref(m):
            old = m.group(1)
            return f'[^{old_to_new.get(old, old)}]'

        new_line = INLINE_REF.sub(replace_ref, line)
        new_lines.append(new_line)

    new_text = "".join(new_lines)

    if new_text == text:
        return False

    if dry_run:
        print(f"[dry-run] Would fix: {path.name}")
        print(f"  Map: {old_to_new}")
        return True

    path.write_text(new_text, encoding="utf-8")
    print(f"Fixed: {path.name}  {old_to_new}")
    return True


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    git_only = "--git-modified" in args
    args = [a for a in args if not a.startswith("--")]

    if args:
        files = [Path(a) for a in args]
    elif git_only:
        files = get_git_modified_files()
        if not files:
            print("No git-modified .md files found in posts/.")
            return
    else:
        files = sorted(POSTS_DIR.glob("*.md"))

    changed = 0
    for f in files:
        if not f.exists():
            print(f"Not found: {f}", file=sys.stderr)
            continue
        if fix_footnotes(f, dry_run=dry_run):
            changed += 1

    label = "Would fix" if dry_run else "Fixed"
    print(f"\n{label} {changed} of {len(files)} file(s).")


if __name__ == "__main__":
    main()
