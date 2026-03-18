/* ============================================================
   BENTE WESSELINK — Model Portfolio
   script.js
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   1. Navigation — scroll behaviour & hamburger menu
---------------------------------------------------------- */
(function initNav() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const allLinks   = navLinks.querySelectorAll('a');

  /* --- Scroll: add .is-scrolled when page leaves top --- */
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* --- Hamburger toggle --- */
  function openMenu() {
    hamburger.classList.add('is-open');
    navLinks.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* Close menu when a nav link is clicked */
  allLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close menu on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

/* ----------------------------------------------------------
   2. Scroll-triggered fade-in via IntersectionObserver
---------------------------------------------------------- */
(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once visible, no need to observe further
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,     // trigger when 12% of the element is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ----------------------------------------------------------
   3. Active nav link highlight on scroll
---------------------------------------------------------- */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          links.forEach(function (link) {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === '#' + id
            );
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px', // highlight when section crosses viewport centre
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();

/* ----------------------------------------------------------
   4. Contact form — Web3Forms submission
   Docs: https://web3forms.com/
   redirect=false is set via a hidden input so the page never
   navigates away; we handle the JSON response here instead.
---------------------------------------------------------- */
(function initContactForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const btn      = form ? form.querySelector('.form__submit') : null;

  if (!form || !feedback || !btn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = form.elements['name'].value.trim();
    const email   = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();

    /* --- Client-side validation --- */
    if (!name || !email || !message) {
      showFeedback('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    /* --- Submit to Web3Forms via fetch --- */
    btn.disabled = true;
    btn.querySelector('.form__submit-text').textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          handleSuccess();
        } else {
          // Web3Forms may return a human-readable message on failure
          handleError(data.message || null);
        }
      })
      .catch(function () { handleError(null); })
      .finally(function () {
        btn.disabled = false;
        btn.querySelector('.form__submit-text').textContent = 'Send Message';
      });

    function handleSuccess() {
      showFeedback('Thank you — your message has been sent!', 'success');
      form.reset();
    }

    function handleError(msg) {
      showFeedback(
        msg || 'Something went wrong. Please try again or reach out on Instagram.',
        'error'
      );
    }
  });

  function showFeedback(text, type) {
    feedback.textContent = text;
    feedback.className   = 'form__feedback is-' + type;
  }

  function isValidEmail(addr) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr);
  }
})();

/* ----------------------------------------------------------
   5. Portfolio — "Load more" (mobile only)
   Items 7–12 carry .portfolio__item--extra and are hidden via
   CSS on viewports ≤ 600 px. Tapping the button reveals them
   and immediately triggers their fade-in transition.
---------------------------------------------------------- */
(function initPortfolioLoadMore() {
  var btn    = document.getElementById('portfolio-load-more');
  var extras = document.querySelectorAll('.portfolio__item--extra');

  if (!btn || !extras.length) return;

  btn.addEventListener('click', function () {
    extras.forEach(function (item) {
      item.classList.add('is-revealed');
    });

    btn.classList.add('is-done'); // CSS hides it

    // Trigger fade-in on the newly visible items after a paint frame
    requestAnimationFrame(function () {
      extras.forEach(function (item) {
        item.classList.add('is-visible');
      });
    });
  });
})();

