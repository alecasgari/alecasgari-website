/**
 * Shared project page HTML builder (used by n8n-prepare-project-html.js and regen script)
 */

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
  let inList = false;

  function closeList() {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      closeList();
      continue;
    }
    if (t.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inlineMd(t.slice(3))}</h2>`);
      continue;
    }
    if (t.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inlineMd(t.slice(4))}</h3>`);
      continue;
    }
    if (t.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMd(t.slice(2))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inlineMd(t)}</p>`);
  }
  closeList();
  return out.join('\n');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function slugify(title) {
  return String(title || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function splitCsv(val) {
  return String(val || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function categorySlug(category) {
  return String(category || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('progress')) return 'project-badge-status--progress';
  return 'project-badge-status--completed';
}

function resolveBodyHtml(data) {
  if (data.descriptionHtml) return data.descriptionHtml;
  return mdToHtml(data.project_description || data.description || '');
}

function resolveLiveUrl(data) {
  const url = data.live_project_url || data.external_url || data.projectLink || '';
  if (!url) return '';
  if (url.includes('alecasgari.com/projects/')) return '';
  return url;
}

function buildRelatedCards(currentSlug, allProjects) {
  const others = allProjects.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (!others.length) return '';

  const cards = others
    .map((p) => {
      const statusCls = statusClass(p.status);
      const featured = p.featured
        ? '<span class="project-related-badge project-related-badge--featured">Featured</span>'
        : '';
      return `<a href="${esc(p.url)}" class="project-related-card card-lift reveal">
        <div class="project-related-img">
          <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
          ${featured}
        </div>
        <div class="project-related-body">
          <div class="project-related-labels">
            <span class="project-badge project-badge--category">${esc(p.category)}</span>
            <span class="project-badge project-badge--status ${statusCls}">${esc(p.status)}</span>
          </div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt)}</p>
        </div>
      </a>`;
    })
    .join('\n');

  return `<section class="section section-alt">
      <div class="container">
        <div class="section-head reveal">
          <iconify-icon icon="lucide:layout-grid" class="section-icon"></iconify-icon>
          <div>
            <h2 class="section-title">Related Projects</h2>
            <p class="section-lead">More technical work from the portfolio.</p>
          </div>
        </div>
        <div class="project-related-grid stagger">${cards}</div>
      </div>
    </section>`;
}

function buildProjectHtml(data, allProjects = []) {
  const title = data.project_title || data.title;
  const slug = data.slug || slugify(title);
  const excerpt = data.short_description || data.excerpt || '';
  const category = data.category || '';
  const status = data.status || 'Completed';
  const featured = data.featured === true || data.featured === 'true';
  const tags = Array.isArray(data.tags) ? data.tags : splitCsv(data.tags);
  const technologies = Array.isArray(data.technologies)
    ? data.technologies
    : splitCsv(data.technologies_used || data.technologies);
  const image = data.image || `/projects/${slug}.jpg`;
  const url = data.url || `/projects/${slug}.html`;
  const pageUrl = `https://alecasgari.com${url}`;
  const date = String(data.project_date || data.date || '').slice(0, 10);
  const clientName = data.client_name || data.clientName || '';
  const clientCompany = data.client_company || data.clientCompany || '';
  const duration = data.project_duration || data.duration || '';
  const bodyHtml = resolveBodyHtml(data);
  const liveUrl = resolveLiveUrl(data);
  const videoUrl = data.videoUrl || '';
  const catSlug = categorySlug(category);

  const featuredBadge = featured
    ? '<span class="project-badge project-badge--featured"><iconify-icon icon="lucide:star"></iconify-icon> Featured</span>'
    : '';

  const techChips = technologies
    .map(
      (t) =>
        `<span class="project-chip project-chip--tech"><iconify-icon icon="lucide:cpu"></iconify-icon>${esc(t)}</span>`
    )
    .join('');

  const tagChips = tags
    .map(
      (t) =>
        `<span class="project-chip project-chip--tag"><iconify-icon icon="lucide:tag"></iconify-icon>${esc(t)}</span>`
    )
    .join('');

  const liveCta = liveUrl
    ? `<div class="project-meta-block project-meta-live">
        <h3><iconify-icon icon="lucide:external-link"></iconify-icon> Live Project</h3>
        <p>See the deployed solution and results in production.</p>
        <a href="${esc(liveUrl)}" class="btn btn-primary btn-block" target="_blank" rel="noopener">
          <iconify-icon icon="lucide:globe"></iconify-icon>
          Visit Live Project
        </a>
      </div>`
    : '';

  const videoSection = videoUrl
    ? `<section class="project-video-section">
        <div class="container">
          <div class="project-video-card reveal">
            <div class="project-video-header">
              <iconify-icon icon="lucide:play-circle"></iconify-icon>
              <h2>Project Walkthrough</h2>
            </div>
            <div class="project-video-embed">
              <iframe src="${esc(videoUrl)}" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>
        </div>
      </section>`
    : '';

  const relatedSection = buildRelatedCards(slug, allProjects.length ? allProjects : data.allProjects || []);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Alec Asgari</title>
  <meta name="description" content="${esc(excerpt)}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
  <link rel="stylesheet" href="/assets/css/site.css?v=4">
  <link rel="stylesheet" href="/assets/css/project-detail.css?v=2">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-81C6JE60BQ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-81C6JE60BQ');</script>
