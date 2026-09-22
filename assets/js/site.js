/* Shared behaviour for every page.
   GSAP + ScrollTrigger own scroll-linked motion (reveals, counters, rules);
   Motion owns pointer interactions (hover zoom, arrow nudge, button lift). */
(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const M = window.Motion;
  const EASE = [0.16, 1, 0.3, 1]; // matches CSS --ease-out; GSAP equivalent is expo.out

  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Without GSAP nothing would un-hide the reveal targets, so drop the hidden state.
  if (!hasGsap && root.classList.contains('js-motion')) {
    root.classList.remove('js-motion');
    root.classList.add('no-motion');
  }

  const Site = {
    reduced: reduced || !hasGsap,
    $$: $$,
    EASE: EASE,
    formatNumber: (n) => Math.round(n).toLocaleString('en-IN'),
  };
  window.Site = Site;

  /* Header: solid background once the page has scrolled -------------------- */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu ------------------------------------------------------------ */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      if (open && M && !Site.reduced) {
        M.animate(menu, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.35, ease: EASE });
      }
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    // Close the menu if the viewport grows past the mobile breakpoint.
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* Counters --------------------------------------------------------------- */
  $$('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.to || '0');
    const suffix = el.dataset.suffix || '';
    const render = (v) => { el.textContent = Site.formatNumber(v) + suffix; };
    if (Site.reduced) { render(to); return; }
    const state = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => gsap.to(state, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => render(state.v) }),
    });
  });

  /* Scroll reveals --------------------------------------------------------- */
  if (!Site.reduced) {
    ScrollTrigger.batch('[data-reveal="up"]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06, overwrite: true }),
    });

    ScrollTrigger.batch('[data-reveal="card"]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => els.forEach((el) => {
        const col = Array.prototype.indexOf.call(el.parentNode.children, el) % 3;
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: col * 0.07, ease: 'expo.out', clearProps: 'transform' });
      }),
    });
  }

  /* Hover interactions (Motion) -------------------------------------------- */
  if (M && !Site.reduced) {
    $$('[data-hover-group]').forEach((group) => {
      const img = group.querySelector('[data-hover-img]');
      const arrow = group.querySelector('[data-arrow]');
      M.hover(group, () => {
        if (img) M.animate(img, { scale: 1.045 }, { duration: 1.1, ease: EASE });
        if (arrow) M.animate(arrow, { x: 6 }, { duration: 0.5, ease: EASE });
        return () => {
          if (img) M.animate(img, { scale: 1 }, { duration: 1.1, ease: EASE });
          if (arrow) M.animate(arrow, { x: 0 }, { duration: 0.5, ease: EASE });
        };
      });
    });

    $$('[data-lift-hover]').forEach((btn) => {
      M.hover(btn, () => {
        M.animate(btn, { y: -3 }, { type: 'spring', stiffness: 400, damping: 28 });
        return () => M.animate(btn, { y: 0 }, { type: 'spring', stiffness: 400, damping: 28 });
      });
      M.press(btn, () => {
        M.animate(btn, { scale: 0.98 }, { duration: 0.12 });
        return () => M.animate(btn, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 30 });
      });
    });
  }
})();
