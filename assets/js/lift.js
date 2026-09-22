/* Safety section: scroll-driven lift diagram. As the visitor reads the six
   stages, the crane raises its boom, lowers the hook, picks the load and
   hoists it; the stage currently being read is highlighted.
   Depends on site.js (window.Site) and GSAP ScrollTrigger. */
(function () {
  const panel = document.querySelector('[data-lift]');
  if (!panel) return;
  const Site = window.Site;
  const $ = (sel) => panel.querySelector(sel);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const el = {
    cam: $('[data-lift-cam]'),
    boom: $('[data-boom]'),
    ext: $('[data-boom-ext]'),
    cable: $('[data-cable]'),
    hook: $('[data-hook]'),
    load: $('[data-load]'),
    phase: $('[data-lift-phase]'),
    angle: $('[data-out-angle]'),
    height: $('[data-out-height]'),
    radius: $('[data-out-radius]'),
    util: $('[data-out-util]'),
  };

  // Diagram geometry, in SVG user units.
  const PIV_X = 333, PIV_Y = 200, LEN = 640, GROUND = 640, LOAD_H = 58;
  const HOOK_MIN = 96, HOOK_MAX = GROUND - LOAD_H - 26;

  function draw(p) {
    // Boom raises and extends over the first fifth of the scroll.
    const pa = easeInOut(clamp(p / 0.22, 0, 1));
    const ang = lerp(-78, -50, pa);
    const sx = lerp(0.5, 1, pa);
    el.boom.setAttribute('transform', `rotate(${ang.toFixed(2)} ${PIV_X} ${PIV_Y})`);
    el.ext.setAttribute('transform', `translate(${PIV_X},${PIV_Y}) scale(${sx.toFixed(3)},1) translate(${-PIV_X},${-PIV_Y})`);

    const rad = (ang * Math.PI) / 180;
    const tipX = PIV_X + LEN * sx * Math.cos(rad);
    const tipY = PIV_Y + LEN * sx * Math.sin(rad);

    // Hook descends to the load, then the load is hoisted.
    const pd = easeInOut(clamp((p - 0.18) / 0.28, 0, 1));
    const ph = easeInOut(clamp((p - 0.54) / 0.34, 0, 1));
    const stowed = clamp(tipY + 34, HOOK_MIN, HOOK_MAX);
    const down = HOOK_MAX;
    const hoisted = clamp(Math.max(tipY + 46, HOOK_MIN + 40), HOOK_MIN, HOOK_MAX);
    let hookY = lerp(stowed, down, pd);
    if (ph > 0) hookY = lerp(down, hoisted, ph);
    hookY = clamp(hookY, HOOK_MIN, HOOK_MAX);

    el.cable.setAttribute('x1', tipX.toFixed(1));
    el.cable.setAttribute('y1', tipY.toFixed(1));
    el.cable.setAttribute('x2', tipX.toFixed(1));
    el.cable.setAttribute('y2', hookY.toFixed(1));
    el.hook.setAttribute('transform', `translate(${tipX.toFixed(1)},${hookY.toFixed(1)})`);

    const attached = p > 0.46;
    const loadX = attached ? tipX : 880;
    const loadY = attached ? hookY + 26 : GROUND - LOAD_H;
    el.load.setAttribute('transform', `translate(${loadX.toFixed(1)},${loadY.toFixed(1)})`);

    if (!Site.reduced) {
      // Camera eases toward the boom tip and pushes in as the load rises.
      const s = lerp(1, 1.08, easeInOut(clamp((p - 0.4) / 0.5, 0, 1)));
      const cx = (tipX - 600) * 0.18, cy = (tipY - 300) * 0.12;
      el.cam.setAttribute('transform', `translate(${(-cx).toFixed(1)},${(-cy).toFixed(1)}) scale(${s.toFixed(3)})`);
      el.cam.style.transformOrigin = '600px 400px';
    }

    const label = p < 0.18 ? 'Boom deployment' : p < 0.46 ? 'Cable descent' : p < 0.56 ? 'Load secured' : p < 0.92 ? 'Controlled hoist' : 'Lift complete';
    if (el.phase.textContent !== label) el.phase.textContent = label;
    el.angle.textContent = Math.abs(ang).toFixed(1) + '°';
    el.height.textContent = clamp(((GROUND - (hookY + 26 + LOAD_H)) / (GROUND - HOOK_MIN)) * 68, 0, 68).toFixed(1) + ' m';
    el.radius.textContent = ((Math.abs(tipX - PIV_X) / LEN) * 68).toFixed(1) + ' m';
    el.util.textContent = Math.round(lerp(38, 72, pd)) + '%';
  }

  draw(0);
  if (!window.ScrollTrigger) { draw(1); return; }

  // Desktop: the panel is sticky beside the list, so the drawing follows the
  // list. Narrow screens: the panel sits below the list and plays as it passes.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    // Finish exactly as the sticky panel lets go: when the section's bottom
    // meets the panel's bottom edge (sticky top + panel height).
    const stickyTop = () => parseFloat(getComputedStyle(panel.parentElement).top) || 0;
    ScrollTrigger.create({
      trigger: '.safety',
      start: 'top 55%',
      end: () => `bottom ${stickyTop() + panel.offsetHeight}px`,
      onUpdate: (self) => draw(self.progress),
      onRefresh: (self) => draw(self.progress),
    });
  });
  mm.add('(max-width: 999px)', () => {
    ScrollTrigger.create({
      trigger: panel,
      start: 'top 85%',
      end: 'bottom 30%',
      onUpdate: (self) => draw(self.progress),
      onRefresh: (self) => draw(self.progress),
    });
  });

  // Highlight whichever stage is in the reading zone.
  const stages = Array.from(document.querySelectorAll('.stage'));
  stages.forEach((stage, i) => {
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 60%',
      end: i === stages.length - 1 ? 'bottom 20%' : 'bottom 60%',
      onToggle: (self) => stage.classList.toggle('is-current', self.isActive),
    });
  });
})();
