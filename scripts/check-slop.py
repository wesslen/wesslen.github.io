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

# Auto-load a fitted custom pipeline if scripts/slop-rules.jsonl exists.
# Generate it by running:  uv run --with slop-guard python scripts/fit-slop-rules.py
_CUSTOM_RULES = Path(__file__).parent / "slop-rules.jsonl"

def _load_pipeline():
    """Return a fitted Pipeline if slop-rules.jsonl exists, else None."""
    try:
        from slop_guard.rules.pipeline import Pipeline
        if _CUSTOM_RULES.exists():
            return Pipeline.from_jsonl(_CUSTOM_RULES)
    except Exception:
        pass
    return None

_PIPELINE = _load_pipeline()
if _PIPELINE and _CUSTOM_RULES.exists():
    print(f"[slop-guard] using fitted rules: {_CUSTOM_RULES.name}", file=sys.stderr)


def _apply_corpus_suppressions(rules_path: Path) -> None:
    """Fallback for slop-guard < 0.4 / Python < 3.11.

    When the Pipeline API isn't available, reads ``suppress_words`` from the
    first JSON object in slop-rules.jsonl and monkey-patches the module-level
    word list + compiled regex so those terms are never penalised.

    This replicates what ``fit-slop-rules.py`` would do via the fitted Pipeline:
    words that appear throughout the legitimate corpus are down-weighted to zero.
    """
    import re as _re
    try:
        first_line = rules_path.read_text(encoding="utf-8").splitlines()[0]
        config = json.loads(first_line)
        suppress = {w.lower() for w in config.get("suppress_words", [])}
        if not suppress:
            return

        import slop_guard.server as _sg
        original = _sg._ALL_SLOP_WORDS
        patched = [w for w in original if w.lower() not in suppress]
        removed = sorted(set(original) - set(patched))
        if not removed:
            return

        _sg._ALL_SLOP_WORDS = patched
        _sg._SLOP_WORD_RE = _re.compile(
            r"\b(" + "|".join(_re.escape(w) for w in patched) + r")\b",
            _re.IGNORECASE,
        )
        print(
            f"[slop-guard] corpus suppression (fallback): removed {removed}",
            file=sys.stderr,
        )
    except Exception as exc:
        print(f"[slop-guard] corpus suppression failed: {exc}", file=sys.stderr)


# Apply corpus suppressions when Pipeline isn't available (Python < 3.11 / sg < 0.4)
if _PIPELINE is None and _CUSTOM_RULES.exists():
    _apply_corpus_suppressions(_CUSTOM_RULES)


def check_file(path: str) -> dict:
    text = Path(path).read_text(encoding="utf-8")

    # ── New API (>= 0.5, AnalysisPayload is a TypedDict / plain dict) ──
    if hasattr(slop_guard, "analyze_text"):
        kwargs = {"pipeline": _PIPELINE} if _PIPELINE else {}
        return slop_guard.analyze_text(text, **kwargs)

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
