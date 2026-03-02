document.addEventListener("DOMContentLoaded", function () {
  const menu1 = document.querySelector(".menu1");
  const menu2 = document.querySelector(".menu2");
  const menu3 = document.querySelector(".menu3");
  const menu4 = document.querySelector(".menu4");

  // Contact me → scroll al footer
  menu1.addEventListener("click", function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  // Tools → navega a tools.html (replaceState lo limpiará al llegar)
  menu2.addEventListener("click", function () {
    window.location.href = 'tools.html';
  });

  // Learning Path → navega a learningpath.html (replaceState lo limpiará al llegar)
  menu3.addEventListener("click", function () {
    window.location.href = 'learningpath.html';
  });

  // Download CV
  menu4.addEventListener("click", function () {
    window.location.href = "https://drive.google.com/uc?export=download&id=1yxn_pme1sAEKMd9hC4s-pM1zKz0kkWoF";
  });
});
