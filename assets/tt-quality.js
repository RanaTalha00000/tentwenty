(function () {
  const track = document.getElementById('ttQualityTrack');
  const wrap = document.getElementById('ttQualityWrap');
  const cursor = document.getElementById('ttQualityCursor');
  const taglineEl = document.getElementById('ttQualityTagline');
  const nameEl = document.getElementById('ttQualityName');
  const descEl = document.getElementById('ttQualityDesc');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.tt-quality__slide'));
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  let startX = 0;
  let isDragging = false;
  let dragMoved = false;

  function setPositions() {
    slides.forEach((slide, i) => {
      let pos = i - current;
      if (pos > total / 2) pos -= total;
      if (pos < -total / 2) pos += total;
      slide.setAttribute('data-pos', String(Math.max(-2, Math.min(2, pos))));
    });
  }

  function animateInfo() {
    const slide = slides[current];
    const tagline = slide.getAttribute('data-tagline') || '';
    const name = slide.getAttribute('data-name') || '';
    const desc = slide.getAttribute('data-desc') || '';

    [taglineEl, nameEl, descEl].forEach(el => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
    });

    setTimeout(() => {
      if (taglineEl) taglineEl.textContent = tagline;
      if (nameEl) nameEl.textContent = name;
      if (descEl) descEl.textContent = desc;

      if (taglineEl) {
        taglineEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        taglineEl.style.opacity = '1';
        taglineEl.style.transform = 'translateY(0)';
      }
      if (nameEl) {
        nameEl.style.transition = 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s';
        nameEl.style.opacity = '1';
        nameEl.style.transform = 'translateY(0)';
      }
      if (descEl) {
        descEl.style.transition = 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s';
        descEl.style.opacity = '1';
        descEl.style.transform = 'translateY(0)';
      }
    }, 150);
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    setPositions();
    animateInfo();
  }

  // Cursor follow
  if (wrap && cursor) {
    wrap.addEventListener('mousemove', function (e) {
      const rect = wrap.getBoundingClientRect();
      cursor.style.left = (e.clientX - rect.left) + 'px';
      cursor.style.top = (e.clientY - rect.top) + 'px';
    });
  }

  // Mouse drag
  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    if (Math.abs(e.clientX - startX) > 8) dragMoved = true;
  });

  window.addEventListener('mouseup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    if (!dragMoved) return;
    const diff = e.clientX - startX;
    if (diff < -50) goTo(current + 1);
    else if (diff > 50) goTo(current - 1);
  });

  // Touch drag
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    dragMoved = false;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (Math.abs(e.touches[0].clientX - startX) > 8) dragMoved = true;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!dragMoved) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff < -50) goTo(current + 1);
    else if (diff > 50) goTo(current - 1);
  });

  setPositions();
  animateInfo();

  /* ── SCROLL TRIGGER: add is-visible class ───────────────────── */
  var qualitySection = document.querySelector('.tt-quality');
  if (qualitySection) {
    var visObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          qualitySection.classList.add('is-visible');
          visObs.unobserve(qualitySection);
        }
      });
    }, { threshold: 0.15 });
    visObs.observe(qualitySection);
  }

})();