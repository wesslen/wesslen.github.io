#!/usr/bin/env python3
"""
narrate.py — Script-to-Speech pipeline for wesslen.github.io

Converts a Markdown blog post to an MP3 narration via:
  1. Gemini (scriptwriting: Markdown → spoken script)
  2. Google Cloud TTS (synthesis: script → MP3)

Usage:
  python scripts/narrate.py posts/sr11-7.md
  python scripts/narrate.py posts/context.md --voice en-US-Journey-F
  python scripts/narrate.py posts/welcome-to-the-machine.md --force

Prerequisites:
  pip install -r scripts/requirements.txt
  brew install ffmpeg  # macOS; or: sudo apt-get install ffmpeg

Environment variables required:
  GEMINI_API_KEY                  — from Google AI Studio
  GOOGLE_APPLICATION_CREDENTIALS — path to GCP service account JSON key
"""

import argparse
import io
import json
import os
import re
import sys
import textwrap
from pathlib import Path

import google.generativeai as genai
from google.cloud import texttospeech
from pydub import AudioSegment

# ── Paths ──────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).parent.parent
AUDIO_DIR = REPO_ROOT / "assets" / "audio"
INDEX_PATH = REPO_ROOT / "posts" / "index.json"

# Google TTS hard limit is 5,000 characters per request.
# We stay safely under it.
CHUNK_LIMIT = 4_800


# ── Markdown preprocessing ─────────────────────────────────────────────────

def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter block (between --- delimiters)."""
    if text.startswith("---"):
        try:
            end = text.index("---", 3)
            return text[end + 3 :].strip()
        except ValueError:
            pass
    return text


# ── Gemini scriptwriting ───────────────────────────────────────────────────

GEMINI_PROMPT_TEMPLATE = textwrap.dedent("""
    You are converting a technical blog post into a natural audio narration script.

    The blog has a first-person, conversational voice — wry, direct, self-aware,
    and occasionally irreverent. Preserve that tone. Do NOT make it sound like a
    corporate explainer or a LinkedIn post.

    Rules:
    - Output plain text only. No Markdown syntax whatsoever (no **, no #, no
      backticks, no brackets, no asterisks).
    - Strip all footnote reference markers like [^1] or [^2] from the body silently.
    - Footnote definitions at the bottom (lines starting with [^N]:) should be
      converted to natural spoken asides: "Worth noting here: ..." — include only
      substantive ones; omit lines that are just bibliographic citations.
    - GitHub-style alerts (lines starting with "> [!NOTE]", "> [!WARNING]",
      "> [!TIP]", "> [!IMPORTANT]", "> [!CAUTION]") should be read as brief
      asides that fit the alert's tone: NOTE → "As a side note:", WARNING →
      "Worth flagging:", TIP → "A practical note:", IMPORTANT → "This is
      important:", CAUTION → "Be careful here:".
    - Code blocks: do NOT read the code. Say what the code accomplishes in one
      or two plain sentences. E.g., "Here's a Python function that chunks text
      at sentence boundaries to stay within API limits."
    - Tables: say "To give you a sense of the numbers:" or similar, then
      summarize the key takeaway in two sentences. Do not read every cell.
    - Section headers (## or ###): convert to natural spoken transitions, not
      announcements. E.g., "## Why This Matters" → "So why does this matter?"
    - Use natural spoken contractions (it's, don't, we've, I'd) where they fit.
    - The output should feel like the author is speaking directly to you — not
      reading aloud, but actually talking.

    Here is the blog post:

    {md_content}
""")


def gemini_scriptify(md_content: str, save_script_path: Path | None = None) -> str:
    """Transform Markdown content into a natural narration script via Gemini."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("Error: GEMINI_API_KEY environment variable not set.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = GEMINI_PROMPT_TEMPLATE.format(md_content=md_content)
    print(f"  Sending {len(prompt):,} chars to Gemini...")
    response = model.generate_content(prompt)
    script = response.text

    if save_script_path:
        save_script_path.write_text(script, encoding="utf-8")
        print(f"  Script saved for review: {save_script_path}")

    return script


# ── Text chunking ──────────────────────────────────────────────────────────

def chunk_text(text: str, limit: int = CHUNK_LIMIT) -> list[str]:
    """
    Split text into chunks that fit within `limit` characters.
    Splits preferentially at paragraph boundaries, falling back to sentence
    boundaries for paragraphs that exceed the limit on their own.
    """
    chunks: list[str] = []
    current = ""

    for para in text.split("\n\n"):
        para = para.strip()
        if not para:
            continue

        candidate = (current + "\n\n" + para).strip() if current else para

        if len(candidate) <= limit:
            current = candidate
        else:
            if current:
                chunks.append(current)

            # Single paragraph may itself exceed limit — split at sentences
            if len(para) > limit:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                current = ""
                for sentence in sentences:
                    test = (current + " " + sentence).strip() if current else sentence
                    if len(test) <= limit:
                        current = test
                    else:
                        if current:
                            chunks.append(current)
                        # If a single sentence exceeds limit, hard-truncate (edge case)
                        current = sentence[:limit]
            else:
                current = para

    if current:
        chunks.append(current)

    return chunks


# ── Google TTS synthesis ───────────────────────────────────────────────────

def synthesize_chunks(
    chunks: list[str],
    voice_name: str = "en-US-Journey-D",
) -> bytes:
    """
    Send each text chunk to Google Cloud TTS and concatenate into a single MP3.
    Inserts a 400ms pause between chunks for natural pacing.
    """
    client = texttospeech.TextToSpeechClient()
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name=voice_name,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )

    segments: list[AudioSegment] = []
    for i, chunk in enumerate(chunks):
        print(f"  TTS chunk {i + 1}/{len(chunks)} ({len(chunk):,} chars)...")
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=chunk),
            voice=voice,
            audio_config=audio_config,
        )
        segments.append(AudioSegment.from_mp3(io.BytesIO(response.audio_content)))

    combined = segments[0]
    for seg in segments[1:]:
        combined += AudioSegment.silent(duration=400) + seg

    buf = io.BytesIO()
    combined.export(buf, format="mp3", bitrate="128k")
    return buf.getvalue()


