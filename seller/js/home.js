/**
 * AMEZA Seller Dashboard - Home Page Widgets & Interactive Logic
 * Pixel-perfect recreation of AMEZA Admin layout with pure vanilla JS SVG charts
 */

import { Icons } from '/shared/js/icons.js';
import { PERIOD_DATA, SETUP_GUIDE_STEPS, RECENT_ORDERS, LOW_STOCK_PRODUCTS } from '/shared/js/data.js';
import { escapeHTML, showToast } from '/shared/js/core/utils.js';

let currentPeriod = '30d';
let chartGranularity = 'daily';
let isEditMode = false;
let setupStepsState = JSON.parse(localStorage.getItem('ameza_setup_steps') || 'null') || [...SETUP_GUIDE_STEPS];

export function initHome() {
  renderHomeContent();
  bindHomeEvents();
}

function renderHomeContent() {
  const container = document.getElementById('home-content-container');
  if (!container) return;

  const pData = PERIOD_DATA[currentPeriod] || PERIOD_DATA['30d'];

  container.innerHTML = `
    <!-- Top Greeting Row -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Good morning, Ameza Official</h1>
        <p class="page-subtitle">Here's what's happening with your store today.</p>
      </div>

      <div class="page-header-actions">
        <!-- Customize Button -->
        <button class="btn-header-action ${isEditMode ? 'active-edit' : ''}" id="btn-toggle-customize">
          ${Icons.customize}
          <span id="customize-label">${isEditMode ? 'Done' : 'Customize'}</span>
        </button>

        <!-- Time Range Dropdown Trigger -->
        <div style="position: relative;">
          <button class="btn-header-action" id="btn-period-dropdown" aria-haspopup="true">
            ${Icons.calendar}
            <span id="selected-period-label">${escapeHTML(pData.label)}</span>
            ${Icons.chevronDown}
          </button>

          <!-- Period Dropdown Menu -->
          <div class="dropdown-menu-popover" id="period-menu" style="min-width: 170px;">
            <button class="dropdown-item" data-period="today">Today</button>
            <button class="dropdown-item" data-period="7d">Last 7 days</button>
            <button class="dropdown-item" data-period="30d">Last 30 days</button>
            <button class="dropdown-item" data-period="90d">Last 90 days</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Widget Alert Bar (visible in customize mode) -->
    <div class="add-widget-bar" id="add-widget-bar">
      <span><i class="fa-solid fa-arrows-up-down-left-right"></i> Drag cards to reorder, or click X to hide widgets.</span>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn-bulk-action" id="btn-reset-widgets" style="background:#FFFFFF; color:var(--text-main);">Reset Layout</button>
        <button type="button" class="btn-bulk-action" id="btn-done-widgets" style="background:var(--primary-green-dark); color:#FFFFFF;">Done</button>
      </div>
    </div>

    <!-- 1. Four Metric Cards Row -->
    <div class="metrics-grid" id="metrics-grid">
      <!-- Metric 1: Total Sales -->
      <div class="metric-card" id="widget-metric-sales" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-metric-sales" title="Hide widget">&times;</button>
        <div class="metric-header">
          <div class="metric-icon-circle">${Icons.dollarSign}</div>
          <span class="metric-title">Total sales</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val" id="metric-sales-val">${pData.metrics.sales.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${pData.metrics.sales.up ? 'up' : 'down'}">${pData.metrics.sales.delta}</span>
            <span class="metric-comparison">${pData.comparisonLabel}</span>
          </div>
          <div class="metric-sparkline" id="sparkline-sales">
            ${renderSparkline(pData.sparklines.sales)}
          </div>
        </div>
      </div>

      <!-- Metric 2: Orders -->
      <div class="metric-card" id="widget-metric-orders" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-metric-orders" title="Hide widget">&times;</button>
        <div class="metric-header">
          <div class="metric-icon-circle">${Icons.cart}</div>
          <span class="metric-title">Orders</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val" id="metric-orders-val">${pData.metrics.orders.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${pData.metrics.orders.up ? 'up' : 'down'}">${pData.metrics.orders.delta}</span>
            <span class="metric-comparison">${pData.comparisonLabel}</span>
          </div>
          <div class="metric-sparkline" id="sparkline-orders">
            ${renderSparkline(pData.sparklines.orders)}
          </div>
        </div>
      </div>

      <!-- Metric 3: Conversion Rate -->
      <div class="metric-card" id="widget-metric-conv" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-metric-conv" title="Hide widget">&times;</button>
        <div class="metric-header">
          <div class="metric-icon-circle">${Icons.conversion}</div>
          <span class="metric-title">Conversion rate</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val" id="metric-conv-val">${pData.metrics.conversion.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${pData.metrics.conversion.up ? 'up' : 'down'}">${pData.metrics.conversion.delta}</span>
            <span class="metric-comparison">${pData.comparisonLabel}</span>
          </div>
          <div class="metric-sparkline" id="sparkline-conv">
            ${renderSparkline(pData.sparklines.conversion)}
          </div>
        </div>
      </div>

      <!-- Metric 4: Available Balance -->
      <div class="metric-card" id="widget-metric-balance" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-metric-balance" title="Hide widget">&times;</button>
        <div class="metric-header">
          <div class="metric-icon-circle">${Icons.wallet}</div>
          <span class="metric-title">Available balance</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val" id="metric-balance-val">${pData.metrics.balance.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${pData.metrics.balance.up ? 'up' : 'down'}">${pData.metrics.balance.delta}</span>
            <span class="metric-comparison">${pData.comparisonLabel}</span>
          </div>
          <div class="metric-sparkline" id="sparkline-balance">
            ${renderSparkline(pData.sparklines.balance)}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Middle Row: Sales Over Time + Setup Guide -->
    <div class="middle-grid" id="middle-grid">
      <!-- Sales Over Time Card -->
      <div class="dashboard-card" id="widget-sales-chart" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-sales-chart" title="Hide widget">&times;</button>
        <div class="card-top">
          <h2 class="card-title">Sales over time</h2>
          <div class="chart-controls">
            <div class="chart-legend">
              <span class="legend-dot"></span>
              <span>Total sales</span>
            </div>
            <select class="chart-granularity-select" id="chart-granularity-select" aria-label="Select chart timeframe">
              <option value="daily" ${chartGranularity === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${chartGranularity === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${chartGranularity === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
        </div>

        <div class="chart-container" id="sales-chart-wrapper">
          ${renderAreaChart(pData.chart)}
          <div class="chart-tooltip" id="chart-tooltip"></div>
        </div>
      </div>

      <!-- Setup Guide Card -->
      <div class="dashboard-card" id="widget-setup-guide" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-setup-guide" title="Hide widget">&times;</button>
        <div class="card-top">
          <h2 class="card-title">Setup guide</h2>
          <span class="card-link" id="setup-completed-text" style="cursor: default;">
            ${getSetupCompletedCount()} of ${setupStepsState.length} completed
          </span>
        </div>

        <div class="setup-guide-progress-bar-wrap">
          <div class="setup-guide-progress-fill" id="setup-progress-fill" style="width: ${getSetupProgressPercent()}%;"></div>
        </div>

        <div class="setup-steps-list" id="setup-steps-container">
          ${renderSetupSteps()}
        </div>
      </div>
    </div>

    <!-- 3. Bottom Row: Recent Orders + Low Stock -->
    <div class="bottom-grid" id="bottom-grid">
      <!-- Recent Orders Card -->
      <div class="dashboard-card" id="widget-recent-orders" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-recent-orders" title="Hide widget">&times;</button>
        <div class="card-top">
          <h2 class="card-title">Recent orders</h2>
          <a href="orders.html" class="card-link">View all</a>
        </div>

        <div class="table-responsive">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th style="width: 28px;">
                  <input type="checkbox" class="custom-chk" id="chk-select-all-orders" title="Select all orders" />
                </th>
                <th style="width: 44px;"></th>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="orders-table-tbody">
              ${RECENT_ORDERS.map(order => `
                <tr data-order-id="${order.id}">
                  <td>
                    <input type="checkbox" class="custom-chk order-row-chk" data-order-id="${order.id}" />
                  </td>
                  <td>
                    <div class="product-thumb-sq">${Icons[order.thumb] || ''}</div>
                  </td>
                  <td><strong>${order.id}</strong></td>
                  <td style="color: var(--text-secondary);">${order.date}</td>
                  <td>${order.customer}</td>
                  <td><strong>${order.total}</strong></td>
                  <td>
                    <span class="status-pill ${order.statusClass}">${order.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Card -->
      <div class="dashboard-card" id="widget-low-stock" draggable="${isEditMode}">
        <div class="widget-drag-handle" title="Drag to reorder">⋮⋮</div>
        <button class="widget-hide-btn" data-hide="widget-low-stock" title="Hide widget">&times;</button>
        <div class="card-top">
          <h2 class="card-title">Low stock</h2>
          <a href="inventory.html" class="card-link">View all</a>
        </div>

        <div class="table-responsive">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right;">Available</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${LOW_STOCK_PRODUCTS.map(prod => `
                <tr>
                  <td>
                    <div class="product-info-cell">
                      <div class="product-thumb-sq">${Icons[prod.thumb] || ''}</div>
                      <div>
                        <div class="product-name-txt">${prod.name}</div>
                        <div class="product-sku-txt">${prod.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 700;">${prod.available}</td>
                  <td style="text-align: right;">
                    <span class="status-pill ${prod.statusClass}">${prod.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating Bulk Actions Bar (for Orders) -->
    <div class="bulk-action-bar" id="bulk-action-bar">
      <span class="bulk-count" id="bulk-selected-count">0 orders selected</span>
      <button class="btn-bulk-action" id="btn-bulk-pack">Mark as packed</button>
      <button class="btn-bulk-action" id="btn-bulk-print">Print slips</button>
      <button class="btn-bulk-action" id="btn-bulk-clear" style="background:transparent; border-color:transparent;">Cancel</button>
    </div>
  `;
}

// Sparkline SVG generator (pure vanilla JS)
function renderSparkline(points) {
  if (!points || points.length < 2) return '';
  const width = 76;
  const height = 32;
  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - 4) + 2;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylineStr = coords.join(' ');
  const firstCoord = coords[0].split(',');
  const lastCoord = coords[coords.length - 1].split(',');
  const areaPath = `M ${firstCoord[0]},${height} L ${polylineStr.replace(/,/g, ' ')} L ${lastCoord[0]},${height} Z`;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7FB73C" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#7FB73C" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#sparkGradient)" />
      <polyline points="${polylineStr}" fill="none" stroke="#7FB73C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

// Main Area/Line Chart SVG Generator
function renderAreaChart(chartData) {
  const width = 640;
  const height = 210;
  const paddingLeft = 48;
  const paddingRight = 18;
  const paddingTop = 12;
  const paddingBottom = 32;

  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;

  const yMax = 2000;
  const ySteps = [2000, 1500, 1000, 500, 0];

  // Horizontal Grid Lines
  const gridLines = ySteps.map(stepVal => {
    const y = paddingTop + (1 - stepVal / yMax) * plotH;
    return `
      <g class="chart-y-axis">
        <text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--text-tertiary)">$${stepVal === 0 ? '0' : (stepVal).toLocaleString()}</text>
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" />
      </g>
    `;
  }).join('');

  // Data Points
  const pts = chartData.values.map((v, i) => {
    const x = paddingLeft + (i / (chartData.values.length - 1)) * plotW;
    const y = paddingTop + (1 - v / yMax) * plotH;
    return { x, y, val: v, label: chartData.labels[i] };
  });

  const pathCoords = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${pts[0].x.toFixed(1)},${paddingTop + plotH} L ${pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} L ${pts[pts.length - 1].x.toFixed(1)},${paddingTop + plotH} Z`;

  // X Axis Dates
  const xLabels = pts.map(p => `
    <text x="${p.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="var(--text-tertiary)">${p.label}</text>
  `).join('');

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" id="sales-svg-chart">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7FB73C" stop-opacity="0.26"/>
          <stop offset="100%" stop-color="#7FB73C" stop-opacity="0.01"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${gridLines}

      <!-- Area fill -->
      <path d="${areaPath}" fill="url(#areaGradient)" />

      <!-- Smooth Line -->
      <polyline points="${pathCoords}" fill="none" stroke="#7FB73C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

      <!-- X-axis Labels -->
      ${xLabels}

      <!-- Interactive Hover Guide Line & Point Marker -->
      <line id="chart-guide-line" x1="0" y1="${paddingTop}" x2="0" y2="${paddingTop + plotH}" stroke="#7FB73C" stroke-width="1" stroke-dasharray="3,3" style="display:none;" />
      <circle id="chart-guide-point" cx="0" cy="0" r="4.5" fill="#FFFFFF" stroke="#7FB73C" stroke-width="2.5" style="display:none;" />
    </svg>
  `;
}

function getSetupCompletedCount() {
  return setupStepsState.filter(s => s.completed).length;
}

function getSetupProgressPercent() {
  return Math.round((getSetupCompletedCount() / setupStepsState.length) * 100);
}

function renderSetupSteps() {
  return setupStepsState.map(step => `
    <button type="button" class="setup-step-item" data-step-id="${step.id}" aria-label="Toggle step ${step.title}">
      <div class="setup-step-left">
        <div class="setup-step-circle ${step.completed ? '' : 'unchecked'}">
          ${step.completed ? Icons.checkCircle : Icons.circleEmpty}
        </div>
        <div>
          <div class="setup-step-title">${escapeHTML(step.title)}</div>
          <div class="setup-step-desc">${escapeHTML(step.desc)}</div>
        </div>
      </div>
      <span class="setup-step-chevron">${Icons.chevronRight}</span>
    </button>
  `).join('');
}

function bindHomeEvents() {
  // Period dropdown
  const periodBtn = document.getElementById('btn-period-dropdown');
  const periodMenu = document.getElementById('period-menu');

  periodBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    periodMenu?.classList.toggle('active');
  });

  periodMenu?.querySelectorAll('[data-period]').forEach(item => {
    item.addEventListener('click', () => {
      currentPeriod = item.getAttribute('data-period');
      periodMenu?.classList.remove('active');
      renderHomeContent();
      bindHomeEvents();
      showToast(`Updated timeframe to ${PERIOD_DATA[currentPeriod]?.label}`, 'info');
    });
  });

  // Granularity dropdown (Daily, Weekly, Monthly)
  document.getElementById('chart-granularity-select')?.addEventListener('change', (e) => {
    chartGranularity = e.target.value;
    const pData = PERIOD_DATA[currentPeriod] || PERIOD_DATA['30d'];
    const wrapper = document.getElementById('sales-chart-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        ${renderAreaChart(pData.chart)}
        <div class="chart-tooltip" id="chart-tooltip"></div>
      `;
      bindChartHoverEvents();
      showToast(`Chart aggregated by ${chartGranularity}`, 'info');
    }
  });

  // Setup Guide Toggle
  document.querySelectorAll('.setup-step-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepId = parseInt(btn.getAttribute('data-step-id'), 10);
      const step = setupStepsState.find(s => s.id === stepId);
      if (step) {
        step.completed = !step.completed;
        localStorage.setItem('ameza_setup_steps', JSON.stringify(setupStepsState));

        // Update progress in DOM
        const completedEl = document.getElementById('setup-completed-text');
        const fillEl = document.getElementById('setup-progress-fill');
        const container = document.getElementById('setup-steps-container');

        if (completedEl) completedEl.textContent = `${getSetupCompletedCount()} of ${setupStepsState.length} completed`;
        if (fillEl) fillEl.style.width = `${getSetupProgressPercent()}%`;
        if (container) container.innerHTML = renderSetupSteps();

        // Re-bind steps
        bindHomeEvents();
        showToast(`Step "${step.title}" marked as ${step.completed ? 'complete' : 'pending'}.`, 'success');
      }
    });
  });

  // Order Checkboxes & Bulk Actions
  const selectAllChk = document.getElementById('chk-select-all-orders');
  const rowCheckboxes = document.querySelectorAll('.order-row-chk');
  const bulkBar = document.getElementById('bulk-action-bar');
  const bulkCount = document.getElementById('bulk-selected-count');

  const updateBulkBar = () => {
    const checked = Array.from(rowCheckboxes).filter(chk => chk.checked);
    if (checked.length > 0) {
      bulkBar?.classList.add('active');
      if (bulkCount) bulkCount.textContent = `${checked.length} ${checked.length === 1 ? 'order' : 'orders'} selected`;
    } else {
      bulkBar?.classList.remove('active');
    }
    if (selectAllChk) {
      selectAllChk.checked = checked.length === rowCheckboxes.length && rowCheckboxes.length > 0;
    }
  };

  selectAllChk?.addEventListener('change', () => {
    rowCheckboxes.forEach(chk => chk.checked = selectAllChk.checked);
    updateBulkBar();
  });

  rowCheckboxes.forEach(chk => {
    chk.addEventListener('change', updateBulkBar);
  });

  document.getElementById('btn-bulk-pack')?.addEventListener('click', () => {
    showToast('Orders marked as packed and ready for dispatch!', 'success');
    rowCheckboxes.forEach(chk => chk.checked = false);
    updateBulkBar();
  });

  document.getElementById('btn-bulk-print')?.addEventListener('click', () => {
    showToast('Printing packing slips and United States Post shipping labels...', 'info');
    rowCheckboxes.forEach(chk => chk.checked = false);
    updateBulkBar();
  });

  document.getElementById('btn-bulk-clear')?.addEventListener('click', () => {
    rowCheckboxes.forEach(chk => chk.checked = false);
    updateBulkBar();
  });

  // Customize Widgets Mode Toggle
  const customizeBtn = document.getElementById('btn-toggle-customize');
  const doneBtn = document.getElementById('btn-done-widgets');
  const resetBtn = document.getElementById('btn-reset-widgets');

  customizeBtn?.addEventListener('click', () => {
    isEditMode = !isEditMode;
    toggleEditMode(isEditMode);
  });

  doneBtn?.addEventListener('click', () => {
    isEditMode = false;
    toggleEditMode(false);
    showToast('Dashboard widget layout saved!', 'success');
  });

  resetBtn?.addEventListener('click', () => {
    localStorage.removeItem('ameza_hidden_widgets');
    document.querySelectorAll('[data-hide]').forEach(btn => {
      const targetId = btn.getAttribute('data-hide');
      const el = document.getElementById(targetId);
      if (el) el.style.display = '';
    });
    isEditMode = false;
    toggleEditMode(false);
    showToast('Default layout restored', 'info');
  });

  // Hide widget buttons
  document.querySelectorAll('[data-hide]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-hide');
      const el = document.getElementById(targetId);
      if (el) {
        el.style.display = 'none';
        showToast('Widget hidden. Click "Reset Layout" to restore.', 'info');
      }
    });
  });

  bindChartHoverEvents();
}

