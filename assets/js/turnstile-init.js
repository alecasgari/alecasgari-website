(function () {
  var siteKey = window.TURNSTILE_SITE_KEY;
  if (!siteKey) return;

  var btn = document.getElementById('submitBtn');

  function setSubmit(enabled) {
    if (btn) btn.disabled = !enabled;
  }

  function showError(code) {
    if (document.getElementById('turnstile-err')) return;
    var box = document.getElementById('turnstile-box');
    if (!box) return;
    var p = document.createElement('p');
    p.id = 'turnstile-err';
    p.className = 'text-danger small mb-0 mt-2';
    p.textContent =
      'Security check failed (' +
      code +
      '). In Cloudflare Turnstile click Update, or switch widget mode to Non-interactive, then refresh.';
    box.parentNode.insertBefore(p, box.nextSibling);
    setSubmit(false);
  }

  function renderOnce() {
    var el = document.getElementById('turnstile-box');
    if (!el || el.dataset.rendered === '1') return;
    el.dataset.rendered = '1';
    el.innerHTML = '';

    window.turnstile.render(el, {
      sitekey: siteKey,
      theme: 'light',
      size: 'flexible',
      callback: function () {
        setSubmit(true);
      },
      'error-callback': function (code) {
        console.error('Turnstile error:', code);
        showError(code);
      },
      'expired-callback': function () {
        setSubmit(false);
      },
    });
  }

  function start() {
    setSubmit(false);
    if (window.turnstile) {
      window.turnstile.ready(renderOnce);
      return;
    }
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (window.turnstile) {
        clearInterval(t);
        window.turnstile.ready(renderOnce);
      } else if (n > 50) {
        clearInterval(t);
        showError('script-blocked');
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
