(function () {
  var siteKey = String(window.TURNSTILE_SITE_KEY || '');
  if (!siteKey) return;

  function setSubmitEnabled(enabled) {
    var btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = !enabled;
  }

  function renderWidgets() {
    document.querySelectorAll('[data-turnstile]').forEach(function (el) {
      if (el.dataset.turnstileRendered === '1') return;
      el.dataset.turnstileRendered = '1';

      window.turnstile.render(el, {
        sitekey: siteKey,
        theme: 'light',
        callback: function () {
          setSubmitEnabled(true);
        },
        'error-callback': function () {
          el.insertAdjacentHTML(
            'beforeend',
            '<p class="text-danger small mt-2 mb-0">Security check could not load. Refresh or email hello@alecasgari.com</p>'
          );
        },
        'expired-callback': function () {
          setSubmitEnabled(false);
        },
      });

      // Managed mode: enable submit once iframe appears
      var attempts = 0;
      var poll = setInterval(function () {
        attempts += 1;
        if (el.querySelector('iframe')) {
          clearInterval(poll);
          setSubmitEnabled(true);
        } else if (attempts > 40) {
          clearInterval(poll);
        }
      }, 250);
    });
  }

  function start() {
    setSubmitEnabled(false);
    if (window.turnstile) {
      window.turnstile.ready(renderWidgets);
      return;
    }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      if (window.turnstile) {
        clearInterval(timer);
        window.turnstile.ready(renderWidgets);
      } else if (attempts > 50) {
        clearInterval(timer);
        document.querySelectorAll('[data-turnstile]').forEach(function (el) {
          el.innerHTML =
            '<p class="text-danger small">Security check blocked. Allow challenges.cloudflare.com or refresh.</p>';
        });
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
