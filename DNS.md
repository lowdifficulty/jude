# DNS Configuration for GoDaddy

Add these records in GoDaddy DNS for each domain. Vercel handles SSL automatically once DNS propagates (usually 5–30 minutes, up to 48 hours).

---

## jude.one

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `76.76.21.21` | 600 (or default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 600 (or default) |

In Vercel project **jude-demo** (or your demo project name), add domains:
- `jude.one`
- `www.jude.one`

---

## urjude.com

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `76.76.21.21` | 600 (or default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 600 (or default) |

In Vercel project **jude-marketing** (or your marketing project name), add domains:
- `urjude.com`
- `www.urjude.com`

---

## GoDaddy steps

1. Log in to [GoDaddy](https://www.godaddy.com) → **My Products** → **DNS** for each domain.
2. Remove any conflicting **A** or **CNAME** records for `@` and `www` that point elsewhere.
3. Add the records above.
4. In [Vercel Dashboard](https://vercel.com/dashboard) → each project → **Settings** → **Domains**, add the apex and `www` hostnames.
5. Wait for Vercel to show **Valid Configuration** (green check).

## Notes

- `76.76.21.21` is Vercel's anycast IP for apex domains.
- If GoDaddy offers a "forward only" option for `www`, prefer the **CNAME** to `cname.vercel-dns.com` instead.
- After DNS is live, both sites get HTTPS from Vercel automatically.
