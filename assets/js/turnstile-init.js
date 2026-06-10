(function () {
  var siteKey = String(window.TURNSTILE_SITE_KEY || '');
  if (!siteKey || !window.turnstile) return;

  function renderWidgets() {
    document.querySelectorAll('[data-turnstile]').forEach(function (el) {
      if (el.dataset.turnstileRendered === '1') return;
      el.dataset.turnstileRendered = '1';
      window.turnstile.render(el, {
        sitekey: siteKey,
        theme: 'light',
      });
    });
  }

  window.turnstile.ready(renderWidgets);
})();
