(function () {
  const AUTOPLAY_DURATION   = 5000;
  const TRANSITION_DURATION = 1100;

  const slides    = Array.from(document.querySelectorAll('.tt-hero__slide'));
  const thumbs    = Array.from(document.querySelectorAll('.tt-hero__thumb'));
  const nextBtn   = document.querySelector('.tt-hero__next');
  const currentEl = document.querySelector('.tt-hero__current');
  const hero      = document.querySelector('.tt-hero');

  if (!slides.length) return;

  let current     = 0;
  let isAnimating = false;
  let autoplayTimer = null;

  function pad(n) { return String(n + 1).padStart(2, '0'); }

  /* =============================================
     TEXT SPLITTING — wrap each char individually
     ============================================= */
  function prepareText(slide) {
    ['tt-hero__label', 'tt-hero__title'].forEach(cls => {
      const el = slide.querySelector('.' + cls);
      if (el && !el.dataset.prepared) {
        const isTitle = cls === 'tt-hero__title';
        // Split into words, each word into chars
        el.innerHTML = el.textContent.trim().split(/\s+/).map((word, wi) =>
          `<span class="tt-word-wrap">${
            word.split('').map((ch, ci) =>
              `<span class="tt-char" data-word="${wi}" data-char="${ci}"
                style="transition-delay:${(wi * 4 + ci) * (isTitle ? 28 : 20)}ms"
              >${ch}</span>`
            ).join('')
          }</span>`
        ).join('<span class="tt-space"> </span>');
        el.dataset.prepared = 'true';
      }
    });
  }

  /* =============================================
     TEXT OUT — chars fly up fast
     ============================================= */
  function textOut(slide) {
    slide.querySelectorAll('.tt-char').forEach((ch, i) => {
      ch.style.transition = `transform 0.32s cubic-bezier(0.55,0,1,1) ${i * 18}ms,
                             opacity   0.22s ease ${i * 12}ms`;
      ch.style.transform  = 'translateY(-120%) skewY(-4deg)';
      ch.style.opacity    = '0';
    });
  }

  /* =============================================
     TEXT IN — chars reveal up from clip, staggered
     ============================================= */
  function textIn(slide, extraDelay) {
    extraDelay = extraDelay || 0;
    const label = slide.querySelectorAll('.tt-hero__label .tt-char');
    const title = slide.querySelectorAll('.tt-hero__title .tt-char');

    // Reset all instantly
    Array.from(label).concat(Array.from(title)).forEach(ch => {
      ch.style.transition = 'none';
      ch.style.transform  = 'translateY(110%) skewY(6deg)';
      ch.style.opacity    = '0';
    });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      // Label chars
      label.forEach((ch, i) => {
        const d = extraDelay + i * 22;
        ch.style.transition = `transform 0.65s cubic-bezier(0.16,1,0.3,1) ${d}ms,
                               opacity   0.4s  ease                        ${d}ms`;
        ch.style.transform  = 'translateY(0%) skewY(0deg)';
        ch.style.opacity    = '1';
      });

      // Title chars — start after label
      const titleOffset = extraDelay + (label.length * 22) * 0.3 + 80;
      title.forEach((ch, i) => {
        const d = titleOffset + i * 28;
        ch.style.transition = `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${d}ms,
                               opacity   0.5s  ease                        ${d}ms`;
        ch.style.transform  = 'translateY(0%) skewY(0deg)';
        ch.style.opacity    = '1';
      });
    }));
  }

  /* =============================================
     CURTAIN — opens from center outward
     ============================================= */
  function clipTransition(prevSlide, nextSlide, onDone) {
    nextSlide.style.zIndex     = '3';
    nextSlide.style.transition = 'none';
    nextSlide.style.opacity    = '1';
    nextSlide.style.clipPath   = 'inset(0 50% 0 50%)';
    nextSlide.classList.add('active');
    prevSlide.style.zIndex     = '2';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      nextSlide.style.transition = `clip-path ${TRANSITION_DURATION}ms cubic-bezier(0.76,0,0.24,1)`;
      nextSlide.style.clipPath   = 'inset(0 0% 0 0%)';

      const nextImg = nextSlide.querySelector('.tt-hero__img');
      if (nextImg) {
        nextImg.style.transition = 'none';
        nextImg.style.transform  = 'scale(1.07)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          nextImg.style.transition = `transform ${TRANSITION_DURATION + 5000}ms ease`;
          nextImg.style.transform  = 'scale(1)';
        }));
      }

      const prevImg = prevSlide.querySelector('.tt-hero__img');
      if (prevImg) {
        prevImg.style.transition = `transform ${TRANSITION_DURATION}ms ease`;
        prevImg.style.transform  = 'scale(0.96)';
      }

      setTimeout(() => {
        prevSlide.classList.remove('active');
        prevSlide.style.zIndex     = '';
        prevSlide.style.opacity    = '0';
        prevSlide.style.transition = '';
        if (prevImg) { prevImg.style.transition = ''; prevImg.style.transform = ''; }
        nextSlide.style.zIndex     = '';
        nextSlide.style.clipPath   = '';
        nextSlide.style.transition = '';
        if (onDone) onDone();
      }, TRANSITION_DURATION + 80);
    }));
  }

  /* =============================================
     THUMBNAIL PROGRESS
     ============================================= */
  function resetProgress(thumb) {
    const bar = thumb.querySelector('.tt-hero__thumb-progress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width      = '0%';
    void bar.offsetWidth;
  }

  function startProgress(thumb) {
    const bar = thumb.querySelector('.tt-hero__thumb-progress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width      = '0%';
    void bar.offsetWidth;
    bar.style.transition = `width ${AUTOPLAY_DURATION}ms linear`;
    bar.style.width      = '100%';
  }

  /* =============================================
     COUNTER ROLL
     ============================================= */
  function rollCounter(toIndex) {
    if (!currentEl) return;
    currentEl.style.transition = 'none';
    currentEl.style.transform  = 'translateY(100%)';
    currentEl.style.opacity    = '0';
    currentEl.textContent      = pad(toIndex);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      currentEl.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease';
      currentEl.style.transform  = 'translateY(0%)';
      currentEl.style.opacity    = '1';
    }));
  }

  /* =============================================
     MAIN TRANSITION
     ============================================= */
  function goTo(index) {
    if (isAnimating) return;
    const next = ((index % slides.length) + slides.length) % slides.length;
    if (next === current) return;

    isAnimating = true;
    clearInterval(autoplayTimer);

    const prevSlide = slides[current];
    const nextSlide = slides[next];

    textOut(prevSlide);

    setTimeout(() => {
      clipTransition(prevSlide, nextSlide, () => {
        isAnimating = false;
        startAutoplay();
      });
      textIn(nextSlide, 200);
    }, 240);

    thumbs[current].classList.remove('active');
    resetProgress(thumbs[current]);
    thumbs[next].classList.add('active');
    startProgress(thumbs[next]);
    rollCounter(next);
    current = next;
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), AUTOPLAY_DURATION);
  }

  /* =============================================
     MAGNETIC FLOATING TEXT BLOCK — follows cursor
     ============================================= */
  if (hero) {
    const contents = document.querySelectorAll('.tt-hero__content');
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      contents.forEach(el => {
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      });

      rafId = requestAnimationFrame(animate);
    }

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      // Normalize -1 to +1 from center
      const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

      // Max float distance in px
      const strength = 22;
      targetX = nx * strength;
      targetY = ny * strength;
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    animate(); // run loop continuously for smooth lerp
  }

  /* =============================================
     INIT
     ============================================= */
  slides.forEach(s => prepareText(s));

  slides[0].style.opacity = '1';
  slides[0].style.zIndex  = '1';
  slides[0].classList.add('active');

  // Page load: staggered char reveal with generous delay
  textIn(slides[0], 600);

  // Ken-Burns on first image
  const firstImg = slides[0].querySelector('.tt-hero__img');
  if (firstImg) {
    firstImg.style.transition = 'none';
    firstImg.style.transform  = 'scale(1.07)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      firstImg.style.transition = 'transform 7s ease';
      firstImg.style.transform  = 'scale(1)';
    }));
  }

  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  thumbs[0].classList.add('active');
  startProgress(thumbs[0]);
  startAutoplay();

})();