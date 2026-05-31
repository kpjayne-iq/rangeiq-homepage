#!/usr/bin/env node
/**
 * Scaffold a new article page for rangeiqpoker.com
 *
 * Usage:
 *   node scripts/new-post.js "How to Size Bets Against a Calling Station"
 *
 * What it does:
 *   1. Creates a new HTML file from the article template
 *   2. Adds the URL to sitemap.xml
 *   3. Adds an article card to resources.html
 *   4. Prints next steps
 *
 * The generated page has placeholder sections you fill in:
 *   - Meta description + OG tags
 *   - JSON-LD keywords
 *   - Article body (h2 sections + paragraphs)
 *   - CTA cross-links
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ── Parse args ──────────────────────────────────────────────────
const title = process.argv[2];
if (!title) {
  console.error("\n  Usage: node scripts/new-post.js \"Your Article Title Here\"\n");
  process.exit(1);
}

// ── Derive slug + filename ──────────────────────────────────────
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const filename = slug + ".html";
const filepath = path.join(ROOT, filename);
const url = `https://rangeiqpoker.com/${filename}`;

if (fs.existsSync(filepath)) {
  console.error(`\n  ✗ File already exists: ${filename}\n`);
  process.exit(1);
}

// ── Today's date ────────────────────────────────────────────────
const today = new Date();
const dateStr = today.toISOString().split("T")[0]; // 2026-05-30
const monthYear =
  today.toLocaleString("en-US", { month: "long" }) + " " + today.getFullYear();

// ── Generate HTML ───────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18142420946"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18142420946');
  </script>

  <title>${title} | RangeIQ</title>
  <meta name="description" content="TODO: Write a 150-160 character description targeting your primary keyword.">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="TODO: Write a shorter OG description (100-120 chars).">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="https://rangeiqpoker.com/app-screenshot.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="TODO: Twitter description (under 200 chars).">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="canonical" href="${url}">

  <!-- Structured Data: Article -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "TODO: Match meta description above.",
    "author": {
      "@type": "Organization",
      "name": "RangeIQ Poker",
      "url": "https://rangeiqpoker.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IQ Digital Holdings LLC"
    },
    "datePublished": "${dateStr}",
    "url": "${url}",
    "about": {
      "@type": "WebApplication",
      "name": "RangeIQ Poker",
      "url": "https://app.rangeiqpoker.com",
      "applicationCategory": "GameApplication",
      "description": "Browser-based poker exploit trainer and simplified node-locking engine for live cash games"
    },
    "keywords": ["TODO: add 5-8 target keywords"]
  }
  </script>

  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0B0F14;
      --bg-alt: #0F1620;
      --card: #111827;
      --card-muted: #0D131B;
      --surface: #1F2937;
      --border: rgba(255,255,255,0.08);
      --border-hi: rgba(230,197,102,0.4);
      --text: #E5E7EB;
      --muted: #9CA3AF;
      --faint: #6B7280;
      --gold: #E6C566;
      --gold-dim: #8A7438;
      --green: #10B981;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }

    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      padding-top: 72px;
    }

    /* Top Navigation */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; height: 72px;
      display: flex; align-items: center; z-index: 1000;
      background: rgba(11,15,20,0.82);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 32px; width: 100%;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo {
      font-size: 18px; font-weight: 700; color: var(--text);
      text-decoration: none; display: flex; align-items: center; gap: 8px;
    }
    .nav-logo .logo-grid {
      width: 26px; height: 26px;
      display: grid; grid-template-columns: repeat(3,1fr); gap: 2px;
    }
    .nav-logo .logo-grid span { border-radius: 2px; background: var(--gold); }
    .nav-logo .logo-grid span:nth-child(4),
    .nav-logo .logo-grid span:nth-child(5),
    .nav-logo .logo-grid span:nth-child(7) { background: rgba(255,255,255,0.15); }
    .nav-logo .logo-grid span:nth-child(8),
    .nav-logo .logo-grid span:nth-child(9) { background: rgba(255,255,255,0.08); }
    .nav-logo .logo-iq { color: var(--gold); }
    .nav-links {
      display: flex; align-items: center; gap: 32px; list-style: none;
      margin: 0; padding: 0;
    }
    .nav-links a {
      font-size: 14px; font-weight: 500; color: var(--muted);
      text-decoration: none; transition: color 180ms ease;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-links a.active { color: var(--gold); }
    .nav-cta { display: flex; align-items: center; gap: 16px; }
    .nav-cta .sign-in {
      font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none;
    }
    .nav-cta .sign-in:hover { color: var(--text); }
    .nav-cta .nav-btn-primary {
      height: 40px; padding: 0 18px; border-radius: 8px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%);
      color: var(--bg); font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
      text-decoration: none; display: inline-flex; align-items: center;
      transition: transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(230,197,102,0.2);
    }
    .nav-cta .nav-btn-primary:hover {
      transform: translateY(-1px); box-shadow: 0 10px 28px rgba(230,197,102,0.3);
    }
    .mobile-toggle {
      display: none; background: none; border: none; cursor: pointer; padding: 4px;
    }
    .mobile-toggle span {
      display: block; width: 22px; height: 2px; background: var(--text);
      margin: 5px 0; border-radius: 1px;
    }
    .mobile-signin, .mobile-start { display: none; }
    @media (max-width: 900px) {
      .nav-links {
        display: none; position: fixed; top: 72px; left: 0; right: 0;
        background: var(--bg); flex-direction: column; align-items: stretch;
        gap: 0; padding: 16px 0; margin: 0;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 12px 24px rgba(0,0,0,0.3); list-style: none;
      }
      .nav-links.open { display: flex; }
      .nav-links li { list-style: none; }
      .nav-links a { display: block; padding: 14px 24px; font-size: 17px; }
      .nav-cta { display: none; }
      .nav-links.open .mobile-signin,
      .nav-links.open .mobile-start { display: block; padding: 14px 24px; font-size: 17px; font-weight: 500; text-decoration: none; border-top: 1px solid rgba(255,255,255,0.08); }
      .nav-links.open .mobile-signin { color: rgba(255,255,255,0.7); }
      .nav-links.open .mobile-start { color: var(--gold); font-weight: 600; }
      .mobile-signin, .mobile-start { display: none; }
      .mobile-toggle { display: block; }
      .mobile-toggle span { transition: all 200ms ease; }
      .mobile-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .mobile-toggle.open span:nth-child(2) { opacity: 0; }
      .mobile-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }

    /* Article styles */
    .article-hero {
      padding: 64px 32px 48px;
      text-align: center;
      background: linear-gradient(180deg, rgba(28,16,64,0.3) 0%, var(--bg) 100%);
    }
    .article-hero h1 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(28px, 5vw, 48px);
      line-height: 1.12;
      color: var(--text);
      font-weight: 400;
      letter-spacing: -0.02em;
      max-width: 800px;
      margin: 0 auto 20px;
    }
    .article-hero h1 .gold { color: var(--gold); }
    .article-hero .subtitle {
      font-size: 18px;
      color: var(--muted);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .article-meta {
      margin-top: 20px;
      font-size: 13px;
      color: var(--faint);
    }

    .article-body {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 32px 80px;
    }
    .article-body h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px;
      color: var(--text);
      font-weight: 400;
      margin: 48px 0 16px;
      letter-spacing: -0.01em;
    }
    .article-body h2:first-child { margin-top: 0; }
    .article-body h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--gold);
      margin: 36px 0 12px;
    }
    .article-body p {
      margin-bottom: 18px;
      font-size: 16px;
      line-height: 1.75;
      color: var(--text);
    }
    .article-body strong { color: var(--text); font-weight: 600; }
    .article-body em { color: var(--muted); }
    .article-body ul, .article-body ol {
      margin: 0 0 18px 24px;
      font-size: 16px;
      line-height: 1.75;
    }
    .article-body li { margin-bottom: 6px; }

    /* Hand example card (optional — use for IQ Reasoning examples) */
    .hand-example {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      margin: 24px 0;
    }
    .hand-example .spot-line {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .hand-example .spot-badge {
      background: rgba(230,197,102,0.15);
      color: var(--gold);
      font-size: 12px; font-weight: 700;
      padding: 4px 10px; border-radius: 6px;
    }
    .hand-example .spot-info {
      font-size: 14px; color: var(--muted);
    }
    .hand-example .opponent-label {
      font-size: 13px; font-weight: 600;
      color: var(--muted); text-transform: uppercase;
      letter-spacing: 0.06em; margin-bottom: 4px;
    }
    .hand-example .decision-line {
      font-family: 'DM Serif Display', serif;
      font-size: 22px; color: var(--gold);
      margin-bottom: 14px;
    }
    .hand-example .iq-reasoning {
      background: rgba(230,197,102,0.04);
      border-left: 3px solid var(--gold);
      border-radius: 0 10px 10px 0;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text);
    }
    .hand-example .iq-reasoning strong { color: var(--gold); }

    /* Callout box (optional — use for key takeaways or spot descriptions) */
    .callout {
      background: rgba(230,197,102,0.06);
      border: 1px solid rgba(230,197,102,0.2);
      border-radius: 12px;
      padding: 18px 22px;
      margin: 24px 0;
      font-size: 15px;
      line-height: 1.7;
      color: var(--text);
    }
    .callout strong { color: var(--gold); }

    /* CTA section */
    .article-cta {
      text-align: center;
      padding: 64px 32px;
      background: var(--bg-alt);
    }
    .article-cta h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 32px;
      color: var(--text);
      font-weight: 400;
      margin-bottom: 16px;
    }
    .article-cta p {
      font-size: 16px;
      color: var(--muted);
      margin-bottom: 28px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 16px 36px; border-radius: 10px;
      font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
      text-decoration: none; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: transform 0.15s, box-shadow 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%);
      color: var(--bg);
      box-shadow: 0 6px 24px rgba(230,197,102,0.25);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(230,197,102,0.35); }

    /* Footer */
    footer {
      text-align: center;
      padding: 36px 20px 28px;
      color: var(--faint);
      font-size: 12px;
      line-height: 1.8;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    footer strong { color: var(--muted); font-weight: 600; }
    footer a { color: var(--muted); text-decoration: none; }
    footer a:hover { color: var(--gold); }

    @media (max-width: 600px) {
      .article-hero { padding: 48px 20px 36px; }
      .article-body { padding: 32px 20px 64px; }
      .article-body h2 { font-size: 24px; }
      .hand-example { padding: 20px; }
      .hand-example .decision-line { font-size: 18px; }
      .article-cta { padding: 48px 20px; }
      .article-cta h2 { font-size: 26px; }
    }
  </style>
</head>
<body>

  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">
        <div class="logo-grid"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        Range<span class="logo-iq">IQ</span>
      </a>
      <ul class="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#how">How It Works</a></li>
        <li><a href="vs-gto-wizard.html">For GTO Players</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="/#faq">FAQ</a></li>
        <li><a href="library.html">Library</a></li>
        <li><a href="resources.html" class="active">Resources</a></li>
        <li><a href="https://app.rangeiqpoker.com/?signin=1" class="mobile-signin">Sign In</a></li>
        <li><a href="https://app.rangeiqpoker.com" class="mobile-start">Start Training</a></li>
      </ul>
      <div class="nav-cta">
        <a href="https://app.rangeiqpoker.com/?signin=1" class="sign-in">Sign In</a>
        <a href="https://app.rangeiqpoker.com" class="nav-btn-primary">Start Training</a>
      </div>
      <button class="mobile-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <!-- ARTICLE HERO -->
  <header class="article-hero">
    <h1>${title}</h1>
    <p class="subtitle">TODO: Write a one-sentence subtitle summarizing the article.</p>
    <div class="article-meta">By RangeIQ Poker &middot; ${monthYear} &middot; 5 min read</div>
  </header>

  <!-- ARTICLE BODY -->
  <article class="article-body">

    <p>TODO: Opening paragraph. State the problem the reader has and why this article answers it. Include your primary keyword naturally.</p>

    <h2>TODO: First Section Heading</h2>

    <p>TODO: Section content. Each section should be 2-4 paragraphs. Use <strong>bold</strong> for key terms and <em>italics</em> for opponent-type references.</p>

    <!-- Optional: IQ Reasoning hand example
    <div class="hand-example">
      <div class="spot-line">
        <span class="spot-badge">FLOP</span>
        <span class="spot-info">A&diams;K&clubs; on A&spades;9&hearts;3&clubs; &middot; BTN vs BB &middot; $1/$3 &middot; $22 pot</span>
      </div>
      <div class="opponent-label">vs Calling Station</div>
      <div class="decision-line">Bet $18 &mdash; 91% Confidence</div>
      <div class="iq-reasoning">
        <strong>IQ Reasoning:</strong> TODO: Paste the IQ Reasoning text here.
      </div>
    </div>
    -->

    <h2>TODO: Second Section Heading</h2>

    <p>TODO: More content.</p>

    <!-- Optional: Callout box for key takeaway
    <div class="callout">
      <strong>Key takeaway:</strong> TODO: One-sentence summary of the main point.
    </div>
    -->

    <h2>TODO: Third Section Heading</h2>

    <p>TODO: Closing section. Tie back to RangeIQ naturally &mdash; how the tool helps with this specific topic.</p>

  </article>

  <!-- CTA -->
  <section class="article-cta">
    <h2>TODO: CTA <span style="color:var(--gold)">Heading</span></h2>
    <p>TODO: One-sentence CTA description.</p>
    <a href="https://app.rangeiqpoker.com" class="btn btn-primary">Try RangeIQ Free</a>
    <p style="margin-top:24px; font-size:14px;"><a href="library.html" style="color:var(--gold); text-decoration:none;">Browse 25 hand examples in the Exploit Library &rarr;</a></p>
    <p style="margin-top:8px; font-size:14px;"><a href="resources.html" style="color:var(--gold); text-decoration:none;">See all RangeIQ resources &rarr;</a></p>
  </section>

  <footer>
    <strong>RangeIQ Poker</strong><br>
    A Between the Cards product &middot; &copy; 2026 IQ Digital Holdings LLC<br>
    <a href="/">Home</a> &middot; <a href="/pricing.html">Pricing</a> &middot; <a href="/library.html">Exploit Library</a> &middot; <a href="/partners.html">Partners</a> &middot; <a href="/terms.html">Terms</a> &middot; <a href="/privacy.html">Privacy</a> &middot; <a href="mailto:support@rangeiqpoker.com">support@rangeiqpoker.com</a>
  </footer>

  <script>
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileToggle.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('open');
      }));
    }
  </script>

