document.addEventListener('DOMContentLoaded', function () {
  var cards = [
    {
      title: 'BlinkEyeTracker',
      group: 'Project',
      badge: 'Desktop App',
      img: 'media/projects/EyeTracker1.jpg',
      imgHover: 'media/projects/EyeTracker2.jpg',
      previewImages: ['media/projects/EyeTracker1.jpg', 'media/projects/EyeTracker2.jpg'],
      previewDesc: 'A Windows desktop app that watches your eyes while you work and reminds you to blink. It tracks up to 5 faces at once using your webcam and alerts you by voice when you\'ve gone too long without blinking — helping prevent eye strain and dry eyes.\n\nWhat it does:\n• Real-time blink detection via webcam\n• Monitors screen time per session\n• Voice alerts when blink rate drops\n• Tracks up to 5 people simultaneously\n• Clean dark-mode interface',
      tags: ['Python', 'OpenCV', 'MediaPipe', 'Tkinter', 'pyttsx3'],
      link: 'https://github.com/Arizael000/BlinkEyeTracker',
      desc: 'Windows desktop app for real-time blink detection and screen-time monitoring with voice alerts. Tracks up to 5 faces simultaneously.'
    },
    {
      title: 'Faulty Medical Devices (In progress)',
      group: 'Project',
      badge: 'Data Analysis',
      img: 'media/projects/medicalDevices.webp',
      imgHover: 'media/projects/medicalDevices2.png',
      previewImages: ['media/projects/medicalDevices.webp', 'media/projects/medicalDevices2.png'],
      previewDesc: 'An analysis of FDA medical device failure reports to find which devices fail most often and why. The project processes over 50,000 reports, cleans the data, and visualizes patterns in an interactive dashboard.\n\nKey findings:\n• Failure trends by device type and manufacturer\n• Root causes: design flaws vs. user error\n• Risk scores based on patient harm severity\n• Geographic hotspots for incidents\n• Recall correlation timeline',
      tags: ['Python', 'Pandas', 'Power BI'],
      link: 'https://github.com/Arizael000/faulty-mdevices',
      desc: 'Analysis of FDA medical device failure reports to identify risk patterns and manufacturer trends.',
      className: 'project-card--medical-devices'
    },
    {
      title: 'Demand Forecasting',
      group: 'Project',
      badge: 'Data Science',
      img: 'media/projects/LogisticForecast.jpg',
      imgHover: 'media/projects/pronostic.jpg',
      previewImages: ['media/projects/LogisticForecast.jpg', 'media/projects/pronostic.jpg'],
      previewDesc: 'A forecasting tool that predicts product demand for logistics planning. It analyzes historical sales, builds multiple models, and picks the best one — updating automatically each month.\n\nResults:\n• Cut overstock by 22%\n• Predicted 13% demand growth accurately\n• 8.4% prediction error (12-week horizon)\n• Auto-retrains monthly with new data\n• Interactive "what-if" dashboard for planners',
      tags: ['Python', 'Scikit-learn', 'Power BI'],
      link: 'https://github.com/Arizael000/logisticPrediction',
      desc: 'Demand forecasting that reduced overstock 22% and predicted 13% growth, with automated monthly retraining.'
    },
    {
      title: 'QR Code Generator',
      group: 'Project',
      badge: 'Desktop solution',
      img: 'media/projects/proyecto-qr-generator-scan.jpg',
      imgHover: 'media/projects/proyecto-qr-generator-icono.webp',
      previewImages: ['media/projects/proyecto-qr-generator-scan.jpg', 'media/projects/proyecto-qr-generator-icono.webp'],
      previewDesc: 'A desktop app to create and scan QR codes without paying monthly fees to payment platforms. Customize colors, add logos, generate batches from spreadsheets, and scan codes with your webcam.\n\nFeatures:\n• Create QR codes for URLs, contacts, WiFi, text\n• Custom colors, logo embedding, error correction\n• Batch generation from CSV files\n• Real-time webcam scanner\n• Saves merchants 1.5–2.9% per transaction',
      tags: ['Python', 'Tkinter', 'Pillow'],
      link: 'https://github.com/Arizael000/QR-Generator',
      desc: 'Desktop QR code generator and scanner with full customization and batch creation. Eliminates third-party payment fees.',
      className: 'project-card--qr-generator'
    },
    {
      title: 'Documental Report',
      group: 'Dashboard',
      badge: 'Export Operations',
      img: 'media/dashboards/thumbs/reporte-documental.webp',
      imgHover: 'media/projects/reporteDocumental2.jpeg',
      previewImages: ['media/dashboards/thumbs/reporte-documental.webp', 'media/projects/reporteDocumental2.jpeg'],
      previewDesc: 'A web dashboard that automatically checks shipping documents (Packing Lists and Invoices) against your ERP data before export. It reads PDFs, compares every line item, and flags any mismatches.\n\nWhat it delivers:\n• Cuts document review from 45 min to 8 min per shipment\n• Reduces customs rejections by 37%\n• Auto-flags missing items, wrong quantities, value errors\n• Kanban workflow to resolve issues\n• One-click customs-ready compliance packet',
      tags: ['Document Control', 'Packing List', 'Invoices'],
      href: 'reporteDocumental.html',
      cta: 'View report',
      desc: 'Automated pre-export document verification. Parses PDFs, cross-references ERP data, flags discrepancies, generates customs-ready packets.'
    },
    {
      title: 'Aside Dashboards Practice',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-1.webp',
      imgHover: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-2.webp',
      imgFull: 'media/dashboards/dashboard-accidentes-eeuu-1.webp',
      previewImages: ['media/dashboards/dashboard-accidentes-eeuu-1.webp', 'media/dashboards/thumbs/dashboard-accidentes-eeuu-2.webp'],
      previewDesc: 'A Power BI report exploring 7.7 million US traffic accidents to find when, where, and why crashes happen.\n\nHighlights:\n• Hour-by-day heatmaps show peak danger times\n• State and county-level crash maps\n• Weather impact: rain, fog, temperature vs. severity\n• Severity prediction simulator\n• Weekly auto-refresh from live data',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Power BI analysis of 7.7M US traffic accidents with time/weather/geographic patterns and severity prediction.'
    },
    {
      title: 'Logistic Forecast',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/dashboard-forecast-logistico-1.webp',
      imgHover: 'media/dashboards/thumbs/dashboard-forecast-logistico-2.webp',
      imgFull: 'media/dashboards/dashboard-forecast-logistico-1.webp',
      previewImages: ['media/dashboards/dashboard-forecast-logistico-1.webp', 'media/dashboards/thumbs/dashboard-forecast-logistico-2.webp'],
      previewDesc: 'A supply chain command center for 12 warehouses — combining demand forecasts, inventory health, and supplier performance in one place.\n\nCapabilities:\n• Demand forecasts with confidence bands\n• Inventory aging, excess stock, reorder alerts\n• Supplier scorecards (on-time, lead time, defects)\n• What-if scenarios for demand spikes or delays\n• Cut safety stock 18% while keeping 98.5% fill rate\n• Daily auto-refresh from ERP and WMS',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Supply chain Power BI suite: forecasting, inventory, suppliers, scenarios. Reduced safety stock 18% at 98.5% fill rate.'
    },
    {
      title: 'Performance',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/ReporteSencillo.webp',
      imgHover: 'media/dashboards/thumbs/Sales.webp',
      imgFull: 'media/dashboards/ReporteSencillo.webp',
      previewImages: ['media/dashboards/ReporteSencillo.webp', 'media/dashboards/thumbs/Sales.webp'],
      previewDesc: 'An executive dashboard for a retail business selling online and in stores — tracking 120+ metrics across sales, marketing, and operations.\n\nWhat you see:\n• Revenue growth (year, quarter, month)\n• Profit margin by channel (web vs. store)\n• Customer acquisition cost vs. lifetime value\n• Inventory turnover and sell-through rates\n• Promo ROI and exception alerts\n• Mobile-friendly, role-based access\n• Reporting time: 3 days → 2 hours',
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Retail executive dashboard: 120+ KPIs, multi-channel, mobile-ready. Cut reporting from 3 days to 2 hours.'
    },
    {
      title: 'QGIS Parameters Extraction',
      group: 'Project',
      badge: 'GIS / Analysis',
      img: 'media/projects/proyecto-qgis-params-fondo.webp',
      imgHover: 'media/projects/proyecto-qgis-params-icono-raster.webp',
      previewImages: ['media/projects/proyecto-qgis-params-fondo.webp', 'media/projects/proyecto-qgis-params-icono-raster.webp'],
      previewDesc: 'A QGIS plugin (HYDRO_PROCESS M-SALD) that automatically calculates watershed boundaries, stream networks, and terrain metrics from elevation maps — turning raw terrain data into hydrology-ready layers in minutes.\n\nWhat it does:\n• Flow direction & accumulation (handles pits automatically)\n• Watershed delineation from pour points\n• Stream networks with Strahler ordering\n• Terrain indices: slope, curvature, wetness\n• Processes 100M-cell maps in <90 seconds\n• Validated against industry standard (HEC-HMS)\n• Published on the official QGIS Plugin Repository',
      tags: ['Python', 'QGIS', 'Raster'],
      link: 'https://github.com/Arizael000/Parameters-Extraction-in-QGIS',
      desc: 'QGIS plugin for automated hydrological analysis from elevation data: watersheds, streams, terrain indices. Fast, validated, publicly published.'
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
  var modal = document.getElementById('dashModal');
  var modalImg = modal && modal.querySelector('img');
  var modalCloseBtn = modal && modal.querySelector('.dash-modal-close');
  var mobilePreviewQuery = window.matchMedia('(max-width: 760px)');

  // Preview panel state
  var previewState = {
    isOpen: false,
    isModal: false,
    activeIndex: -1,        // DOM position (0 when reordered to top)
    activeArrayIndex: -1,   // Original cards array index for data lookup
    activeCard: null,
    triggerElement: null,
    previewPanel: null
  };

  // Reduced motion check
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    cards.forEach(function (card, idx) {
      var col = document.createElement('div');
      col.className = 'project-card' + (card.className ? ' ' + card.className : '');
      col.dataset.cardIndex = idx;
      // Store original array index (never changes, even after DOM reordering)
      col.dataset.arrayIndex = idx;
      col.style.viewTransitionName = 'project-card-' + idx;

      var imgWrap = document.createElement('div');
      imgWrap.className = 'project-card-img';

      if (card.imgHover) {
        var primary = document.createElement('img');
        primary.className = 'img-primary';
        primary.src = card.img;
        primary.alt = card.title;
        primary.loading = 'lazy';
        primary.decoding = 'async';
        imgWrap.appendChild(primary);

        var hover = document.createElement('img');
        hover.className = 'img-hover';
        hover.src = card.imgHover;
        hover.alt = '';
        hover.setAttribute('aria-hidden', 'true');
        hover.loading = 'lazy';
        hover.decoding = 'async';
        imgWrap.appendChild(hover);
        col.classList.add('has-secondary-image');
      } else {
        var primary = document.createElement('img');
        primary.className = 'img-primary';
        primary.src = card.img;
        primary.alt = card.title;
        primary.loading = 'lazy';
        primary.decoding = 'async';
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
    var panel = document.createElement('dialog');
    panel.className = 'project-preview-panel';
    panel.setAttribute('aria-labelledby', 'project-preview-title');
    panel.innerHTML = '\
      <div class="preview-content">\
        <button class="preview-close" aria-label="Close preview" type="button">\n\
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">\n\
            <line x1="18" y1="6" x2="6" y2="18"></line>\n\
            <line x1="6" y1="6" x2="18" y2="18"></line>\n\
          </svg>\n\
        </button>\
        <div class="preview-header">\
          <h3 class="preview-title" id="project-preview-title"></h3>\
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
    panel.addEventListener('close', function () {
      if (previewState.isOpen) closePreview();
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      panel.addEventListener('click', function (e) {
        if (!previewState.isModal || e.target !== panel) return;
        var rect = panel.getBoundingClientRect();
        var clickedOutside =
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom;
        if (clickedOutside) closePreview();
      });
    }
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

  function updatePreviewCardsHeight() {
    if (!previewState.isOpen || previewState.isModal) {
      cardsScrollContainer.style.height = '';
      return;
    }

    var activeCard = previewState.activeCard;
    if (!activeCard) return;

    var cardChildren = Array.prototype.slice.call(grid.children);
    var activePosition = cardChildren.indexOf(activeCard);
    var visibleCards = cardChildren.slice(activePosition, activePosition + 3);
    var gap = parseFloat(window.getComputedStyle(grid).rowGap) || 0;
    var cardsHeight = visibleCards.reduce(function (total, card) {
      return total + card.getBoundingClientRect().height;
    }, 0);
    var desiredHeight = cardsHeight + (Math.max(visibleCards.length - 1, 0) * gap);
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var minimumHeight = Math.min(448, viewportHeight - 120);
    var maximumHeight = Math.max(minimumHeight, viewportHeight - 120);

    cardsScrollContainer.style.height =
      Math.max(minimumHeight, Math.min(desiredHeight, maximumHeight)) + 'px';
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
    cardsScrollContainer.classList.add('is-transitioning');

    function finishTransition() {
      window.setTimeout(function () {
        cardsScrollContainer.classList.remove('is-transitioning');
      }, 650);
    }

    if (typeof cardsScrollContainer.startViewTransition === 'function' && !prefersReducedMotion) {
      cardsScrollContainer.startViewTransition(function () {
        performOpenPreview(index, true);
      }).finished.finally(finishTransition);
      return;
    }

    if (prefersReducedMotion || typeof document.startViewTransition !== 'function') {
      performOpenPreview(index);
      finishTransition();
      return;
    }

    document.startViewTransition(function () {
      performOpenPreview(index, true);
    }).finished.finally(finishTransition);
  }

  function performOpenPreview(index, useViewTransition) {
    // index parameter is DOM position (from dataset.previewIndex)
    var cardEl = grid.children[index];
    if (!cardEl) return;

    // Get original array index from the card element (never changes)
    var originalArrayIndex = parseInt(cardEl.dataset.arrayIndex, 10);
    var cardData = cards[originalArrayIndex];
    if (!cardData) return;

    var isModal = mobilePreviewQuery.matches;
    var pageScrollX = window.scrollX;
    var pageScrollY = window.scrollY;
    var firstRects = isModal ? null : captureCardPositions();

    if (previewState.activeCard && previewState.activeCard !== cardEl) {
      previewState.activeCard.classList.remove('is-preview-active', 'becoming-active');
      previewState.activeCard.removeAttribute('aria-expanded');
      if (previewState.triggerElement) {
        previewState.triggerElement.removeAttribute('aria-expanded');
      }
      var previousButton = previewState.activeCard.querySelector('.card-btn--preview');
      if (previousButton) {
        previousButton.textContent = 'Preview';
        previousButton.setAttribute('aria-label', 'Preview ' + cards[previewState.activeArrayIndex].title);
        previousButton.classList.remove('is-close');
      }
    }

    if (previewState.isOpen) {
      if (previewState.isModal !== isModal && previewState.previewPanel.open) {
        previewState.previewPanel.close();
      }
      if (!previewState.isModal) restoreOriginalCardOrder();
    }

    var didReorder = !isModal && grid.firstChild !== cardEl;
    if (!isModal) {
      if (didReorder) grid.insertBefore(cardEl, grid.firstChild);
      updateCardDomIndexes();
      index = 0;
    }

    if (!useViewTransition && didReorder && !prefersReducedMotion && firstRects) {
      applyFlipTransforms(firstRects);
    }

    previewState.isOpen = true;
    previewState.isModal = isModal;
    previewState.activeIndex = index;
    previewState.activeArrayIndex = originalArrayIndex;
    previewState.activeCard = cardEl;
    previewState.triggerElement = cardEl.querySelector('.card-btn--preview');

    pauseAutoToggle();
    populatePreview(cardData);

    if (isModal) {
      projectsLayout.classList.remove('preview-open');
      grid.classList.remove('preview-open');
    } else {
      projectsLayout.classList.add('preview-open');
      grid.classList.add('preview-open');
      updatePreviewCardsHeight();
    }

    if (!useViewTransition && didReorder && !prefersReducedMotion) {
      clearFlipTransforms();
    }

    if (!previewState.previewPanel.open) {
      if (isModal) {
        previewState.previewPanel.setAttribute('closedby', 'any');
        if (previewState.triggerElement) {
          previewState.triggerElement.focus({ preventScroll: true });
        }
        previewState.previewPanel.showModal();
      } else {
        previewState.previewPanel.removeAttribute('closedby');
        previewState.previewPanel.show();
      }
    }
    previewState.previewPanel.classList.add('is-open');
    if (!isModal) cardEl.classList.add('is-preview-active', 'becoming-active');
    if (previewState.triggerElement) previewState.triggerElement.setAttribute('aria-expanded', 'true');

    var previewBtn = cardEl.querySelector('.card-btn--preview');
    if (previewBtn && !isModal) {
      previewBtn.textContent = 'Cerrar Preview';
      previewBtn.setAttribute('aria-label', 'Cerrar preview de ' + cardData.title);
      previewBtn.classList.add('is-close');
    }

    if (!isModal) {
      cardsScrollContainer.scrollTop = 0;
      requestAnimationFrame(function () {
        window.scrollTo(pageScrollX, pageScrollY);
        cardsScrollContainer.scrollTop = 0;
      });
    }

    previewState.previewPanel.querySelector('.preview-close').focus({ preventScroll: true });
  }

  function closePreview() {
    cardsScrollContainer.classList.add('is-transitioning');

    function finishTransition() {
      window.setTimeout(function () {
        cardsScrollContainer.classList.remove('is-transitioning');
      }, 650);
    }

    if (typeof cardsScrollContainer.startViewTransition === 'function' && !prefersReducedMotion) {
      cardsScrollContainer.startViewTransition(function () {
        performClosePreview();
      }).finished.finally(finishTransition);
      return;
    }

    if (prefersReducedMotion || typeof document.startViewTransition !== 'function') {
      performClosePreview();
      finishTransition();
      return;
    }

    document.startViewTransition(function () {
      performClosePreview();
    }).finished.finally(finishTransition);
  }

  function performClosePreview() {
    if (!previewState.isOpen) return;

    var cardEl = previewState.activeCard;
    var previewBtn = cardEl && cardEl.querySelector('.card-btn--preview');
    var triggerElement = previewState.triggerElement;
    var wasModal = previewState.isModal;
    var pageScrollX = window.scrollX;
    var pageScrollY = window.scrollY;
    // Use activeArrayIndex for correct card data lookup from original array
    var cardData = cards[previewState.activeArrayIndex];

    if (previewBtn) {
      previewBtn.textContent = 'Preview';
      previewBtn.setAttribute('aria-label', 'Preview ' + (cardData ? cardData.title : ''));
      previewBtn.classList.remove('is-close');
    }

    previewState.previewPanel.classList.remove('is-open');
    if (previewState.previewPanel.open) previewState.previewPanel.close();

    if (cardEl) {
      cardEl.classList.remove('is-preview-active', 'becoming-active');
      cardEl.removeAttribute('aria-expanded');
    }
    if (triggerElement) triggerElement.removeAttribute('aria-expanded');

    if (!wasModal) restoreOriginalCardOrder();
    projectsLayout.classList.remove('preview-open');
    grid.classList.remove('preview-open');

    previewState.isOpen = false;
    previewState.isModal = false;
    previewState.activeIndex = -1;
    previewState.activeArrayIndex = -1;
    previewState.activeCard = null;
    previewState.triggerElement = null;
    if (!wasModal) {
      cardsScrollContainer.scrollTop = 0;
      cardsScrollContainer.style.height = '';
      requestAnimationFrame(function () {
        window.scrollTo(pageScrollX, pageScrollY);
      });
    }
    if (!wasModal && triggerElement && triggerElement.isConnected) {
      triggerElement.focus({ preventScroll: true });
    } else if (!wasModal && previewBtn) {
      previewBtn.focus({ preventScroll: true });
    }
    resumeAutoToggle();
  }

  function handlePreviewBreakpointChange() {
    if (previewState.isOpen) closePreview();
  }

  window.addEventListener('resize', function () {
    if (previewState.isOpen) updatePreviewCardsHeight();
  });

  if (mobilePreviewQuery.addEventListener) {
    mobilePreviewQuery.addEventListener('change', handlePreviewBreakpointChange);
  } else if (mobilePreviewQuery.addListener) {
    mobilePreviewQuery.addListener(handlePreviewBreakpointChange);
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
      img.decoding = 'async';
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
    if (previewState.isOpen && !previewState.isModal) {
      closePreview();
    } else if (!previewState.isOpen) {
      closeModal();
    }
  });

  render();
  resumeAutoToggle();
});
