document.addEventListener("DOMContentLoaded", function () {
  const menu1 = document.querySelector(".menu1");
  const menu2 = document.querySelector(".menu2");
  const menu3 = document.querySelector(".menu3");
  const menu4 = document.querySelector(".menu4");


  // Agregar evento de clic a cada elemento del menú
  menu1.addEventListener("click", function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  menu2.addEventListener("click", function () {
        window.open('tools.html', '_blank');
  });
  menu3.addEventListener("click", function () {
    window.open('learningpath.html', '_blank');
  });
  menu4.addEventListener("click", function () {
    window.location.href = "https://drive.google.com/uc?export=download&id=1yxn_pme1sAEKMd9hC4s-pM1zKz0kkWoF";
  });
});

