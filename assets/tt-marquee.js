(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     tt-marquee.js
     Handles:
       1. Heading word-by-word clip-mask reveal on scroll entry
       2. Label + subtext staggered fade-in
       3. Marquee hover-pause
     ───────────────────────────────────────────────────────────── */

  const section = document.querySelector('.tt-marquee');
  if (!section) return;

  /* ── 1. SCROLL REVEAL via IntersectionObserver ─────────────── */
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add('tt-marquee--visible');
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(section);

  /* ── 2. MARQUEE HOVER PAUSE ─────────────────────────────────── */
  var strip = section.querySelector('.tt-marquee__strip-outer');
  if (strip) {
    strip.addEventListener('mouseenter', function () {
      strip.querySelectorAll('.tt-marquee__track').forEach(function (t) {
        t.style.animationPlayState = 'paused';
      });
    });
    strip.addEventListener('mouseleave', function () {
      strip.querySelectorAll('.tt-marquee__track').forEach(function (t) {
        t.style.animationPlayState = 'running';
      });
    });
  }

})();
