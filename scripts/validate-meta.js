#!/usr/bin/env node
// ============================================================================
// validate-meta.js — metadata / structured-data guard for rangeiqpoker.com
// ============================================================================
// Run before EVERY push:   node scripts/validate-meta.js
// Cross-repo entity diff:  node scripts/validate-meta.js --app D:/code/rangeiq/index.html
//
// WHY THIS EXISTS. The June-2026 compliance pass scrubbed "maximally
// profitable counter-strategies", "archetypes", and GameApplication from the
// app's metadata — and the marketing site's index.html silently kept the old
// wording for two months because nothing checked. This script makes the
// canonical entity (and the banned-terms list) executable instead of tribal.
//
// Checks, per *.html in the repo root:
//   1. Every <script type="application/ld+json"> block parses as JSON.
//   2. Banned patterns are absent from <head>, all JSON-LD, and <h1>-<h3>:
//      archetype / real-time / GameApplication / tournament / "save $N" /
//      "maximally profitable" / TODO:   (body prose is deliberately NOT
//      scanned — legacy article text is a separate editorial cleanup).
//   3. Every WebApplication node uses name "RangeIQ" and (when it declares a
//      category) applicationCategory "EducationalApplication".
//   4. index.html's #app entity node deep-equals CANONICAL_ENTITY below.
//   5. Every page has a canonical <link>; titles end in "| RangeIQ" unless
//      allowlisted.
// With --app <path>: the app repo file's WebApplication node must deep-equal
// CANONICAL_ENTITY too (the two domains share @id — they must agree).
// ============================================================================

"use strict";
const fs = require("fs");
const path = require("path");

// ── The canonical entity ─────────────────────────────────────────────────────
// THE single source of truth for RangeIQ's structured-data identity. Any edit
// here must be mirrored into index.html AND D:/code/rangeiq/index.html.
const CANONICAL_ENTITY = {
  "@type": "WebApplication",
  "@id": "https://rangeiqpoker.com/#app",
  "url": "https://app.rangeiqpoker.com",
  "name": "RangeIQ",
  "alternateName": "RangeIQ Poker",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires HTML5 compatible browser. No installation required.",
  "publisher": { "@id": "https://rangeiqpoker.com/#org" },
  "description": "RangeIQ is a poker education and training tool for live cash games from $1/$2 to $5/$10. You study spots between sessions against 9 opponent types using a simplified node-locking engine, plain-English IQ Reasoning, and bet sizing in real dollars — educational use only, not for use during live play.",
  "featureList": [
    "Simplified node-locking engine for exploit-based study",
    "9 opponent types: Nit, TAG, LAG, Young Aggro, Loose Passive, Calling Station, Maniac, Recreational, Unknown/Mixed",
    "IQ Reasoning — plain-English explanations locked to deterministic engine math",
    "Bet sizing in real dollars for live $1/$2 through $5/$10 cash games",
    "Preflop range builder for live table dynamics",
    "Daily exploit drills with EV scoring",
    "Study Vault for saving and replaying analyzed spots",
    "Leak Hunter for identifying systematic strategy errors"
  ],
  "keywords": [
    "poker training tool",
    "exploitative poker strategy",
    "live cash game poker study",
    "simplified node-locking",
    "poker opponent types",
    "bet sizing in dollars",
    "poker study between sessions",
    "poker education"
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Tier",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Unlimited preflop analysis, 2 postflop spots per day, limited opponent types, 1 drill per day, 3-spot Study Vault"
    },
    {
      "@type": "Offer",
      "name": "RangeIQ Pro — Monthly",
      "price": "14.99",
      "priceCurrency": "USD",
      "description": "All 9 opponent types, unlimited postflop analysis, full drills, range builder, unlimited Study Vault, Leak Hunter — billed monthly"
    },
    {
      "@type": "Offer",
      "name": "RangeIQ Pro — Annual",
      "price": "119",
      "priceCurrency": "USD",
      "description": "Everything in Pro, billed yearly — about 34% less than paying monthly"
    }
  ]
};

// Banned in <head>, JSON-LD, and <h1>-<h3>. Each entry: [regex, reason].
const BANNED = [
  [/archetype/i, 'customer-facing copy says "opponent types", never "archetypes"'],
  [/real[- ]time/i, "RangeIQ is a between-sessions study tool — never real-time"],
  [/GameApplication/, "applicationCategory must be EducationalApplication (not-a-gambling-product posture)"],
  [/tournament/i, "positioning is live cash $1/$2-$5/$10 only"],
  [/save \$\d/i, "no dollar-outcome / profit-promise claims"],
  [/maximally profitable/i, "pre-compliance wording, scrubbed June 2026"],
  [/TODO:/, "unfilled template placeholder"],
];

// Pages whose <title> need not end in "| RangeIQ".
const TITLE_ALLOWLIST = new Set([
  "index.html",              // brand-leading title
  "vs-gto-wizard.html",      // deliberate positioning suffix
  "gto-wizard-vs-rangeiq.html", // brand mid-title, already 90+ chars
  "about.html",              // brand-leading title
]);

