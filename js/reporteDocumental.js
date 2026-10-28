(function () {
  'use strict';

  var DATA_URL = 'data/reporte-documental.json';
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c/gviz/tq';
  var charts = {};
  var records = [];
  var liveDataActive = false;
  var refreshInProgress = false;
  var dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Costa_Rica',
    dateStyle: 'medium'
  });
  var theme = {
    text: '#1c2e30',
    muted: '#5a7375',
    grid: 'rgba(69, 122, 126, 0.12)',
    primary: '#457a7e',
    secondary: '#7fccd0',
    warning: '#d39a1f',
    danger: '#d9534f'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function formatNumber(value, digits) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) return '—';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits === undefined ? 0 : digits
    }).format(numeric);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function localDate(value) {
    var parts = String(value).split('-').map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12));
  }

  function formatTimestamp(value, live) {
    if (!value) return 'Waiting for the first scheduled refresh';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Refresh timestamp unavailable';
    return (live ? 'Live update ' : 'Cached ') + dateFormat.format(date) + ' · ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Costa_Rica'
      }) + ' Costa Rica time';
  }

  function setMessage(message, isError) {
    var element = byId('rd-dashboard-message');
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('is-error', Boolean(isError));
    element.hidden = !message;
  }

  function showError(error) {
    var message = error && error.message ? error.message : 'Unknown data error.';
    setMessage('Dashboard data could not be loaded: ' + message, true);
    var badge = byId('rd-data-badge');
    if (badge) {
      badge.innerHTML = '<span class="rd-data-dot" aria-hidden="true"></span>Data unavailable';
      badge.classList.remove('is-live');
    }
    console.error('[Operational KPI dashboard]', error);
  }

  function currentRecords() {
    var from = byId('rd-date-from').value;
    var to = byId('rd-date-to').value;
    var type = byId('rd-type-filter').value;
    return records.filter(function (record) {
      return (!from || record.date >= from) &&
        (!to || record.date <= to) &&
        (type === 'all' || record.type === type);
    });
  }

  function summarize(selected) {
    return selected.reduce(function (summary, record) {
      summary.recordCount += record.recordCount;
      summary.timedRecordCount += record.timedRecordCount;
      summary.processingMinutes += record.processingMinutes;
      summary.lateCorrections += record.lateCorrections;
      summary.lateErrors += record.lateErrors;
      summary.fQuantity += record.fQuantity;
      summary.plQuantity += record.plQuantity;
      summary.apportionmentQ += record.apportionmentQ;
      summary.lateApportionment += record.lateApportionment;
      summary.changesPkgsWeightFreight += record.changesPkgsWeightFreight;
      return summary;
    }, {
      recordCount: 0,
      timedRecordCount: 0,
      processingMinutes: 0,
      lateCorrections: 0,
      lateErrors: 0,
      fQuantity: 0,
      plQuantity: 0,
      apportionmentQ: 0,
      lateApportionment: 0,
      changesPkgsWeightFreight: 0
    });
  }

  function renderMeta(meta, live) {
    var badge = byId('rd-data-badge');
    if (badge) {
      badge.innerHTML = '<span class="rd-data-dot" aria-hidden="true"></span>' +
        (live ? 'Live sheet data' : (meta.generatedAt ? 'Cached aggregate data' : 'Cache pending'));
      badge.classList.toggle('is-live', live || Boolean(meta.generatedAt));
    }
    byId('rd-updated').textContent = formatTimestamp(meta.generatedAt, live);
    if (!records.length) {
      setMessage('No cached records yet. The scheduled Google Sheets refresh will populate this dashboard.', false);
    } else {
      setMessage('', false);
    }
  }

  function populateTypeFilter() {
    var select = byId('rd-type-filter');
    var selectedType = select.value;
    var types = Array.from(new Set(records.map(function (record) {
      return record.type;
    }))).sort();
    select.innerHTML = '<option value="all">All types</option>' + types.map(function (type) {
      return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>';
    }).join('');
    select.value = types.indexOf(selectedType) === -1 ? 'all' : selectedType;
  }

  function parseGvizDate(value) {
    if (typeof value !== 'string') {
      throw new Error('The live sheet returned a date in an unsupported format.');
    }
    var match = value.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})/);
    if (match) {
      return match[1] + '-' + String(Number(match[2]) + 1).padStart(2, '0') + '-' +
        String(Number(match[3])).padStart(2, '0');
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      return match[3] + '-' + match[2].padStart(2, '0') + '-' + match[1].padStart(2, '0');
    }
    throw new Error('The live sheet returned an invalid date.');
  }

  function parseGvizTime(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value === 0 ? null : (value % 1) * 1440;
    }
    if (typeof value !== 'string') throw new Error('The live sheet returned an invalid time.');
    var match = value.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,(\d{1,2}))?(?:,(\d{1,2}))?(?:,(\d{1,2}))?/);
    if (match) {
      if (Number(match[1]) === 1899 && Number(match[2]) === 11 && Number(match[3]) === 30 &&
          !match[4] && !match[5] && !match[6]) return null;
      return Number(match[4] || 0) * 60 + Number(match[5] || 0) + Number(match[6] || 0) / 60;
    }
    match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match) return Number(match[1]) * 60 + Number(match[2]) + Number(match[3] || 0) / 60;
    throw new Error('The live sheet returned an unsupported time format.');
  }

  function parseGvizNumber(value, column) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      var dateMatch = value.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})/);
      if (dateMatch) {
        var dateValue = Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]), Number(dateMatch[3]));
        var sheetEpoch = Date.UTC(1899, 11, 30);
        return Math.round((dateValue - sheetEpoch) / 86400000);
      }
      var numeric = Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
    throw new Error('The live sheet returned an invalid value in ' + column + '.');
  }

  function aggregateLiveSheet(response) {
    var jsonStart = response.indexOf('{');
    var jsonEnd = response.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      throw new Error('Google Sheets returned an unreadable response.');
    }
    var payload = JSON.parse(response.slice(jsonStart, jsonEnd + 1));
    if (payload.status !== 'ok' || !payload.table || !Array.isArray(payload.table.rows)) {
      throw new Error('Google Sheets could not return the live data.');
    }

    var aggregates = {};
    var columns = [
      'lateCorrections',
      'lateErrors',
      'fQuantity',
      'plQuantity',
      'apportionmentQ',
      'lateApportionment',
      'changesPkgsWeightFreight'
    ];
    payload.table.rows.forEach(function (row) {
      var cells = row.c || [];
      var dateCell = cells[0] && cells[0].v;
      var typeCell = cells[1] && cells[1].v;
      if (!dateCell && !typeCell) return;
      if (!dateCell || typeof typeCell !== 'string' || !typeCell.trim()) {
        throw new Error('A live sheet row is missing its date or type.');
      }

      var date = parseGvizDate(dateCell);
      var type = typeCell.trim();
      var key = date + '\u0000' + type;
      if (!aggregates[key]) {
        aggregates[key] = {
          date: date,
          type: type,
          recordCount: 0,
          timedRecordCount: 0,
          processingMinutes: 0,
          lateCorrections: 0,
          lateErrors: 0,
          fQuantity: 0,
          plQuantity: 0,
          apportionmentQ: 0,
          lateApportionment: 0,
          changesPkgsWeightFreight: 0
        };
      }

      var aggregate = aggregates[key];
      aggregate.recordCount += 1;
      var start = parseGvizTime(cells[2] && cells[2].v);
      var end = parseGvizTime(cells[3] && cells[3].v);
      if (start !== null && end !== null) {
        var duration = end - start;
        if (duration < 0) duration += 1440;
        aggregate.processingMinutes += duration;
        aggregate.timedRecordCount += 1;
      }
      columns.forEach(function (column, index) {
        aggregate[column] += parseGvizNumber(cells[index + 4] && cells[index + 4].v, column);
      });
    });

    return Object.keys(aggregates).sort().map(function (key) {
      return aggregates[key];
    });
  }

  function refreshFromSheet() {
    if (refreshInProgress) return;
    refreshInProgress = true;
    var button = byId('rd-refresh');
    var buttonLabel = button.querySelector('span');
    button.disabled = true;
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = 'Refreshing…';
    setMessage('Getting the latest aggregate data from Google Sheets…', false);

    var query = 'select A,C,D,E,F,G,H,I,J,K,L';
    var url = SHEET_URL + '?tqx=out%3Ajson&sheet=hojaPublica&tq=' + encodeURIComponent(query);
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 30000);

    fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Google Sheets returned HTTP ' + response.status + '.');
        return response.text();
      })
      .then(function (responseText) {
        var liveRecords = aggregateLiveSheet(responseText);
        records = liveRecords;
        liveDataActive = true;
        populateTypeFilter();
        renderMeta({
          generatedAt: new Date().toISOString()
        }, true);
        render();
        setMessage('Showing the latest Google Sheets data. IDs and shipment details are not loaded into the dashboard.', false);
      })
      .catch(function (error) {
        var message = error && error.name === 'AbortError'
          ? 'The Google Sheets refresh timed out. The current dashboard data was kept.'
          : 'Live refresh failed. The current dashboard data was kept. ' +
            (error && error.message ? error.message : 'Check the sheet sharing settings and try again.');
        setMessage(message, true);
        console.error('[Operational KPI dashboard] Live refresh failed.', error);
      })
      .finally(function () {
        window.clearTimeout(timeout);
        button.disabled = false;
        button.classList.remove('is-loading');
        button.removeAttribute('aria-busy');
        buttonLabel.textContent = 'Refresh data';
        refreshInProgress = false;
      });
  }

  function renderKpis(selected) {
    var summary = summarize(selected);
    var averageMinutes = summary.timedRecordCount
      ? summary.processingMinutes / summary.timedRecordCount
      : null;
    var typeGroups = groupByType(selected);
    var highestRateType = Object.keys(typeGroups).sort(function (left, right) {
      var leftGroup = typeGroups[left];
      var rightGroup = typeGroups[right];
      var leftRate = (leftGroup.lateErrors + leftGroup.lateCorrections) / leftGroup.recordCount;
      var rightRate = (rightGroup.lateErrors + rightGroup.lateCorrections) / rightGroup.recordCount;
      return rightRate - leftRate;
    })[0];
    var highestRate = highestRateType
      ? (typeGroups[highestRateType].lateErrors + typeGroups[highestRateType].lateCorrections) /
        typeGroups[highestRateType].recordCount * 100
      : null;
    var items = [
      { label: 'Records', value: formatNumber(summary.recordCount), note: 'Aggregated rows' },
      { label: 'Avg. processing time', value: averageMinutes === null ? '—' : formatNumber(averageMinutes, 1) + ' min', note: 'Start to end' },
      { label: 'Late errors', value: formatNumber(summary.lateErrors), note: 'Total events', tone: 'danger' },
      { label: 'Late corrections', value: formatNumber(summary.lateCorrections), note: 'Total events', tone: 'warning' },
      { label: 'Invoices', value: formatNumber(summary.fQuantity), note: 'fQuantity' },
      { label: 'Packing lists', value: formatNumber(summary.plQuantity), note: 'plQuantity' },
      { label: 'Apportionments', value: formatNumber(summary.apportionmentQ), note: 'apportionmentQ' },
      { label: 'Late apportionment', value: formatNumber(summary.lateApportionment), note: 'Total cases', tone: 'warning' },
      {
        label: 'Highest error + correction rate',
        value: highestRateType || '—',
        note: highestRate === null ? 'No records' : formatNumber(highestRate, 1) + ' events per 100 records'
      }
    ];

    byId('rd-kpis').innerHTML = items.map(function (item) {
      return '<article class="rd-kpi' + (item.tone ? ' rd-kpi--' + item.tone : '') + '">' +
        '<span class="rd-kpi-label">' + escapeHtml(item.label) + '</span>' +
        '<strong class="rd-kpi-value">' + escapeHtml(item.value) + '</strong>' +
        '<span class="rd-kpi-hint">' + escapeHtml(item.note) + '</span>' +
      '</article>';
    }).join('');
  }

  function groupByType(selected) {
    var groups = {};
    selected.forEach(function (record) {
      if (!groups[record.type]) {
        groups[record.type] = {
          recordCount: 0,
          timedRecordCount: 0,
          processingMinutes: 0,
          lateCorrections: 0,
          lateErrors: 0,
          lateApportionment: 0
        };
      }
      var group = groups[record.type];
      group.recordCount += record.recordCount;
      group.timedRecordCount += record.timedRecordCount;
      group.processingMinutes += record.processingMinutes;
      group.lateCorrections += record.lateCorrections;
      group.lateErrors += record.lateErrors;
      group.lateApportionment += record.lateApportionment;
    });
    return groups;
  }

  function periodKey(date, period) {
    if (period === 'month') return date.slice(0, 7);
    var value = localDate(date);
    var day = value.getUTCDay() || 7;
    value.setUTCDate(value.getUTCDate() - day + 1);
    return value.toISOString().slice(0, 10);
  }

  function buildChart(canvasId, config) {
    var canvas = byId(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    charts[canvasId] = new Chart(canvas, config);
  }

  function chartOptions(extra) {
    var options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: theme.muted,
            usePointStyle: true,
            boxWidth: 8,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: document.documentElement.classList.contains('dark-mode') ? '#112225' : '#ffffff',
          titleColor: theme.text,
          bodyColor: theme.muted,
          borderColor: theme.grid,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: theme.grid },
          ticks: { color: theme.muted, maxRotation: 0, autoSkip: true }
        },
        y: {
          beginAtZero: true,
          grid: { color: theme.grid },
          ticks: { color: theme.muted }
        }
      }
    };
    return Object.assign(options, extra || {});
  }

  function renderCharts(selected) {
    Object.keys(charts).forEach(function (key) {
      charts[key].destroy();
    });
    charts = {};
    if (typeof Chart === 'undefined') {
      showError(new Error('Chart.js is unavailable. Check the network connection and reload.'));
      return;
    }

    var byType = groupByType(selected);
    var types = Object.keys(byType).sort();
    var timeTypes = types.filter(function (type) {
      return byType[type].timedRecordCount > 0;
    });
    var timeData = timeTypes.map(function (type) {
      var item = byType[type];
      return item.processingMinutes / item.timedRecordCount;
    });
    var qualityDenominators = types.map(function (type) {
      return byType[type].recordCount || 1;
    });

    buildChart('rd-time-chart', {
      type: 'bar',
      data: {
        labels: timeTypes,
        datasets: [{
          label: 'Average minutes',
          data: timeData,
          backgroundColor: theme.primary,
          borderRadius: 6
        }]
      },
      options: chartOptions({
        plugins: Object.assign(chartOptions().plugins, {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) { return formatNumber(context.parsed.y, 1) + ' min'; }
            }
          }
        }),
        scales: {
          x: { grid: { display: false }, ticks: { color: theme.muted } },
          y: { beginAtZero: true, title: { display: true, text: 'Minutes', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
        }
      })
    });

    buildChart('rd-quality-chart', {
      type: 'bar',
      data: {
        labels: types,
        datasets: [
          {
            label: 'Late errors / 100 records',
            data: types.map(function (type, index) {
              return byType[type].lateErrors / qualityDenominators[index] * 100;
            }),
            backgroundColor: theme.danger,
            borderRadius: 5
          },
          {
            label: 'Late corrections / 100 records',
            data: types.map(function (type, index) {
              return byType[type].lateCorrections / qualityDenominators[index] * 100;
            }),
            backgroundColor: theme.warning,
            borderRadius: 5
          }
        ]
      },
      options: chartOptions({
        scales: {
          x: { grid: { display: false }, ticks: { color: theme.muted } },
          y: { beginAtZero: true, title: { display: true, text: 'Events per 100 records', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
        }
      })
    });

    var period = byId('rd-period-group').value;
    var volumes = {};
    selected.forEach(function (record) {
      var key = periodKey(record.date, period);
      if (!volumes[key]) volumes[key] = { invoices: 0, packingLists: 0 };
      volumes[key].invoices += record.fQuantity;
      volumes[key].packingLists += record.plQuantity;
    });
    var periods = Object.keys(volumes).sort();

    buildChart('rd-volume-chart', {
      type: 'line',
      data: {
        labels: periods.map(function (value) {
          return period === 'month' ? value : dateFormat.format(localDate(value));
        }),
        datasets: [
          {
            label: 'Invoices (fQuantity)',
            data: periods.map(function (value) { return volumes[value].invoices; }),
            borderColor: theme.primary,
            backgroundColor: theme.primary,
            tension: 0.25
          },
          {
            label: 'Packing lists (plQuantity)',
            data: periods.map(function (value) { return volumes[value].packingLists; }),
            borderColor: theme.secondary,
            backgroundColor: theme.secondary,
            tension: 0.25
          }
        ]
      },
      options: chartOptions({
        scales: {
          x: { grid: { display: false }, ticks: { color: theme.muted } },
          y: { beginAtZero: true, title: { display: true, text: 'Quantity', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
        }
      })
    });

    buildChart('rd-apportionment-chart', {
      type: 'bar',
      data: {
        labels: types,
        datasets: [{
          label: 'Late apportionment cases',
          data: types.map(function (type) { return byType[type].lateApportionment; }),
          backgroundColor: theme.warning,
          borderRadius: 6
        }]
      },
      options: chartOptions({
        plugins: Object.assign(chartOptions().plugins, { legend: { display: false } }),
        scales: {
          x: { grid: { display: false }, ticks: { color: theme.muted } },
          y: { beginAtZero: true, title: { display: true, text: 'Cases', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted, precision: 0 } }
        }
      })
    });

    var points = selected.filter(function (record) {
      return record.timedRecordCount && record.recordCount;
    }).map(function (record) {
      return {
        x: record.changesPkgsWeightFreight / record.recordCount,
        y: record.processingMinutes / record.timedRecordCount,
        type: record.type,
        date: record.date,
        count: record.recordCount
      };
    });
    var scatterDatasets = types.map(function (type, index) {
      return {
        label: type,
        data: points.filter(function (point) { return point.type === type; }),
        backgroundColor: index % 2 ? theme.secondary : theme.primary,
        pointRadius: 5,
        pointHoverRadius: 7
      };
    });

    buildChart('rd-complexity-chart', {
      type: 'scatter',
      data: { datasets: scatterDatasets },
      options: chartOptions({
        plugins: {
          legend: { labels: { color: theme.muted, usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: {
              label: function (context) {
                var point = context.raw;
                return point.type + ' · ' + point.date + ': complexity ' +
                  formatNumber(point.x, 1) + ', ' + formatNumber(point.y, 1) +
                  ' min (' + formatNumber(point.count) + ' aggregated records)';
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Average changesPkgsWeightFreight', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } },
          y: { title: { display: true, text: 'Average processing minutes', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
        }
      })
    });
  }

  function render() {
    var selected = currentRecords();
    renderKpis(selected);
    renderCharts(selected);
    if (records.length && !selected.length) {
      setMessage('No aggregate records match these filters.', false);
    } else if (records.length) {
      setMessage('', false);
    }
  }

  function bindFilters() {
    ['rd-date-from', 'rd-date-to', 'rd-type-filter', 'rd-period-group'].forEach(function (id) {
      byId(id).addEventListener('change', render);
    });
    byId('rd-date-from').addEventListener('change', function () {
      var to = byId('rd-date-to');
      to.min = byId('rd-date-from').value;
    });
    byId('rd-date-to').addEventListener('change', function () {
      var from = byId('rd-date-from');
      from.max = byId('rd-date-to').value;
    });
  }

  function updateTheme() {
    var dark = document.documentElement.classList.contains('dark-mode');
    theme.text = dark ? '#e2f0f1' : '#1c2e30';
    theme.muted = dark ? '#9ab0b3' : '#5a7375';
    theme.grid = dark ? 'rgba(127, 204, 208, 0.15)' : 'rgba(69, 122, 126, 0.12)';
    theme.primary = dark ? '#7fccd0' : '#457a7e';
    theme.secondary = dark ? '#4b9297' : '#7fccd0';
    theme.warning = dark ? '#f5c451' : '#d39a1f';
    theme.danger = dark ? '#ff7b72' : '#d9534f';
    if (records.length && typeof Chart !== 'undefined') render();
  }

  function init() {
    byId('rd-refresh').addEventListener('click', refreshFromSheet);
    bindFilters();
    if (window.MutationObserver) {
      new MutationObserver(updateTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    fetch(DATA_URL, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Cached data returned HTTP ' + response.status + '.');
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.records)) {
          throw new Error('The cache file has an invalid format.');
        }
        records = data.records;
        if (records.some(function (record) {
          return !record.date || !record.type || !Number.isFinite(Number(record.recordCount));
        })) {
          throw new Error('The cache contains an invalid aggregate record.');
        }
        if (liveDataActive) return;
        renderMeta(data.meta || {});
        populateTypeFilter();
        render();
      })
      .catch(function (error) {
        if (!liveDataActive) showError(error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
