document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dn'); // ← ¡ID corregido!
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    const header = document.getElementById("container");
    const nav = document.getElementById("navbar");
    const socialnames = document.getElementsByClassName("socialName");
    const moonIcon = document.querySelector('.switch .icon svg:first-child');
    const sunIcon = document.querySelector('.switch .icon svg:last-child');
    const main = document.querySelector('main');

    function setIcons(dark) {
        if (moonIcon && sunIcon) {
            if (dark) {
                moonIcon.style.opacity = "1";
                sunIcon.style.opacity = "0";
            } else {
                moonIcon.style.opacity = "0";
                sunIcon.style.opacity = "1";
            }
        }
    }

    function toggleColors(dark) {
        if (dark) {
            body.classList.add('dark-mode');
            header.classList.add('dark-mode');
            setIcons(true);
            localStorage.setItem('darkMode', 'enabled');
            for (let i = 0; i < socialnames.length; i++) {
                socialnames[i].style.setProperty('color', 'white');
            }
        } else {
            body.classList.remove('dark-mode');
            header.classList.remove('dark-mode');
            setIcons(false);
            localStorage.setItem('darkMode', 'disabled');
            for (let i = 0; i < socialnames.length; i++) {
                socialnames[i].style.setProperty('color', 'black');
            }
        }
    }

    // Inicializa el modo según localStorage
    toggleColors(isDarkMode);
    darkModeToggle.checked = isDarkMode;

    // Evento para el switch
    darkModeToggle.addEventListener('change', () => {
        toggleColors(darkModeToggle.checked);
    });
});
