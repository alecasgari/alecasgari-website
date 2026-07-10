/**
 * Regenerate blog detail pages from data/blog.json + data/blog-content.json.
 * Run: node scripts/regenerate-blog-pages.js
 */
const fs = require('fs');
const path = require('path');
const {
  buildBlogHtml,
  renderRelatedHtml,
} = require('../docs/blog-page-builder');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_FILE = path.join(ROOT, 'data', 'blog.json');
const CONTENT_FILE = path.join(ROOT, 'data', 'blog-content.json');

function extractLegacy(slug, cache) {
  if (cache[slug] && cache[slug].body) {
    return cache[slug];
  }

  const file = path.join(BLOG_DIR, slug + '.html');
  if (!fs.existsSync(file)) return { body: '', tags: [] };
  const html = fs.readFileSync(file, 'utf8');

  let bodyMatch = html.match(/<div class="post-body"[^>]*>([\s\S]*?)<\/div>\s*<!-- Tags -->/);
  if (!bodyMatch) {
    bodyMatch = html.match(/<div class="blog-prose">([\s\S]*?)<\/div>\s*<(?:div class="blog-tags"|p class="blog-tags-label")/);
  }
  let body = bodyMatch ? bodyMatch[1] : '';
  body = body
    .replace(/\s*data-astro[^=]*="[^"]*"/g, '')
    .replace(/<pre><code><\/code><\/pre>/g, '')
    .trim();

  let tags = [...html.matchAll(/<span class="badge text-dark border"[^>]*>([^<]+)<\/span>/g)].map(
    (m) => m[1].trim()
  );
  if (!tags.length) {
    tags = [...html.matchAll(/<span class="blog-tag">([^<]+)<\/span>/g)].map((m) => m[1].trim());
  }

  const result = { body, tags };
  cache[slug] = result;
  return result;
}

function main() {
  const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let cache = {};
  if (fs.existsSync(CONTENT_FILE)) {
    cache = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  }

  for (const post of posts) {
    const legacy = extractLegacy(post.slug, cache);
    if (!legacy.body) {
      console.warn('Warning: no body extracted for', post.slug);
    }

    const relatedHtml = renderRelatedHtml(post, posts);
    const html = buildBlogHtml(post, legacy.body, legacy.tags, { relatedHtml });
    const out = path.join(BLOG_DIR, post.slug + '.html');
    fs.writeFileSync(out, html, 'utf8');
    console.log('Wrote', out, `(${legacy.body.length} chars, ${legacy.tags.length} tags)`);
  }

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log('Saved', CONTENT_FILE);
}

main();
