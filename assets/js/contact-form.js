/**
 * Contact form → n8n webhook (honeypot anti-spam)
 */
(function () {
  const WEBHOOK = 'https://n8n.alecasgari.com/webhook/3d5997cf-3089-46fd-91e2-1183043092c4';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const btn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const fd = new FormData(form);
      if (fd.get('website')) return;

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
      }
    });
  });
})();
