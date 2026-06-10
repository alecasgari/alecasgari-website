(function () {
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';

  // Production site key (public). On localhost use Cloudflare test key (always passes).
  window.TURNSTILE_SITE_KEY = isLocal
    ? '1x00000000000000000000AA'
    : '0x4AAAAAAADhpnAczaApE118F';

  window.TURNSTILE_IS_LOCAL = isLocal;
})();
