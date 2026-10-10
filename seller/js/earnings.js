/**
 * AMEZA Seller Dashboard — js/earnings.js
 * Double-Entry Balance Ledger, Dynamic Revenue Summary, Hand-Written SVG Line Charts,
 * Payout Withdrawals, and Transparent Fee Calculation Inspection.
 *
 * USA Standards: USD ($), MM/DD/YYYY, 12-hour ET, strict minor-unit integer cents.
 */

import { Icons } from './icons.js';
import { escapeHTML, formatMoney, showToast } from '/shared/js/core/utils.js';
import { LedgerAPI } from './api/ledger.api.js';
import { PayoutsAPI } from './api/payouts.api.js';

// Constant Identifiers
const CURRENT_SELLER_ID = 'seller_house_001';
const STORE_NAME = 'Ameza Official';
const LEDGER_STORAGE_KEY = 'ameza_ledger_entries';

// Application State
const state = {
  ledgerEntries: [],
  filteredEntries: [],
  dateRange: '30d', // 'today' | '7d' | '30d' | '90d' | 'ytd' | 'all'
  compareEnabled: false,
  chartSeriesVisibility: {
    gross: true,
    commission: true,
    net: true
  },
  ledgerFilterType: 'all',
  ledgerSearchQuery: '',
  currentPage: 1,
  pageSize: 10,
  activeTooltipIndex: null,
  selectedCommissionEntry: null
};

/**
 * Format timestamp to Eastern Time (ET) with 12-hour AM/PM format: MM/DD/YYYY, hh:mm A
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
 * Format short month/day for chart axes: MM/DD
 */
export function formatChartDateET(timestamp) {
  try {
    const d = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    return '';
  }
}

/**
 * Initialize Earnings module
 */
export async function initEarnings() {
  try {
    await loadOrSeedLedgerDataset();
    applyFiltersAndCompute();
    renderEarningsView();
    bindEarningsEvents();
  } catch (err) {
    console.error('[Earnings] Initialization failed:', err);
    renderErrorState(err.message || 'Unable to load earnings data.');
  }
}

/**
 * Load or initialize the comprehensive ledger dataset for Ameza Official.
 * Guarantees all required transaction types (Sale, Commission, Shipping income,
 * Refund, Payout, Adjustment) with rich fee rule sources and timestamps.
 */
async function loadOrSeedLedgerDataset() {
  let entries = [];
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    }
  } catch (e) {
    entries = [];
  }

  // Filter existing entries for Ameza Official
  let houseEntries = entries.filter(e => 
    e.sellerId === CURRENT_SELLER_ID || 
    e.sellerId === '00000000-0000-0000-0000-000000000001' || 
    e.sellerId === 'ameza-official'
  );

  // Check if house entries already contain full spectrum of types
  const types = new Set(houseEntries.map(e => e.entryType));
  const hasFullTypes = types.has('sale') && types.has('commission') && types.has('shipping_income') && types.has('refund') && types.has('payout');

  if (!hasFullTypes || houseEntries.length < 25) {
    // Generate realistic, consistent seed data for Ameza Official
    houseEntries = generateComprehensiveHouseLedger();
    
    // Merge back into storage without deleting other vendors' data
    const nonHouse = entries.filter(e => 
      e.sellerId !== CURRENT_SELLER_ID && 
      e.sellerId !== '00000000-0000-0000-0000-000000000001' && 
      e.sellerId !== 'ameza-official'
    );
    const combined = [...nonHouse, ...houseEntries];
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(combined));
  }

  state.ledgerEntries = houseEntries;
}

/**
 * Generates an append-only set of realistic ledger transactions for Ameza Official
 * spanning across today, last 7 days, 30 days, and 90 days.
 */
function generateComprehensiveHouseLedger() {
  const entries = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Realistic sample products sold by Ameza Official
  const catalog = [
    { name: 'Full-Grain Leather Weekender Duffel', priceCents: 18999, category: 'Leather Goods', rate: 8, source: 'Category Override (Leather Goods)' },
    { name: 'Executive Slim Leather Cardholder', priceCents: 3999, category: 'Leather Goods', rate: 8, source: 'Category Override (Leather Goods)' },
    { name: 'Heritage Horology Mechanical Watch', priceCents: 24999, category: 'Watches', rate: 12, source: 'Category Override (Watches)' },
    { name: 'Handcrafted Walnut Desk Mat', priceCents: 6999, category: 'Home Office', rate: 5, source: 'Product Override (Handmade Goods)' },
    { name: 'Pure Linen Relaxed Fit Shirt', priceCents: 7999, category: 'Apparel', rate: 10, source: 'Global Marketplace Standard' },
    { name: 'Artisan Braided Leather Belt', priceCents: 5499, category: 'Leather Goods', rate: 8, source: 'Category Override (Leather Goods)' },
    { name: 'Organic Bamboo Bedding Set', priceCents: 12999, category: 'Home & Living', rate: 7, source: 'Seller Tier (Preferred Merchant)' }
  ];

  // Helper to add order split entries
  const addOrder = (orderNum, daysAgo, itemIdx, qty, isDelivered, isPendingBucket = false) => {
    const item = catalog[itemIdx % catalog.length];
    const orderTime = now - Math.round(daysAgo * dayMs);
    const subOrderId = `ORD-${orderNum}-S1`;
    const saleCents = item.priceCents * qty;
    const commCents = Math.round(saleCents * (item.rate / 100));
    const shippingCents = saleCents > 10000 ? 0 : 599; // Free shipping over $100
    const bucket = isPendingBucket ? 'pending' : 'available';

    // 1. Sale Proceeds (Credit)
    entries.push({
      id: `led_sale_${orderNum}`,
      sellerId: CURRENT_SELLER_ID,
      subOrderId,
      entryType: 'sale',
      amountCents: saleCents,
      bucket,
      description: `Sale proceeds for Order ${subOrderId} (${qty}x ${item.name})`,
      createdAt: orderTime,
      holdUntil: orderTime + 7 * dayMs,
      orderRef: subOrderId
    });

    // 2. Platform Commission (Debit)
    entries.push({
      id: `led_comm_${orderNum}`,
      sellerId: CURRENT_SELLER_ID,
      subOrderId,
      entryType: 'commission',
      amountCents: commCents,
      bucket,
      description: `Platform fee (${item.rate}%) for Order ${subOrderId}`,
      createdAt: orderTime,
      holdUntil: orderTime + 7 * dayMs,
      orderRef: subOrderId,
      commissionDetails: {
        ratePct: item.rate,
        source: item.source,
        baseAmountCents: saleCents,
        feeCents: commCents,
        productName: item.name,
        category: item.category,
        orderId: subOrderId
      }
    });

    // 3. Shipping Income (Credit, if paid by customer)
    if (shippingCents > 0) {
      entries.push({
        id: `led_ship_${orderNum}`,
        sellerId: CURRENT_SELLER_ID,
        subOrderId,
        entryType: 'shipping_income',
        amountCents: shippingCents,
        bucket,
        description: `Shipping reimbursement for Order ${subOrderId} (Standard Ground)`,
        createdAt: orderTime,
        holdUntil: orderTime + 7 * dayMs,
        orderRef: subOrderId
      });
    }
  };

  // Recent Orders (Today & Yesterday - Pending Escrow)
  addOrder(10048, 0.2, 0, 1, false, true); // Today
  addOrder(10047, 0.6, 1, 2, false, true); // Today
  addOrder(10046, 1.4, 2, 1, false, true); // 1 day ago
  addOrder(10045, 2.1, 3, 1, false, true); // 2 days ago
  addOrder(10044, 3.8, 4, 1, false, true); // 3 days ago
  addOrder(10043, 5.2, 5, 2, false, true); // 5 days ago

  // Orders Delivered & Released (Available Bucket)
  addOrder(10042, 8.5, 6, 1, true, false); // 8 days ago
  addOrder(10041, 10.2, 0, 1, true, false);
  addOrder(10040, 12.0, 1, 1, true, false);
  addOrder(10039, 14.3, 2, 1, true, false);
  addOrder(10038, 16.5, 3, 2, true, false);
  addOrder(10037, 18.2, 4, 1, true, false);
  addOrder(10036, 20.0, 5, 1, true, false);
  addOrder(10035, 22.4, 6, 1, true, false);
  addOrder(10034, 25.1, 0, 1, true, false);
  addOrder(10033, 27.5, 1, 3, true, false);
  addOrder(10032, 29.0, 2, 1, true, false);

  // Customer Return & Refund on an older order
  entries.push({
    id: 'led_ref_10031',
    sellerId: CURRENT_SELLER_ID,
    subOrderId: 'ORD-10031-S1',
    entryType: 'refund',
    amountCents: 7999, // Refund full item subtotal
    bucket: 'available',
    description: 'Customer return refund for Order ORD-10031-S1 (Pure Linen Shirt)',
    createdAt: now - Math.round(15.2 * dayMs),
    orderRef: 'ORD-10031-S1'
  });

  // Historical Payout Transfer to JPMorgan Chase
  entries.push({
    id: 'led_pay_901',
    sellerId: CURRENT_SELLER_ID,
    subOrderId: null,
    entryType: 'payout',
    amountCents: 150000, // $1,500.00
    bucket: 'paid_out',
    description: 'Direct Deposit ACH Payout #PAY-US-202610-01 to Chase (••••9900)',
    createdAt: now - Math.round(19.0 * dayMs),
    orderRef: null,
    status: 'paid'
  });

  // Older Orders (30 - 75 Days Ago)
  addOrder(10030, 34.0, 3, 1, true, false);
  addOrder(10029, 38.5, 4, 2, true, false);
  addOrder(10028, 42.1, 5, 1, true, false);
  addOrder(10027, 47.0, 6, 1, true, false);
  addOrder(10026, 52.3, 0, 1, true, false);
  addOrder(10025, 58.0, 1, 1, true, false);
  addOrder(10024, 64.2, 2, 1, true, false);
  addOrder(10023, 71.0, 3, 1, true, false);

  // Platform Fee Adjustment (Quarterly high-volume bonus credit)
  entries.push({
    id: 'led_adj_401',
    sellerId: CURRENT_SELLER_ID,
    subOrderId: null,
    entryType: 'adjustment',
    amountCents: 2500, // +$25.00 credit
    bucket: 'available',
    description: 'Promotional fee rebate: Top Merchant Performance Tier Tier-A Bonus',
    createdAt: now - Math.round(35.0 * dayMs),
    orderRef: null
  });

  // Second Historical Payout
  entries.push({
    id: 'led_pay_902',
    sellerId: CURRENT_SELLER_ID,
    subOrderId: null,
    entryType: 'payout',
    amountCents: 120000, // $1,200.00
    bucket: 'paid_out',
    description: 'Direct Deposit ACH Payout #PAY-US-202609-18 to Chase (••••9900)',
    createdAt: now - Math.round(55.0 * dayMs),
    orderRef: null,
    status: 'paid'
  });

  // Sort ascending by time to calculate chronological running balance
  entries.sort((a, b) => a.createdAt - b.createdAt);

  return entries;
}

