# Jude Voice + Knowledge Setup

## Architecture

- **OpenAI Realtime API** — listens via microphone, reasons, calls RAG tool
- **RAG** — searches `content/jude-website-package` (167 chunks from your zip)
- **ElevenLabs** — speaks Jude's responses in a warm custom voice

## 1. API keys

Copy `apps/demo/.env.example` to `apps/demo/.env.local`:

```bash
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Good mode — Southern charm, older lady (Jude Good — Southern Matriarch)
ELEVENLABS_VOICE_ID_GOOD=NsgfkY3cyxRG0efoRKYW

# Evil mode — devilish / robotic delivery (Jude Evil — Devilish Robot)
ELEVENLABS_VOICE_ID_EVIL=jEPqu2Z6cBH4GJyan8ZY

# Optional fallback if GOOD/EVIL not set
ELEVENLABS_VOICE_ID=...
```

### Picking voices in ElevenLabs

Jude ships with two **custom voices** created via ElevenLabs Voice Design (saved in your ElevenLabs account as **Jude Good - Southern Matriarch** and **Jude Evil - Devilish Robot**). To swap them later:

1. Open [ElevenLabs → My Voices](https://elevenlabs.io/app/voice-lab)
2. Create or pick replacements
3. Copy each voice ID (⋯ → Copy voice ID)
4. Update `ELEVENLABS_VOICE_ID_GOOD` / `ELEVENLABS_VOICE_ID_EVIL` in `.env.local` and on Vercel

**Production (jude.one):** add the same voice ID env vars to the Vercel **jude-demo** project — the voices must belong to the same ElevenLabs account as `ELEVENLABS_API_KEY`.

The **Good / Evil toggle** on jude.one switches both:

- **Personality** (OpenAI Realtime instructions — what Jude writes)
- **Voice** (ElevenLabs voice ID + TTS settings)

Toggle mode before tapping the orb, or switch mid-session (the voice session stops and reconnects on the next tap).

## 2. Build the knowledge index

```bash
npm run build:knowledge
```

Run again with `OPENAI_API_KEY` set to generate semantic embeddings (recommended).

## 3. Run the demo

```bash
npm run dev:demo
```

Open http://localhost:3002 and **tap the orange orb** to talk to Jude.

## Marketing content pages

Benefit pages from the zip are served at `/[slug]` on urjude.com, e.g.:

- `/medication-reminders`
- `/why-jude-is-different`
- `/home-benefits`

Content lives in `content/jude-website-package/`.
