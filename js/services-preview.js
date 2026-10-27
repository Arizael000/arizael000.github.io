document.addEventListener('DOMContentLoaded', function () {
  const chart = document.getElementById('order-histogram');
  const binControl = document.getElementById('histogram-bin-control');
  const binValue = document.getElementById('histogram-bin-value');
  const barsContainer = chart?.querySelector('.histogram-bars');
  const xAxis = chart?.querySelector('.histogram-x-axis');
  const selectionOutput = document.getElementById('histogram-selection');

  if (!chart || !binControl || !binValue || !barsContainer || !xAxis || !selectionOutput) return;

  const orderValues = [
    42, 58, 64, 71, 75, 82, 86, 93, 98, 104, 108, 112,
    118, 123, 127, 132, 138, 142, 147, 153, 158, 162, 168, 174,
    179, 184, 190, 196, 202, 208, 214, 220, 226, 232, 238, 245,
    252, 260, 268, 276, 284, 293, 302, 312, 324, 338, 352, 368,
    385, 405, 428, 452, 480, 512, 548, 590, 638, 692, 758, 842
  ];
  const chartMax = 1000;
  let selectedBin = null;
  let currentCounts = [];

  function formatCurrency(value) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  function renderHistogram(binCount) {
    const counts = Array(binCount).fill(0);
    const binWidth = chartMax / binCount;

    orderValues.forEach(function (value) {
      const binIndex = Math.min(Math.floor(value / binWidth), binCount - 1);
      counts[binIndex] += 1;
    });

    currentCounts = counts;
    const maxCount = Math.max(...counts);
    const tickValues = {
      max: maxCount,
      high: Math.round(maxCount * 0.75),
      mid: Math.round(maxCount * 0.5),
      low: Math.round(maxCount * 0.25)
    };

    Object.entries(tickValues).forEach(function ([tick, value]) {
      const tickElement = chart.querySelector(`[data-y-tick="${tick}"]`);
      if (tickElement) tickElement.textContent = String(value);
    });

    barsContainer.replaceChildren();
    xAxis.replaceChildren();
    chart.style.setProperty('--bin-count', String(binCount));
    chart.dataset.binCount = String(binCount);
    selectedBin = null;
    selectionOutput.textContent = 'Select a bar';

    counts.forEach(function (count, index) {
      const start = Math.round(index * binWidth);
      const end = Math.round((index + 1) * binWidth);
      const rangeLabel = `${formatCurrency(start)}–${formatCurrency(end)}`;
      const bar = document.createElement('button');
      const countLabel = document.createElement('span');
      const fill = document.createElement('span');
      const axisLabel = document.createElement('span');

      bar.className = 'histogram-bar';
      bar.type = 'button';
      bar.setAttribute('aria-label', `${rangeLabel}: ${count} sample orders`);
      bar.title = `${rangeLabel}: ${count} sample orders`;
      bar.dataset.binIndex = String(index);

      countLabel.className = 'histogram-bar-count';
      countLabel.textContent = String(count);
      countLabel.setAttribute('aria-hidden', 'true');

      fill.className = 'histogram-bar-fill';
      fill.style.setProperty('--bar-height', `${maxCount ? (count / maxCount) * 100 : 0}%`);
      fill.setAttribute('aria-hidden', 'true');

      axisLabel.textContent = formatCurrency(start);
      axisLabel.title = rangeLabel;

      bar.append(countLabel, fill);
      barsContainer.append(bar);
      xAxis.append(axisLabel);

      bar.addEventListener('pointerenter', () => showBin(index, start, end, count));
      bar.addEventListener('pointerleave', restoreSelectedBin);
      bar.addEventListener('focus', () => showBin(index, start, end, count));
      bar.addEventListener('blur', restoreSelectedBin);
      bar.addEventListener('click', () => {
        selectedBin = selectedBin === index ? null : index;
        barsContainer.querySelectorAll('.histogram-bar').forEach((item, itemIndex) => {
          item.classList.toggle('is-selected', itemIndex === selectedBin);
          item.setAttribute('aria-pressed', String(itemIndex === selectedBin));
        });
        if (selectedBin === null) {
          restoreSelectedBin();
        } else {
          showBin(index, start, end, count);
        }
      });
      bar.setAttribute('aria-pressed', 'false');
    });
  }

  function showBin(index, start, end, count) {
    selectionOutput.textContent = `${formatCurrency(start)}–${formatCurrency(end)} · ${count} orders`;
    barsContainer.querySelectorAll('.histogram-bar').forEach((bar, itemIndex) => {
      bar.classList.toggle('is-selected', itemIndex === index);
      bar.setAttribute('aria-pressed', String(itemIndex === selectedBin));
    });
  }

  function restoreSelectedBin() {
    if (selectedBin === null) {
      selectionOutput.textContent = 'Select a bar';
      barsContainer.querySelectorAll('.histogram-bar').forEach(bar => {
        bar.classList.remove('is-selected');
      });
      return;
    }

    barsContainer.querySelectorAll('.histogram-bar').forEach((bar, index) => {
      bar.classList.toggle('is-selected', index === selectedBin);
      bar.setAttribute('aria-pressed', String(index === selectedBin));
    });
    const binWidth = chartMax / currentCounts.length;
    const start = Math.round(selectedBin * binWidth);
    const end = Math.round((selectedBin + 1) * binWidth);
    showBin(selectedBin, start, end, currentCounts[selectedBin]);
  }

  const average = orderValues.reduce((total, value) => total + value, 0) / orderValues.length;
  document.getElementById('histogram-sample-size').textContent = String(orderValues.length);
  document.getElementById('histogram-average').textContent = formatCurrency(average);

  binControl.addEventListener('input', function () {
    const binCount = Number(binControl.value);
    binValue.textContent = `${binCount} bins`;
    renderHistogram(binCount);
  });

  renderHistogram(Number(binControl.value));
});