/**
 * Filter ledger entries and compute running balance and period stats
 */
function applyFiltersAndCompute() {
  // Sort oldest to newest to compute running balance correctly
  state.ledgerEntries.sort((a, b) => a.createdAt - b.createdAt);

  let cumulativeBalance = 0;
  for (const entry of state.ledgerEntries) {
    const isCredit = entry.entryType === 'sale' || entry.entryType === 'shipping_income' || (entry.entryType === 'adjustment' && entry.amountCents > 0);
    const delta = isCredit ? Math.abs(entry.amountCents) : -Math.abs(entry.amountCents);
    cumulativeBalance += delta;
    entry.runningBalanceCents = cumulativeBalance;
  }

  // Filter for display
  let filtered = [...state.ledgerEntries];

  // 1. Type Filter
  if (state.ledgerFilterType !== 'all') {
    filtered = filtered.filter(e => e.entryType === state.ledgerFilterType);
  }

  // 2. Search Query (Order ID, Description, or Amount)
  if (state.ledgerSearchQuery.trim()) {
    const q = state.ledgerSearchQuery.trim().toLowerCase();
    filtered = filtered.filter(e => {
      const matchOrder = e.subOrderId && e.subOrderId.toLowerCase().includes(q);
      const matchDesc = e.description && e.description.toLowerCase().includes(q);
      const matchType = e.entryType && e.entryType.toLowerCase().includes(q);
      const matchAmt = (e.amountCents / 100).toFixed(2).includes(q);
      return matchOrder || matchDesc || matchType || matchAmt;
    });
  }

  // Sort newest first for table display
  filtered.sort((a, b) => b.createdAt - a.createdAt);
  state.filteredEntries = filtered;
}

/**
 * Calculate balance cards and sales summary from the single dataset
 */
function computeMetrics() {
  let pendingCents = 0;
  let availableCents = 0;
  let paidOutCents = 0;

  for (const e of state.ledgerEntries) {
    const isCredit = e.entryType === 'sale' || e.entryType === 'shipping_income' || (e.entryType === 'adjustment' && e.amountCents > 0);
    const net = isCredit ? Math.abs(e.amountCents) : -Math.abs(e.amountCents);

    if (e.bucket === 'pending') {
      pendingCents += net;
    } else if (e.bucket === 'available') {
      availableCents += net;
    } else if (e.bucket === 'paid_out' || e.entryType === 'payout') {
      paidOutCents += Math.abs(e.amountCents);
    }
  }

  // Calculate Sales Summary based on selected dateRange
  const now = Date.now();
  const dayMs = 86400000;
  let rangeMs = 30 * dayMs;
  if (state.dateRange === 'today') rangeMs = 1 * dayMs;
  else if (state.dateRange === '7d') rangeMs = 7 * dayMs;
  else if (state.dateRange === '30d') rangeMs = 30 * dayMs;
  else if (state.dateRange === '90d') rangeMs = 90 * dayMs;
  else if (state.dateRange === 'ytd') {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    rangeMs = Math.max(dayMs, now - startOfYear);
  } else if (state.dateRange === 'all') {
    rangeMs = 365 * dayMs;
  }

  const currentWindowStart = now - rangeMs;
  const previousWindowStart = currentWindowStart - rangeMs;

  const currentPeriodEntries = state.ledgerEntries.filter(e => e.createdAt >= currentWindowStart && e.createdAt <= now);
  const previousPeriodEntries = state.ledgerEntries.filter(e => e.createdAt >= previousWindowStart && e.createdAt < currentWindowStart);

  const calcSummary = (entriesList) => {
    let grossCents = 0;
    let commissionCents = 0;
    let shippingCents = 0;
    let refundCents = 0;
    let adjustmentCents = 0;

    for (const e of entriesList) {
      if (e.entryType === 'sale') grossCents += Math.abs(e.amountCents);
      else if (e.entryType === 'commission' || e.entryType === 'cod_commission_due') commissionCents += Math.abs(e.amountCents);
      else if (e.entryType === 'shipping_income') shippingCents += Math.abs(e.amountCents);
      else if (e.entryType === 'refund') refundCents += Math.abs(e.amountCents);
      else if (e.entryType === 'adjustment') adjustmentCents += e.amountCents;
    }

    const netCents = grossCents + shippingCents - commissionCents - refundCents + adjustmentCents;

    return { grossCents, commissionCents, shippingCents, refundCents, netCents };
  };

  const currentSummary = calcSummary(currentPeriodEntries);
  const previousSummary = calcSummary(previousPeriodEntries);

  const calcDelta = (curr, prev) => {
    if (!prev || prev === 0) return { pct: curr > 0 ? '+100%' : '0%', dir: curr > 0 ? 'up' : 'flat' };
    const diff = curr - prev;
    const pctVal = Math.round((diff / prev) * 100);
    if (pctVal > 0) return { pct: `+${pctVal}%`, dir: 'up' };
    if (pctVal < 0) return { pct: `${pctVal}%`, dir: 'down' };
    return { pct: '0%', dir: 'flat' };
  };

  return {
    pendingCents: Math.max(0, pendingCents),
    availableCents: Math.max(0, availableCents),
    paidOutCents,
    summary: currentSummary,
    previousSummary,
    deltas: {
      gross: calcDelta(currentSummary.grossCents, previousSummary.grossCents),
      commission: calcDelta(currentSummary.commissionCents, previousSummary.commissionCents),
      shipping: calcDelta(currentSummary.shippingCents, previousSummary.shippingCents),
      refunds: calcDelta(currentSummary.refundCents, previousSummary.refundCents),
      net: calcDelta(currentSummary.netCents, previousSummary.netCents)
    },
    dateRangeLabel: getDateRangeLabel(state.dateRange)
  };
}

