(function () {
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';

  window.TURNSTILE_SITE_KEY = isLocal
    ? '1x00000000000000000000AA'
    : '0x4AAAAAAADhpnAczaApE118F';

  window.TURNSTILE_IS_LOCAL = isLocal;

  document.querySelectorAll('[data-turnstile]').forEach(function (el) {
    el.classList.add('cf-turnstile');
    el.setAttribute('data-sitekey', window.TURNSTILE_SITE_KEY);
    el.setAttribute('data-theme', 'light');
  });
})();
