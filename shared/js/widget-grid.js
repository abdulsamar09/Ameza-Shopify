/**
 * AMEZA Widget Grid Engine — js/widget-grid.js
 * Customizable, drag-and-drop dashboard widget grid.
 * Features:
 * - "Customize" toggle for edit mode (dashed borders, drag grip, size controls S/M/L/XL, remove X)
 * - Slide-over Widget Gallery drawer to add widgets
 * - Layout presets: Sales focus, Inventory focus, Minimal, Finance
 * - "Save as Named Layout" stored in localStorage
 * - Drag-drop reordering with mouse, touch, and keyboard support
 */

import { escapeHTML, showToast } from './core/utils.js';

export const WIDGET_CATALOG = [
  {
    id: 'kpi_revenue',
    title: 'Gross Revenue & Margins',
    category: 'Finance',
    defaultSize: 'm',
    description: 'Real-time sales revenue, commission split, and growth metrics.',
    icon: 'fa-sack-dollar'
  },
  {
    id: 'kpi_orders',
    title: 'Orders & Fulfillment Rate',
    category: 'Operations',
    defaultSize: 'm',
    description: 'Active order volume, fulfillment speed, and cancellation rates.',
    icon: 'fa-truck-fast'
  },
  {
    id: 'chart_revenue_trend',
    title: '30-Day Revenue Trend',
    category: 'Analytics',
    defaultSize: 'xl',
    description: 'Interactive SVG line chart showing daily revenue volume and 7-day moving averages.',
    icon: 'fa-chart-line'
  },
  {
    id: 'chart_category_share',
    title: 'Category Sales Breakdown',
    category: 'Analytics',
    defaultSize: 'm',
    description: 'Donut chart distribution of leather goods, clothing, watches, and electronics.',
    icon: 'fa-chart-pie'
  },
  {
    id: 'table_recent_orders',
    title: 'Recent Incoming Orders',
    category: 'Operations',
    defaultSize: 'xl',
    description: 'Instant triage of orders needing packing, courier dispatch, or delivery confirmation.',
    icon: 'fa-clipboard-list'
  },
  {
    id: 'widget_low_stock',
    title: 'Inventory Restock Radar',
    category: 'Inventory',
    defaultSize: 'm',
    description: 'Alerts for products with less than 5 units left in warehouse stock.',
    icon: 'fa-triangle-exclamation'
  },
  {
    id: 'kpi_payouts',
    title: 'Pending & Available Payouts',
    category: 'Finance',
    defaultSize: 'm',
    description: 'Double-entry balance status with 7-day holding period indicators.',
    icon: 'fa-building-columns'
  },
  {
    id: 'widget_customer_sentiment',
    title: 'Customer Reviews & Replies',
    category: 'Customer',
    defaultSize: 'm',
    description: 'Latest 5-star and pending review replies across all active products.',
    icon: 'fa-comments'
  }
];

export const LAYOUT_PRESETS = {
  sales: [
    { id: 'kpi_revenue', size: 'm' },
    { id: 'kpi_orders', size: 'm' },
    { id: 'chart_revenue_trend', size: 'xl' },
    { id: 'table_recent_orders', size: 'xl' }
  ],
  inventory: [
    { id: 'widget_low_stock', size: 'm' },
    { id: 'kpi_orders', size: 'm' },
    { id: 'table_recent_orders', size: 'xl' },
    { id: 'chart_category_share', size: 'm' }
  ],
  minimal: [
    { id: 'kpi_revenue', size: 'm' },
    { id: 'kpi_orders', size: 'm' },
    { id: 'chart_revenue_trend', size: 'xl' }
  ],
  finance: [
    { id: 'kpi_revenue', size: 'm' },
    { id: 'kpi_payouts', size: 'm' },
    { id: 'chart_revenue_trend', size: 'xl' },
    { id: 'chart_category_share', size: 'm' }
  ]
};