function getDateRangeLabel(key) {
  const map = {
    'today': 'Today',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    'ytd': 'Year to date',
    'all': 'All time'
  };
  return map[key] || 'Last 30 days';
}

/**
 * Render complete Earnings page view
 */
function renderEarningsView() {
  const container = document.getElementById('earnings-content-container');
  if (!container) return;

  const metrics = computeMetrics();

  container.innerHTML = `
    <!-- Top Printable Header (Hidden except in window.print view) -->
    <div class="print-statement-header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:24px; font-weight:800; margin:0;">AMEZA Marketplace</h1>
          <p style="margin:2px 0 0; color:#555;">Official U.S. Merchant Financial Statement</p>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;">Store: ${escapeHTML(STORE_NAME)}</div>
          <div style="font-size:12px; color:#555;">Generated: ${formatDateTimeET(Date.now())}</div>
        </div>
      </div>
      <div style="margin-top:14px; font-size:13px; border-top:1px solid #000; padding-top:8px; display:flex; justify-content:space-between;">
        <span>Period: <strong>${escapeHTML(metrics.dateRangeLabel)}</strong></span>
        <span>Available: <strong>${formatMoney(metrics.availableCents)}</strong> | Pending: <strong>${formatMoney(metrics.pendingCents)}</strong> | Paid Out: <strong>${formatMoney(metrics.paidOutCents)}</strong></span>
      </div>
    </div>

    <!-- 1. Page Header with Title, Period Select, Compare Switch, Export CSV, and Black Request Payout -->
    <div class="page-header earnings-header">
      <div>
        <h1 class="page-title">Earnings</h1>
        <p class="page-subtitle">Track your sales revenue, platform fees, double-entry ledger history, and payouts.</p>
      </div>

      <div class="page-header-actions earnings-actions-desktop">
        <!-- Date-range Dropdown Trigger -->
        <div style="position: relative;">
          <button type="button" class="btn-header-action" id="btn-period-dropdown" data-action="toggle-period-menu" aria-haspopup="true" aria-expanded="false">
            <i class="fa-regular fa-calendar"></i>
            <span id="selected-period-label">${escapeHTML(metrics.dateRangeLabel)}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 11px;"></i>
          </button>
          
          <div class="dropdown-menu-popover" id="period-menu" style="min-width: 175px; display: none;">
            <button type="button" class="dropdown-item ${state.dateRange === 'today' ? 'active' : ''}" data-action="set-period" data-period="today">Today</button>
            <button type="button" class="dropdown-item ${state.dateRange === '7d' ? 'active' : ''}" data-action="set-period" data-period="7d">Last 7 days</button>
            <button type="button" class="dropdown-item ${state.dateRange === '30d' ? 'active' : ''}" data-action="set-period" data-period="30d">Last 30 days</button>
            <button type="button" class="dropdown-item ${state.dateRange === '90d' ? 'active' : ''}" data-action="set-period" data-period="90d">Last 90 days</button>
            <button type="button" class="dropdown-item ${state.dateRange === 'ytd' ? 'active' : ''}" data-action="set-period" data-period="ytd">Year to date</button>
            <button type="button" class="dropdown-item ${state.dateRange === 'all' ? 'active' : ''}" data-action="set-period" data-period="all">All time</button>
          </div>
        </div>

        <!-- Compare Toggle Switch -->
        <label class="compare-toggle-label" title="Compare current period with prior period of equal duration">
          <span class="compare-switch">
            <input type="checkbox" id="chk-compare-toggle" ${state.compareEnabled ? 'checked' : ''} data-action="toggle-compare" />
            <span class="compare-slider"></span>
          </span>
          <span>Compare</span>
        </label>

        <!-- Export CSV Button -->
        <button type="button" class="btn-header-action" id="btn-export-csv" data-action="export-ledger-csv" title="Export double-entry ledger to CSV">
          <i class="fa-solid fa-download"></i>
          <span>Export CSV</span>
        </button>

        <!-- Black Request Payout Button -->
        <button type="button" class="btn-header-action btn-payout-primary" id="btn-open-payout-modal" data-action="open-payout-modal"
          style="background: #111827; color: #FFFFFF; border-color: #111827; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
          <i class="fa-solid fa-arrow-up-from-bracket"></i>
          <span>Request payout</span>
        </button>
      </div>
    </div>

    <!-- 2. Three Balance Cards: Pending (Tooltip), Available (Green), Paid Out -->
    <div class="earnings-balance-grid">
      <!-- Card 1: Pending Balance -->
      <div class="balance-card balance-card-pending">
        <div class="balance-card-header">
          <div class="balance-card-title">
            <span>Pending</span>
            <span class="tooltip-wrap" tabindex="0" role="tooltip" aria-label="Released 7 days after delivery">
              <i class="fa-regular fa-circle-question"></i>
              <span class="tooltip-bubble">Released 7 days after delivery</span>
            </span>
          </div>
          <span class="status-pill status-pending" style="font-size: 11px;">Escrow</span>
        </div>
        <div class="balance-card-val" id="val-pending-balance">${formatMoney(metrics.pendingCents)}</div>
        <div class="balance-card-desc">Held in escrow until order delivery + 7 days carrier window</div>
      </div>

      <!-- Card 2: Available Balance (Green Highlighted) -->
      <div class="balance-card balance-card-available">
        <div class="balance-card-header">
          <div class="balance-card-title" style="color: #15803D;">
            <i class="fa-solid fa-circle-check"></i>
            <span>Available to withdraw</span>
          </div>
          <span class="status-pill status-paid" style="font-size: 11px;">Cleared</span>
        </div>
        <div class="balance-card-val" id="val-available-balance">${formatMoney(metrics.availableCents)}</div>
        <div class="balance-card-desc" style="color: #166534;">Cleared funds available for immediate ACH payout</div>
      </div>

      <!-- Card 3: Paid Out -->
      <div class="balance-card balance-card-paidout">
        <div class="balance-card-header">
          <div class="balance-card-title">
            <i class="fa-solid fa-building-columns"></i>
            <span>Paid out</span>
          </div>
          <span class="status-pill" style="background:#F1F5F9; color:#475569; font-size: 11px;">Transferred</span>
        </div>
        <div class="balance-card-val" id="val-paidout-balance">${formatMoney(metrics.paidOutCents)}</div>
        <div class="balance-card-desc">Lifetime funds transferred to linked JPMorgan Chase checking</div>
      </div>
    </div>

    <!-- 3. Card 'Sales Summary' with Gross sales, Commission, Shipping income, Refunds, Net earnings, and Deltas -->
    <div class="sales-summary-card">
      <div class="summary-card-top">
        <div>
          <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Sales summary</h2>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Figures computed for <strong>${escapeHTML(metrics.dateRangeLabel)}</strong>
            ${state.compareEnabled ? '<span style="color: var(--primary-green-dark); font-weight: 600;">(vs. prior equivalent period)</span>' : ''}
          </div>
        </div>
        <div style="font-size: 11.5px; color: var(--text-tertiary); font-style: italic;">
          All monetary calculations formatted in integer minor units (USD cents)
        </div>
      </div>

      <div class="summary-kpi-grid">
        <!-- 1. Gross Sales -->
        <div class="summary-kpi-item">
          <span class="summary-kpi-lbl">Gross sales</span>
          <span class="summary-kpi-val">${formatMoney(metrics.summary.grossCents)}</span>
          <span class="kpi-delta-tag ${metrics.deltas.gross.dir}">
            ${metrics.deltas.gross.dir === 'up' ? '↑' : (metrics.deltas.gross.dir === 'down' ? '↓' : '•')} ${metrics.deltas.gross.pct}
            <span style="font-weight: 400; color: var(--text-tertiary); font-size: 10px;">vs prior</span>
          </span>
        </div>

        <!-- 2. Commission Fees -->
        <div class="summary-kpi-item">
          <span class="summary-kpi-lbl">Commission fees</span>
          <span class="summary-kpi-val" style="color: #D97706;">-${formatMoney(metrics.summary.commissionCents)}</span>
          <span class="kpi-delta-tag ${metrics.deltas.commission.dir}">
            ${metrics.deltas.commission.dir === 'up' ? '↑' : (metrics.deltas.commission.dir === 'down' ? '↓' : '•')} ${metrics.deltas.commission.pct}
            <span style="font-weight: 400; color: var(--text-tertiary); font-size: 10px;">vs prior</span>
          </span>
        </div>

        <!-- 3. Shipping Income -->
        <div class="summary-kpi-item">
          <span class="summary-kpi-lbl">Shipping income</span>
          <span class="summary-kpi-val">+${formatMoney(metrics.summary.shippingCents)}</span>
          <span class="kpi-delta-tag ${metrics.deltas.shipping.dir}">
            ${metrics.deltas.shipping.dir === 'up' ? '↑' : (metrics.deltas.shipping.dir === 'down' ? '↓' : '•')} ${metrics.deltas.shipping.pct}
            <span style="font-weight: 400; color: var(--text-tertiary); font-size: 10px;">vs prior</span>
          </span>
        </div>

        <!-- 4. Refunds -->
        <div class="summary-kpi-item">
          <span class="summary-kpi-lbl">Refunds</span>
          <span class="summary-kpi-val" style="color: #DC2626;">-${formatMoney(metrics.summary.refundCents)}</span>
          <span class="kpi-delta-tag ${metrics.deltas.refunds.dir}">
            ${metrics.deltas.refunds.dir === 'up' ? '↑' : (metrics.deltas.refunds.dir === 'down' ? '↓' : '•')} ${metrics.deltas.refunds.pct}
            <span style="font-weight: 400; color: var(--text-tertiary); font-size: 10px;">vs prior</span>
          </span>
        </div>

        <!-- 5. Net Earnings -->
        <div class="summary-kpi-item kpi-net">
          <span class="summary-kpi-lbl" style="color: var(--primary-green-dark); font-weight: 700;">Net earnings</span>
          <span class="summary-kpi-val">${formatMoney(metrics.summary.netCents)}</span>
          <span class="kpi-delta-tag ${metrics.deltas.net.dir}">
            ${metrics.deltas.net.dir === 'up' ? '↑' : (metrics.deltas.net.dir === 'down' ? '↓' : '•')} ${metrics.deltas.net.pct}
            <span style="font-weight: 400; color: var(--text-tertiary); font-size: 10px;">vs prior</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 4. Hand-Written SVG Line Chart: Gross vs Commission vs Net -->
    <div class="earnings-chart-card">
      <div class="chart-card-top">
        <div>
          <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Earnings over time</h2>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Gross sales vs Platform commissions vs Net seller earnings
          </div>
        </div>

        <!-- Interactive Legend Toggles -->
        <div class="chart-legend-wrap">
          <button type="button" class="chart-legend-btn ${state.chartSeriesVisibility.gross ? 'active' : ''}" data-action="toggle-chart-series" data-series="gross" title="Toggle Gross sales line">
            <span class="legend-dot" style="background: #3B82F6;"></span>
            <span>Gross Sales</span>
          </button>
          <button type="button" class="chart-legend-btn ${state.chartSeriesVisibility.commission ? 'active' : ''}" data-action="toggle-chart-series" data-series="commission" title="Toggle Commission line">
            <span class="legend-dot" style="background: #F59E0B;"></span>
            <span>Commission</span>
          </button>
          <button type="button" class="chart-legend-btn ${state.chartSeriesVisibility.net ? 'active' : ''}" data-action="toggle-chart-series" data-series="net" title="Toggle Net Earnings line">
            <span class="legend-dot" style="background: #10B981;"></span>
            <span>Net Earnings</span>
          </button>
          ${state.compareEnabled ? `
            <span class="chart-legend-btn" style="cursor: default; border-style: dashed; border-color: #9CA3AF;">
              <span class="legend-dot" style="background: #9CA3AF;"></span>
              <span>Prior Net (Compare)</span>
            </span>
          ` : ''}
        </div>
      </div>

      <!-- SVG Chart Wrapper (Horizontal scroll fallback on narrow mobile screens) -->
      <div class="chart-svg-container" id="chart-svg-container">
        ${renderHandwrittenSvgChart()}
        <div class="chart-tooltip-floating" id="chart-tooltip"></div>
      </div>
    </div>

    <!-- 5. Double-Entry Ledger Card & Interactive Table -->
    <div class="ledger-card">
      <div class="card-top" style="margin-bottom: 14px;">
        <div>
          <h2 class="card-title" style="margin: 0; font-size: 16px;">Double-entry balance ledger</h2>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            Immutable transaction record with order links and calculated running balances. Click any <strong>Commission</strong> row to inspect fee calculations.
          </div>
        </div>
      </div>

      <!-- Toolbar: Filters, Search, Print Statement, Export CSV -->
      <div class="ledger-toolbar">
        <div class="ledger-toolbar-left">
          <!-- Search Input -->
          <div class="ledger-search-wrap">
            <i class="fa-solid fa-magnifying-glass ledger-search-icon"></i>
            <input type="text" class="ledger-search-input" id="ledger-search-input"
              placeholder="Search by order # (e.g. ORD-10048) or description..."
              value="${escapeHTML(state.ledgerSearchQuery)}" aria-label="Search ledger transactions" />
          </div>

          <!-- Type Filter Select -->
          <select class="ledger-filter-select" id="ledger-type-filter" aria-label="Filter transactions by type">
            <option value="all" ${state.ledgerFilterType === 'all' ? 'selected' : ''}>All Transaction Types</option>
            <option value="sale" ${state.ledgerFilterType === 'sale' ? 'selected' : ''}>Sales Only</option>
            <option value="commission" ${state.ledgerFilterType === 'commission' ? 'selected' : ''}>Commission Fees</option>
            <option value="shipping_income" ${state.ledgerFilterType === 'shipping_income' ? 'selected' : ''}>Shipping Income</option>
            <option value="refund" ${state.ledgerFilterType === 'refund' ? 'selected' : ''}>Refunds</option>
            <option value="payout" ${state.ledgerFilterType === 'payout' ? 'selected' : ''}>Payouts</option>
            <option value="adjustment" ${state.ledgerFilterType === 'adjustment' ? 'selected' : ''}>Adjustments</option>
          </select>
        </div>

        <div class="ledger-toolbar-right">
          <!-- Download Statement (Print View) -->
          <button type="button" class="btn-header-action" id="btn-download-statement" data-action="print-statement" title="Open printable financial statement">
            <i class="fa-solid fa-print"></i>
            <span>Download statement</span>
          </button>

          <!-- Export CSV -->
          <button type="button" class="btn-header-action" data-action="export-ledger-csv" title="Export ledger table to CSV">
            <i class="fa-solid fa-file-csv"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Ledger Table (Responsive: Desktop rows, Mobile stacked cards < 768px) -->
      <div class="table-responsive">
        ${renderLedgerTableHtml()}
      </div>

      <!-- Pagination -->
      ${renderLedgerPaginationHtml()}
    </div>
  `;

  // Attach hover/pointer listeners to the SVG chart
  bindChartTooltipListeners();
}

