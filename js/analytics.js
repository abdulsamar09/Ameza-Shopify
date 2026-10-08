/**
 * AMEZA Seller Central — Analytics & Business Intelligence Engine (js/analytics.js)
 * Implements pure SVG charts, US Census region breakdown, conversion funnel,
 * and top products reporting with 100% US minor-unit compliance.
 */

import { Icons } from './icons.js';
import { escapeHTML, showToast } from './shell.js';

// Sample period dataset with realistic US marketplace volume
const ANALYTICS_DATA = {
  '30d': {
    label: 'Last 30 days',
    comparisonLabel: 'vs. previous 30 days',
    kpis: {
      sales: { value: '$48,480.00', rawCents: 4848000, delta: '+14.2%', up: true },
      orders: { value: '348', rawCount: 348, delta: '+8.7%', up: true },
      aov: { value: '$139.31', rawCents: 13931, delta: '+5.1%', up: true },
      conv: { value: '1.44%', rawRate: 1.44, delta: '+0.3%', up: true }
    },
    chart: {
      labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
      values: [1120, 1450, 1380, 1890, 1620, 2140, 2480]
    },
    categories: [
      { name: 'Clothing & Fashion', share: 38, amount: '$18,422.40', color: '#10B981' },
      { name: 'Smart Electronics', share: 30, amount: '$14,544.00', color: '#3B82F6' },
      { name: 'Leather Goods', share: 18, amount: '$8,726.40', color: '#8B5CF6' },
      { name: 'Horology & Watches', share: 10, amount: '$4,848.00', color: '#F59E0B' },
      { name: 'Bags & Totes', share: 4, amount: '$1,939.20', color: '#EC4899' }
    ],
    funnel: [
      { step: 'Store Sessions', count: '24,150', pct: 100, drop: '0%' },
      { step: 'Product Page Views', count: '11,280', pct: 46.7, drop: '53.3% drop-off' },
      { step: 'Added to Cart', count: '2,410', pct: 10.0, drop: '78.6% drop-off' },
      { step: 'Completed Orders', count: '348', pct: 1.44, drop: '85.6% drop-off' }
    ]
  },
  '7d': {
    label: 'Last 7 days',
    comparisonLabel: 'vs. previous 7 days',
    kpis: {
      sales: { value: '$12,680.00', rawCents: 1268000, delta: '+9.4%', up: true },
      orders: { value: '92', rawCount: 92, delta: '+6.2%', up: true },
      aov: { value: '$137.82', rawCents: 13782, delta: '+3.0%', up: true },
      conv: { value: '1.51%', rawRate: 1.51, delta: '+0.4%', up: true }
    },
    chart: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [1540, 1680, 1420, 1950, 1890, 2120, 2080]
    },
    categories: [
      { name: 'Clothing & Fashion', share: 37, amount: '$4,691.60', color: '#10B981' },
      { name: 'Smart Electronics', share: 31, amount: '$3,930.80', color: '#3B82F6' },
      { name: 'Leather Goods', share: 17, amount: '$2,155.60', color: '#8B5CF6' },
      { name: 'Horology & Watches', share: 11, amount: '$1,394.80', color: '#F59E0B' },
      { name: 'Bags & Totes', share: 4, amount: '$507.20', color: '#EC4899' }
    ],
    funnel: [
      { step: 'Store Sessions', count: '6,100', pct: 100, drop: '0%' },
      { step: 'Product Page Views', count: '2,890', pct: 47.4, drop: '52.6% drop-off' },
      { step: 'Added to Cart', count: '640', pct: 10.5, drop: '77.9% drop-off' },
      { step: 'Completed Orders', count: '92', pct: 1.51, drop: '85.6% drop-off' }
    ]
  },
  '90d': {
    label: 'Last 90 days',
    comparisonLabel: 'vs. previous 90 days',
    kpis: {
      sales: { value: '$142,350.00', rawCents: 14235000, delta: '+21.8%', up: true },
      orders: { value: '1,044', rawCount: 1044, delta: '+16.5%', up: true },
      aov: { value: '$136.35', rawCents: 13635, delta: '+4.5%', up: true },
      conv: { value: '1.41%', rawRate: 1.41, delta: '+0.2%', up: true }
    },
    chart: {
      labels: ['M1 W1', 'M1 W3', 'M2 W1', 'M2 W3', 'M3 W1', 'M3 W3'],
      values: [18400, 22100, 24300, 25800, 24900, 26850]
    },
    categories: [
      { name: 'Clothing & Fashion', share: 39, amount: '$55,516.50', color: '#10B981' },
      { name: 'Smart Electronics', share: 29, amount: '$41,281.50', color: '#3B82F6' },
      { name: 'Leather Goods', share: 19, amount: '$27,046.50', color: '#8B5CF6' },
      { name: 'Horology & Watches', share: 9, amount: '$12,811.50', color: '#F59E0B' },
      { name: 'Bags & Totes', share: 4, amount: '$5,694.00', color: '#EC4899' }
    ],
    funnel: [
      { step: 'Store Sessions', count: '74,200', pct: 100, drop: '0%' },
      { step: 'Product Page Views', count: '34,500', pct: 46.5, drop: '53.5% drop-off' },
      { step: 'Added to Cart', count: '7,320', pct: 9.9, drop: '78.8% drop-off' },
      { step: 'Completed Orders', count: '1,044', pct: 1.41, drop: '85.7% drop-off' }
    ]
  }
};

