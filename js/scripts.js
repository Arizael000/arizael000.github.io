// Eliminar .html de la URL en la barra del navegador (funciona local y GitHub Pages)
(function () {
  var path = window.location.pathname;
  if (path.endsWith('.html')) {
    // index.html → '/', cualquier otra → quitar solo '.html'
    var cleanPath = path.endsWith('index.html')
      ? path.slice(0, -10) || '/'   // /index.html → / 
      : path.slice(0, -5);          // /tools.html → /tools
    history.replaceState(null, '', cleanPath);
  }
})();

// Scroll to a specific section
function scrollToSection(id) {
  var section = document.getElementById(id);
  section.style.display = 'block';

  // Calculate section position relative to viewport
  var offsetTop = section.offsetTop;

  // Scroll to section position
  window.scrollTo({
    top: offsetTop,
    behavior: 'smooth'
  });
}
// Funciones para abrir y cerrar el modal
function openModal() {
  document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}

// Close modal if clicked outside
window.onclick = function (event) {
  var modal = document.getElementById('myModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('form');

  form.addEventListener('submit', function (event) {
    closeModal();
  })
});


document.addEventListener('DOMContentLoaded', function () {
  // Get all input elements inside the gallery class
  var inputs = document.querySelectorAll('.galleryInputs');

  // Agrega un evento change a cada input
  inputs.forEach(function (input) {
    input.addEventListener('change', function () {
      // Oculta todos los elementos con la clase description
      document.querySelectorAll('.description').forEach(function (description) {
        description.style.display = 'none';
      });

      // Muestra el elemento p correspondiente al input seleccionado
      var description = this.parentElement.querySelector('.description');
      if (description) {
        description.style.display = 'block';
      }
    });
  });
});
// Simulate typing effect
function teclearTexto(elemento) {
  const textoCompleto = elemento.innerText;
  elemento.innerHTML = ""; // Limpiar el contenido original

  let i = 0;
  const intervalo = setInterval(() => {
    elemento.innerHTML += textoCompleto.charAt(i);
    i++;
    if (i > textoCompleto.length) {
      clearInterval(intervalo);
    }
  }, 100); // Adjust typing speed
}

document.addEventListener('DOMContentLoaded', function () {
  const elementosTecleado = document.querySelectorAll('.description');
  elementosTecleado.forEach(teclearTexto);
});

// Scroll to top button
(function () {
  const btn = document.getElementById('scrollToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


