/**
 * Contact form → n8n webhook + Cloudflare Turnstile token
 */
(function () {
  const WEBHOOK = 'https://n8n.alecasgari.com/webhook/3d5997cf-3089-46fd-91e2-1183043092c4';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const btn = document.getElementById('submitBtn');
    const siteKey = window.TURNSTILE_SITE_KEY;

  form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const tokenInput = form.querySelector('[name="cf-turnstile-response"]');
      const token = tokenInput && tokenInput.value;
      if (siteKey && !token) {
        var widget = form.querySelector('[data-turnstile]');
        var loaded = widget && widget.querySelector('iframe');
        if (!loaded) {
          alert(
            window.TURNSTILE_IS_LOCAL
              ? 'Security widget did not load. Refresh the page and wait a moment before submitting.'
              : 'Security check is loading. Please wait a few seconds and try again.'
          );
        } else {
          alert('Please complete the security check.');
        }
        return;
      }

      const fd = new FormData(form);
      const params = new URLSearchParams();
      const firstName = fd.get('firstName') || '';
      const lastName = fd.get('lastName') || '';
      const payload = {
        form_id: form.dataset.formId || 'contact',
        form_name: form.dataset.formName || 'Contact Form',
        name: fd.get('name') || [firstName, lastName].filter(Boolean).join(' '),
        firstName,
        lastName,
        email: fd.get('email') || '',
        company: fd.get('company') || '',
        phone: fd.get('phone') || '',
        message: fd.get('message') || '',
        service: fd.get('service') || '',
        turnstile_token: token || '',
        page_url: location.href,
        timestamp: new Date().toISOString(),
      };

      Object.entries(payload).forEach(([k, v]) => {
        if (v) params.append(k, String(v));
      });

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-text">Sending...</span>';
      }

      try {
        const res = await fetch(`${WEBHOOK}?${params}`, { method: 'GET', mode: 'cors' });
        if (res.ok) {
          const q = new URLSearchParams({
            name: payload.name,
            email: payload.email,
            company: payload.company,
            message: payload.message,
            timestamp: payload.timestamp,
          });
          window.location.href = `/thank-you.html?${q}`;
          return;
        }
        throw new Error('Request failed');
      } catch (err) {
        console.error(err);
        alert('Could not send message. Please try again or email hello@alecasgari.com');
        if (btn) btn.disabled = false;
        if (window.turnstile && siteKey) window.turnstile.reset();
      }
    });
  });
})();
