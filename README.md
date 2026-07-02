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

## Local development

```bash
npm install

# Demo interface (jude.one) — http://localhost:3000
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