// ── Helpers ──────────────────────────────────────────────────────────────────
function stableStringify(x) {
  if (Array.isArray(x)) return "[" + x.map(stableStringify).join(",") + "]";
  if (x && typeof x === "object") {
    return "{" + Object.keys(x).sort().map(k => JSON.stringify(k) + ":" + stableStringify(x[k])).join(",") + "}";
  }
  return JSON.stringify(x);
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}

function* webApplicationNodes(parsed) {
  const walk = function* (node) {
    if (Array.isArray(node)) { for (const x of node) yield* walk(x); return; }
    if (node && typeof node === "object") {
      if (node["@type"] === "WebApplication") yield node;
      for (const v of Object.values(node)) yield* walk(v);
    }
  };
  yield* walk(parsed);
}

function findEntityNode(parsed) {
  for (const n of webApplicationNodes(parsed)) {
    if (n["@id"] === "https://rangeiqpoker.com/#app" && n.featureList) return n;
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, "..");
const appArgIdx = process.argv.indexOf("--app");
const appPath = appArgIdx > -1 ? process.argv[appArgIdx + 1] : null;

const problems = [];
const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));

for (const file of files) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : "";
  const headings = (html.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) || []).join("\n");
  const ldBlocks = extractJsonLd(html);

  // 1. JSON-LD must parse
  const parsedBlocks = [];
  ldBlocks.forEach((raw, i) => {
    try { parsedBlocks.push(JSON.parse(raw)); }
    catch (e) { problems.push(`${file}: JSON-LD block #${i + 1} does not parse — ${e.message}`); }
  });

  // 2. Banned patterns in head + JSON-LD + headings
  const scanZones = [["<head>", head], ["headings", headings], ...ldBlocks.map((b, i) => [`JSON-LD #${i + 1}`, b])];
  for (const [zone, text] of scanZones) {
    for (const [re, reason] of BANNED) {
      const m = text.match(re);
      if (m) problems.push(`${file} [${zone}]: banned term "${m[0]}" — ${reason}`);
    }
  }

  // 3. WebApplication naming/category rules
  for (const parsed of parsedBlocks) {
    for (const node of webApplicationNodes(parsed)) {
      // Competitor mentions (e.g. GTO Wizard SoftwareApplication) are @type
      // SoftwareApplication, so this only governs RangeIQ nodes.
      if (node.name && node.name !== "RangeIQ") {
        problems.push(`${file}: WebApplication name "${node.name}" — canonical name is "RangeIQ" (use alternateName for "RangeIQ Poker")`);
      }
      if (node.applicationCategory && node.applicationCategory !== "EducationalApplication") {
        problems.push(`${file}: WebApplication applicationCategory "${node.applicationCategory}" — must be EducationalApplication`);
      }
    }
  }

  // 4. index.html entity node must equal the canonical constant
  if (file === "index.html") {
    let entity = null;
    for (const parsed of parsedBlocks) entity = entity || findEntityNode(parsed);
    if (!entity) problems.push("index.html: canonical #app WebApplication node not found");
    else if (stableStringify(entity) !== stableStringify(CANONICAL_ENTITY)) {
      problems.push("index.html: #app entity node differs from CANONICAL_ENTITY in scripts/validate-meta.js — the two must be edited together");
    }
  }

  // 5. Canonical link + title convention
  if (!/<link\s+rel="canonical"/i.test(head)) {
    problems.push(`${file}: missing <link rel="canonical">`);
  }
  const t = head.match(/<title>([\s\S]*?)<\/title>/i);
  if (!t) problems.push(`${file}: missing <title>`);
  else if (!TITLE_ALLOWLIST.has(file) && !/\|\s*RangeIQ\s*$/.test(t[1].trim())) {
    problems.push(`${file}: title "${t[1].trim()}" does not end in "| RangeIQ" (add to TITLE_ALLOWLIST only with a reason)`);
  }
}

// ── --app cross-repo entity diff ─────────────────────────────────────────────
if (appPath) {
  try {
    const appHtml = fs.readFileSync(appPath, "utf8");
    let appEntity = null;
    for (const raw of extractJsonLd(appHtml)) {
      try { appEntity = appEntity || findEntityNode(JSON.parse(raw)); } catch (e) {
        problems.push(`--app ${appPath}: JSON-LD does not parse — ${e.message}`);
      }
    }
    if (!appEntity) problems.push(`--app ${appPath}: canonical #app WebApplication node not found`);
    else if (stableStringify(appEntity) !== stableStringify(CANONICAL_ENTITY)) {
      problems.push(`--app ${appPath}: entity node differs from CANONICAL_ENTITY — both domains declare the same @id and must agree`);
    }
  } catch (e) {
    problems.push(`--app ${appPath}: ${e.message}`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`\n✗ validate-meta: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error("  · " + p);
  console.error("");
  process.exit(1);
}
console.log(`✓ validate-meta: ${files.length} pages clean${appPath ? " (+ app entity node matches)" : ""}`);
