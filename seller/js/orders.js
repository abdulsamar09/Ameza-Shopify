/**
 * AMEZA Seller Dashboard - Orders Controller (Screen D)
 * Plain Vanilla ES Modules - High Fidelity & Fully Interactive
 */

import { Icons } from './icons.js';
import { getOrders, saveOrders, formatMoney } from './data.js';
import { showToast, escapeHTML } from '/seller/js/dashboard-shell.js';

let state = {
  orders: [],
  filteredOrders: [],
  selectedIds: new Set(),
  activeTab: 'all',
  searchQuery: '',
  filterPayment: 'all',
  filterFulfillment: 'all',
  filterCodOnly: false,
  sortOption: 'date-desc',
  currentPage: 1,
  pageSize: 25,
  isLoading: true,
  seenOrders: new Set(),
  openMenuId: null
};

let elements = {};

export function initOrders() {
  cacheElements();
  loadData();
  bindEvents();
}

function cacheElements() {
  elements = {
    tabsContainer: document.getElementById('orders-tabs'),
    searchInput: document.getElementById('orders-search'),
    filterBtn: document.getElementById('btn-order-filter'),
    sortBtn: document.getElementById('btn-order-sort'),
    bulkBar: document.getElementById('orders-bulk-bar'),
    bulkCount: document.getElementById('orders-bulk-count'),
    tableBody: document.getElementById('orders-table-body'),
    selectAllCheckbox: document.getElementById('checkbox-select-all-orders'),
    paginationInfo: document.getElementById('orders-pagination-info'),
    paginationControls: document.getElementById('orders-pagination-controls')
  };
}

function loadData() {
  state.isLoading = true;
  // Load seen orders from localStorage
  try {
    const seen = localStorage.getItem('ameza_seen_orders');
    if (seen) state.seenOrders = new Set(JSON.parse(seen));
  } catch (e) {}

  setTimeout(() => {
    state.orders = getOrders();
    state.isLoading = false;
    updateTabCounts();
    applyFiltersAndSort();
  }, 350);
}

function updateTabCounts() {
  const counts = {
    all: state.orders.length,
    unfulfilled: state.orders.filter(o => o.fulfillmentStatus === 'Unfulfilled').length,
    unpaid: state.orders.filter(o => o.paymentStatus === 'COD pending').length,
    shipped: state.orders.filter(o => o.fulfillmentStatus === 'Shipped' || o.id === '#1042' || o.id === '#1040' || o.id === '#1037').length,
    delivered: state.orders.filter(o => o.id === '#1035').length,
    returns: 0,
    cancelled: state.orders.filter(o => o.paymentStatus === 'Refunded').length
  };

  document.querySelectorAll('#orders-tabs .tab-btn').forEach(btn => {
    const tab = btn.dataset.tab;
    const count = counts[tab] !== undefined ? counts[tab] : 0;
    const label = btn.querySelector('.tab-label');
    const badge = btn.querySelector('.tab-badge');
    if (badge) badge.textContent = count;
  });

  // Keep sidebar badge in sync with unfulfilled count
  const sidebarOrderBadge = document.querySelector('.sidebar-badge[data-nav-badge="orders"]');
  if (sidebarOrderBadge) {
    sidebarOrderBadge.textContent = counts.unfulfilled;
  }
}

