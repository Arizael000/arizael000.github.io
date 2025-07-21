const menu = document.querySelector(".menu-social");
const toggle = document.querySelector(".toggle");
toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});

const links = [
  "https://www.facebook.com/arizael.garciacapote/",
  "https://wa.me/+50660460997",
  "mailto:arizogurdian@gmail.com",
  "https://www.linkedin.com/in/arizaelcapote",
  "https://github.com/Arizael000"
];

const items = menu.querySelectorAll("li");
items.forEach((li, idx) => {
  li.addEventListener("click", (e) => {
    e.preventDefault();
    if (idx === 2) return; // Omite el email, la lógica está en contactmeB.js
    window.open(links[idx], "_blank");
  });
});

document.addEventListener('click', function(e) {
  const menu = document.querySelector('.menu-social');
  const toggle = document.querySelector('.menu-social .toggle');
  if (!menu.classList.contains('active')) return;
  if (!menu.contains(e.target)) {
    menu.classList.remove('active');
  }
});