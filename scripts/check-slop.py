#!/usr/bin/env python3
"""
check-slop.py — prose linter wrapper for slop-guard.

Usage:
    uv run --with slop-guard scripts/check-slop.py [OPTIONS] FILE [FILE ...]

Options:
    -t, --threshold SCORE   Minimum passing score 0-100 (default: 70)
    -v, --verbose           Show per-violation detail
    -j, --json              Output JSON (one object per file, newline-delimited)
    --counts                Show per-rule hit counts in the summary line

Exit codes:
    0  All files pass the threshold (or no threshold set)
    1  One or more files scored below the threshold
    2  Error (bad path, import failure, etc.)

Why this script instead of the `sg` CLI?
    On Linux, /usr/bin/sg is the "switch group" command and shadows the
    slop-guard entry point.  This wrapper calls the slop_guard Python API
    directly, which is always unambiguous.
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import slop_guard
except ImportError:
    print(
        "error: slop_guard not importable. "
        "Run via:  uv run --with slop-guard scripts/check-slop.py ...",
        file=sys.stderr,
    )
    sys.exit(2)


BAND_EMOJI = {
    "clean": "✅",
    "light": "🟡",
    "moderate": "🟠",
    "heavy": "🔴",
    "saturated": "💀",
}


def check_file(path: str) -> dict:
    text = Path(path).read_text(encoding="utf-8")

    # ── New API (>= 0.5, AnalysisPayload is a TypedDict / plain dict) ──
    if hasattr(slop_guard, "analyze_text"):
        return slop_guard.analyze_text(text)

    # ── Old MCP API (0.4.x, functions live on slop_guard or .server) ──
    srv = getattr(slop_guard, "server", None)
    for mod in (slop_guard, srv):
        if mod is None:
            continue
        if hasattr(mod, "check_slop_file"):
            return json.loads(mod.check_slop_file(path))
        if hasattr(mod, "check_slop"):
            return json.loads(mod.check_slop(text))

    raise ImportError(
        "slop_guard: cannot find analyze_text, check_slop_file, or check_slop.\n"
        f"Top-level attrs: {[a for a in dir(slop_guard) if not a.startswith('__')]}"
    )


def format_summary(path: str, result: dict, show_counts: bool = False) -> str:
    score = result["score"]
    band = result["band"]
    wc = result["word_count"]
    emoji = BAND_EMOJI.get(band, "")
    line = f"{path}: {score}/100 [{band}] ({wc} words) {emoji}"
    if show_counts:
        counts = result.get("counts", {})
        non_zero = {k: v for k, v in counts.items() if v > 0}
        if non_zero:
            line += "  counts: " + ", ".join(f"{k}={v}" for k, v in non_zero.items())
    return line


def format_violations(result: dict) -> str:
    lines = []
    for v in result.get("violations", []):
        lines.append(f"  [{v['rule']}] \"{v['match']}\"  (penalty {v['penalty']})")
        lines.append(f"    …{v['context']}…")
    if result.get("advice"):
        lines.append("  Advice:")
        for a in result["advice"]:
            lines.append(f"    • {a}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Rule-based slop linter for blog posts (wraps slop-guard)."
    )
    parser.add_argument("files", nargs="+", metavar="FILE", help="Markdown files to check")
    parser.add_argument(
        "-t", "--threshold",
        type=int,
        default=70,
        metavar="SCORE",
        help="Minimum passing score 0-100 (default: 70)",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Show violations + advice")
    parser.add_argument("-j", "--json", action="store_true", dest="as_json", help="JSON output")
    parser.add_argument("--counts", action="store_true", help="Show per-rule hit counts")
    args = parser.parse_args()

    any_failed = False
    exit_code = 0

    for path in args.files:
        if not Path(path).exists():
            print(f"error: file not found: {path}", file=sys.stderr)
            exit_code = 2
            continue

        try:
            result = check_file(path)
        except Exception as e:
            print(f"error reading {path}: {e}", file=sys.stderr)
            exit_code = 2
            continue

        passed = result["score"] >= args.threshold

        if args.as_json:
            out = dict(result)
            out["source"] = path
            out["threshold"] = args.threshold
            out["passed"] = passed
            print(json.dumps(out))
        else:
            summary = format_summary(path, result, show_counts=args.counts)
            if not passed:
                summary += f"  ← FAIL (threshold {args.threshold})"
            print(summary)
            if args.verbose:
                detail = format_violations(result)
                if detail:
                    print(detail)

        if not passed:
            any_failed = True

    if any_failed and exit_code == 0:
        exit_code = 1

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
