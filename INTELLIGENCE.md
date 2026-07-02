# How to Train Jude with Intelligence

This guide explains the best way to give Jude knowledge so voice, onboarding, and future automations stay accurate, warm, and useful.

## Where Jude gets intelligence today

| Layer | Location | Purpose |
|-------|----------|---------|
| Marketing & SEO content | `content/jude-website-package/pages/*.md` | Benefit stories, FAQs, product positioning |
| Connection map | `content/jude-website-package/06-jude-connections-and-benefits.md` | Integrations, APIs, device links, home assistant benefits |
| Built RAG index | `apps/demo/knowledge/index.json` | Semantic search for voice (`npm run build:knowledge`) |
| Admin training dumps | `/admin` on jude.one → `knowledge/admin-overrides.json` | Fast additions without redeploying all content |
| Admin markdown archive | `content/jude-website-package/training/admin-dumps.md` | Durable training history for rebuilds |
| System prompt | `apps/demo/src/lib/jude-system-prompt.ts` | Personality, pricing, compliance rules |

## Best practices for training content

### 1. Write for voice, not for SEO stuffing

Jude speaks answers aloud. Prefer:

- Short paragraphs (2–4 sentences)
- Plain English a senior can understand
- One idea per training dump

Bad: "Jude leverages synergistic AI-enabled holistic wellness paradigms…"

Good: "Jude can remind you when blood pressure readings are due and save the results for your doctor visit."

### 2. Chunk by topic

RAG works best with **focused chunks** (~900 characters). Create separate dumps for:

- One device (Hero dispenser, Nest thermostat)
- One benefit category (medication, fall prevention)
- One integration (Gmail triage, SmartThings hub)

### 3. Use the benefits framing

Structure dumps as:

1. **What Jude connects to**
2. **What Jude does** (supports / helps / reminds)
3. **Who it helps** (senior, family, caregiver)
4. **Optional:** link to urjude.com benefit page

Never promise diagnoses, cures, or guaranteed medical outcomes.

### 4. Keep facts stable in markdown; keep experiments in admin

- **Permanent product facts** → `content/jude-website-package/`
- **Quick experiments & scripts** → `/admin` on jude.one (username `9`, password `9`)

After large markdown changes, run:

```bash
npm run build:knowledge
```

With `OPENAI_API_KEY` set for semantic embeddings.

### 5. Phase integrations honestly

**Phase 1 (high impact):** calendar, email, SMS/voice, SmartThings, Hue, Nest, Ring, Spotify, weather, Withings, Hero, video calls.

**Phase 2 (expand):** patient portals, Dexcom, appliances, groceries, rides, streaming deep links.

Tell users what's live vs. planned — Jude should never imply a connection exists before OAuth is built.

## Admin panel workflow

1. Open **https://jude.one/admin**
2. Sign in (default dev credentials: `9` / `9`)
3. Paste training text with a clear title and category
4. Save — entries appear in RAG immediately via `admin-overrides.json`
5. Export JSON for backup or git commit
6. For production persistence on Vercel, commit `admin-overrides.json` or export after sessions

**Production note:** Change credentials with env vars:

- `JUDE_ADMIN_USER`
- `JUDE_ADMIN_PASS`

## Onboarding → intelligence loop

The click-through onboarding at **https://urjude.com/onboarding** captures which hardware categories a family wants. Use that to:

- Recommend one device per category (see `apps/marketing/src/lib/integrations.ts`)
- Prioritize which Phase 1 APIs to OAuth next
- Personalize Jude's first-run script ("I see you use Philips Hue — I can dim the lights at bedtime.")

## Recommended intelligence architecture (next steps)

1. **Structured memory** — store user preferences (quiet hours, favorite music, meds schedule) separately from marketing RAG
2. **Tool registry** — map each Phase 1 API to a Realtime function Jude can call
3. **Device graph** — SmartThings/Matter hub as source of truth for what's in the home
4. **Caregiver consent layer** — explicit sharing rules before health data leaves the home
5. **Evaluation set** — 50 test questions ("What can Jude do for medication?") scored after each knowledge rebuild

## Core promise to encode everywhere

Jude is the **friendly wall-mounted command center** for Home, Health, and Happiness — one orb, one voice, connected to what matters, without complicated apps.
