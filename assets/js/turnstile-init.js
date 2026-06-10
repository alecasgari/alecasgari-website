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
      if (token && token.value) {
        setSubmitEnabled(true);
        clearInterval(timer);
        return;
      }
      if (document.querySelector('.cf-turnstile iframe')) {
        setSubmitEnabled(true);
      }
      if (attempts > 40) {
        clearInterval(timer);
      }
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchWidget);
  } else {
    watchWidget();
  }
})();
