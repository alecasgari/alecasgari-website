/**
 * Simple project cards from data/projects.json
 */
(function () {
  var PLACEHOLDER = '/assets/images/hero-slider/hero-1.jpg';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US');
  }

  function renderCard(p) {
    return (
      '<div class="col-md-6 col-lg-4">' +
      '<a href="' + esc(p.url) + '" class="text-decoration-none text-dark d-block h-100">' +
      '<div class="project-card d-flex flex-column gap-3 h-100">' +
      '<div class="project-card-img position-relative overflow-hidden">' +
      '<div class="ratio ratio-16x9">' +
      '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" class="img-cover" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">' +
      '</div></div>' +
      '<div class="project-card-content d-flex flex-column gap-2">' +
      '<span class="badge text-bg-primary align-self-start">' + esc(p.category) + '</span>' +
      '<h3 class="mb-0 project-title fs-5">' + esc(p.title) + '</h3>' +
      '<p class="mb-0 text-opacity-70 project-excerpt small">' + esc(p.excerpt) + '</p>' +
      '<span class="small text-opacity-70">' + esc(formatDate(p.date)) + '</span>' +
      '</div></div></a></div>'
    );
  }

  async function init() {
    var grid = document.getElementById('projects-grid');
    var loading = document.getElementById('results-loading');
    if (!grid) return;

    if (loading) loading.classList.remove('d-none');

    try {
      var res = await fetch('/data/projects.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var projects = await res.json();

      projects.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      grid.innerHTML = projects.map(renderCard).join('');
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
