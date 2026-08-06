/**
 * Lily's Chilies storefront polish.
 * Enhances the sticky-header state and keeps the decorative runner out of the
 * header's visual area while the page scrolls.
 */
(() => {
  let frameRequested = false;

  const render = () => {
    frameRequested = false;
    document.body.classList.toggle('lc-scrolled', window.scrollY > 24);

    const runway = document.querySelector('.lc-gummy-runway');
    const header = document.querySelector('.section-header.shopify-section-group-header-group')
      || document.querySelector('.shopify-section-header-sticky')
      || document.querySelector('.header-wrapper');

    if (!runway || !header) return;

    const headerBottom = header.getBoundingClientRect().bottom;
    const runwayTop = runway.getBoundingClientRect().top;
    runway.classList.toggle('lc-gummy-runway--under-header', runwayTop < headerBottom);
  };

  const requestRender = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  };

  requestRender();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  document.addEventListener('shopify:section:load', requestRender);
})();
