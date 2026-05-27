/* ============================================================
   MEDIA LEADMON — SCROLL
   Native smooth scroll for internal anchors.
   IntersectionObserver reveals and ScrollTrigger work with native scroll.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    const header = document.getElementById('header');
    const getOffset = () => (header ? Math.ceil(header.getBoundingClientRect().height) : 0);
    const scrollToTarget = (target, behavior) => {
      const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
      window.scrollTo({ top: Math.max(0, top), behavior });
    };

    // Anchor link smooth scroll (native)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target, 'smooth');

        // Re-align after first-load layout shifts from lazy media and font rendering.
        window.setTimeout(() => scrollToTarget(target, 'auto'), 380);
        window.setTimeout(() => scrollToTarget(target, 'auto'), 900);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
