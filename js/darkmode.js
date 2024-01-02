
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
const cuadro=document.getElementById('cuadro');
const divBorde=document.getElementById('divBorde');
/*var spans= document.querySelectorAll('.socialName');
const span= document.querySelector('.social-container .item span:last-child');*/
if (isDarkMode) {
    body.classList.add('dark-mode');
    darkModeToggle.checked = true;
    /*divBorde.style.boxShadow: "none";*/
    cuadro.classList.add('dark-mode');
}
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        cuadro.classList.add('dark-mode');
        /*divBorde.style.boxShadow= "none";*/
        localStorage.setItem('darkMode', 'enabled');
        /*spans.forEach(element => {
            element.classList.remove('dark-mode');
        });*/
       
        
        
    } else {
        body.classList.remove('dark-mode');
        cuadro.classList.remove('dark-mode');
        /*divBorde.style.boxShadow= "5px 5px 15px #D1D9E6, -5px -5px 15px #ffffff";*/
        /*spans.forEach(element => {
            element.classList.add('dark-mode');
        });*/
        /* span.style.color='black';*/
        localStorage.setItem('darkMode', 'disabled');
    }
});
  });