# 🧱 Core Development Principles (Mobile-First Obligation)
Este skill establece los pilares de desarrollo que deben aplicarse a todo componente web generado.

## 📱 1. Responsividad Obligatoria (Mobile-First)
El enfoque de desarrollo debe ser **Mobile-First**. Esto significa que:
1. Se diseña y codifica primero para la experiencia móvil (pantallas más pequeñas).
2. Las mejoras para tabletas y escritorios se implementan mediante *Media Queries* CSS, añadiendo complejidad o espacio, no restándolo.
3. Todos los elementos deben ser fluidos y escalables sin necesidad de cambios manuales de pixeles.

## 🛠️ 2. Estructura Semántica y Accesibilidad
1. **Semántica HTML5:** Usar etiquetas semánticas (`<header>`, `<main>`, `<section>`, `<footer>`) siempre que sea posible para mejorar la accesibilidad (ARIA).
2. **Rendimiento:** Minimizar el uso excesivo de JavaScript y delegar la interactividad básica al CSS/HTML si es posible, mejorando así el *Time To Interactive*.