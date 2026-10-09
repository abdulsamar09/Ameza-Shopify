/**
 * AMEZA Buyer Orders Page Module — buyer/js/pages/orders.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { escapeHTML } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initOrdersPage() {
  const session = getSession() || (window.AmezaAuth && window.AmezaAuth.getCurrentUser && window.AmezaAuth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Active tab (orders vs returns)
  const urlParams = new URLSearchParams(window.location.search);
  const isReturnsTab = urlParams.get('tab') === 'returns';

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = AccountUI.sidebarHTML(session, isReturnsTab ? 'returns' : 'orders');
    AccountUI.initMobileSidebar();
  }

  // Load orders
  let allOrders = [];
  try {
    if (window.AmezaAuth && typeof window.AmezaAuth.getOrders === 'function') {
      allOrders = window.AmezaAuth.getOrders(session.id || session.userId);
    } else {
      const stored = localStorage.getItem('ameza_orders');
      if (stored) allOrders = JSON.parse(stored);
    }
  } catch (e) {}

  const ordersContainer = document.getElementById('orders-container') || document.getElementById('orders-list') || document.getElementById('account-orders-container');
  if (!ordersContainer) return;

  function renderList(orders) {
    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <div style="text-align:center; padding: 48px 16px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display:block; opacity:0.4;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <h3 style="font-size: 1.1rem; color: var(--dark); font-weight:700; margin-bottom: 6px;">No orders found</h3>
          <p style="font-size: 0.9rem; margin-bottom: 18px;">You haven't placed any orders matching this filter.</p>
          <a href="/storefront/shop.html" class="btn-section-action" style="display:inline-flex; padding:10px 22px; text-decoration:none;">Browse Products</a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = orders.map(o => `
      <div class="order-card" style="padding: 20px; border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 16px; background: #FFF;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle, #F1F5F9);">
          <div>
            <div style="font-size: 1rem; font-weight: 800; color: var(--dark);">Order #${escapeHTML(o.id || o.orderId)}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">Placed on ${AccountUI.formatDate(o.createdAt || o.date)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${AccountUI.statusBadge(o.status || 'Processing')}
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--dark);">${AccountUI.formatPrice(o.total || o.totalCents || 0)}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-size: 0.88rem; color: var(--text-muted);">
            Items: <strong>${o.items ? o.items.length : 1}</strong> &bull; Payment: <strong style="color:var(--dark);">${escapeHTML(o.paymentStatus || 'Paid')}</strong>
          </div>
          <a href="/buyer/order-detail.html?id=${encodeURIComponent(o.id || o.orderId)}" class="btn-view-order" style="display:inline-flex; align-items:center; gap:6px; padding: 8px 16px; font-weight: 700; font-size: 0.85rem; border-radius: 8px; text-decoration: none; border: 1px solid var(--border); color: var(--dark); background: var(--bg-surface, #FFF);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            View Details
          </a>
        </div>
      </div>
    `).join('');
  }

  // Filter input & status selects if present
  const searchInput = document.getElementById('orders-search-input');
  const statusFilter = document.getElementById('orders-status-filter');

  function filterOrders() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const st = (statusFilter?.value || 'all').toLowerCase();

    let filtered = allOrders;
    if (isReturnsTab) {
      filtered = filtered.filter(o => (o.status || '').toLowerCase().includes('return') || (o.status || '').toLowerCase().includes('refund'));
    }
    if (st !== 'all') {
      filtered = filtered.filter(o => (o.status || '').toLowerCase() === st);
    }
    if (q) {
      filtered = filtered.filter(o => String(o.id || o.orderId).toLowerCase().includes(q) || (o.items && o.items.some(it => String(it.name || it.title).toLowerCase().includes(q))));
    }
    renderList(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterOrders);
  if (statusFilter) statusFilter.addEventListener('change', filterOrders);

  filterOrders();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initOrdersPage();
  });
} else {
  initLayout();
  initOrdersPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initOrdersPage = initOrdersPage;
