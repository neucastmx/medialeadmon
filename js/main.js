/* ============================================================
   MEDIA LEADMON — MAIN
   Nav, cursor, testimonials slider, form, card glow
   ============================================================ */
(function () {
  'use strict';

  let scrollLockCount = 0;

  function lockPageScroll() {
    scrollLockCount += 1;
    if (scrollLockCount > 1) return;

    document.documentElement.classList.add('modal-lock');
    document.body.classList.add('modal-lock');
  }

  function unlockPageScroll() {
    if (!scrollLockCount) return;
    scrollLockCount -= 1;
    if (scrollLockCount > 0) return;

    document.documentElement.classList.remove('modal-lock');
    document.body.classList.remove('modal-lock');
  }

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
      menu.setAttribute('aria-hidden', 'false');
      menu.removeAttribute('inert');
      lockPageScroll();
    }
    function shut() {
      if (document.activeElement && menu.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      unlockPageScroll();
      menu.offsetHeight;
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
    }

    toggle.addEventListener('click', () => menu.classList.contains('open') ? shut() : open());
    if (close) close.addEventListener('click', shut);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

    // Close when any mobile link is clicked
    menu.querySelectorAll('.mobile-menu__link, .mobile-menu__phone').forEach(el => {
      el.addEventListener('click', e => {
        if (!el.classList.contains('mobile-menu__link')) {
          shut();
          return;
        }

        const id = el.getAttribute('href');
        const target = id ? document.querySelector(id) : null;
        e.preventDefault();
        shut();
        if (target) window.setTimeout(() => window.mlScrollToTarget ? window.mlScrollToTarget(target) : target.scrollIntoView({ behavior: 'smooth' }), 0);
      });
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
    let modalTimer = 0;

    function open() {
      window.clearTimeout(modalTimer);
      if (modal.classList.contains('open')) return;
      modal.setAttribute('aria-hidden', 'false');
      modal.removeAttribute('inert');
      const needsMount = !modal.classList.contains('is-mounted');
      modal.classList.add('is-mounted');
      if (needsMount) lockPageScroll();
      modal.offsetHeight;
      modal.classList.add('open');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function shut() {
      window.clearTimeout(modalTimer);
      if (!modal.classList.contains('is-mounted')) return;
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove('open');
      modalTimer = window.setTimeout(() => {
        modal.classList.remove('is-mounted');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', '');
        unlockPageScroll();
      }, 460);
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
    const prefersDialog = window.matchMedia('(hover: none), (pointer: coarse)');
    const tooltip = document.createElement('div');
    tooltip.className = 'tag-tooltip';
    tooltip.id = 'tag-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);

    const dialog = document.createElement('div');
    dialog.className = 'tag-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.setAttribute('inert', '');
    dialog.innerHTML = `
      <div class="tag-dialog__backdrop" data-tag-close></div>
      <div class="tag-dialog__panel" role="document">
        <button class="tag-dialog__close" type="button" aria-label="Cerrar informacion" data-tag-close>&times;</button>
        <p class="tag-dialog__eyebrow">Detalle</p>
        <h3 class="tag-dialog__title"></h3>
        <p class="tag-dialog__text"></p>
      </div>
    `;
    document.body.appendChild(dialog);
    const dialogTitle = dialog.querySelector('.tag-dialog__title');
    const dialogText = dialog.querySelector('.tag-dialog__text');
    const dialogClose = dialog.querySelector('.tag-dialog__close');

    let activeTag = null;
    let pinned = false;
    let dialogOpen = false;
    let dialogTimer = 0;

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
      tooltip.innerHTML = `
        <p class="tag-tooltip__eyebrow">Detalle</p>
        <h3 class="tag-tooltip__title"></h3>
        <p class="tag-tooltip__text"></p>
      `;
      tooltip.querySelector('.tag-tooltip__title').textContent = tag.textContent || '';
      tooltip.querySelector('.tag-tooltip__text').textContent = tag.dataset.tooltip || '';
      tags.forEach(item => item.classList.toggle('is-tooltip-open', item === tag));
      tooltip.classList.add('visible');
      requestAnimationFrame(() => place(tag));
    }

    function openDialog(tag) {
      activeTag = tag;
      dialogOpen = true;
      pinned = false;
      tooltip.classList.remove('visible');
      tags.forEach(item => item.classList.toggle('is-tooltip-open', item === tag));
      dialogTitle.textContent = tag.textContent || '';
      dialogText.textContent = tag.dataset.tooltip || '';
      dialog.setAttribute('aria-hidden', 'false');
      dialog.removeAttribute('inert');
      window.clearTimeout(dialogTimer);
      const needsMount = !dialog.classList.contains('is-mounted');
      dialog.classList.add('is-mounted');
      if (needsMount) lockPageScroll();
      dialog.offsetHeight;
      dialog.classList.add('visible');
      if (dialogClose) dialogClose.focus({ preventScroll: true });
    }

    function closeDialog() {
      if (!dialogOpen) return;
      window.clearTimeout(dialogTimer);
      dialogOpen = false;
      activeTag = null;
      if (document.activeElement && dialog.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      dialog.classList.remove('visible');
      dialogTimer = window.setTimeout(() => {
        dialog.classList.remove('is-mounted');
        dialog.setAttribute('aria-hidden', 'true');
        dialog.setAttribute('inert', '');
        tags.forEach(tag => tag.classList.remove('is-tooltip-open'));
        unlockPageScroll();
      }, 360);
    }

    const closeAll = except => {
      closeDialog();
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
      tag.setAttribute('role', 'button');
      tag.setAttribute('aria-label', `${tag.textContent}: ${tag.dataset.tooltip || ''}`);
      tag.addEventListener('mouseenter', () => {
        if (!prefersDialog.matches && !pinned) open(tag, false);
      });
      tag.addEventListener('mouseover', () => {
        if (!prefersDialog.matches && !pinned && activeTag !== tag) open(tag, false);
      });
      tag.addEventListener('mouseleave', () => {
        if (!prefersDialog.matches && !pinned) closeAll();
      });
      tag.addEventListener('focus', () => {
        if (!prefersDialog.matches && !pinned) open(tag, false);
      });
      tag.addEventListener('blur', () => {
        if (!prefersDialog.matches && !pinned) closeAll();
      });
      tag.addEventListener('click', e => {
        e.stopPropagation();
        if (prefersDialog.matches) {
          openDialog(tag);
          return;
        }
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

    dialog.querySelectorAll('[data-tag-close]').forEach(el => el.addEventListener('click', closeDialog));
    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
    });
    window.addEventListener('scroll', () => {
      if (!dialogOpen) closeAll();
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (activeTag) place(activeTag);
    }, { passive: true });
  }

  /* ---- CASE GALLERY ---- */
  function initCaseGallery() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;

    const GALLERIES = {
      'ds-publicidad': {
        brand:    'DS Publicidad',
        campaign: 'Paid Media Integral',
        desc:     'Estrategia de paid media integral que multiplicó el retorno sobre inversión publicitaria.',
        images: [
          'assets/images/cases/ds-publicidad/img-1.jpg',
          'assets/images/cases/ds-publicidad/img-2.jpg',
          'assets/images/cases/ds-publicidad/img-3.jpg',
          'assets/images/cases/ds-publicidad/img-4.jpg',
          'assets/images/cases/ds-publicidad/img-5.jpg',
          'assets/images/cases/ds-publicidad/img-6.jpg',
        ]
      },
      'telcel': {
        brand:    'Telcel Up',
        campaign: 'Connected TV',
        desc:     'Campaña de Connected TV con viewability del 100% y segmentación premium.',
        images: [
          'assets/images/cases/telcel/img-1.jpg',
          'assets/images/cases/telcel/img-2.jpg',
          'assets/images/cases/telcel/img-3.jpg',
          'assets/images/cases/telcel/img-4.jpg',
          'assets/images/cases/telcel/img-5.jpg',
          'assets/images/cases/telcel/img-6.jpg',
        ]
      },
      'gobierno-cdmx': {
        brand:    'Gobierno CDMX',
        campaign: 'Branding Institucional',
        desc:     'Campaña de comunicación institucional con alcance masivo y mensajes de alto impacto.',
        images: [
          'assets/images/cases/gobierno-cdmx/img-1.jpg',
        ]
      }
    };

    const imgEl      = modal.querySelector('.gallery-modal__img');
    const counterEl  = modal.querySelector('.gallery-modal__counter');
    const eyebrowEl  = modal.querySelector('.gallery-modal__eyebrow');
    const campaignEl = modal.querySelector('.gallery-modal__campaign');
    const descEl     = modal.querySelector('.gallery-modal__desc');
    const prevBtn    = modal.querySelector('.gallery-modal__nav--prev');
    const nextBtn    = modal.querySelector('.gallery-modal__nav--next');
    const dotsBar    = modal.querySelector('.gallery-modal__dots-bar');

    let current = 0;
    let gallery = null;
    let closeTimer = 0;
    let touchStartX = 0;

    function buildDots(count) {
      dotsBar.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const d = document.createElement('span');
        d.className = 'gallery-modal__dot' + (i === 0 ? ' active' : '');
        dotsBar.appendChild(d);
      }
    }

    function syncDots(idx) {
      dotsBar.querySelectorAll('.gallery-modal__dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });
    }

    function updateSlide(idx, instant) {
      const len = gallery.images.length;
      current = ((idx % len) + len) % len;
      counterEl.textContent = `${current + 1} / ${len}`;
      syncDots(current);

      const newSrc = gallery.images[current];
      const newAlt = `${gallery.brand} — imagen ${current + 1}`;

      if (instant) {
        imgEl.src = newSrc;
        imgEl.alt = newAlt;
        return;
      }

      // Fade out → preload → swap src → fade in
      // Prevents old image bleeding through while new one loads
      imgEl.classList.add('is-switching');
      window.setTimeout(() => {
        const pre = new window.Image();
        pre.onload = pre.onerror = () => {
          imgEl.src = newSrc;
          imgEl.alt = newAlt;
          requestAnimationFrame(() => imgEl.classList.remove('is-switching'));
        };
        pre.src = newSrc;
      }, 180);
    }

    function openGallery(galleryId) {
      gallery = GALLERIES[galleryId];
      if (!gallery) return;

      // Populate footer info
      eyebrowEl.textContent  = gallery.brand;
      campaignEl.textContent = gallery.campaign;
      descEl.textContent     = gallery.desc;

      // Build dots and show/hide nav based on image count
      const single = gallery.images.length <= 1;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
      buildDots(gallery.images.length);

      // Load first image immediately
      updateSlide(0, true);

      // Open modal
      window.clearTimeout(closeTimer);
      modal.setAttribute('aria-hidden', 'false');
      modal.removeAttribute('inert');
      modal.classList.add('is-mounted');
      lockPageScroll();
      modal.offsetHeight;
      modal.classList.add('open');
      modal.querySelector('.gallery-modal__close').focus({ preventScroll: true });
    }

    function closeGallery() {
      window.clearTimeout(closeTimer);
      if (!modal.classList.contains('is-mounted')) return;
      if (document.activeElement && modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove('open');
      closeTimer = window.setTimeout(() => {
        modal.classList.remove('is-mounted');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', '');
        gallery = null;
        imgEl.src = '';
        unlockPageScroll();
      }, 460);
    }

    // Open triggers
    document.querySelectorAll('[data-gallery]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openGallery(btn.dataset.gallery);
      });
    });

    // Close triggers
    modal.querySelectorAll('[data-gallery-close]').forEach(el => {
      el.addEventListener('click', closeGallery);
    });

    // Nav
    prevBtn.addEventListener('click', () => gallery && updateSlide(current - 1));
    nextBtn.addEventListener('click', () => gallery && updateSlide(current + 1));

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape')      closeGallery();
      if (e.key === 'ArrowLeft')   gallery && updateSlide(current - 1);
      if (e.key === 'ArrowRight')  gallery && updateSlide(current + 1);
    });

    // Touch swipe on viewer
    const viewer = modal.querySelector('.gallery-modal__viewer');
    viewer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', e => {
      if (!gallery) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) updateSlide(diff > 0 ? current + 1 : current - 1);
    });
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
    initCaseGallery();
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
