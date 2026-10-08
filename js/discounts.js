/**
 * AMEZA Seller Central — Discounts & Promotion Engine (js/discounts.js)
 * Manages active coupons, redemption tracking, and discount creation
 * with 100% US minor-unit cents compliance.
 */

import { Icons } from './icons.js';
import { escapeHTML, showToast } from './shell.js';

const STORAGE_KEY = 'ameza_coupons';

const DEFAULT_COUPONS = [
  {
    code: 'SAVE10',
    discountType: 'percentage',
    value: 10,
    minSpendCents: 5000,
    active: true,
    usageCount: 142,
    description: '10% off entire order',
    endDate: '2026-12-06T00:38:00.622Z'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed_shipping',
    value: 599,
    minSpendCents: 5000,
    active: true,
    usageCount: 76,
    description: 'Free standard shipping on orders over $50',
    endDate: '2026-11-06T00:38:00.622Z'
  },
  {
    code: 'SPRING20',
    discountType: 'percentage',
    value: 20,
    minSpendCents: 10000,
    active: true,
    usageCount: 41,
    description: '20% off spring collection',
    endDate: '2026-11-21T00:38:00.622Z'
  },
  {
    code: 'WELCOME5',
    discountType: 'fixed_amount',
    value: 500,
    minSpendCents: 3500,
    active: true,
    usageCount: 88,
    description: '$5.00 off first customer order',
    endDate: '2027-01-05T00:38:00.622Z'
  },
  {
    code: 'SUMMER25',
    discountType: 'percentage',
    value: 25,
    minSpendCents: 10000,
    active: false,
    usageCount: 12,
    description: '25% off summer collection',
    endDate: '2026-08-31T00:38:00.622Z'
  }
];

export function getCoupons() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse coupons from localStorage', e);
  }
  return [...DEFAULT_COUPONS];
}

export function saveCoupons(coupons) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

let activeTab = 'all';
let searchQuery = '';
let typeFilter = 'all';

export function initDiscounts() {
  renderDiscountsView();
  bindDiscountsEvents();
}

