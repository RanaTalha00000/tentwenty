/**
 * tt-collection.js
 * ─────────────────────────────────────────────────────────────
 * Handles all animations and interactions for the collection page.
 * Modular, readable, no dependencies required.
 *
 * Modules:
 *   1. wordReveal      — clip-mask title animation
 *   2. scrollReveal    — IntersectionObserver fade/slide-up
 *   3. countUp         — number count animation
 *   4. filterToggle    — collapsible filter groups
 *   5. mobileFilter    — off-canvas sidebar on mobile
 *   6. priceRange      — price filter apply button
 *   7. layoutToggle    — grid ↔ list view switch
 * ─────────────────────────────────────────────────────────────
 */

(() => {
  'use strict';

  /* ─── 1. WORD REVEAL ─── */
  const wordReveal = {
    /**
     * Wraps each word in the title with a clip container,
     * then triggers the reveal after a short delay.
     */
    init(selector) {
      const el = document.querySelector(selector);
      if (!el) return;

      const originalHTML = el.innerHTML;

      // Split by spaces, preserving <em> tags
      const wrapped = originalHTML
        .replace(/(<em>[^<]*<\/em>|[^\s]+)/g, (word) => {
          return `<span class="tt-word"><span class="tt-word-inner">${word}</span></span> `;
        })
        .trim();

      el.innerHTML = wrapped;

      // Stagger the inner spans via transition-delay
      el.querySelectorAll('.tt-word-inner').forEach((inner, i) => {
        inner.style.transitionDelay = `${i * 0.08}s`;
      });

      // Small rAF so the browser paints first, then animates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('is-revealed'));
      });
    }
  };

  /* ─── 2. SCROLL REVEAL ─── */
  const scrollReveal = {
    observer: null,

    init() {
      const targets = document.querySelectorAll(
        '.tt-coll__header-top, .tt-coll__meta, [data-reveal], .tt-coll__item'
      );
      if (!targets.length) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      targets.forEach((el) => this.observer.observe(el));
    },

    destroy() {
      if (this.observer) this.observer.disconnect();
    }
  };

  /* ─── 3. COUNT-UP ─── */
  const countUp = {
    /**
     * Animates a number from 0 to its target value using rAF.
     * Reads target from data-count-up attribute.
     */
    run(el) {
      const target = parseInt(el.dataset.countUp, 10);
      if (isNaN(target) || target === 0) return;

      const duration = 1200; // ms
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },

    init() {
      const els = document.querySelectorAll('[data-count-up]');
      if (!els.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.run(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      els.forEach((el) => observer.observe(el));
    }
  };

  /* ─── 4. FILTER TOGGLE ─── */
  const filterToggle = {
    /**
     * Collapses / expands filter groups via aria-expanded
     * and a .is-collapsed class on the body element.
     */
    init() {
      document.querySelectorAll('[data-filter-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!isExpanded));

          const bodyId = btn.getAttribute('aria-controls');
          const body = bodyId
            ? document.getElementById(bodyId)
            : btn.nextElementSibling;

          if (body) body.classList.toggle('is-collapsed', isExpanded);
        });
      });
    }
  };

  /* ─── 5. MOBILE FILTER ─── */
  const mobileFilter = {
    sidebar: null,
    trigger: null,
    overlayBg: null,

    open() {
      this.sidebar.classList.add('is-mobile-open');
      this.trigger.setAttribute('aria-expanded', 'true');
      this.overlayBg.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.sidebar.classList.remove('is-mobile-open');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.overlayBg.classList.remove('is-active');
      document.body.style.overflow = '';
    },

    init() {
      this.sidebar = document.getElementById('ttFilterSidebar');
      this.trigger = document.querySelector('[data-mobile-filter-toggle]');
      if (!this.sidebar || !this.trigger) return;

      // Create overlay backdrop
      this.overlayBg = document.createElement('div');
      this.overlayBg.className = 'tt-coll__overlay-bg';
      document.body.appendChild(this.overlayBg);

      this.trigger.addEventListener('click', () => {
        const isOpen = this.sidebar.classList.contains('is-mobile-open');
        if (isOpen) this.close(); else this.open();
      });

      this.overlayBg.addEventListener('click', () => this.close());

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });
    }
  };

  /* ─── 6. PRICE RANGE ─── */
  const priceRange = {
    /**
     * Builds a URL from the current collection base + filter params
     * and navigates when the Apply button is clicked.
     */
    applyFilter(priceWrap) {
      const baseUrl = priceWrap.dataset.filterUrl;
      const url = new URL(baseUrl, window.location.origin);

      // Preserve existing filter params from current URL
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((val, key) => {
        if (!key.startsWith('filter.v.price')) {
          url.searchParams.set(key, val);
        }
      });

      // Apply new price values
      const minInput = priceWrap.querySelector('[data-price-min]');
      const maxInput = priceWrap.querySelector('[data-price-max]');
      if (minInput?.value) url.searchParams.set(minInput.name, minInput.value);
      if (maxInput?.value) url.searchParams.set(maxInput.name, maxInput.value);

      window.location.href = url.toString();
    },

    init() {
      document.querySelectorAll('[data-price-range]').forEach((wrap) => {
        const applyBtn = wrap.querySelector('[data-price-apply]');
        if (!applyBtn) return;

        applyBtn.addEventListener('click', () => this.applyFilter(wrap));

        // Also apply on Enter in either input
        wrap.querySelectorAll('[data-price-min], [data-price-max]').forEach((input) => {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.applyFilter(wrap);
          });
        });
      });
    }
  };

  /* ─── 7. LAYOUT TOGGLE ─── */
  const layoutToggle = {
    STORAGE_KEY: 'tt-coll-layout',

    init() {
      const btn = document.querySelector('[data-layout-toggle]');
      const grid = document.querySelector('[data-grid]');
      if (!btn || !grid) return;

      // Restore saved preference
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'list') {
        grid.classList.add('is-list-view');
        this.updateIcon(btn, true);
      }

      btn.addEventListener('click', () => {
        const isListView = grid.classList.toggle('is-list-view');
        localStorage.setItem(this.STORAGE_KEY, isListView ? 'list' : 'grid');
        this.updateIcon(btn, isListView);
      });
    },

    updateIcon(btn, isListView) {
      const gridIcon = btn.querySelector('.tt-coll__layout-icon--grid');
      const listIcon = btn.querySelector('.tt-coll__layout-icon--list');
      if (gridIcon) gridIcon.style.display = isListView ? 'none' : 'block';
      if (listIcon) listIcon.style.display = isListView ? 'block' : 'none';
    }
  };

  /* ─── BOOT ─── */
  function init() {
    wordReveal.init('.tt-coll__title[data-split-text]');
    scrollReveal.init();
    countUp.init();
    filterToggle.init();
    mobileFilter.init();
    priceRange.init();
    layoutToggle.init();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