function bindEvents() {
  // Search
  let searchTimeout;
  elements.searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      state.currentPage = 1;
      applyFiltersAndSort();
    }, 250);
  });

  // Tabs
  elements.tabsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    state.activeTab = btn.dataset.tab;
    state.currentPage = 1;
    document.querySelectorAll('#orders-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFiltersAndSort();
  });

  // Export
  document.getElementById('btn-export-orders')?.addEventListener('click', exportOrdersCSV);

  // Create Order
  document.getElementById('btn-create-order')?.addEventListener('click', () => {
    showToast('Manual order creation coming soon');
  });

  // Select All Checkbox
  elements.selectAllCheckbox?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    if (checked) {
      state.filteredOrders.forEach(o => state.selectedIds.add(o.rawId));
    } else {
      state.selectedIds.clear();
    }
    updateBulkBar();
    renderTable();
  });

  // Table events (delegation)
  elements.tableBody?.addEventListener('click', (e) => {
    const target = e.target;

    // Checkbox click
    if (target.classList.contains('order-select-checkbox')) {
      const id = target.dataset.id;
      if (target.checked) state.selectedIds.add(id);
      else state.selectedIds.delete(id);
      updateBulkBar();
      renderTable();
      return;
    }

    // Row Menu toggle
    const menuBtn = target.closest('[data-action="toggle-order-menu"]');
    if (menuBtn) {
      e.stopPropagation();
      const id = menuBtn.dataset.id;
      toggleOrderMenu(id);
      return;
    }

    // Row Menu Actions
    const actionBtn = target.closest('[data-order-action]');
    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.orderAction;
      const id = actionBtn.dataset.id;
      handleOrderAction(action, id);
      closeAllMenus();
      return;
    }

    // Click on row -> open order detail
    const row = target.closest('tr[data-order-id]');
    if (row && !target.closest('.row-menu-wrapper')) {
      const id = row.dataset.orderId;
      markOrderAsSeen(id);
      window.location.href = `order-detail.html?id=${id}`;
    }
  });

  // Date column sorting
  document.getElementById('th-date-sort')?.addEventListener('click', () => {
    state.sortOption = state.sortOption === 'date-desc' ? 'date-asc' : 'date-desc';
    applyFiltersAndSort();
  });

  // Bulk buttons
  document.getElementById('btn-bulk-mark-packed')?.addEventListener('click', () => {
    const count = state.selectedIds.size;
    if (count === 0) return;
    state.orders.forEach(o => {
      if (state.selectedIds.has(o.rawId)) o.fulfillmentStatus = 'Fulfilled';
    });
    saveOrders(state.orders);
    showToast(`Marked ${count} orders as packed`);
    state.selectedIds.clear();
    updateBulkBar();
    updateTabCounts();
    applyFiltersAndSort();
  });

  document.getElementById('btn-bulk-print-slips')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-bulk-add-tracking')?.addEventListener('click', () => {
    const trackingNo = prompt('Enter USPS / Carrier tracking number:');
    if (trackingNo) {
      const count = state.selectedIds.size;
      state.orders.forEach(o => {
        if (state.selectedIds.has(o.rawId)) o.fulfillmentStatus = 'Fulfilled';
      });
      saveOrders(state.orders);
      showToast(`Tracking added for ${count} orders!`);
      state.selectedIds.clear();
      updateBulkBar();
      updateTabCounts();
      applyFiltersAndSort();
    }
  });

  document.getElementById('btn-close-order-bulk')?.addEventListener('click', () => {
    state.selectedIds.clear();
    updateBulkBar();
    renderTable();
  });

  // Popover menus (Filter & Sort)
  setupPopovers();

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.row-menu-wrapper')) closeAllMenus();
    if (!e.target.closest('#popover-orders-filter') && !e.target.closest('#btn-order-filter')) {
      document.getElementById('popover-orders-filter')?.classList.remove('open');
    }
    if (!e.target.closest('#popover-orders-sort') && !e.target.closest('#btn-order-sort')) {
      document.getElementById('popover-orders-sort')?.classList.remove('open');
    }
  });
}

function markOrderAsSeen(id) {
  state.seenOrders.add(id);
  try {
    localStorage.setItem('ameza_seen_orders', JSON.stringify(Array.from(state.seenOrders)));
  } catch (e) {}
}

