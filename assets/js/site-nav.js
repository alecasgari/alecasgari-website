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

  document.addEventListener('DOMContentLoaded', initMobileNav);
})();