// US Census Regions data
const US_CENSUS_REGIONS = [
  {
    region: 'South',
    states: 'TX, FL, NC, GA, VA, TN',
    orders: 142,
    sales: '$19,876.80',
    share: 41.0,
    growth: '+18.4%'
  },
  {
    region: 'West',
    states: 'CA, WA, OR, CO, AZ, NV',
    orders: 108,
    sales: '$15,125.76',
    share: 31.2,
    growth: '+12.1%'
  },
  {
    region: 'Northeast',
    states: 'NY, PA, MA, NJ, CT, MD',
    orders: 62,
    sales: '$8,726.40',
    share: 18.0,
    growth: '+8.7%'
  },
  {
    region: 'Midwest',
    states: 'IL, OH, MI, IN, MO, WI',
    orders: 36,
    sales: '$4,751.04',
    share: 9.8,
    growth: '+5.3%'
  }
];

// Top 5 Products Table
const TOP_PRODUCTS = [
  {
    id: 'prod_100',
    sku: 'AMZ-LTH-001',
    name: 'Classic Saddle Leather Belt',
    category: 'Leather Goods',
    unitsSold: 98,
    grossSales: '$5,782.00',
    convRate: '4.8%',
    stock: 45,
    status: 'In Stock',
    icon: 'fa-shield-halved'
  },
  {
    id: 'prod_101',
    sku: 'AMZ-LTH-002',
    name: 'Full-Grain Slim Wallet',
    category: 'Leather Goods',
    unitsSold: 74,
    grossSales: '$3,626.00',
    convRate: '4.2%',
    stock: 28,
    status: 'In Stock',
    icon: 'fa-wallet'
  },
  {
    id: 'prod_114',
    sku: 'AMZ-APP-014',
    name: 'Relaxed Organic Linen Shirt',
    category: 'Clothing & Fashion',
    unitsSold: 65,
    grossSales: '$4,875.00',
    convRate: '3.9%',
    stock: 8,
    status: 'Low Stock',
    icon: 'fa-shirt'
  },
  {
    id: 'prod_126',
    sku: 'AMZ-WTC-004',
    name: 'Precision Chronograph 41mm',
    category: 'Horology & Watches',
    unitsSold: 42,
    grossSales: '$10,458.00',
    convRate: '3.1%',
    stock: 14,
    status: 'In Stock',
    icon: 'fa-clock'
  },
  {
    id: 'prod_108',
    sku: 'AMZ-ELC-009',
    name: 'Active Noise-Cancelling Headphones',
    category: 'Smart Electronics',
    unitsSold: 38,
    grossSales: '$7,562.00',
    convRate: '2.9%',
    stock: 22,
    status: 'In Stock',
    icon: 'fa-headphones'
  }
];

let activePeriod = '30d';

export function initAnalytics() {
  renderAnalyticsDashboard();
  bindAnalyticsEvents();
}

