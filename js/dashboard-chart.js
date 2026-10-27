/**
 * Mini dashboard charts and KPIs, all backed by the same fictional sales data.
 */
(function() {
    'use strict';

    const monthlySales = [
        { month: 'Jan', revenue: 48000, customers: 42, profit: 15000 },
        { month: 'Feb', revenue: 52000, customers: 46, profit: 17000 },
        { month: 'Mar', revenue: 61000, customers: 50, profit: 20000 },
        { month: 'Apr', revenue: 58000, customers: 49, profit: 18000 },
        { month: 'May', revenue: 68000, customers: 56, profit: 23000 },
        { month: 'Jun', revenue: 74000, customers: 62, profit: 26000 }
    ];

    const metricDefinitions = {
        revenue: {
            label: 'Revenue',
            axisTitle: 'Revenue (USD)',
            value: (month) => month.revenue,
            format: formatCurrency,
            formatTick: (value) => `$${Math.round(value / 1000)}k`
        },
        customers: {
            label: 'New customers',
            axisTitle: 'Customers',
            value: (month) => month.customers,
            format: formatNumber,
            formatTick: formatNumber
        },
        averageTicket: {
            label: 'Average order value',
            axisTitle: 'USD per customer',
            value: (month) => month.revenue / month.customers,
            format: formatCurrency,
            formatTick: (value) => `$${Math.round(value).toLocaleString('en-US')}`
        },
        profit: {
            label: 'Estimated profit',
            axisTitle: 'Estimated profit (USD)',
            value: (month) => month.profit,
            format: formatCurrency,
            formatTick: (value) => `$${Math.round(value / 1000)}k`
        }
    };

    let barChart = null;
    let revenueChart = null;
    let resizeObserver = null;
    let themeObserver = null;

    function formatNumber(value) {
        return Math.round(value).toLocaleString('en-US');
    }

    function formatCurrency(value) {
        return `$${Math.round(value).toLocaleString('en-US')}`;
    }

    function getThemeColors() {
        const darkMode = document.documentElement.classList.contains('dark-mode');
        return darkMode
            ? {
                primary: '#7fccd0',
                fill: 'rgba(127, 204, 208, 0.16)',
                grid: 'rgba(127, 204, 208, 0.1)',
                border: 'rgba(127, 204, 208, 0.35)',
                barLow: '#437b7d',
                barHigh: '#a1e5db'
            }
            : {
                primary: '#457a7e',
                fill: 'rgba(69, 122, 126, 0.14)',
                grid: 'rgba(69, 122, 126, 0.08)',
                border: 'rgba(69, 122, 126, 0.2)',
                barLow: '#a9d6d3',
                barHigh: '#2e686d'
            };
    }

    function createValueColors(values, lowColor, highColor) {
        const low = lowColor.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16));
        const high = highColor.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16));
        const min = Math.min(...values);
        const max = Math.max(...values);

        return values.map((value) => {
            const ratio = max === min ? 0.5 : (value - min) / (max - min);
            const channels = low.map((channel, index) => Math.round(channel + (high[index] - channel) * ratio));
            return `rgb(${channels.join(', ')})`;
        });
    }

    function chartOptions(metric) {
        const colors = getThemeColors();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: reduceMotion ? 0 : 650,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-white').trim(),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim(),
                    borderColor: colors.border,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => `${metric.label}: ${metric.format(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-medium').trim(),
                        maxRotation: 0,
                        autoSkip: false,
                        font: { family: "'Outfit', sans-serif", size: 11 }
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...monthlySales.map(metric.value)) * 1.15,
                    grid: { color: colors.grid },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
                        callback: metric.formatTick,
                        maxTicksLimit: 5,
                        font: { family: "'Outfit', sans-serif", size: 10 }
                    },
                    title: {
                        display: true,
                        text: metric.axisTitle,
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim(),
                        font: { family: "'Outfit', sans-serif", size: 10, weight: '600' }
                    },
                    border: { display: false }
                }
            }
        };
    }

    function buildBarConfig(metricKey) {
        const metric = metricDefinitions[metricKey];
        const colors = getThemeColors();
        const values = monthlySales.map(metric.value);
        const valueColors = createValueColors(values, colors.barLow, colors.barHigh);

        return {
            type: 'bar',
            data: {
                labels: monthlySales.map((month) => month.month),
                datasets: [{
                    label: metric.label,
                    data: values,
                    backgroundColor: valueColors,
                    borderColor: valueColors,
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false,
                    maxBarThickness: 36
                }]
            },
            options: chartOptions(metric)
        };
    }

    function buildRevenueConfig(context) {
        const colors = getThemeColors();
        const metric = metricDefinitions.revenue;

        return {
            type: 'line',
            data: {
                labels: monthlySales.map((month) => month.month),
                datasets: [{
                    label: metric.label,
                    data: monthlySales.map(metric.value),
                    borderColor: colors.primary,
                    backgroundColor: colors.fill,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: getThemeColors().fill
                }]
            },
            options: chartOptions(metric)
        };
    }

    function updateKpis() {
        const totals = monthlySales.reduce((result, month) => ({
            revenue: result.revenue + month.revenue,
            customers: result.customers + month.customers,
            profit: result.profit + month.profit
        }), { revenue: 0, customers: 0, profit: 0 });

        const values = {
            revenue: formatCurrency(totals.revenue),
            customers: formatNumber(totals.customers),
            averageTicket: formatCurrency(totals.revenue / totals.customers),
            profit: formatCurrency(totals.profit)
        };

        Object.entries(values).forEach(([key, value]) => {
            const element = document.querySelector(`[data-kpi="${key}"]`);
            if (element) element.textContent = value;
        });
    }

    function setChartError(container, error) {
        if (container) {
            container.classList.remove('loading');
            container.classList.add('error');
        }
        console.error('Could not load the mini dashboard chart:', error);
    }

    function renderBarChart(metricKey) {
        const canvas = document.getElementById('heroBarChart');
        const metric = metricDefinitions[metricKey];
        if (!canvas || !metric) {
            setChartError(canvas && canvas.closest('.chart-container'), new Error(`Invalid metric: ${metricKey}`));
            return;
        }

        const context = canvas.getContext('2d');
        const container = canvas.closest('.chart-container');
        try {
            if (barChart) barChart.destroy();
            barChart = new Chart(context, buildBarConfig(metricKey));
            container.classList.remove('error');
        } catch (error) {
            setChartError(container, error);
        }
    }

    function renderRevenueChart() {
        const canvas = document.getElementById('heroRevenueChart');
        if (!canvas) return;

        const container = canvas.closest('.chart-container');
        try {
            if (revenueChart) revenueChart.destroy();
            const context = canvas.getContext('2d');
            revenueChart = new Chart(context, buildRevenueConfig(context));
            container.classList.remove('error');
        } catch (error) {
            setChartError(container, error);
        }
    }

    function renderChartsForCurrentTheme() {
        const select = document.getElementById('metricFilter');
        renderBarChart(select ? select.value : 'revenue');
        renderRevenueChart();
    }

    function init() {
        if (typeof Chart === 'undefined') {
            setChartError(document.querySelector('.interactive-chart'), new Error('Chart.js is not available.'));
            setChartError(document.querySelector('.revenue-chart'), new Error('Chart.js is not available.'));
            return;
        }

        Chart.defaults.font.family = "'Outfit', sans-serif";
        updateKpis();

        const select = document.getElementById('metricFilter');
        if (select) {
            select.addEventListener('change', (event) => renderBarChart(event.currentTarget.value));
        }

        renderChartsForCurrentTheme();

        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(() => {
                if (barChart) barChart.resize();
                if (revenueChart) revenueChart.resize();
            });
            document.querySelectorAll('.chart-canvas').forEach((container) => resizeObserver.observe(container));
        }

        themeObserver = new MutationObserver(renderChartsForCurrentTheme);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        window.addEventListener('beforeunload', () => {
            if (barChart) barChart.destroy();
            if (revenueChart) revenueChart.destroy();
            if (resizeObserver) resizeObserver.disconnect();
            if (themeObserver) themeObserver.disconnect();
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.heroDashboardChart = {
        render: renderBarChart,
        destroy: () => {
            if (barChart) barChart.destroy();
            if (revenueChart) revenueChart.destroy();
        },
        getChart: () => barChart,
        getRevenueChart: () => revenueChart
    };
})();
