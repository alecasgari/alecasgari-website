/**
 * Project cards from data/projects.json — category filter + search, sorted by project date.
 */
(function () {
  var PLACEHOLDER = '/assets/images/hero-slider/hero-1.jpg';
  var CATEGORIES = [
    'All',
    'AI Automation',
    'System Integration',
    'Web Development',
    'Web Application',
    'Mobile Application',
    'Online Shop',
    'Marketing',
    'Graphic Design',
  ];

  var allProjects = [];
  var activeCategory = 'All';
  var searchQuery = '';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatRelativeDate(iso) {
    if (!iso) return '';
    var d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;

    var now = new Date();
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diffDays = Math.round((startToday - startDate) / 86400000);

    if (diffDays < 0) {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) {
      var weeks = Math.floor(diffDays / 7);
      return weeks + (weeks === 1 ? ' week ago' : ' weeks ago');
    }
    if (diffDays < 365) {
      var months = Math.max(1, Math.floor(diffDays / 30));
      return months + (months === 1 ? ' month ago' : ' months ago');
    }

    var years = Math.floor(diffDays / 365);
    if (years === 1) return '1 year ago';
    if (years < 3) return years + ' years ago';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function sortByDate(projects) {
    return projects.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  function matchesCategory(project, category) {
    if (category === 'All') return true;
    return String(project.category || '') === category;
  }

  function matchesSearch(project, query) {
    if (!query) return true;
    var haystack = (project.title + ' ' + project.excerpt).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function getFilteredProjects() {
    var query = searchQuery.trim().toLowerCase();
    return sortByDate(
      allProjects.filter(function (project) {
        return matchesCategory(project, activeCategory) && matchesSearch(project, query);
      })
    );
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
      '<time datetime="' + esc(p.date) + '" title="' + esc(p.date) + '">' + esc(formatRelativeDate(p.date)) + '</time>' +
      '</div></div></a></article>'
    );
  }

  function updateCount(filteredCount) {
    var countEl = document.getElementById('projects-filter-count');
    if (!countEl) return;

    var total = allProjects.length;
    var hasFilter = activeCategory !== 'All' || searchQuery.trim();

    if (!hasFilter) {
      countEl.textContent = total + ' project' + (total === 1 ? '' : 's');
      return;
    }

    countEl.textContent =
      'Showing ' + filteredCount + ' of ' + total + ' project' + (total === 1 ? '' : 's');
  }

  function renderGrid() {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;

    var filtered = getFilteredProjects();
    updateCount(filtered.length);

    if (!filtered.length) {
      grid.innerHTML =
        '<p class="projects-empty">No projects match your filters. Try another category or search term.</p>';
    } else {
      grid.innerHTML = filtered.map(renderCard).join('');
    }

    grid.classList.add('is-visible');
  }

  function renderCategoryChips() {
    var wrap = document.getElementById('project-filters-categories');
    if (!wrap) return;

    wrap.innerHTML = CATEGORIES.map(function (category) {
      var isActive = category === activeCategory;
      return (
        '<button type="button" class="project-filter-chip' +
        (isActive ? ' is-active' : '') +
        '" data-category="' +
        esc(category) +
        '"' +
        (isActive ? ' aria-pressed="true"' : ' aria-pressed="false"') +
        '>' +
        esc(category) +
        '</button>'
      );
    }).join('');

    wrap.querySelectorAll('.project-filter-chip').forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-category') || 'All';
        wrap.querySelectorAll('.project-filter-chip').forEach(function (chip) {
          var selected = chip === button;
          chip.classList.toggle('is-active', selected);
          chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        renderGrid();
      });
    });
  }

  function bindSearch() {
    var input = document.getElementById('project-search');
    if (!input) return;

    input.addEventListener('input', function () {
      searchQuery = input.value;
      renderGrid();
    });
  }

  async function init() {
    var grid = document.getElementById('projects-grid');
    var loading = document.getElementById('results-loading');
    var filters = document.getElementById('project-filters');
    if (!grid) return;

    if (loading) loading.classList.remove('hidden');

    try {
      var res = await fetch('/data/projects.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      allProjects = await res.json();
      if (!Array.isArray(allProjects)) allProjects = [];

      allProjects = sortByDate(allProjects);
      renderCategoryChips();
      bindSearch();
      renderGrid();

      if (filters) filters.classList.remove('hidden');
    } catch (e) {
      console.error('Failed to load projects', e);
      grid.innerHTML =
        '<p class="projects-empty">Could not load projects. Please refresh.</p>';
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
