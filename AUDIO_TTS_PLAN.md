# Audio TTS Feature — Formal Plan

**Branch:** `audio-tts-experiment`
**Status:** Planning / Pre-implementation
**Goal:** One-time, per-post audio narrations generated via Gemini (scriptwriting) → Google Cloud TTS (synthesis), served as static MP3s with an in-page audio player.

---

## Critique of the Initial Gemini Plan

The Gemini-generated plan is architecturally sound and the core "Script-to-Speech pipeline" idea is the right framing. But several practical gaps need addressing before implementation.

### What It Gets Right

- Using Gemini as a scriptwriter before TTS is the correct call. Feeding raw Markdown to a TTS engine produces an unlistenable mess of backticks, footnote markers, and `> [!NOTE]` strings.
- Journey/Neural2 voices are the right quality tier. Standard TTS voices sound like 2012.
- Frontmatter flags + existence checks as the trigger guard is the right pattern — prevents re-running Gemini on every typo fix.
- Committing audio back to the repo is the right hosting strategy for a GitHub Pages site with no backend.

### What It Gets Wrong or Misses

**1. Google TTS has a 5,000-character hard limit per synthesis request.**
The sr11-7 post is ~3,200 words. The spoken script Gemini produces from it could easily be 15,000–18,000 characters. Sending that to the TTS API in one shot will fail with a `InvalidArgument` error. The implementation needs a chunking strategy: split the script at sentence or paragraph boundaries, make multiple TTS calls, and concatenate the resulting audio buffers before writing the MP3. The Gemini plan doesn't mention this at all.

**2. The GitHub Action committing audio back will trigger the CI workflow.**
The existing `ci.yml` fires on all pushes across all branches. A robot push of `assets/audio/*.mp3` will re-trigger CI, which will re-run linting. That's harmless but noisy. More dangerously, if the narration action isn't carefully gated, it could re-trigger *itself*. The commit message filter approach (`[gen audio]`) helps, but the action needs an explicit `if` guard on that pattern.

**3. The plan assumes Jekyll/Hugo frontmatter processing. This blog has none.**
The site is a hand-rolled static site. `post.html` reads Markdown files directly via fetch + marked.js. There is no build step that processes `audio: true` from frontmatter and injects a `<source>` tag. The blog's actual data layer is `posts/index.json`. The `audio` field needs to go there, and `post.html` needs client-side logic to conditionally render the player.

**4. Git LFS gets a "pro-tip" footnote. It should be a first-class decision.**
Eight posts at ~3 MB each = ~24 MB of audio today. Growth compounds. Committing binary blobs directly bloats the repo's `.git` history permanently — clones slow down, GitHub may flag it. The decision is: Git LFS from the start, or a separate `audio` branch that gets force-pushed (never grows history), or an external store (Cloudflare R2, etc.). This needs to be decided before the first MP3 is committed.

**5. The Gemini prompt doesn't account for this blog's specific Markdown constructs.**
The prompt handles tables and code blocks, but this blog's posts use: footnote markers (`[^1]`, `[^2]`), GitHub-style alerts (`> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`), inline backtick spans, and section headers used as structural signposts. The prompt needs explicit handling for each. Specifically: footnote references in the body should be stripped silently; footnote definitions at the bottom should be spoken as "A note on this: …" or omitted; alerts should be read as the human equivalent of an aside.

**6. This is described as "experimental / one-time." A full GitHub Action may be premature.**
If the goal is to generate audio once per post and rarely revisit, a local Python script you run manually is simpler, cheaper to debug, and avoids the complexity of GCP service account credentials in GitHub Secrets. The GitHub Action is a sensible Phase 2 once the local script is proven.

**7. Voice gender/style wasn't chosen.**
`en-US-Journey-D` is a male voice. The blog has a specific first-person voice. This should be an explicit choice, not a default. Available Journey options include `Journey-D` (male), `Journey-F` (female), `Journey-O` (female). All are high quality; the choice should match authorial intent.

---

## Formal Implementation Plan

### Architecture Decision: Storage

**Decision: Git LFS for audio assets.**

