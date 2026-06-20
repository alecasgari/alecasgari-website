#!/usr/bin/env node
/**
 * Add Open Graph / Twitter meta tags to all project pages and regenerate sitemaps.
 * Run: node scripts/patch-project-og-and-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://alecasgari.com';
const PROJECTS_DIR = path.join(ROOT, 'projects');
const BLOG_DIR = path.join(ROOT, 'blog');
const CASE_STUDIES_DIR = path.join(ROOT, 'case-studies');

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function buildSocialMeta({ title, excerpt, pageUrl, imagePath }) {
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${SITE}${imagePath}`;
  return [
    '  <meta property="og:type" content="article">',
    `  <meta property="og:title" content="${escapeAttr(title)}">`,
    `  <meta property="og:description" content="${escapeAttr(excerpt)}">`,
    `  <meta property="og:image" content="${escapeAttr(imageUrl)}">`,
    `  <meta property="og:url" content="${escapeAttr(pageUrl)}">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${escapeAttr(title)}">`,
    `  <meta name="twitter:description" content="${escapeAttr(excerpt)}">`,
    `  <meta name="twitter:image" content="${escapeAttr(imageUrl)}">`,
  ].join('\n');
}

function readMeta(content, name) {
  const re = new RegExp(`<meta name="${name}" content="([^"]*)">`);
  const match = content.match(re);
  return match ? match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
}

function readCanonical(content) {
  const match = content.match(/<link rel="canonical" href="([^"]+)">/);
  return match ? match[1] : '';
}

function readTitle(content) {
  const match = content.match(/<title>([^<]+)<\/title>/);
  if (!match) return '';
  return match[1].replace(/\s*—\s*Alec Asgari\s*$/, '').trim();
}

function isRedirectStub(html) {
  return html.includes('http-equiv="refresh"') || !html.includes('name="description"');
}

function patchProjectHtml(filePath, data) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (isRedirectStub(html)) {
    return { slug: path.basename(filePath, '.html'), skipped: true };
  }

  const slug = path.basename(filePath, '.html');
  const title = data.title || readTitle(html);
  const excerpt = data.excerpt || readMeta(html, 'description');
  const pageUrl = data.projectLink || readCanonical(html) || `${SITE}/projects/${slug}.html`;
  const imagePath = data.image || `/projects/${slug}.jpg`;
  const socialBlock = buildSocialMeta({ title, excerpt, pageUrl, imagePath });

  if (html.includes('property="og:type"')) {
    html = html.replace(
      /  <meta property="og:type" content="article">[\s\S]*?  <meta name="twitter:image" content="[^"]*">\r?\n/,
      `${socialBlock}\n`
    );
  } else {
    const updated = html.replace(
      /(<meta name="description" content="[^"]*">\r?\n)(\s*<link rel="canonical")/,
      `$1${socialBlock}\n$2`
    );
    if (updated === html) {
      throw new Error(`Could not insert OG tags in ${filePath}`);
    }
    html = updated;
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return { slug, skipped: false };
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath.replace(/^\//, '').replace(/\//g, path.sep)));
}

function xmlUrl(loc, lastmod) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}

function writeSitemap(filename, urls) {
  const body = urls.join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, filename), xml, 'utf8');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function patchProjects() {
  const projectsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const bySlug = Object.fromEntries(projectsJson.map((p) => [p.slug, p]));
  const htmlFiles = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.html'));
  const patched = [];
  const skipped = [];

  for (const file of htmlFiles) {
    const slug = file.replace(/\.html$/, '');
    const result = patchProjectHtml(path.join(PROJECTS_DIR, file), bySlug[slug] || {});
    if (result.skipped) skipped.push(result.slug);
    else patched.push(result.slug);
  }

  const liveProjectFiles = htmlFiles.filter((file) => {
    const html = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8');
    return !isRedirectStub(html);
  });

  return { patched: patched.length, skipped: skipped.length, projectsJson, htmlFiles: liveProjectFiles, bySlug };
}

function generateSitemaps(projectsJson, htmlFiles, bySlug) {
  const blogJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog.json'), 'utf8'));
  const now = today();

  const staticPages = [
    '/',
    '/about.html',
    '/case-studies.html',
    '/projects.html',
    '/blog.html',
    '/contact.html',
  ];

  const staticUrls = staticPages.map((p) => xmlUrl(`${SITE}${p === '/' ? '/' : p}`, now));

  const caseStudyUrls = fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => xmlUrl(`${SITE}/case-studies/${f}`, now));

  const projectUrls = htmlFiles.map((file) => {
    const slug = file.replace(/\.html$/, '');
    const entry = bySlug[slug];
    const lastmod = ((entry && entry.date) || now).slice(0, 10);
    const loc = (entry && entry.projectLink) || `${SITE}/projects/${slug}.html`;
    return xmlUrl(loc, lastmod);
  });

  const blogUrls = blogJson
    .filter((b) => fileExists(b.url))
    .map((b) => {
      const lastmod = (b.date || now).slice(0, 10);
      return xmlUrl(`${SITE}${b.url}`, lastmod);
    });

  writeSitemap('sitemap-pages.xml', [...staticUrls, ...caseStudyUrls]);
  writeSitemap('sitemap-projects.xml', projectUrls);
  writeSitemap('sitemap-blog.xml', blogUrls);

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-projects.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-blog.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap-index.xml'), indexXml, 'utf8');

  return {
    pages: staticUrls.length + caseStudyUrls.length,
    projects: projectUrls.length,
    blog: blogUrls.length,
  };
}

const { patched, skipped, projectsJson, htmlFiles, bySlug } = patchProjects();
const counts = generateSitemaps(projectsJson, htmlFiles, bySlug);

console.log(`Patched OG tags on ${patched} project HTML files (${skipped} redirect stubs skipped).`);
console.log(`Sitemap: ${counts.pages} pages, ${counts.projects} projects, ${counts.blog} blog posts.`);
