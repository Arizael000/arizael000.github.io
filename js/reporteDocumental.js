(function () {
  'use strict';

  var DATA_URL = 'data/reporte-documental.json';
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c/gviz/tq';
  var charts = {};
  var records = [];
  var cases = [];
  var selectedCaseNumber = null;
  var selectedDurationKey = null;
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

  function currentCases() {
    var from = byId('rd-date-from').value;
    var to = byId('rd-date-to').value;
    var type = byId('rd-type-filter').value;
    var invoiceFrom = byId('rd-invoice-from').value;
    var invoiceTo = byId('rd-invoice-to').value;
    var minimumInvoices = invoiceFrom === '' ? 0 : Number(invoiceFrom);
    var maximumInvoices = invoiceTo === '' ? Infinity : Number(invoiceTo);
    if (minimumInvoices > maximumInvoices) return [];
    return cases.filter(function (record) {
      return (!from || record.date >= from) &&
        (!to || record.date <= to) &&
        (type === 'all' || record.type === type) &&
        record.invoiceCount >= minimumInvoices &&
        record.invoiceCount <= maximumInvoices;
    });
  }

  function formatCaseTime(value) {
    if (value === null || value === undefined) return '—';
    var totalMinutes = Math.round(value) % 1440;
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
  }

  function formatDuration(minutes) {
    if (minutes === null || minutes === undefined || !Number.isFinite(Number(minutes))) return '—';
    var totalMinutes = Math.round(Number(minutes));
    var hours = Math.floor(totalMinutes / 60);
    var remainder = totalMinutes % 60;
    return hours ? hours + ' h ' + remainder + ' min' : remainder + ' min';
  }

  function durationGroupKey(minutes) {
    return String(Math.round(Number(minutes) * 60));
  }

  function formatTimelineTick(value) {
    var date = new Date(Number(value) * 60000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC'
    });
  }

  function summarize(selected) {
    return selected.reduce(function (summary, record) {
      summary.recordCount += record.recordCount;
      summary.timedRecordCount += record.timedRecordCount;
      summary.processingMinutes += record.processingMinutes;
      summary.overlappingStartCount += Number(record.overlappingStartCount) || 0;
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
      overlappingStartCount: 0,
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
      var first = Number(match[1]);
      var second = Number(match[2]);
      var month = first > 12 ? second : first;
      var day = first > 12 ? first : second;
      if (first <= 12 && second <= 12) {
        month = second;
        day = first;
      }
      return match[3] + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }
    throw new Error('The live sheet returned an invalid date.');
  }

  function parseGvizTime(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return normalizeWorkingTime((value % 1) * 1440);
    }
    if (typeof value !== 'string') throw new Error('The live sheet returned an invalid time.');
    var match = value.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,(\d{1,2}))?(?:,(\d{1,2}))?(?:,(\d{1,2}))?/);
    if (match) {
      if (Number(match[1]) === 1899 && Number(match[2]) === 11 && Number(match[3]) === 30 &&
          !match[4] && !match[5] && !match[6]) return null;
      return normalizeWorkingTimeParts(
        Number(match[4] || 0),
        Number(match[5] || 0),
        Number(match[6] || 0)
      );
    }
    match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match) {
      return normalizeWorkingTimeParts(
        Number(match[1]),
        Number(match[2]),
        Number(match[3] || 0)
      );
    }
    throw new Error('The live sheet returned an unsupported time format.');
  }

  function normalizeWorkingTimeParts(hours, minutes, seconds) {
    if (hours > 23 || minutes > 59 || seconds > 59) {
      throw new Error('The live sheet returned an invalid time value.');
    }
    return normalizeWorkingTime(hours * 60 + minutes + seconds / 60);
  }

  function normalizeWorkingTime(minutes) {
    if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) {
      throw new Error('The live sheet returned an invalid time value.');
    }
    if (minutes < 8 * 60) minutes += 12 * 60;
    if (minutes < 8 * 60 || minutes > 18 * 60) {
      throw new Error('The live sheet returned a time outside the expected 08:00–18:00 workday.');
    }
    return minutes;
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

    var latestById = Object.create(null);
    var idOrder = [];
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
      var idCell = cells[1] && cells[1].v;
      var typeCell = cells[2] && cells[2].v;
      if (!dateCell && !idCell && !typeCell) return;
      if (!dateCell || idCell === null || idCell === undefined || String(idCell).trim() === '' ||
          typeof typeCell !== 'string' || !typeCell.trim()) {
        throw new Error('A live sheet row is missing its date, id, or type.');
      }

      var date = parseGvizDate(dateCell);
      var type = typeCell.trim();
      var start = parseGvizTime(cells[3] && cells[3].v);
      var end = parseGvizTime(cells[4] && cells[4].v);
      var duration = null;
      if (start !== null && end !== null) {
        duration = end - start;
        if (duration < 0) duration += 1440;
      }
      var record = {
        date: date,
        type: type,
        startMinute: start,
        endMinute: end,
        processingMinutes: duration
      };
      columns.forEach(function (column, index) {
        record[column] = parseGvizNumber(cells[index + 5] && cells[index + 5].v, column);
      });
      var identifier = String(idCell).trim();
      if (!Object.prototype.hasOwnProperty.call(latestById, identifier)) idOrder.push(identifier);
      latestById[identifier] = record;
    });

    var normalized = idOrder.map(function (id) {
      return latestById[id];
    });
    normalized.sort(function (left, right) {
      var leftStart = left.startMinute === null ? Infinity : left.startMinute;
      var rightStart = right.startMinute === null ? Infinity : right.startMinute;
      return left.date.localeCompare(right.date) ||
        leftStart - rightStart ||
        left.type.localeCompare(right.type);
    });
    var events = [];
    normalized.forEach(function (record) {
      if (record.startMinute === null) return;
      var dateParts = record.date.split('-').map(Number);
      var startAt = Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]) / 60000 +
        record.startMinute;
      events.push({ time: startAt, isStart: true, record: record });
      if (record.processingMinutes !== null && record.processingMinutes > 0) {
        events.push({
          time: startAt + record.processingMinutes,
          isStart: false,
          record: record
        });
      }
    });
    events.sort(function (left, right) {
      return left.time - right.time || Number(left.isStart) - Number(right.isStart);
    });
    var activeCount = 0;
    var eventIndex = 0;
    while (eventIndex < events.length) {
      var timeAt = events[eventIndex].time;
      var endCount = 0;
      var starts = [];
      while (eventIndex < events.length && events[eventIndex].time === timeAt) {
        if (events[eventIndex].isStart) starts.push(events[eventIndex].record);
        else endCount += 1;
        eventIndex += 1;
      }
      activeCount -= endCount;
      var activeStarts = starts.filter(function (record) {
        return record.processingMinutes !== null && record.processingMinutes > 0;
      }).length;
      starts.forEach(function (record) {
        var isActive = record.processingMinutes !== null && record.processingMinutes > 0;
        if (activeCount + activeStarts - Number(isActive) > 0) {
          record.startedDuringAnother = true;
        }
      });
      activeCount += activeStarts;
    }

    var aggregates = {};
    normalized.forEach(function (record) {
      var key = record.date + '\u0000' + record.type;
      if (!aggregates[key]) {
        aggregates[key] = {
          date: record.date,
          type: record.type,
          recordCount: 0,
          timedRecordCount: 0,
          processingMinutes: 0,
          overlappingStartCount: 0,
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
      if (record.processingMinutes !== null) {
        aggregate.processingMinutes += record.processingMinutes;
        aggregate.timedRecordCount += 1;
      }
      if (record.startedDuringAnother) aggregate.overlappingStartCount += 1;
      columns.forEach(function (column) {
        aggregate[column] += record[column];
      });
    });
    var publicCases = normalized.map(function (record, index) {
      return {
        caseNumber: 'Case ' + String(index + 1).padStart(3, '0'),
        date: record.date,
        type: record.type,
        startMinute: record.startMinute,
        endMinute: record.endMinute,
        durationMinutes: record.processingMinutes,
        invoiceCount: record.fQuantity,
        packingListCount: record.plQuantity,
        overlapsWith: []
      };
    });
    var caseStartTimes = publicCases.map(function (record) {
      if (record.startMinute === null || record.durationMinutes === null) return null;
      var dateParts = record.date.split('-').map(Number);
      return Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]) / 60000 +
        record.startMinute;
    });
    publicCases.forEach(function (record, index) {
      var startAt = caseStartTimes[index];
      var duration = record.durationMinutes;
      if (startAt === null || duration === null || duration <= 0) return;
      var endAt = startAt + duration;
      for (var otherIndex = index + 1; otherIndex < publicCases.length; otherIndex += 1) {
        var otherStart = caseStartTimes[otherIndex];
        var otherDuration = publicCases[otherIndex].durationMinutes;
        if (otherStart === null || otherDuration === null || otherDuration <= 0) continue;
        if (Math.max(startAt, otherStart) < Math.min(endAt, otherStart + otherDuration)) {
          record.overlapsWith.push(publicCases[otherIndex].caseNumber);
          publicCases[otherIndex].overlapsWith.push(record.caseNumber);
        }
      }
    });
    return {
      records: Object.keys(aggregates).sort().map(function (key) {
        return aggregates[key];
      }),
      cases: publicCases
    };
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

    var query = 'select A,B,C,D,E,F,G,H,I,J,K,L';
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
        var liveData = aggregateLiveSheet(responseText);
        records = liveData.records;
        cases = liveData.cases;
        liveDataActive = true;
        populateTypeFilter();
        renderMeta({
          generatedAt: new Date().toISOString()
        }, true);
        render();
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
    var averageHours = summary.timedRecordCount
      ? summary.processingMinutes / summary.timedRecordCount / 60
      : null;
    var overlapCount = summary.timedRecordCount ? formatNumber(summary.overlappingStartCount) : '—';
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
      { label: 'Avg. processing time per case', value: averageHours === null ? '—' : formatNumber(averageHours, 2) + ' h', note: 'Average elapsed time per timed case' },
      { label: 'Started during another case', value: overlapCount, note: 'Cases started while another was active' },
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
          overlappingStartCount: 0,
          lateCorrections: 0,
          lateErrors: 0,
          lateApportionment: 0
        };
      }
      var group = groups[record.type];
      group.recordCount += record.recordCount;
      group.timedRecordCount += record.timedRecordCount;
      group.processingMinutes += record.processingMinutes;
      group.overlappingStartCount += Number(record.overlappingStartCount) || 0;
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
      return item.processingMinutes / item.timedRecordCount / 60;
    });
    var qualityDenominators = types.map(function (type) {
      return byType[type].recordCount || 1;
    });

    buildChart('rd-time-chart', {
      type: 'bar',
      data: {
        labels: timeTypes,
        datasets: [{
          label: 'Average hours',
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
              label: function (context) { return formatNumber(context.parsed.y, 2) + ' h'; }
            }
          }
        }),
        scales: {
          x: { grid: { display: false }, ticks: { color: theme.muted } },
          y: { beginAtZero: true, title: { display: true, text: 'Hours', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
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
        y: record.processingMinutes / record.timedRecordCount / 60,
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
                  ' h (' + formatNumber(point.count) + ' aggregated records)';
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Average changesPkgsWeightFreight', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } },
          y: { title: { display: true, text: 'Average processing hours', color: theme.muted }, grid: { color: theme.grid }, ticks: { color: theme.muted } }
        }
      })
    });
  }

  function renderCaseTable(selectedCases) {
    var body = byId('rd-case-table-body');
    if (!selectedCases.length) {
      body.innerHTML = '<tr><td class="rd-empty" colspan="8">No cases match the selected filters.</td></tr>';
      return;
    }

    body.innerHTML = selectedCases.map(function (record) {
      var overlaps = record.overlapsWith.length
        ? record.overlapsWith.map(function (caseNumber) {
          return '<button class="rd-case-link" type="button" data-case-number="' +
            escapeHtml(caseNumber) + '" data-case-link>' + escapeHtml(caseNumber) + '</button>';
        }).join(', ')
        : '—';
      return '<tr class="' + (record.caseNumber === selectedCaseNumber ? 'is-selected' : '') + '">' +
        '<td><button class="rd-case-select" type="button" data-case-number="' +
          escapeHtml(record.caseNumber) + '">' + escapeHtml(record.caseNumber) + '</button></td>' +
        '<td class="rd-table-date">' + escapeHtml(record.date) + '</td>' +
        '<td>' + escapeHtml(record.type) + '</td>' +
        '<td>' + escapeHtml(formatCaseTime(record.startMinute)) + ' – ' +
          escapeHtml(formatCaseTime(record.endMinute)) + '</td>' +
        '<td>' + escapeHtml(formatDuration(record.durationMinutes)) + '</td>' +
        '<td>' + escapeHtml(formatNumber(record.invoiceCount)) + '</td>' +
        '<td>' + escapeHtml(formatNumber(record.packingListCount)) + '</td>' +
        '<td>' + overlaps + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderSelectedCase(selectedCases) {
    var selected = selectedCases.filter(function (record) {
      return record.caseNumber === selectedCaseNumber;
    })[0] || cases.filter(function (record) {
      return record.caseNumber === selectedCaseNumber;
    })[0];
    var panel = byId('rd-case-selected');
    if (!selected) {
      panel.innerHTML = '<i class="bx bx-pointer" aria-hidden="true"></i>' +
        '<p>Select a point in either chart or a case in the table to inspect its overlaps.</p>';
      return;
    }

    var overlapList = selected.overlapsWith.length
      ? selected.overlapsWith.map(function (caseNumber) {
        return '<button class="rd-case-link" type="button" data-case-number="' +
          escapeHtml(caseNumber) + '" data-case-link>' + escapeHtml(caseNumber) + '</button>';
      }).join(', ')
      : 'No overlapping cases';
    var selectedIndex = selectedCases.findIndex(function (record) {
      return record.caseNumber === selected.caseNumber;
    });
    var navigation = selectedIndex < 0 ? '' :
      '<div class="rd-case-navigation">' +
        '<button class="rd-case-nav-btn" type="button" data-case-step="-1"' +
          (selectedIndex === 0 ? ' disabled' : '') + '>Previous case</button>' +
        '<span>' + formatNumber(selectedIndex + 1) + ' of ' + formatNumber(selectedCases.length) + '</span>' +
        '<button class="rd-case-nav-btn" type="button" data-case-step="1"' +
          (selectedIndex === selectedCases.length - 1 ? ' disabled' : '') + '>Next case</button>' +
      '</div>';
    panel.innerHTML = '<div><span class="rd-case-detail-label">Selected case</span>' +
      '<strong>' + escapeHtml(selected.caseNumber) + ' · ' + escapeHtml(selected.type) + '</strong></div>' +
      '<div><span class="rd-case-detail-label">Date and interval</span>' +
      '<strong>' + escapeHtml(selected.date) + ' · ' + escapeHtml(formatCaseTime(selected.startMinute)) +
      ' – ' + escapeHtml(formatCaseTime(selected.endMinute)) + '</strong></div>' +
      '<div><span class="rd-case-detail-label">Elapsed time / invoices</span>' +
      '<strong>' + escapeHtml(formatDuration(selected.durationMinutes)) + ' · ' +
      escapeHtml(formatNumber(selected.invoiceCount)) + ' invoices</strong></div>' +
      '<div><span class="rd-case-detail-label">Overlaps with</span><strong>' + overlapList + '</strong></div>' +
      navigation;
  }

  function selectCase(caseNumber, selectedCases, resetDurationGroup) {
    if (!cases.some(function (record) {
      return record.caseNumber === caseNumber;
    })) return;
    if (resetDurationGroup) selectedDurationKey = null;
    selectedCaseNumber = caseNumber;
    renderCaseAnalysis(currentCases());
  }

  function renderCaseAnalysis(selectedCases) {
    var durationGroupControl = byId('rd-group-duration');
    var groupedMode = durationGroupControl.checked;
    if (selectedDurationKey !== null && !selectedCases.some(function (record) {
      return record.durationMinutes !== null && durationGroupKey(record.durationMinutes) === selectedDurationKey;
    })) selectedDurationKey = null;
    var selectedGroup = selectedDurationKey === null ? selectedCases : selectedCases.filter(function (record) {
      return record.durationMinutes !== null && durationGroupKey(record.durationMinutes) === selectedDurationKey;
    });
    var selectedDurationCases = selectedGroup;
    var analysisCases = selectedDurationKey !== null ? selectedDurationCases : selectedCases;
    var timedCases = analysisCases.filter(function (record) {
      return record.durationMinutes !== null && record.startMinute !== null;
    });
    var chartCases = groupedMode || selectedDurationKey === null
      ? selectedCases.filter(function (record) {
        return record.durationMinutes !== null && record.startMinute !== null;
      })
      : timedCases;
    var totalMinutes = timedCases.reduce(function (total, record) {
      return total + record.durationMinutes;
    }, 0);
    var averageHours = timedCases.length ? totalMinutes / timedCases.length / 60 : null;
    var totalInvoices = analysisCases.reduce(function (total, record) {
      return total + record.invoiceCount;
    }, 0);
    var overlappingCases = analysisCases.filter(function (record) {
      return record.overlapsWith.length > 0;
    }).length;
    var items = [
      { label: 'Cases with time', value: formatNumber(timedCases.length), note: 'Complete start and end times' },
      { label: 'Average per case', value: averageHours === null ? '—' : formatNumber(averageHours, 2) + ' h', note: 'Timed cases only' },
      { label: 'Total elapsed time', value: timedCases.length ? formatDuration(totalMinutes) : '—', note: 'Across timed cases' },
      { label: 'Invoices', value: formatNumber(totalInvoices), note: 'Sum of fQuantity' },
      { label: 'Cases in overlaps', value: formatNumber(overlappingCases), note: 'Cases with a shared time interval' }
    ];
    byId('rd-time-kpis').innerHTML = items.map(function (item) {
      return '<article class="rd-kpi"><span class="rd-kpi-label">' + escapeHtml(item.label) +
        '</span><strong class="rd-kpi-value">' + escapeHtml(item.value) +
        '</strong><span class="rd-kpi-hint">' + escapeHtml(item.note) + '</span></article>';
    }).join('');

    if (selectedDurationKey !== null && selectedCaseNumber &&
        !selectedDurationCases.some(function (record) {
          return record.caseNumber === selectedCaseNumber;
        })) selectedCaseNumber = selectedDurationCases.length ? selectedDurationCases[0].caseNumber : null;
    renderCaseTable(selectedDurationCases);
    renderSelectedCase(selectedDurationCases);
    byId('rd-clear-duration-group').hidden = selectedDurationKey === null;

    if (!selectedCases.length) {
      byId('rd-case-message').textContent = byId('rd-invoice-from').value !== '' &&
        byId('rd-invoice-to').value !== '' &&
        Number(byId('rd-invoice-from').value) > Number(byId('rd-invoice-to').value)
        ? 'The minimum invoice count must not exceed the maximum.'
        : (cases.length
        ? 'No cases match the selected date and type filters.'
        : 'No per-case data is available in this cache yet. Refresh data or run the scheduled cache update.');
      byId('rd-case-message').hidden = false;
    } else if (selectedDurationKey !== null) {
      byId('rd-case-message').textContent = 'Showing ' + formatNumber(selectedDurationCases.length) +
        ' cases with exactly ' + formatDuration(Number(selectedDurationKey) / 60) +
        ' elapsed time. Use Case Details to move through each case.';
      byId('rd-case-message').hidden = false;
    } else {
      byId('rd-case-message').textContent = timedCases.length
        ? 'Intervals are calculated from each date and start/end time. Red bars indicate shared time; filter invoices or group cases by exact elapsed duration.'
        : 'Case rows are available, but complete start/end times are missing.';
      byId('rd-case-message').hidden = false;
    }

    var timelineWrap = byId('rd-case-timeline-wrap');
    byId('rd-case-timeline-title').textContent = groupedMode
      ? 'Cases grouped by identical elapsed time'
      : 'Case overlap timeline';
    byId('rd-case-timeline-description').textContent = groupedMode
      ? 'Each bar counts cases with the exact same duration (to the nearest second). Select a bar to inspect those cases.'
      : 'Each bar is one case; red bars share time with another case. Select a bar for details.';
    timelineWrap.style.height = Math.max(300, Math.min(780, chartCases.length * 24)) + 'px';
    var sortedTimedCases = chartCases.slice().sort(function (left, right) {
      return left.date.localeCompare(right.date) ||
        left.startMinute - right.startMinute ||
        left.caseNumber.localeCompare(right.caseNumber);
    });
    if (groupedMode) {
      var durationGroups = {};
      sortedTimedCases.forEach(function (record) {
        var key = durationGroupKey(record.durationMinutes);
        if (!durationGroups[key]) durationGroups[key] = [];
        durationGroups[key].push(record);
      });
      var durationKeys = Object.keys(durationGroups).sort(function (left, right) {
        return Number(left) - Number(right);
      });
      buildChart('rd-case-timeline-chart', {
        type: 'bar',
        data: {
          labels: durationKeys.map(function (key) { return formatDuration(Number(key) / 60); }),
          datasets: [{
            label: 'Cases with identical duration',
            data: durationKeys.map(function (key) { return durationGroups[key].length; }),
            backgroundColor: durationKeys.map(function (key) {
              return key === selectedDurationKey ? theme.warning : theme.primary;
            }),
            borderRadius: 5
          }]
        },
        options: chartOptions({
          indexAxis: 'y',
          onClick: function (event, elements, chart) {
            var hits = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
            if (!hits.length) return;
            var key = durationKeys[hits[0].index];
            selectedDurationKey = key === selectedDurationKey ? null : key;
            selectedCaseNumber = selectedDurationKey && durationGroups[selectedDurationKey].length
              ? durationGroups[selectedDurationKey][0].caseNumber
              : null;
            render();
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) { return items[0].label + ' elapsed'; },
                label: function (context) {
                  var group = durationGroups[durationKeys[context.dataIndex]];
                  return [
                    formatNumber(group.length) + ' cases',
                    formatNumber(group.reduce(function (total, record) {
                      return total + record.invoiceCount;
                    }, 0)) + ' invoices',
                    'Select to see: ' + group.map(function (record) { return record.caseNumber; }).join(', ')
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Number of cases', color: theme.muted },
              ticks: { color: theme.muted, precision: 0 },
              grid: { color: theme.grid }
            },
            y: { grid: { display: false }, ticks: { color: theme.muted, autoSkip: false } }
          }
        })
      });
    } else {
    var timelinePoints = sortedTimedCases.map(function (record) {
      var dateParts = record.date.split('-').map(Number);
      var startAt = Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]) / 60000 +
        record.startMinute;
      return {
        x: [startAt, startAt + record.durationMinutes],
        y: record.caseNumber,
        caseNumber: record.caseNumber,
        date: record.date,
        type: record.type,
        startMinute: record.startMinute,
        endMinute: record.endMinute,
        durationMinutes: record.durationMinutes,
        invoiceCount: record.invoiceCount,
        overlapsWith: record.overlapsWith
      };
    });
    var allTimelineValues = timelinePoints.reduce(function (values, point) {
      values.push(point.x[0], point.x[1]);
      return values;
    }, []);
    var timelineMin = allTimelineValues.length ? Math.min.apply(Math, allTimelineValues) : undefined;
    var timelineMax = allTimelineValues.length ? Math.max.apply(Math, allTimelineValues) : undefined;
    var timelinePadding = allTimelineValues.length ? Math.max(10, (timelineMax - timelineMin) * 0.04) : 0;
    buildChart('rd-case-timeline-chart', {
      type: 'bar',
      data: {
        labels: sortedTimedCases.map(function (record) { return record.caseNumber; }),
        datasets: [{
          label: 'Processing interval',
          data: timelinePoints,
          backgroundColor: timelinePoints.map(function (point) {
            return point.caseNumber === selectedCaseNumber
              ? theme.warning
              : (point.overlapsWith.length ? theme.danger : theme.primary);
          }),
          borderRadius: 5,
          borderSkipped: false
        }]
      },
      options: chartOptions({
        indexAxis: 'y',
        onClick: function (event, elements, chart) {
          var hits = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (hits.length) selectCase(chart.data.labels[hits[0].index], selectedCases);
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) {
                var point = items[0].raw;
                return point.caseNumber + ' · ' + point.type + ' · ' + point.date;
              },
              label: function (context) {
                var point = context.raw;
                return [
                  'Interval: ' + formatCaseTime(point.startMinute) + ' – ' + formatCaseTime(point.endMinute),
                  'Elapsed: ' + formatDuration(point.durationMinutes),
                  'Invoices: ' + formatNumber(point.invoiceCount),
                  'Overlaps: ' + (point.overlapsWith.join(', ') || 'None')
                ];
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            min: timelineMin === undefined ? undefined : timelineMin - timelinePadding,
            max: timelineMax === undefined ? undefined : timelineMax + timelinePadding,
            title: { display: true, text: 'Date and time (Costa Rica local time)', color: theme.muted },
            ticks: {
              color: theme.muted,
              maxTicksLimit: 9,
              callback: function (value) { return formatTimelineTick(value); }
            },
            grid: { color: theme.grid }
          },
          y: {
            reverse: true,
            grid: { display: false },
            ticks: { color: theme.muted, autoSkip: false }
          }
        }
      })
    });
    }

    var comparisonPoints = chartCases.filter(function (record) {
      return record.durationMinutes !== null;
    }).map(function (record) {
      return {
        x: record.invoiceCount,
        y: record.durationMinutes / 60,
        caseNumber: record.caseNumber,
        date: record.date,
        type: record.type,
        invoiceCount: record.invoiceCount,
        durationMinutes: record.durationMinutes,
        overlapsWith: record.overlapsWith
      };
    });
    buildChart('rd-case-invoice-chart', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Cases',
          data: comparisonPoints,
          backgroundColor: comparisonPoints.map(function (point) {
            return point.caseNumber === selectedCaseNumber
              ? theme.warning
              : (point.overlapsWith.length ? theme.danger : theme.primary);
          }),
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: chartOptions({
        onClick: function (event, elements, chart) {
          var hits = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (hits.length) selectCase(chart.data.datasets[0].data[hits[0].index].caseNumber, selectedCases);
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                var point = context.raw;
                return point.caseNumber + ' · ' + point.type + ' · ' +
                  formatNumber(point.invoiceCount) + ' invoices · ' +
                  formatNumber(point.y, 2) + ' h' +
                  (point.overlapsWith.length ? ' · overlaps ' + point.overlapsWith.join(', ') : '');
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Invoices in each case', color: theme.muted },
            ticks: { color: theme.muted, precision: 0 },
            grid: { color: theme.grid }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Processing hours', color: theme.muted },
            ticks: { color: theme.muted },
            grid: { color: theme.grid }
          }
        }
      })
    });
  }

  function render() {
    var selected = currentRecords();
    var selectedCases = currentCases();
    var summary = summarize(selected);
    renderKpis(selected);
    renderCharts(selected);
    renderCaseAnalysis(selectedCases);
    if (records.length && !selected.length) {
      setMessage('No aggregate records match these filters.', false);
    } else if (records.length && !summary.timedRecordCount) {
      setMessage('No valid startTime/endTime pairs are available for the selected records. Time metrics are unavailable, not zero.', false);
    } else if (records.length) {
      setMessage('', false);
    }
  }

  function bindFilters() {
    ['rd-date-from', 'rd-date-to', 'rd-type-filter', 'rd-period-group'].forEach(function (id) {
      byId(id).addEventListener('change', function () {
        if (id !== 'rd-period-group') {
          selectedDurationKey = null;
          selectedCaseNumber = null;
        }
        render();
      });
    });
    byId('rd-date-from').addEventListener('change', function () {
      var to = byId('rd-date-to');
      to.min = byId('rd-date-from').value;
    });
    byId('rd-date-to').addEventListener('change', function () {
      var from = byId('rd-date-from');
      from.max = byId('rd-date-to').value;
    });
    ['rd-invoice-from', 'rd-invoice-to'].forEach(function (id) {
      byId(id).addEventListener('input', function () {
        selectedDurationKey = null;
        selectedCaseNumber = null;
        render();
      });
    });
    byId('rd-group-duration').addEventListener('change', render);
    byId('rd-clear-duration-group').addEventListener('click', function () {
      selectedDurationKey = null;
      selectedCaseNumber = null;
      render();
    });
    function handleCaseSelection(event) {
      var button = event.target.closest('button[data-case-number]');
      if (button) {
        selectCase(
          button.getAttribute('data-case-number'),
          currentCases(),
          button.hasAttribute('data-case-link')
        );
        return;
      }
      var navigationButton = event.target.closest('button[data-case-step]');
      var step = navigationButton && navigationButton.getAttribute('data-case-step');
      if (step) {
        var availableCases = currentCases();
        if (selectedDurationKey !== null) {
          availableCases = availableCases.filter(function (record) {
            return record.durationMinutes !== null &&
              durationGroupKey(record.durationMinutes) === selectedDurationKey;
          });
        }
        var selectedIndex = availableCases.findIndex(function (record) {
          return record.caseNumber === selectedCaseNumber;
        });
        var nextCase = availableCases[selectedIndex + Number(step)];
        if (nextCase) selectCase(nextCase.caseNumber, availableCases);
      }
    }
    byId('rd-case-table-body').addEventListener('click', handleCaseSelection);
    byId('rd-case-selected').addEventListener('click', handleCaseSelection);
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
        cases = Array.isArray(data.cases) ? data.cases : [];
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
