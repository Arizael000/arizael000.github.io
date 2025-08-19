document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const navlinks = document.querySelectorAll('.navlink[data-section]');

  // Logo → scroll top
  logo?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Navegación por secciones
  navlinks.forEach(link => {
    const section = link.getAttribute('data-section');

    link.addEventListener('click', (e) => {
      if (section === 'tools') {
        e.preventDefault();
        window.open('tools.html', '_blank');
      } else if (section === 'contact') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        const target = document.getElementById(section);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});

