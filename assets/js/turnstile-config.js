(function () {
  var isLocal =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  window.TURNSTILE_SITE_KEY = isLocal
    ? '1x00000000000000000000AA'
    : '0x4AAAAAAADhpnAczaApE118F';

  if (isLocal) {
    document.querySelectorAll('.cf-turnstile').forEach(function (el) {
      el.setAttribute('data-sitekey', '1x00000000000000000000AA');
    });
  }
})();
