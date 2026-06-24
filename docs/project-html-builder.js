// n8n Code node: "Prepare HTML for GitHub"
// Keep in sync with Alec Project Writer workflow — paste this whole file into n8n.

function getProjectRowForHtml() {
  try {
    const manual = $('Get Project for photo').first();
    if (manual?.json?.project_id) return manual.json;
  } catch (e) {}
  try {
    const ai = $('Get Project for AI publish').first();
    if (ai?.json?.project_id) return ai.json;
  } catch (e) {}
  throw new Error('Project row not found from Get Project for photo or Get Project for AI publish.');
}
const projectData = getProjectRowForHtml();

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
    // ## in Gemini markdown → h3 (page already has h1 title + h2 "Project Details")
    if (t.startsWith('## ')) {
      closeList();
      out.push(`<h3>${inlineMd(t.slice(3))}</h3>`);
      continue;
    }
    if (t.startsWith('### ')) {
      closeList();
      out.push(`<h4>${inlineMd(t.slice(4))}</h4>`);
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

function buildJsonLd(data, title, pageUrl, image, date, excerpt, category, tags, technologies) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: `https://alecasgari.com${image}`,
    datePublished: date || undefined,
    author: {
      '@type': 'Person',
      name: 'Alec Asgari',
      url: 'https://alecasgari.com/about.html',
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

function buildProjectHtml(data) {
  const title = data.project_title;
  const slug = slugify(title);
  const excerpt = data.short_description || '';
  const category = data.category || '';
  const status = 'Completed';
  const featured = true;
  const tags = splitCsv(data.tags);
  const technologies = splitCsv(data.technologies_used);
  const image = `/projects/${slug}.jpg`;
  const url = `/projects/${slug}.html`;
  const pageUrl = `https://alecasgari.com${url}`;
  const date = String(data.project_date || '').slice(0, 10);
  const bodyHtml = mdToHtml(data.project_description);
  const catSlug = categorySlug(category);
  const jsonLd = buildJsonLd(data, title, pageUrl, image, date, excerpt, category, tags, technologies);

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — Alec Asgari</title>
  <meta name="description" content="${esc(excerpt)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(excerpt)}">
  <meta property="og:image" content="https://alecasgari.com${esc(image)}">
  <meta property="og:url" content="${pageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(excerpt)}">
  <meta name="twitter:image" content="https://alecasgari.com${esc(image)}">
  <link rel="canonical" href="${pageUrl}">
  <script type="application/ld+json">${jsonLd}</script>
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
          <span class="project-badge project-badge--featured"><iconify-icon icon="lucide:star"></iconify-icon> Featured</span>
        </div>
        <h1 class="hero-in hero-in-d1">${esc(title)}</h1>
        <p class="project-detail-excerpt hero-in hero-in-d2">${esc(excerpt)}</p>
        <div class="project-detail-meta-row hero-in hero-in-d3">
          <div class="project-detail-meta-item">
            <iconify-icon icon="lucide:user"></iconify-icon>
            <div>
              <strong>${esc(data.client_name)}</strong>
              <span>${esc(data.client_company)}</span>
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
              <span>${esc(data.project_duration)}</span>
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
              <li><iconify-icon icon="lucide:user"></iconify-icon><div><strong>Client</strong>${esc(data.client_name)}</div></li>
              <li><iconify-icon icon="lucide:calendar"></iconify-icon><div><strong>Date</strong>${esc(formatDate(date))}</div></li>
              <li><iconify-icon icon="lucide:clock"></iconify-icon><div><strong>Duration</strong>${esc(data.project_duration)}</div></li>
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
        </aside>
      </div>
    </section>

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
        <li><a href="/privacy-policy.html"><iconify-icon icon="lucide:shield"></iconify-icon> Privacy Policy</a></li>
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

const slug = slugify(projectData.project_title);
const html = buildProjectHtml(projectData);

const projectsJsonEntry = {
  slug,
  title: projectData.project_title,
  excerpt: projectData.short_description,
  image: `/projects/${slug}.jpg`,
  category: projectData.category,
  tags: splitCsv(projectData.tags),
  technologies: splitCsv(projectData.technologies_used),
  date: String(projectData.project_date || '').slice(0, 10),
  clientName: projectData.client_name,
  clientCompany: projectData.client_company,
  duration: projectData.project_duration,
  status: 'Completed',
  featured: true,
  projectLink: `https://alecasgari.com/projects/${slug}.html`,
  url: `/projects/${slug}.html`,
};

return {
  slug,
  project_id: projectData.project_id,
  project_link: `https://alecasgari.com/projects/${slug}.html`,
  image_path: `/projects/${slug}.jpg`,
  base64_html: Buffer.from(html, 'utf8').toString('base64'),
  projects_json_entry: projectsJsonEntry,
};
