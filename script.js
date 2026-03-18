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
   6. Lightbox
   Opens any portfolio image full-screen. On mobile, swipe
   left/right navigates between images. Click outside or press
   Escape to close. No external libraries.
---------------------------------------------------------- */
(function initLightbox() {
  var lightbox  = document.getElementById('lightbox');
  var lb_img    = document.getElementById('lightbox-img');
  var lb_close  = document.getElementById('lightbox-close');
  var lb_prev   = document.getElementById('lightbox-prev');
  var lb_next   = document.getElementById('lightbox-next');

  if (!lightbox || !lb_img) return;

  /* Collect all portfolio images in DOM order (including extras) */
  function getImages() {
    return Array.from(document.querySelectorAll('.portfolio__img-wrap img'));
  }

  var currentIndex = 0;

  function open(index) {
    var imgs = getImages();
    if (!imgs.length) return;
    currentIndex = ((index % imgs.length) + imgs.length) % imgs.length;
    var target = imgs[currentIndex];
    lb_img.src = target.src;
    lb_img.alt = target.alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    /* Clear src after transition so old image doesn't flash on next open */
    setTimeout(function () { lb_img.src = ''; }, 320);
  }

  function prev() { open(currentIndex - 1); }
  function next() { open(currentIndex + 1); }

  /* ── Attach click listeners to portfolio images ── */
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.portfolio__img-wrap img');
    if (!img) return;
    var imgs = getImages();
    var idx  = imgs.indexOf(img);
    open(idx >= 0 ? idx : 0);
  });

  /* ── Controls ── */
  lb_close.addEventListener('click', close);
  lb_prev.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  lb_next.addEventListener('click', function (e) { e.stopPropagation(); next(); });

  /* Click outside image (on the dark backdrop) closes */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  /* Keyboard: Escape = close, arrows = navigate */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  /* ── Touch swipe (mobile) ── */
  var touchStartX = 0;
  var touchStartY = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    /* Only treat as horizontal swipe if dx dominates */
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });
})();

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
