# Jude setup — actions only

## 1. Install

```bash
cd c:\Users\Admin\Jude
npm install
```

## 2. Build content indexes

```bash
npm run build:site-data
npm run build:knowledge
```

Run `build:knowledge` again after adding `OPENAI_API_KEY` (better voice answers).

## 3. Voice keys (jude.one demo)

```bash
copy apps\demo\.env.example apps\demo\.env.local
```

Edit `apps\demo\.env.local`:

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID` (optional)

## 4. Run locally

```bash
npm run dev:marketing
```

→ http://localhost:3001 (urjude.com)

```bash
npm run dev:demo
```

→ http://localhost:3002 (jude.one)

**If the page is blank:** stop the terminal (Ctrl+C), then run the dev command again. Say **67** in chat and I'll restart it for you.

## 5. GoDaddy DNS

**jude.one** and **urjude.com** — each domain:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

## 6. Vercel env vars (jude-demo project)

Add in Vercel → jude-demo → Settings → Environment Variables:

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

## 7. Deploy

Say **42** in chat (push GitHub + Vercel production).
