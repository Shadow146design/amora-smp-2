// =========================================================
// AMORA SMP 2 — script.js
// Menu mobile, reveal au scroll, accordéon FAQ, navbar au scroll
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar: fond opaque au scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Ferme le menu quand on clique un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Ferme le menu avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    // Ferme le menu en cliquant en dehors
    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback : tout afficher directement
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Accordéon FAQ ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Ferme les autres questions ouvertes
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Recalcule la hauteur FAQ si la fenêtre change de taille ---------- */
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq-item.open .faq-a').forEach(a => {
      a.style.maxHeight = a.scrollHeight + 'px';
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Filtres de catégories + recherche (Armes & Objets) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const itemCards = document.querySelectorAll('.item-card');
  const itemsSearch = document.getElementById('itemsSearch');
  const itemsEmpty = document.getElementById('itemsEmpty');

  let activeFilter = 'all';

  const applyItemFilters = () => {
    const query = itemsSearch ? itemsSearch.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    itemCards.forEach(card => {
      const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
      const text = (card.querySelector('h3')?.textContent + ' ' + card.querySelector('.item-desc')?.textContent).toLowerCase();
      const searchMatch = query === '' || text.includes(query);
      const match = categoryMatch && searchMatch;

      if (match) {
        visibleCount++;
        card.classList.remove('is-gone');
        // force reflow avant de retirer is-hidden pour que la transition joue
        requestAnimationFrame(() => card.classList.remove('is-hidden'));
      } else {
        card.classList.add('is-hidden');
        window.setTimeout(() => {
          if (card.classList.contains('is-hidden')) card.classList.add('is-gone');
        }, 260);
      }
    });

    if (itemsEmpty) itemsEmpty.classList.toggle('is-hidden', visibleCount !== 0);
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyItemFilters();
    });
  });

  if (itemsSearch) {
    itemsSearch.addEventListener('input', applyItemFilters);
  }

  /* ---------- Compteurs animés (bandeau stats) ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      if (prefersReducedMotion) { el.textContent = target; return; }
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const statIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      statNums.forEach(el => statIo.observe(el));
    } else {
      statNums.forEach(animateCount);
    }
  }

  /* ---------- Copier le lien Discord ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const txtEl = btn.querySelector('.txt');
      const original = txtEl ? txtEl.textContent : null;

      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // Fallback pour navigateurs / contextes sans Clipboard API
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); } catch (err) { /* silencieux */ }
        document.body.removeChild(tmp);
      }

      btn.classList.add('copied');
      if (txtEl) txtEl.textContent = 'Lien copié !';
      window.setTimeout(() => {
        btn.classList.remove('copied');
        if (txtEl && original) txtEl.textContent = original;
      }, 2000);
    });
  });

  /* ---------- Bouton retour en haut ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Particules flottantes du hero (canvas léger) ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let particles = [];
    let w, h, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const count = Math.min(50, Math.round((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.4 + 0.15,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.15
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.fillStyle = `rgba(94, 230, 111, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      });
      requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    requestAnimationFrame(draw);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); initParticles(); }, 200);
    });
  }

});
