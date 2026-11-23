document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('scrollUp');
  const closeBtn = modal?.querySelector('.modal-close');
  const cancelBtn = document.getElementById('cancelBtn');
  const forms = document.querySelectorAll('#contactForm, .portfolio-contact-form, [data-service-quote-form]');

  // Reuse the configured endpoint for the existing footer contact modal.
  const FORM_ENDPOINT = "https://formspree.io/f/mnqejopy";

  // === MODAL ===
  function openModal() {
    if (modal) modal.hidden = false;
  }

  function closeModal() {
    if (modal) modal.hidden = true;
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Close on backdrop click
  modal?.addEventListener('click', function (event) {
    if (event.target === modal || event.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });

  // === FORM SUBMIT (AJAX via fetch) ===
  forms.forEach(form => {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const inlineForm = form.classList.contains('portfolio-contact-form');
      const quoteForm = form.hasAttribute('data-service-quote-form');
      const status = inlineForm || quoteForm ? form.querySelector('.contact-form-status') : null;
      const submitButton = form.querySelector('button[type="submit"]');
      const buttonLabel = submitButton?.querySelector('span');
      const originalLabel = buttonLabel?.textContent;
      const successMessage = form.dataset.successMessage || "Message sent successfully. Thank you!";
      const errorMessage = form.dataset.errorMessage || "The message could not be sent. Please try again.";

      if (status) status.textContent = '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }
      if (buttonLabel) buttonLabel.textContent = 'Sending...';

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (!response.ok) {
          if (status) status.textContent = errorMessage;
          showErrorMessage(errorMessage);
          return;
        }

        form.reset();
        if (inlineForm) {
          if (status) status.textContent = successMessage;
        } else {
          if (quoteForm) {
            form.closest('dialog')?.close();
          } else {
            closeModal();
          }
          showSuccessMessage(successMessage);
        }
      } catch (error) {
        console.error('Contact form submission failed:', error);
        if (status) status.textContent = errorMessage;
        showErrorMessage(errorMessage);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-busy');
        }
        if (buttonLabel && originalLabel) buttonLabel.textContent = originalLabel;
      }
    });
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
