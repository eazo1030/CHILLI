/**
 * Lily's Chilies storefront motion.
 * Content remains visible without JavaScript; this file enhances the sticky header
 * and maps page scroll to the decorative gummy bear in the hero.
 */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameRequested = false;

  const render = () => {
    frameRequested = false;
    document.body.classList.toggle('lc-scrolled', window.scrollY > 24);

    const gummy = document.querySelector('[data-lc-gummy]');
    const hero = gummy?.closest('.lc-hero');
    if (!gummy || !hero) return;

    if (reducedMotion.matches) {
      gummy.style.removeProperty('--lc-gummy-x');
      gummy.style.removeProperty('--lc-gummy-y');
      gummy.style.removeProperty('--lc-gummy-rotate');
      gummy.style.removeProperty('--lc-gummy-opacity');
      return;
    }

    const heroBounds = hero.getBoundingClientRect();
    const travelRange = Math.max(hero.offsetHeight * 0.8, 1);
    const progress = Math.min(1, Math.max(0, -heroBounds.top / travelRange));
    const x = Math.sin(progress * Math.PI * 2.2) * 22;
    const y = progress * Math.min(hero.offsetHeight * 0.3, 240);
    const rotation = -9 + progress * 54;
    const fade = 0.95 - Math.max(0, progress - 0.72) * 1.15;

    gummy.style.setProperty('--lc-gummy-x', `${x.toFixed(1)}px`);
    gummy.style.setProperty('--lc-gummy-y', `${y.toFixed(1)}px`);
    gummy.style.setProperty('--lc-gummy-rotate', `${rotation.toFixed(1)}deg`);
    gummy.style.setProperty('--lc-gummy-opacity', Math.max(0.58, fade).toFixed(2));
  };

  const requestRender = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  };

  requestRender();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  reducedMotion.addEventListener?.('change', requestRender);
  document.addEventListener('shopify:section:load', requestRender);
})();
