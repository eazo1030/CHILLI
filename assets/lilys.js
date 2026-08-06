/**
 * Lily's Chilies — restrained storefront polish.
 * Content is visible without JavaScript; this file only enhances the sticky header.
 */
(() => {
  const setScrolledState = () => {
    document.body.classList.toggle('lc-scrolled', window.scrollY > 24);
  };

  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });
  document.addEventListener('shopify:section:load', setScrolledState);
})();
