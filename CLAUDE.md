# rangeiqpoker.com — marketing site

Static HTML, no build step. **Every push to `main` deploys to production via Vercel within ~1 minute.** There is no staging; treat every commit as live.

Run `node scripts/validate-meta.js` before every push. It is the executable form of the rules below — if this file and the validator ever disagree, fix both together.

## SEO & Brand Positioning Guidelines

### The entity

- Product name is **"RangeIQ"** — in `<title>` suffixes, JSON-LD `name`, and prose. **"RangeIQ Poker"** is the *organization/site* name only: `og:site_name`, the Organization node, and JSON-LD `alternateName`.
- The canonical structured-data identity is the WebApplication node with `@id: https://rangeiqpoker.com/#app`. Its full text lives in **`index.html`** and, byte-identical, in **`D:/code/rangeiq/index.html`** (both domains declare the same `@id`, so they must never disagree). The reference copy is `CANONICAL_ENTITY` in `scripts/validate-meta.js` — edit all three together, verify with `node scripts/validate-meta.js --app D:/code/rangeiq/index.html`.
- `applicationCategory` is **always `EducationalApplication`** — never `GameApplication`. This is compliance-load-bearing: it supports the "not a gambling product" posture.
- Article pages describe the product via the standard inline `about` mini-node (same `@id`, `name: "RangeIQ"`, `alternateName`, `EducationalApplication`) — copy it from any recent article; do not invent variants.

### Banned in metadata, headings, and schema (validator-enforced)

| Never write | Because |
|---|---|
| "real-time" anything | RangeIQ is a between-sessions study tool; "not for use during live play" is the compliance line |
| RangeIQ as a "solver" | Brand rule: it is a **"simplified node-locking engine"**. ("Solver" describing GTO tools as a category is fine — that contrast is the pitch) |
| "archetypes" | Customer-facing term is **"opponent types"** (internal engine keys keep their names) |
| "tournaments" | Positioning is live cash $1/$2–$5/$10 only |
| Profit promises ("save $X per session", "win $X") | No dollar-outcome claims, ever |
| "maximally profitable …" | Pre-compliance wording scrubbed June 2026 — do not reintroduce |
| Hype words per brand skill | "crushing it", "game-changer", "unlock" (except the CTA "Unlock Full IQ"), etc. |

### Canonical facts (keep copy consistent with these)

- Pricing: Free tier · **Pro $14.99/month or $119/year** (yearly ≈ 34% off), billed via Paddle. Both offers belong in schema wherever offers appear.
- Free tier: unlimited preflop analysis, **2 postflop spots/day, limited opponent types**, 1 drill/day, 3-spot Study Vault. (Do not claim all 9 opponent types are free.)
- **9 opponent types**: Nit, TAG, LAG, Young Aggro, Loose Passive, Calling Station, Maniac, Recreational, Unknown/Mixed.
- Bets are described in **dollars**, never big blinds.
- Domains: marketing `rangeiqpoker.com` · app `app.rangeiqpoker.com`. A Between the Cards product by IQ Digital Holdings LLC; founder Kenneth Jayne.

### Title convention

`Page Title | RangeIQ` — ≤60 characters, suffix exactly `| RangeIQ`. Exceptions live in `TITLE_ALLOWLIST` in the validator, each with a reason.

### New-page checklist

1. Generate with `scripts/new-post.js` (never hand-copy an old page).
2. Replace every `TODO:` placeholder — meta description, og:description, twitter:description, JSON-LD description + keywords. The validator blocks any `TODO:` from shipping.
3. Confirm: canonical link · OG + Twitter tags incl. images · JSON-LD Article with the standard `about` mini-node · gtag consent-default block · sitemap entry with `<lastmod>`.
4. If the page is notable, add it to `llms.txt`.
5. `node scripts/validate-meta.js` → green → push.

### Voice & positioning source of truth

The full brand voice/copy rules (currency, capitalization, banned hype list, opponent-type count, compliance language) live in the app repo: `D:/code/rangeiq/.claude/skills/rangeiq-brand-guidelines/SKILL.md`. This file covers only what's specific to this site's metadata and structure.
