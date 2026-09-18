/**
 * Homepage latest posts: keep CRM / n8n / stack pages first.
 * n8n news publishes still appear on /blog.html — they do not occupy the home grid.
 */
(function () {
  var PLACEHOLDER = '/assets/images/hero-slider/hero-1.jpg';
  var PINNED_URLS = [
    '/blog/Best-CRM-Small-Business-2026.html',
    '/blog/5-Signs-You-Need-a-CRM-Now.html'
  ];
  var TELEGRAM_PROJECT = {
    url: '/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.html',
    title: 'Telegram bot that creates presentations',
    excerpt: 'Voice notes in Telegram become PowerPoint decks through n8n and OpenAI.',
    category: 'n8n',
    card_image: '/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.jpg',
    image: '/projects/AI-Powered-Telegram--N8N-Workflow-for-Automated-Voice-to-Presentation.jpg'
  };

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

  function isCommercial(post) {
    var t = ((post.title || '') + ' ' + (post.excerpt || '') + ' ' + (post.slug || '')).toLowerCase();
    return /crm|n8n|telegram|saas|calculator|suitecrm/.test(t);
  }

  function pickPosts(posts) {
    var byUrl = {};
    posts.forEach(function (p) {
      byUrl[p.url] = p;
    });
    var out = [];
    var seen = {};
    function add(p) {
      if (!p || !p.url || seen[p.url] || out.length >= 3) return;
      seen[p.url] = true;
      out.push(p);
    }
    PINNED_URLS.forEach(function (url) {
      add(byUrl[url]);
    });
    posts.forEach(function (p) {
      if (isCommercial(p)) add(p);
    });
    add(TELEGRAM_PROJECT);
    return out.slice(0, 3);
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
      var chosen = pickPosts(posts);
      if (chosen.length) {
        grid.innerHTML = chosen.map(renderCard).join('');
      }
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
