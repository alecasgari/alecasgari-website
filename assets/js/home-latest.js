/**
 * Homepage latest posts from data/blog.json so n8n publishes show up
 * without rebuilding index.html.
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

  function listingImage(post) {
    return post.card_image || post.image || PLACEHOLDER;
  }

  function renderCard(post, index) {
    var eager = index === 0;
    return (
      '<article class="project-card-item">' +
      '<a href="' + esc(post.url) + '" class="project-card-link">' +
      '<div class="project-card">' +
      '<img src="' + esc(listingImage(post)) + '" alt="' + esc(post.title) + '" class="project-card-thumb" width="720" height="405" loading="' +
      (eager ? 'eager' : 'lazy') +
      '" decoding="async" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">' +
      '<div class="project-card-body">' +
      '<span class="project-tag">' + esc(post.category) + '</span>' +
      '<h3>' + esc(post.title) + '</h3>' +
      '<p>' + esc(post.excerpt) + '</p>' +
      '</div></div></a></article>'
    );
  }

  async function init() {
    var grid = document.getElementById('home-latest-grid');
    if (!grid) return;
    try {
      var res = await fetch('/data/blog.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var posts = await res.json();
      posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      grid.innerHTML = posts.slice(0, 3).map(renderCard).join('');
    } catch (e) {
      console.error('Failed to load latest articles', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
