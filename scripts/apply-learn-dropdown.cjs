const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const dropdownCSS = `
    .nav-dropdown { position: relative; }
    .nav-dropdown-trigger {
      cursor: pointer; display: flex; align-items: center; gap: 4px;
      font-size: 13px; font-weight: 500; color: var(--muted, #9CA3AF);
      text-decoration: none; user-select: none;
    }
    .nav-dropdown-trigger:hover { color: var(--text, #E5E7EB); }
    .dropdown-arrow { font-size: 10px; transition: transform 180ms ease; }
    .nav-dropdown.open .dropdown-arrow { transform: rotate(180deg); }
    .nav-dropdown-menu {
      display: none; position: absolute; top: calc(100% + 8px); left: -12px;
      background: var(--card, #111827); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 6px 0; min-width: 180px; z-index: 100;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    }
    .nav-dropdown.open .nav-dropdown-menu { display: block; }
    .nav-dropdown-menu li { list-style: none; }
    .nav-dropdown-menu a {
      display: block; padding: 10px 18px; font-size: 13px; font-weight: 500;
      color: var(--muted, #9CA3AF); text-decoration: none; white-space: nowrap;
    }
    .nav-dropdown-menu a:hover { color: var(--text, #E5E7EB); background: rgba(255,255,255,0.04); }
    .nav-dropdown-menu a.active { color: var(--gold, #E6C566); }`;

const dropdownMobileCSS = `
      .nav-dropdown { position: static; }
      .nav-dropdown-trigger { display: block; padding: 14px 24px; font-size: 17px; }
      .nav-dropdown-menu {
        position: static; background: transparent; border: none;
        box-shadow: none; border-radius: 0; padding: 0; min-width: 0;
      }
      .nav-dropdown.open .nav-dropdown-menu { display: block; }
      .nav-dropdown-menu a { padding: 12px 24px 12px 44px; font-size: 16px; }`;

const dropdownJS = `
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      var dd = trigger.closest('.nav-dropdown');
      dd.classList.toggle('open');
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
    }
  });`;

// Determine which page is "active" based on filename
function getActiveHub(filename) {
  if (filename === 'strategy.html') return 'strategy';
  if (filename === 'resources.html') return 'resources';
  if (filename === 'education.html') return 'education';
  return null;
}

// Check if the page's nav has a .active class on one of the hub links
function detectActiveFromNav(src) {
  if (/strategy\.html"[^>]*class="active"/.test(src)) return 'strategy';
  if (/resources\.html"[^>]*class="active"/.test(src)) return 'resources';
  if (/education\.html"[^>]*class="active"/.test(src)) return 'education';
  return null;
}

let changed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, 'utf8');

  // Skip if already has dropdown
  if (src.includes('nav-dropdown')) continue;

  // Must have nav-links to process
  if (!src.includes('nav-links')) continue;

  const activeHub = getActiveHub(file) || detectActiveFromNav(src);

  // Build the dropdown HTML (use absolute paths for subpages)
  const isIndex = file === 'index.html';
  const prefix = isIndex ? '' : '';
  const stratActive = activeHub === 'strategy' ? ' class="active"' : '';
  const resActive = activeHub === 'resources' ? ' class="active"' : '';
  const eduActive = activeHub === 'education' ? ' class="active"' : '';
  const triggerActive = activeHub ? ' style="color:var(--gold, #E6C566)"' : '';

  const dropdownHTML = `<li class="nav-dropdown">
          <a class="nav-dropdown-trigger"${triggerActive}>Learn <span class="dropdown-arrow">&#9662;</span></a>
          <ul class="nav-dropdown-menu">
            <li><a href="${prefix}strategy.html"${stratActive}>Strategy Q&amp;A</a></li>
            <li><a href="${prefix}resources.html"${resActive}>Resources</a></li>
            <li><a href="${prefix}education.html"${eduActive}>Education Hub</a></li>
          </ul>
        </li>`;

  // Remove existing Strategy, Resources, Education <li> items and replace with dropdown
  // Pattern: find the <li> containing strategy.html, resources.html, education.html
  let modified = src;

  // Remove individual hub links (various patterns)
  modified = modified.replace(/\s*<li><a href="[./]*strategy\.html"[^>]*>Strategy<\/a><\/li>/g, '');
  modified = modified.replace(/\s*<li><a href="[./]*resources\.html"[^>]*>Resources<\/a><\/li>/g, '');
  modified = modified.replace(/\s*<li><a href="[./]*education\.html"[^>]*>Education<\/a><\/li>/g, '');

  // Insert dropdown after the Library <li>
  if (modified.includes('library.html')) {
    modified = modified.replace(
      /(<li><a href="[./]*library\.html"[^>]*>Library<\/a><\/li>)/g,
      `$1\n        ${dropdownHTML}`
    );
  } else {
    // If no Library link, insert before the mobile-signin
    modified = modified.replace(
      /(\s*<li><a href="https:\/\/app\.rangeiqpoker\.com\/\?signin=1")/,
      `\n        ${dropdownHTML}$1`
    );
  }

  // Inject CSS: find the last nav-related CSS rule and append dropdown styles
  // Look for the .nav-cta .nav-btn-primary:hover rule or similar nav rule
  if (!modified.includes('nav-dropdown')) continue; // safety: HTML injection didn't work

  // Inject CSS before the mobile-toggle CSS
  modified = modified.replace(
    /(\s*\.mobile-toggle\s*\{)/,
    `${dropdownCSS}\n$1`
  );

  // Inject mobile dropdown CSS inside the @media (max-width: 900px) or (max-width: 1024px) block
  // Find mobile nav-links rule and append after it
  modified = modified.replace(
    /(\.nav-links\.open \.mobile-start\s*\{[^}]+\})/,
    `$1${dropdownMobileCSS}`
  );

  // Inject JS before the closing </script> that contains the mobile toggle logic
  if (modified.includes("mobileToggle")) {
    modified = modified.replace(
      /(const mobileToggle)/,
      `${dropdownJS}\n  $1`
    );
  } else {
    // Add a script block before </body>
    modified = modified.replace(
      '</body>',
      `<script>${dropdownJS}</script>\n</body>`
    );
  }

  if (modified !== src) {
    fs.writeFileSync(fp, modified);
    changed++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\nUpdated ${changed} files`);
