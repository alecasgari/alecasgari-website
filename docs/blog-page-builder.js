/**
 * Shared blog detail page HTML builder.
 * Used by scripts/regenerate-blog-pages.js — keep docs/blog-html-builder.js in sync for n8n.
 */

const SITE = 'https://alecasgari.com';
const AUTHOR = 'Alec Asgari';
const AUTHOR_URL = `${SITE}/about.html`;
const AUTHOR_IMAGE = '/assets/images/team/alec-asgari-author.webp';
const AUTHOR_BIO =
  'Alec Asgari is a systems and automation specialist with experience in CRM implementation, workflow automation, and cross-functional process design. He writes about organizational strategy, technology, and operational execution.';
const LINKEDIN = 'https://www.linkedin.com/in/alecasgari/';
const GITHUB = 'https://github.com/alecasgari';
const FOOTER_COPY = '© 2025–2026 Alec Asgari';
const ROBOTS_META =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const CSS_SITE = '/assets/css/site.css?v=6';
const CSS_BLOG = '/assets/css/blog-detail.css?v=3';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeTitle(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function inlineMd(text) {
  let s = String(text || '');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, label, href) => {
    return `%%LINK%%${href}%%LABEL%%${label}%%ENDLINK%%`;
  });
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(
      /%%LINK%%([^%]+)%%LABEL%%([^%]+)%%ENDLINK%%/g,
      '<a href="$1" target="_blank" rel="noopener">$2</a>'
    );
  return s;
}

function buildReferencesHtml(data) {
  const source = data.sourceArticleUrl || '';
  const linkedin = data.linkedinPostUrl || '';
  if (!source && !linkedin) return '';
  if (/references/i.test(data.content || '')) return '';

  let html = '<h2>References</h2><ul>';
  if (source) {
    html += `<li><a href="${esc(source)}" target="_blank" rel="noopener">Source article</a></li>`;
  }
  if (linkedin) {
    html += `<li><a href="${esc(linkedin)}" target="_blank" rel="noopener">Original LinkedIn post by Alec Asgari</a></li>`;
  }
  html += '</ul>';
  return html;
}

