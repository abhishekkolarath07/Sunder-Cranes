/* Home page: full-bleed hero — intro reveal, cross-fading photo slideshow with
   progress bars, and a scroll parallax. Depends on site.js (window.Site). */
(function () {
  const Site = window.Site;
  const $$ = Site.$$;

  const stage = document.querySelector('[data-hero-card]');
  if (!stage) return;
  const slides = $$('[data-slide]', stage);
  const dots = $$('[data-slide-to]', stage);
  const bars = $$('[data-bar]', stage);
  const pauseBtn = stage.querySelector('[data-slide-pause]');
  const content = stage.querySelector('.hero__content');

  const HOLD = 6.5;   // seconds each photo stays up
  const FADE = 1.6;   // cross-fade length

  let current = 0;
  let paused = false;
  let timer = null;   // the progress tween that advances to the next slide
  let push = null;    // the slow push-in on the active photo

  function markCurrent(i) {
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
    slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
  }

  // Reduced motion: first photo, still; dots still switch photos on request.
  if (Site.reduced) {
    dots.forEach((d, i) => d.addEventListener('click', () => { current = i; markCurrent(i); }));
    if (pauseBtn) pauseBtn.hidden = true;
    return;
  }

  gsap.set(slides, { autoAlpha: 0 });
  gsap.set(slides[0], { autoAlpha: 1 });

  function startPush(slide) {
    if (push) push.kill();
    const img = slide.querySelector('img');
    push = gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: HOLD + FADE + 1, ease: 'power1.out' });
  }

  function runTimer() {
    if (timer) timer.kill();
    bars.forEach((b, n) => gsap.set(b, { scaleX: n < current ? 1 : 0 }));
    timer = gsap.to(bars[current], {
      scaleX: 1,
      duration: HOLD,
      ease: 'none',
      onComplete: () => goTo((current + 1) % slides.length),
    });
    if (paused) timer.pause();
  }

  function goTo(i) {
    if (i === current) { runTimer(); return; }
    const from = slides[current];
    const to = slides[i];
    current = i;
    markCurrent(i);
    gsap.to(from, { autoAlpha: 0, duration: FADE, ease: 'power2.inOut' });
    gsap.fromTo(to, { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE, ease: 'power2.inOut' });
    startPush(to);
    runTimer();
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  function setPaused(p) {
    paused = p;
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', String(p));
      pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
    }
    if (timer) p ? timer.pause() : timer.resume();
    if (push) p ? push.pause() : push.resume();
  }
  if (pauseBtn) pauseBtn.addEventListener('click', () => setPaused(!paused));

  // Hold the slideshow while the tab is hidden or the hero is off screen.
  let offscreen = false;
  document.addEventListener('visibilitychange', () => {
    if (paused) return;
    if (document.hidden) { timer && timer.pause(); push && push.pause(); }
    else if (!offscreen) { timer && timer.resume(); push && push.resume(); }
  });

  /* Intro -------------------------------------------------------------------- */
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(stage, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .fromTo('[data-nav]', { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.9)
    .fromTo(slides[0].querySelector('img'), { scale: 1.3 }, { scale: 1.12, duration: 2.2, ease: 'expo.out' }, 0)
    .to('.hero__title .line > span', { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.7)
    .to('.hero [data-hero-in]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.9)
    .add(() => { startPush(slides[0]); runTimer(); }, 2.2);

  /* Scroll: photo drifts, copy lifts and fades as the hero leaves ------------ */
  gsap.to('.hero__slides', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to(content, {
    y: -60,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: stage, start: '35% top', end: '85% top', scrub: true },
  });
  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: 'bottom top',
    onLeave: () => { offscreen = true; if (!paused) { timer && timer.pause(); push && push.pause(); } },
    onEnterBack: () => { offscreen = false; if (!paused) { timer && timer.resume(); push && push.resume(); } },
  });
})();
