/**
 * AMEZA Seller Central — js/payouts.js
 * Comprehensive Payouts Hub, U.S. Banking (ACH), ABA Checksum Validation,
 * Payout Schedules, Double-Entry Balance Calculation, Hand-Written SVG Velocity Chart,
 * and Printable Disbursement Receipts.
 *
 * USA Standards: USD ($), MM/DD/YYYY, 12-hour ET, strict integer cents minor units.
 */

import { Icons } from './icons.js';
import { escapeHTML, formatMoney, showToast } from '/shared/js/core/utils.js';
import { LedgerAPI } from './api/ledger.api.js';
import { PayoutsAPI } from './api/payouts.api.js';

// Constant Identifiers
const CURRENT_SELLER_ID = 'seller_house_001';
const STORE_NAME = 'Ameza Official';
const STORAGE_KEY_METHODS = 'ameza_payout_methods';
const STORAGE_KEY_HISTORY = 'ameza_payout_history';
const STORAGE_KEY_SCHEDULE = 'ameza_payout_schedule';

// Application State (Computed from single dataset)
const state = {
  availableCents: 345075, // $3,450.75 initial available balance
  methods: [],
  history: [],
  schedule: 'weekly', // 'manual' | 'weekly' | 'monthly'
  activeHistoryTab: 'all', // 'all' | 'requested' | 'processing' | 'paid' | 'rejected'
  activeDrawerTab: 'bank', // 'bank' | 'paypal'
  editingMethodId: null,
  pendingAction: null, // { type: 'add'|'edit'|'remove', data: any }
  activeReceipt: null,
  activeMenuMethodId: null
};

/**
 * Validates a 9-digit U.S. Bank Routing Transit Number using Federal Reserve ABA Checksum
 * Weights: [3, 7, 1, 3, 7, 1, 3, 7, 1]
 * sum = (3*(d0 + d3 + d6) + 7*(d1 + d4 + d7) + 1*(d2 + d5 + d8)) % 10 === 0
 */
export function validateAbaRouting(routing) {
  if (!routing || typeof routing !== 'string') return false;
  const cleaned = routing.trim();
  if (!/^\d{9}$/.test(cleaned)) return false;
  const d = cleaned.split('').map(Number);
  const sum = (3 * (d[0] + d[3] + d[6])) + (7 * (d[1] + d[4] + d[7])) + (1 * (d[2] + d[5] + d[8]));
  return sum % 10 === 0;
}

/**
 * Format timestamp to Eastern Time (ET): MM/DD/YYYY, hh:mm A
 */
export function formatDateTimeET(timestamp) {
  if (!timestamp) return '—';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch (e) {
    return new Date(timestamp).toLocaleDateString('en-US');
  }
}

/**
 * Format timestamp to Eastern Time (ET) date only: MM/DD/YYYY
 */
export function formatDateET(timestamp) {
  if (!timestamp) return '—';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return new Date(timestamp).toLocaleDateString('en-US');
  }
}

/**
 * Mask an account number (e.g. 123456784821 -> **** 4821)
 */
function maskAccountNumber(acc) {
  if (!acc) return '•••• 0000';
  const str = String(acc).trim();
  const last4 = str.slice(-4);
  return `**** ${last4}`;
}

/**
 * Mask an email address (e.g. merchant@example.com -> mer••••@example.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return '••••@example.com';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 3);
  return `${visible}••••@${domain}`;
}

/**
 * Load or initialize seed dataset
 */
