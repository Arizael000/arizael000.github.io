document.addEventListener('DOMContentLoaded', function () {
  var cards = [
    {
      title: 'BlinkEyeTracker',
      group: 'Project',
      badge: 'Desktop App',
      img: 'media/projects/EyeTracker1.jpg',
      imgHover: 'media/projects/EyeTracker2.jpg',
      previewImages: ['media/projects/EyeTracker1.jpg', 'media/projects/EyeTracker2.jpg'],
      previewDesc: 'Windows desktop app that detects blinks and monitors screen time with a modern dark Nvidia-style UI. Tracks up to 5 faces simultaneously and alerts via voice when you go too long without blinking. Built with Python, OpenCV, MediaPipe, and Tkinter for real-time face tracking.',
      tags: ['Python', 'OpenCV', 'MediaPipe', 'Tkinter', 'pyttsx3'],
      link: 'https://github.com/Arizael000/BlinkEyeTracker',
      desc: 'Windows desktop app that detects blinks and monitors screen time with a modern dark Nvidia-style UI. Tracks up to 5 faces simultaneously and alerts via voice when you go too long without blinking.'
    },
    {
      title: 'Faulty Medical Devices (In progress)',
      group: 'Project',
      badge: 'Data Analysis',
      img: 'media/projects/medicalDevices.webp',
      imgHover: 'media/projects/medicalDevices2.png',
      previewImages: ['media/projects/medicalDevices.webp', 'media/projects/medicalDevices2.png'],
      previewDesc: 'Analysis of medical device failure reports using Pandas for data cleaning and Power BI for interactive visualization. Identifies failure patterns, manufacturer trends, and risk categories across thousands of FDA reports.',
      tags: ['Python', 'Pandas', 'Power BI'],
      link: 'https://github.com/Arizael000/faulty-mdevices',
      desc: 'Analysis of medical device failure reports with Pandas and Power BI'
    },
    {
      title: 'Demand Forecasting',
      group: 'Project',
      badge: 'Data Science',
      img: 'media/projects/LogisticForecast.jpg',
      imgHover: 'media/projects/pronostic.jpg',
      previewImages: ['media/projects/LogisticForecast.jpg', 'media/projects/pronostic.jpg'],
      previewDesc: 'Time series forecasting using Scikit-learn with interactive Power BI dashboards. The model helped avoid overstock situations and predicted a 13% demand growth. Includes feature engineering, model comparison, and automated retraining pipeline.',
      tags: ['Python', 'Scikit-learn', 'Power BI'],
      link: 'https://github.com/Arizael000/logisticPrediction',
      desc: 'Time series forecasting using Scikit-learn with interactive dashboards that helped to avoid overstock and pronostic an 13% grow '
    },
    {
      title: 'QR Code Generator',
      group: 'Project',
      badge: 'Desktop solution',
      img: 'media/projects/proyecto-qr-generator-scan.jpg',
      imgHover: 'media/projects/proyecto-qr-generator-icono.webp',
      previewImages: ['media/projects/proyecto-qr-generator-scan.jpg', 'media/projects/proyecto-qr-generator-icono.webp'],
      previewDesc: 'Desktop application for QR code generation and scanning built with Tkinter and Pillow. Supports multiple QR formats, custom colors, logo embedding, and batch generation. Helped avoid payment platform fees by creating static QR codes directly.',
      tags: ['Python', 'Tkinter', 'Pillow'],
      link: 'https://github.com/Arizael000/QR-Generator',
      desc: 'Desktop application for QR code generation and scanning with Tkinter.Helped to avoid payments in another plataforms creating static QR',
      className: 'project-card--qr-generator'
    },
    {
      title: 'Documental Report',
      group: 'Dashboard',
      badge: 'Export Operations',
      img: 'media/dashboards/thumbs/reporte-documental.webp',
      previewImages: ['media/dashboards/thumbs/reporte-documental.webp'],
      previewDesc: 'Workflow dashboard for analyzing, reconciling and reviewing Packing List and invoice PDFs before export procedures. Automates document validation, flags discrepancies, and generates compliance reports for customs clearance.',
      tags: ['Document Control', 'Packing List', 'Invoices'],
      href: 'reporteDocumental.html',
      cta: 'View report',
      desc: 'Workflow dashboard for analyzing, reconciling and reviewing Packing List and invoice PDFs before export procedures.'
    },
    {
      title: 'Aside Dashboards Practice',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-1.webp',
      imgHover: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-2.webp',
      imgFull: 'media/dashboards/dashboard-accidentes-eeuu-1.webp',
      previewImages: ['media/dashboards/dashboard-accidentes-eeuu-1.webp', 'media/dashboards/thumbs/dashboard-accidentes-eeuu-2.webp'],
      previewDesc: 'Power BI dashboards analyzing US accident data with advanced DAX measures. Includes time-series analysis, geographic heatmaps, weather correlation, and severity prediction. Built with Power Query for automated data refresh.',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Power BI dashboards analyzing US accident data with DAX measures'
    },
    {
      title: 'Logistic Forecast',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/dashboard-forecast-logistico-1.webp',
      imgHover: 'media/dashboards/thumbs/dashboard-forecast-logistico-2.webp',
      imgFull: 'media/dashboards/dashboard-forecast-logistico-1.webp',
      previewImages: ['media/dashboards/dashboard-forecast-logistico-1.webp', 'media/dashboards/thumbs/dashboard-forecast-logistico-2.webp'],
      previewDesc: 'Supply chain forecasting dashboards with Power BI and Power Query. Features demand forecasting, inventory optimization, supplier performance tracking, and scenario planning. Uses DAX for complex calculations and what-if analysis.',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Supply chain forecasting dashboards with Power BI and Power Query'
    },
    {
      title: 'Performance',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/ReporteSencillo.webp',
      imgHover: 'media/dashboards/thumbs/Sales.webp',
      imgFull: 'media/dashboards/ReporteSencillo.webp',
      previewImages: ['media/dashboards/ReporteSencillo.webp', 'media/dashboards/thumbs/Sales.webp'],
      previewDesc: 'Performance tracking dashboards using Power BI and DAX for business KPIs. Includes sales trends, regional performance, product mix analysis, and executive summaries. Optimized for fast refresh and mobile viewing.',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Performance tracking dashboards using Power BI and DAX for bussiness'
    },
    {
      title: 'QGIS Parameters Extraction',
      group: 'Project',
      badge: 'GIS / Analysis',
      img: 'media/projects/proyecto-qgis-params-fondo.webp',
      imgHover: 'media/projects/proyecto-qgis-params-icono-raster.webp',
      previewImages: ['media/projects/proyecto-qgis-params-fondo.webp', 'media/projects/proyecto-qgis-params-icono-raster.webp'],
      previewDesc: 'Thesis work: Raster parameter extraction algorithms built for a QGIS plugin (HYDRO_PROCESS M-SALD). Automates hydrological parameter extraction from raster data including flow direction, accumulation, watershed delineation, and stream network analysis.',
      tags: ['Python', 'QGIS', 'Raster'],
      link: 'https://github.com/Arizael000/Parameters-Extraction-in-QGIS',
      desc: 'Thesis work: Raster parameter extraction algorithms built for a QGIS plugin: HYDRO_PROCESS M-SALD. Automation of parameter extraction'
    }
  ];

  var grid = document.getElementById('projectsGrid');
  if (!grid) return;

  var projectsLayout = document.createElement('div');
  projectsLayout.className = 'projects-layout';
  grid.parentNode.insertBefore(projectsLayout, grid);

  // Create scroll container for cards (will have own scroll when preview open)
  var cardsScrollContainer = document.createElement('div');
  cardsScrollContainer.className = 'projects-cards-scroll-container';
  projectsLayout.appendChild(cardsScrollContainer);
  cardsScrollContainer.appendChild(grid);
  var imageTileColumns = 6;
  var imageTileRows = 5;
  var modal = document.getElementById('dashModal');
  var modalImg = modal && modal.querySelector('img');
  var modalCloseBtn = modal && modal.querySelector('.dash-modal-close');

  // Preview panel state
  var previewState = {
    isOpen: false,
    activeIndex: -1,        // DOM position (0 when reordered to top)
    activeArrayIndex: -1,   // Original cards array index for data lookup
    activeCard: null,
    previewPanel: null
  };

  // Reduced motion check
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createImageTiles(imageUrl, layerClass) {
    var layer = document.createElement('div');
    layer.className = 'project-image-tiles ' + layerClass;
    layer.setAttribute('aria-hidden', 'true');

    for (var row = 0; row < imageTileRows; row += 1) {
      for (var column = 0; column < imageTileColumns; column += 1) {
        var tile = document.createElement('span');
        var variation = (column * 7 + row * 11 + column * row * 3) % 23;
        var scatterX = (column - (imageTileColumns - 1) / 2) * 5 + (row % 2 ? 7 : -7);
        var scatterY = (row - (imageTileRows - 1) / 2) * 5 + (column % 2 ? 7 : -7);

        tile.className = 'project-image-tile';
        tile.style.backgroundImage = 'url("' + imageUrl + '")';
        tile.style.backgroundSize = (imageTileColumns * 100) + '% ' + (imageTileRows * 100) + '%';
        tile.style.backgroundPosition =
          (column / (imageTileColumns - 1) * 100) + '% ' +
          (row / (imageTileRows - 1) * 100) + '%';
        tile.style.setProperty('--tile-delay', (variation * 0.025) + 's');
        tile.style.setProperty('--scatter-x', scatterX + 'px');
        tile.style.setProperty('--scatter-y', scatterY + 'px');
        tile.style.setProperty('--scatter-rotation', ((variation % 7) - 3) * 9 + 'deg');
        layer.appendChild(tile);
      }
    }

    return layer;
  }

  function render() {
    cards.forEach(function (card, idx) {
      var col = document.createElement('div');
      col.className = 'project-card' + (card.className ? ' ' + card.className : '');
      col.dataset.cardIndex = idx;
      // Store original array index (never changes, even after DOM reordering)
      col.dataset.arrayIndex = idx;

      var imgWrap = document.createElement('div');
      imgWrap.className = 'project-card-img';

      if (card.imgHover) {
        var primary = document.createElement('img');
        primary.className = 'img-primary';
        primary.src = card.img;
        primary.alt = card.title;
        primary.loading = idx < 4 ? 'eager' : 'lazy';
        imgWrap.appendChild(primary);

        var hover = document.createElement('img');
        hover.className = 'img-hover';
        hover.src = card.imgHover;
        hover.alt = card.title + ' (view 2)';
        hover.loading = 'lazy';
        imgWrap.appendChild(hover);
        col.classList.add('has-secondary-image');
        imgWrap.appendChild(createImageTiles(card.img, 'project-image-tiles--primary'));
        imgWrap.appendChild(createImageTiles(card.imgHover, 'project-image-tiles--secondary'));
      } else {
        var primary = document.createElement('img');
        primary.className = 'img-primary';
        primary.src = card.img;
        primary.alt = card.title;
        primary.loading = idx < 4 ? 'eager' : 'lazy';
        imgWrap.appendChild(primary);
        col.classList.add('card--single');
      }

      col.appendChild(imgWrap);

      var body = document.createElement('div');
      body.className = 'project-card-body';

      var badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = card.badge;
      body.appendChild(badge);

      var title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = card.title;
      body.appendChild(title);

      var desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = card.desc;
      body.appendChild(desc);

      var tags = document.createElement('div');
      tags.className = 'card-tags';
      card.tags.forEach(function (t) {
        var span = document.createElement('span');
        span.textContent = t;
        tags.appendChild(span);
      });
      body.appendChild(tags);

      // Button container for both buttons
      var btnContainer = document.createElement('div');
      btnContainer.className = 'card-btn-container';

      // Primary action button (Code/View/Link)
      var primaryBtn;
      if (card.href) {
        primaryBtn = document.createElement('a');
        primaryBtn.className = 'card-btn card-btn--primary';
        primaryBtn.href = card.href;
        primaryBtn.textContent = card.cta || 'View';
      } else if (card.isDashboard) {
        primaryBtn = document.createElement('button');
        primaryBtn.className = 'card-btn card-btn--primary';
        primaryBtn.type = 'button';
        primaryBtn.textContent = 'View';
        primaryBtn.dataset.dashboardIndex = idx;
      } else {
        primaryBtn = document.createElement('a');
        primaryBtn.className = 'card-btn card-btn--primary';
        primaryBtn.href = card.link;
        primaryBtn.target = '_blank';
        primaryBtn.rel = 'noopener noreferrer';
        primaryBtn.textContent = 'Code';
      }
      btnContainer.appendChild(primaryBtn);

      // Preview button - ALL cards get this now
      var previewBtn = document.createElement('button');
      previewBtn.className = 'card-btn card-btn--preview';
      previewBtn.type = 'button';
      previewBtn.textContent = 'Preview';
      previewBtn.dataset.previewIndex = idx;
      previewBtn.setAttribute('aria-label', 'Preview ' + card.title);
      btnContainer.appendChild(previewBtn);

      body.appendChild(btnContainer);

      col.appendChild(body);
      grid.appendChild(col);
    });

    // Create and append preview panel
    createPreviewPanel();
  }

  // Dashboard modal functions
  function closeModal() {
    if (modal) modal.classList.remove('dash-modal--open');
  }
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !previewState.isOpen) closeModal(); });

  // Preview panel functions
  function createPreviewPanel() {
    var panel = document.createElement('div');
    panel.className = 'project-preview-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Project preview');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '\
      <div class="preview-content">\
        <button class="preview-close" aria-label="Close preview" type="button">\n\
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">\n\
            <line x1="18" y1="6" x2="6" y2="18"></line>\n\
            <line x1="6" y1="6" x2="18" y2="18"></line>\n\
          </svg>\n\
        </button>\
        <div class="preview-header">\
          <h3 class="preview-title"></h3>\
          <span class="preview-badge"></span>\
        </div>\
        <div class="preview-body">\
          <div class="preview-description"></div>\
          <div class="preview-images"></div>\
        </div>\
        <div class="preview-tags"></div>\
      </div>';
    projectsLayout.appendChild(panel);
    previewState.previewPanel = panel;

    var closeBtn = panel.querySelector('.preview-close');
    closeBtn.addEventListener('click', closePreview);
  }

  // FLIP animation helpers
  function captureCardPositions() {
    var rects = {};
    Array.prototype.forEach.call(grid.children, function (child) {
      var arrayIdx = child.dataset.arrayIndex;
      if (arrayIdx !== undefined) {
        rects[arrayIdx] = child.getBoundingClientRect();
      }
    });
    return rects;
  }

  function applyFlipTransforms(firstRects) {
    Array.prototype.forEach.call(grid.children, function (child) {
      var arrayIdx = child.dataset.arrayIndex;
      var firstRect = firstRects[arrayIdx];
      if (!firstRect) return;

      var lastRect = child.getBoundingClientRect();
      var deltaX = firstRect.left - lastRect.left;
      var deltaY = firstRect.top - lastRect.top;

      if (deltaX !== 0 || deltaY !== 0) {
        child.classList.add('is-reordering');
        child.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
        child.style.transition = 'none'; // Disable transition during invert
      }
    });
    // Force reflow
    grid.offsetHeight;
  }

  function clearFlipTransforms() {
    Array.prototype.forEach.call(grid.children, function (child) {
      child.style.transform = '';
      child.style.transition = '';
      // Remove is-reordering after animation completes
      setTimeout(function () {
        child.classList.remove('is-reordering');
      }, 550); // Match --preview-duration
    });
  }

  function updateCardDomIndexes() {
    Array.prototype.forEach.call(grid.children, function (child, index) {
      child.dataset.cardIndex = index;
      var previewBtn = child.querySelector('.card-btn--preview');
      if (previewBtn) previewBtn.dataset.previewIndex = index;
    });
  }

  function restoreOriginalCardOrder() {
    var originalOrder = Array.prototype.slice.call(grid.children).sort(function (a, b) {
      return parseInt(a.dataset.arrayIndex, 10) - parseInt(b.dataset.arrayIndex, 10);
    });
    originalOrder.forEach(function (card) {
      grid.appendChild(card);
    });
    updateCardDomIndexes();
  }

  function openPreview(index) {
    // index parameter is DOM position (from dataset.previewIndex)
    var cardEl = grid.children[index];
    if (!cardEl) return;

    // Get original array index from the card element (never changes)
    var originalArrayIndex = parseInt(cardEl.dataset.arrayIndex, 10);
    var cardData = cards[originalArrayIndex];
    if (!cardData) return;

    // Capture positions BEFORE any DOM changes (FLIP First)
    var firstRects = captureCardPositions();

    if (previewState.activeCard && previewState.activeCard !== cardEl) {
      previewState.activeCard.classList.remove('is-preview-active', 'becoming-active');
      previewState.activeCard.removeAttribute('aria-expanded');
      var previousButton = previewState.activeCard.querySelector('.card-btn--preview');
      if (previousButton) {
        previousButton.textContent = 'Preview';
        previousButton.setAttribute('aria-label', 'Preview ' + cards[previewState.activeArrayIndex].title);
        previousButton.classList.remove('is-close');
      }
    }

    if (previewState.isOpen) restoreOriginalCardOrder();

    var didReorder = grid.firstChild !== cardEl;
    if (didReorder) grid.insertBefore(cardEl, grid.firstChild);
    updateCardDomIndexes();
    index = 0;

    if (didReorder && !prefersReducedMotion) {
      applyFlipTransforms(firstRects);
    }

    previewState.isOpen = true;
    previewState.activeIndex = index;
    previewState.activeArrayIndex = originalArrayIndex;
    previewState.activeCard = cardEl;

    pauseAutoToggle();
    populatePreview(cardData);

    projectsLayout.classList.add('preview-open');
    grid.classList.add('preview-open');

    if (didReorder && !prefersReducedMotion) {
      clearFlipTransforms();
    }

    previewState.previewPanel.setAttribute('aria-hidden', 'false');
    previewState.previewPanel.classList.add('is-open');
    cardEl.classList.add('is-preview-active', 'becoming-active');
    cardEl.setAttribute('aria-expanded', 'true');

    var previewBtn = cardEl.querySelector('.card-btn--preview');
    if (previewBtn) {
      previewBtn.textContent = 'Cerrar Preview';
      previewBtn.setAttribute('aria-label', 'Cerrar preview de ' + cardData.title);
      previewBtn.classList.add('is-close');
    }

    previewState.previewPanel.querySelector('.preview-close').focus({ preventScroll: true });
  }

  function closePreview() {
    if (!previewState.isOpen) return;

    var cardEl = previewState.activeCard;
    var previewBtn = cardEl && cardEl.querySelector('.card-btn--preview');
    // Use activeArrayIndex for correct card data lookup from original array
    var cardData = cards[previewState.activeArrayIndex];

    if (previewBtn) {
      previewBtn.textContent = 'Preview';
      previewBtn.setAttribute('aria-label', 'Preview ' + (cardData ? cardData.title : ''));
      previewBtn.classList.remove('is-close');
    }

    previewState.previewPanel.classList.remove('is-open');
    previewState.previewPanel.setAttribute('aria-hidden', 'true');

    if (cardEl) {
      cardEl.classList.remove('is-preview-active', 'becoming-active');
      cardEl.removeAttribute('aria-expanded');
    }

    restoreOriginalCardOrder();
    projectsLayout.classList.remove('preview-open');
    grid.classList.remove('preview-open');

    previewState.isOpen = false;
    previewState.activeIndex = -1;
    previewState.activeArrayIndex = -1;
    previewState.activeCard = null;
    if (previewBtn) previewBtn.focus({ preventScroll: true });
    resumeAutoToggle();
  }

  function populatePreview(cardData) {
    var panel = previewState.previewPanel;
    if (!panel) return;

    var titleEl = panel.querySelector('.preview-title');
    var badgeEl = panel.querySelector('.preview-badge');
    var imagesEl = panel.querySelector('.preview-images');
    var descEl = panel.querySelector('.preview-description');
    var tagsEl = panel.querySelector('.preview-tags');

    titleEl.textContent = cardData.title;
    badgeEl.textContent = cardData.badge;
    badgeEl.className = 'preview-badge card-badge';

    // Images
    var previewImgs = cardData.previewImages || [cardData.img];
    imagesEl.innerHTML = '';
    previewImgs.forEach(function (imgSrc, i) {
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = cardData.title + ' preview ' + (i + 1);
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.className = 'preview-image';
      imagesEl.appendChild(img);
    });
    imagesEl.className = 'preview-images' + (previewImgs.length === 1 ? ' single-image' : '');

    // Description
    descEl.textContent = cardData.previewDesc || cardData.desc;

    // Tags
    tagsEl.innerHTML = '';
    cardData.tags.forEach(function (tag) {
      var span = document.createElement('span');
      span.textContent = tag;
      span.className = 'card-tag';
      tagsEl.appendChild(span);
    });
  }

  var autoToggleInterval = null;

  function pauseAutoToggle() {
    if (autoToggleInterval) {
      clearInterval(autoToggleInterval);
      autoToggleInterval = null;
    }
  }

  function resumeAutoToggle() {
    if (prefersReducedMotion) return;
    if (autoToggleInterval) return;
    autoToggleInterval = window.setInterval(function () {
      if (!previewState.isOpen) {
        Array.prototype.forEach.call(grid.children, function (card) {
          card.classList.toggle('is-secondary');
        });
      }
    }, 5000);
  }

  // Single event delegation for ALL button clicks on grid
  grid.addEventListener('click', function (e) {
    if (!(e.target instanceof Element)) return;

    // 1. Preview button (highest priority)
    var previewBtn = e.target.closest('.card-btn--preview');
    if (previewBtn) {
      e.preventDefault();
      e.stopPropagation();
      var index = parseInt(previewBtn.dataset.previewIndex, 10);
      if (!isNaN(index)) {
        if (previewState.isOpen && previewState.activeIndex === index) {
          closePreview();
        } else {
          openPreview(index);
        }
      }
      return;
    }

    // 2. Dashboard primary button (View button for dashboards)
    var dashboardBtn = e.target.closest('[data-dashboard-index].card-btn--primary');
    if (dashboardBtn) {
      e.preventDefault();
      e.stopPropagation();
      var idx = parseInt(dashboardBtn.dataset.dashboardIndex, 10);
      var data = cards[idx];
      if (data && data.isDashboard && modal && modalImg) {
        var src = data.imgFull || data.img;
        modalImg.src = src;
        modalImg.alt = data.title;
        modal.classList.add('dash-modal--open');
      }
      return;
    }

    // 3. Primary action links (Code/View/Report) - let them work naturally
    // These are <a> tags with href, so they navigate naturally
    // We don't preventDefault or stopPropagation for them
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (previewState.isOpen) {
      closePreview();
    } else {
      closeModal();
    }
  });

  render();
  resumeAutoToggle();
});
