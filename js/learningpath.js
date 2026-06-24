(function () {
    'use strict';

    var modal = document.getElementById('cert-gallery-modal');
    if (!modal) return;

    var content = modal.querySelector('.gallery-content');
    var closeBtn = modal.querySelector('.gallery-close');

    function openGallery(images, rotateIndices) {
        if (!images.length) return;
        content.innerHTML = '';
        images.forEach(function (src, index) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = 'Certificate image';
            img.loading = 'lazy';
            if (rotateIndices && rotateIndices.indexOf(index) !== -1) {
                img.classList.add('rotated');
            }
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
        var btn = card.querySelector('.btn-gallery');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var data = card.dataset.gallery;
                var rotateData = card.dataset.galleryRotate;
                if (!data) return;
                try {
                    var rotateIndices = rotateData ? JSON.parse(rotateData) : null;
                    openGallery(JSON.parse(data), rotateIndices);
                } catch (err) {
                    console.error('Invalid gallery data:', data);
                }
            });
        } else {
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
        }
    });

    closeBtn.addEventListener('click', closeGallery);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeGallery();
    });
})();