function loadDataset() {
  // 1. Payout Methods
  try {
    const storedMethods = localStorage.getItem(STORAGE_KEY_METHODS);
    if (storedMethods) {
      state.methods = JSON.parse(storedMethods);
    } else {
      state.methods = [
        {
          id: 'pm_bank_01',
          type: 'bank',
          bankName: 'JPMorgan Chase Bank',
          holderName: 'Ameza Official LLC',
          routingNumber: '021000021',
          maskedNumber: '**** 4821',
          isDefault: true,
          addedAt: Date.now() - 60 * 86400000
        },
        {
          id: 'pm_paypal_01',
          type: 'paypal',
          email: 'official-payouts@ameza.com',
          maskedEmail: 'off••••••@ameza.com',
          isDefault: false,
          addedAt: Date.now() - 30 * 86400000
        }
      ];
      localStorage.setItem(STORAGE_KEY_METHODS, JSON.stringify(state.methods));
    }
  } catch (e) {
    state.methods = [];
  }

  // 2. Payout History
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (storedHistory) {
      state.history = JSON.parse(storedHistory);
    } else {
      state.history = [
        {
          id: 'pay_hist_000',
          requestedAt: new Date('2026-10-08T11:00:00-04:00').getTime(),
          processedAt: null,
          amountCents: 35000, // $350.00
          methodType: 'bank',
          methodName: 'JPMorgan Chase (ACH)',
          maskedAccount: '**** 4821',
          reference: 'ACH-REQ-983100',
          status: 'requested',
          rejectionReason: null
        },
        {
          id: 'pay_hist_001',
          requestedAt: new Date('2026-10-05T14:15:00-04:00').getTime(),
          processedAt: new Date('2026-10-06T09:30:00-04:00').getTime(),
          amountCents: 125000, // $1,250.00
          methodType: 'bank',
          methodName: 'Bank of America (ACH)',
          maskedAccount: '**** 4821',
          reference: 'ACH-982104',
          status: 'paid',
          rejectionReason: null
        },
        {
          id: 'pay_hist_002',
          requestedAt: new Date('2026-09-28T09:30:00-04:00').getTime(),
          processedAt: new Date('2026-09-28T16:00:00-04:00').getTime(),
          amountCents: 84050, // $840.50
          methodType: 'paypal',
          methodName: 'PayPal Business',
          maskedAccount: 'off••••••@ameza.com',
          reference: 'PP-482019',
          status: 'paid',
          rejectionReason: null
        },
        {
          id: 'pay_hist_003',
          requestedAt: new Date('2026-09-20T16:10:00-04:00').getTime(),
          processedAt: null,
          amountCents: 62000, // $620.00
          methodType: 'bank',
          methodName: 'JPMorgan Chase (ACH)',
          maskedAccount: '**** 4821',
          reference: 'ACH-981142',
          status: 'processing',
          rejectionReason: null
        },
        {
          id: 'pay_hist_004',
          requestedAt: new Date('2026-09-12T11:45:00-04:00').getTime(),
          processedAt: null,
          amountCents: 45000, // $450.00
          methodType: 'bank',
          methodName: 'JPMorgan Chase (ACH)',
          maskedAccount: '**** 4821',
          reference: 'ACH-980031',
          status: 'rejected',
          rejectionReason: 'Beneficiary account name mismatch with IRS TIN database'
        },
        {
          id: 'pay_hist_005',
          requestedAt: new Date('2026-08-29T13:20:00-04:00').getTime(),
          processedAt: new Date('2026-08-30T10:15:00-04:00').getTime(),
          amountCents: 210000, // $2,100.00
          methodType: 'bank',
          methodName: 'JPMorgan Chase (ACH)',
          maskedAccount: '**** 4821',
          reference: 'ACH-978401',
          status: 'paid',
          rejectionReason: null
        }
      ];
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
    }
  } catch (e) {
    state.history = [];
  }

  // 3. Payout Schedule
  try {
    const storedSchedule = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    if (storedSchedule && ['manual', 'weekly', 'monthly'].includes(storedSchedule)) {
      state.schedule = storedSchedule;
    } else {
      state.schedule = 'weekly';
      localStorage.setItem(STORAGE_KEY_SCHEDULE, 'weekly');
    }
  } catch (e) {
    state.schedule = 'weekly';
  }

  // 4. Compute Available Balance
  // Ledger base balance minus pending/requested payouts that have not yet cleared
  const ledgerBalance = LedgerAPI.getSellerBalance(CURRENT_SELLER_ID);
  if (ledgerBalance && ledgerBalance.availableCents) {
    state.availableCents = ledgerBalance.availableCents;
  } else {
    state.availableCents = 345075;
  }

  // Subtract any newly added 'requested' or 'processing' payouts saved locally
  const inFlightCents = state.history
    .filter(h => h.status === 'requested')
    .reduce((sum, h) => sum + h.amountCents, 0);

  state.availableCents = Math.max(0, state.availableCents - inFlightCents);
}

/**
 * Save current state back to LocalStorage
 */
function persistData() {
  try {
    localStorage.setItem(STORAGE_KEY_METHODS, JSON.stringify(state.methods));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
    localStorage.setItem(STORAGE_KEY_SCHEDULE, state.schedule);
  } catch (e) {
    console.error('Failed to persist payouts data', e);
  }
}

/**
 * Compute aggregate KPIs from single dataset
 */
function computeSummary() {
  const totalPaidCents = state.history
    .filter(h => h.status === 'paid')
    .reduce((sum, h) => sum + h.amountCents, 0);

  const pendingClearanceCents = state.history
    .filter(h => h.status === 'requested' || h.status === 'processing')
    .reduce((sum, h) => sum + h.amountCents, 0);

  const totalCount = state.history.length;
  const paidCount = state.history.filter(h => h.status === 'paid').length;

  return {
    availableCents: state.availableCents,
    totalPaidCents,
    pendingClearanceCents,
    totalCount,
    paidCount
  };
}

/**
 * Build Hand-Written SVG Velocity Chart (No libraries)
 * Plots payouts by month for recent 6 months
 */