- Enable LFS on the repo for `*.mp3` before committing any audio.
- Track `assets/audio/*.mp3` via LFS.
- Cost: GitHub provides 1 GB LFS storage free; 8 posts × ~3 MB ≈ 24 MB, well within limit.
- Alternative (if LFS is undesirable): a dedicated `audio` orphan branch where files are force-pushed, with raw GitHub URLs used as sources in `index.json`. More brittle; LFS is cleaner.

### Directory Structure

```
assets/
  audio/           ← new; tracked via Git LFS
    .gitkeep

scripts/
  narrate.py       ← new; local generation script
  requirements.txt ← new; google-generativeai, google-cloud-texttospeech, pydub

.github/
  workflows/
    ci.yml         ← existing; no changes needed for Phase 1
    narrate.yml    ← new (Phase 2 only); GitHub Action for auto-narration
```

### Phase 1: Local Script (Implement First)

The goal of Phase 1 is a working local script you can run once per post when you decide a post is "ready to voice."

**`scripts/narrate.py` — core logic:**

```python
#!/usr/bin/env python3
"""
narrate.py — Script-to-Speech pipeline for wesslen.github.io
Usage: python narrate.py posts/sr11-7.md
"""
import os, sys, re, json, textwrap
from pathlib import Path
import google.generativeai as genai
from google.cloud import texttospeech
from pydub import AudioSegment
import io

AUDIO_DIR = Path("assets/audio")
INDEX_PATH = Path("posts/index.json")
CHUNK_LIMIT = 4800  # characters; stay under GCP's 5,000-char hard limit

def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter block."""
    if text.startswith("---"):
        end = text.index("---", 3)
        return text[end + 3:].strip()
    return text

def gemini_scriptify(md_content: str) -> str:
    """Pass Markdown to Gemini; get back a natural narration script."""
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = textwrap.dedent(f"""
        You are converting a technical blog post into a natural audio narration script.
        The blog has a first-person, conversational voice — wry, direct, occasionally self-aware.
        Preserve that tone. Do not make it sound like a corporate explainer.

        Rules:
        - Do NOT output any Markdown syntax (no **, no #, no backticks, no brackets).
        - Strip all footnote markers like [^1] from the body silently.
        - Footnote definitions at the bottom (lines starting with [^N]:) should be
          converted to natural asides: "A quick note here: ..." — include only the
          most important ones; omit minor citation footnotes.
        - For GitHub-style alerts (lines starting with "> [!NOTE]", "> [!WARNING]", etc.):
          read them as "As a side note: ..." or "Worth flagging: ..." depending on severity.
        - For code blocks: do NOT read the code. Say what the code accomplishes in one
          or two plain sentences.
        - For tables: say "To give you a sense of the numbers:" then summarize the key
          takeaway in two sentences. Do not read every cell.
        - Section headers: read them as natural transitions, not announcements.
          E.g., "## Why This Matters" → "So why does this matter?"
        - Use natural spoken contractions (it's, don't, we've) where they fit.

        Here is the blog post:

        {md_content}
    """)

    response = model.generate_content(prompt)
    return response.text

def chunk_text(text: str, limit: int = CHUNK_LIMIT) -> list[str]:
    """Split text at paragraph/sentence boundaries to stay under TTS char limit."""
    chunks, current = [], ""
    for para in text.split("\n\n"):
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 2 <= limit:
            current += ("\n\n" if current else "") + para
        else:
            if current:
                chunks.append(current)
            # If a single paragraph exceeds limit, split at sentence boundaries
            if len(para) > limit:
                sentences = re.split(r'(?<=[.!?])\s+', para)
                current = ""
                for s in sentences:
                    if len(current) + len(s) + 1 <= limit:
                        current += (" " if current else "") + s
                    else:
                        if current:
                            chunks.append(current)
                        current = s
            else:
                current = para
    if current:
        chunks.append(current)
    return chunks

def synthesize_chunks(chunks: list[str], voice_name: str = "en-US-Journey-D") -> bytes:
    """Send each chunk to Google TTS and concatenate into a single MP3."""
    client = texttospeech.TextToSpeechClient()
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", name=voice_name
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    segments = []
    for i, chunk in enumerate(chunks):
        print(f"  Synthesizing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=chunk),
            voice=voice,
            audio_config=audio_config,
        )
        segments.append(AudioSegment.from_mp3(io.BytesIO(response.audio_content)))

    combined = segments[0]
    for seg in segments[1:]:
        combined += AudioSegment.silent(duration=400) + seg  # 400ms pause between chunks

    buf = io.BytesIO()
    combined.export(buf, format="mp3")
    return buf.getvalue()

def update_index(slug: str):
    """Set audio: true on the matching entry in posts/index.json."""
    data = json.loads(INDEX_PATH.read_text())
    for entry in data:
        if entry["slug"] == slug:
            entry["audio"] = True
            break
    INDEX_PATH.write_text(json.dumps(data, indent=2) + "\n")
    print(f"  Updated index.json: {slug} → audio: true")

def narrate(md_path: str, voice: str = "en-US-Journey-D", force: bool = False):
    md_path = Path(md_path)
    slug = md_path.stem
    out_path = AUDIO_DIR / f"{slug}.mp3"

    if out_path.exists() and not force:
        print(f"Audio already exists for '{slug}'. Use --force to regenerate.")
        return

    print(f"[1/3] Scriptifying '{slug}' via Gemini...")
    raw_md = strip_frontmatter(md_path.read_text())
    script = gemini_scriptify(raw_md)

    print(f"[2/3] Synthesizing {len(script):,} chars via Google TTS...")
    chunks = chunk_text(script)
    print(f"  Split into {len(chunks)} chunk(s).")
    mp3_bytes = synthesize_chunks(chunks, voice_name=voice)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(mp3_bytes)
    size_mb = len(mp3_bytes) / 1_048_576
    print(f"  Written: {out_path} ({size_mb:.1f} MB)")

    print(f"[3/3] Updating index.json...")
    update_index(slug)

    print(f"Done. Review the script quality before committing:\n  cat /tmp/{slug}_script.txt")
    Path(f"/tmp/{slug}_script.txt").write_text(script)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("post", help="Path to markdown post, e.g. posts/sr11-7.md")
    parser.add_argument("--voice", default="en-US-Journey-D",
                        help="TTS voice name (default: en-US-Journey-D)")
    parser.add_argument("--force", action="store_true",
                        help="Regenerate even if audio already exists")
    args = parser.parse_args()
    narrate(args.post, voice=args.voice, force=args.force)
```

