


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('scrollUp').addEventListener('click', function(){
      setTimeout(function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }, 300); // Agregar un retraso de 1 segundo antes de llamar a la función scrollTo
    });
  });