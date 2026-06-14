/**
 * Regenerate ALL project detail pages from data/projects.json.
 * Fetches live content, extracts descriptions, writes HTML.
 * Usage: node scripts/regenerate-n8n-project-pages.js
 */
const fs = require('fs');
const path = require('path');
const {
  buildProjectHtml,
  mdToHtml,
  extractDescriptionFromHtml,
  extractVideoUrlFromHtml,
  isMarkdown,
} = require('../docs/project-html-builder');

const root = path.join(__dirname, '..');
const projectsDir = path.join(root, 'projects');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));

let cachedDescriptions = {};
const descPath = path.join(root, 'data/project-descriptions.json');
if (fs.existsSync(descPath)) {
  cachedDescriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
}

const videoUrls = {};
const extractedDescriptions = {};
const failures = [];

async function fetchHtml(slug) {
  const urls = [
    `https://alecasgari.com/projects/${slug}.html`,
    `https://alecasgari.com/projects/${slug}/`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'alecasgari-website-regen/1.0' },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const html = await res.text();
        console.log(`  Fetched: ${url}`);
        return html;
      }
    } catch (err) {
      /* try next URL */
    }
  }
  return null;
}

function readLocalFallback(slug) {
  const candidates = [
    path.join(projectsDir, `${slug}.html`),
    path.join(projectsDir, `_fetch_${slug}.html`),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      console.log(`  Local fallback: ${path.basename(file)}`);
      return fs.readFileSync(file, 'utf8');
    }
  }
  return null;
}

function resolveDescriptionHtml(slug, pageHtml) {
  if (pageHtml) {
    const extracted = extractDescriptionFromHtml(pageHtml);
    if (extracted) return extracted;
  }

  const cached = cachedDescriptions[slug];
  if (cached) {
    if (isMarkdown(cached)) {
      console.log(`  Using cached markdown for ${slug}`);
      return mdToHtml(cached);
    }
    console.log(`  Using cached HTML for ${slug}`);
    return cached;
  }

  return '';
}

function resolveVideoUrl(slug, pageHtml) {
  if (pageHtml) {
    const extracted = extractVideoUrlFromHtml(pageHtml);
    if (extracted) return extracted;
  }
  return videoUrls[slug] || '';
}

function cleanupFetchFiles() {
  if (!fs.existsSync(projectsDir)) return;
  const tempFiles = fs.readdirSync(projectsDir).filter((f) => f.startsWith('_fetch_') && f.endsWith('.html'));
  for (const file of tempFiles) {
    fs.unlinkSync(path.join(projectsDir, file));
    console.log(`  Deleted temp: ${file}`);
  }
}

async function regenerateAll() {
  console.log(`Regenerating ${projects.length} project pages…\n`);

  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  for (const meta of projects) {
    const { slug } = meta;
    console.log(`→ ${slug}`);

    let pageHtml = await fetchHtml(slug);
    let source = pageHtml ? 'live' : null;

    if (!pageHtml) {
      pageHtml = readLocalFallback(slug);
      source = pageHtml ? 'local' : null;
    }

    if (!pageHtml) {
      failures.push({ slug, reason: 'No live or local source found' });
      console.warn(`  WARN: no source — using cached description only`);
    }

    const descriptionHtml = resolveDescriptionHtml(slug, pageHtml);
    const videoUrl = resolveVideoUrl(slug, pageHtml);

    if (descriptionHtml) {
      extractedDescriptions[slug] = descriptionHtml;
    }

    if (videoUrl) {
      videoUrls[slug] = videoUrl;
    }

    const html = buildProjectHtml(
      {
        ...meta,
        project_title: meta.title,
        short_description: meta.excerpt,
        descriptionHtml,
        project_date: meta.date,
        client_name: meta.clientName,
        client_company: meta.clientCompany,
        project_duration: meta.duration,
        videoUrl,
        projectLink: meta.projectLink,
      },
      projects
    );

    const outPath = path.join(projectsDir, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  Wrote: projects/${slug}.html (${source || 'cache-only'})\n`);
  }

  fs.writeFileSync(descPath, JSON.stringify(extractedDescriptions, null, 2) + '\n', 'utf8');
  console.log(`Saved ${Object.keys(extractedDescriptions).length} descriptions → data/project-descriptions.json`);

  cleanupFetchFiles();

  console.log(`\nDone: ${projects.length} pages generated, ${failures.length} fetch failures.`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log(`  - ${f.slug}: ${f.reason}`));
  }
}

regenerateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
