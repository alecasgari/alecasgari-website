(function () {
  function setNavScrollLock(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function closeMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;
    toggle.classList.remove('is-open');
    nav.classList.remove('is-open');
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
    setNavScrollLock(false);
  }

  function openMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;
    toggle.classList.add('is-open');
    nav.classList.add('is-open');
    nav.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    setNavScrollLock(true);
  }

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      if (toggle.classList.contains('is-open')) closeMobileNav();
      else openMobileNav();
    });

    var backdrop = nav.querySelector('[data-close-nav]');
    if (backdrop) backdrop.addEventListener('click', closeMobileNav);

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  }

  function whatsappMessageHref() {
    var text =
      "I was browsing this page on your website and I'd like to discuss my projects.\n\n" +
      window.location.href;
    return 'https://wa.me/971504302948?text=' + encodeURIComponent(text);
  }

  function initFloatingActions() {
    if (document.querySelector('.site-float')) return;

    var wrap = document.createElement('div');
    wrap.className = 'site-float';
    wrap.innerHTML =
      '<button type="button" class="site-float__btn site-float__top" aria-label="Back to top">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5.5 5.8 11.7l1.4 1.4 3.8-3.8V19h2V9.3l3.8 3.8 1.4-1.4z"/></svg>' +
      '</button>' +
      '<a class="site-float__btn site-float__whatsapp" href="https://wa.me/971504302948" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.74.46 3.44 1.33 4.94L2 22l5.37-1.4a10 10 0 0 0 4.67 1.19h.01c5.46 0 9.89-4.4 9.89-9.85C21.94 6.4 17.5 2 12.04 2m0 17.99h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.19.83.85-3.1-.2-.32a8.16 8.16 0 0 1-1.26-4.38c0-4.52 3.7-8.2 8.25-8.2 4.54 0 8.24 3.68 8.24 8.2 0 4.52-3.7 8.2-8.2 8.2m4.52-6.14c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.24 3.74 1.49.64 2.08.7 2.82.59.43-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29"/></svg>' +
      '</a>';

    document.body.appendChild(wrap);

    wrap.querySelector('.site-float__whatsapp').href = whatsappMessageHref();

    var topBtn = wrap.querySelector('.site-float__top');
    function syncTop() {
      topBtn.classList.toggle('is-visible', window.scrollY >= 800);
    }

    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();
  }

  function initMobileSocialWhatsApp() {
    var social = document.querySelector('.mobile-nav__social');
    if (!social || social.querySelector('[data-nav-whatsapp]')) return;

    var a = document.createElement('a');
    a.className = 'mobile-nav__social-link mobile-nav__social-link--whatsapp';
    a.setAttribute('data-nav-whatsapp', '1');
    a.href = whatsappMessageHref();
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'WhatsApp');
    a.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.74.46 3.44 1.33 4.94L2 22l5.37-1.4a10 10 0 0 0 4.67 1.19h.01c5.46 0 9.89-4.4 9.89-9.85C21.94 6.4 17.5 2 12.04 2m0 17.99h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.19.83.85-3.1-.2-.32a8.16 8.16 0 0 1-1.26-4.38c0-4.52 3.7-8.2 8.25-8.2 4.54 0 8.24 3.68 8.24 8.2 0 4.52-3.7 8.2-8.2 8.2m4.52-6.14c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.24 3.74 1.49.64 2.08.7 2.82.59.43-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29"/></svg>';
    social.appendChild(a);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileSocialWhatsApp();
    initMobileNav();
    initFloatingActions();
  });
})();