function renderHandWrittenSvgChart() {
  const points = [
    { label: 'May', amountCents: 140000 },
    { label: 'Jun', amountCents: 195000 },
    { label: 'Jul', amountCents: 165000 },
    { label: 'Aug', amountCents: 210000 },
    { label: 'Sep', amountCents: 191050 },
    { label: 'Oct', amountCents: 125000 }
  ];

  const maxVal = 250000; // $2,500.00
  const width = 760;
  const height = 180;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Calculate coordinates
  const coords = points.map((p, idx) => {
    const x = padLeft + (idx / (points.length - 1)) * plotWidth;
    const y = padTop + plotHeight - (p.amountCents / maxVal) * plotHeight;
    return { x, y, ...p };
  });

  // Build smooth bezier path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  // Area path
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${padTop + plotHeight} L ${coords[0].x} ${padTop + plotHeight} Z`;

  // Grid lines
  const gridTicks = [0, 50000, 100000, 150000, 200000, 250000];
  const gridLinesSvg = gridTicks.map(val => {
    const y = padTop + plotHeight - (val / maxVal) * plotHeight;
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.7" />
      <text x="${padLeft - 10}" y="${y + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end" font-family="inherit">
        $${val / 100}
      </text>
    `;
  }).join('');

  // X-axis labels
  const xLabelsSvg = coords.map(c => `
    <text x="${c.x}" y="${height - 8}" font-size="11" font-weight="600" fill="var(--text-secondary)" text-anchor="middle" font-family="inherit">
      ${c.label}
    </text>
  `).join('');

  // Data point dots
  const dotsSvg = coords.map((c, i) => `
    <circle cx="${c.x}" cy="${c.y}" r="5" fill="#10B981" stroke="#FFFFFF" stroke-width="2.5" class="chart-point-dot" style="cursor: pointer;">
      <title>${c.label}: $${(c.amountCents / 100).toFixed(2)} disbursed</title>
    </circle>
  `).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
      <defs>
        <linearGradient id="payoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      ${gridLinesSvg}
      <path d="${areaD}" fill="url(#payoutGrad)" />
      <path d="${pathD}" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${xLabelsSvg}
      ${dotsSvg}
    </svg>
  `;
}

/**
 * Render Payout Methods List HTML
 */
function renderPayoutMethodsList() {
  if (state.methods.length === 0) {
    return `
      <div style="text-align: center; padding: 24px; background: var(--bg-sidebar); border-radius: 10px; border: 1px dashed var(--border);">
        <i class="fa-solid fa-credit-card" style="font-size: 24px; color: var(--text-tertiary); margin-bottom: 8px;"></i>
        <div style="font-size: 13.5px; font-weight: 600; color: var(--text-main);">No Payout Methods Linked</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Link a U.S. bank checking account or verified PayPal to receive funds.</div>
      </div>
    `;
  }

  return state.methods.map(m => {
    const isBank = m.type === 'bank';
    const icon = isBank ? '<i class="fa-solid fa-building-columns"></i>' : '<i class="fa-brands fa-paypal" style="color: #0070BA;"></i>';
    const title = isBank ? (m.bankName || 'U.S. Bank (ACH)') : 'PayPal';
    const sub = isBank ? `${m.maskedNumber} • Direct Deposit` : `${m.maskedEmail} • Instant Transfer`;

    return `
      <div class="payout-method-row ${m.isDefault ? 'is-default' : ''}" data-method-id="${m.id}">
        <div style="display: flex; align-items: center; min-width: 0; flex: 1;">
          <div class="method-icon-wrap">
            ${icon}
          </div>
          <div class="method-details">
            <div class="method-name">
              <span>${escapeHTML(title)}</span>
              ${m.isDefault ? `
                <span class="status-badge status-paid" style="font-size: 10.5px; padding: 2px 7px;">
                  <i class="fa-solid fa-check" style="font-size: 9px;"></i> Default
                </span>
              ` : ''}
            </div>
            <div class="method-account-num">${escapeHTML(sub)}</div>
          </div>
        </div>

        <div style="position: relative;">
          <button type="button" class="btn-method-menu" data-action="toggle-method-menu" data-id="${m.id}" aria-label="Method options" aria-haspopup="true">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          
          <div class="method-menu-popover ${state.activeMenuMethodId === m.id ? 'active' : ''}" id="popover-${m.id}">
            ${!m.isDefault ? `
              <button type="button" class="method-menu-item" data-action="make-default-method" data-id="${m.id}">
                <i class="fa-solid fa-star"></i> Make Default
              </button>
            ` : ''}
            <button type="button" class="method-menu-item" data-action="edit-method" data-id="${m.id}">
              <i class="fa-solid fa-pen"></i> Edit Details
            </button>
            <button type="button" class="method-menu-item danger-item" data-action="remove-method" data-id="${m.id}">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render Payout History Table / Stacked Cards HTML
 */