function toggleEditMode(enable) {
  const container = document.getElementById('home-content-container');
  const label = document.getElementById('customize-label');
  const btn = document.getElementById('btn-toggle-customize');

  if (enable) {
    container?.classList.add('edit-mode');
    btn?.classList.add('active-edit');
    if (label) label.textContent = 'Done';
  } else {
    container?.classList.remove('edit-mode');
    btn?.classList.remove('active-edit');
    if (label) label.textContent = 'Customize';
  }
}

// Chart hover interactions
function bindChartHoverEvents() {
  const svg = document.getElementById('sales-svg-chart');
  const tooltip = document.getElementById('chart-tooltip');
  const guideLine = document.getElementById('chart-guide-line');
  const guidePoint = document.getElementById('chart-guide-point');
  if (!svg || !tooltip) return;

  const pData = PERIOD_DATA[currentPeriod] || PERIOD_DATA['30d'];
  const width = 640;
  const paddingLeft = 48;
  const paddingRight = 18;
  const paddingTop = 12;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = 210 - paddingTop - 32;
  const yMax = 2000;

  const pts = pData.chart.values.map((v, i) => {
    const x = paddingLeft + (i / (pData.chart.values.length - 1)) * plotW;
    const y = paddingTop + (1 - v / yMax) * plotH;
    return { x, y, val: v, label: pData.chart.labels[i] };
  });

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    // Find closest point
    let closest = pts[0];
    let minDiff = Infinity;
    pts.forEach(p => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });

    if (closest) {
      if (guideLine) {
        guideLine.style.display = 'block';
        guideLine.setAttribute('x1', closest.x);
        guideLine.setAttribute('x2', closest.x);
      }
      if (guidePoint) {
        guidePoint.style.display = 'block';
        guidePoint.setAttribute('cx', closest.x);
        guidePoint.setAttribute('cy', closest.y);
      }

      const pixelX = (closest.x / width) * rect.width;
      const pixelY = (closest.y / 210) * rect.height;

      tooltip.style.opacity = '1';
      tooltip.style.left = `${pixelX}px`;
      tooltip.style.top = `${pixelY}px`;
      tooltip.innerHTML = `<strong>${closest.label}</strong>: $${closest.val.toLocaleString()} sales`;
    }
  });

  svg.addEventListener('mouseleave', () => {
    if (guideLine) guideLine.style.display = 'none';
    if (guidePoint) guidePoint.style.display = 'none';
    tooltip.style.opacity = '0';
  });
}
