
document.addEventListener('DOMContentLoaded', function() {
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
const cuadro=document.getElementById('cuadro');
const header=document.getElementById("container");
const nav=document.getElementById("navbar");
const moon=document.getElementById("moon");
const socialnames=document.getElementsByClassName("socialName");
if (isDarkMode) {
    body.classList.add('dark-mode');
    darkModeToggle.checked = true;
    cuadro.classList.add('dark-mode');
    header.classList.add('dark-mode');
    nav.classList.add('dark-mode');
    moon.style.setProperty('color' ,'#f9532d');
    for(let i=0; i<socialnames.length; i++){
        socialnames[i].style.setProperty('color' ,'white')
    }
} else {
        body.classList.remove('dark-mode');
        cuadro.classList.remove('dark-mode');
        header.classList.remove('dark-mode');
        nav.classList.remove('dark-mode');
        moon.classList.remove('dark-mode');
        moon.style.setProperty('color' ,'#1F252E');
        for(let i=0; i<socialnames.length; i++){
            socialnames[i].style.setProperty('color' ,'black')
        }

}

darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        cuadro.classList.add('dark-mode');
        header.classList.add('dark-mode');
        nav.classList.add('dark-mode');
        moon.style.setProperty('color' ,'#f9532d');
        localStorage.setItem('darkMode', 'enabled');
        for(let i=0; i<socialnames.length; i++){
            socialnames[i].style.setProperty('color' ,'white')
        }
    } else {
        body.classList.remove('dark-mode');
        cuadro.classList.remove('dark-mode');
        header.classList.remove('dark-mode');
        nav.classList.remove('dark-mode');
        moon.classList.remove('dark-mode');
        moon.style.setProperty('color' ,'#1F252E');
        localStorage.setItem('darkMode', 'disabled');
        for(let i=0; i<socialnames.length; i++){
            socialnames[i].style.setProperty('color' ,'black')
        }
    }
});
});