function mdToHtml(md, pageTitle) {
  const lines = String(md || '').split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;
  const normalizedPageTitle = normalizeTitle(pageTitle);
  let skippedDuplicateTitle = false;

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

    if (t.startsWith('# ')) {
      closeLists();
      const heading = t.slice(2).trim();
      if (!skippedDuplicateTitle && normalizeTitle(heading) === normalizedPageTitle) {
        skippedDuplicateTitle = true;
        continue;
      }
      out.push(`<h2>${inlineMd(heading)}</h2>`);
      continue;
    }

    if (t.startsWith('## ')) {
      closeLists();
      const heading = t.slice(3).trim();
      if (!skippedDuplicateTitle && normalizeTitle(heading) === normalizedPageTitle) {
        skippedDuplicateTitle = true;
        continue;
      }
      out.push(`<h2>${inlineMd(heading)}</h2>`);
      continue;
    }

    if (t.startsWith('### ')) {
      closeLists();
      out.push(`<h3>${inlineMd(t.slice(4))}</h3>`);
      continue;
    }

    if (t.startsWith('#### ')) {
      closeLists();
      out.push(`<h4>${inlineMd(t.slice(5))}</h4>`);
      continue;
    }

    if (t.startsWith('- ') || t.startsWith('* ')) {
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

function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toIsoDateTime(isoDate, hour = '09') {
  const date = String(isoDate || '').slice(0, 10);
  if (!date) return undefined;
  return `${date}T${hour}:00:00+04:00`;
}

function buildJsonLd({ title, excerpt, pageUrl, imagePath, date, category, tagList, dateModified }) {
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${SITE}${imagePath}`;
  const published = toIsoDateTime(date, '09');
  const modified = toIsoDateTime(dateModified || date, '10');

  const blogPosting = {
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: published,
    dateModified: modified,
    author: {
      '@type': 'Person',
      '@id': `${AUTHOR_URL}#person`,
      name: AUTHOR,
      url: AUTHOR_URL,
      sameAs: [LINKEDIN, GITHUB],
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR,
      url: AUTHOR_URL,
      image: {
        '@type': 'ImageObject',
        url: `${SITE}${AUTHOR_IMAGE}`,
      },
    },
    articleSection: category || undefined,
    keywords: tagList.filter(Boolean).join(', ') || undefined,
  };

  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE}/blog.html`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [blogPosting, breadcrumbs],
  }).replace(/</g, '\\u003c');
}

function buildBlogHtml(data, bodyHtml, tagList, options = {}) {
  const title = data.title || 'Untitled';
  const excerpt = data.excerpt || '';
  const category = data.category || 'Business';
  const date = String(data.date || '').slice(0, 10);
  const image = data.image || options.image || `/images/blog/${data.slug || 'post'}.jpg`;
  const url = data.url || `/blog/${data.slug || 'post'}.html`;
  const author = data.author || AUTHOR;
  const authorImage = data.author_image || AUTHOR_IMAGE;
  const pageUrl = url.startsWith('http') ? url : `${SITE}${url}`;
  const dateLong = formatDateLong(date);
  const dateTime = toIsoDateTime(date, '09');
  const jsonLd = buildJsonLd({
    title,
    excerpt,
    pageUrl,
    imagePath: image,
    date,
    category,
    tagList,
    dateModified: data.dateModified,
  });

  const tagsHtml = tagList.length
    ? `<div class="blog-tags"><p class="blog-tags-label">Tags</p>${tagList
        .map((t) => `<span class="blog-tag">${esc(t)}</span>`)
        .join('')}</div>`
    : '';

  const relatedSection = options.relatedHtml || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Alec Asgari</title>
  <meta name="description" content="${esc(excerpt)}">
  <meta name="robots" content="${ROBOTS_META}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="preload" as="image" href="${esc(image)}">
  <script type="application/ld+json">${jsonLd}</script>
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(excerpt)}">
  <meta property="og:image" content="${SITE}${esc(image)}">
  <meta property="og:url" content="${pageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(excerpt)}">
  <meta name="twitter:image" content="${SITE}${esc(image)}">
  <link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
  <link rel="stylesheet" href="${CSS_SITE}">
  <link rel="stylesheet" href="${CSS_BLOG}">
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
    <section class="blog-detail-hero">
      <picture class="blog-detail-hero-media">
        <img src="${esc(image)}" alt="${esc(title)}" width="1600" height="900" fetchpriority="high" decoding="async">
      </picture>
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
            <img src="${esc(authorImage)}" alt="${esc(author)}" width="36" height="36" decoding="async">
            <span>${esc(author)}</span>
          </div>
          <div class="blog-detail-meta-item">
            <iconify-icon icon="lucide:calendar"></iconify-icon>
            <time datetime="${esc(dateTime)}">${esc(dateLong)}</time>
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
            <img src="${esc(authorImage)}" alt="${esc(author)}" width="56" height="56" loading="lazy" decoding="async">
            <div>
              <p class="blog-author-name">${esc(author)}</p>
              <p class="role">Systems &amp; Automation Specialist</p>
              <p>${esc(AUTHOR_BIO)}</p>
            </div>
          </div>
        </article>

        <aside class="sidebar-panel blog-sidebar card-lift reveal" aria-label="Article information">
          <p class="blog-sidebar-title"><iconify-icon icon="lucide:info"></iconify-icon> Article Info</p>
          <ul>
            <li><iconify-icon icon="lucide:folder"></iconify-icon><div><strong>Category</strong>${esc(category)}</div></li>
            <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Published</strong><time datetime="${esc(dateTime)}">${esc(dateLong)}</time></div></li>
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

    ${relatedSection}

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
      <p class="footer-copy">${FOOTER_COPY}</p>
      <ul class="footer-links">
        <li><a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy Policy</a></li>
        <li><a href="${LINKEDIN}" target="_blank" rel="noopener"><iconify-icon icon="lucide:linkedin"></iconify-icon> LinkedIn</a></li>
        <li><a href="${GITHUB}" target="_blank" rel="noopener"><iconify-icon icon="lucide:github"></iconify-icon> GitHub</a></li>
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

function renderRelatedHtml(post, allPosts) {
  const others = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
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

module.exports = {
  SITE,
  AUTHOR,
  AUTHOR_BIO,
  FOOTER_COPY,
  esc,
  inlineMd,
  mdToHtml,
  buildReferencesHtml,
  formatDateLong,
  toIsoDateTime,
  buildJsonLd,
  buildBlogHtml,
  renderRelatedHtml,
};
