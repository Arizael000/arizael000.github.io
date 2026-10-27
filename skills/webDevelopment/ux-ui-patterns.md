# ✨ User Experience & Interaction (UX/UI Patterns)
Este módulo rige cómo deben interactuar los elementos en el portafolio para crear una experiencia de usuario premium y guiada.

## 🚀 Llamadas a la Acción (CTAs)
1. **Visibilidad:** Los CTAs principales nunca deben ser difíciles de encontrar o tener bajo contraste. Deben guiar al usuario hacia el siguiente paso lógico.
2. **Comportamiento Hover:** Todo botón o enlace que actúe como CTA debe tener un estado `:hover` *obvio* y agradable. Esto incluye, pero no se limita a: cambios sutiles de color, ligero escalado (scale), o la adición de una sombra suave (`box-shadow`). **El cambio de estado nunca puede ser invisible.**

## 🎭 Transiciones Suaves
Todas las transiciones de estado (hover, focus) deben implementarse con CSS `transition` para evitar saltos bruscos y dar una sensación premium al producto.
*   Ejemplo: `transition: all 0.3s ease-in-out;`.

## 📊 Jerarquía Visual
La información debe fluir lógicamente de arriba abajo (Z-pattern). Los elementos más importantes deben tener el mayor peso visual, asegurando que el usuario sepa dónde mirar primero.