document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('toggle-2'); // El id del input del switch
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    const cuadro = document.getElementById('cuadro');
    const header = document.getElementById("container");
    const nav = document.getElementById("navbar");
    const socialnames = document.getElementsByClassName("socialName");
    const moonIcon = document.querySelector('.switch .icon svg:first-child');
    const sunIcon = document.querySelector('.switch .icon svg:last-child');

    function setIcons(dark) {
        if (dark) {
            moonIcon.style.opacity = "1";
            sunIcon.style.opacity = "0";
        } else {
            moonIcon.style.opacity = "0";
            sunIcon.style.opacity = "1";
        }
    }

    // Inicializa el modo según localStorage
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        cuadro?.classList.add('dark-mode');
        header?.classList.add('dark-mode');
        nav?.classList.add('dark-mode');
        setIcons(true);
        for(let i=0; i<socialnames.length; i++){
            socialnames[i].style.setProperty('color' ,'white');
        }
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
        cuadro?.classList.remove('dark-mode');
        header?.classList.remove('dark-mode');
        nav?.classList.remove('dark-mode');
        setIcons(false);
        for(let i=0; i<socialnames.length; i++){
            socialnames[i].style.setProperty('color' ,'black');
        }
    }

    // Evento para el switch
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            body.classList.add('dark-mode');
            cuadro?.classList.add('dark-mode');
            header?.classList.add('dark-mode');
            nav?.classList.add('dark-mode');
            setIcons(true);
            localStorage.setItem('darkMode', 'enabled');
            for(let i=0; i<socialnames.length; i++){
                socialnames[i].style.setProperty('color' ,'white');
            }
        } else {
            body.classList.remove('dark-mode');
            cuadro?.classList.remove('dark-mode');
            header?.classList.remove('dark-mode');
            nav?.classList.remove('dark-mode');
            setIcons(false);
            localStorage.setItem('darkMode', 'disabled');
            for(let i=0; i<socialnames.length; i++){
                socialnames[i].style.setProperty('color' ,'black');
            }
        }
    });
});