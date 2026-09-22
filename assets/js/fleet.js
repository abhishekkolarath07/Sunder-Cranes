/* Fleet page: hero entrance, category filters and sorting.
   Depends on site.js (window.Site). */
(function () {
  const Site = window.Site;
  const $$ = Site.$$;
  const M = window.Motion;

  /* Hero entrance ----------------------------------------------------------- */
  if (!Site.reduced) {
    gsap.to('.page-hero [data-hero-in]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
  }

  /* Filters + sort ---------------------------------------------------------- */
  const cards = $$('[data-machine]');
  const filters = $$('[data-filter]');
  const sort = document.querySelector('[data-sort]');
  const countOut = document.querySelector('[data-count-out]');
  const empty = document.querySelector('[data-empty]');
  let category = 'all';

  const num = (card, key) => parseFloat(card.dataset[key]) || 0;
  const comparators = {
    'cap-desc': (a, b) => num(b, 'cap') - num(a, 'cap'),
    'cap-asc': (a, b) => num(a, 'cap') - num(b, 'cap'),
    'year-desc': (a, b) => num(b, 'year') - num(a, 'year'),
    'year-asc': (a, b) => num(a, 'year') - num(b, 'year'),
    make: (a, b) => String(a.dataset.make).localeCompare(String(b.dataset.make)) || num(b, 'cap') - num(a, 'cap'),
    default: (a, b) => num(a, 'order') - num(b, 'order'),
  };

  function apply(animate) {
    let shown = 0;
    const visible = [];
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.cat === category;
      card.hidden = !match;
      if (match) { shown++; visible.push(card); }
    });
    if (countOut) countOut.textContent = shown + (shown === 1 ? ' result' : ' results');
    if (empty) empty.classList.toggle('is-visible', shown === 0);

    const ranked = cards.slice().sort(comparators[sort ? sort.value : 'default'] || comparators.default);
    ranked.forEach((card, i) => { card.style.order = String(i); });

    // Settle the re-ordered set in with a short, staggered fade.
    if (animate && M && !Site.reduced && visible.length) {
      const inOrder = visible.sort((a, b) => Number(a.style.order) - Number(b.style.order));
      gsap.killTweensOf(inOrder);
      M.animate(inOrder, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, ease: Site.EASE, delay: M.stagger(0.04) });
    }
  }

  filters.forEach((btn) => btn.addEventListener('click', () => {
    category = btn.dataset.filter;
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    apply(true);
  }));
  if (sort) sort.addEventListener('change', () => apply(true));
  apply(false);
})();
