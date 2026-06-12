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
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>');
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
      out.push(`<h3>${inlineMd(t.slice(3))}</h3>`);
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
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US');
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

function buildProjectHtml(data) {
  const title = data.project_title || data.title;
  const slug = data.slug || slugify(title);
  const excerpt = data.short_description || data.excerpt || '';
  const category = data.category || '';
  const status = data.status || 'Completed';
  const featured = data.featured !== false;
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
  const bodyHtml = mdToHtml(data.project_description || data.description || '');
  const liveUrl = data.live_project_url || data.external_url || '';
  const showLive =
    liveUrl && !liveUrl.includes('alecasgari.com/projects/');

  const featuredBadge = featured
    ? '<span class="badge bg-warning text-dark">Featured</span>'
    : '';

  const techBadges = technologies
    .map((t) => `<span class="badge text-bg-primary text-dark">${esc(t)}</span>`)
    .join('');

  const tagBadges = tags
    .map((t) => `<span class="badge text-white border border-white">${esc(t)}</span>`)
    .join('');

  const liveCard = showLive
    ? `<div class="sidebar-card p-4 bg-primary rounded-3">
        <h5 class="mb-3 text-dark">Live Project</h5>
        <p class="mb-3 text-dark text-opacity-70">Check out the live project and see the results for yourself.</p>
        <a href="${esc(liveUrl)}" class="btn btn-light w-100" target="_blank" rel="noopener">
          Visit Live Project
          <iconify-icon icon="lucide:external-link" class="ms-2"></iconify-icon>
        </a>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(excerpt)}">
<link rel="canonical" href="${pageUrl}">
<link rel="shortcut icon" href="/assets/images/logos/favicon.svg">
<link rel="stylesheet" href="/assets/libs/aos-master/dist/aos.css">
<link rel="stylesheet" href="/assets/css/styles.css">
<link rel="stylesheet" href="/assets/css/extra.css">
<link rel="stylesheet" href="/assets/css/project-detail.css">
</head>
<body>
<header class="header border-4 border-primary border-top position-fixed start-0 top-0 w-100">
  <div class="container">
    <div class="header-wrapper d-flex align-items-center justify-content-between">
      <div class="logo">
        <a href="/" class="logo-dark"><img src="/assets/images/logos/logo-dark.svg" alt="Alec Asgari" class="logo-img"></a>
      </div>
      <a href="/projects.html" class="btn btn-sm btn-outline-dark">All Projects</a>
    </div>
  </div>
</header>
<div class="page-wrapper overflow-hidden">
  <section class="project-hero py-5 py-lg-11 py-xl-12 bg-light-gray" style="padding-top:120px">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-10 col-xxl-8">
          <div class="d-flex flex-column gap-6">
            <div class="d-flex align-items-center gap-3 flex-wrap">
              <span class="badge text-bg-primary">${esc(category)}</span>
              <span class="badge text-bg-secondary">${esc(status)}</span>
              ${featuredBadge}
            </div>
            <h1 class="mb-0 fs-9">${esc(title)}</h1>
            <p class="fs-5 mb-0 text-opacity-70">${esc(excerpt)}</p>
            <div class="d-flex flex-column flex-md-row gap-4">
              <div class="d-flex align-items-center gap-3">
                <iconify-icon icon="solar:user-bold" class="fs-6 text-primary"></iconify-icon>
                <div>
                  <h6 class="mb-0">${esc(clientName)}</h6>
                  <p class="mb-0 text-opacity-70 small">${esc(clientCompany)}</p>
                </div>
              </div>
              <div class="d-flex align-items-center gap-3">
                <iconify-icon icon="solar:calendar-bold" class="fs-6 text-primary"></iconify-icon>
                <div>
                  <h6 class="mb-0">Date</h6>
                  <p class="mb-0 text-opacity-70 small">${esc(formatDate(date))}</p>
                </div>
              </div>
              <div class="d-flex align-items-center gap-3">
                <iconify-icon icon="solar:clock-circle-bold" class="fs-6 text-primary"></iconify-icon>
                <div>
                  <h6 class="mb-0">Duration</h6>
                  <p class="mb-0 text-opacity-70 small">${esc(duration)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="project-featured-image py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <img src="${esc(image)}" alt="${esc(title)}" class="img-fluid w-100 rounded-3 project-featured-img">
        </div>
      </div>
    </div>
  </section>
  <section class="project-content py-5 py-lg-11 py-xl-12">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="project-details">
            <h2 class="mb-4">Project Details</h2>
            <div class="project-description">${bodyHtml}</div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="project-sidebar">
            <div class="sidebar-card p-4 bg-dark rounded-3 mb-4">
              <h5 class="mb-3 text-white">Project Info</h5>
              <div class="d-flex flex-column gap-3">
                <div><h6 class="mb-1 text-white">Category</h6><p class="mb-0 text-white text-opacity-70">${esc(category)}</p></div>
                <div><h6 class="mb-1 text-white">Status</h6><p class="mb-0 text-white text-opacity-70">${esc(status)}</p></div>
                <div><h6 class="mb-1 text-white">Client</h6><p class="mb-0 text-white text-opacity-70">${esc(clientName)}</p></div>
                <div><h6 class="mb-1 text-white">Date</h6><p class="mb-0 text-white text-opacity-70">${esc(formatDate(date))}</p></div>
                <div><h6 class="mb-1 text-white">Duration</h6><p class="mb-0 text-white text-opacity-70">${esc(duration)}</p></div>
              </div>
            </div>
            <div class="sidebar-card p-4 bg-dark rounded-3 mb-4">
              <h5 class="mb-3 text-white">Technologies</h5>
              <div class="d-flex flex-wrap gap-2">${techBadges}</div>
            </div>
            <div class="sidebar-card p-4 bg-dark rounded-3 mb-4">
              <h5 class="mb-3 text-white">Tags</h5>
              <div class="d-flex flex-wrap gap-2">${tagBadges}</div>
            </div>
            ${liveCard}
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="project-cta py-5 py-lg-11 py-xl-12 bg-dark">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-8 text-center">
          <div class="d-flex flex-column gap-6">
            <h2 class="mb-0 text-white">Ready to Start Your Project?</h2>
            <p class="fs-5 mb-0 text-white text-opacity-70">Let's discuss how we can help you achieve similar results.</p>
            <div class="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <a href="https://calendar.app.google/twixZsNv5j4jvbuz6" class="btn" target="_blank" rel="noopener">
                <span class="btn-text">Book a Discovery Call</span>
                <iconify-icon icon="lucide:arrow-up-right" class="btn-icon bg-white text-dark round-52 rounded-circle hstack justify-content-center fs-7 shadow-sm"></iconify-icon>
              </a>
              <a href="/projects.html" class="btn border border-white">
                <span class="btn-text">View All Projects</span>
                <iconify-icon icon="lucide:arrow-up-right" class="btn-icon bg-white text-dark round-52 rounded-circle hstack justify-content-center fs-7 shadow-sm"></iconify-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
<footer class="footer bg-dark py-5 border-top border-white border-opacity-10">
  <div class="container text-center">
    <p class="mb-0 text-white text-opacity-70">© 2025 Alec Asgari · <a href="mailto:hello@alecasgari.com" class="text-white">hello@alecasgari.com</a></p>
  </div>
</footer>
<script src="/assets/libs/jquery/dist/jquery.min.js"></script>
<script src="/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/libs/aos-master/dist/aos.js"></script>
<script src="/assets/js/custom.js"></script>
<script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>
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

module.exports = {
  esc,
  mdToHtml,
  slugify,
  splitCsv,
  buildProjectHtml,
  buildProjectsJsonEntry,
};