function renderAnalyticsDashboard() {
  const container = document.getElementById('analytics-content-container');
  if (!container) return;

  const data = ANALYTICS_DATA[activePeriod] || ANALYTICS_DATA['30d'];

  container.innerHTML = `
    <!-- Top Action Row -->
    <div class="page-header" style="margin-bottom: 24px;">
      <div>
        <h1 class="page-title">Analytics & Intelligence</h1>
        <p class="page-subtitle">Track revenue volume, conversion funnels, and geographic customer demand across the United States.</p>
      </div>

      <div class="page-header-actions" style="display: flex; gap: 10px; align-items: center;">
        <!-- Period Dropdown -->
        <div style="position: relative;">
          <button class="btn-header-secondary" id="btn-period-select" style="display: flex; align-items: center; gap: 8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span id="active-period-label">${escapeHTML(data.label)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="dropdown-menu-popover" id="period-dropdown-menu" style="min-width: 160px; right: 0;">
            <button class="dropdown-item ${activePeriod === '7d' ? 'active' : ''}" data-period="7d">Last 7 days</button>
            <button class="dropdown-item ${activePeriod === '30d' ? 'active' : ''}" data-period="30d">Last 30 days</button>
            <button class="dropdown-item ${activePeriod === '90d' ? 'active' : ''}" data-period="90d">Last 90 days</button>
          </div>
        </div>

        <!-- Export CSV Button -->
        <button class="btn-header-primary" id="btn-export-analytics" style="display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV Report
        </button>
      </div>
    </div>

    <!-- 1. KPI Cards Grid -->
    <div class="metrics-grid" style="margin-bottom: 24px;">
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #10B981; background: rgba(16, 185, 129, 0.1);"><i class="fa-solid fa-dollar-sign"></i></div>
          <span class="metric-title">Gross Sales Volume</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${data.kpis.sales.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${data.kpis.sales.up ? 'up' : 'down'}">${data.kpis.sales.delta}</span>
            <span class="metric-comparison">${data.comparisonLabel}</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #3B82F6; background: rgba(59, 130, 246, 0.1);"><i class="fa-solid fa-cart-shopping"></i></div>
          <span class="metric-title">Total Orders Placed</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${data.kpis.orders.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${data.kpis.orders.up ? 'up' : 'down'}">${data.kpis.orders.delta}</span>
            <span class="metric-comparison">${data.comparisonLabel}</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #8B5CF6; background: rgba(139, 92, 246, 0.1);"><i class="fa-solid fa-receipt"></i></div>
          <span class="metric-title">Average Order Value (AOV)</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${data.kpis.aov.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${data.kpis.aov.up ? 'up' : 'down'}">${data.kpis.aov.delta}</span>
            <span class="metric-comparison">${data.comparisonLabel}</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon-circle" style="color: #F59E0B; background: rgba(245, 158, 11, 0.1);"><i class="fa-solid fa-arrow-trend-up"></i></div>
          <span class="metric-title">Storefront Conversion</span>
        </div>
        <div class="metric-value-row">
          <div class="metric-val">${data.kpis.conv.value}</div>
        </div>
        <div class="metric-footer">
          <div class="metric-delta-wrap">
            <span class="metric-delta ${data.kpis.conv.up ? 'up' : 'down'}">${data.kpis.conv.delta}</span>
            <span class="metric-comparison">${data.comparisonLabel}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Charts Row: Sales Over Time + Sales by Category Donut -->
    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 20px; margin-bottom: 24px;">
      <!-- Card: Sales Over Time Area Chart -->
      <div class="dashboard-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
        <div class="card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 class="card-title" style="font-size: 16px; font-weight: 700;">Sales Volume Over Time</h2>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Daily revenue run rate in USD</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10B981;"></span>
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Gross Sales ($)</span>
          </div>
        </div>
        <div style="width: 100%; height: 260px; position: relative;">
          ${renderSvgAreaChart(data.chart)}
        </div>
      </div>

      <!-- Card: Category Donut Chart -->
      <div class="dashboard-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
        <div class="card-top" style="margin-bottom: 16px;">
          <h2 class="card-title" style="font-size: 16px; font-weight: 700;">Sales by Category</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Share of overall gross catalog revenue</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          ${renderSvgDonutChart(data.categories, data.kpis.sales.value)}
          <div style="width: 100%; margin-top: 18px; display: flex; flex-direction: column; gap: 8px;">
            ${data.categories.map(c => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 3px; background: ${c.color}; display: inline-block;"></span>
                  <span style="color: var(--text-main); font-weight: 500;">${escapeHTML(c.name)}</span>
                </div>
                <div style="display: flex; gap: 12px;">
                  <span style="font-weight: 700; color: var(--text-main);">${escapeHTML(c.amount)}</span>
                  <span style="color: var(--text-secondary); min-width: 32px; text-align: right;">${c.share}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Regional Breakdown + 4-Step Funnel Row -->
    <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-bottom: 24px;">
      <!-- US Census Region Breakdown Table -->
      <div class="dashboard-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
        <div class="card-top" style="margin-bottom: 16px;">
          <h2 class="card-title" style="font-size: 16px; font-weight: 700;">US Census Region Distribution</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Domestic fulfillment volume aggregated by geographical territory</p>
        </div>
        <div class="table-responsive">
          <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 12px; color: var(--text-secondary);">
                <th style="padding: 10px 8px;">Census Region</th>
                <th style="padding: 10px 8px;">Primary States</th>
                <th style="padding: 10px 8px; text-align: right;">Orders</th>
                <th style="padding: 10px 8px; text-align: right;">Gross ($)</th>
                <th style="padding: 10px 8px; width: 140px;">Share (%)</th>
              </tr>
            </thead>
            <tbody>
              ${US_CENSUS_REGIONS.map(reg => `
                <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 12.5px;">
                  <td style="padding: 12px 8px; font-weight: 700; color: var(--text-main);">
                    <i class="fa-solid fa-location-dot" style="color: #10B981; margin-right: 6px;"></i>
                    ${escapeHTML(reg.region)}
                  </td>
                  <td style="padding: 12px 8px; color: var(--text-secondary);">${escapeHTML(reg.states)}</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${reg.orders}</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: var(--text-main);">${escapeHTML(reg.sales)}</td>
                  <td style="padding: 12px 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="flex: 1; height: 6px; background: var(--border-subtle); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${reg.share}%; height: 100%; background: linear-gradient(90deg, #10B981, #059669); border-radius: 3px;"></div>
                      </div>
                      <span style="font-size: 11px; font-weight: 700; min-width: 34px;">${reg.share}%</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4-Step Conversion Funnel -->
      <div class="dashboard-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
        <div class="card-top" style="margin-bottom: 16px;">
          <h2 class="card-title" style="font-size: 16px; font-weight: 700;">E-Commerce Conversion Funnel</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Step-by-step buyer progression from initial visit to completed purchase</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
          ${data.funnel.map((step, idx) => `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 12.5px;">
                <span style="font-weight: 600; color: var(--text-main);">
                  <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 50%; background: var(--border-subtle); font-size: 11px; margin-right: 6px;">${idx + 1}</span>
                  ${escapeHTML(step.step)}
                </span>
                <span style="font-weight: 700; color: var(--text-main);">${escapeHTML(step.count)}</span>
              </div>
              <div style="height: 10px; background: var(--border-subtle); border-radius: 5px; overflow: hidden; position: relative;">
                <div style="width: ${step.pct}%; height: 100%; background: linear-gradient(90deg, #3B82F6, #10B981); border-radius: 5px; transition: width 0.4s ease;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                <span>${step.pct}% of initial traffic</span>
                ${step.drop !== '0%' ? `<span style="color: #EF4444;"><i class="fa-solid fa-arrow-down" style="font-size: 9px;"></i> ${escapeHTML(step.drop)}</span>` : '<span style="color: #10B981;">Baseline</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- 4. Top 5 Performing Products Table -->
    <div class="dashboard-card" style="padding: 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
      <div class="card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h2 class="card-title" style="font-size: 16px; font-weight: 700;">Top 5 Performing Products</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Highest grossing SKUs and conversion velocity across the catalog</p>
        </div>
        <a href="products.html" class="btn-header-secondary" style="font-size: 12px; text-decoration: none;">View All Products &rarr;</a>
      </div>
      <div class="table-responsive">
        <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 12px; color: var(--text-secondary);">
              <th style="padding: 10px 8px;">Product</th>
              <th style="padding: 10px 8px;">Category</th>
              <th style="padding: 10px 8px; text-align: right;">Units Sold</th>
              <th style="padding: 10px 8px; text-align: right;">Gross Sales</th>
              <th style="padding: 10px 8px; text-align: right;">Conversion Rate</th>
              <th style="padding: 10px 8px; text-align: center;">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            ${TOP_PRODUCTS.map(p => `
              <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 12.5px;">
                <td style="padding: 12px 8px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--primary-green-dark); font-size: 14px;">
                      <i class="fa-solid ${p.icon}"></i>
                    </div>
                    <div>
                      <div style="font-weight: 700; color: var(--text-main);">${escapeHTML(p.name)}</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">SKU: ${escapeHTML(p.sku)}</div>
                    </div>
                  </div>
                </td>
                <td style="padding: 12px 8px; color: var(--text-secondary);">${escapeHTML(p.category)}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 700;">${p.unitsSold}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #10B981;">${escapeHTML(p.grossSales)}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${escapeHTML(p.convRate)}</td>
                <td style="padding: 12px 8px; text-align: center;">
                  <span class="status-pill ${p.status === 'In Stock' ? 'status-paid' : 'status-lowstock'}" style="font-size: 11px;">
                    ${escapeHTML(p.status)} (${p.stock})
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSvgAreaChart(chartData) {
  const width = 640;
  const height = 240;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxVal = Math.max(...chartData.values) * 1.15 || 3000;
  const ySteps = [Math.round(maxVal), Math.round(maxVal * 0.66), Math.round(maxVal * 0.33), 0];

  const gridLines = ySteps.map(stepVal => {
    const y = padT + (1 - stepVal / maxVal) * plotH;
    return `
      <g>
        <text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--text-tertiary)">$${stepVal.toLocaleString()}</text>
        <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" />
      </g>
    `;
  }).join('');

  const pts = chartData.values.map((v, i) => {
    const x = padL + (i / (chartData.values.length - 1)) * plotW;
    const y = padT + (1 - v / maxVal) * plotH;
    return { x, y, val: v, label: chartData.labels[i] };
  });

  const pathCoords = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${pts[0].x.toFixed(1)},${padT + plotH} L ${pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} L ${pts[pts.length - 1].x.toFixed(1)},${padT + plotH} Z`;

  const xLabels = pts.map(p => `
    <text x="${p.x}" y="${height - 6}" text-anchor="middle" font-size="10.5" fill="var(--text-tertiary)">${escapeHTML(p.label)}</text>
  `).join('');

  const circles = pts.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#FFFFFF" stroke="#10B981" stroke-width="2.5">
      <title>${p.label}: $${p.val.toLocaleString()}</title>
    </circle>
  `).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaSalesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#areaSalesGrad)" />
      <polyline points="${pathCoords}" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${xLabels}
      ${circles}
    </svg>
  `;
}

function renderSvgDonutChart(categories, totalFormatted) {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const circles = categories.map(c => {
    const dashLength = (c.share / 100) * circumference;
    const circle = `
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="transparent"
        stroke="${c.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashLength} ${circumference - dashLength}"
        stroke-dashoffset="${-accumulatedOffset}"
        style="transition: stroke-dasharray 0.5s ease;"
      >
        <title>${escapeHTML(c.name)}: ${c.share}% (${escapeHTML(c.amount)})</title>
      </circle>
    `;
    accumulatedOffset += dashLength;
    return circle;
  }).join('');

  return `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
        ${circles}
      </svg>
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
        <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Gross Total</span>
        <span style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${escapeHTML(totalFormatted)}</span>
      </div>
    </div>
  `;
}

function bindAnalyticsEvents() {
  const periodBtn = document.getElementById('btn-period-select');
  const periodMenu = document.getElementById('period-dropdown-menu');

  periodBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    periodMenu?.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    periodMenu?.classList.remove('active');
  });

  periodMenu?.querySelectorAll('[data-period]').forEach(item => {
    item.addEventListener('click', () => {
      activePeriod = item.getAttribute('data-period');
      periodMenu?.classList.remove('active');
      renderAnalyticsDashboard();
      bindAnalyticsEvents();
      showToast(`Updated analytics view for ${activePeriod.toUpperCase()}`, 'info');
    });
  });

  document.getElementById('btn-export-analytics')?.addEventListener('click', () => {
    exportAnalyticsCSV();
  });
}

function exportAnalyticsCSV() {
  const rows = [
    ['Metric', 'Value', 'Timeframe'],
    ['Gross Revenue', ANALYTICS_DATA[activePeriod].kpis.sales.value, activePeriod],
    ['Total Orders', ANALYTICS_DATA[activePeriod].kpis.orders.value, activePeriod],
    ['Average Order Value', ANALYTICS_DATA[activePeriod].kpis.aov.value, activePeriod],
    ['Store Conversion Rate', ANALYTICS_DATA[activePeriod].kpis.conv.value, activePeriod],
    [],
    ['US Census Region', 'Primary States', 'Orders', 'Gross Sales USD', 'Share Pct'],
    ...US_CENSUS_REGIONS.map(r => [r.region, `"${r.states}"`, r.orders, r.sales, `${r.share}%`]),
    [],
    ['Top SKU', 'Category', 'Units Sold', 'Gross Sales USD', 'Conversion Rate'],
    ...TOP_PRODUCTS.map(p => [p.name, p.category, p.unitsSold, p.grossSales, p.convRate])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ameza_analytics_${activePeriod}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Downloaded US Marketplace Analytics CSV report', 'success');
}
