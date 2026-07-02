# Jude

A wall-mounted home AI that's a member of the family.

| Domain | Purpose | App |
|--------|---------|-----|
| [jude.one](https://jude.one) | Demo interface (wall-mounted UI) | `apps/demo` |
| [urjude.com](https://urjude.com) | Marketing & account registration | `apps/marketing` |

## Quick commands

| Say | Action |
|-----|--------|
| **67** | Start local dev server (or reset if blank) |
| **42** | Push to GitHub and deploy to Vercel production |

## Voice (jude.one demo)

OpenAI Realtime + RAG + ElevenLabs. See [VOICE.md](./VOICE.md).

```bash
cp apps/demo/.env.example apps/demo/.env.local
# add OPENAI_API_KEY and ELEVENLABS_API_KEY
npm run build:knowledge
npm run dev:demo
```

Tap the orange orb at http://localhost:3002 to talk to Jude.

## Content pages (urjude.com)

37 benefit pages from `content/jude-website-package/` — e.g. `/medication-reminders`, `/why-jude-is-different`.

After editing content:

```bash
npm run build:site-data
npm run build:knowledge
```

## Local development

```bash
npm install

# Demo interface (jude.one) — http://localhost:3002
npm run dev:demo

# Marketing site (urjude.com) — http://localhost:3001
npm run dev:marketing
```

## Deploy

Both apps deploy as separate Vercel projects from this monorepo:

- `apps/demo` → jude.one
- `apps/marketing` → urjude.com

```bash
npm run 42
```

## DNS (GoDaddy)

See [DNS.md](./DNS.md) for records to add at GoDaddy.
