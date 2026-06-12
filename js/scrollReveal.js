/**
 * scrollReveal.js
 * Fade-in elements as they scroll into view using IntersectionObserver.
 * Elements with class "reveal" or "reveal-item" are animated.
 */

(function () {
  'use strict';

  const REVEAL_CLASS = 'is-visible';

  const defaultOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  };

  function revealOnScroll(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add(REVEAL_CLASS);
        observer.unobserve(entry.target); // animate once only
      }
    });
  }

  function init() {
    const observer = new IntersectionObserver(revealOnScroll, defaultOptions);

    // Sections reveal
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });

    // Individual items (staggered via CSS nth-child or custom delay)
    const itemObserver = new IntersectionObserver(revealOnScroll, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-item').forEach(function (el, i) {
      // stagger delay via inline style
      el.style.transitionDelay = (i * 0.08) + 's';
      itemObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