</head>
<body data-category="${esc(catSlug)}">
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
          <li><a href="/projects.html" class="active">Projects</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="project-detail-hero" style="background-image:url('${esc(image)}')">
      <div class="project-detail-hero-overlay"></div>
      <div class="project-detail-hero-mesh" aria-hidden="true"></div>
      <div class="container">
        <p class="eyebrow hero-in">
          <iconify-icon icon="lucide:folder-kanban"></iconify-icon>
          <a href="/projects.html">Projects</a> / ${esc(category)}
        </p>
        <div class="project-detail-badges hero-in hero-in-d1">
          <span class="project-badge project-badge--category">${esc(category)}</span>
          <span class="project-badge project-badge--status ${statusClass(status)}">${esc(status)}</span>
          ${featuredBadge}
        </div>
        <h1 class="hero-in hero-in-d1">${esc(title)}</h1>
        <p class="project-detail-excerpt hero-in hero-in-d2">${esc(excerpt)}</p>
        <div class="project-detail-meta-row hero-in hero-in-d3">
          <div class="project-detail-meta-item">
            <iconify-icon icon="lucide:user"></iconify-icon>
            <div>
              <strong>${esc(clientName)}</strong>
              <span>${esc(clientCompany)}</span>
            </div>
          </div>
          <div class="project-detail-meta-item">
            <iconify-icon icon="lucide:calendar"></iconify-icon>
            <div>
              <strong>Date</strong>
              <span>${esc(formatDate(date))}</span>
            </div>
          </div>
          <div class="project-detail-meta-item">
            <iconify-icon icon="lucide:clock"></iconify-icon>
            <div>
              <strong>Duration</strong>
              <span>${esc(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="project-featured-wrap">
      <div class="container">
        <figure class="project-featured-figure reveal">
          <img src="${esc(image)}" alt="${esc(title)}" class="project-featured-img">
        </figure>
      </div>
    </section>

    ${videoSection}

    <section class="section">
      <div class="container project-detail-layout">
        <article class="project-detail-content reveal">
          <h2><iconify-icon icon="lucide:file-text"></iconify-icon> Project Details</h2>
          <div class="project-description">${bodyHtml}</div>
        </article>

        <aside class="project-meta sidebar-panel card-lift reveal">
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:clipboard-list"></iconify-icon> Project Info</h3>
            <ul>
              <li><iconify-icon icon="lucide:layers"></iconify-icon><div><strong>Category</strong>${esc(category)}</div></li>
              <li><iconify-icon icon="lucide:activity"></iconify-icon><div><strong>Status</strong>${esc(status)}</div></li>
              <li><iconify-icon icon="lucide:user"></iconify-icon><div><strong>Client</strong>${esc(clientName)}</div></li>
              <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Date</strong>${esc(formatDate(date))}</div></li>
              <li><iconify-icon icon="lucide:clock"></iconify-icon><div><strong>Duration</strong>${esc(duration)}</div></li>
            </ul>
          </div>
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:cpu"></iconify-icon> Technologies</h3>
            <div class="project-chip-list">${techChips || '<span class="project-meta-empty">Not specified</span>'}</div>
          </div>
          <div class="project-meta-block">
            <h3><iconify-icon icon="lucide:tags"></iconify-icon> Tags</h3>
            <div class="project-chip-list">${tagChips || '<span class="project-meta-empty">No tags</span>'}</div>
          </div>
          ${liveCta}
        </aside>
      </div>
    </section>

    ${relatedSection}

    <section class="section section-alt section-tight">
      <div class="container project-detail-cta reveal">
        <a href="/projects.html" class="btn btn-outline">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon>
          All Projects
        </a>
        <a href="/contact.html" class="btn btn-primary">
          <iconify-icon icon="lucide:mail"></iconify-icon>
          Discuss Your Project
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

function buildProjectsJsonEntry(data) {
  const slug = data.slug || slugify(data.project_title || data.title);
  const pageUrl = `https://alecasgari.com/projects/${slug}.html`;
  return {
    slug,
    title: data.project_title || data.title,
    excerpt: data.short_description || data.excerpt,
    image: data.image || `/projects/${slug}.jpg`,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : splitCsv(data.tags),
    technologies: Array.isArray(data.technologies)
      ? data.technologies
      : splitCsv(data.technologies_used || data.technologies),
    date: String(data.project_date || data.date || '').slice(0, 10),
    clientName: data.client_name || data.clientName,
    clientCompany: data.client_company || data.clientCompany,
    duration: data.project_duration || data.duration,
    status: data.status || 'Completed',
    featured: data.featured !== false,
    projectLink: pageUrl,
    url: `/projects/${slug}.html`,
  };
}

function stripAstroAttrs(html) {
  return String(html || '')
    .replace(/\s*data-astro-cid="[^"]*"/g, '')
    .replace(/\s*data-aos[^=]*="[^"]*"/g, '')
    .replace(/<div>\s*/g, '<div>')
    .trim();
}

function extractDescriptionFromHtml(pageHtml) {
  const match = pageHtml.match(/<div class="project-description"[^>]*>([\s\S]*?)<\/div>/i);
  if (!match) return '';
  return stripAstroAttrs(match[1]);
}

function extractVideoUrlFromHtml(pageHtml) {
  const sectionMatch = pageHtml.match(/<section class="project-video[^"]*"[\s\S]*?<\/section>/i);
  if (!sectionMatch) return '';
  const iframeMatch = sectionMatch[0].match(/<iframe[^>]+src="([^"]+)"/i);
  return iframeMatch ? iframeMatch[1] : '';
}

function isMarkdown(text) {
  const t = String(text || '').trim();
  return t.startsWith('##') || t.startsWith('###') || t.startsWith('- ');
}

module.exports = {
  esc,
  mdToHtml,
  slugify,
  splitCsv,
  categorySlug,
  buildProjectHtml,
  buildProjectsJsonEntry,
  stripAstroAttrs,
  extractDescriptionFromHtml,
  extractVideoUrlFromHtml,
  isMarkdown,
};
