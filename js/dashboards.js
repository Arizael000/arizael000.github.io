document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('dashModal');
  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('.dash-modal-close');

  function openModal(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || 'Dashboard';
    modal.classList.add('dash-modal--open');
  }

  function closeModal() {
    modal.classList.remove('dash-modal--open');
  }

  document.querySelectorAll('.dashboard-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var img = card.querySelector('.dash-thumb img');
      if (img) openModal(img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
