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
ELEVENLABS_VOICE_ID=...   # optional; pick a warm voice in ElevenLabs dashboard
```

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
