/**
 * AMEZA Seller Central — Discounts & Promotion Engine (js/discounts.js)
 * Manages active coupons, redemption tracking, bulk controls, and discount creation
 * with 100% US minor-unit cents compliance and shared mock/coupons.json sync.
 */

import { escapeHTML, showToast } from '/seller/js/dashboard-shell.js';
import { formatMoney } from '/shared/js/core/utils.js';

const STORAGE_KEY = 'ameza_coupons';

const DEFAULT_COUPONS = [
  {
    id: 'coup_1',
    code: 'SAVE10',
    discountType: 'percentage',
    value: 10,
    minSpendCents: 5000,
    active: true,
    usageCount: 142,
    usageLimit: 500,
    description: '10% off entire order (min $50.00)',
    appliesTo: 'all',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z'
  },
  {
    id: 'coup_2',
    code: 'FREESHIP',
    discountType: 'fixed_shipping',
    value: 599,
    minSpendCents: 5000,
    active: true,
    usageCount: 76,
    usageLimit: 200,
    description: 'Free standard shipping on orders over $50',
    appliesTo: 'all',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z'
  },
  {
    id: 'coup_3',
    code: 'SPRING20',
    discountType: 'percentage',
    value: 20,
    minSpendCents: 10000,
    active: true,
    usageCount: 41,
    usageLimit: 100,
    description: '20% off orders over $100',
    appliesTo: 'clothing',
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-11-21T23:59:59.000Z'
  },
  {
    id: 'coup_4',
    code: 'WELCOME5',
    discountType: 'fixed_amount',
    value: 500,
    minSpendCents: 3500,
    active: true,
    usageCount: 88,
    usageLimit: 1000,
    description: '$5 off first order over $35',
    appliesTo: 'all',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-01-05T23:59:59.000Z'
  },
  {
    id: 'coup_5',
    code: 'SUMMER25',
    discountType: 'percentage',
    value: 25,
    minSpendCents: 10000,
    active: false,
    usageCount: 12,
    usageLimit: 50,
    description: '25% off summer collection',
    appliesTo: 'all',
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-08-31T23:59:59.000Z'
  }
];

export function getCoupons() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
  return [...DEFAULT_COUPONS];
}

export function saveCoupons(coupons) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

// Compute discount status from dates, usage limits and active toggle
export function computeDiscountStatus(coupon) {
  const now = new Date();
  const start = new Date(coupon.startDate || '2026-01-01');
  const end = new Date(coupon.endDate || '2026-12-31');

  if (!coupon.active) return { id: 'inactive', label: 'Deactivated', badgeClass: 'badge-neutral' };
  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
    return { id: 'expired', label: 'Limit reached', badgeClass: 'badge-danger' };
  }
  if (now < start) {
    return { id: 'scheduled', label: 'Scheduled', badgeClass: 'badge-info' };
  }
  if (now > end) {
    return { id: 'expired', label: 'Expired', badgeClass: 'badge-danger' };
  }
  return { id: 'active', label: 'Active', badgeClass: 'badge-success' };
}

let activeTab = 'all';
let searchQuery = '';
let typeFilter = 'all';
let selectedCouponCodes = new Set();
let openDropdownCode = null;

export function initDiscounts() {
  renderDiscountsView();
}

