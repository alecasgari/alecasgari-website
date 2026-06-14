/**
 * Regenerate blog detail pages from data/blog.json + extracted legacy HTML content.
 * Run: node scripts/regenerate-blog-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_FILE = path.join(ROOT, 'data', 'blog.json');
const CONTENT_FILE = path.join(ROOT, 'data', 'blog-content.json');

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US');
}

function extractLegacy(slug, cache) {
  if (cache[slug] && cache[slug].body) {
    return cache[slug];
  }

  const file = path.join(BLOG_DIR, slug + '.html');
  if (!fs.existsSync(file)) return { body: '', tags: [] };
  const html = fs.readFileSync(file, 'utf8');

  let bodyMatch = html.match(/<div class="post-body"[^>]*>([\s\S]*?)<\/div>\s*<!-- Tags -->/);
  if (!bodyMatch) {
    bodyMatch = html.match(/<div class="blog-prose">([\s\S]*?)<\/div>\s*<div class="blog-tags"/);
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

function renderRelated(post, allPosts) {
  const others = allPosts.filter((p) => p.slug !== post.slug);
  if (!others.length) return '';

  const cards = others
    .map(
      (p) =>
        `<a href="${esc(p.url)}" class="project-related-card reveal">` +
        `<div class="project-related-img"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div>` +
        `<div class="project-related-body">` +
        `<div class="project-related-labels"><span class="project-related-label">${esc(p.category)}</span></div>` +
        `<h3>${esc(p.title)}</h3>` +
        `<p>${esc(p.excerpt)}</p>` +
        `</div></a>`
    )
    .join('');

  return (
    `<section class="section section-alt">` +
    `<div class="container reveal">` +
    `<p class="eyebrow"><iconify-icon icon="lucide:book-open"></iconify-icon> More Articles</p>` +
    `<h2 class="section-title">Continue Reading</h2>` +
    `<div class="blog-related-grid">${cards}</div>` +
    `</div></section>`
  );
}

function buildPage(post, allPosts, legacy) {
  const tagsHtml = legacy.tags.length
    ? `<div class="blog-tags"><h3 style="width:100%;margin:0 0 0.5rem;font-size:0.9rem">Tags</h3>${legacy.tags
        .map((t) => `<span class="blog-tag">${esc(t)}</span>`)
        .join('')}</div>`
    : '';

  const related = renderRelated(post, allPosts);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title)} — Alec Asgari</title>
  <meta name="description" content="${esc(post.excerpt)}">
  <link rel="canonical" href="https://alecasgari.com${post.url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(post.excerpt)}">
  <meta property="og:image" content="https://alecasgari.com${post.image}">
  <link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
  <link rel="stylesheet" href="/assets/css/site.css?v=4">
  <link rel="stylesheet" href="/assets/css/blog-detail.css?v=1">
  <link rel="stylesheet" href="/assets/css/project-detail.css?v=2">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-81C6JE60BQ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-81C6JE60BQ');</script>
</head>
<body>
  <header class="site-header">
    <div class="container inner">
      <a href="/" class="site-logo">
        <img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" width="140" height="36">
      </a>
      <button class="nav-toggle" type="button" aria-label="Menu"><iconify-icon icon="lucide:menu"></iconify-icon></button>
      <nav>
        <ul class="site-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About Me</a></li>
          <li><a href="/case-studies.html">Case Studies</a></li>
          <li><a href="/projects.html">Projects</a></li>
          <li><a href="/blog.html" class="active">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="blog-detail-hero" style="background-image:url('${esc(post.image)}')">
      <div class="blog-detail-hero-overlay"></div>
      <div class="blog-detail-hero-mesh" aria-hidden="true"></div>
      <div class="container">
        <p class="eyebrow hero-in">
          <iconify-icon icon="lucide:newspaper"></iconify-icon>
          <a href="/blog.html">Blog</a> / ${esc(post.category)}
        </p>
        <div class="blog-detail-badges hero-in hero-in-d1">
          <span class="blog-badge blog-badge--category">${esc(post.category)}</span>
        </div>
        <h1 class="hero-in hero-in-d1">${esc(post.title)}</h1>
        <p class="blog-detail-excerpt hero-in hero-in-d2">${esc(post.excerpt)}</p>
        <div class="blog-detail-meta-row hero-in hero-in-d3">
          <div class="blog-detail-meta-item">
            <img src="${esc(post.author_image)}" alt="${esc(post.author)}" width="36" height="36">
            <span>${esc(post.author)}</span>
          </div>
          <div class="blog-detail-meta-item">
            <iconify-icon icon="lucide:calendar"></iconify-icon>
            <span>${esc(formatDate(post.date))}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container blog-detail-layout">
        <article class="blog-detail-content reveal">
          <div class="blog-prose">${legacy.body}</div>
          ${tagsHtml}
          <div class="blog-author-box">
            <img src="${esc(post.author_image)}" alt="${esc(post.author)}" width="56" height="56">
            <div>
              <h3>${esc(post.author)}</h3>
              <p class="role">Author &amp; Content Creator</p>
              <p>Passionate about creating valuable content and sharing insights from real automation and CRM projects.</p>
            </div>
          </div>
        </article>

        <aside class="sidebar-panel blog-sidebar card-lift reveal">
          <h3><iconify-icon icon="lucide:info"></iconify-icon> Article Info</h3>
          <ul>
            <li><iconify-icon icon="lucide:folder"></iconify-icon><div><strong>Category</strong>${esc(post.category)}</div></li>
            <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Published</strong>${esc(formatDate(post.date))}</div></li>
            <li><iconify-icon icon="lucide:user"></iconify-icon><div><strong>Author</strong>${esc(post.author)}</div></li>
          </ul>
          <a href="/blog.html" class="btn btn-outline btn-block" style="margin-top:1rem">
            <iconify-icon icon="lucide:arrow-left"></iconify-icon>
            All Articles
          </a>
          <a href="/contact.html" class="btn btn-primary btn-block" style="margin-top:0.5rem">
            <iconify-icon icon="lucide:mail"></iconify-icon>
            Get in Touch
          </a>
        </aside>
      </div>
    </section>

    ${related}

    <section class="section section-alt section-tight">
      <div class="container blog-detail-cta reveal">
        <a href="/blog.html" class="btn btn-outline">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon>
          Back to Blog
        </a>
        <a href="/projects.html" class="btn btn-primary">
          <iconify-icon icon="lucide:folder-kanban"></iconify-icon>
          View Projects
        </a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container inner">
      <a href="/" class="footer-logo"><img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" width="120" height="32"></a>
      <p class="footer-copy">© 2025 Alec Asgari</p>
      <ul class="footer-links">
        <li><a href="https://www.linkedin.com/in/alecasgari/" target="_blank" rel="noopener"><iconify-icon icon="lucide:linkedin"></iconify-icon> LinkedIn</a></li>
        <li><a href="https://github.com/alecasgari" target="_blank" rel="noopener"><iconify-icon icon="lucide:github"></iconify-icon> GitHub</a></li>
        <li><a href="mailto:hello@alecasgari.com"><iconify-icon icon="lucide:mail"></iconify-icon> Email</a></li>
      </ul>
    </div>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>
  <script src="/assets/js/site-nav.js"></script>
  <script src="/assets/js/site-reveal.js"></script>
</body>
</html>
`;
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
    const out = path.join(BLOG_DIR, post.slug + '.html');
    fs.writeFileSync(out, buildPage(post, posts, legacy), 'utf8');
    console.log('Wrote', out, `(${legacy.body.length} chars, ${legacy.tags.length} tags)`);
  }

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log('Saved', CONTENT_FILE);
}

main();
