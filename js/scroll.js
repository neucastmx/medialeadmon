/* ============================================================
   MEDIA LEADMON — SCROLL
   Native smooth scroll for internal anchors.
   IntersectionObserver reveals and ScrollTrigger work with native scroll.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    const header = document.getElementById('header');
    const getOffset = targetTop => {
      if (!header || targetTop <= 0) return 0;

      const wasScrolled = header.classList.contains('scrolled');
      const previousTransition = header.style.transition;
      header.style.transition = 'none';
      header.classList.add('scrolled');
      header.offsetHeight;
      const compactHeight = Math.ceil(header.getBoundingClientRect().height);
      header.classList.toggle('scrolled', wasScrolled);
      header.offsetHeight;
      header.style.transition = previousTransition;

      return compactHeight + 10;
    };
    const getTargetY = target => {
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, targetTop - getOffset(targetTop));
    };
    const scrollToTarget = target => {
      window.scrollTo({
        top: getTargetY(target),
        behavior: 'smooth'
      });
    };
    window.mlScrollToTarget = scrollToTarget;

    window.addEventListener('load', () => {
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          window.setTimeout(() => scrollToTarget(target), 0);
        }
      }
    }, { once: true });

    // Anchor link smooth scroll (native)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToTarget(target);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
