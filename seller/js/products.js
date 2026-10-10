/**
 * AMEZA Seller Dashboard - Products Controller (Screen A)
 * Plain Vanilla ES Modules - High Fidelity & Fully Interactive
 */

import { Icons } from './icons.js';
import { getProducts, saveProducts, formatMoney, CATEGORIES_LIST } from './data.js';
import { showToast, escapeHTML } from '/seller/js/dashboard-shell.js';

let state = {
  products: [],
  filteredProducts: [],
  selectedIds: new Set(),
  activeTab: 'all',
  searchQuery: '',
  filterStatus: 'all',
  filterCategory: 'all',
  filterPriceRange: 'all',
  filterMinSales: 0,
  filterInStockOnly: false,
  sortColumn: 'default',
  sortDirection: 'asc',
  currentPage: 1,
  pageSize: 25,
  isLoading: true,
  openMenuId: null
};

// DOM Elements cache
let elements = {};

export function initProducts() {
  cacheElements();
  loadData();
  bindEvents();
}

function cacheElements() {
  elements = {
    tabsContainer: document.getElementById('products-tabs'),
    searchInput: document.getElementById('products-search'),
    statusDropdownBtn: document.getElementById('btn-filter-status'),
    categoryDropdownBtn: document.getElementById('btn-filter-category'),
    priceDropdownBtn: document.getElementById('btn-filter-price'),
    moreFiltersBtn: document.getElementById('btn-more-filters'),
    filterChipsBar: document.getElementById('filter-chips-bar'),
    chipsList: document.getElementById('chips-list'),
    bulkBar: document.getElementById('bulk-selection-bar'),
    bulkCount: document.getElementById('bulk-selected-count'),
    tableBody: document.getElementById('products-table-body'),
    selectAllCheckbox: document.getElementById('checkbox-select-all'),
    paginationInfo: document.getElementById('pagination-info'),
    paginationControls: document.getElementById('pagination-controls'),
    modalOverlay: document.getElementById('products-modal-overlay'),
    modalContainer: document.getElementById('products-modal-container')
  };
}

function loadData() {
  // Simulate 400ms skeleton loading delay for realistic feel
  state.isLoading = true;
  renderSkeleton();

  setTimeout(() => {
    state.products = getProducts();
    state.isLoading = false;
    applyFiltersAndSort();
  }, 400);
}

function bindEvents() {
  // Search input debounced
  let searchTimeout;
  elements.searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      state.currentPage = 1;
      applyFiltersAndSort();
    }, 250);
  });

  // Tab filtering
  elements.tabsContainer?.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (!tabBtn) return;
    state.activeTab = tabBtn.dataset.tab;
    state.currentPage = 1;
    updateTabActiveStyles();
    applyFiltersAndSort();
  });

  // Export CSV
  document.getElementById('btn-export-products')?.addEventListener('click', exportToCSV);

  // Import button dispatches 'open-import' event
  document.getElementById('btn-import-products')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-import'));
  });

  // Select all checkbox
  elements.selectAllCheckbox?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    if (checked) {
      state.filteredProducts.forEach(p => state.selectedIds.add(p.id));
    } else {
      state.selectedIds.clear();
    }
    updateBulkBar();
    renderTable();
  });

  // Table clicks (Delegation for selection, inline editing, and row menu)
  elements.tableBody?.addEventListener('click', (e) => {
    const target = e.target;

    // Checkbox selection
    if (target.classList.contains('row-select-checkbox')) {
      const id = parseInt(target.dataset.id, 10);
      if (target.checked) {
        state.selectedIds.add(id);
      } else {
        state.selectedIds.delete(id);
      }
      updateBulkBar();
      renderTable();
      return;
    }

    // Row Menu toggle
    const menuBtn = target.closest('[data-action="toggle-menu"]');
    if (menuBtn) {
      e.stopPropagation();
      const id = parseInt(menuBtn.dataset.id, 10);
      toggleRowMenu(id);
      return;
    }

    // Row Menu Actions
    const actionBtn = target.closest('[data-menu-action]');
    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.menuAction;
      const id = parseInt(actionBtn.dataset.id, 10);
      handleRowMenuAction(action, id);
      closeAllMenus();
      return;
    }

    // Inline edit Price
    const priceCell = target.closest('[data-action="edit-price"]');
    if (priceCell && !priceCell.querySelector('input')) {
      makeCellEditable(priceCell, 'price');
      return;
    }

    // Inline edit Inventory
    const invCell = target.closest('[data-action="edit-inventory"]');
    if (invCell && !invCell.querySelector('input')) {
      makeCellEditable(invCell, 'inventory');
      return;
    }
  });

  // Column header sorting
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortColumn === col) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortColumn = col;
        state.sortDirection = 'asc';
      }
      updateSortHeaders();
      applyFiltersAndSort();
    });
  });

  // Bulk actions delegation
  document.getElementById('bulk-publish')?.addEventListener('click', () => bulkUpdateStatus('Active'));
  document.getElementById('bulk-unpublish')?.addEventListener('click', () => bulkUpdateStatus('Draft'));
  document.getElementById('bulk-change-price')?.addEventListener('click', openBulkPriceModal);
  document.getElementById('bulk-delete')?.addEventListener('click', openBulkDeleteModal);

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.row-menu-wrapper')) {
      closeAllMenus();
    }
    if (!e.target.closest('.filter-popover') && !e.target.closest('.btn-filter-dropdown')) {
      closeAllPopovers();
    }
  });

  // Filter Dropdowns
  setupFilterPopovers();
}

