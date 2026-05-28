/* ============================================================
   MEDIA LEADMON — ANIMATIONS
   IntersectionObserver for reveals (fast, no ScrollTrigger per-card).
   GSAP only for: counters, service reveal, parallax.
   ============================================================ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Lightweight IntersectionObserver reveal
     Handles ALL .reveal elements — much faster than per-card GSAP triggers
  ------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduced) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target); // fire once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* -------------------------------------------------------
     Hero canvas — lighter: no line connections on mobile
  ------------------------------------------------------- */
  function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || reduced) return;

    const ctx   = canvas.getContext('2d');
    const isMob = window.innerWidth < 768;
    if (isMob) return;

    const N     = 38;
    const CLR   = 'rgba(253,237,12,';
    let w, h, pts = [], raf;

    function resize() {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function spawn() {
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.3 + .3, a: Math.random() * .4 + .1,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = CLR + p.a + ')';
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = CLR + ((1 - d/100) * .1) + ')';
            ctx.lineWidth   = .5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) draw(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }).observe(canvas.parentElement || canvas);

    window.addEventListener('resize', () => { resize(); spawn(); }, { passive: true });
    resize(); spawn(); draw();
  }

  /* -------------------------------------------------------
     Service cards — horizontal stagger reveal (GSAP)
     Odd-index cards sweep from left, even from right
  ------------------------------------------------------- */
  function initHorizontalCards() {
    if (typeof gsap === 'undefined') return;
    const section = document.querySelector('.services__grid');
    if (!section || reduced) return;

    const cards = section.querySelectorAll('.service-card');
    // Remove CSS reveal so GSAP owns the animation
    cards.forEach(c => c.classList.remove('reveal'));
    gsap.set(cards, { opacity: 0 });

    let fired = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) {
        fired = true;
        cards.forEach((card, i) => {
          const fromX = i % 2 === 0 ? -80 : 80;
          gsap.fromTo(card,
            { x: fromX, y: 40, opacity: 0 },
            { x: 0, y: 0, opacity: 1, duration: .75, delay: i * .09,
              ease: 'power3.out', clearProps: 'transform,opacity' }
          );
        });
      }
    }, { threshold: 0.1 }).observe(section);
  }

  /* -------------------------------------------------------
     Scroll-to-top button — show after 400px
  ------------------------------------------------------- */
  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 420);
    }, { passive: true });

    btn.addEventListener('click', () => {
      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(0, { duration: 1.1 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* -------------------------------------------------------
     Metric counters — GSAP on IntersectionObserver trigger
  ------------------------------------------------------- */
  function initCounters() {
    document.querySelectorAll('.metric-num').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      let done = false;

      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !done) {
          done = true;
          if (reduced || typeof gsap === 'undefined') { el.textContent = target.toFixed(decimals); return; }
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = obj.val.toFixed(decimals); },
          });
        }
      }, { threshold: 0.5 }).observe(el);
    });
  }

  /* -------------------------------------------------------
     Subtle parallax on hero gradient — GSAP scrub
  ------------------------------------------------------- */
  function initParallax() {
    if (reduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.to('.hero__gradient', {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
    });
  }

  /* -------------------------------------------------------
     Active nav link on scroll
  ------------------------------------------------------- */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav__link, .mobile-menu__link');

    function update() {
      let current = sections[0] ? sections[0].id : '';
      const marker = window.scrollY + window.innerHeight * 0.38;
      const pageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

      sections.forEach(s => {
        if (marker >= s.offsetTop) current = s.id;
      });
      if (pageEnd && sections.length) current = sections[sections.length - 1].id;

      links.forEach(l => {
        const isActive = l.getAttribute('href') === '#' + current;
        l.classList.toggle('active', isActive);
        if (isActive) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* -------------------------------------------------------
     INIT
  ------------------------------------------------------- */
  function run() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initReveal();
    initHorizontalCards();
    initScrollTop();
    initCanvas();
    initCounters();
    initParallax();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
