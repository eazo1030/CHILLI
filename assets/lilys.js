/**
 * Lily's Chilies storefront polish.
 * Keeps the decorative runner clear of the sticky header and powers the
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
  initProductExplorers();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  document.addEventListener('shopify:section:load', (event) => {
    requestRender();
    initProductExplorers(event.target);
  });
})();
