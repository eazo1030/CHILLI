/**
 * Lily's Chilies — Animations
 * Scroll-reveal + scrolled-header state
 * Respects prefers-reduced-motion
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Scroll-reveal ----- */
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('lilys-visible');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const observe = () => {
      document.querySelectorAll('.lilys-reveal:not(.lilys-visible), .lilys-reveal-stagger:not(.lilys-visible)')
        .forEach((el) => io.observe(el));
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observe, { once: true });
    } else {
      observe();
    }
    document.addEventListener('shopify:section:load', observe);
  } else {
    document.querySelectorAll('.lilys-reveal, .lilys-reveal-stagger')
      .forEach((el) => el.classList.add('lilys-visible'));
  }

  /* ----- Scrolled-header state ----- */
  const onScroll = () => {
    if (window.scrollY > 40) {
      document.body.classList.add('lilys-scrolled');
    } else {
      document.body.classList.remove('lilys-scrolled');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onScroll, { once: true });
  } else {
    onScroll();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
