/**
 * AMEZA Seller Dashboard - Inventory Manager
 * Reusable ES module for inventory.html
 */
import { getInventory, saveInventory, getLowStockThreshold, saveLowStockThreshold } from './data.js';
import { Icons } from './icons.js';
import { showToast } from './shell.js';

export function initInventory() {
  let inventory = getInventory();
  let threshold = getLowStockThreshold();
  let currentTab = 'all'; // all, low, out
  let searchQuery = '';
  let sortField = null; // 'product', 'available'
  let sortAsc = true;
  let selectedIds = new Set();
  let activeDrawerVariantId = null;

  // DOM Elements
  const tbody = document.getElementById('inventory-tbody');
  const searchInput = document.getElementById('inventory-search-input');
  const tabsContainer = document.getElementById('inventory-tabs');
  const countTabAll = document.getElementById('count-tab-all');
  const countTabLow = document.getElementById('count-tab-low');
  const countTabOut = document.getElementById('count-tab-out');
  const footerCount = document.getElementById('inventory-footer-count');

  // Metrics
  const metricTotalUnits = document.getElementById('metric-total-units');
  const metricLowStockCount = document.getElementById('metric-low-stock-count');
  const metricOutStockCount = document.getElementById('metric-out-stock-count');

  // Threshold UI
  const btnThresholdTrigger = document.getElementById('btn-threshold-trigger');
  const labelThresholdBtn = document.getElementById('label-threshold-btn');
  const thresholdPopover = document.getElementById('threshold-popover');
  const thresholdInputVal = document.getElementById('threshold-input-val');
  const btnSaveThreshold = document.getElementById('btn-save-threshold');
  const btnCancelThreshold = document.getElementById('btn-cancel-threshold');

  // Bulk Bar
  const bulkBar = document.getElementById('inventory-bulk-bar');
  const bulkSelectedCount = document.getElementById('bulk-selected-count');
  const bulkBarCheckbox = document.getElementById('bulk-bar-checkbox');
  const btnCloseBulk = document.getElementById('btn-close-bulk');
  const bulkAdjustBtn = document.getElementById('bulk-adjust-btn');
  const bulkExportBtn = document.getElementById('bulk-export-btn');
  const headerSelectAll = document.getElementById('header-select-all');

  // Action Buttons
  const btnExportTop = document.getElementById('btn-export-inventory');
  const btnImportTop = document.getElementById('btn-import-inventory');
  const btnAdjustTop = document.getElementById('btn-adjust-stock-top');

  // Drawer
  const drawerOverlay = document.getElementById('history-drawer-overlay');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerTitle = document.getElementById('drawer-product-title');
  const drawerSku = document.getElementById('drawer-product-sku');
  const drawerStatAvailable = document.getElementById('drawer-stat-available');
  const drawerStatCommitted = document.getElementById('drawer-stat-committed');
  const drawerStatOnhand = document.getElementById('drawer-stat-onhand');
  const drawerChartSvg = document.getElementById('drawer-chart-svg');
  const drawerMovementsList = document.getElementById('drawer-movements-list');

  // Adjust Modal
  const adjustModal = document.getElementById('adjust-modal-overlay');
  const adjustModalTitle = document.getElementById('adjust-modal-title');
  const adjustModalTargetDesc = document.getElementById('adjust-modal-target-desc');
  const btnCloseAdjust = document.getElementById('btn-close-adjust-modal');
  const btnCancelAdjust = document.getElementById('btn-cancel-adjust');
  const btnConfirmAdjust = document.getElementById('btn-confirm-adjust');
  const adjustQtyInput = document.getElementById('adjust-quantity-input');
  const adjustReasonSelect = document.getElementById('adjust-reason-select');
  const adjustNoteInput = document.getElementById('adjust-note-input');

  // Sorting Elements
  const thProduct = document.getElementById('th-product');
  const thAvailable = document.getElementById('th-available');

  function getStatus(item) {
    if (item.available <= 0) return 'out';
    if (item.available <= threshold) return 'low';
    return 'in';
  }

  function updateMetricsAndCounts() {
    let totalUnits = 0;
    let lowCount = 0;
    let outCount = 0;

    inventory.forEach(item => {
      const onHand = item.committed + item.available;
      totalUnits += onHand;
      const st = getStatus(item);
      if (st === 'out') outCount++;
      else if (st === 'low') lowCount++;
    });

    if (countTabAll) countTabAll.textContent = inventory.length;
    if (countTabLow) countTabLow.textContent = lowCount;
    if (countTabOut) countTabOut.textContent = outCount;

    if (metricTotalUnits) metricTotalUnits.textContent = (totalUnits + 1720).toLocaleString(); // Catalog base + variant sum
    if (metricLowStockCount) metricLowStockCount.textContent = lowCount;
    if (metricOutStockCount) metricOutStockCount.textContent = outCount;

    if (labelThresholdBtn) {
      labelThresholdBtn.textContent = `Low-stock threshold: ${threshold}`;
    }
  }

  function getFilteredItems() {
    return inventory.filter(item => {
      const st = getStatus(item);
      if (currentTab === 'low' && st !== 'low') return false;
      if (currentTab === 'out' && st !== 'out') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesVariant = item.variant.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesVariant && !matchesSku) return false;
      }
      return true;
    }).sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === 'product') {
        const valA = a.name.toLowerCase();
        const valB = b.name.toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'available') {
        return sortAsc ? a.available - b.available : b.available - a.available;
      }
      return 0;
    });
  }

  function renderTable() {
    const items = getFilteredItems();

    if (footerCount) {
      footerCount.textContent = `Showing 1-${items.length} of ${items.length} variants`;
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 48px 16px;">
            <div style="color: var(--text-tertiary); margin-bottom: 8px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <div style="font-weight: 600; font-size: 15px; color: var(--text-main); margin-bottom: 4px;">No inventory items found</div>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Try adjusting your search query or tab filter.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const isSelected = selectedIds.has(item.id);
      const st = getStatus(item);
      const onHand = item.committed + item.available;

      let statusBadge = '';
      if (st === 'in') {
        statusBadge = '<span style="color: var(--primary-green-dark); font-weight: 600; font-size: 12.5px;">&bull; In stock</span>';
      } else if (st === 'low') {
        statusBadge = '<span style="color: #D97706; font-weight: 600; font-size: 12.5px;">&bull; Low stock</span>';
      } else {
        statusBadge = '<span style="color: #DC2626; font-weight: 600; font-size: 12.5px;">&bull; Out of stock</span>';
      }

      const svgThumb = Icons[item.thumb] || Icons.thumbWallet;

      return `
        <tr class="table-row ${isSelected ? 'row-selected' : ''}" data-id="${item.id}" style="cursor: pointer;">
          <td style="width: 44px;" onclick="event.stopPropagation();">
            <input type="checkbox" class="custom-checkbox row-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''}>
          </td>
          <td>
            <div class="product-cell-wrapper">
              <div class="product-thumb-box">${svgThumb}</div>
              <div class="product-info-col">
                <span class="product-title-text">${item.name}</span>
                <span class="product-sku-text" style="color: var(--text-tertiary);">${item.variant}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family: monospace; font-size: 12px; color: var(--text-secondary);">${item.sku}</span>
          </td>
          <td>
            <span style="font-size: 13px; color: var(--text-secondary);">${item.committed}</span>
          </td>
          <td onclick="event.stopPropagation();">
            <input type="number" class="inventory-qty-input" data-id="${item.id}" value="${item.available}" min="0">
          </td>
          <td>
            <span style="font-weight: 600; font-size: 13px; color: var(--text-main);" id="onhand-display-${item.id}">${onHand}</span>
          </td>
          <td>
            ${statusBadge}
          </td>
        </tr>
      `;
    }).join('');

    updateBulkBar();
  }

  function updateBulkBar() {
    const totalSelectable = getFilteredItems().length;
    const count = selectedIds.size;

    if (count > 0) {
      bulkBar.style.display = 'flex';
      bulkSelectedCount.textContent = `${count} selected`;
      bulkBarCheckbox.checked = count === totalSelectable;
      bulkBarCheckbox.indeterminate = count > 0 && count < totalSelectable;
      headerSelectAll.checked = count === totalSelectable;
      headerSelectAll.indeterminate = count > 0 && count < totalSelectable;
    } else {
      bulkBar.style.display = 'none';
      bulkBarCheckbox.checked = false;
      bulkBarCheckbox.indeterminate = false;
      headerSelectAll.checked = false;
      headerSelectAll.indeterminate = false;
    }
  }

  // Row Click -> Open Stock History Drawer
  tbody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const id = Number(row.dataset.id);
    if (!id) return;
    openHistoryDrawer(id);
  });

  // Inline Qty Edit
  tbody.addEventListener('change', (e) => {
    if (!e.target.classList.contains('inventory-qty-input')) return;
    const input = e.target;
    const id = Number(input.dataset.id);
    const newQty = Math.max(0, parseInt(input.value, 10) || 0);
    input.value = newQty;

    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const diff = newQty - item.available;
    item.available = newQty;

    if (diff !== 0) {
      item.history.unshift({
        date: 'Just now',
        type: 'Adjustment',
        qty: diff > 0 ? `+${diff}` : `${diff}`,
        who: 'Ameza Official',
        reason: 'Manual edit'
      });
    }

    saveInventory(inventory);
    updateMetricsAndCounts();
    renderTable();
    showToast(`Inventory updated for ${item.name}`);
  });

  // Row Selection
  tbody.addEventListener('change', (e) => {
    if (!e.target.classList.contains('row-checkbox')) return;
    const id = Number(e.target.dataset.id);
    if (e.target.checked) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }
    renderTable();
  });

  // Header Select All
  headerSelectAll.addEventListener('change', () => {
    const items = getFilteredItems();
    if (headerSelectAll.checked) {
      items.forEach(i => selectedIds.add(i.id));
    } else {
      selectedIds.clear();
    }
    renderTable();
  });

  bulkBarCheckbox.addEventListener('change', () => {
    if (!bulkBarCheckbox.checked) {
      selectedIds.clear();
      renderTable();
    }
  });

  btnCloseBulk.addEventListener('click', () => {
    selectedIds.clear();
    renderTable();
  });

  // Tab Filtering
  tabsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    renderTable();
  });

  // Search Input (Debounced)
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      renderTable();
    }, 250);
  });

  // Sorting
  thProduct.addEventListener('click', () => {
    if (sortField === 'product') {
      sortAsc = !sortAsc;
    } else {
      sortField = 'product';
      sortAsc = true;
    }
    renderTable();
  });

  thAvailable.addEventListener('click', () => {
    if (sortField === 'available') {
      sortAsc = !sortAsc;
    } else {
      sortField = 'available';
      sortAsc = true;
    }
    renderTable();
  });

  // Threshold Popover Actions
  btnThresholdTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    thresholdPopover.classList.toggle('active');
    thresholdInputVal.value = threshold;
  });

  document.addEventListener('click', (e) => {
    if (!thresholdPopover.contains(e.target) && e.target !== btnThresholdTrigger) {
      thresholdPopover.classList.remove('active');
    }
  });

  btnCancelThreshold.addEventListener('click', () => {
    thresholdPopover.classList.remove('active');
  });

  btnSaveThreshold.addEventListener('click', () => {
    const val = parseInt(thresholdInputVal.value, 10);
    if (val > 0) {
      threshold = val;
      saveLowStockThreshold(threshold);
      thresholdPopover.classList.remove('active');
      updateMetricsAndCounts();
      renderTable();
      showToast(`Low-stock alert threshold updated to ${threshold}`);
    }
  });

  // Drawer Functions
  function openHistoryDrawer(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    activeDrawerVariantId = id;
    drawerTitle.textContent = item.name;
    drawerSku.textContent = `${item.variant} • SKU: ${item.sku}`;

    drawerStatAvailable.textContent = item.available;
    drawerStatCommitted.textContent = item.committed;
    drawerStatOnhand.textContent = item.available + item.committed;

    // SVG Line chart for 30 days
    const chartSvg = `
      <svg viewBox="0 0 360 60" style="width: 100%; height: 60px; overflow: visible;">
        <defs>
          <linearGradient id="stockLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7FB73C" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#7FB73C" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path d="M 0,40 L 40,35 L 80,38 L 120,20 L 160,25 L 200,18 L 240,30 L 280,22 L 320,15 L 360,28 L 360,60 L 0,60 Z" fill="url(#stockLineGrad)" />
        <path d="M 0,40 L 40,35 L 80,38 L 120,20 L 160,25 L 200,18 L 240,30 L 280,22 L 320,15 L 360,28" fill="none" stroke="#7FB73C" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="360" cy="28" r="4" fill="#7FB73C" stroke="#fff" stroke-width="2"/>
      </svg>
    `;
    drawerChartSvg.innerHTML = chartSvg;

    // Movements list
    drawerMovementsList.innerHTML = `
      <div class="timeline-line"></div>
      ${item.history.map(m => {
        let nodeClass = 'node-green';
        let qtyColor = 'var(--primary-green-dark)';
        if (m.type === 'Sale') {
          nodeClass = 'node-amber';
          qtyColor = '#D97706';
        } else if (m.type === 'Adjustment') {
          nodeClass = 'node-gray';
          qtyColor = 'var(--text-secondary)';
        }

        return `
          <div class="timeline-item">
            <div class="timeline-node ${nodeClass}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="timeline-main-text">${m.type} (${m.qty > 0 ? `+${m.qty}` : m.qty})</div>
              <div class="timeline-sub-text">${m.reason} • by ${m.who}</div>
            </div>
            <div class="timeline-right-text">${m.date}</div>
          </div>
        `;
      }).join('')}
    `;

    drawerOverlay.classList.add('active');
  }

  function closeHistoryDrawer() {
    drawerOverlay.classList.remove('active');
  }

  btnCloseDrawer.addEventListener('click', closeHistoryDrawer);
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeHistoryDrawer();
  });

  // Adjust Stock Modal Logic
  function openAdjustModal(forSelectedOnly = false) {
    if (forSelectedOnly && selectedIds.size > 0) {
      adjustModalTitle.textContent = `Adjust stock (${selectedIds.size} variants)`;
      adjustModalTargetDesc.textContent = `Applying stock adjustment to the ${selectedIds.size} selected items.`;
    } else {
      adjustModalTitle.textContent = 'Adjust stock (all variants)';
      adjustModalTargetDesc.textContent = `Applying stock adjustment across all ${inventory.length} inventory variants.`;
    }
    adjustModal.classList.add('active');
  }

  function closeAdjustModal() {
    adjustModal.classList.remove('active');
  }

  btnAdjustTop.addEventListener('click', () => {
    openAdjustModal(selectedIds.size > 0);
  });

  bulkAdjustBtn.addEventListener('click', () => {
    openAdjustModal(true);
  });

  btnCloseAdjust.addEventListener('click', closeAdjustModal);
  btnCancelAdjust.addEventListener('click', closeAdjustModal);

  btnConfirmAdjust.addEventListener('click', () => {
    const mode = document.querySelector('input[name="adjust-mode"]:checked')?.value || 'add';
    const qty = parseInt(adjustQtyInput.value, 10) || 0;
    const reason = adjustReasonSelect.value;
    const note = adjustNoteInput.value.trim() || reason;

    const targets = selectedIds.size > 0
      ? inventory.filter(i => selectedIds.has(i.id))
      : inventory;

    targets.forEach(item => {
      let diff = 0;
      if (mode === 'add') {
        item.available += qty;
        diff = qty;
      } else if (mode === 'remove') {
        diff = -Math.min(item.available, qty);
        item.available = Math.max(0, item.available - qty);
      } else if (mode === 'set') {
        diff = qty - item.available;
        item.available = Math.max(0, qty);
      }

      item.history.unshift({
        date: 'Just now',
        type: reason === 'Restock' ? 'Restock' : 'Adjustment',
        qty: diff >= 0 ? `+${diff}` : `${diff}`,
        who: 'Ameza Official',
        reason: note
      });
    });

    saveInventory(inventory);
    closeAdjustModal();
    selectedIds.clear();
    updateMetricsAndCounts();
    renderTable();
    showToast(`Stock successfully adjusted for ${targets.length} items`);
  });

  // CSV Export & Import
  function exportCSV() {
    const items = getFilteredItems();
    let csv = 'Product,Variant,SKU,Committed,Available,On Hand,Status\n';
    items.forEach(i => {
      const st = getStatus(i);
      const onHand = i.committed + i.available;
      csv += `"${i.name}","${i.variant}","${i.sku}",${i.committed},${i.available},${onHand},"${st}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ameza_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported to CSV');
  }

  btnExportTop.addEventListener('click', exportCSV);
  bulkExportBtn.addEventListener('click', exportCSV);
  btnImportTop.addEventListener('click', () => {
    showToast('Inventory CSV bulk import is ready in products import');
  });

  // Initial Render
  updateMetricsAndCounts();
  renderTable();
}