/**
 * Hand-written SVG line chart plotting Gross vs Commission vs Net over time
 * Includes legend toggles, hover crosshair, and dotted comparison line
 */
function renderHandwrittenSvgChart() {
  const chartData = generateChartDataPoints();
  const width = 800;
  const height = 240;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const pointsCount = chartData.points.length;
  if (pointsCount === 0) {
    return `<div style="padding: 40px; text-align: center; color: var(--text-tertiary);">No chart data available for the selected period.</div>`;
  }

  // Find max value across active series to scale Y axis
  let maxVal = 10000; // minimum baseline $100
  chartData.points.forEach(p => {
    if (state.chartSeriesVisibility.gross) maxVal = Math.max(maxVal, p.grossCents);
    if (state.chartSeriesVisibility.net) maxVal = Math.max(maxVal, p.netCents);
    if (state.compareEnabled && p.compareNetCents) maxVal = Math.max(maxVal, p.compareNetCents);
  });
  maxVal = Math.ceil((maxVal * 1.15) / 10000) * 10000; // Round up cleanly

  // Helper coordinate mappers
  const getX = (idx) => padLeft + (idx / (pointsCount - 1 || 1)) * chartWidth;
  const getY = (valCents) => padTop + chartHeight - (valCents / maxVal) * chartHeight;

  // Build SVG Paths
  const buildPath = (centsKey) => {
    return chartData.points.map((p, idx) => {
      const x = getX(idx);
      const y = getY(p[centsKey] || 0);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const grossPath = buildPath('grossCents');
  const commPath = buildPath('commissionCents');
  const netPath = buildPath('netCents');
  const comparePath = state.compareEnabled ? buildPath('compareNetCents') : '';

  // Horizontal Grid Lines & Y Labels (4 tiers)
  const gridLines = [];
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = (maxVal / ySteps) * i;
    const y = padTop + chartHeight - (i / ySteps) * chartHeight;
    gridLines.push(`
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 4}" font-size="10" font-weight="600" fill="var(--text-tertiary)" text-anchor="end">${formatMoney(val)}</text>
    `);
  }

  // X Axis Date Labels (5 distributed ticks)
  const xLabels = [];
  const xStep = Math.max(1, Math.floor((pointsCount - 1) / 4));
  for (let i = 0; i < pointsCount; i += xStep) {
    const x = getX(i);
    const label = chartData.points[i].label;
    xLabels.push(`
      <text x="${x}" y="${height - 12}" font-size="10.5" font-weight="600" fill="var(--text-secondary)" text-anchor="middle">${escapeHTML(label)}</text>
    `);
  }
  // Ensure last point label is displayed
  if ((pointsCount - 1) % xStep !== 0) {
    const lastIdx = pointsCount - 1;
    xLabels.push(`
      <text x="${getX(lastIdx)}" y="${height - 12}" font-size="10.5" font-weight="600" fill="var(--text-secondary)" text-anchor="middle">${escapeHTML(chartData.points[lastIdx].label)}</text>
    `);
  }

  return `
    <svg class="earnings-line-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" id="earnings-svg-chart">
      <defs>
        <!-- Gradients for subtle line fills -->
        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <g class="chart-grid">${gridLines.join('')}</g>

      <!-- Dotted Compare Line (Prior Period) -->
      ${state.compareEnabled ? `
        <path d="${comparePath}" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-dasharray="4 4" />
      ` : ''}

      <!-- Gross Sales Line -->
      ${state.chartSeriesVisibility.gross ? `
        <path d="${grossPath}" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ` : ''}

      <!-- Commission Line -->
      ${state.chartSeriesVisibility.commission ? `
        <path d="${commPath}" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      ` : ''}

      <!-- Net Earnings Line with Area Fill -->
      ${state.chartSeriesVisibility.net ? `
        <path d="${netPath} L ${getX(pointsCount - 1)} ${padTop + chartHeight} L ${getX(0)} ${padTop + chartHeight} Z" fill="url(#netGradient)" />
        <path d="${netPath}" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ` : ''}

      <!-- X Axis Ticks -->
      <g class="chart-x-labels">${xLabels.join('')}</g>

      <!-- Interactive Crosshair & Cursor Tracking Elements -->
      <line id="svg-crosshair-line" x1="0" y1="${padTop}" x2="0" y2="${padTop + chartHeight}" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="3 3" style="display:none;" />
      <circle id="svg-gross-dot" r="4.5" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2" style="display:none;" />
      <circle id="svg-comm-dot" r="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2" style="display:none;" />
      <circle id="svg-net-dot" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="2" style="display:none;" />
      <circle id="svg-compare-dot" r="4" fill="#9CA3AF" stroke="#FFFFFF" stroke-width="2" style="display:none;" />

      <!-- Transparent Overlay capturing pointer events -->
      <rect x="${padLeft}" y="${padTop}" width="${chartWidth}" height="${chartHeight}" fill="transparent" id="svg-chart-interactive-rect" style="cursor: crosshair;" />
    </svg>
  `;
}

/**
 * Generate aggregated time points for SVG chart based on selected date range
 */
function generateChartDataPoints() {
  const now = Date.now();
  const dayMs = 86400000;
  let pointsCount = 10;
  let stepMs = 3 * dayMs;

  if (state.dateRange === 'today') {
    pointsCount = 6;
    stepMs = 4 * 3600000; // 4 hour buckets
  } else if (state.dateRange === '7d') {
    pointsCount = 7;
    stepMs = dayMs;
  } else if (state.dateRange === '30d') {
    pointsCount = 10;
    stepMs = 3 * dayMs;
  } else if (state.dateRange === '90d') {
    pointsCount = 12;
    stepMs = 7.5 * dayMs;
  } else if (state.dateRange === 'ytd' || state.dateRange === 'all') {
    pointsCount = 12;
    stepMs = 15 * dayMs;
  }

  const rangeStart = now - pointsCount * stepMs;
  const points = [];

  for (let i = 0; i < pointsCount; i++) {
    const bucketStart = rangeStart + i * stepMs;
    const bucketEnd = bucketStart + stepMs;

    // Filter transactions falling in this bucket
    const bucketEntries = state.ledgerEntries.filter(e => e.createdAt >= bucketStart && e.createdAt < bucketEnd);
    let grossCents = 0;
    let commCents = 0;
    let shippingCents = 0;
    let refundCents = 0;
    let adjCents = 0;

    for (const e of bucketEntries) {
      if (e.entryType === 'sale') grossCents += Math.abs(e.amountCents);
      else if (e.entryType === 'commission' || e.entryType === 'cod_commission_due') commCents += Math.abs(e.amountCents);
      else if (e.entryType === 'shipping_income') shippingCents += Math.abs(e.amountCents);
      else if (e.entryType === 'refund') refundCents += Math.abs(e.amountCents);
      else if (e.entryType === 'adjustment') adjCents += e.amountCents;
    }

    const netCents = Math.max(0, grossCents + shippingCents - commCents - refundCents + adjCents);

    // Prior period compare bucket (shifted back)
    const priorBucketStart = bucketStart - (pointsCount * stepMs);
    const priorBucketEnd = bucketEnd - (pointsCount * stepMs);
    const priorEntries = state.ledgerEntries.filter(e => e.createdAt >= priorBucketStart && e.createdAt < priorBucketEnd);
    let priorGross = 0;
    let priorComm = 0;
    let priorShip = 0;
    let priorRef = 0;
    for (const pe of priorEntries) {
      if (pe.entryType === 'sale') priorGross += Math.abs(pe.amountCents);
      else if (pe.entryType === 'commission') priorComm += Math.abs(pe.amountCents);
      else if (pe.entryType === 'shipping_income') priorShip += Math.abs(pe.amountCents);
      else if (pe.entryType === 'refund') priorRef += Math.abs(pe.amountCents);
    }
    const compareNetCents = Math.max(0, priorGross + priorShip - priorComm - priorRef);

    points.push({
      timestamp: bucketStart,
      label: formatChartDateET(bucketStart),
      fullDate: formatDateET(bucketStart),
      grossCents,
      commissionCents: commCents,
      netCents,
      compareNetCents
    });
  }

  return { points };
}

/**
 * Bind pointer listeners for SVG chart tooltip crosshair tracking
 */
function bindChartTooltipListeners() {
  const rect = document.getElementById('svg-chart-interactive-rect');
  const svg = document.getElementById('earnings-svg-chart');
  const tooltip = document.getElementById('chart-tooltip');
  if (!rect || !svg || !tooltip) return;

  const crosshair = document.getElementById('svg-crosshair-line');
  const grossDot = document.getElementById('svg-gross-dot');
  const commDot = document.getElementById('svg-comm-dot');
  const netDot = document.getElementById('svg-net-dot');
  const compareDot = document.getElementById('svg-compare-dot');

  const chartData = generateChartDataPoints();
  const points = chartData.points;
  const pointsCount = points.length;
  if (pointsCount === 0) return;

  const width = 800;
  const height = 240;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  let maxVal = 10000;
  points.forEach(p => {
    if (state.chartSeriesVisibility.gross) maxVal = Math.max(maxVal, p.grossCents);
    if (state.chartSeriesVisibility.net) maxVal = Math.max(maxVal, p.netCents);
    if (state.compareEnabled && p.compareNetCents) maxVal = Math.max(maxVal, p.compareNetCents);
  });
  maxVal = Math.ceil((maxVal * 1.15) / 10000) * 10000;

  const getX = (idx) => padLeft + (idx / (pointsCount - 1 || 1)) * chartWidth;
  const getY = (valCents) => padTop + chartHeight - (valCents / maxVal) * chartHeight;

  const onPointerMove = (e) => {
    const svgRect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = ((clientX - svgRect.left) / svgRect.width) * width;

    if (relX < padLeft || relX > width - padRight) {
      hideTooltip();
      return;
    }

    // Find closest index
    const pct = (relX - padLeft) / chartWidth;
    const idx = Math.min(pointsCount - 1, Math.max(0, Math.round(pct * (pointsCount - 1))));
    const point = points[idx];
    const xCoord = getX(idx);

    // Position Crosshair line
    if (crosshair) {
      crosshair.setAttribute('x1', xCoord);
      crosshair.setAttribute('x2', xCoord);
      crosshair.style.display = 'block';
    }

    // Position dots
    if (grossDot && state.chartSeriesVisibility.gross) {
      grossDot.setAttribute('cx', xCoord);
      grossDot.setAttribute('cy', getY(point.grossCents));
      grossDot.style.display = 'block';
    }
    if (commDot && state.chartSeriesVisibility.commission) {
      commDot.setAttribute('cx', xCoord);
      commDot.setAttribute('cy', getY(point.commissionCents));
      commDot.style.display = 'block';
    }
    if (netDot && state.chartSeriesVisibility.net) {
      netDot.setAttribute('cx', xCoord);
      netDot.setAttribute('cy', getY(point.netCents));
      netDot.style.display = 'block';
    }
    if (compareDot && state.compareEnabled) {
      compareDot.setAttribute('cx', xCoord);
      compareDot.setAttribute('cy', getY(point.compareNetCents));
      compareDot.style.display = 'block';
    }

    // Render Tooltip Card
    tooltip.innerHTML = `
      <div style="font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
        ${escapeHTML(point.fullDate)}
      </div>
      ${state.chartSeriesVisibility.gross ? `
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 3px;">
          <span style="color: #93C5FD;">Gross Sales:</span>
          <strong>${formatMoney(point.grossCents)}</strong>
        </div>
      ` : ''}
      ${state.chartSeriesVisibility.commission ? `
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 3px;">
          <span style="color: #FCD34D;">Commission:</span>
          <strong>-${formatMoney(point.commissionCents)}</strong>
        </div>
      ` : ''}
      ${state.chartSeriesVisibility.net ? `
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 3px;">
          <span style="color: #6EE7B7;">Net Earnings:</span>
          <strong style="color: #34D399;">${formatMoney(point.netCents)}</strong>
        </div>
      ` : ''}
      ${state.compareEnabled ? `
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px;">
          <span style="color: #D1D5DB;">Prior Net:</span>
          <span>${formatMoney(point.compareNetCents)}</span>
        </div>
      ` : ''}
    `;

    // Position tooltip
    const leftPx = ((xCoord / width) * svgRect.width);
    tooltip.style.left = `${Math.min(svgRect.width - 180, Math.max(10, leftPx - 80))}px`;
    tooltip.style.display = 'block';
  };

  const hideTooltip = () => {
    if (crosshair) crosshair.style.display = 'none';
    if (grossDot) grossDot.style.display = 'none';
    if (commDot) commDot.style.display = 'none';
    if (netDot) netDot.style.display = 'none';
    if (compareDot) compareDot.style.display = 'none';
    tooltip.style.display = 'none';
  };

  rect.addEventListener('mousemove', onPointerMove);
  rect.addEventListener('touchmove', onPointerMove, { passive: true });
  rect.addEventListener('mouseleave', hideTooltip);
  rect.addEventListener('touchend', hideTooltip);
}

/**
 * Render Ledger Table HTML with semantic markup and responsive data-labels
 */
function renderLedgerTableHtml() {
  const total = state.filteredEntries.length;
  if (total === 0) {
    return `
      <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary);">
        <div style="font-size: 32px; color: var(--text-tertiary); margin-bottom: 12px;"><i class="fa-solid fa-receipt"></i></div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">No ledger transactions found</h3>
        <p style="font-size: 13px; max-width: 400px; margin: 0 auto 16px;">
          No transactions match your current filter or search criteria.
        </p>
        <button type="button" class="btn-header-action" data-action="reset-ledger-filters" style="margin: 0 auto;">
          Reset Filters
        </button>
      </div>
    `;
  }

  const startIdx = (state.currentPage - 1) * state.pageSize;
  const pageEntries = state.filteredEntries.slice(startIdx, startIdx + state.pageSize);

  return `
    <table class="dashboard-table ledger-table">
      <thead>
        <tr>
          <th>Date (ET)</th>
          <th>Type</th>
          <th>Description &amp; Order</th>
          <th style="text-align: right;">Amount</th>
          <th style="text-align: right;">Running Balance</th>
        </tr>
      </thead>
      <tbody>
        ${pageEntries.map(entry => {
          const badge = renderTypeBadge(entry);
          const isCommission = entry.entryType === 'commission';
          const isCredit = entry.entryType === 'sale' || entry.entryType === 'shipping_income' || (entry.entryType === 'adjustment' && entry.amountCents > 0);
          const amtSign = isCredit ? '+' : '-';
          const amtClass = isCredit ? 'amount-credit' : 'amount-debit';

          return `
            <tr data-entry-id="${entry.id}">
              <td data-label="Date">
                <span style="font-weight: 600; color: var(--text-main); font-size: 12.5px;">
                  ${formatDateTimeET(entry.createdAt)}
                </span>
              </td>
              <td data-label="Type">
                ${badge}
              </td>
              <td data-label="Description">
                <div>
                  ${entry.subOrderId ? `
                    <a href="order-detail.html?id=${escapeHTML(entry.subOrderId.split('-S')[0])}" class="order-link-ref" title="View Order Details">
                      ${escapeHTML(entry.subOrderId)}
                    </a>
                    &bull;
                  ` : ''}
                  <span style="color: var(--text-main); font-size: 13px;">${escapeHTML(entry.description)}</span>
                </div>
              </td>
              <td data-label="Amount" style="text-align: right;">
                <span class="${amtClass}" style="font-size: 13.5px;">
                  ${amtSign}${formatMoney(Math.abs(entry.amountCents))}
                </span>
              </td>
              <td data-label="Running Balance" style="text-align: right;">
                <span class="running-balance-val">
                  ${formatMoney(entry.runningBalanceCents)}
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Render Type badge HTML with distinct colors and click triggers for Commission fees
 */
function renderTypeBadge(entry) {
  const type = entry.entryType;
  if (type === 'sale') {
    return `<span class="type-badge badge-sale"><i class="fa-solid fa-cart-shopping"></i> Sale</span>`;
  }
  if (type === 'commission') {
    return `
      <button type="button" class="type-badge badge-commission" data-action="open-fee-modal" data-entry-id="${escapeHTML(entry.id)}" title="Click to view 'How your fee was calculated'">
        <i class="fa-solid fa-percent"></i> Commission <i class="fa-solid fa-info" style="font-size: 9px; opacity: 0.75; margin-left: 2px;"></i>
      </button>
    `;
  }
  if (type === 'shipping_income') {
    return `<span class="type-badge badge-shipping"><i class="fa-solid fa-truck"></i> Shipping income</span>`;
  }
  if (type === 'refund') {
    return `<span class="type-badge badge-refund"><i class="fa-solid fa-rotate-left"></i> Refund</span>`;
  }
  if (type === 'payout') {
    return `<span class="type-badge badge-payout"><i class="fa-solid fa-arrow-up-from-bracket"></i> Payout</span>`;
  }
  if (type === 'adjustment') {
    return `<span class="type-badge badge-adjustment"><i class="fa-solid fa-sliders"></i> Adjustment</span>`;
  }
  return `<span class="type-badge" style="background:#E5E7EB; color:#374151;">${escapeHTML(type)}</span>`;
}

/**
 * Render Ledger Pagination HTML controls
 */
function renderLedgerPaginationHtml() {
  const total = state.filteredEntries.length;
  if (total <= state.pageSize) return '';

  const totalPages = Math.ceil(total / state.pageSize);
  const startIdx = (state.currentPage - 1) * state.pageSize + 1;
  const endIdx = Math.min(total, state.currentPage * state.pageSize);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(`
      <button type="button" class="btn-page ${i === state.currentPage ? 'active' : ''}" data-action="set-page" data-page="${i}" aria-label="Page ${i}">
        ${i}
      </button>
    `);
  }

  return `
    <div class="ledger-pagination">
      <div style="font-size: 12.5px; color: var(--text-secondary);">
        Showing <strong>${startIdx}</strong> to <strong>${endIdx}</strong> of <strong>${total}</strong> entries
      </div>
      <div class="pagination-controls">
        <button type="button" class="btn-page" data-action="prev-page" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        ${pages.join('')}
        <button type="button" class="btn-page" data-action="next-page" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * Open Fee Inspection Modal explaining rate, source, base amount, and result
 */
function openFeeCalculationModal(entryId) {
  const entry = state.ledgerEntries.find(e => e.id === entryId);
  if (!entry) return;

  const modal = document.getElementById('fee-modal-overlay');
  const body = document.getElementById('fee-modal-body');
  const sub = document.getElementById('fee-modal-order-sub');
  if (!modal || !body) return;

  const details = entry.commissionDetails || {
    ratePct: 10,
    source: 'Global Marketplace Standard',
    baseAmountCents: Math.round(entry.amountCents * 10),
    feeCents: entry.amountCents,
    productName: 'Marketplace Product',
    category: 'General Catalog',
    orderId: entry.subOrderId || 'ORD-N/A'
  };

  if (sub) {
    sub.textContent = `Order Reference: ${details.orderId}`;
  }

  body.innerHTML = `
    <!-- Top Highlights Banner -->
    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 11.5px; text-transform: uppercase; font-weight: 700; color: #B45309; letter-spacing: 0.5px;">Applied Commission Fee</div>
        <div style="font-size: 24px; font-weight: 800; color: #92400E; margin-top: 2px;">-${formatMoney(details.feeCents)}</div>
      </div>
      <div style="text-align: right;">
        <span class="type-badge badge-commission" style="font-size: 12px; padding: 4px 10px;">
          ${details.ratePct}% Applied Rate
        </span>
      </div>
    </div>

    <!-- Calculation Step-by-Step Breakdown -->
    <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
      <!-- Row 1: Source & Rule -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <span style="color: var(--text-secondary); font-size: 13px;">Fee Rule Source:</span>
        <span style="font-weight: 700; color: var(--text-main); font-size: 13px; text-align: right;">
          <i class="fa-solid fa-tag" style="color: #D97706; margin-right: 4px;"></i> ${escapeHTML(details.source)}
        </span>
      </div>

      <!-- Row 2: Product Name -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <span style="color: var(--text-secondary); font-size: 13px;">Product Item:</span>
        <span style="font-weight: 600; color: var(--text-main); font-size: 13px; max-width: 280px; text-align: right;">
          ${escapeHTML(details.productName || 'Order Items')}
        </span>
      </div>

      <!-- Row 3: Base Amount -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <span style="color: var(--text-secondary); font-size: 13px;">Base Gross Subtotal:</span>
        <span style="font-weight: 700; color: var(--text-main); font-size: 14px;">
          ${formatMoney(details.baseAmountCents)}
        </span>
      </div>

      <!-- Row 4: Formula & Calculation Result -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <span style="color: var(--text-secondary); font-size: 13px;">Formula &amp; Multiplier:</span>
        <span style="font-family: monospace; font-size: 13.5px; font-weight: 700; color: var(--text-main);">
          ${formatMoney(details.baseAmountCents)} &times; ${details.ratePct}% = ${formatMoney(details.feeCents)}
        </span>
      </div>

      <!-- Row 5: Escrow Release Window -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
        <span style="color: var(--text-secondary); font-size: 13px;">Escrow Status:</span>
        <span style="font-size: 12.5px; color: ${entry.bucket === 'available' ? '#15803D' : '#D97706'}; font-weight: 700;">
          ${entry.bucket === 'available' ? 'Released to Available Balance' : 'Held in Escrow (7-day delivery hold)'}
        </span>
      </div>
    </div>

    <!-- Transparent Policy Note -->
    <div style="background: var(--bg-sidebar); border-radius: 8px; padding: 12px 14px; font-size: 12px; color: var(--text-secondary); line-height: 1.45;">
      <strong>AMEZA Transparent Fee Invariant:</strong> Category fee rules are prioritized as:
      <em>1. Product override &rarr; 2. Seller tier &rarr; 3. Category rule &rarr; 4. Global default (10%)</em>.
      No hidden transaction or listing charges apply.
    </div>
  `;

  modal.style.display = 'flex';
}

/**
 * Open Payout Request Modal
 */
function openPayoutModal() {
  const modal = document.getElementById('payout-modal-overlay');
  const availVal = document.getElementById('payout-modal-available-val');
  const input = document.getElementById('payout-amount-input');
  const validation = document.getElementById('payout-validation-msg');
  if (!modal) return;

  const metrics = computeMetrics();
  if (availVal) {
    availVal.textContent = formatMoney(metrics.availableCents);
  }
  if (input) {
    input.value = '';
    input.max = (metrics.availableCents / 100).toFixed(2);
  }
  if (validation) {
    validation.style.display = 'none';
    validation.textContent = '';
  }

  modal.style.display = 'flex';
}

/**
 * Handle Payout Submission with strict $50 validation and ledger update
 */
async function handlePayoutSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('payout-amount-input');
  const validation = document.getElementById('payout-validation-msg');
  const methodSelect = document.getElementById('payout-method-select');
  if (!input) return;

  const rawVal = parseFloat(input.value);
  if (isNaN(rawVal)) {
    showValidationError('Please enter a valid numeric withdrawal amount.');
    return;
  }

  const amountCents = Math.round(rawVal * 100);
  const metrics = computeMetrics();

  // 1. Minimum $50.00 validation
  if (amountCents < 5000) {
    showValidationError('Minimum payout amount is $50.00.');
    return;
  }

  // 2. Available balance check
  if (amountCents > metrics.availableCents) {
    showValidationError(`Requested amount exceeds your available balance (${formatMoney(metrics.availableCents)}).`);
    return;
  }

  // Clear validation
  if (validation) validation.style.display = 'none';

  const methodName = methodSelect ? methodSelect.options[methodSelect.selectedIndex].text : 'JPMorgan Chase (••••9900)';
  const payoutId = `PAY-${Date.now().toString().slice(-6)}`;

  // Create new Payout Ledger Entry
  const newPayoutEntry = {
    id: `led_pay_${Date.now()}`,
    sellerId: CURRENT_SELLER_ID,
    subOrderId: null,
    entryType: 'payout',
    amountCents: amountCents, // Deducts from balance
    bucket: 'available', // Directly draws from available bucket
    description: `Direct Deposit ACH Payout #${payoutId} to ${methodName}`,
    createdAt: Date.now(),
    orderRef: null,
    status: 'pending'
  };

  // Add to local dataset and save to localStorage
  state.ledgerEntries.push(newPayoutEntry);
  localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(state.ledgerEntries));

  // Also notify PayoutsAPI for cross-system consistency
  try {
    await PayoutsAPI.requestPayout({
      sellerId: CURRENT_SELLER_ID,
      sellerName: STORE_NAME,
      amountCents,
      bankDetails: { accountName: STORE_NAME, bankName: 'JPMorgan Chase', accountNumber: '••••9900' }
    });
  } catch (err) {
    console.warn('[PayoutsAPI] Request sync note:', err);
  }

  // Close modal
  closeModals();

  // Show Toast Notification
  showToast(`Payout request of ${formatMoney(amountCents)} submitted. Estimated arrival: 2–3 business days.`, 'success', 4000);

  // Recompute & re-render view seamlessly
  applyFiltersAndCompute();
  renderEarningsView();
}

