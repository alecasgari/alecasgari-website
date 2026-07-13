#!/usr/bin/env node
/**
 * Inject mobile drawer nav into all site HTML pages.
 * Run: node scripts/patch-mobile-nav.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TOGGLE_NEW =
  '<button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>';

function reorderToggleAfterNav(html) {
  // Prefer DOM order: logo → desktop nav → toggle (so toggle sits on the right)
  const toggleMatch = html.match(/<button class="nav-toggle"[^>]*>[\s\S]*?<\/button>\s*/);
  if (!toggleMatch) return html;
  const toggle = toggleMatch[0].trim();
  let out = html.replace(toggleMatch[0], '');
  if (/<\/nav>\s*<\/div>\s*<\/header>/.test(out)) {
    out = out.replace(/<\/nav>(\s*<\/div>\s*<\/header>)/, `</nav>\n      ${toggle}$1`);
  } else {
    out = out.replace(
      /(<a href="\/" class="site-logo">[\s\S]*?<\/a>\s*)/,
      `$1${toggle}\n      `
    );
  }
  return out;
}

const MOBILE_NAV = `
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>
  <div class="mobile-nav__backdrop" data-close-nav tabindex="-1" aria-hidden="true"></div>
  <div class="mobile-nav__panel">
    <div class="mobile-nav__intro">
      <p class="mobile-nav__name">Alec Asgari</p>
      <p class="mobile-nav__role">Systems · Automation · AI</p>
    </div>
    <div class="mobile-nav__quick">
      <a href="/" class="mobile-nav__pill mobile-nav__pill--full"><iconify-icon icon="lucide:home"></iconify-icon> Home</a>
      <a href="/about.html" class="mobile-nav__pill"><iconify-icon icon="lucide:user"></iconify-icon> About</a>
      <a href="/blog.html" class="mobile-nav__pill"><iconify-icon icon="lucide:newspaper"></iconify-icon> Blog</a>
      <a href="/projects.html" class="mobile-nav__pill"><iconify-icon icon="lucide:folder-kanban"></iconify-icon> Projects</a>
      <a href="/case-studies.html" class="mobile-nav__pill"><iconify-icon icon="lucide:briefcase"></iconify-icon> Case Studies</a>
    </div>
    <p class="mobile-nav__label">More</p>
    <div class="mobile-nav__grid">
      <a href="/contact.html"><iconify-icon icon="lucide:mail"></iconify-icon> Contact</a>
      <a href="https://calculator.alecasgari.com/" target="_blank" rel="noopener"><iconify-icon icon="lucide:calculator"></iconify-icon> Calculator</a>
      <a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy</a>
    </div>
    <div class="mobile-nav__contact">
      <a href="mailto:hello@alecasgari.com"><iconify-icon icon="lucide:mail"></iconify-icon> hello@alecasgari.com</a>
    </div>
    <div class="mobile-nav__social" aria-label="Social media">
      <a class="mobile-nav__social-link" href="https://www.linkedin.com/in/alecasgari/" target="_blank" rel="noopener" aria-label="LinkedIn"><iconify-icon icon="lucide:linkedin"></iconify-icon></a>
      <a class="mobile-nav__social-link" href="https://github.com/alecasgari" target="_blank" rel="noopener" aria-label="GitHub"><iconify-icon icon="lucide:github"></iconify-icon></a>
      <a class="mobile-nav__social-link" href="mailto:hello@alecasgari.com" aria-label="Email"><iconify-icon icon="lucide:mail"></iconify-icon></a>
    </div>
    <div class="mobile-nav__actions">
      <a href="/contact.html" class="btn btn-primary"><iconify-icon icon="lucide:send"></iconify-icon> Get in Touch</a>
    </div>
  </div>
</nav>
`.trim();

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'OLD' || entry.name === 'saas-calculator') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function patchFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('nav-toggle') || !html.includes('site-header')) {
    return { file: filePath, skipped: true, reason: 'no header' };
  }

  const before = html;

  html = html.replace(
    /<button class="nav-toggle"[^>]*>[\s\S]*?<\/button>/,
    TOGGLE_NEW
  );
  html = reorderToggleAfterNav(html);

  // Remove previously injected mobile nav (idempotent)
  html = html.replace(/\s*<nav class="mobile-nav"[\s\S]*?<\/nav>\s*/g, '\n');

  // Insert after </header>
  if (!html.includes('id="mobile-nav"')) {
    html = html.replace(/<\/header>/, `</header>\n\n  ${MOBILE_NAV}`);
  }

  // Bump site.css cache buster when present
  html = html.replace(/\/assets\/css\/site\.css\?v=\d+/g, '/assets/css/site.css?v=9');
  html = html.replace(
    /href="\/assets\/css\/site\.css"/g,
    'href="/assets/css/site.css?v=9"'
  );

  if (html === before) return { file: filePath, skipped: true, reason: 'unchanged' };

  fs.writeFileSync(filePath, html, 'utf8');
  return { file: filePath, skipped: false };
}

function main() {
  const files = walk(ROOT);
  let patched = 0;
  let skipped = 0;
  for (const file of files) {
    const result = patchFile(file);
    if (result.skipped) {
      skipped += 1;
    } else {
      patched += 1;
      console.log('patched', path.relative(ROOT, file));
    }
  }
  console.log(`\nDone. Patched ${patched}, skipped ${skipped}.`);
}

main();
