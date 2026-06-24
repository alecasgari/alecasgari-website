#!/usr/bin/env node
/**
 * Patch live project HTML: heading hierarchy, JSON-LD, footer fixes.
 * Run: node scripts/patch-project-seo-structure.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://alecasgari.com';
const PROJECTS_DIR = path.join(ROOT, 'projects');

const PRIVACY_FOOTER =
  '        <li><a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy Policy</a></li>\n';

function isRedirectStub(html) {
  return html.includes('http-equiv="refresh"') || !html.includes('name="description"');
}

function readTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  if (!match) return '';
  return match[1].replace(/\s*—\s*Alec Asgari\s*$/, '').trim();
}

function readMeta(html, name) {
  const match = html.match(new RegExp(`<meta name="${name}" content="([^"]*)">`));
  return match ? match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
}

function readCanonical(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)">/);
  return match ? match[1] : '';
}

function buildJsonLd({ title, excerpt, pageUrl, imagePath, date, category, tags, technologies }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: imagePath.startsWith('http') ? imagePath : `${SITE}${imagePath}`,
    datePublished: date || undefined,
    author: {
      '@type': 'Person',
      name: 'Alec Asgari',
      url: `${SITE}/about.html`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Alec Asgari',
    },
    articleSection: category || undefined,
    keywords: [...tags, ...technologies].filter(Boolean).join(', ') || undefined,
  };
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

function fixDescriptionHeadings(html) {
  return html.replace(
    /(<div class="project-description">)([\s\S]*?)(<\/div>\s*\n\s*<\/article>)/,
    (_, open, body, close) => {
      const fixed = body
        .replace(/<h3>/g, '<h4>')
        .replace(/<\/h3>/g, '</h4>')
        .replace(/<h2>/g, '<h3>')
        .replace(/<\/h2>/g, '</h3>');
      return open + fixed + close;
    }
  );
}

function insertJsonLd(html, jsonLd) {
  if (html.includes('application/ld+json')) {
    return html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n/,
      `<script type="application/ld+json">${jsonLd}</script>\n`
    );
  }
  return html.replace(
    /(<link rel="canonical" href="[^"]+">\r?\n)/,
    `$1  <script type="application/ld+json">${jsonLd}</script>\n`
  );
}

function fixFooter(html) {
  let out = html.replace(/<\/a><\/li>`n\s*/g, '</a></li>\n        ');

  if (!out.includes('privacy-policy.html')) {
    out = out.replace(
      /(<ul class="footer-links">\s*\n)/,
      `$1${PRIVACY_FOOTER}`
    );
  }

  return out;
}

function patchProjectFile(filePath, data) {
  let html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.html');

  if (isRedirectStub(html)) {
    return { slug, skipped: true, changes: [] };
  }

  const changes = [];
  const before = html;

  html = fixDescriptionHeadings(html);
  if (html !== before) changes.push('headings');

  const title = data.title || readTitle(html);
  const excerpt = data.excerpt || readMeta(html, 'description');
  const pageUrl = data.projectLink || readCanonical(html) || `${SITE}/projects/${slug}.html`;
  const imagePath = data.image || `/projects/${slug}.jpg`;
  const date = (data.date || '').slice(0, 10);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const technologies = Array.isArray(data.technologies) ? data.technologies : [];
  const jsonLd = buildJsonLd({
    title,
    excerpt,
    pageUrl,
    imagePath,
    date,
    category: data.category || '',
    tags,
    technologies,
  });

  const beforeLd = html;
  html = insertJsonLd(html, jsonLd);
  if (html !== beforeLd) changes.push('json-ld');

  const beforeFooter = html;
  html = fixFooter(html);
  if (html !== beforeFooter) changes.push('footer');

  if (changes.length) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { slug, skipped: false, changes };
}

function main() {
  const projectsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const bySlug = Object.fromEntries(projectsJson.map((p) => [p.slug, p]));
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.html'));

  const results = { patched: [], skipped: [], unchanged: [] };

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const result = patchProjectFile(path.join(PROJECTS_DIR, file), bySlug[slug] || {});
    if (result.skipped) results.skipped.push(slug);
    else if (result.changes.length) results.patched.push(`${slug} (${result.changes.join(', ')})`);
    else results.unchanged.push(slug);
  }

  console.log(`Patched ${results.patched.length} project files.`);
  results.patched.forEach((line) => console.log(`  + ${line}`));
  if (results.skipped.length) {
    console.log(`Skipped ${results.skipped.length} redirect stubs.`);
  }
  if (results.unchanged.length) {
    console.log(`Unchanged ${results.unchanged.length} files (already up to date).`);
  }
}

main();