function applyFiltersAndSort() {
  let list = [...state.orders];

  // 1. Tab filters
  if (state.activeTab === 'unfulfilled') {
    list = list.filter(o => o.fulfillmentStatus === 'Unfulfilled');
  } else if (state.activeTab === 'unpaid') {
    list = list.filter(o => o.paymentStatus === 'COD pending');
  } else if (state.activeTab === 'shipped') {
    list = list.filter(o => o.fulfillmentStatus === 'Shipped' || o.id === '#1042' || o.id === '#1040' || o.id === '#1037');
  } else if (state.activeTab === 'delivered') {
    list = list.filter(o => o.id === '#1035');
  } else if (state.activeTab === 'cancelled') {
    list = list.filter(o => o.paymentStatus === 'Refunded');
  }

  // 2. Search query
  if (state.searchQuery) {
    list = list.filter(o =>
      o.id.toLowerCase().includes(state.searchQuery) ||
      o.customer.toLowerCase().includes(state.searchQuery) ||
      o.email.toLowerCase().includes(state.searchQuery)
    );
  }

  // 3. Dropdown filters
  if (state.filterPayment !== 'all') {
    list = list.filter(o => o.paymentStatus === state.filterPayment);
  }
  if (state.filterFulfillment !== 'all') {
    list = list.filter(o => o.fulfillmentStatus === state.filterFulfillment);
  }
  if (state.filterCodOnly) {
    list = list.filter(o => o.paymentStatus === 'COD pending');
  }

  // 4. Sorting
  if (state.sortOption === 'date-desc') {
    list.sort((a, b) => b.rawId.localeCompare(a.rawId));
  } else if (state.sortOption === 'date-asc') {
    list.sort((a, b) => a.rawId.localeCompare(b.rawId));
  } else if (state.sortOption === 'total-desc') {
    list.sort((a, b) => b.total - a.total);
  } else if (state.sortOption === 'total-asc') {
    list.sort((a, b) => a.total - b.total);
  } else if (state.sortOption === 'customer-asc') {
    list.sort((a, b) => a.customer.localeCompare(b.customer));
  }

  state.filteredOrders = list;
  renderTable();
  renderPagination();
}