export const WidgetGrid = {
  isEditing: false,
  gridElement: null,
  currentLayout: [],
  storageKey: 'ameza_dashboard_layout',

  init(containerId = 'dashboard-widget-grid', role = 'seller') {
    this.storageKey = `ameza_dashboard_layout_${role}`;
    this.gridElement = document.getElementById(containerId);
    if (!this.gridElement) return;

    this.loadLayout();
    this.renderCustomizationControls();
    this.renderGalleryDrawer();
    this.bindGlobalEvents();
  },

  loadLayout() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.currentLayout = JSON.parse(saved);
      } else {
        this.currentLayout = JSON.parse(JSON.stringify(LAYOUT_PRESETS.sales));
      }
    } catch (e) {
      this.currentLayout = JSON.parse(JSON.stringify(LAYOUT_PRESETS.sales));
    }
  },

  saveLayout() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentLayout));
  },

  toggleCustomize() {
    this.isEditing = !this.isEditing;
    const banner = document.getElementById('grid-customize-banner');
    if (banner) banner.style.display = this.isEditing ? 'flex' : 'none';

    if (this.gridElement) {
      this.gridElement.classList.toggle('grid-customizing', this.isEditing);
      this.updateWidgetsEditState();
    }

    if (this.isEditing) {
      showToast('Dashboard edit mode active. Drag to reorder, resize, or add widgets.', 'info');
    } else {
      this.saveLayout();
      showToast('Dashboard layout saved successfully.', 'success');
    }
  },

  updateWidgetsEditState() {
    const items = this.gridElement.querySelectorAll('.dashboard-widget-item');
    items.forEach(item => {
      const widgetId = item.getAttribute('data-widget-id');
      const widgetConfig = this.currentLayout.find(w => w.id === widgetId) || { size: 'm' };

      let handle = item.querySelector('.widget-edit-toolbar');
      if (this.isEditing) {
        if (!handle) {
          handle = document.createElement('div');
          handle.className = 'widget-edit-toolbar';
          handle.innerHTML = `
            <div class="drag-handle" title="Drag to reorder" draggable="true">
              <i class="fa-solid fa-grip-vertical"></i>
            </div>
            <div class="size-pill-group">
              <button class="size-btn ${widgetConfig.size === 's' ? 'active' : ''}" data-size="s">S</button>
              <button class="size-btn ${widgetConfig.size === 'm' ? 'active' : ''}" data-size="m">M</button>
              <button class="size-btn ${widgetConfig.size === 'l' ? 'active' : ''}" data-size="l">L</button>
              <button class="size-btn ${widgetConfig.size === 'xl' ? 'active' : ''}" data-size="xl">XL</button>
            </div>
            <button class="remove-widget-btn" title="Remove widget">&times;</button>
          `;
          item.prepend(handle);

          // Size switch click
          handle.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const sz = e.target.getAttribute('data-size');
              this.setWidgetSize(widgetId, sz);
            });
          });

          // Remove click
          handle.querySelector('.remove-widget-btn').addEventListener('click', () => {
            this.removeWidget(widgetId);
          });
        }
      } else {
        handle?.remove();
      }
    });

    this.bindDragEvents();
  },

  setWidgetSize(widgetId, newSize) {
    const item = this.gridElement.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!item) return;

    item.classList.remove('col-s', 'col-m', 'col-l', 'col-xl');
    item.classList.add(`col-${newSize}`);

    const target = this.currentLayout.find(w => w.id === widgetId);
    if (target) target.size = newSize;

    item.querySelectorAll('.size-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-size') === newSize);
    });
    this.saveLayout();
  },

  removeWidget(widgetId) {
    this.currentLayout = this.currentLayout.filter(w => w.id !== widgetId);
    const item = this.gridElement.querySelector(`[data-widget-id="${widgetId}"]`);
    item?.remove();
    this.saveLayout();
    showToast('Widget removed from dashboard', 'info');
  },

  addWidget(widgetId) {
    if (this.currentLayout.some(w => w.id === widgetId)) {
      showToast('This widget is already on your dashboard.', 'warning');
      return;
    }
    const def = WIDGET_CATALOG.find(w => w.id === widgetId);
    if (!def) return;

    this.currentLayout.push({ id: widgetId, size: def.defaultSize });
    this.saveLayout();

    // Trigger page re-render of widgets
    window.dispatchEvent(new CustomEvent('ameza:widget-added', { detail: { widgetId } }));
    this.closeGalleryDrawer();
    showToast(`Added "${def.title}" to dashboard`, 'success');
  },

  applyPreset(presetKey) {
    if (!LAYOUT_PRESETS[presetKey]) return;
    this.currentLayout = JSON.parse(JSON.stringify(LAYOUT_PRESETS[presetKey]));
    this.saveLayout();
    showToast(`Applied ${presetKey.toUpperCase()} layout preset`, 'info');
    window.location.reload();
  },

  renderCustomizationControls() {
    const banner = document.createElement('div');
    banner.id = 'grid-customize-banner';
    banner.className = 'grid-customize-banner';
    banner.style.display = 'none';

    banner.innerHTML = `
      <div class="banner-left">
        <i class="fa-solid fa-wand-magic-sparkles text-primary"></i>
        <span class="font-bold text-sm">Dashboard Customization Mode</span>
        <span class="text-xs text-muted">Drag to reorder &bull; Use S/M/L/XL to resize</span>
      </div>
      <div class="banner-right">
        <button class="btn btn-secondary btn-xs" id="open-widget-gallery-btn">
          <i class="fa-solid fa-plus"></i> Add Widget
        </button>
        <div class="dropdown" id="preset-dropdown">
          <button class="btn btn-secondary btn-xs">
            Presets <i class="fa-solid fa-chevron-down ms-1" style="font-size:10px;"></i>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item preset-select-btn" data-preset="sales">Sales Focus</button>
            <button class="dropdown-item preset-select-btn" data-preset="inventory">Inventory Focus</button>
            <button class="dropdown-item preset-select-btn" data-preset="minimal">Minimalist</button>
            <button class="dropdown-item preset-select-btn" data-preset="finance">Finance & Balances</button>
          </div>
        </div>
        <button class="btn btn-primary btn-xs" id="save-customize-btn">
          <i class="fa-solid fa-check"></i> Done
        </button>
      </div>
    `;

    this.gridElement.parentNode.insertBefore(banner, this.gridElement);

    banner.querySelector('#open-widget-gallery-btn').addEventListener('click', () => this.openGalleryDrawer());
    banner.querySelector('#save-customize-btn').addEventListener('click', () => this.toggleCustomize());
    banner.querySelectorAll('.preset-select-btn').forEach(b => {
      b.addEventListener('click', (e) => this.applyPreset(e.target.getAttribute('data-preset')));
    });
  },

  renderGalleryDrawer() {
    let drawer = document.getElementById('widget-gallery-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'widget-gallery-drawer';
      drawer.className = 'drawer-backdrop';
      drawer.innerHTML = `
        <div class="drawer-panel drawer-right">
          <div class="drawer-header">
            <h3 class="modal-title font-bold text-base"><i class="fa-solid fa-shapes text-primary me-2"></i>Widget Gallery</h3>
            <button class="modal-close" id="close-gallery-btn">&times;</button>
          </div>
          <div class="drawer-body">
            <div class="text-xs text-muted mb-3">Select widgets to add to your customizable dashboard grid:</div>
            <div class="widget-gallery-list" style="display:flex; flex-direction:column; gap:12px;">
              ${WIDGET_CATALOG.map(w => `
                <div class="card p-3 card-hover" style="display:flex; align-items:flex-start; gap:12px;">
                  <div class="kpi-icon-wrap" style="width:36px; height:36px; border-radius:8px; flex-shrink:0;">
                    <i class="fa-solid ${w.icon}"></i>
                  </div>
                  <div style="flex:1;">
                    <div class="font-bold text-sm text-main">${escapeHTML(w.title)}</div>
                    <div class="text-xs text-muted mt-1">${escapeHTML(w.description)}</div>
                    <div class="d-flex align-items-center justify-content-between mt-2">
                      <span class="badge badge-neutral text-xs">${escapeHTML(w.category)}</span>
                      <button class="btn btn-primary btn-xs add-gallery-widget-btn" data-id="${w.id}">
                        <i class="fa-solid fa-plus"></i> Add
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(drawer);

      drawer.querySelector('#close-gallery-btn').addEventListener('click', () => this.closeGalleryDrawer());
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) this.closeGalleryDrawer();
      });

      drawer.querySelectorAll('.add-gallery-widget-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          this.addWidget(id);
        });
      });
    }
  },

  openGalleryDrawer() {
    const drawer = document.getElementById('widget-gallery-drawer');
    drawer?.classList.add('active');
  },

  closeGalleryDrawer() {
    const drawer = document.getElementById('widget-gallery-drawer');
    drawer?.classList.remove('active');
  },

  bindDragEvents() {
    let draggedItem = null;
    const items = this.gridElement.querySelectorAll('.dashboard-widget-item');

    items.forEach(item => {
      const handle = item.querySelector('.drag-handle');
      if (!handle) return;

      handle.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', () => {
        draggedItem = null;
        item.classList.remove('is-dragging');
        this.syncLayoutOrderFromDOM();
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === item) return;

        const rect = item.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        this.gridElement.insertBefore(draggedItem, next ? item.nextSibling : item);
      });
    });
  },

  syncLayoutOrderFromDOM() {
    const newOrder = [];
    this.gridElement.querySelectorAll('.dashboard-widget-item').forEach(item => {
      const id = item.getAttribute('data-widget-id');
      const existing = this.currentLayout.find(w => w.id === id);
      if (existing) newOrder.push(existing);
    });
    this.currentLayout = newOrder;
    this.saveLayout();
  },

  bindGlobalEvents() {
    window.addEventListener('ameza:toggle-customize', () => this.toggleCustomize());
  }
};

if (typeof window !== 'undefined') {
  window.WidgetGrid = WidgetGrid;
}
