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
   6. Footer — dynamic year
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
