/* Fleet page: hero entrance and category filtering of the equipment tables.
   Depends on site.js (window.Site). */
(function () {
  const Site = window.Site;
  const $$ = Site.$$;
  const M = window.Motion;

  /* Hero entrance ----------------------------------------------------------- */
  if (!Site.reduced) {
    gsap.to('.page-hero [data-hero-in]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
  }

  /* Filters ----------------------------------------------------------------- */
  const groups = $$('[data-group]');
  const filters = $$('[data-filter]');
  const countOut = document.querySelector('[data-count-out]');
  const empty = document.querySelector('[data-empty]');

  const machinesIn = (group) =>
    Array.from(group.querySelectorAll('[data-machine]'))
      .reduce((n, card) => n + (parseInt(card.dataset.units, 10) || 1), 0);

  function apply(category, animate) {
    let shown = 0;
    const visible = [];
    groups.forEach((group) => {
      const match = category === 'all' || group.dataset.group === category;
      group.hidden = !match;
      if (match) { shown += machinesIn(group); visible.push(group); }
    });
    // The transport group lists no individual machines, so it has no count.
    if (countOut) countOut.textContent = shown ? `${shown} machines` : '';
    if (empty) empty.classList.toggle('is-visible', visible.length === 0);

    if (animate && M && !Site.reduced && visible.length) {
      M.animate(visible, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, ease: Site.EASE, delay: M.stagger(0.05) });
    }
  }

  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    apply(btn.dataset.filter, true);
  }));
  apply('all', false);
})();