</body>
</html>`;

// ── Write the HTML file ─────────────────────────────────────────
fs.writeFileSync(filepath, html, "utf8");
console.log(`\n  ✓ Created ${filename}`);

// ── Update sitemap.xml ──────────────────────────────────────────
const sitemapPath = path.join(ROOT, "sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapEntry = `  <url><loc>${url}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`;

if (!sitemap.includes(url)) {
  const updated = sitemap.replace(
    "</urlset>",
    sitemapEntry + "\n</urlset>"
  );
  fs.writeFileSync(sitemapPath, updated, "utf8");
  console.log("  ✓ Added to sitemap.xml");
} else {
  console.log("  · Already in sitemap.xml");
}

// ── Update strategy.html ────────────────────────────────────────
const strategyPath = path.join(ROOT, "strategy.html");
const strategy = fs.readFileSync(strategyPath, "utf8");

// Accept optional tag and summary from args or use placeholders
const tag = process.argv[3] || "TODO";
const summary = process.argv[4] || "TODO: Write a 1-2 sentence summary.";

const cardHtml = `    <a href="${filename}" class="strat-card" data-tag="${tag}">
      <span class="strat-tag">${tag}</span>
      <h2>${title}</h2>
      <p>${summary}</p>
      <span class="read-link">Read &rarr;</span>
    </a>

`;

// Insert before the empty-state div
const insertMarker = '<div class="empty-state"';
if (strategy.includes(insertMarker) && !strategy.includes(filename)) {
  const updated = strategy.replace(insertMarker, cardHtml + "    " + insertMarker);
  fs.writeFileSync(strategyPath, updated, "utf8");
  console.log("  ✓ Added card to strategy.html");
} else if (strategy.includes(filename)) {
  console.log("  · Already in strategy.html");
} else {
  console.log("  · Could not find insert marker in strategy.html — add manually");
}

// ── Print next steps ────────────────────────────────────────────
console.log(`
  Next steps:
  1. Open ${filename} and replace all TODO: placeholders
  2. Fill in meta description, OG tags, and JSON-LD keywords
  3. Write the article body (aim for 400-600 words)
  4. git add ${filename} sitemap.xml strategy.html
  5. git commit -m "content: ${slug}"
  6. git push origin main
`);