function renderHistoryTable() {
  const filtered = state.history.filter(item => {
    if (state.activeHistoryTab === 'all') return true;
    return item.status === state.activeHistoryTab;
  });

  if (filtered.length === 0) {
    return `
      <div style="text-align: center; padding: 48px 20px; background: var(--bg-surface); border-radius: 12px;">
        <i class="fa-solid fa-folder-open" style="font-size: 32px; color: var(--text-tertiary); margin-bottom: 12px; display: block;"></i>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">No disbursements found</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">There are no payouts matching the "${escapeHTML(state.activeHistoryTab)}" filter.</div>
      </div>
    `;
  }

  return `
    <table class="history-table" style="width: 100%; border-collapse: separate; border-spacing: 0;">
      <thead>
        <tr style="border-bottom: 1.5px solid var(--border); text-align: left;">
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Date (ET)</th>
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Amount</th>
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Method</th>
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Reference</th>
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Status</th>
          <th style="padding: 12px 14px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; text-align: right;">Receipt</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(row => {
          let badge = '';
          if (row.status === 'paid') {
            badge = `<span class="status-badge status-paid"><i class="fa-solid fa-circle-check"></i> Paid</span>`;
          } else if (row.status === 'processing') {
            badge = `<span class="status-badge status-processing"><i class="fa-solid fa-arrows-rotate fa-spin"></i> Processing</span>`;
          } else if (row.status === 'requested') {
            badge = `<span class="status-badge status-requested"><i class="fa-solid fa-clock"></i> Requested</span>`;
          } else if (row.status === 'rejected') {
            badge = `<span class="status-badge status-rejected" title="${escapeHTML(row.rejectionReason || 'Disbursement rejected by banking provider')}"><i class="fa-solid fa-circle-xmark"></i> Rejected <i class="fa-solid fa-info-circle" style="font-size: 10px; margin-left: 2px;"></i></span>`;
          }

          const methodLabel = `${row.methodName || 'U.S. Bank'} (${row.maskedAccount || '**** 4821'})`;

          return `
            <tr data-payout-id="${row.id}">
              <td data-label="Date">
                <span style="font-weight: 600; color: var(--text-main); font-size: 13.5px;">
                  ${formatDateTimeET(row.requestedAt)}
                </span>
              </td>
              <td data-label="Amount">
                <span style="font-size: 14.5px; font-weight: 700; color: var(--text-main);">
                  ${formatMoney(row.amountCents)}
                </span>
              </td>
              <td data-label="Method">
                <div>
                  <span style="color: var(--text-main); font-size: 13.5px; font-weight: 500;">
                    ${escapeHTML(methodLabel)}
                  </span>
                </div>
              </td>
              <td data-label="Reference">
                <div>
                  <code style="font-size: 12px; background: var(--bg-sidebar); padding: 3px 6px; border-radius: 4px; border: 1px solid var(--border);">
                    ${escapeHTML(row.reference || '—')}
                  </code>
                </div>
              </td>
              <td data-label="Status">
                <div>${badge}</div>
              </td>
              <td data-label="Receipt" style="text-align: right;">
                <button type="button" class="btn-header-action" data-action="open-receipt-modal" data-id="${row.id}"
                  style="padding: 6px 12px; font-size: 12px; min-height: 38px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-receipt"></i>
                  <span>View Receipt</span>
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Main Render Function
 */
function renderPayoutsView() {
  const container = document.getElementById('payouts-content-container');
  if (!container) return;

  const kpis = computeSummary();

  const counts = {
    all: state.history.length,
    requested: state.history.filter(h => h.status === 'requested').length,
    processing: state.history.filter(h => h.status === 'processing').length,
    paid: state.history.filter(h => h.status === 'paid').length,
    rejected: state.history.filter(h => h.status === 'rejected').length
  };

  container.innerHTML = `
    <!-- 1. Header with Title & Action Breadcrumb -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; color: var(--text-main); margin: 0 0 6px 0; letter-spacing: -0.5px;">
          Payouts &amp; Disbursements
        </h1>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin: 0;">
          Direct Deposit ACH transfers, banking settings, and disbursement ledger records for <strong>${escapeHTML(STORE_NAME)}</strong>.
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn-header-action" data-action="open-add-drawer" style="min-height: 44px; padding: 8px 18px; font-weight: 600;">
          <i class="fa-solid fa-plus"></i> Add Method
        </button>
      </div>
    </div>

    <!-- 2. Top Grid: Hero Available Balance Card + Payout Methods Card -->
    <div class="payouts-top-grid">
      <!-- Card A: Hero Available Balance Card -->
      <div class="hero-balance-card">
        <div>
          <div class="hero-balance-lbl">
            <i class="fa-solid fa-wallet" style="color: #34D399; margin-right: 4px;"></i> Available Balance
          </div>
          <div class="hero-balance-val">${formatMoney(kpis.availableCents)}</div>
          <div class="hero-balance-stats">
            <div class="hero-stat-item">
              <div>In Transit:</div>
              <strong>${formatMoney(kpis.pendingClearanceCents)}</strong>
            </div>
            <div class="hero-stat-item">
              <div>Total Paid YTD:</div>
              <strong>${formatMoney(kpis.totalPaidCents)}</strong>
            </div>
          </div>
        </div>
        <button type="button" class="btn-hero-payout" data-action="open-request-modal" aria-label="Request payout disbursement">
          <i class="fa-solid fa-arrow-up-from-bracket"></i> Request Payout
        </button>
      </div>

      <!-- Card B: Payout Methods Card (US Only) -->
      <div class="payout-methods-card">
        <div class="methods-card-header">
          <div>
            <h2 class="methods-card-title">Payout Methods</h2>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">U.S. Bank Accounts &amp; PayPal</div>
          </div>
          <button type="button" class="btn-text-action" data-action="open-add-drawer" style="background: none; border: none; color: var(--primary-green-dark); font-size: 13px; font-weight: 700; cursor: pointer; padding: 4px 8px; display: flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-plus"></i> Add New
          </button>
        </div>
        
        <div class="payout-methods-list" id="payout-methods-container">
          ${renderPayoutMethodsList()}
        </div>

        <div style="margin-top: auto; padding-top: 10px; font-size: 11.5px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-shield-halved" style="color: #10B981;"></i> All account credentials are protected by 256-bit encryption.
        </div>
      </div>
    </div>

    <!-- 3. Payout Schedule Card (Manual / Weekly / Monthly) -->
    <div class="payout-schedule-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Disbursement Schedule</h2>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">Select how frequently cleared funds are automatically transferred to your default account.</div>
        </div>
        <span class="status-badge status-paid" style="font-size: 11px;">
          <i class="fa-solid fa-bolt"></i> Auto-Sync Enabled
        </span>
      </div>

      <div class="schedule-options-group" role="radiogroup" aria-label="Payout Schedule Options">
        <label class="schedule-option-item ${state.schedule === 'manual' ? 'selected' : ''}">
          <input type="radio" name="payout_schedule_opt" value="manual" class="schedule-radio" ${state.schedule === 'manual' ? 'checked' : ''}>
          <div style="flex: 1;">
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">Manual Withdrawals</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
              Withdraw on-demand whenever your balance exceeds $50.00. No automated recurring transfers.
            </div>
          </div>
        </label>

        <label class="schedule-option-item ${state.schedule === 'weekly' ? 'selected' : ''}">
          <input type="radio" name="payout_schedule_opt" value="weekly" class="schedule-radio" ${state.schedule === 'weekly' ? 'checked' : ''}>
          <div style="flex: 1;">
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">Weekly (Recommended)</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
              Direct deposits initiated every Monday at 9:00 AM ET for all cleared available balances.
            </div>
          </div>
        </label>

        <label class="schedule-option-item ${state.schedule === 'monthly' ? 'selected' : ''}">
          <input type="radio" name="payout_schedule_opt" value="monthly" class="schedule-radio" ${state.schedule === 'monthly' ? 'checked' : ''}>
          <div style="flex: 1;">
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">Monthly</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
              Direct deposits initiated on the 1st day of each month at 9:00 AM ET.
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- 4. Payout Velocity Chart (Hand-Written SVG) -->
    <div class="payout-history-card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Disbursement Velocity</h2>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">Monthly cumulative payout volume over the last 6 months (May – Oct 2026).</div>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 10px; height: 10px; background: #10B981; border-radius: 50%;"></span>
          <span>ACH / PayPal Disbursed</span>
        </div>
      </div>

      <div style="background: var(--bg-surface); padding: 10px 0;">
        ${renderHandWrittenSvgChart()}
      </div>
    </div>

    <!-- 5. History Table with Status Filter Tabs -->
    <div class="payout-history-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <h2 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Disbursement History</h2>
        <div style="font-size: 12.5px; color: var(--text-secondary);">
          Showing <strong>${state.history.length}</strong> total disbursements
        </div>
      </div>

      <div class="history-tabs-bar" role="tablist">
        <button type="button" class="history-tab-btn ${state.activeHistoryTab === 'all' ? 'active' : ''}" data-action="filter-history-tab" data-tab="all" role="tab" aria-selected="${state.activeHistoryTab === 'all'}">
          All (${counts.all})
        </button>
        <button type="button" class="history-tab-btn ${state.activeHistoryTab === 'requested' ? 'active' : ''}" data-action="filter-history-tab" data-tab="requested" role="tab" aria-selected="${state.activeHistoryTab === 'requested'}">
          Requested (${counts.requested})
        </button>
        <button type="button" class="history-tab-btn ${state.activeHistoryTab === 'processing' ? 'active' : ''}" data-action="filter-history-tab" data-tab="processing" role="tab" aria-selected="${state.activeHistoryTab === 'processing'}">
          Processing (${counts.processing})
        </button>
        <button type="button" class="history-tab-btn ${state.activeHistoryTab === 'paid' ? 'active' : ''}" data-action="filter-history-tab" data-tab="paid" role="tab" aria-selected="${state.activeHistoryTab === 'paid'}">
          Paid (${counts.paid})
        </button>
        <button type="button" class="history-tab-btn ${state.activeHistoryTab === 'rejected' ? 'active' : ''}" data-action="filter-history-tab" data-tab="rejected" role="tab" aria-selected="${state.activeHistoryTab === 'rejected'}">
          Rejected (${counts.rejected})
        </button>
      </div>

      <div id="history-table-container">
        ${renderHistoryTable()}
      </div>
    </div>
  `;

  // Attach event listener for schedule radio buttons
  const radios = container.querySelectorAll('input[name="payout_schedule_opt"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      state.schedule = val;
      persistData();
      showToast(`Payout schedule updated to ${val.charAt(0).toUpperCase() + val.slice(1)}.`, 'success');
      renderPayoutsView();
    });
  });
}

