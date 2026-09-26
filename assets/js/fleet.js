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
    // The transport group lists trailer types, not counted machines.
    if (countOut) countOut.textContent = shown ? `${shown} machines` : 'Quoted per move';
    if (empty) empty.classList.toggle('is-visible', visible.length === 0);

    if (!animate) return;   // first run: leave the scroll reveal to do its job

    // Cards start hidden and are revealed on scroll. Filtering can move a card
    // that was never scrolled past into view, so reveal every shown card here.
    const cards = visible.flatMap((group) => Array.from(group.querySelectorAll('[data-machine]')));
    if (M && !Site.reduced && cards.length) {
      M.animate(cards, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, ease: Site.EASE, delay: M.stagger(0.03, { startDelay: 0.05 }) });
    } else {
      cards.forEach((card) => { card.style.opacity = '1'; card.style.transform = 'none'; });
    }
    // Heights changed, so scroll-linked animations need their positions again.
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  // Filtering makes the page much shorter, so bring the results back into
  // view — otherwise the visitor is left looking at the footer.
  function showResults() {
    const list = document.querySelector('.fleet-groups');
    const toolbar = document.querySelector('.toolbar');
    if (!list) return;
    const offset = (toolbar ? toolbar.offsetHeight : 0) + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 16;
    const top = list.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY <= top) return;   // already above the list
    window.scrollTo({ top, behavior: Site.reduced ? 'auto' : 'smooth' });
  }

  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    apply(btn.dataset.filter, true);
    showResults();
  }));
  apply('all', false);
})();
