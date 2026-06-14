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
      '<article class="project-card-item">' +
      '<a href="' + esc(p.url) + '" class="project-card-link">' +
      '<div class="project-card">' +
      '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" class="project-card-thumb" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">' +
      '<div class="project-card-body">' +
      '<span class="project-tag">' + esc(p.category) + '</span>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p>' + esc(p.excerpt) + '</p>' +
      '<time>' + esc(formatDate(p.date)) + '</time>' +
      '</div></div></a></article>'
    );
  }

  async function init() {
    var grid = document.getElementById('projects-grid');
    var loading = document.getElementById('results-loading');
    if (!grid) return;

    if (loading) loading.classList.remove('hidden');

    try {
      var res = await fetch('/data/projects.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var projects = await res.json();

      projects.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      grid.innerHTML = projects.map(renderCard).join('');
      grid.classList.add('is-visible');
    } catch (e) {
      console.error('Failed to load projects', e);
      grid.innerHTML =
        '<p style="color:var(--muted)">Could not load projects. Please refresh.</p>';
    } finally {
      if (loading) loading.classList.add('hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
