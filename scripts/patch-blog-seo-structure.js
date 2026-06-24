#!/usr/bin/env node
/**
 * Patch live blog HTML: fake bullet lists, duplicate title, social meta, BlogPosting JSON-LD, footer.
 *
 * Usage:
 *   node scripts/patch-blog-seo-structure.js           # patch existing files in blog/
 *   node scripts/patch-blog-seo-structure.js --fetch   # download missing posts from live site, then patch
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://alecasgari.com';
const BLOG_DIR = path.join(ROOT, 'blog');
const FETCH = process.argv.includes('--fetch');

const PRIVACY_FOOTER =
  '        <li><a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy Policy</a></li>\n';

function normalizeText(text) {
  return String(text || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function readTitle(html) {
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (h1) return h1[1].trim();
  const match = html.match(/<title>([^<]+)<\/title>/);
  if (!match) return '';
  return match[1].replace(/\s*—\s*Alec Asgari\s*$/, '').trim();
}

function readMeta(html, name) {
  const match = html.match(new RegExp(`<meta name="${name}" content="([^"]*)">`));
  return match ? match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
}

function readOg(html, property) {
  const match = html.match(new RegExp(`<meta property="${property}" content="([^"]*)">`));
  return match ? match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
}

function readCanonical(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)">/);
  return match ? match[1] : '';
}

function readTags(html) {
  return [...html.matchAll(/<span class="blog-tag">([^<]+)<\/span>/g)].map((m) => m[1].trim());
}

function convertFakeBullets(html) {
  return html.replace(/(?:<p>\*\s*(?:&nbsp;|\s)*([\s\S]*?)<\/p>\s*)+/g, (block) => {
    const items = [...block.matchAll(/<p>\*\s*(?:&nbsp;|\s)*([\s\S]*?)<\/p>/g)];
    if (!items.length) return block;
    const lis = items.map((m) => `  <li>${m[1].trim()}</li>`).join('\n');
    return `<ul>\n${lis}\n</ul>\n`;
  });
}

function fixBlogProseHeadings(html, title) {
  const normalizedTitle = normalizeText(title);

  return html.replace(
    /(<div class="blog-prose">)([\s\S]*?)(<\/div>\s*\n\s*<div class="blog-tags">|<\/div>\s*\n\s*<\/article>)/,
    (_, open, body, close) => {
      let fixed = body.replace(/<h1>/g, '<h2>').replace(/<\/h1>/g, '</h2>');

      fixed = fixed.replace(
        /^\s*<h2>([^<]+)<\/h2>\s*/,
        (match, h2Text) => (normalizeText(h2Text) === normalizedTitle ? '' : match)
      );

      return open + fixed + close;
    }
  );
}

function buildJsonLd({ title, excerpt, pageUrl, imagePath, date, category, tags }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
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
    keywords: tags.filter(Boolean).join(', ') || undefined,
  };
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

function fixMetaOrder(html) {
  const ogUrl = html.match(/<meta property="og:url" content="[^"]+">\r?\n/);
  if (!ogUrl) return html;
  let out = html.replace(/<meta property="og:url" content="[^"]+">\r?\n/, '');
  return out.replace(
    /(<meta property="og:image" content="[^"]+">\r?\n)/,
    `$1${ogUrl[0]}`
  );
}

function ensureSocialMeta(html, { pageUrl, title, excerpt, imageUrl }) {
  let out = html;

  if (!out.includes('property="og:url"')) {
    out = out.replace(
      /(<meta property="og:image" content="[^"]+">\r?\n)/,
      `$1  <meta property="og:url" content="${pageUrl}">\n`
    );
  }

  if (!out.includes('name="twitter:card"')) {
    const anchor = out.includes('property="og:url"')
      ? /(<meta property="og:url" content="[^"]+">\r?\n)/
      : /(<meta property="og:image" content="[^"]+">\r?\n)/;
    out = out.replace(
      anchor,
      (match) =>
        `${match}  <meta name="twitter:card" content="summary_large_image">\n` +
        `  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">\n` +
        `  <meta name="twitter:description" content="${excerpt.replace(/"/g, '&quot;')}">\n` +
        `  <meta name="twitter:image" content="${imageUrl}">\n`
    );
  }

  return out;
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
    out = out.replace(/(<ul class="footer-links">\s*\n)/, `$1${PRIVACY_FOOTER}`);
  }

  return out;
}

