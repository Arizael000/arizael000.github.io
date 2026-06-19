(function () {
    'use strict';

    var modal = document.getElementById('cert-gallery-modal');
    if (!modal) return;

    var content = modal.querySelector('.gallery-content');
    var closeBtn = modal.querySelector('.gallery-close');

    function openGallery(images) {
        if (!images.length) return;
        content.innerHTML = '';
        images.forEach(function (src) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = 'Certificate image';
            img.loading = 'lazy';
            content.appendChild(img);
        });
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeydown);
    }

    function closeGallery() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') closeGallery();
    }

    document.querySelectorAll('.certificate-card[data-gallery]').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var data = card.dataset.gallery;
            if (!data) return;
            try {
                openGallery(JSON.parse(data));
            } catch (err) {
                console.error('Invalid gallery data:', data);
            }
        });
    });

    closeBtn.addEventListener('click', closeGallery);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeGallery();
    });
})();