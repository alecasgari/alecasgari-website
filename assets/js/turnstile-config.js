(function () {
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';

  window.TURNSTILE_SITE_KEY = isLocal
    ? '1x00000000000000000000AA'
    : '0x4AAAAAAADhpnAczaApE118F';

  window.TURNSTILE_IS_LOCAL = isLocal;

  window.onTurnstileError = function (code) {
    console.error('Turnstile error:', code);
    var msg =
      code === '400020'
        ? 'Security widget blocked (error 400020). In Cloudflare → Turnstile → your widget, add hostname <strong>alecasgari.com</strong> and save.'
        : 'Security check failed (' + code + '). Refresh the page or email hello@alecasgari.com';
    document.querySelectorAll('[data-turnstile]').forEach(function (el) {
      el.innerHTML = '<p class="text-danger small mb-0">' + msg + '</p>';
    });
    var btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = true;
  };

  window.onTurnstileSuccess = function () {
    var btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = false;
  };

  document.querySelectorAll('[data-turnstile]').forEach(function (el) {
    el.classList.add('cf-turnstile');
    el.setAttribute('data-sitekey', window.TURNSTILE_SITE_KEY);
    el.setAttribute('data-theme', 'light');
    el.setAttribute('data-size', 'flexible');
    el.setAttribute('data-callback', 'onTurnstileSuccess');
    el.setAttribute('data-error-callback', 'onTurnstileError');
  });
})();
