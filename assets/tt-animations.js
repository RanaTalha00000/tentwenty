/* ========================
   TENTWENTY - ANIMATIONS
   1. Section scroll reveal (data-animate → is-visible)
   2. Generic element reveal (data-reveal)
   3. Header scroll effect
   4. Parallax on hero
   5. Horizontal line wipe
   ======================== */

(function () {

  /* ─── 1. SECTION OBSERVER (existing: data-animate) ─── */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-animate]').forEach(el => sectionObserver.observe(el));


  /* ─── 2. GENERIC REVEAL (data-reveal) ─── */
  // Auto-tag elements inside sections for staggered reveal
  function tagRevealElements() {
    // Quality intro heading & subtext
    const qualityHeading = document.querySelector('.tt-quality__heading');
    const qualitySubtext = document.querySelector('.tt-quality__subtext');
    if (qualityHeading && !qualityHeading.hasAttribute('data-reveal')) {
      qualityHeading.setAttribute('data-reveal', '');
    }
    if (qualitySubtext && !qualitySubtext.hasAttribute('data-reveal')) {
      qualitySubtext.setAttribute('data-reveal', '');
      qualitySubtext.setAttribute('data-reveal-delay', '2');
    }

    // Products header
    const productsHeading = document.querySelector('.tt-products__heading');
    const productsViewAll = document.querySelector('.tt-products__view-all');
    if (productsHeading && !productsHeading.hasAttribute('data-reveal')) {
      productsHeading.setAttribute('data-reveal', 'left');
    }
    if (productsViewAll && !productsViewAll.hasAttribute('data-reveal')) {
      productsViewAll.setAttribute('data-reveal', 'right');
    }

    // Product items — scale reveal
    document.querySelectorAll('.tt-products__item').forEach((el, i) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'scale');
        el.setAttribute('data-reveal-delay', String(i + 1));
      }
    });

    // Quality info
    const qualityName = document.querySelector('.tt-quality__name');
    const qualityDesc = document.querySelector('.tt-quality__desc');
    if (qualityName && !qualityName.hasAttribute('data-reveal')) {
      qualityName.setAttribute('data-reveal', '');
    }
    if (qualityDesc && !qualityDesc.hasAttribute('data-reveal')) {
      qualityDesc.setAttribute('data-reveal', '');
      qualityDesc.setAttribute('data-reveal-delay', '2');
    }
  }

  tagRevealElements();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));


  /* ─── 3. HEADER SCROLL EFFECT ─── */
  const header = document.querySelector('.tt-header');
  if (header) {
    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ─── 4. HERO PARALLAX on scroll ─── */
  const heroSlides = document.querySelectorAll('.tt-hero__img');
  if (heroSlides.length) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroH = document.querySelector('.tt-hero').offsetHeight;
      if (scrollY > heroH) return;
      const progress = scrollY / heroH; // 0 → 1
      heroSlides.forEach(img => {
        img.style.transform = `scale(1) translateY(${progress * 60}px)`;
      });
    }, { passive: true });
  }


  /* ─── 5. SMOOTH SCROLL PROGRESS BAR ─── */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    width: 0%;
    background: #1A1A1A;
    z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

})();