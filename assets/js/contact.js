/* Contact page: hero entrance, and an enquiry form that composes an email.
   The site is static, so there is no server to post to — the form opens the
   visitor's mail app with everything filled in. Depends on site.js. */
(function () {
  const Site = window.Site;

  if (!Site.reduced) {
    gsap.to('.page-hero [data-hero-in]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
  }

  const form = document.querySelector('[data-enquiry]');
  if (!form) return;
  const status = form.querySelector('[data-enquiry-status]');

  const LABELS = {
    name: 'Name',
    company: 'Company',
    phone: 'Phone',
    email: 'Email',
    site: 'Site location',
    dates: 'Dates',
    load: 'Load and radius',
    message: 'Details',
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();

    // Only name and phone are needed for us to call back.
    if (!name || !phone) {
      status.textContent = 'Please add your name and a phone number so we can call you back.';
      (name ? form.querySelector('#phone') : form.querySelector('#name')).focus();
      return;
    }

    const lines = Object.entries(LABELS)
      .map(([key, label]) => [label, (data.get(key) || '').trim()])
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);

    const subject = `Lift enquiry — ${name}${data.get('company') ? ' (' + String(data.get('company')).trim() + ')' : ''}`;
    const body = lines.join('\n') + '\n\n— Sent from sunder.in';
    window.location.href = `mailto:info@sunder.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app. If nothing happens, write to info@sunder.in.';
  });
})();
