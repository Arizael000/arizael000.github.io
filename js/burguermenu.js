document.addEventListener("DOMContentLoaded", function () {
  const menu1 = document.querySelector(".menu1");
  const menu2 = document.querySelector(".menu2");
  const menu3 = document.querySelector(".menu3");
  const menu4 = document.querySelector(".menu4");
  const eventWrapper = document.querySelector(".event-wrapper");
  const eventWrapperInp = document.querySelector(".event-wrapper-inp");
  const navLinks = document.getElementById("navLINKS");
  const cvLink = document.getElementById("cv");

  // Contact me → scroll al footer
  menu1.addEventListener("click", function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    closeAllMenus();
  });

  // Tools → navega a tools.html
  menu2.addEventListener("click", function () {
    window.location.href = 'tools.html';
  });

  // Learning Path → navega a learningpath.html
  menu3.addEventListener("click", function () {
    window.location.href = 'learningpath.html';
  });

  // Download CV → descarga el CV
  menu4.addEventListener("click", function () {
    if (cvLink) {
      cvLink.click();
    }
    closeAllMenus();
  });

  // Cierra ambos menús
  function closeAllMenus() {
    if (eventWrapperInp && !eventWrapperInp.checked) {
      eventWrapperInp.checked = true;
    }
    if (navLinks) {
      navLinks.classList.remove("open");
    }
  }

  // Toggle menú principal al cambiar estado del checkbox hamburguesa
  if (eventWrapperInp && navLinks) {
    eventWrapperInp.addEventListener("change", function () {
      if (this.checked) {
        navLinks.classList.remove("open");
      } else {
        navLinks.classList.add("open");
      }
    });
  }

  // Cerrar menú principal al hacer clic en un enlace
  if (navLinks) {
    navLinks.querySelectorAll(".navlink").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        if (eventWrapperInp) eventWrapperInp.checked = true;
      });
    });
  }

  // Cerrar menús al hacer clic fuera
  document.addEventListener("click", function (e) {
    const isClickInsideHamburger = eventWrapper && eventWrapper.contains(e.target);
    const isClickInsideNavLinks = navLinks && navLinks.contains(e.target);
    const isClickOnHamburgerCheckbox = eventWrapperInp && eventWrapperInp === e.target;

    if (!isClickInsideHamburger && !isClickInsideNavLinks && !isClickOnHamburgerCheckbox) {
      closeAllMenus();
    }
  });
});
