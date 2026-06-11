/**
 * Load project cards from data/projects.json into #projects-grid
 */
(function () {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US');
  }

  function chipButtons(values, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = values
      .map(
        (v) =>
          `<button type="button" class="chip" data-value="${esc(v)}">${esc(v)}</button>`
      )
      .join('');
  }

  function renderCard(p, i) {
    const tags = (p.tags || []).join(' | ');
    const tech = (p.technologies || []).join(' | ');
    const dataTags = (p.tags || []).map((t) => t.toLowerCase()).join(',');
    const dataTech = (p.technologies || []).map((t) => t.toLowerCase()).join(',');
    const isoDate = p.date ? p.date + 'T00:00:00.000Z' : '';
    const featured = p.featured
      ? '<div class="position-absolute top-0 end-0 m-3"><span class="badge bg-warning text-dark">Featured</span></div>'
      : '';

    return `<div class="col-md-6 project-item" data-category="${esc(p.category)}" data-tags="${esc(dataTags)}" data-tech="${esc(dataTech)}" data-title="${esc((p.title || '').toLowerCase())}" data-excerpt="${esc((p.excerpt || '').toLowerCase())}" data-date="${esc(isoDate)}">
      <div class="project-card d-flex flex-column gap-3 h-100" data-aos="fade-up" data-aos-delay="${100 + i * 100}" data-aos-duration="1000">
        <div class="project-card-img position-relative overflow-hidden">
          <div class="ratio ratio-16x9">
            <img src="${esc(p.image)}" alt="${esc(p.title)}" class="img-cover" loading="lazy" decoding="async">
          </div>
          <div class="project-card-overlay">
            <a href="${esc(p.url)}" class="btn bg-primary text-dark px-4 py-2">View Project</a>
          </div>
          ${featured}
        </div>
        <div class="project-card-content d-flex flex-column gap-3">
          <div class="project-labels d-flex align-items-center gap-2">
            <span class="badge text-bg-primary">${esc(p.category)}</span>
            <span class="badge text-bg-secondary">${esc(p.status)}</span>
          </div>
          <h3 class="mb-0 project-title">
            <a href="${esc(p.url)}" class="text-decoration-none text-dark">${esc(p.title)}</a>
          </h3>
          <p class="mb-0 text-opacity-70 project-excerpt">${esc(p.excerpt)}</p>
          <div class="d-flex flex-column gap-2 project-meta">
            <div class="d-flex align-items-center gap-2">
              <iconify-icon icon="solar:user-bold" class="fs-6 text-primary"></iconify-icon>
              <span class="small text-opacity-70">${esc(p.clientName)}</span>
              <span class="small text-opacity-70">- ${esc(p.clientCompany)}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <iconify-icon icon="solar:calendar-bold" class="fs-6 text-primary"></iconify-icon>
              <span class="small text-opacity-70">${esc(formatDate(p.date))}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <iconify-icon icon="solar:clock-circle-bold" class="fs-6 text-primary"></iconify-icon>
              <span class="small text-opacity-70">${esc(p.duration)}</span>
            </div>
          </div>
          <div class="project-footer d-flex flex-column gap-1">
            <div class="meta-row small text-opacity-70">
              <iconify-icon icon="lucide:tags" class="me-2 text-primary fs-6"></iconify-icon>
              <span>${esc(tags)}</span>
            </div>
            <div class="meta-row small text-opacity-70">
              <iconify-icon icon="lucide:cpu" class="me-2 text-primary fs-6"></iconify-icon>
              <span>${esc(tech)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  async function init() {
    const grid = document.getElementById('projects-grid');
    const loading = document.getElementById('results-loading');
    if (!grid) return;

    if (loading) loading.classList.remove('d-none');

    try {
      const res = await fetch('/data/projects.json?v=' + Date.now());
      const projects = await res.json();

      projects.sort((a, b) => new Date(b.date) - new Date(a.date));

      const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
      const tags = [...new Set(projects.flatMap((p) => p.tags || []))].sort();
      const tech = [...new Set(projects.flatMap((p) => p.technologies || []))].sort();

      const catEl = document.getElementById('category-chips');
      if (catEl) {
        catEl.innerHTML =
          '<button type="button" class="chip active" data-value="all">All</button>' +
          categories.map((c) => `<button type="button" class="chip" data-value="${esc(c)}">${esc(c)}</button>`).join('');
      }
      chipButtons(tags, 'tags-chips');
      chipButtons(tech, 'tech-chips');

      grid.innerHTML = projects.map((p, i) => renderCard(p, i)).join('');

      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }

      document.dispatchEvent(new CustomEvent('projects:ready'));
    } catch (e) {
      console.error('Failed to load projects', e);
      grid.innerHTML =
        '<div class="col-12"><p class="text-muted">Could not load projects. Please refresh.</p></div>';
    } finally {
      if (loading) loading.classList.add('d-none');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
