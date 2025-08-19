// Función para desplazar el scroll a una sección específica
  function scrollToSection(id) {
    var section = document.getElementById(id);
    section.style.display = 'block';

    // Calcula la posición de la sección en relación con la ventana
    var offsetTop = section.offsetTop;

    // Desplaza el scroll a la posición de la sección
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
  
  // Cierra el modal si se hace clic fuera de él
  window.onclick = function(event) {
    var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form');
  
    form.addEventListener('submit', function (event) {
       closeModal();
  })});
  
  
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  const header=document.getElementById("container");
  const nav=document.getElementById("navbar");
  const socialnames=document.getElementsByClassName("socialName");
  if (isDarkMode) {
      body.classList.add('dark-mode');
      //darkModeToggle.checked = true;
      header.classList.add('dark-mode');
      nav.classList.add('dark-mode');
      for(let i=0; i<socialnames.length; i++){
          socialnames[i].style.setProperty('color' ,'white')
      }
  } else {
          body.classList.remove('dark-mode');
          header.classList.remove('dark-mode');
          nav.classList.remove('dark-mode');
          for(let i=0; i<socialnames.length; i++){
              socialnames[i].style.setProperty('color' ,'black')
          }
  
  }

});



document.addEventListener('DOMContentLoaded', function () {
    // Obtén todos los elementos input dentro de la clase gallery
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
  // Función para simular el efecto de tecleado
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
    }, 100); // Ajusta la velocidad según tus preferencias
  }

  // Llamada a la función para cada elemento con la clase 'description'
  const elementosTecleado = document.querySelectorAll('.description');
  elementosTecleado.forEach(teclearTexto);
  

 