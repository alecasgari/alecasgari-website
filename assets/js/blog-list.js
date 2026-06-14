/**
 * Blog cards from data/blog.json
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

  function renderCard(post) {
    return (
      '<article class="project-card-item">' +
      '<a href="' + esc(post.url) + '" class="project-card-link">' +
      '<div class="project-card">' +
      '<img src="' + esc(post.image) + '" alt="' + esc(post.title) + '" class="project-card-thumb" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">' +
      '<div class="project-card-body">' +
      '<span class="project-tag">' + esc(post.category) + '</span>' +
      '<h3>' + esc(post.title) + '</h3>' +
      '<p>' + esc(post.excerpt) + '</p>' +
      '<div class="blog-card-meta">' +
      '<img src="' + esc(post.author_image) + '" alt="' + esc(post.author) + '" width="28" height="28" class="blog-card-author">' +
      '<span>' + esc(post.author) + '</span>' +
      '<time>' + esc(formatDate(post.date)) + '</time>' +
      '</div>' +
      '</div></div></a></article>'
    );
  }

  async function init() {
    var grid = document.getElementById('blog-grid');
    var loading = document.getElementById('results-loading');
    if (!grid) return;

    if (loading) loading.classList.remove('hidden');

    try {
      var res = await fetch('/data/blog.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var posts = await res.json();

      posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      grid.innerHTML = posts.map(renderCard).join('');
      grid.classList.add('is-visible');
    } catch (e) {
      console.error('Failed to load blog posts', e);
      grid.innerHTML =
        '<p style="color:var(--muted)">Could not load blog posts. Please refresh.</p>';
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
