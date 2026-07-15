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

  // Scroll Spy — progressive underline based on scroll progress
  const watchedLinks = document.querySelectorAll('.navlink[data-watch]');
  if (watchedLinks.length === 0) return;

  const sectionMap = new Map();

  watchedLinks.forEach(link => {
    const ids = link.getAttribute('data-watch').split(',');
    ids.forEach(id => {
      id = id.trim();
      if (!id) return;
      if (!sectionMap.has(id)) sectionMap.set(id, []);
      sectionMap.get(id).push(link);
    });
  });

  const sectionOrder = [...new Set(sectionMap.keys())];

  function getSectionBounds(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY
    };
  }

  function setActive(sectionId, progress) {
    watchedLinks.forEach(link => {
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
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Bottom of page → last section, progress 1
    const lastId = sectionOrder[sectionOrder.length - 1];
    if (scrollY + viewportH >= docHeight - 1 && document.getElementById(lastId)) {
      setActive(lastId, 1);
      return;
    }

    // Find containing section and calculate progress
    for (let i = 0; i < sectionOrder.length; i++) {
      const bounds = getSectionBounds(sectionOrder[i]);
      if (!bounds) continue;

      if (scrollY >= bounds.top && scrollY < bounds.bottom) {
        const progress = (scrollY - bounds.top) / (bounds.bottom - bounds.top);
        setActive(sectionOrder[i], Math.min(1, Math.max(0, progress)));
        return;
      }
    }

    // Between sections — find nearest (only if at least one section exists)
    let nearest = null;
    let nearestProgress = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < sectionOrder.length; i++) {
      const bounds = getSectionBounds(sectionOrder[i]);
      if (!bounds) continue;

      const dTop = Math.abs(scrollY - bounds.top);
      const dBot = Math.abs(scrollY - bounds.bottom);
      const dist = Math.min(dTop, dBot);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = sectionOrder[i];
        nearestProgress = dTop < dBot ? 0 : 1;
      }
    }

    if (nearest) setActive(nearest, nearestProgress);
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

  // Initial state
  updateActiveSection();

  // Re-check after full page load (handles hash navigation)
  window.addEventListener('load', updateActiveSection);
});
