/* ============================================================
   MEDIA LEADMON — MAIN
   Nav, cursor, testimonials slider, form, card glow
   ============================================================ */
(function () {
  'use strict';

  /* ---- HEADER scroll ---- */
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE MENU ---- */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const close  = document.getElementById('mobile-close');
    const menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function open()  {
      menu.classList.add('open');
      toggle.classList.add('open');
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function shut() {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => menu.classList.contains('open') ? shut() : open());
    if (close) close.addEventListener('click', shut);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

    // Close when any mobile link is clicked
    menu.querySelectorAll('.mobile-menu__link, .mobile-menu__phone').forEach(el => {
      el.addEventListener('click', shut);
    });
  }

  /* ---- CURSOR ---- */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    const el   = document.getElementById('cursor');
    if (!el) return;
    const dot  = el.querySelector('.cursor__dot');
    const ring = el.querySelector('.cursor__ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (typeof gsap !== 'undefined') gsap.set(dot, { x: mx, y: my });
      else { dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`; }
    });

    (function animRing() {
      rx += (mx - rx) * .11;
      ry += (my - ry) * .11;
      if (typeof gsap !== 'undefined') gsap.set(ring, { x: rx, y: ry });
      else ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
      requestAnimationFrame(animRing);
    })();

    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, .service-card, .case-card, .metric-item--action')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, .service-card, .case-card, .metric-item--action')) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  /* ---- EUREKA MODAL ---- */
  function initEurekaModal() {
    const modal = document.getElementById('eureka-modal');
    const openers = document.querySelectorAll('[data-eureka-open]');
    if (!modal || !openers.length) return;

    const closeEls = modal.querySelectorAll('[data-eureka-close]');
    const closeBtn = modal.querySelector('.eureka-modal__close');

    function open() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function shut() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }

    openers.forEach(el => el.addEventListener('click', open));
    closeEls.forEach(el => el.addEventListener('click', shut));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) shut();
    });
  }

  /* ---- TEAM CAROUSEL ---- */
  function initTeamCarousel() {
    const carousel = document.getElementById('team-carousel');
    const prev = document.getElementById('team-prev');
    const next = document.getElementById('team-next');
    const dots = Array.from(document.querySelectorAll('#team-dots .team__dot'));
    if (!carousel) return;

    const cards = Array.from(carousel.querySelectorAll('.team-card'));
    if (!cards.length) return;

    let active = 0;

    function setActive(index) {
      active = Math.max(0, Math.min(index, cards.length - 1));
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === active);
        dot.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    }

    function goTo(index) {
      const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
      carousel.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      setActive(index);
    }

    if (prev) prev.addEventListener('click', () => goTo(active - 1));
    if (next) next.addEventListener('click', () => goTo(active + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    carousel.addEventListener('scroll', () => {
      let nearest = 0;
      let min = Infinity;
      cards.forEach((card, i) => {
        const distance = Math.abs(card.offsetLeft - carousel.scrollLeft);
        if (distance < min) { min = distance; nearest = i; }
      });
      setActive(nearest);
    }, { passive: true });
  }

  /* ---- TESTIMONIALS SLIDER ---- */
  function initSlider() {
    const slider = document.getElementById('t-slider');
    const prev   = document.getElementById('t-prev');
    const next   = document.getElementById('t-next');
    const dots   = Array.from(document.querySelectorAll('#t-dots .testimonials__dot'));
    if (!slider || !prev || !next) return;

    const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
    let cur = 0;

    function visible() { return window.innerWidth >= 768 ? 2 : 1; }
    function maxIdx()  { return Math.max(0, cards.length - visible()); }
    function normalize(i) {
      const total = maxIdx() + 1;
      return total <= 1 ? 0 : ((i % total) + total) % total;
    }

    function goTo(i) {
      cur = normalize(i);
      const w = cards[0].offsetWidth + 24;
      slider.style.transition = 'transform .6s cubic-bezier(0.16,1,0.3,1)';
      slider.style.transform  = `translateX(${-(cur * w)}px)`;
      const hasMultipleViews = maxIdx() > 0;
      prev.disabled = !hasMultipleViews;
      next.disabled = !hasMultipleViews;
      dots.forEach((dot, index) => {
        const isActive = index === cur;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    prev.addEventListener('click', () => goTo(cur - 1));
    next.addEventListener('click', () => goTo(cur + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

    // Touch swipe
    let sx = 0;
    slider.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend',   e => {
      const diff = sx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) goTo(diff > 0 ? cur + 1 : cur - 1);
    });

    window.addEventListener('resize', () => {
      cur = Math.min(cur, maxIdx());
      goTo(cur);
    }, { passive: true });
    goTo(0);
  }

  /* ---- CONTACT FORM ---- */
  function initForm() {
    const form = document.getElementById('contact-form');
    const ok   = document.getElementById('form-ok');
    const err  = document.getElementById('form-err');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      btn.querySelector('.btn-text').textContent = 'Enviando…';

      const payload = {
        ...Object.fromEntries(new FormData(form).entries()),
        emailTo: form.dataset.emailTo || '',
        emailTemplate: form.dataset.emailTemplate || '',
        source: 'website-contact',
        submittedAt: new Date().toISOString()
      };
      form.dataset.lastPayload = JSON.stringify(payload);

      // Simulated submit. When the backend is ready, POST payload to the email endpoint.
      setTimeout(() => {
        ok.hidden  = false;
        err.hidden = true;
        form.reset();
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Enviar mensaje';
      }, 1100);
    });
  }

  /* ---- CARD GLOW follows mouse ---- */
  function initCardGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r   = card.getBoundingClientRect();
        const x   = ((e.clientX - r.left) / r.width) * 100;
        const y   = ((e.clientY - r.top)  / r.height) * 100;
        const g   = card.querySelector('.service-card__glow');
        if (g) { g.style.left = x + '%'; g.style.top = y + '%'; g.style.transform = 'translate(-50%,-50%)'; }
      });
    });
  }

  /* ---- TAG TOOLTIPS ---- */
  function initTagTooltips() {
    const tags = document.querySelectorAll('[data-tooltip]');
    if (!tags.length) return;
    const tooltip = document.createElement('div');
    tooltip.className = 'tag-tooltip';
    tooltip.id = 'tag-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);

    let activeTag = null;
    let pinned = false;

    function place(tag) {
      const margin = 12;
      const tagRect = tag.getBoundingClientRect();
      const tipRect = tooltip.getBoundingClientRect();
      const availableTop = tagRect.top;
      const top = availableTop > tipRect.height + margin * 2
        ? tagRect.top - tipRect.height - 10
        : tagRect.bottom + 10;
      const preferredLeft = tagRect.left + (tagRect.width / 2) - (tipRect.width / 2);
      const left = Math.min(
        Math.max(margin, preferredLeft),
        window.innerWidth - tipRect.width - margin
      );

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${Math.max(margin, top)}px`;
    }

    function open(tag, shouldPin) {
      activeTag = tag;
      pinned = Boolean(shouldPin);
      tooltip.textContent = tag.dataset.tooltip || '';
      tags.forEach(item => item.classList.toggle('is-tooltip-open', item === tag));
      tooltip.classList.add('visible');
      requestAnimationFrame(() => place(tag));
    }

    const closeAll = except => {
      if (except && pinned) return;
      activeTag = null;
      pinned = false;
      tooltip.classList.remove('visible');
      tags.forEach(tag => {
        if (tag !== except) tag.classList.remove('is-tooltip-open');
      });
    };

    tags.forEach(tag => {
      tag.setAttribute('tabindex', '0');
      tag.setAttribute('aria-describedby', 'tag-tooltip');
      tag.addEventListener('mouseenter', () => {
        if (!pinned) open(tag, false);
      });
      tag.addEventListener('mouseleave', () => {
        if (!pinned) closeAll();
      });
      tag.addEventListener('focus', () => {
        if (!pinned) open(tag, false);
      });
      tag.addEventListener('blur', () => {
        if (!pinned) closeAll();
      });
      tag.addEventListener('click', e => {
        e.stopPropagation();
        const willOpen = activeTag !== tag || !pinned;
        if (willOpen) open(tag, true);
        else closeAll();
      });
      tag.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tag.click();
        }
        if (e.key === 'Escape') closeAll();
      });
    });

    document.addEventListener('click', () => closeAll());
    window.addEventListener('scroll', () => closeAll(), { passive: true });
    window.addEventListener('resize', () => {
      if (activeTag) place(activeTag);
    }, { passive: true });
  }

  /* ---- MOBILE SCROLL STATES ---- */
  function initMobileScrollStates() {
    if (!window.matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
    const items = document.querySelectorAll('.service-card, .metric-item, .process-step, .case-card');
    if (!items.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-mobile-active', entry.isIntersecting);
      });
    }, {
      root: null,
      rootMargin: '-38% 0px -38% 0px',
      threshold: 0
    });

    items.forEach(item => io.observe(item));
  }

  /* ---- INIT ---- */
  function init() {
    initHeader();
    initMobileMenu();
    initCursor();
    initEurekaModal();
    initTeamCarousel();
    initSlider();
    initForm();
    initCardGlow();
    initTagTooltips();
    initMobileScrollStates();
    // Ensure all images get lazy loading
    document.querySelectorAll('img:not([loading])').forEach(img => img.setAttribute('loading', 'lazy'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
