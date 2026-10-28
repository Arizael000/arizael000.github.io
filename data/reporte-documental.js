/**
 * ---------------------------------------------------------------------------
 * Documental Report — sample dataset
 * ---------------------------------------------------------------------------
 * This file is the single source of truth for every number rendered on
 * reporteDocumental.html. Replace the values below with the official dataset
 * when it becomes available, or point REPORTE_DOCUMENTAL_CONFIG.endpoint to a
 * JSON endpoint with the same shape.
 *
 * The dashboard remains a prototype while `meta.isDemo` is true.
 * ---------------------------------------------------------------------------
 */
window.REPORTE_DOCUMENTAL_DATA = {
  meta: {
    title: 'Documental Report',
    period: 'October 2026 export cycle',
    updatedAt: '2026-10-27T09:30:00-06:00',
    isDemo: true,
    sourceLabel: 'Sample data'
  },

  summary: {
    received: 128,
    reconciled: 108,
    reviewed: 74,
    pendingReview: 21,
    differences: 13,
    pendingReconciliation: 20,
    averageReviewHours: 2.4,
    previousCycleReceived: 116,
    previousCycleReviewHours: 2.7
  },

  documentTypes: [
    { label: 'Packing List', value: 62 },
    { label: 'Invoice', value: 66 }
  ],

  statuses: [
    { label: 'Ready for export', shortLabel: 'Ready', value: 74, tone: 'success' },
    { label: 'In review', shortLabel: 'In review', value: 21, tone: 'warning' },
    { label: 'With differences', shortLabel: 'Differences', value: 13, tone: 'danger' },
    { label: 'Pending reconciliation', shortLabel: 'Pending', value: 20, tone: 'neutral' }
  ],

  documents: [
    {
      reference: 'PL-2026-0148',
      type: 'Packing List',
      counterparty: 'Northwind Cables Ltd.',
      status: 'Ready for export',
      owner: 'L. Mora',
      date: '2026-10-24'
    },
    {
      reference: 'INV-2026-0921',
      type: 'Invoice',
      counterparty: 'BlueRiver Logistics',
      status: 'In review',
      owner: 'A. Vega',
      date: '2026-10-24'
    },
    {
      reference: 'PL-2026-0147',
      type: 'Packing List',
      counterparty: 'Andes Polymers S.A.',
      status: 'With differences',
      owner: 'M. Rojas',
      date: '2026-10-23'
    },
    {
      reference: 'INV-2026-0918',
      type: 'Invoice',
      counterparty: 'Meridian Trading Co.',
      status: 'Ready for export',
      owner: 'L. Mora',
      date: '2026-10-23'
    },
    {
      reference: 'PL-2026-0145',
      type: 'Packing List',
      counterparty: 'Helios Packaging',
      status: 'Pending reconciliation',
      owner: 'J. Castro',
      date: '2026-10-22'
    },
    {
      reference: 'INV-2026-0915',
      type: 'Invoice',
      counterparty: 'Pacific Reels Inc.',
      status: 'In review',
      owner: 'A. Vega',
      date: '2026-10-22'
    },
    {
      reference: 'PL-2026-0143',
      type: 'Packing List',
      counterparty: 'Nordic Materials AB',
      status: 'Ready for export',
      owner: 'M. Rojas',
      date: '2026-10-21'
    },
    {
      reference: 'INV-2026-0912',
      type: 'Invoice',
      counterparty: 'Summit Wire Group',
      status: 'With differences',
      owner: 'J. Castro',
      date: '2026-10-20'
    }
  ]
};