/* ----------------------------------------------------------
   6. Lightbox — complete rewrite
   Root cause of previous failure: .portfolio__hover is
   position:absolute inset:0 and intercepts all clicks before
   they reach the <img>. Fix: bind to .portfolio__img-wrap
   (the container) instead of the img directly.

   DOM is injected by this script. Styles via a <style> tag
   so media queries work (mobile hides arrow buttons).
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Inject styles ─────────────────────────────────────── */
  var lbStyle = document.createElement('style');
  lbStyle.textContent = [
    '#lb-overlay {',
    '  display:none; position:fixed; inset:0; z-index:9999;',
    '  background:rgba(0,0,0,0.92);',
    '  align-items:center; justify-content:center;',
    '  opacity:0; transition:opacity 200ms ease;',
    '}',
    '#lb-overlay.lb-open    { display:flex; }',
    '#lb-overlay.lb-visible { opacity:1; }',
    '#lb-img {',
    '  max-width:92vw; max-height:88vh;',
    '  width:auto; height:auto;',
    '  object-fit:contain; display:block;',
    '  transform:scale(0.96);',
    '  transition:transform 220ms ease-out;',
    '  pointer-events:none; border:none; outline:none;',
    '}',
    '#lb-overlay.lb-visible #lb-img { transform:scale(1); }',
    '#lb-close {',
    '  position:fixed; top:12px; right:12px;',
    '  width:44px; height:44px;',
    '  display:flex; align-items:center; justify-content:center;',
    '  background:none; border:none;',
    '  color:rgba(255,255,255,0.85); font-size:30px; line-height:1;',
    '  cursor:pointer; z-index:10000;',
    '  transition:color 120ms ease; padding:0;',
    '}',
    '#lb-close:hover { color:#fff; }',
    '#lb-prev, #lb-next {',
    '  position:fixed; top:50%; transform:translateY(-50%);',
    '  width:44px; height:44px;',
    '  display:flex; align-items:center; justify-content:center;',
    '  background:none; border:none;',
    '  color:rgba(255,255,255,0.6); font-size:44px; line-height:1;',
    '  cursor:pointer; z-index:10000;',
    '  transition:color 120ms ease; padding:0;',
    '}',
    '#lb-prev:hover, #lb-next:hover { color:#fff; }',
    '#lb-prev { left:4px; }',
    '#lb-next { right:4px; }',
    '@media (max-width:600px) { #lb-prev, #lb-next { display:none; } }',
    '.portfolio__img-wrap { cursor:pointer; }',
  ].join('\n');
  document.head.appendChild(lbStyle);

  /* ── Build DOM ──────────────────────────────────────────── */
  var overlay  = document.createElement('div');   overlay.id  = 'lb-overlay';
  var lbImg    = document.createElement('img');   lbImg.id    = 'lb-img'; lbImg.alt = '';
  var closeBtn = document.createElement('button'); closeBtn.id = 'lb-close';
  var prevBtn  = document.createElement('button'); prevBtn.id  = 'lb-prev';
  var nextBtn  = document.createElement('button'); nextBtn.id  = 'lb-next';

  closeBtn.innerHTML = '&times;';
  prevBtn.innerHTML  = '&#8249;';
  nextBtn.innerHTML  = '&#8250;';
  closeBtn.setAttribute('aria-label', 'Close');
  prevBtn.setAttribute('aria-label',  'Previous image');
  nextBtn.setAttribute('aria-label',  'Next image');

  overlay.appendChild(closeBtn);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(lbImg);
  document.body.appendChild(overlay);

  /* ── State ──────────────────────────────────────────────── */
  var currentIndex = 0;
  var isOpen = false;

  function getImages() {
    return Array.from(document.querySelectorAll('.portfolio__img-wrap img'));
  }

  /* ── Open / Close ───────────────────────────────────────── */
  function open(index) {
    var imgs = getImages();
    if (!imgs.length) return;
    currentIndex = ((index % imgs.length) + imgs.length) % imgs.length;
    lbImg.src = imgs[currentIndex].src;
    lbImg.style.transform = 'scale(0.96)'; /* reset before animation */
    overlay.classList.add('lb-open');
    /* Two rAFs: frame 1 triggers display:flex, frame 2 starts transitions */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('lb-visible');
      });
    });
    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function close() {
    overlay.classList.remove('lb-visible');
    document.body.style.overflow = '';
    isOpen = false;
    setTimeout(function () {
      overlay.classList.remove('lb-open');
      lbImg.src = '';
    }, 220);
  }

  function prev() { if (isOpen) open(currentIndex - 1); }
  function next() { if (isOpen) open(currentIndex + 1); }

  /* ── Bind click to each .portfolio__img-wrap ────────────────
     We bind to the WRAP not the <img> because .portfolio__hover
     is absolutely positioned on top of the img and intercepts
     pointer events, making e.target never the img itself.
  ────────────────────────────────────────────────────────── */
  function bindWraps() {
    document.querySelectorAll('.portfolio__img-wrap').forEach(function (wrap) {
      if (wrap.dataset.lbBound) return;
      wrap.dataset.lbBound = '1';
      wrap.addEventListener('click', function () {
        var imgs = getImages();
        var img  = wrap.querySelector('img');
        var idx  = imgs.indexOf(img);
        open(idx >= 0 ? idx : 0);
      });
    });
  }

  bindWraps();

  /* Re-bind after Load More reveals hidden wraps */
  var loadMoreBtn = document.getElementById('portfolio-load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bindWraps(); });
      });
    });
  }

  /* ── Controls ───────────────────────────────────────────── */
  closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
  prevBtn.addEventListener('click',  function (e) { e.stopPropagation(); prev();  });
  nextBtn.addEventListener('click',  function (e) { e.stopPropagation(); next();  });

  /* Click on dark backdrop closes */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  /* Keyboard */
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* ── Touch swipe (mobile) ───────────────────────────────── */
  var touchStartX = 0;
  var touchStartY = 0;

  overlay.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    /* Require horizontal swipe to dominate and exceed 50 px */
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 50) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

});

/* ----------------------------------------------------------
   7. Footer — dynamic year
---------------------------------------------------------- */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

/* ----------------------------------------------------------
   6. Hero nav colour inversion
   When the hero is in view, keep the nav text white so it
   reads against the dark overlay. Switch to dark text once
   the user scrolls past the hero.
---------------------------------------------------------- */
(function initHeroNavColor() {
  const hero = document.querySelector('.hero');
  const nav  = document.getElementById('nav');

  if (!hero || !nav) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          nav.classList.add('nav--over-hero');
        } else {
          nav.classList.remove('nav--over-hero');
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);
})();