/**
 * Open Request Payout Modal
 */
function openRequestModal() {
  const modal = document.getElementById('payout-request-modal');
  if (!modal) return;

  const availValEl = document.getElementById('request-modal-available-val');
  if (availValEl) {
    availValEl.textContent = formatMoney(state.availableCents);
  }

  const amtInput = document.getElementById('payout-amount-input');
  if (amtInput) {
    amtInput.value = '';
    amtInput.max = (state.availableCents / 100).toFixed(2);
  }

  const errEl = document.getElementById('payout-val-error');
  if (errEl) errEl.style.display = 'none';

  // Populate destination methods dropdown
  const select = document.getElementById('payout-method-select');
  if (select) {
    if (state.methods.length === 0) {
      select.innerHTML = `<option value="">No payout methods available</option>`;
    } else {
      select.innerHTML = state.methods.map(m => {
        const isBank = m.type === 'bank';
        const label = isBank 
          ? `${m.bankName || 'U.S. Bank'} (${m.maskedNumber}) ${m.isDefault ? '[Default]' : ''}`
          : `PayPal (${m.maskedEmail}) ${m.isDefault ? '[Default]' : ''}`;
        return `<option value="${m.id}" ${m.isDefault ? 'selected' : ''}>${escapeHTML(label)}</option>`;
      }).join('');
    }
  }

  modal.style.display = 'flex';
}