**`scripts/requirements.txt`:**

```
google-generativeai>=0.7.0
google-cloud-texttospeech>=2.16.0
pydub>=0.25.1
```

> [!NOTE]
> `pydub` requires `ffmpeg` for MP3 concatenation. Install via `brew install ffmpeg` on macOS.

### Phase 1: Frontend Changes

**`posts/index.json`** — add `"audio": true` to posts that have been narrated:

```json
{
  "slug": "sr11-7",
  "title": "SR 11-7 at fifteen...",
  "date": "2026-03-29",
  "audio": true,
  ...
}
```

**`post.html`** — add an audio player that conditionally renders when `post.audio === true`. The player should appear between the post header and the article body. Styling: minimal, matches dark/light theme, no custom controls — use the native `<audio>` element to keep it accessible.

```html
<!-- Audio player (injected by JS when post.audio === true) -->
<div id="audio-player" class="audio-player" hidden>
  <span class="audio-label">🎧 Listen to this post</span>
  <audio controls preload="none">
    <source id="audio-src" src="" type="audio/mpeg" />
  </audio>
</div>
```

The JS initialization logic (in `post.html`'s existing script block) sets the `src` and removes `hidden` when `meta.audio === true`:

```js
if (meta.audio) {
  const player = document.getElementById("audio-player");
  const src = document.getElementById("audio-src");
  src.src = `./assets/audio/${slug}.mp3`;
  player.removeAttribute("hidden");
}
```

CSS additions to `style.css`:

```css
.audio-player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 2rem;
  background: var(--surface-1);
}

.audio-player audio {
  flex: 1;
  height: 36px;
}

.audio-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
}
```

### Phase 2: GitHub Action (Stretch Goal)

Only implement Phase 2 after Phase 1 is working and at least two posts have been narrated locally and verified. The Phase 2 action automates narration on pushes where the commit message includes `[gen audio]`.

Key fixes over the Gemini plan's version:

```yaml
name: Narrate Blog Post
on:
  push:
    branches: [main]
    paths: ["_posts/**.md", "posts/**.md"]

jobs:
  narrate:
    # Only run if commit message contains [gen audio]
    if: contains(github.event.head_commit.message, '[gen audio]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          lfs: true   # ← required for Git LFS

      - name: Install ffmpeg
        run: sudo apt-get install -y ffmpeg

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install Python deps
        run: pip install -r scripts/requirements.txt

      - name: Get changed post files
        id: changed
        run: |
          FILES=$(git diff-tree --no-commit-id --name-only -r ${{ github.sha }} \
            | grep '^posts/.*\.md$' | grep -v 'index.json' || true)
          echo "files=$FILES" >> $GITHUB_OUTPUT

      - name: Generate narrations
        if: steps.changed.outputs.files != ''
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GOOGLE_APPLICATION_CREDENTIALS: /tmp/gcp_key.json
        run: |
          echo '${{ secrets.GCP_SA_KEY }}' > /tmp/gcp_key.json
          for f in ${{ steps.changed.outputs.files }}; do
            python scripts/narrate.py "$f" --force
          done

      - name: Commit audio + updated index
        run: |
          git config user.email "action@github.com"
          git config user.name "GitHub Actions"
          git add assets/audio/*.mp3 posts/index.json
          git commit -m "Auto-narrate: $(echo '${{ steps.changed.outputs.files }}' \
            | xargs -I{} basename {} .md | tr '\n' ' ') [skip ci]" || echo "Nothing to commit"
          git push
```

> [!WARNING]
> The `[skip ci]` tag in the commit message is critical. Without it, the robot push will retrigger the narration action, and you'll have an infinite loop.

### GCP Setup Checklist (One-Time)

1. Create a GCP project (or use an existing one with billing enabled).
2. Enable the **Cloud Text-to-Speech API** in the project.
3. Create a Service Account with the **Cloud Text-to-Speech User** role.
4. Generate and download a JSON key for the Service Account.
5. Add `GCP_SA_KEY` (the JSON key contents) and `GEMINI_API_KEY` to GitHub Secrets.

### Git LFS Setup Checklist (One-Time, Before First MP3)

```bash
git lfs install
git lfs track "*.mp3"
git add .gitattributes
git commit -m "chore: track MP3s via Git LFS"
```

---

## Implementation Order

| Step | What | Phase |
|------|------|-------|
| 1 | Enable Git LFS, commit `.gitattributes` | 1 |
| 2 | Create `assets/audio/.gitkeep`, `scripts/` directory | 1 |
| 3 | Write `narrate.py` and `requirements.txt` | 1 |
| 4 | Update `post.html` with audio player HTML + JS | 1 |
| 5 | Update `style.css` with audio player styles | 1 |
| 6 | Test locally: run `narrate.py` on one post (e.g., `welcome-to-the-machine.md`) | 1 |
| 7 | Review the `/tmp/{slug}_script.txt` output for prompt quality | 1 |
| 8 | Iterate on the Gemini prompt if the script sounds off | 1 |
| 9 | Commit audio + updated `index.json` | 1 |
| 10 | Narrate remaining posts (one at a time, verify each) | 1 |
| 11 | Implement `narrate.yml` GitHub Action | 2 |

---

## Open Questions

- **Voice selection:** `en-US-Journey-D` (male) is the default in the plan. Is this the right fit for the blog's first-person voice? Worth generating a 30-second sample from each Journey variant before committing.
- **Footnote handling:** The Gemini prompt above converts major footnotes to spoken asides. But some footnotes are just citations — those should probably be silently dropped. May need to categorize footnotes in the prompt by type.
- **Cost:** Gemini Flash is cheap (~$0.075/1M input tokens). Cloud TTS Journey voices are ~$0.000016/character. A 3,000-word post ≈ 18,000 chars of script ≈ ~$0.29 per post. Eight posts ≈ ~$2.30 total. Negligible, but worth knowing.
- **Player UX:** Should the player show estimated duration? Should it remember playback position (localStorage)? For now, the native `<audio>` element handles this automatically with no extra code.
