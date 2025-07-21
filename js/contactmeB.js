document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('myModal');
  const openBtn = document.getElementById('scrollUp');
  const closeBtn = document.querySelector('.close');
  const cancelBtn = document.getElementById('cancelarform');
  const form = document.getElementById('contactForm');

  // ✅ Aquí defines el endpoint oculto, solo en JS
  const FORM_ENDPOINT = "https://formspree.io/f/mnqejopy";

  // === MODAL ===
  function openModal() {
    if (modal) modal.style.display = 'block';
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // === FORM SUBMIT (AJAX via fetch) ===
  form?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Detiene el envío tradicional

    const formData = new FormData(form);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        closeModal();
        showSuccessMessage("Message sent successfully. Thank you!");
        form.reset();
      } else {
        showErrorMessage("Oops! Something went wrong.");
      }
    } catch (error) {
      showErrorMessage("Network error. Please try again.");
    }
  });

  // === TOAST MESSAGES ===
  function showSuccessMessage(message) {
    showToast(message, 'success');
  }

  function showErrorMessage(message) {
    showToast(message, 'error');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  const socialEmail = document.getElementById('socialEmail');
  socialEmail?.addEventListener('click', function(e) {
    e.preventDefault();
    openModal();
  });
});
