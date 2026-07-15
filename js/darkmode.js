document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dn'); // ← ¡ID corregido!
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    const header = document.getElementById("container");
    const moonIcon = document.querySelector('.switch .icon svg:first-child');
    const sunIcon = document.querySelector('.switch .icon svg:last-child');
    const navr = document.getElementById("navbar");

    
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
            document.documentElement.classList.add('dark-mode');
            body.classList.add('dark-mode');
            navr.classList.add('dark-mode');
            header.classList.add('dark-mode');
            navr.style.removeProperty('color');
            setIcons(true);
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.documentElement.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
            header.classList.remove('dark-mode');
            navr.classList.remove('dark-mode');
            setIcons(false);
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    // Initialize mode from localStorage
    toggleColors(isDarkMode);
    darkModeToggle.checked = isDarkMode;

    // Evento para el switch
    darkModeToggle.addEventListener('change', () => {
        toggleColors(darkModeToggle.checked);
    });
});
