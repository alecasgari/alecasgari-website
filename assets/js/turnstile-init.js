(function () {
  if (!window.TURNSTILE_SITE_KEY) return;

  function setSubmitEnabled(enabled) {
    var btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = !enabled;
  }

  function watchWidget() {
    setSubmitEnabled(false);
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      var token = document.querySelector('[name="cf-turnstile-response"]');
      var iframe = document.querySelector('.cf-turnstile iframe');
      if (token && token.value) {
        setSubmitEnabled(true);
        clearInterval(timer);
      } else if (iframe) {
        setSubmitEnabled(true);
      } else if (attempts > 60) {
        clearInterval(timer);
        document.querySelectorAll('[data-turnstile]').forEach(function (el) {
          if (!el.querySelector('iframe')) {
            el.innerHTML =
              '<p class="text-danger small mb-0">Security check did not load. Add alecasgari.com in Cloudflare Turnstile hostnames, then refresh.</p>';
          }
        });
      }
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchWidget);
  } else {
    watchWidget();
  }
})();
