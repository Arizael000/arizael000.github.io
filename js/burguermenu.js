document.addEventListener("DOMContentLoaded", function () {
  const menu1 = document.querySelector(".menu1");
  const menu2 = document.querySelector(".menu2");
  const menu3 = document.querySelector(".menu3");
  const menu4 = document.querySelector(".menu4");
  const menu5 = document.querySelector(".menu5");
  const eventWrapper = document.querySelector(".event-wrapper");
  const eventWrapperInp = document.querySelector(".event-wrapper-inp");
  const cvLink = document.getElementById("cv");

  // ── Overlay for hamburger menu ──
  const overlay = document.createElement("div");
  overlay.className = "hamburger-overlay";
  document.body.appendChild(overlay);

  function toggleOverlay(open) {
    overlay.classList.toggle("active", open);
  }

  // Watch checkbox changes to toggle overlay
  if (eventWrapperInp) {
    eventWrapperInp.addEventListener("change", function () {
      toggleOverlay(!this.checked);
    });
  }

  // Click overlay closes menu
  overlay.addEventListener("click", function () {
    closeAllMenus();
  });

  // Contact me → scroll al footer
  menu1.addEventListener("click", function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    closeAllMenus();
  });

  // Projects → scroll a projects section
  menu2.addEventListener("click", function () {
    var target = document.getElementById('projects');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    closeAllMenus();
  });

  // Tools → scroll a tools section
  menu3.addEventListener("click", function () {
    var target = document.getElementById('tools');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    closeAllMenus();
  });

  // Learning Path → navega a learningpath.html
  menu4.addEventListener("click", function () {
    window.location.href = 'learningpath.html';
  });

  // Download CV → descarga el CV
  if (menu5) {
    menu5.addEventListener("click", function () {
      if (cvLink) cvLink.click();
      closeAllMenus();
    });
  }

  // Also handle #cv-mobile if present
  var cvMobile = document.getElementById('cv-mobile');
  if (cvMobile && cvMobile !== menu5) {
    cvMobile.addEventListener("click", function () {
      if (cvLink) cvLink.click();
      closeAllMenus();
    });
  }

  // Dark mode toggle in hamburger menu
  var menuDark = document.querySelector('.menu-darkmode');
  if (menuDark) {
    menuDark.addEventListener("click", function () {
      var dn = document.getElementById('dn');
      if (dn) {
        dn.checked = !dn.checked;
        dn.dispatchEvent(new Event('change'));
      }
      closeAllMenus();
    });
  }

  // Close menu
  function closeAllMenus() {
    if (eventWrapperInp && !eventWrapperInp.checked) {
      eventWrapperInp.checked = true;
    }
    toggleOverlay(false);
  }

  // Close menus when clicking outside
  document.addEventListener("click", function (e) {
    const isClickInsideHamburger = eventWrapper && eventWrapper.contains(e.target);
    if (!isClickInsideHamburger) {
      closeAllMenus();
    }
  });

  // ── Dynamic hamburger: muestra/oculta según espacio disponible ──
  var totalNavWidth = 0;
  var resizeTimer;

  function measureNavWidth() {
    var links = document.querySelectorAll('#navLINKS > .navlink');
    if (links.length === 0) return;
    var total = 0;
    links.forEach(function (link) {
      total += link.offsetWidth;
    });
    total += 4 * (links.length - 1);
    totalNavWidth = total;
  }

  function getAvailableWidth() {
    var headerInner = document.querySelector('.header-inner');
    var headerLeft = document.querySelector('.header-left');
    var headerRight = document.querySelector('.header-right');
    if (!headerInner || !headerLeft || !headerRight) return 0;

    var padLeft = parseFloat(window.getComputedStyle(headerInner).paddingLeft) || 24;
    var padRight = parseFloat(window.getComputedStyle(headerInner).paddingRight) || 24;

    var rightWidth = headerRight.offsetWidth;

    // En modo hamburguesa headerRight incluye el botón hamburguesa.
    // Lo restamos porque ese espacio se libera al volver a modo desktop.
    if (document.body.classList.contains('hamburger-mode')) {
      var hamburger = document.querySelector('.event-wrapper');
      if (hamburger) {
        rightWidth -= hamburger.offsetWidth;
      }
    }

    // 2 gaps de 1rem entre los 3 hijos flex (left, nav, right)
    return headerInner.clientWidth - headerLeft.offsetWidth - rightWidth - padLeft - padRight - 32;
  }

  function checkNavOverflow() {
    var navDesktop = document.querySelector('.nav-desktop');
    var navLinks = document.getElementById('navLINKS');

    if (document.body.classList.contains('hamburger-mode')) {
      if (totalNavWidth === 0 || !navDesktop || !navLinks) return;

      var available = getAvailableWidth();

      if (totalNavWidth <= available) {
        document.body.classList.remove('hamburger-mode');
      }
    } else {
      if (!navDesktop || !navLinks) return;

      measureNavWidth();

      if (totalNavWidth > navDesktop.clientWidth) {
        document.body.classList.add('hamburger-mode');
      }
    }
  }

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkNavOverflow, 150);
  });

  checkNavOverflow();
});