function showValidationError(msg) {
  const validation = document.getElementById('payout-validation-msg');
  if (validation) {
    validation.textContent = msg;
    validation.style.display = 'block';
  }
}

/**
 * Close any open modals
 */
function closeModals() {
  const payoutModal = document.getElementById('payout-modal-overlay');
  const feeModal = document.getElementById('fee-modal-overlay');
  if (payoutModal) payoutModal.style.display = 'none';
  if (feeModal) feeModal.style.display = 'none';
}

/**
 * Export filtered ledger entries to CSV
 */
function exportLedgerToCsv() {
  const entries = state.filteredEntries;
  if (!entries.length) {
    showToast('No ledger entries available to export.', 'warning');
    return;
  }

  const headers = ['Date (ET)', 'Transaction Type', 'Order Reference', 'Description', 'Amount (USD)', 'Running Balance (USD)', 'Bucket'];
  const rows = entries.map(e => {
    const isCredit = e.entryType === 'sale' || e.entryType === 'shipping_income' || (e.entryType === 'adjustment' && e.amountCents > 0);
    const amtStr = (isCredit ? '+' : '-') + (Math.abs(e.amountCents) / 100).toFixed(2);
    const balStr = (e.runningBalanceCents / 100).toFixed(2);
    return [
      `"${formatDateTimeET(e.createdAt)}"`,
      `"${e.entryType}"`,
      `"${e.subOrderId || '—'}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${amtStr}"`,
      `"${balStr}"`,
      `"${e.bucket}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ameza-seller-ledger-${formatDateET(Date.now()).replace(/\//g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Ledger statement CSV downloaded successfully.', 'success');
}

/**
 * Bind DOM events with data-action delegation
 */
function bindEarningsEvents() {
  const container = document.getElementById('earnings-content-container');
  if (!container) return;

  // Global event delegation for clicks
  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) {
      // Close period menu if clicking outside
      const periodMenu = document.getElementById('period-menu');
      if (periodMenu && periodMenu.style.display === 'block' && !e.target.closest('#btn-period-dropdown')) {
        periodMenu.style.display = 'none';
      }
      return;
    }

    const action = target.getAttribute('data-action');

    if (action === 'toggle-period-menu') {
      const menu = document.getElementById('period-menu');
      if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      }
    } else if (action === 'set-period') {
      const period = target.getAttribute('data-period');
      state.dateRange = period;
      state.currentPage = 1;
      const menu = document.getElementById('period-menu');
      if (menu) menu.style.display = 'none';
      applyFiltersAndCompute();
      renderEarningsView();
    } else if (action === 'toggle-compare') {
      state.compareEnabled = !state.compareEnabled;
      renderEarningsView();
    } else if (action === 'toggle-chart-series') {
      const series = target.getAttribute('data-series');
      if (series && Object.prototype.hasOwnProperty.call(state.chartSeriesVisibility, series)) {
        state.chartSeriesVisibility[series] = !state.chartSeriesVisibility[series];
        renderEarningsView();
      }
    } else if (action === 'open-fee-modal') {
      const entryId = target.getAttribute('data-entry-id');
      openFeeCalculationModal(entryId);
    } else if (action === 'open-payout-modal') {
      openPayoutModal();
    } else if (action === 'export-ledger-csv') {
      exportLedgerToCsv();
    } else if (action === 'print-statement') {
      window.print();
    } else if (action === 'reset-ledger-filters') {
      state.ledgerFilterType = 'all';
      state.ledgerSearchQuery = '';
      state.currentPage = 1;
      applyFiltersAndCompute();
      renderEarningsView();
    } else if (action === 'set-page') {
      state.currentPage = parseInt(target.getAttribute('data-page'), 10) || 1;
      applyFiltersAndCompute();
      renderEarningsView();
    } else if (action === 'prev-page') {
      if (state.currentPage > 1) {
        state.currentPage--;
        applyFiltersAndCompute();
        renderEarningsView();
      }
    } else if (action === 'next-page') {
      const maxPages = Math.ceil(state.filteredEntries.length / state.pageSize);
      if (state.currentPage < maxPages) {
        state.currentPage++;
        applyFiltersAndCompute();
        renderEarningsView();
      }
    }
  });

  // Ledger Filter Type Select
  container.addEventListener('change', (e) => {
    if (e.target.id === 'ledger-type-filter') {
      state.ledgerFilterType = e.target.value;
      state.currentPage = 1;
      applyFiltersAndCompute();
      renderEarningsView();
    }
  });

  // Ledger Search Input (debounced)
  let searchTimer = null;
  container.addEventListener('input', (e) => {
    if (e.target.id === 'ledger-search-input') {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.ledgerSearchQuery = e.target.value;
        state.currentPage = 1;
        applyFiltersAndCompute();
        renderEarningsView();
        // Restore focus on input
        const input = document.getElementById('ledger-search-input');
        if (input) {
          input.focus();
          input.selectionStart = input.selectionEnd = input.value.length;
        }
      }, 250);
    }
  });

  // Modal Close & Payout Forms (Outside container)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');

    if (action === 'close-payout-modal' || action === 'close-fee-modal') {
      closeModals();
    } else if (action === 'payout-use-max') {
      const metrics = computeMetrics();
      const input = document.getElementById('payout-amount-input');
      if (input) {
        input.value = (metrics.availableCents / 100).toFixed(2);
      }
    }
  });

  // Close modals when clicking backdrop
  const payoutOverlay = document.getElementById('payout-modal-overlay');
  if (payoutOverlay) {
    payoutOverlay.addEventListener('click', (e) => {
      if (e.target === payoutOverlay) closeModals();
    });
  }

  const feeOverlay = document.getElementById('fee-modal-overlay');
  if (feeOverlay) {
    feeOverlay.addEventListener('click', (e) => {
      if (e.target === feeOverlay) closeModals();
    });
  }

  // Payout Form Submit
  const payoutForm = document.getElementById('payout-request-form');
  if (payoutForm) {
    payoutForm.addEventListener('submit', handlePayoutSubmit);
  }
}

/**
 * Render graceful error fallback state
 */
function renderErrorState(errorMessage) {
  const container = document.getElementById('earnings-content-container');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 60px 20px; text-align: center;">
      <div style="font-size: 40px; color: #DC2626; margin-bottom: 16px;"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <h2 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Failed to load earnings</h2>
      <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px;">${escapeHTML(errorMessage)}</p>
      <button type="button" class="btn-header-action" onclick="window.location.reload();">
        <i class="fa-solid fa-rotate"></i> Retry
      </button>
    </div>
  `;
}