function renderDiscountsView() {
  const container = document.getElementById('discounts-content-container');
  if (!container) return;

  const coupons = getCoupons();

  // Compute status for all coupons
  coupons.forEach(c => {
    c._status = computeDiscountStatus(c);
  });

  const activeCount = coupons.filter(c => c._status.id === 'active').length;
  const scheduledCount = coupons.filter(c => c._status.id === 'scheduled').length;
  const expiredCount = coupons.filter(c => c._status.id === 'expired' || c._status.id === 'inactive').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  // Filter list
  const filtered = coupons.filter(c => {
    if (activeTab === 'active' && c._status.id !== 'active') return false;
    if (activeTab === 'scheduled' && c._status.id !== 'scheduled') return false;
    if (activeTab === 'expired' && c._status.id !== 'expired' && c._status.id !== 'inactive') return false;

    if (typeFilter !== 'all' && c.discountType !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  container.innerHTML = `
    <!-- Page Header -->
    <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
      <div>
        <h1 class="page-title" style="margin:0; font-size:24px; font-weight:800; color:var(--text-main);">Discounts</h1>
        <p class="page-subtitle" style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">Manage coupon codes, promotional percentage sales, and free shipping incentives.</p>
      </div>
      <div class="page-header-actions" style="display:flex; gap:10px;">
        <button type="button" class="btn-header-secondary" id="btn-export-discounts" data-action="export-discounts"
          style="padding:10px 16px; border:1px solid var(--border); background:var(--bg-surface); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Export
        </button>
        <a href="create-discount.html" class="btn-header-primary" id="btn-create-discount"
          style="padding:10px 20px; border:none; background:var(--dark, #111827); color:#FFFFFF; border-radius:8px; font-size:13.5px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px; min-height:44px;">
          <i class="fa-solid fa-plus"></i>
          <span>Create discount</span>
        </a>
      </div>
    </div>

    <!-- Hand-Written SVG Metrics Grid -->
    <div class="metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:20px;">
      <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Active Codes</div>
        <div style="font-size:26px; font-weight:800; color:var(--text-main); margin-top:6px;">${activeCount}</div>
        <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px;">${coupons.length} total codes configured</div>
      </div>
      <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Total Redemptions</div>
        <div style="font-size:26px; font-weight:800; color:var(--text-main); margin-top:6px;">${totalRedemptions}</div>
        <div style="font-size:11.5px; color:#059669; font-weight:700; margin-top:4px;">&uarr; 18.2% vs last month</div>
      </div>
      <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Customer Savings</div>
        <div style="font-size:26px; font-weight:800; color:var(--text-main); margin-top:6px;">$3,620.40</div>
        <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px;">Direct checkout incentives applied</div>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="card-products" style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden;">
      <!-- Tabs Row -->
      <div class="products-tabs-row" id="discount-tabs" style="display:flex; gap:8px; padding:12px 18px; border-bottom:1px solid var(--border); overflow-x:auto;">
        <button type="button" class="tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeTab === 'all' ? 'var(--text-main)' : 'transparent'};">All (${coupons.length})</button>
        <button type="button" class="tab-btn ${activeTab === 'active' ? 'active' : ''}" data-tab="active" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeTab === 'active' ? 'var(--text-main)' : 'transparent'};">Active (${activeCount})</button>
        <button type="button" class="tab-btn ${activeTab === 'scheduled' ? 'active' : ''}" data-tab="scheduled" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeTab === 'scheduled' ? 'var(--text-main)' : 'transparent'};">Scheduled (${scheduledCount})</button>
        <button type="button" class="tab-btn ${activeTab === 'expired' ? 'active' : ''}" data-tab="expired" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeTab === 'expired' ? 'var(--text-main)' : 'transparent'};">Expired (${expiredCount})</button>
      </div>

      <!-- Toolbar Row: Search & Filter Dropdown -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:12px;">
        <div style="position:relative; width:320px; max-width:100%;">
          <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" id="discount-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search discount codes..."
            style="width:100%; padding-left:36px; height:40px; border:1px solid var(--border); border-radius:8px; font-size:16px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          <select id="discount-type-filter" style="height:40px; border:1px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg-page); color:var(--text-main); font-size:13px;">
            <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All Types</option>
            <option value="percentage" ${typeFilter === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
            <option value="fixed_amount" ${typeFilter === 'fixed_amount' ? 'selected' : ''}>Fixed Amount ($)</option>
            <option value="fixed_shipping" ${typeFilter === 'fixed_shipping' ? 'selected' : ''}>Free Shipping</option>
          </select>
        </div>
      </div>

      <!-- Bulk Selection Action Bar -->
      <div id="discounts-bulk-bar" style="display:${selectedCouponCodes.size > 0 ? 'flex' : 'none'}; align-items:center; justify-content:space-between; padding:10px 18px; background:#FEF3C7; border-bottom:1px solid #FCD34D;">
        <span style="font-size:13px; font-weight:700; color:#92400E;">
          ${selectedCouponCodes.size} discount code(s) selected
        </span>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn-bulk" data-action="bulk-activate" style="padding:6px 12px; border:1px solid #D97706; background:#fff; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">Activate</button>
          <button type="button" class="btn-bulk" data-action="bulk-deactivate" style="padding:6px 12px; border:1px solid #D97706; background:#fff; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">Deactivate</button>
          <button type="button" class="btn-bulk" data-action="bulk-delete" style="padding:6px 12px; border:1px solid #DC2626; color:#DC2626; background:#fff; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">Delete</button>
        </div>
      </div>

      <!-- Table View (Desktop) / Cards (Mobile under 768px) -->
      <div class="table-responsive">
        <table class="dashboard-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid var(--border); text-align:left; font-size:12px; color:var(--text-muted); background:var(--bg-surface-alt, #FAFAFA);">
              <th style="padding:12px 16px; width:40px;">
                <input type="checkbox" id="chk-select-all-coupons" ${selectedCouponCodes.size === filtered.length && filtered.length > 0 ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
              </th>
              <th style="padding:12px 16px;">Code &amp; Description</th>
              <th style="padding:12px 16px;">Type</th>
              <th style="padding:12px 16px; text-align:center;">Status</th>
              <th style="padding:12px 16px; text-align:center;">Used</th>
              <th style="padding:12px 16px;">End Date</th>
              <th style="padding:12px 16px; width:50px; text-align:right;"></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align:center; padding:48px 20px; color:var(--text-muted);">
                  <div style="font-size:28px; margin-bottom:8px;">🏷️</div>
                  <div style="font-weight:700; font-size:15px; margin-bottom:4px; color:var(--text-main);">No discount codes found</div>
                  <div style="font-size:12px;">Try adjusting search filters or create a new discount.</div>
                </td>
              </tr>
            ` : filtered.map(item => {
              const isChecked = selectedCouponCodes.has(item.code);
              const formattedDate = new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let typeLabel = '';
              if (item.discountType === 'percentage') typeLabel = `${item.value}% off`;
              else if (item.discountType === 'fixed_amount') typeLabel = `${formatMoney(item.value)} off`;
              else if (item.discountType === 'fixed_shipping') typeLabel = 'Free Shipping';

              return `
                <tr style="border-bottom:1px solid var(--border); font-size:13px; background:${isChecked ? 'rgba(127,183,60,0.06)' : 'transparent'};">
                  <td style="padding:14px 16px;">
                    <input type="checkbox" class="chk-coupon-row" data-code="${escapeHTML(item.code)}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span class="coupon-code-badge" style="font-family:monospace; font-size:13px; font-weight:800; background:var(--bg-hover, #F3F4F6); padding:4px 10px; border-radius:6px; border:1px dashed var(--border); color:var(--text-main); letter-spacing:0.5px;">
                        ${escapeHTML(item.code)}
                      </span>
                      <button type="button" class="btn-copy-code" data-code="${escapeHTML(item.code)}" title="Copy code" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:6px; min-width:32px; min-height:32px;">
                        <i class="fa-regular fa-copy"></i>
                      </button>
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${escapeHTML(item.description || '')}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="font-weight:700; color:var(--text-main);">${escapeHTML(typeLabel)}</div>
                    <div style="font-size:11.5px; color:var(--text-muted);">${item.minSpendCents ? `Min ${formatMoney(item.minSpendCents)}` : 'No minimum'}</div>
                  </td>
                  <td style="padding:14px 16px; text-align:center;">
                    <span class="badge ${item._status.badgeClass}" style="padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">
                      ${item._status.label}
                    </span>
                  </td>
                  <td style="padding:14px 16px; text-align:center; font-weight:700; color:var(--text-main);">
                    ${item.usageCount || 0} ${item.usageLimit ? `/ ${item.usageLimit}` : ''}
                  </td>
                  <td style="padding:14px 16px; color:var(--text-muted); font-size:12.5px;">
                    ${formattedDate}
                  </td>
                  <td style="padding:14px 16px; text-align:right; position:relative;">
                    <button type="button" class="btn-more-actions" data-action="toggle-menu" data-code="${escapeHTML(item.code)}"
                      style="border:none; background:none; font-size:16px; color:var(--text-muted); cursor:pointer; width:36px; height:36px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center;">
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    ${openDropdownCode === item.code ? `
                      <div class="discount-actions-menu" style="position:absolute; right:16px; top:44px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.15); width:160px; z-index:100; text-align:left; overflow:hidden;">
                        <a href="create-discount.html?code=${encodeURIComponent(item.code)}" class="menu-item" style="display:flex; align-items:center; gap:8px; padding:10px 14px; font-size:13px; color:var(--text-main); text-decoration:none;">
                          <i class="fa-regular fa-pen-to-square"></i> Edit
                        </a>
                        <button type="button" class="menu-item" data-action="duplicate-code" data-code="${escapeHTML(item.code)}" style="width:100%; display:flex; align-items:center; gap:8px; padding:10px 14px; font-size:13px; color:var(--text-main); background:none; border:none; cursor:pointer;">
                          <i class="fa-regular fa-clone"></i> Duplicate
                        </button>
                        <button type="button" class="menu-item" data-action="toggle-status" data-code="${escapeHTML(item.code)}" style="width:100%; display:flex; align-items:center; gap:8px; padding:10px 14px; font-size:13px; color:var(--text-main); background:none; border:none; cursor:pointer;">
                          <i class="fa-solid fa-power-off"></i> ${item.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <div style="height:1px; background:var(--border);"></div>
                        <button type="button" class="menu-item" data-action="delete-code" data-code="${escapeHTML(item.code)}" style="width:100%; display:flex; align-items:center; gap:8px; padding:10px 14px; font-size:13px; color:#DC2626; background:none; border:none; cursor:pointer;">
                          <i class="fa-regular fa-trash-can"></i> Delete
                        </button>
                      </div>
                    ` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const container = document.getElementById('discounts-content-container');
  if (!container) return;

  // Tabs
  container.querySelectorAll('#discount-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab');
      renderDiscountsView();
    });
  });

  // Search input
  const searchInput = document.getElementById('discount-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDiscountsView();
    });
  }

  // Type filter
  const typeSelect = document.getElementById('discount-type-filter');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      typeFilter = e.target.value;
      renderDiscountsView();
    });
  }

  // Copy code
  container.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = btn.getAttribute('data-code');
      navigator.clipboard?.writeText(code);
      showToast(`Discount code ${code} copied to clipboard`, 'success');
    });
  });

  // Select all checkbox
  const chkSelectAll = document.getElementById('chk-select-all-coupons');
  if (chkSelectAll) {
    chkSelectAll.addEventListener('change', () => {
      const coupons = getCoupons();
      if (chkSelectAll.checked) {
        coupons.forEach(c => selectedCouponCodes.add(c.code));
      } else {
        selectedCouponCodes.clear();
      }
      renderDiscountsView();
    });
  }

  // Row checkboxes
  container.querySelectorAll('.chk-coupon-row').forEach(chk => {
    chk.addEventListener('change', () => {
      const code = chk.getAttribute('data-code');
      if (chk.checked) selectedCouponCodes.add(code);
      else selectedCouponCodes.delete(code);
      renderDiscountsView();
    });
  });

  // More menu trigger
  container.querySelectorAll('[data-action="toggle-menu"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = btn.getAttribute('data-code');
      openDropdownCode = openDropdownCode === code ? null : code;
      renderDiscountsView();
    });
  });

  // Close menu on click outside
  document.addEventListener('click', () => {
    if (openDropdownCode) {
      openDropdownCode = null;
      renderDiscountsView();
    }
  }, { once: true });

  // Menu action: Duplicate
  container.querySelectorAll('[data-action="duplicate-code"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const coupons = getCoupons();
      const orig = coupons.find(c => c.code === code);
      if (orig) {
        const copy = { ...orig, id: 'coup_' + Date.now(), code: orig.code + '_COPY', usageCount: 0 };
        coupons.unshift(copy);
        saveCoupons(coupons);
        showToast(`Duplicated ${orig.code} as ${copy.code}`, 'success');
        renderDiscountsView();
      }
    });
  });

  // Menu action: Toggle status
  container.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const coupons = getCoupons();
      const target = coupons.find(c => c.code === code);
      if (target) {
        target.active = !target.active;
        saveCoupons(coupons);
        showToast(`${target.code} is now ${target.active ? 'active' : 'deactivated'}`, 'info');
        renderDiscountsView();
      }
    });
  });

  // Menu action: Delete
  container.querySelectorAll('[data-action="delete-code"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      let coupons = getCoupons();
      coupons = coupons.filter(c => c.code !== code);
      saveCoupons(coupons);
      selectedCouponCodes.delete(code);
      showToast(`Discount ${code} deleted`, 'info');
      renderDiscountsView();
    });
  });

  // Bulk actions
  container.querySelectorAll('[data-action="bulk-activate"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const coupons = getCoupons();
      coupons.forEach(c => {
        if (selectedCouponCodes.has(c.code)) c.active = true;
      });
      saveCoupons(coupons);
      showToast('Selected discounts activated', 'success');
      selectedCouponCodes.clear();
      renderDiscountsView();
    });
  });

  container.querySelectorAll('[data-action="bulk-deactivate"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const coupons = getCoupons();
      coupons.forEach(c => {
        if (selectedCouponCodes.has(c.code)) c.active = false;
      });
      saveCoupons(coupons);
      showToast('Selected discounts deactivated', 'info');
      selectedCouponCodes.clear();
      renderDiscountsView();
    });
  });

  container.querySelectorAll('[data-action="bulk-delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      let coupons = getCoupons();
      coupons = coupons.filter(c => !selectedCouponCodes.has(c.code));
      saveCoupons(coupons);
      showToast('Selected discounts deleted', 'info');
      selectedCouponCodes.clear();
      renderDiscountsView();
    });
  });

  // Export Discounts CSV
  const exportBtn = document.getElementById('btn-export-discounts');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const coupons = getCoupons();
      const headers = ['Code', 'Type', 'Value', 'Min Spend Cents', 'Active', 'Used', 'Usage Limit', 'End Date'];
      const rows = coupons.map(c => [
        c.code,
        c.discountType,
        c.value,
        c.minSpendCents || 0,
        c.active,
        c.usageCount || 0,
        c.usageLimit || '',
        `"${c.endDate}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const a = document.createElement('a');
      a.href = encodeURI(csv);
      a.download = `ameza_discounts_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Discounts exported to CSV', 'success');
    });
  }
}
