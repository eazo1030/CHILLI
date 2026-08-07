/**
 * Lily's Chilies storefront polish.
 * Powers the decorative hero runner, featured-product slideshow, and
 * progressive product-category explorer.
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

  const initHeroSlider = (root) => {
    if (root.dataset.lcHeroSliderReady === 'true') return;

    const slides = [...root.querySelectorAll('[data-lc-hero-slide]')];
    const dots = [...root.querySelectorAll('[data-lc-slide-dot]')];
    const previousButton = root.querySelector('[data-lc-slide-previous]');
    const nextButton = root.querySelector('[data-lc-slide-next]');
    const toggleButton = root.querySelector('[data-lc-slide-toggle]');
    const toggleIcon = root.querySelector('[data-lc-slide-toggle-icon]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const autoplayEnabled = root.dataset.lcSlideAutoplay === 'true';
    const interval = Math.max(3000, Number.parseInt(root.dataset.lcSlideInterval || '6000', 10));

    if (!slides.length) return;

    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;
    let manuallyPaused = false;
    let pointerPaused = false;
    let focusPaused = false;

    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    };

    const canAutoplay = () => (
      slides.length > 1
      && autoplayEnabled
      && !manuallyPaused
      && !reducedMotion.matches
      && !pointerPaused
      && !focusPaused
      && !document.hidden
    );

    const updateToggle = () => {
      if (!toggleButton) return;
      const motionDisabled = reducedMotion.matches;
      toggleButton.disabled = motionDisabled;
      toggleButton.setAttribute('aria-pressed', String(manuallyPaused || motionDisabled));
      toggleButton.setAttribute(
        'aria-label',
        motionDisabled
          ? 'Automatic product rotation disabled by motion preference'
          : manuallyPaused ? 'Play featured products' : 'Pause featured products',
      );
      if (toggleIcon) toggleIcon.textContent = manuallyPaused || motionDisabled ? '▶' : 'Ⅱ';
    };

    const start = () => {
      stop();
      if (!canAutoplay()) return;
      timer = window.setInterval(() => showSlide(activeIndex + 1), interval);
    };

    const showSlide = (requestedIndex, restartAutoplay = false) => {
      activeIndex = (requestedIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        if (active) slide.removeAttribute('tabindex');
        else slide.setAttribute('tabindex', '-1');
      });
      dots.forEach((dot, index) => {
        const active = index === activeIndex;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (restartAutoplay) start();
    };

    toggleButton?.addEventListener('click', () => {
      manuallyPaused = !manuallyPaused;
      updateToggle();
      if (manuallyPaused) {
        stop();
      } else {
        pointerPaused = false;
        focusPaused = false;
        start();
      }
    });
    previousButton?.addEventListener('click', () => showSlide(activeIndex - 1, true));
    nextButton?.addEventListener('click', () => showSlide(activeIndex + 1, true));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number.parseInt(dot.dataset.lcSlideDot || '0', 10);
        showSlide(index, true);
      });
    });

    root.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
    });
    root.addEventListener('mouseenter', () => {
      pointerPaused = true;
      stop();
    });
    root.addEventListener('mouseleave', () => {
      pointerPaused = false;
      start();
    });
    root.addEventListener('focusin', () => {
      focusPaused = true;
      stop();
    });
    root.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        focusPaused = root.contains(document.activeElement);
        start();
      });
    });

    const handleVisibility = () => start();
    const handleMotionPreference = () => {
      updateToggle();
      start();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener?.('change', handleMotionPreference);

    root.lcHeroSliderCleanup = () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener?.('change', handleMotionPreference);
    };
    root.dataset.lcHeroSliderReady = 'true';
    showSlide(activeIndex);
    updateToggle();
    start();
  };

  const initHeroSliders = (scope = document) => {
    const roots = scope.matches?.('[data-lc-hero-slider]')
      ? [scope]
      : [...scope.querySelectorAll('[data-lc-hero-slider]')];
    roots.forEach(initHeroSlider);
  };

  const categoryLabels = {
    all: 'all products',
    gummies: 'Gummies & Bursts',
    belts: 'Belts & Strings',
    specialty: 'Fruit & Specialty',
    packs: 'Packs & Bulk',
  };

  const initProductExplorer = (root) => {
    if (root.dataset.lcProductExplorerReady === 'true') return;

    const items = [...root.querySelectorAll('[data-lc-product-item]')];
    const filterButtons = [...root.querySelectorAll('[data-lc-product-filter]')];
    const filters = root.querySelector('[data-lc-filters]');
    const status = root.querySelector('[data-lc-filter-status]');
    const showAllButton = root.querySelector('[data-lc-show-all]');
    const showAllCount = root.querySelector('[data-lc-show-all-count]');
    const initialLimit = Math.max(1, Number.parseInt(root.dataset.lcInitialLimit || '8', 10));

    if (!items.length || !filterButtons.length || !filters) return;

    const counts = { all: items.length, gummies: 0, belts: 0, specialty: 0, packs: 0 };
    items.forEach((item) => {
      const category = item.dataset.lcProductCategory;
      if (Object.hasOwn(counts, category)) counts[category] += 1;
    });

    root.querySelectorAll('[data-lc-category-count]').forEach((counter) => {
      const category = counter.dataset.lcCategoryCount;
      counter.textContent = counts[category] ?? 0;
    });
    if (showAllCount) showAllCount.textContent = items.length;

    filters.hidden = false;
    root.dataset.lcProductExplorerReady = 'true';

    let activeCategory = 'all';
    let expanded = false;

    const update = () => {
      const matchingItems = items.filter((item) => (
        activeCategory === 'all' || item.dataset.lcProductCategory === activeCategory
      ));
      let shown = 0;

      matchingItems.forEach((item, index) => {
        const shouldShow = activeCategory !== 'all' || expanded || index < initialLimit;
        item.hidden = !shouldShow;
        if (shouldShow) shown += 1;
      });
      const matchingSet = new Set(matchingItems);
      items.filter((item) => !matchingSet.has(item)).forEach((item) => {
        item.hidden = true;
      });

      filterButtons.forEach((button) => {
        const selected = button.dataset.lcProductFilter === activeCategory;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-active', selected);
      });

      if (showAllButton) {
        const canExpand = activeCategory === 'all' && !expanded && matchingItems.length > initialLimit;
        showAllButton.hidden = !canExpand;
        showAllButton.setAttribute('aria-expanded', String(expanded));
      }

      if (status) {
        const label = categoryLabels[activeCategory] || 'products';
        status.textContent = shown === matchingItems.length
          ? `Showing all ${matchingItems.length} ${label}.`
          : `Showing ${shown} of ${matchingItems.length} ${label}.`;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.lcProductFilter || 'all';
        expanded = activeCategory !== 'all';
        update();
      });
    });

    showAllButton?.addEventListener('click', () => {
      expanded = true;
      update();
    });

    update();
  };

  const initProductExplorers = (scope = document) => {
    const roots = scope.matches?.('[data-lc-product-explorer]')
      ? [scope]
      : [...scope.querySelectorAll('[data-lc-product-explorer]')];
    roots.forEach(initProductExplorer);
  };

  requestRender();
  initHeroSliders();
  initProductExplorers();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  document.addEventListener('shopify:section:load', (event) => {
    requestRender();
    initHeroSliders(event.target);
    initProductExplorers(event.target);
  });
  document.addEventListener('shopify:section:unload', (event) => {
    const roots = event.target.matches?.('[data-lc-hero-slider]')
      ? [event.target]
      : [...event.target.querySelectorAll('[data-lc-hero-slider]')];
    roots.forEach((root) => root.lcHeroSliderCleanup?.());
  });
})();
