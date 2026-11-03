document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const navlinks = document.querySelectorAll('.navlink[data-section]');

  // Logo → scroll top
  logo?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Section navigation via data-section attribute
  navlinks.forEach(link => {
    const section = link.getAttribute('data-section');

    link.addEventListener('click', (e) => {
        e.preventDefault();
      if (section === 'contact' || section === 'learningpath') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        const target = document.getElementById(section);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Section not on this page → navigate to index.html#section
          window.location.href = './#' + section;
        }
      }
    });
  });

  if (window.location.pathname.toLowerCase().endsWith('reportedocumental.html')) return;

  // Scroll spy follows the section with the largest visible area.
  const watchedLinks = document.querySelectorAll('.navlink[data-watch]');
  if (watchedLinks.length === 0) return;

  const sectionMap = new Map();

  watchedLinks.forEach(link => {
    const ids = link.getAttribute('data-watch').split(',');
    ids.forEach(id => {
      id = id.trim();
      if (!id || !document.getElementById(id)) return;
      if (!sectionMap.has(id)) sectionMap.set(id, []);
      sectionMap.get(id).push(link);
    });
  });

  const sectionOrder = [...new Set(sectionMap.keys())];
  const observedLinks = new Set([...sectionMap.values()].flat());
  if (sectionOrder.length === 0) return;

  function getSectionVisibleArea(id, viewportTop, viewportBottom, viewportWidth) {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      area: Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)) *
        Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)),
      centerDistance: Math.abs((rect.top + rect.bottom) / 2 - (viewportTop + viewportBottom) / 2),
      top: rect.top,
      bottom: rect.bottom
    };
  }

  function setActive(sectionId, progress) {
    observedLinks.forEach(link => {
      link.classList.remove('active');
      link.style.removeProperty('--underline-progress');
    });
    if (sectionId && sectionMap.has(sectionId)) {
      sectionMap.get(sectionId).forEach(link => {
        link.classList.add('active');
        link.style.setProperty('--underline-progress', progress);
      });
    }
  }

  function updateActiveSection() {
    const header = document.querySelector('header');
    const viewportTop = header ? header.getBoundingClientRect().bottom : 0;
    const viewportBottom = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const pageBottom = document.documentElement.scrollHeight;
    if (window.scrollY + viewportBottom >= pageBottom - 1) {
      setActive(null, 0);
      return;
    }

    let activeSection = null;
    let largestVisibleArea = 0;
    let activeCenterDistance = Infinity;
    let nearestSection = null;
    let nearestDistance = Infinity;

    sectionOrder.forEach(sectionId => {
      const bounds = getSectionVisibleArea(sectionId, viewportTop, viewportBottom, viewportWidth);
      if (!bounds) return;

      if (bounds.area > largestVisibleArea ||
          (bounds.area === largestVisibleArea && bounds.area > 0 && bounds.centerDistance < activeCenterDistance)) {
        activeSection = sectionId;
        largestVisibleArea = bounds.area;
        activeCenterDistance = bounds.centerDistance;
      }

      const distance = bounds.bottom < viewportTop
        ? viewportTop - bounds.bottom
        : bounds.top > viewportBottom
          ? bounds.top - viewportBottom
          : 0;
      if (distance < nearestDistance || !nearestSection) {
        nearestSection = sectionId;
        nearestDistance = distance;
      }
    });

    const footer = document.querySelector('footer');
    if (footer) {
      const rect = footer.getBoundingClientRect();
      const footerVisibleArea =
        Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)) *
        Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
      if (footerVisibleArea > largestVisibleArea) {
        setActive(null, 0);
        return;
      }
    }

    setActive(activeSection || nearestSection, 1);
  }

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  });
  window.addEventListener('resize', updateActiveSection);

  // Initial state
  updateActiveSection();

  // Re-check after full page load (handles hash navigation)
  window.addEventListener('load', updateActiveSection);
});