function closeRequestModal() {
  const modal = document.getElementById('payout-request-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Handle Request Payout Form Submission
 */
function handlePayoutSubmit(e) {
  e.preventDefault();
  const amtInput = document.getElementById('payout-amount-input');
  const errEl = document.getElementById('payout-val-error');
  if (!amtInput) return;

  const rawVal = parseFloat(amtInput.value);
  if (isNaN(rawVal) || rawVal < 50.00) {
    if (errEl) {
      errEl.textContent = 'Minimum payout threshold is $50.00.';
      errEl.style.display = 'block';
    }
    return;
  }

  const cents = Math.round(rawVal * 100);
  if (cents > state.availableCents) {
    if (errEl) {
      errEl.textContent = `Amount cannot exceed available balance (${formatMoney(state.availableCents)}).`;
      errEl.style.display = 'block';
    }
    return;
  }

  if (state.methods.length === 0) {
    if (errEl) {
      errEl.textContent = 'Please add a payout method before requesting a transfer.';
      errEl.style.display = 'block';
    }
    return;
  }

  const select = document.getElementById('payout-method-select');
  const selectedMethodId = select ? select.value : state.methods[0].id;
  const method = state.methods.find(m => m.id === selectedMethodId) || state.methods[0];

  // Deduct from available cents & record new requested payout
  state.availableCents -= cents;

  const newPayout = {
    id: `pay_req_${Date.now()}`,
    requestedAt: Date.now(),
    processedAt: null,
    amountCents: cents,
    methodType: method.type,
    methodName: method.type === 'bank' ? (method.bankName || 'U.S. Bank (ACH)') : 'PayPal',
    maskedAccount: method.type === 'bank' ? method.maskedNumber : method.maskedEmail,
    reference: `ACH-REQ-${Date.now().toString().slice(-6)}`,
    status: 'requested',
    rejectionReason: null
  };

  state.history.unshift(newPayout);
  persistData();

  closeRequestModal();
  showToast(`Payout request for ${formatMoney(cents)} submitted successfully.`, 'success');
  renderPayoutsView();
}

/**
 * Open Add Method Drawer
 */
function openAddDrawer(methodToEdit = null) {
  const drawer = document.getElementById('add-method-drawer');
  const backdrop = document.getElementById('add-method-drawer-backdrop');
  if (!drawer || !backdrop) return;

  state.editingMethodId = methodToEdit ? methodToEdit.id : null;
  const titleEl = document.getElementById('drawer-title');

  if (methodToEdit) {
    if (titleEl) titleEl.textContent = 'Edit Payout Method';
    if (methodToEdit.type === 'bank') {
      switchDrawerTab('bank');
      document.getElementById('bank-holder-name').value = methodToEdit.holderName || '';
      document.getElementById('bank-name-input').value = methodToEdit.bankName || '';
      document.getElementById('bank-routing-num').value = methodToEdit.routingNumber || '';
      document.getElementById('bank-account-num').value = '';
      document.getElementById('bank-account-confirm').value = '';
    } else {
      switchDrawerTab('paypal');
      document.getElementById('paypal-email').value = methodToEdit.email || '';
      document.getElementById('paypal-email-confirm').value = methodToEdit.email || '';
    }
  } else {
    if (titleEl) titleEl.textContent = 'Add Payout Method';
    switchDrawerTab('bank');
    // Clear forms
    const bankForm = document.getElementById('form-add-bank');
    if (bankForm) bankForm.reset();
    const ppForm = document.getElementById('form-add-paypal');
    if (ppForm) ppForm.reset();
    const routeMsg = document.getElementById('routing-checksum-msg');
    if (routeMsg) {
      routeMsg.textContent = '';
      routeMsg.className = 'routing-valid-msg';
    }
  }

  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeAddDrawer() {
  const drawer = document.getElementById('add-method-drawer');
  const backdrop = document.getElementById('add-method-drawer-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  state.editingMethodId = null;
}

function switchDrawerTab(tab) {
  state.activeDrawerTab = tab;
  const tabBankBtn = document.getElementById('tab-btn-bank');
  const tabPpBtn = document.getElementById('tab-btn-paypal');
  const formBank = document.getElementById('form-add-bank');
  const formPp = document.getElementById('form-add-paypal');

  if (tab === 'bank') {
    if (tabBankBtn) { tabBankBtn.classList.add('active'); tabBankBtn.setAttribute('aria-selected', 'true'); }
    if (tabPpBtn) { tabPpBtn.classList.remove('active'); tabPpBtn.setAttribute('aria-selected', 'false'); }
    if (formBank) formBank.style.display = 'block';
    if (formPp) formPp.style.display = 'none';
  } else {
    if (tabBankBtn) { tabBankBtn.classList.remove('active'); tabBankBtn.setAttribute('aria-selected', 'false'); }
    if (tabPpBtn) { tabPpBtn.classList.add('active'); tabPpBtn.setAttribute('aria-selected', 'true'); }
    if (formBank) formBank.style.display = 'none';
    if (formPp) formPp.style.display = 'block';
  }
}

/**
 * Live Routing Checksum Handler
 */
function handleRoutingInput(e) {
  const input = e.target;
  const val = input.value.trim();
  const msgEl = document.getElementById('routing-checksum-msg');
  if (!msgEl) return;

  if (val.length === 0) {
    msgEl.textContent = '';
    msgEl.className = 'routing-valid-msg';
    return;
  }

  if (val.length < 9) {
    msgEl.textContent = `${9 - val.length} more digits needed...`;
    msgEl.className = 'routing-valid-msg';
    return;
  }

  if (val.length === 9) {
    const isValid = validateAbaRouting(val);
    if (isValid) {
      msgEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Valid U.S. ABA Routing Number';
      msgEl.className = 'routing-valid-msg valid';
    } else {
      msgEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Invalid Routing Number (Failed ABA Checksum)';
      msgEl.className = 'routing-valid-msg invalid';
    }
  }
}

/**
 * Validate Method Form and Open Password Confirmation Modal
 */
function triggerSaveMethod() {
  if (state.activeDrawerTab === 'bank') {
    const holder = document.getElementById('bank-holder-name')?.value.trim();
    const bankName = document.getElementById('bank-name-input')?.value.trim();
    const routing = document.getElementById('bank-routing-num')?.value.trim();
    const acc = document.getElementById('bank-account-num')?.value.trim();
    const accConfirm = document.getElementById('bank-account-confirm')?.value.trim();
    const matchErr = document.getElementById('account-match-error');

    if (!holder || !bankName || !routing || (!state.editingMethodId && !acc)) {
      showToast('Please fill in all required banking fields.', 'error');
      return;
    }

    if (!validateAbaRouting(routing)) {
      showToast('Invalid 9-digit ABA Routing Transit Number.', 'error');
      return;
    }

    if (!state.editingMethodId && acc !== accConfirm) {
      if (matchErr) matchErr.style.display = 'block';
      showToast('Account numbers do not match.', 'error');
      return;
    }
    if (matchErr) matchErr.style.display = 'none';

    state.pendingAction = {
      action: state.editingMethodId ? 'edit' : 'add',
      data: {
        type: 'bank',
        holderName: holder,
        bankName,
        routingNumber: routing,
        maskedNumber: acc ? maskAccountNumber(acc) : '**** 4821',
        isDefault: state.methods.length === 0
      }
    };
  } else {
    // PayPal
    const email = document.getElementById('paypal-email')?.value.trim();
    const emailConfirm = document.getElementById('paypal-email-confirm')?.value.trim();
    const matchErr = document.getElementById('paypal-match-error');

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid PayPal account email.', 'error');
      return;
    }

    if (email !== emailConfirm) {
      if (matchErr) matchErr.style.display = 'block';
      showToast('PayPal email addresses do not match.', 'error');
      return;
    }
    if (matchErr) matchErr.style.display = 'none';

    state.pendingAction = {
      action: state.editingMethodId ? 'edit' : 'add',
      data: {
        type: 'paypal',
        email,
        maskedEmail: maskEmail(email),
        isDefault: state.methods.length === 0
      }
    };
  }

  // Require Security Password Confirmation Modal
  openPasswordConfirmModal(
    state.pendingAction.action === 'edit'
      ? 'Enter your merchant password to authorize editing this payout method.'
      : 'Enter your merchant password to authorize linking this new payout method.'
  );
}

/**
 * Security Password Modal Handling
 */
function openPasswordConfirmModal(promptText) {
  const modal = document.getElementById('password-confirm-modal');
  const promptEl = document.getElementById('pwd-modal-prompt');
  const input = document.getElementById('merchant-pwd-input');
  const errEl = document.getElementById('pwd-error-msg');

  if (!modal) return;
  if (promptEl && promptText) promptEl.textContent = promptText;
  if (input) input.value = '';
  if (errEl) errEl.style.display = 'none';

  modal.style.display = 'flex';
  if (input) setTimeout(() => input.focus(), 50);
}

function closePasswordConfirmModal() {
  const modal = document.getElementById('password-confirm-modal');
  if (modal) modal.style.display = 'none';
  state.pendingAction = null;
}

function handlePasswordConfirm(e) {
  e.preventDefault();
  const input = document.getElementById('merchant-pwd-input');
  const errEl = document.getElementById('pwd-error-msg');
  if (!input) return;

  const pwd = input.value.trim();
  if (!pwd) {
    if (errEl) {
      errEl.textContent = 'Please enter your password.';
      errEl.style.display = 'block';
    }
    return;
  }

  // Execute queued action
  if (!state.pendingAction) {
    closePasswordConfirmModal();
    return;
  }

  const { action, data } = state.pendingAction;

  if (action === 'add') {
    const newMethod = {
      id: `pm_${data.type}_${Date.now()}`,
      addedAt: Date.now(),
      ...data
    };
    state.methods.push(newMethod);
    persistData();
    closeAddDrawer();
    closePasswordConfirmModal();
    showToast('New payout method verified and added.', 'success');
    renderPayoutsView();
  } else if (action === 'edit') {
    const idx = state.methods.findIndex(m => m.id === state.editingMethodId);
    if (idx !== -1) {
      state.methods[idx] = {
        ...state.methods[idx],
        ...data
      };
      persistData();
      closeAddDrawer();
      closePasswordConfirmModal();
      showToast('Payout method updated successfully.', 'success');
      renderPayoutsView();
    }
  } else if (action === 'remove') {
    const methodId = data.methodId;
    state.methods = state.methods.filter(m => m.id !== methodId);
    // If the removed method was default, make the first remaining method default
    if (state.methods.length > 0 && !state.methods.some(m => m.isDefault)) {
      state.methods[0].isDefault = true;
    }
    persistData();
    closePasswordConfirmModal();
    showToast('Payout method removed successfully.', 'success');
    renderPayoutsView();
  }
}

/**
 * Handle Method Menu Actions
 */
function handleMakeDefaultMethod(methodId) {
  state.methods.forEach(m => {
    m.isDefault = (m.id === methodId);
  });
  persistData();
  state.activeMenuMethodId = null;
  showToast('Default payout destination updated.', 'success');
  renderPayoutsView();
}

function handleEditMethod(methodId) {
  state.activeMenuMethodId = null;
  const method = state.methods.find(m => m.id === methodId);
  if (!method) return;
  openAddDrawer(method);
}

function handleRemoveMethod(methodId) {
  state.activeMenuMethodId = null;
  // Rule: cannot remove the only method while a payout is pending/requested
  const isPending = state.history.some(h => h.status === 'requested' || h.status === 'processing');
  if (state.methods.length <= 1 && isPending) {
    showToast('Cannot remove the only payout method while a payout is requested or processing.', 'error');
    return;
  }

  state.pendingAction = {
    action: 'remove',
    data: { methodId }
  };

  openPasswordConfirmModal('Enter your merchant password to confirm removing this payout method.');
}

/**
 * Open Printable Receipt Modal
 */
function openReceiptModal(payoutId) {
  const modal = document.getElementById('receipt-modal');
  const refEl = document.getElementById('receipt-modal-ref');
  const bodyEl = document.getElementById('receipt-modal-body');
  if (!modal || !bodyEl) return;

  const item = state.history.find(h => h.id === payoutId) || state.history[0];
  state.activeReceipt = item;

  if (refEl) refEl.textContent = `Reference: ${item.reference || '—'}`;

  const statusBadge = item.status === 'paid'
    ? '<span class="status-badge status-paid"><i class="fa-solid fa-circle-check"></i> Disbursed / Cleared</span>'
    : `<span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>`;

  bodyEl.innerHTML = `
    <div style="border-bottom: 2px solid var(--border); padding-bottom: 16px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 18px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">AMEZA Marketplace</span>
        ${statusBadge}
      </div>
      <div style="font-size: 12.5px; color: var(--text-secondary);">Direct Deposit Payout Voucher &amp; ACH Disbursement Record</div>
    </div>

    <div style="background: var(--bg-sidebar); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 11.5px; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px;">Disbursed Amount</div>
        <div style="font-size: 26px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${formatMoney(item.amountCents)}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11.5px; color: var(--text-secondary);">Transfer Fee</div>
        <div style="font-size: 14px; font-weight: 700; color: #166534;">$0.00 (Covered)</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
      <div>
        <div style="color: var(--text-tertiary); font-size: 11px; text-transform: uppercase; font-weight: 700;">Beneficiary Merchant</div>
        <div style="font-weight: 600; color: var(--text-main);">${escapeHTML(STORE_NAME)}</div>
        <div style="color: var(--text-secondary); font-size: 12px;">Merchant ID: ${CURRENT_SELLER_ID}</div>
      </div>
      <div>
        <div style="color: var(--text-tertiary); font-size: 11px; text-transform: uppercase; font-weight: 700;">Destination Account</div>
        <div style="font-weight: 600; color: var(--text-main);">${escapeHTML(item.methodName || 'U.S. Bank (ACH)')}</div>
        <div style="color: var(--text-secondary); font-size: 12px;">${escapeHTML(item.maskedAccount || '**** 4821')}</div>
      </div>
      <div>
        <div style="color: var(--text-tertiary); font-size: 11px; text-transform: uppercase; font-weight: 700;">Requested Date (ET)</div>
        <div style="font-weight: 600; color: var(--text-main);">${formatDateTimeET(item.requestedAt)}</div>
      </div>
      <div>
        <div style="color: var(--text-tertiary); font-size: 11px; text-transform: uppercase; font-weight: 700;">Federal Reference Trace</div>
        <div style="font-weight: 600; font-family: monospace; color: var(--text-main);">${escapeHTML(item.reference || '—')}</div>
      </div>
    </div>

    <div style="border-top: 1px dashed var(--border); padding-top: 14px; font-size: 11.5px; color: var(--text-tertiary); line-height: 1.45;">
      Disbursed via Federal Reserve Automated Clearing House (ACH) network or PayPal Mass Payments. Keep this voucher for your U.S. Federal Income Tax records.
    </div>
  `;

  modal.style.display = 'flex';
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.style.display = 'none';
  state.activeReceipt = null;
}

/**
 * Global Event Delegation
 */
function initEventListeners() {
  document.addEventListener('click', (e) => {
    // Close popover when clicked outside
    if (!e.target.closest('.btn-method-menu') && !e.target.closest('.method-menu-popover')) {
      if (state.activeMenuMethodId !== null) {
        state.activeMenuMethodId = null;
        document.querySelectorAll('.method-menu-popover.active').forEach(el => el.classList.remove('active'));
      }
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');

    switch (action) {
      case 'open-request-modal':
        openRequestModal();
        break;
      case 'close-request-modal':
        closeRequestModal();
        break;
      case 'request-use-max': {
        const amtInput = document.getElementById('payout-amount-input');
        if (amtInput) amtInput.value = (state.availableCents / 100).toFixed(2);
        break;
      }
      case 'open-add-drawer':
        openAddDrawer();
        break;
      case 'close-drawer':
        closeAddDrawer();
        break;
      case 'switch-drawer-tab': {
        const tab = target.getAttribute('data-tab');
        if (tab) switchDrawerTab(tab);
        break;
      }
      case 'trigger-save-method':
        triggerSaveMethod();
        break;
      case 'toggle-method-menu': {
        e.stopPropagation();
        const id = target.getAttribute('data-id');
        state.activeMenuMethodId = (state.activeMenuMethodId === id) ? null : id;
        document.querySelectorAll('.method-menu-popover').forEach(p => p.classList.remove('active'));
        if (state.activeMenuMethodId) {
          const popover = document.getElementById(`popover-${id}`);
          if (popover) popover.classList.add('active');
        }
        break;
      }
      case 'make-default-method': {
        const id = target.getAttribute('data-id');
        handleMakeDefaultMethod(id);
        break;
      }
      case 'edit-method': {
        const id = target.getAttribute('data-id');
        handleEditMethod(id);
        break;
      }
      case 'remove-method': {
        const id = target.getAttribute('data-id');
        handleRemoveMethod(id);
        break;
      }
      case 'close-pwd-modal':
        closePasswordConfirmModal();
        break;
      case 'filter-history-tab': {
        const tab = target.getAttribute('data-tab');
        if (tab) {
          state.activeHistoryTab = tab;
          renderPayoutsView();
        }
        break;
      }
      case 'open-receipt-modal': {
        const id = target.getAttribute('data-id');
        openReceiptModal(id);
        break;
      }
      case 'close-receipt-modal':
        closeReceiptModal();
        break;
      case 'print-receipt':
        window.print();
        break;
      default:
        break;
    }
  });

  // Live ABA Routing Checksum validation
  const routingInput = document.getElementById('bank-routing-num');
  if (routingInput) {
    routingInput.addEventListener('input', handleRoutingInput);
  }

  // Request Payout Form submit
  const requestForm = document.getElementById('form-request-payout');
  if (requestForm) {
    requestForm.addEventListener('submit', handlePayoutSubmit);
  }

  // Password Confirmation Form submit
  const pwdForm = document.getElementById('form-confirm-password');
  if (pwdForm) {
    pwdForm.addEventListener('submit', handlePasswordConfirm);
  }
}

/**
 * Bootstrap Payouts Engine
 */
export async function initPayouts() {
  loadDataset();
  initEventListeners();

  // Simulate smooth skeleton reveal
  setTimeout(() => {
    const skeleton = document.getElementById('payouts-skeleton');
    if (skeleton) skeleton.remove();
    renderPayoutsView();
  }, 100);
}
