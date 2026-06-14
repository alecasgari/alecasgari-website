// n8n Code node: "Prepare Blog HTML for GitHub"
// Keep in sync with scripts/regenerate-blog-pages.js buildPage() — paste this whole file into n8n.

const norm = $('Normalize Blog Data').first().json;
const post = norm.output || {};
const slug = norm.slug || post.slug;
const tags = Array.isArray(post.tags)
  ? post.tags
  : JSON.parse(norm.tags_json || '[]');
const image = norm.featured_image || `/images/blog/${slug}.jpg`;
const url = norm.url || `/blog/${slug}.html`;
const author = norm.author || post.authorName || 'Alec Asgari';
const author_image = norm.author_image || '/assets/images/team/alec-asgari-author.webp';
const content = post.content || $('AI Agent').first().json.output?.content || '';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMd(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function mdToHtml(md) {
  const lines = String(md || '').split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;

  function closeUl() {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
  }

  function closeOl() {
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  }

  function closeLists() {
    closeUl();
    closeOl();
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      closeLists();
      continue;
    }
    if (t.startsWith('## ')) {
      closeLists();
      out.push(`<h2>${inlineMd(t.slice(3))}</h2>`);
      continue;
    }
    if (t.startsWith('### ')) {
      closeLists();
      out.push(`<h3>${inlineMd(t.slice(4))}</h3>`);
      continue;
    }
    if (t.startsWith('- ')) {
      closeOl();
      if (!inUl) {
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li>${inlineMd(t.slice(2))}</li>`);
      continue;
    }
    const olMatch = t.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      closeUl();
      if (!inOl) {
        out.push('<ol>');
        inOl = true;
      }
      out.push(`<li>${inlineMd(olMatch[1])}</li>`);
      continue;
    }
    closeLists();
    out.push(`<p>${inlineMd(t)}</p>`);
  }
  closeLists();
  return out.join('\n');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US');
}

function buildBlogHtml(data, bodyHtml, tagList) {
  const title = data.title || 'Untitled';
  const excerpt = data.excerpt || '';
  const category = data.category || 'Business';
  const date = String(data.date || '').slice(0, 10);
  const pageUrl = `https://alecasgari.com${url}`;

  const tagsHtml = tagList.length
    ? `<div class="blog-tags"><h3 style="width:100%;margin:0 0 0.5rem;font-size:0.9rem">Tags</h3>${tagList
        .map((t) => `<span class="blog-tag">${esc(t)}</span>`)
        .join('')}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Alec Asgari</title>
  <meta name="description" content="${esc(excerpt)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(excerpt)}">
  <meta property="og:image" content="https://alecasgari.com${esc(image)}">
  <link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
  <link rel="stylesheet" href="/assets/css/site.css?v=4">
  <link rel="stylesheet" href="/assets/css/blog-detail.css?v=1">
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
    <section class="blog-detail-hero" style="background-image:url('${esc(image)}')">
      <div class="blog-detail-hero-overlay"></div>
      <div class="blog-detail-hero-mesh" aria-hidden="true"></div>
      <div class="container">
        <p class="eyebrow hero-in">
          <iconify-icon icon="lucide:newspaper"></iconify-icon>
          <a href="/blog.html">Blog</a> / ${esc(category)}
        </p>
        <div class="blog-detail-badges hero-in hero-in-d1">
          <span class="blog-badge blog-badge--category">${esc(category)}</span>
        </div>
        <h1 class="hero-in hero-in-d1">${esc(title)}</h1>
        <p class="blog-detail-excerpt hero-in hero-in-d2">${esc(excerpt)}</p>
        <div class="blog-detail-meta-row hero-in hero-in-d3">
          <div class="blog-detail-meta-item">
            <img src="${esc(author_image)}" alt="${esc(author)}" width="36" height="36">
            <span>${esc(author)}</span>
          </div>
          <div class="blog-detail-meta-item">
            <iconify-icon icon="lucide:calendar"></iconify-icon>
            <span>${esc(formatDate(date))}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container blog-detail-layout">
        <article class="blog-detail-content reveal">
          <div class="blog-prose">${bodyHtml}</div>
          ${tagsHtml}
          <div class="blog-author-box">
            <img src="${esc(author_image)}" alt="${esc(author)}" width="56" height="56">
            <div>
              <h3>${esc(author)}</h3>
              <p class="role">Author &amp; Content Creator</p>
              <p>Passionate about creating valuable content and sharing insights from real automation and CRM projects.</p>
            </div>
          </div>
        </article>

        <aside class="sidebar-panel blog-sidebar card-lift reveal">
          <h3><iconify-icon icon="lucide:info"></iconify-icon> Article Info</h3>
          <ul>
            <li><iconify-icon icon="lucide:folder"></iconify-icon><div><strong>Category</strong>${esc(category)}</div></li>
            <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Published</strong>${esc(formatDate(date))}</div></li>
            <li><iconify-icon icon="lucide:user"></iconify-icon><div><strong>Author</strong>${esc(author)}</div></li>
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
</html>`;
}

const bodyHtml = mdToHtml(content);
const html = buildBlogHtml(post, bodyHtml, tags);

const blog_json_entry = {
  slug,
  title: post.title || 'Untitled',
  excerpt: post.excerpt || '',
  category: post.category || 'Business',
  date: String(post.date || '').slice(0, 10),
  image,
  url,
  author,
  author_image,
};

const blog_content_entry = {
  slug,
  body: bodyHtml,
  tags,
};

return {
  slug,
  linkedin_row_id: norm.linkedin_row_id,
  image_path: image,
  blog_url: `https://alecasgari.com${url}`,
  base64_html: Buffer.from(html, 'utf8').toString('base64'),
  blog_json_entry,
  blog_content_entry,
};
