/**
 * Lily's Chilies storefront polish.
 * Content and the CSS-powered gummy runner remain visible without JavaScript;
 * this file only enhances the sticky-header state.
 */
(() => {
  const setScrolledState = () => {
    document.body.classList.toggle('lc-scrolled', window.scrollY > 24);
  };

  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });
  document.addEventListener('shopify:section:load', setScrolledState);
})();
