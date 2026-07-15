document.addEventListener('DOMContentLoaded', function () {
  var cards = [
    {
      title: 'Faulty Medical Devices (In progress)',
      group: 'Project',
      badge: 'Data Analysis',
      img: 'media/projects/medicalDevices.webp',
      character: 'media/projects/medicalDevices2.png',
      tags: ['Python', 'Pandas', 'Power BI'],
      link: 'https://github.com/Arizael000/faulty-mdevices',
      desc: 'Analysis of medical device failure reports with Pandas and Power BI'
    },
    {
      title: 'Demand Forecasting',
      group: 'Project',
      badge: 'Data Science',
      img: 'media/projects/LogisticForecast.jpg',
      character: 'media/projects/pronostic.jpg',
      tags: ['Python', 'Scikit-learn', 'Power BI'],
      link: 'https://github.com/Arizael000/logisticPrediction',
      desc: 'Time series forecasting using Scikit-learn with interactive dashboards that helped to avoid overstock and pronostic an 13% grow '
    },
    {
      title: 'QR Code Generator',
      group: 'Project',
      badge: 'Desktop solution',
      img: 'media/projects/proyecto-qr-generator-scan.webp',
      character: 'media/projects/proyecto-qr-generator-icono.webp',
      tags: ['Python', 'Tkinter', 'Pillow'],
      link: 'https://github.com/Arizael000/QR-Generator',
      desc: 'Desktop application for QR code generation and scanning with Tkinter.Helped to avoid payments in another plataforms creating static QR'
    },
    {
      title: 'QGIS Parameters Extraction',
      group: 'Project',
      badge: 'GIS / Analysis',
      img: 'media/projects/proyecto-qgis-params-fondo.webp',
      character: 'media/projects/proyecto-qgis-params-icono-raster.webp',
      tags: ['Python', 'QGIS', 'Raster'],
      link: 'https://github.com/Arizael000/Parameters-Extraction-in-QGIS',
      desc: 'Thesis work: Raster parameter extraction algorithms built for a QGIS plugin: HYDRO_PROCESS M-SALD. Automation of parameter extraction'
    },
    {
      title: 'Aside Dashboards Practice',
      group: 'Dashboard',
      badge: 'Power BI',
      img: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-1.webp',
      imgHover: 'media/dashboards/thumbs/dashboard-accidentes-eeuu-2.webp',
      imgFull: 'media/dashboards/dashboard-accidentes-eeuu-1.webp',
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
      tags: ['Power BI', 'Power Query', 'DAX'],
      isDashboard: true,
      desc: 'Performance tracking dashboards using Power BI and DAX for bussiness'
    }
  ];

  var grid = document.getElementById('projectsGrid');
  if (!grid) return;

  var modal = document.getElementById('dashModal');
  var modalImg = modal && modal.querySelector('img');
  var closeBtn = modal && modal.querySelector('.dash-modal-close');

  function render() {
    cards.forEach(function (card, idx) {
      var col = document.createElement('div');
      col.className = 'project-card';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'project-card-img';

      if (card.character) {
        col.classList.add('project-card--3d');

        var wrapper = document.createElement('div');
        wrapper.className = 'wrapper';

        var cover = document.createElement('img');
        cover.className = 'cover-image';
        cover.src = card.img;
        cover.alt = card.title;
        cover.loading = idx < 4 ? 'eager' : 'lazy';
        wrapper.appendChild(cover);
        imgWrap.appendChild(wrapper);

        var character = document.createElement('img');
        character.className = 'character';
        character.src = card.character;
        character.alt = card.title + ' overlay';
        character.loading = 'lazy';
        imgWrap.appendChild(character);
      } else if (card.imgHover) {
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

        if (card.isDashboard) {
          col.classList.add('project-card--dashboard');
        }
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

      var btn = document.createElement(card.isDashboard ? 'button' : 'a');
      btn.className = 'card-btn';
      if (card.isDashboard) {
        btn.textContent = 'View';
      } else {
        btn.href = card.link;
        btn.target = '_blank';
        btn.textContent = 'Code';
      }
      body.appendChild(btn);

      col.appendChild(body);
      grid.appendChild(col);
    });
  }

  function handleCardClick(e) {
    var cardEl = e.target.closest('.project-card');
    if (!cardEl) return;
    if (e.target.closest('a.card-btn')) return;

    var idx = Array.prototype.indexOf.call(grid.children, cardEl);
    var data = cards[idx];
    if (!data) return;

    if (data.isDashboard) {
      if (modal && modalImg) {
        var src = data.imgFull || data.img;
        modalImg.src = src;
        modalImg.alt = data.title;
        modal.classList.add('dash-modal--open');
      }
    } else if (data.link) {
      window.open(data.link, '_blank');
    }
  }
  grid.addEventListener('click', handleCardClick);

  function closeModal() {
    if (modal) modal.classList.remove('dash-modal--open');
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  render();
});