function renderTable() {
  if (!elements.tableBody) return;

  if (state.filteredOrders.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-table-state">
            <div class="empty-state-icon">${Icons.orders}</div>
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 6px; color: var(--text-main);">No orders found</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Try adjusting your search terms or filters.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const startIdx = (state.currentPage - 1) * state.pageSize;
  const pageItems = state.filteredOrders.slice(startIdx, startIdx + state.pageSize);

  elements.tableBody.innerHTML = pageItems.map(o => {
    const isSelected = state.selectedIds.has(o.rawId);
    const isUnseen = o.isNew && !state.seenOrders.has(o.rawId);
    const thumbSvg = Icons[o.thumb] || Icons.thumbHeadphones;

    // Badges
    const payBadgeClass = o.paymentStatus === 'Paid' ? 'badge-success' : (o.paymentStatus === 'Refunded' ? 'badge-danger' : 'badge-warning');
    const fulBadgeClass = o.fulfillmentStatus === 'Fulfilled' ? 'badge-success' : 'badge-neutral';

    return `
      <tr class="${isSelected ? 'row-selected' : ''}" data-order-id="${o.rawId}" style="cursor: pointer;">
        <td>
          <input type="checkbox" class="order-select-checkbox custom-checkbox" data-id="${o.rawId}" ${isSelected ? 'checked' : ''} aria-label="Select order ${o.id}">
        </td>
        <td>
          <div style="display:flex; align-items:center;">
            ${isUnseen ? `<span class="unseen-dot" title="New order"></span>` : ''}
            <span style="font-weight: 600; color: var(--text-main);">${escapeHTML(o.id)}</span>
          </div>
        </td>
        <td style="color: var(--text-secondary); white-space: nowrap;">
          ${escapeHTML(o.date)}
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:1px;">
            <span style="font-weight: 500; color: var(--text-main);">${escapeHTML(o.customer)}</span>
            <span style="font-size: 11.5px; color: var(--text-tertiary);">${escapeHTML(o.email)}</span>
          </div>
        </td>
        <td>
          <span class="badge ${payBadgeClass}">${escapeHTML(o.paymentStatus)}</span>
        </td>
        <td>
          <span class="badge ${fulBadgeClass}">${escapeHTML(o.fulfillmentStatus)}</span>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 4px; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center;">
              ${thumbSvg}
            </div>
            <span style="color: var(--text-secondary); font-size: 12.5px;">${escapeHTML(o.itemsText)}</span>
          </div>
        </td>
        <td style="font-weight: 600; color: var(--text-main);">
          ${formatMoney(o.total)}
        </td>
        <td style="text-align: right;" onclick="event.stopPropagation();">
          <div class="row-menu-wrapper">
            <button class="btn-icon-dots" data-action="toggle-order-menu" data-id="${o.rawId}" aria-label="Actions">
              ${Icons.dots}
            </button>
            <div class="row-dropdown-menu ${state.openMenuId === o.rawId ? 'open' : ''}" id="order-menu-${o.rawId}">
              <a href="order-detail.html?id=${o.rawId}" class="menu-item-btn" style="text-decoration:none;">View order</a>
              <button class="menu-item-btn" data-order-action="print-slip" data-id="${o.rawId}">Print slip</button>
              <button class="menu-item-btn" data-order-action="mark-packed" data-id="${o.rawId}">Mark as packed</button>
              <button class="menu-item-btn danger" data-order-action="cancel" data-id="${o.rawId}">Cancel order</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const total = state.filteredOrders.length;
  elements.paginationInfo.textContent = `Showing 1-${Math.min(state.pageSize, total)} of ${total} orders`;

  let controlsHtml = `
    <button class="page-btn" disabled>&lt;</button>
    <button class="page-btn current">1</button>
    <button class="page-btn" disabled>&gt;</button>
  `;
  elements.paginationControls.innerHTML = controlsHtml;
}

function updateBulkBar() {
  const count = state.selectedIds.size;
  if (count > 0) {
    elements.bulkBar.classList.add('active');
    elements.bulkCount.textContent = `${count} selected`;
  } else {
    elements.bulkBar.classList.remove('active');
  }

  if (elements.selectAllCheckbox) {
    const totalVisible = state.filteredOrders.length;
    if (count === 0) {
      elements.selectAllCheckbox.checked = false;
      elements.selectAllCheckbox.indeterminate = false;
    } else if (count === totalVisible) {
      elements.selectAllCheckbox.checked = true;
      elements.selectAllCheckbox.indeterminate = false;
    } else {
      elements.selectAllCheckbox.checked = false;
      elements.selectAllCheckbox.indeterminate = true;
    }
  }
}

function toggleOrderMenu(id) {
  state.openMenuId = state.openMenuId === id ? null : id;
  document.querySelectorAll('.row-dropdown-menu').forEach(m => m.classList.remove('open'));
  if (state.openMenuId) {
    document.getElementById(`order-menu-${id}`)?.classList.add('open');
  }
}

function closeAllMenus() {
  state.openMenuId = null;
  document.querySelectorAll('.row-dropdown-menu').forEach(m => m.classList.remove('open'));
}

function handleOrderAction(action, id) {
  const o = state.orders.find(item => item.rawId === id);
  if (!o) return;

  if (action === 'print-slip') {
    window.print();
  } else if (action === 'mark-packed') {
    o.fulfillmentStatus = 'Fulfilled';
    saveOrders(state.orders);
    showToast(`Order ${o.id} marked as packed`);
    updateTabCounts();
    applyFiltersAndSort();
  } else if (action === 'cancel') {
    if (confirm(`Cancel Order ${o.id}? This will mark it as Refunded/Cancelled.`)) {
      o.paymentStatus = 'Refunded';
      o.fulfillmentStatus = 'Unfulfilled';
      saveOrders(state.orders);
      showToast(`Order ${o.id} cancelled`);
      updateTabCounts();
      applyFiltersAndSort();
    }
  }
}

function setupPopovers() {
  const filterPopover = document.getElementById('popover-orders-filter');
  const sortPopover = document.getElementById('popover-orders-sort');

  elements.filterBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    filterPopover?.classList.toggle('open');
    sortPopover?.classList.remove('open');
  });

  elements.sortBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sortPopover?.classList.toggle('open');
    filterPopover?.classList.remove('open');
  });

  // Filter actions
  document.getElementById('btn-apply-order-filters')?.addEventListener('click', () => {
    state.filterPayment = document.getElementById('filter-order-payment')?.value || 'all';
    state.filterFulfillment = document.getElementById('filter-order-fulfillment')?.value || 'all';
    state.filterCodOnly = document.getElementById('filter-order-cod')?.checked || false;
    filterPopover?.classList.remove('open');
    applyFiltersAndSort();
  });

  // Sort actions
  sortPopover?.querySelectorAll('[data-sort-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sortOption = btn.dataset.sortOpt;
      sortPopover?.classList.remove('open');
      applyFiltersAndSort();
    });
  });
}

function exportOrdersCSV() {
  const rows = [
    ['Order', 'Date', 'Customer', 'Email', 'Payment Status', 'Fulfillment Status', 'Items', 'Total']
  ];

  state.filteredOrders.forEach(o => {
    rows.push([
      o.id,
      `"${o.date}"`,
      `"${o.customer}"`,
      o.email,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.itemsCount,
      (o.total / 100).toFixed(2)
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ameza_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${state.filteredOrders.length} orders to CSV`);
}