function updateTabActiveStyles() {
  document.querySelectorAll('#products-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });
}

function updateSortHeaders() {
  document.querySelectorAll('th.sortable').forEach(th => {
    const col = th.dataset.sort;
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) {
      if (state.sortColumn === col) {
        arrow.innerHTML = state.sortDirection === 'asc' ? Icons.arrowUp : Icons.arrowDown;
        arrow.style.display = 'inline-flex';
        arrow.style.opacity = '1';
      } else {
        arrow.style.display = 'none';
      }
    }
  });
}

function applyFiltersAndSort() {
  let list = [...state.products];

  // 1. Tab filtering
  if (state.activeTab === 'active') {
    list = list.filter(p => p.status === 'Active');
  } else if (state.activeTab === 'draft') {
    list = list.filter(p => p.status === 'Draft');
  } else if (state.activeTab === 'pending') {
    list = list.filter(p => p.status === 'Pending review');
  } else if (state.activeTab === 'rejected') {
    list = list.filter(p => p.status === 'Rejected');
  } else if (state.activeTab === 'lowstock') {
    list = list.filter(p => p.inventory <= 10);
  }

  // 2. Search query (Title or SKU)
  if (state.searchQuery) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(state.searchQuery) ||
      p.sku.toLowerCase().includes(state.searchQuery)
    );
  }

  // 3. Dropdown filters
  if (state.filterStatus !== 'all') {
    list = list.filter(p => p.status === state.filterStatus);
  }
  if (state.filterCategory !== 'all') {
    list = list.filter(p => p.category === state.filterCategory);
  }
  if (state.filterPriceRange !== 'all') {
    if (state.filterPriceRange === 'under25') list = list.filter(p => p.price < 2500);
    else if (state.filterPriceRange === '25to50') list = list.filter(p => p.price >= 2500 && p.price <= 5000);
    else if (state.filterPriceRange === '50to100') list = list.filter(p => p.price > 5000 && p.price <= 10000);
    else if (state.filterPriceRange === 'over100') list = list.filter(p => p.price > 10000);
  }

  // 4. More filters
  if (state.filterMinSales > 0) {
    list = list.filter(p => p.sales >= state.filterMinSales);
  }
  if (state.filterInStockOnly) {
    list = list.filter(p => p.inventory > 0);
  }

  // 5. Sorting (only if sortColumn is not default)
  if (state.sortColumn !== 'default') {
    list.sort((a, b) => {
      let valA = a[state.sortColumn];
      let valB = b[state.sortColumn];

      if (state.sortColumn === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  state.filteredProducts = list;
  renderFilterChips();
  renderTable();
  renderPagination();
}

function renderFilterChips() {
  const chips = [];

  if (state.searchQuery) {
    chips.push({ key: 'search', label: `Search: "${state.searchQuery}"` });
  }
  if (state.filterStatus !== 'all') {
    chips.push({ key: 'status', label: `Status: ${state.filterStatus}` });
  }
  if (state.filterCategory !== 'all') {
    chips.push({ key: 'category', label: `Category: ${state.filterCategory}` });
  }
  if (state.filterPriceRange !== 'all') {
    const labels = {
      under25: 'Under $25',
      '25to50': '$25 to $50',
      '50to100': '$50 to $100',
      over100: 'Over $100'
    };
    chips.push({ key: 'priceRange', label: `Price: ${labels[state.filterPriceRange] || state.filterPriceRange}` });
  }
  if (state.filterMinSales > 0) {
    chips.push({ key: 'sales', label: `Min Sales: ${state.filterMinSales}` });
  }
  if (state.filterInStockOnly) {
    chips.push({ key: 'inStock', label: 'In stock only' });
  }

  if (chips.length > 0) {
    elements.filterChipsBar.style.display = 'flex';
    elements.chipsList.innerHTML = chips.map(c => `
      <span class="filter-chip">
        ${escapeHTML(c.label)}
        <button class="filter-chip-remove" data-chip-key="${c.key}" aria-label="Remove filter">${Icons.close}</button>
      </span>
    `).join('') + `<span class="filter-clear-all" data-action="clear-all-filters">Clear all</span>`;

    elements.chipsList.querySelectorAll('[data-chip-key]').forEach(btn => {
      btn.addEventListener('click', () => removeFilter(btn.dataset.chipKey));
    });

    elements.chipsList.querySelector('[data-action="clear-all-filters"]')?.addEventListener('click', clearAllFilters);
  } else {
    elements.filterChipsBar.style.display = 'none';
    elements.chipsList.innerHTML = '';
  }
}

function removeFilter(key) {
  if (key === 'search') {
    state.searchQuery = '';
    if (elements.searchInput) elements.searchInput.value = '';
  } else if (key === 'status') {
    state.filterStatus = 'all';
  } else if (key === 'category') {
    state.filterCategory = 'all';
  } else if (key === 'priceRange') {
    state.filterPriceRange = 'all';
  } else if (key === 'sales') {
    state.filterMinSales = 0;
  } else if (key === 'inStock') {
    state.filterInStockOnly = false;
  }
  applyFiltersAndSort();
}

function clearAllFilters() {
  state.searchQuery = '';
  state.filterStatus = 'all';
  state.filterCategory = 'all';
  state.filterPriceRange = 'all';
  state.filterMinSales = 0;
  state.filterInStockOnly = false;
  if (elements.searchInput) elements.searchInput.value = '';
  applyFiltersAndSort();
}

function renderTable() {
  if (!elements.tableBody) return;

  if (state.filteredProducts.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-table-state">
            <div class="empty-state-icon">${Icons.products}</div>
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 6px; color: var(--text-main);">No products match your filters</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Try adjusting your search terms or clearing current filter selections.</p>
            <button class="btn-header-secondary" data-action="reset-filters" style="margin: 0 auto;">Clear filters</button>
          </div>
        </td>
      </tr>
    `;
    elements.tableBody.querySelector('[data-action="reset-filters"]')?.addEventListener('click', clearAllFilters);
    return;
  }

  // Slice for current page
  const startIdx = (state.currentPage - 1) * state.pageSize;
  const pageItems = state.filteredProducts.slice(startIdx, startIdx + state.pageSize);

  elements.tableBody.innerHTML = pageItems.map(p => {
    const isSelected = state.selectedIds.has(p.id);
    const thumbSvg = Icons[p.thumb] || Icons.products;
    const statusClass = getStatusBadgeClass(p.status);

    // Inventory display matching Image 1
    let inventoryHtml = '';
    if (p.sku === 'SW-007') {
      inventoryHtml = `<span class="stock-out" style="color: #DC2626; font-weight: 600;">Out of stock</span>`;
    } else if (p.sku === 'WB-008' || p.inventory <= 0) {
      inventoryHtml = `<span class="stock-out" style="color: #DC2626; font-weight: 600;">0 in stock</span>`;
    } else {
      inventoryHtml = `<span class="stock-instock">${p.inventory} in stock</span>`;
    }

    return `
      <tr class="${isSelected ? 'row-selected' : ''}" data-id="${p.id}">
        <td>
          <input type="checkbox" class="row-select-checkbox custom-checkbox" data-id="${p.id}" ${isSelected ? 'checked' : ''} aria-label="Select ${escapeHTML(p.name)}">
        </td>
        <td>
          <div class="product-cell">
            <div class="product-thumb-box">${thumbSvg}</div>
            <div class="product-name-col">
              <a href="add-product.html?id=${p.id}" class="product-title-text">${escapeHTML(p.name)}</a>
              <span class="product-sku-text">SKU: ${escapeHTML(p.sku)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${statusClass}">${escapeHTML(p.status)}</span>
        </td>
        <td>
          <div class="editable-cell" data-action="edit-inventory" data-id="${p.id}" title="Click to edit inventory">
            ${inventoryHtml}
          </div>
        </td>
        <td>
          <span style="color: var(--text-secondary);">${escapeHTML(p.category || '-')}</span>
        </td>
        <td>
          <div class="editable-cell" data-action="edit-price" data-id="${p.id}" title="Click to edit price">
            <span style="font-weight: 500;">${formatMoney(p.price)}</span>
          </div>
        </td>
        <td>
          <span style="color: var(--text-secondary);">${p.sales.toLocaleString()}</span>
        </td>
        <td style="text-align: right;">
          <div class="row-menu-wrapper">
            <button class="btn-icon-dots" data-action="toggle-menu" data-id="${p.id}" aria-label="Product actions">
              ${Icons.dots}
            </button>
            <div class="row-dropdown-menu ${state.openMenuId === p.id ? 'open' : ''}" id="row-menu-${p.id}">
              <a href="add-product.html?id=${p.id}" class="menu-item-btn" style="text-decoration:none;">Edit</a>
              <button class="menu-item-btn" data-menu-action="duplicate" data-id="${p.id}">Duplicate</button>
              <button class="menu-item-btn" data-menu-action="archive" data-id="${p.id}">Archive</button>
              ${p.status === 'Rejected' ? `<button class="menu-item-btn" data-menu-action="view-reason" data-id="${p.id}" style="color: #DC2626;">View reason</button>` : ''}
              <button class="menu-item-btn danger" data-menu-action="delete" data-id="${p.id}">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Active': return 'badge-success';
    case 'Draft': return 'badge-neutral';
    case 'Pending review': return 'badge-warning';
    case 'Rejected': return 'badge-danger';
    default: return 'badge-neutral';
  }
}

function renderPagination() {
  const total = state.filteredProducts.length;
  if (total === 0) {
    elements.paginationInfo.textContent = 'Showing 0 products';
    elements.paginationControls.innerHTML = '';
    return;
  }

  const startIdx = (state.currentPage - 1) * state.pageSize + 1;
  const endIdx = Math.min(state.currentPage * state.pageSize, total);
  elements.paginationInfo.textContent = `Showing ${startIdx}-${endIdx} of ${total} products`;

  const totalPages = Math.ceil(total / state.pageSize);
  let controlsHtml = `
    <button class="page-btn" data-page="prev" ${state.currentPage <= 1 ? 'disabled' : ''} aria-label="Previous page">&lt;</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    controlsHtml += `
      <button class="page-btn ${i === state.currentPage ? 'current' : ''}" data-page="${i}">${i}</button>
    `;
  }

  controlsHtml += `
    <button class="page-btn" data-page="next" ${state.currentPage >= totalPages ? 'disabled' : ''} aria-label="Next page">&gt;</button>
  `;

  elements.paginationControls.innerHTML = controlsHtml;

  elements.paginationControls.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      if (p === 'prev') state.currentPage = Math.max(1, state.currentPage - 1);
      else if (p === 'next') state.currentPage = Math.min(totalPages, state.currentPage + 1);
      else state.currentPage = parseInt(p, 10);
      renderTable();
      renderPagination();
    });
  });
}

function renderSkeleton() {
  if (!elements.tableBody) return;
  elements.tableBody.innerHTML = `
    <tr><td colspan="8"><div class="skeleton-row"></div></td></tr>
    <tr><td colspan="8"><div class="skeleton-row"></div></td></tr>
    <tr><td colspan="8"><div class="skeleton-row"></div></td></tr>
    <tr><td colspan="8"><div class="skeleton-row"></div></td></tr>
  `;
}

function updateBulkBar() {
  const count = state.selectedIds.size;
  if (count > 0) {
    elements.bulkBar.classList.add('active');
    elements.bulkCount.textContent = `${count} selected`;
  } else {
    elements.bulkBar.classList.remove('active');
  }

  // Update header checkbox indeterminate/checked
  if (elements.selectAllCheckbox) {
    const totalVisible = state.filteredProducts.length;
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

// Inline Editing Handler
function makeCellEditable(cell, field) {
  const id = parseInt(cell.dataset.id, 10);
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  const currentVal = field === 'price' ? (product.price / 100).toFixed(2) : product.inventory;
  const originalHtml = cell.innerHTML;

  cell.innerHTML = `
    <input type="text" class="inline-edit-input" value="${currentVal}" autofocus>
  `;

  const input = cell.querySelector('input');
  input.focus();
  input.select();

  const cleanup = () => {
    cell.innerHTML = originalHtml;
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (field === 'price') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed >= 0) {
          product.price = Math.round(parsed * 100);
          saveProducts(state.products);
          showToast(`Price updated to ${formatMoney(product.price)}`);
        }
      } else if (field === 'inventory') {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          product.inventory = parsed;
          saveProducts(state.products);
          showToast(`Inventory updated to ${product.inventory} in stock`);
        }
      }
      applyFiltersAndSort();
    } else if (e.key === 'Escape') {
      cleanup();
    }
  });

  input.addEventListener('blur', cleanup);
}

// Row Menu Actions
function toggleRowMenu(id) {
  state.openMenuId = state.openMenuId === id ? null : id;
  document.querySelectorAll('.row-dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
  if (state.openMenuId) {
    document.getElementById(`row-menu-${id}`)?.classList.add('open');
  }
}

function closeAllMenus() {
  state.openMenuId = null;
  document.querySelectorAll('.row-dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
}

function handleRowMenuAction(action, id) {
  const p = state.products.find(item => item.id === id);
  if (!p) return;

  if (action === 'duplicate') {
    const clone = {
      ...p,
      id: Date.now(),
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-COPY`,
      status: 'Draft',
      sales: 0
    };
    state.products.unshift(clone);
    saveProducts(state.products);
    showToast(`Duplicated product: ${clone.name}`);
    applyFiltersAndSort();
  } else if (action === 'archive') {
    p.status = 'Draft';
    saveProducts(state.products);
    showToast(`Archived product: ${p.name}`);
    applyFiltersAndSort();
  } else if (action === 'delete') {
    openConfirmModal(`Delete "${p.name}"?`, `Are you sure you want to permanently remove this product listing? This action cannot be undone.`, () => {
      state.products = state.products.filter(item => item.id !== id);
      state.selectedIds.delete(id);
      saveProducts(state.products);
      showToast(`Product deleted`);
      updateBulkBar();
      applyFiltersAndSort();
    });
  } else if (action === 'view-reason') {
    openModal(`Rejection Reason: ${escapeHTML(p.name)}`, `
      <div style="background-color: #FEE2E2; border: 1px solid #FCA5A5; border-radius: var(--radius-md); padding: 14px; color: #991B1B; font-size: 13.5px; line-height: 1.5; margin-bottom: 16px;">
        <strong>Moderator Note:</strong><br>
        ${escapeHTML(p.rejectionReason || 'Product imagery or description does not meet seller compliance standards.')}
      </div>
      <p style="font-size: 13px; color: var(--text-secondary);">
        Please edit your product listing to update the photos or catalog details, then click <strong>Request Review</strong>.
      </p>
    `, [
      { label: 'Close', variant: 'secondary', onClick: closeModal },
      { label: 'Edit Product', variant: 'primary', onClick: () => { window.location.href = `add-product.html?id=${p.id}`; } }
    ]);
  }
}

// Bulk Actions
function bulkUpdateStatus(newStatus) {
  const count = state.selectedIds.size;
  if (count === 0) return;

  state.products.forEach(p => {
    if (state.selectedIds.has(p.id)) {
      p.status = newStatus;
    }
  });

  saveProducts(state.products);
  showToast(`${count} products updated to ${newStatus}`);
  state.selectedIds.clear();
  updateBulkBar();
  applyFiltersAndSort();
}

function openBulkPriceModal() {
  const count = state.selectedIds.size;
  if (count === 0) return;

  openModal(`Change Price for ${count} Products`, `
    <div style="margin-bottom: 14px;">
      <label style="display:block; font-size: 13px; font-weight: 500; margin-bottom: 6px;">New Price ($)</label>
      <input type="number" id="modal-bulk-price-input" step="0.01" min="0" placeholder="e.g. 29.99" class="search-field" style="width: 100%;">
    </div>
    <p style="font-size: 12px; color: var(--text-secondary);">This price will be applied to all ${count} currently selected items.</p>
  `, [
    { label: 'Cancel', variant: 'secondary', onClick: closeModal },
    {
      label: 'Apply Price',
      variant: 'primary',
      onClick: () => {
        const val = parseFloat(document.getElementById('modal-bulk-price-input')?.value);
        if (isNaN(val) || val <= 0) {
          alert('Please enter a valid price greater than 0');
          return;
        }
        const cents = Math.round(val * 100);
        state.products.forEach(p => {
          if (state.selectedIds.has(p.id)) {
            p.price = cents;
          }
        });
        saveProducts(state.products);
        showToast(`Updated price for ${count} products`);
        closeModal();
        applyFiltersAndSort();
      }
    }
  ]);
}

function openBulkDeleteModal() {
  const count = state.selectedIds.size;
  if (count === 0) return;

  openConfirmModal(`Delete ${count} Products?`, `Are you sure you want to delete ${count} selected products? This action cannot be undone.`, () => {
    state.products = state.products.filter(p => !state.selectedIds.has(p.id));
    state.selectedIds.clear();
    saveProducts(state.products);
    showToast(`${count} products deleted`);
    updateBulkBar();
    applyFiltersAndSort();
  });
}

// CSV Export
function exportToCSV() {
  const rows = [
    ['ID', 'Name', 'SKU', 'Status', 'Inventory', 'Category', 'Price', 'Sales']
  ];

  state.filteredProducts.forEach(p => {
    rows.push([
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.status,
      p.inventory,
      `"${p.category}"`,
      (p.price / 100).toFixed(2),
      p.sales
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ameza_products_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${state.filteredProducts.length} products to CSV`);
}

// Modal System
function openModal(title, bodyHtml, buttons = []) {
  if (!elements.modalOverlay || !elements.modalContainer) return;

  elements.modalContainer.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close-btn" data-action="close-modal" aria-label="Close modal">${Icons.close}</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    <div class="modal-footer">
      ${buttons.map((b, i) => `
        <button class="${b.variant === 'primary' ? 'btn-header-primary' : 'btn-header-secondary'}" data-modal-btn="${i}">${b.label}</button>
      `).join('')}
    </div>
  `;

  elements.modalContainer.querySelector('[data-action="close-modal"]')?.addEventListener('click', closeModal);

  buttons.forEach((b, i) => {
    elements.modalContainer.querySelector(`[data-modal-btn="${i}"]`)?.addEventListener('click', b.onClick);
  });

  elements.modalOverlay.classList.add('open');
}

function openConfirmModal(title, message, onConfirm) {
  openModal(title, `<p>${message}</p>`, [
    { label: 'Cancel', variant: 'secondary', onClick: closeModal },
    {
      label: 'Confirm',
      variant: 'primary',
      onClick: () => {
        closeModal();
        onConfirm();
      }
    }
  ]);
}

function closeModal() {
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.remove('open');
  }
}

// Popover Filters Setup
function setupFilterPopovers() {
  const statusPopover = document.getElementById('popover-filter-status');
  const catPopover = document.getElementById('popover-filter-category');
  const pricePopover = document.getElementById('popover-filter-price');
  const morePopover = document.getElementById('popover-more-filters');

  elements.statusDropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = statusPopover?.classList.contains('open');
    closeAllPopovers();
    if (!isOpen) statusPopover?.classList.add('open');
  });

  elements.categoryDropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = catPopover?.classList.contains('open');
    closeAllPopovers();
    if (!isOpen) catPopover?.classList.add('open');
  });

  elements.priceDropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = pricePopover?.classList.contains('open');
    closeAllPopovers();
    if (!isOpen) pricePopover?.classList.add('open');
  });

  elements.moreFiltersBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = morePopover?.classList.contains('open');
    closeAllPopovers();
    if (!isOpen) morePopover?.classList.add('open');
  });

  // Status popover selection
  statusPopover?.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-status-opt]');
    if (!opt) return;
    state.filterStatus = opt.dataset.statusOpt;
    elements.statusDropdownBtn.textContent = state.filterStatus === 'all' ? 'Status' : state.filterStatus;
    elements.statusDropdownBtn.innerHTML += ` ${Icons.chevronDown}`;
    elements.statusDropdownBtn.classList.toggle('active', state.filterStatus !== 'all');
    closeAllPopovers();
    applyFiltersAndSort();
  });

  // Category popover selection
  catPopover?.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-cat-opt]');
    if (!opt) return;
    state.filterCategory = opt.dataset.catOpt;
    elements.categoryDropdownBtn.textContent = state.filterCategory === 'all' ? 'Category' : state.filterCategory;
    elements.categoryDropdownBtn.innerHTML += ` ${Icons.chevronDown}`;
    elements.categoryDropdownBtn.classList.toggle('active', state.filterCategory !== 'all');
    closeAllPopovers();
    applyFiltersAndSort();
  });

  // Price popover selection
  pricePopover?.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-price-opt]');
    if (!opt) return;
    state.filterPriceRange = opt.dataset.priceOpt;
    const labelMap = {
      all: 'Price range',
      under25: 'Under $25',
      '25to50': '$25 - $50',
      '50to100': '$50 - $100',
      over100: 'Over $100'
    };
    elements.priceDropdownBtn.textContent = labelMap[state.filterPriceRange] || 'Price range';
    elements.priceDropdownBtn.innerHTML += ` ${Icons.chevronDown}`;
    elements.priceDropdownBtn.classList.toggle('active', state.filterPriceRange !== 'all');
    closeAllPopovers();
    applyFiltersAndSort();
  });

  // More filters apply
  document.getElementById('btn-apply-more-filters')?.addEventListener('click', () => {
    const minSales = parseInt(document.getElementById('input-min-sales')?.value, 10);
    const inStock = document.getElementById('checkbox-in-stock-only')?.checked;
    state.filterMinSales = isNaN(minSales) ? 0 : minSales;
    state.filterInStockOnly = !!inStock;
    elements.moreFiltersBtn.classList.toggle('active', state.filterMinSales > 0 || state.filterInStockOnly);
    closeAllPopovers();
    applyFiltersAndSort();
  });
}

function closeAllPopovers() {
  document.querySelectorAll('.filter-popover').forEach(p => p.classList.remove('open'));
}