async function fetchMissingPosts(entries) {
  const missing = [];

  for (const entry of entries) {
    const filename = `${entry.slug}.html`;
    const filePath = path.join(BLOG_DIR, filename);
    if (fs.existsSync(filePath)) continue;

    const url = entry.url.startsWith('http') ? entry.url : `${SITE}${entry.url}`;
    process.stdout.write(`Fetching ${url} ... `);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`HTTP ${res.status}`);
        missing.push({ slug: entry.slug, reason: `HTTP ${res.status}` });
        continue;
      }
      const html = await res.text();
      if (!html.includes('blog-prose')) {
        console.log('not a blog page');
        missing.push({ slug: entry.slug, reason: 'invalid HTML' });
        continue;
      }
      fs.mkdirSync(BLOG_DIR, { recursive: true });
      fs.writeFileSync(filePath, html, 'utf8');
      console.log('saved');
    } catch (err) {
      console.log(`error: ${err.message}`);
      missing.push({ slug: entry.slug, reason: err.message });
    }
  }

  return missing;
}

function patchBlogFile(filePath, data) {
  let html = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.html');
  const changes = [];

  const title = data.title || readTitle(html);
  const excerpt = data.excerpt || readMeta(html, 'description');
  const pageUrl = data.url
    ? data.url.startsWith('http')
      ? data.url
      : `${SITE}${data.url}`
    : readCanonical(html) || `${SITE}/blog/${slug}.html`;
  const imagePath = data.image || readOg(html, 'og:image').replace(SITE, '') || `/images/blog/${slug}.jpg`;
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${SITE}${imagePath}`;
  const date = (data.date || '').slice(0, 10);
  const category = data.category || '';
  const tags = data.tags?.length ? data.tags : readTags(html);

  const steps = [
    ['fake-bullets', () => convertFakeBullets(html)],
    ['headings', () => fixBlogProseHeadings(html, title)],
    [
      'social-meta',
      () =>
        fixMetaOrder(
          ensureSocialMeta(html, {
            pageUrl,
            title,
            excerpt,
            imageUrl,
          })
        ),
    ],
    [
      'json-ld',
      () => {
        const jsonLd = buildJsonLd({ title, excerpt, pageUrl, imagePath, date, category, tags });
        return insertJsonLd(html, jsonLd);
      },
    ],
    ['footer', () => fixFooter(html)],
  ];

  for (const [name, fn] of steps) {
    const next = fn();
    if (next !== html) {
      html = next;
      changes.push(name);
    }
  }

  if (changes.length) {
    fs.writeFileSync(filePath, html, 'utf8');
  }

  return { slug, changes };
}

async function main() {
  const blogJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog.json'), 'utf8'));
  const contentJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog-content.json'), 'utf8'));

  const bySlug = Object.fromEntries(
    blogJson.map((entry) => [
      entry.slug,
      {
        ...entry,
        tags: contentJson[entry.slug]?.tags || [],
      },
    ])
  );

  if (FETCH) {
    const fetchErrors = await fetchMissingPosts(blogJson);
    if (fetchErrors.length) {
      console.log('\nCould not fetch:');
      fetchErrors.forEach(({ slug, reason }) => console.log(`  - ${slug}: ${reason}`));
    }
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html'));
  const results = { patched: [], unchanged: [], missingFromDisk: [] };

  for (const entry of blogJson) {
    const filename = `${entry.slug}.html`;
    if (!files.includes(filename)) {
      results.missingFromDisk.push(entry.slug);
    }
  }

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const result = patchBlogFile(path.join(BLOG_DIR, file), bySlug[slug] || {});
    if (result.changes.length) {
      results.patched.push(`${slug} (${result.changes.join(', ')})`);
    } else {
      results.unchanged.push(slug);
    }
  }

  console.log(`\nPatched ${results.patched.length} blog files.`);
  results.patched.forEach((line) => console.log(`  + ${line}`));

  if (results.unchanged.length) {
    console.log(`Unchanged ${results.unchanged.length} files (already up to date).`);
  }

  if (results.missingFromDisk.length) {
    console.log(`\nMissing ${results.missingFromDisk.length} files from blog/ (run with --fetch):`);
    results.missingFromDisk.forEach((slug) => console.log(`  - ${slug}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
