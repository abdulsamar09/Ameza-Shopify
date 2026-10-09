/**
 * AMEZA Buyer Account Overview — buyer/js/pages/account.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { escapeHTML, formatMoney } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initAccountPage() {
  const session = getSession() || (window.AmezaAuth && window.AmezaAuth.getCurrentUser && window.AmezaAuth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = AccountUI.sidebarHTML(session, 'overview');
    AccountUI.initMobileSidebar();
  }

  // Welcome user banner
  const nameEl = document.getElementById('welcome-name');
  if (nameEl) {
    nameEl.textContent = `Welcome back, ${session.firstName || session.name || 'Shopper'}!`;
  }

  // Quick Stats
  let orders = [];
  try {
    if (window.AmezaAuth && typeof window.AmezaAuth.getOrders === 'function') {
      orders = window.AmezaAuth.getOrders(session.id || session.userId);
    } else {
      const stored = localStorage.getItem('ameza_orders');
      if (stored) orders = JSON.parse(stored);
    }
  } catch (e) {}

  const ordersCountEl = document.getElementById('stat-orders-count');
  if (ordersCountEl) ordersCountEl.textContent = orders.length;

  let wishlist = [];
  try {
    const rawWish = localStorage.getItem('ameza_wishlist');
    if (rawWish) wishlist = JSON.parse(rawWish);
  } catch (e) {}
  const wishCountEl = document.getElementById('stat-wishlist-count');
  if (wishCountEl) wishCountEl.textContent = wishlist.length;

  let addresses = [];
  try {
    if (window.AmezaAuth && typeof window.AmezaAuth.getAddresses === 'function') {
      addresses = window.AmezaAuth.getAddresses(session.id || session.userId);
    }
  } catch (e) {}
  const addrCountEl = document.getElementById('stat-addresses-count');
  if (addrCountEl) addrCountEl.textContent = addresses.length;

  // Recent Orders preview
  const recentList = document.getElementById('recent-orders-list');
  if (recentList) {
    if (orders.length === 0) {
      recentList.innerHTML = `
        <div style="text-align:center; padding: 32px 16px; color: var(--text-muted);">
          <p style="margin-bottom: 12px; font-weight:600;">No orders placed yet.</p>
          <a href="/storefront/shop.html" class="btn-section-action" style="display:inline-flex; padding:8px 18px; text-decoration:none;">Start Shopping</a>
        </div>
      `;
    } else {
      recentList.innerHTML = orders.slice(0, 3).map(o => `
        <div class="order-card" style="padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-weight: 800; color: var(--dark); font-size: 0.95rem;">Order #${escapeHTML(o.id || o.orderId)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${AccountUI.formatDate(o.createdAt || o.date)} &bull; ${o.items ? o.items.length : 1} items</div>
          </div>
          <div>${AccountUI.statusBadge(o.status || 'Processing')}</div>
          <div style="font-weight: 800; font-size: 1rem; color: var(--dark);">${AccountUI.formatPrice(o.total || o.totalCents || 0)}</div>
          <a href="/buyer/order-detail.html?id=${encodeURIComponent(o.id || o.orderId)}" class="btn-view-order" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 6px; text-decoration: none; border: 1px solid var(--border); color: var(--dark);">View Order</a>
        </div>
      `).join('');
    }
  }
}

// Auto-run on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initAccountPage();
  });
} else {
  initLayout();
  initAccountPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initAccountPage = initAccountPage;
