


/*document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('scrollUp').addEventListener('click', function(){
      setTimeout(function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }, 300); // Agregar un retraso de 1 segundo antes de llamar a la función scrollTo
    });
  });*/

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