# ── index.json update ──────────────────────────────────────────────────────

def update_index(slug: str) -> None:
    """Set audio: true on the matching post entry in posts/index.json."""
    data: list[dict] = json.loads(INDEX_PATH.read_text())
    matched = False
    for entry in data:
        if entry["slug"] == slug:
            entry["audio"] = True
            matched = True
            break
    if not matched:
        print(f"  Warning: slug '{slug}' not found in index.json — skipping update.")
        return
    INDEX_PATH.write_text(json.dumps(data, indent=2) + "\n")
    print(f"  index.json updated: {slug} → audio: true")


# ── Main pipeline ──────────────────────────────────────────────────────────

def narrate(md_path_str: str, voice: str, force: bool) -> None:
    md_path = Path(md_path_str)
    if not md_path.exists():
        sys.exit(f"Error: {md_path} not found.")

    slug = md_path.stem
    out_path = AUDIO_DIR / f"{slug}.mp3"
    script_preview_path = Path(f"/tmp/{slug}_narration_script.txt")

    if out_path.exists() and not force:
        print(f"Audio already exists: {out_path}")
        print("Use --force to regenerate.")
        return

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Gemini scriptwriting
    print(f"\n[1/3] Scriptifying '{slug}' via Gemini 1.5 Flash...")
    raw_md = strip_frontmatter(md_path.read_text(encoding="utf-8"))
    script = gemini_scriptify(raw_md, save_script_path=script_preview_path)
    print(f"  Script length: {len(script):,} chars")

    # Step 2: Chunk and synthesize
    print(f"\n[2/3] Synthesizing via Google TTS ({voice})...")
    chunks = chunk_text(script)
    print(f"  Chunked into {len(chunks)} segment(s) for TTS.")
    mp3_bytes = synthesize_chunks(chunks, voice_name=voice)

    out_path.write_bytes(mp3_bytes)
    size_mb = len(mp3_bytes) / 1_048_576
    print(f"  Written: {out_path} ({size_mb:.1f} MB)")

    # Step 3: Update index.json
    print(f"\n[3/3] Updating posts/index.json...")
    update_index(slug)

    print(f"\n✓ Done. Review the Gemini script before committing:")
    print(f"  cat {script_preview_path}")
    print(f"\n  Then commit with:")
    print(f"  git add assets/audio/{slug}.mp3 posts/index.json")
    print(f"  git commit -m 'feat: add audio narration for {slug}'")


# ── CLI ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate an MP3 narration for a blog post via Gemini + Google TTS."
    )
    parser.add_argument(
        "post",
        help="Path to the Markdown post (e.g., posts/sr11-7.md)",
    )
    parser.add_argument(
        "--voice",
        default="en-US-Journey-D",
        help=(
            "Google TTS voice name (default: en-US-Journey-D). "
            "Journey options: Journey-D (male), Journey-F (female), Journey-O (female)."
        ),
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate audio even if it already exists.",
    )
    args = parser.parse_args()
    narrate(args.post, voice=args.voice, force=args.force)