function renderDiscountsView() {
  const container = document.getElementById('discounts-content-container');
  if (!container) return;

  const coupons = getCoupons();

  // Metrics
  const activeCount = coupons.filter(c => c.active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const estimatedSavings = '$3,620.40';

  // Filter list
  const filtered = coupons.filter(c => {
    // Tab filter
    if (activeTab === 'active' && !c.active) return false;
    if (activeTab === 'expired' && c.active) return false;
    if (activeTab === 'scheduled') {
      const isFuture = new Date(c.endDate) > new Date('2026-12-31');
      if (!isFuture) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && c.discountType !== typeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }

    return true;
  });

  container.innerHTML = `
    <!-- Page Header -->
    <div class="page-header" style="margin-bottom: 24px;">
      <div>
        <h1 class="page-title">Discounts & Promotion Codes</h1>
        <p class="page-subtitle">Create and manage coupon codes, percentage sales, and free shipping incentives across your store.</p>
      </div>
      <div class="page-header-actions">
        <a href="create-discount.html" class="btn-header-primary" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Discount
        </a>
      </div>
    </div>

    <!-- 1. Stats Row -->
    <div class="metrics-grid" style="margin-bottom: 24px;">
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #10B981; background: rgba(16, 185, 129, 0.1);"><i class="fa-solid fa-tags"></i></div>
          <span class="metric-title">Active Discount Codes</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${activeCount}</div>
        </div>
        <div class="metric-footer">
          <span style="font-size: 11.5px; color: var(--text-secondary);">${coupons.length} total codes configured</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #3B82F6; background: rgba(59, 130, 246, 0.1);"><i class="fa-solid fa-users"></i></div>
          <span class="metric-title">Total Redemptions</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${totalRedemptions}</div>
        </div>
        <div class="metric-footer">
          <span class="metric-delta up">&uarr; 18.2%</span>
          <span class="metric-comparison">vs last month</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #8B5CF6; background: rgba(139, 92, 246, 0.1);"><i class="fa-solid fa-piggy-bank"></i></div>
          <span class="metric-title">Customer Savings Delivered</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${estimatedSavings}</div>
        </div>
        <div class="metric-footer">
          <span style="font-size: 11.5px; color: var(--text-secondary);">Direct checkout incentives applied</span>
        </div>
      </div>
    </div>

    <!-- 2. Main Discounts Card -->
    <div class="card-products" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
      <!-- Tabs Row -->
      <div class="products-tabs-row" id="discount-tabs" style="display: flex; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface);">
        <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">All (${coupons.length})</button>
        <button class="tab-btn ${activeTab === 'active' ? 'active' : ''}" data-tab="active">Active (${activeCount})</button>
        <button class="tab-btn ${activeTab === 'scheduled' ? 'active' : ''}" data-tab="scheduled">Scheduled</button>
        <button class="tab-btn ${activeTab === 'expired' ? 'active' : ''}" data-tab="expired">Expired (${coupons.length - activeCount})</button>
      </div>

      <!-- Toolbar Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
        <div style="position: relative; width: 320px;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" id="discount-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search discount codes or terms..." class="search-field" style="width: 100%; padding-left: 36px; height: 36px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-page); color: var(--text-main);">
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <select id="discount-type-filter" style="height: 36px; border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; background: var(--bg-page); color: var(--text-main); font-size: 13px;">
            <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All Types</option>
            <option value="percentage" ${typeFilter === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
            <option value="fixed_amount" ${typeFilter === 'fixed_amount' ? 'selected' : ''}>Fixed Amount ($)</option>
            <option value="fixed_shipping" ${typeFilter === 'fixed_shipping' ? 'selected' : ''}>Free Shipping</option>
          </select>
        </div>
      </div>

      <!-- Table View -->
      <div class="table-responsive">
        <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 12px; color: var(--text-secondary);">
              <th style="padding: 12px 16px;">Code</th>
              <th style="padding: 12px 16px;">Type & Value</th>
              <th style="padding: 12px 16px;">Minimum Spend</th>
              <th style="padding: 12px 16px; text-align: center;">Redemptions</th>
              <th style="padding: 12px 16px;">End Date</th>
              <th style="padding: 12px 16px; text-align: center;">Status</th>
              <th style="padding: 12px 16px; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-secondary);">
                  <div style="font-size: 28px; margin-bottom: 8px;">🏷️</div>
                  <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">No discount codes found</div>
                  <div style="font-size: 12px;">Try adjusting your search criteria or create a new discount code.</div>
                </td>
              </tr>
            ` : filtered.map(item => {
              const formattedMin = item.minSpendCents ? `$${(item.minSpendCents / 100).toFixed(2)} min` : 'No minimum';
              const formattedDate = new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let typeLabel = '';
              if (item.discountType === 'percentage') typeLabel = `${item.value}% off`;
              else if (item.discountType === 'fixed_amount') typeLabel = `$${(item.value / 100).toFixed(2)} off`;
              else if (item.discountType === 'fixed_shipping') typeLabel = 'Free Standard Shipping ($5.99)';

              return `
                <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 13px;">
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="coupon-code-badge" style="font-family: monospace; font-size: 13px; font-weight: 700; background: var(--border-subtle); padding: 4px 10px; border-radius: 6px; border: 1px dashed var(--border); color: var(--text-main); letter-spacing: 0.5px;">
                        ${escapeHTML(item.code)}
                      </span>
                      <button type="button" class="btn-copy-code" data-code="${escapeHTML(item.code)}" title="Copy discount code" style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="font-weight: 700; color: var(--text-main);">${escapeHTML(typeLabel)}</div>
                    <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">${escapeHTML(item.description)}</div>
                  </td>
                  <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 12.5px;">
                    ${escapeHTML(formattedMin)}
                  </td>
                  <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: var(--text-main);">
                    ${item.usageCount || 0}
                  </td>
                  <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 12.5px;">
                    ${escapeHTML(formattedDate)}
                  </td>
                  <td style="padding: 14px 16px; text-align: center;">
                    <span class="status-pill ${item.active ? 'status-paid' : 'status-cancelled'}" style="font-size: 11px;">
                      ${item.active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td style="padding: 14px 16px; text-align: right;">
                    <div style="display: inline-flex; gap: 8px;">
                      <button type="button" class="btn-toggle-coupon" data-code="${escapeHTML(item.code)}" title="${item.active ? 'Deactivate' : 'Activate'}" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-surface); color: var(--text-main); font-size: 11.5px; cursor: pointer;">
                        ${item.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" class="btn-delete-coupon" data-code="${escapeHTML(item.code)}" title="Delete" style="padding: 4px 8px; border: 1px solid #FECACA; border-radius: 4px; background: #FEF2F2; color: #DC2626; font-size: 11.5px; cursor: pointer;">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindDiscountsEvents() {
  // Tabs
  document.querySelectorAll('#discount-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab');
      renderDiscountsView();
      bindDiscountsEvents();
    });
  });

  // Search input
  const searchInput = document.getElementById('discount-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderDiscountsView();
    bindDiscountsEvents();
    // Re-focus search input
    const el = document.getElementById('discount-search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  // Type filter
  const typeSelect = document.getElementById('discount-type-filter');
  typeSelect?.addEventListener('change', (e) => {
    typeFilter = e.target.value;
    renderDiscountsView();
    bindDiscountsEvents();
  });

  // Copy code
  document.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Copied code "${code}" to clipboard!`, 'success');
      }).catch(() => {
        showToast(`Code: ${code}`, 'info');
      });
    });
  });

  // Toggle active/inactive
  document.querySelectorAll('.btn-toggle-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const coupons = getCoupons();
      const target = coupons.find(c => c.code === code);
      if (target) {
        target.active = !target.active;
        saveCoupons(coupons);
        renderDiscountsView();
        bindDiscountsEvents();
        showToast(`Discount "${code}" is now ${target.active ? 'Active' : 'Deactivated'}`, 'info');
      }
    });
  });

  // Delete coupon
  document.querySelectorAll('.btn-delete-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (confirm(`Are you sure you want to delete discount code "${code}"?`)) {
        let coupons = getCoupons();
        coupons = coupons.filter(c => c.code !== code);
        saveCoupons(coupons);
        renderDiscountsView();
        bindDiscountsEvents();
        showToast(`Discount code "${code}" deleted`, 'success');
      }
    });
  });
}
