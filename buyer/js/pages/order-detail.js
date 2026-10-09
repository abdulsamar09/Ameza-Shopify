/**
 * AMEZA Buyer Order Detail Module — buyer/js/pages/order-detail.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { escapeHTML } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initOrderDetailPage() {
  const session = getSession() || (window.AmezaAuth && window.AmezaAuth.getCurrentUser && window.AmezaAuth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = AccountUI.sidebarHTML(session, 'orders');
    AccountUI.initMobileSidebar();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id') || '';

  const detailContainer = document.getElementById('order-detail-main') || document.getElementById('order-detail-container') || document.getElementById('account-main-content');
  if (!detailContainer) return;

  let order = null;
  try {
    if (window.AmezaAuth && typeof window.AmezaAuth.getOrders === 'function') {
      const orders = window.AmezaAuth.getOrders(session.id || session.userId);
      order = orders.find(o => String(o.id || o.orderId) === String(orderId));
    }
    if (!order) {
      const stored = localStorage.getItem('ameza_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        order = orders.find(o => String(o.id || o.orderId) === String(orderId));
      }
    }
  } catch (e) {}

  if (!order) {
    detailContainer.innerHTML = `
      <div style="text-align:center; padding: 48px 16px; color: var(--text-muted);">
        <h3 style="font-size: 1.2rem; color: var(--dark); font-weight:800; margin-bottom: 8px;">Order #${escapeHTML(orderId || 'Unknown')} Not Found</h3>
        <p style="margin-bottom: 20px;">We could not locate this order in your account records.</p>
        <a href="/buyer/orders.html" class="btn-section-action" style="display:inline-flex; padding:10px 22px; text-decoration:none;">&larr; Back to My Orders</a>
      </div>
    `;
    return;
  }

  const items = order.items || [];
  const subtotal = order.subtotal || order.subtotalCents || (order.total ? order.total * 0.9 : 0);
  const tax = order.tax || order.taxCents || 0;
  const shipping = order.shipping || order.shippingCents || 0;
  const total = order.total || order.totalCents || 0;

  detailContainer.innerHTML = `
    <div style="margin-bottom: 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <div>
        <a href="/buyer/orders.html" style="text-decoration:none; color:var(--primary, #7DBA35); font-weight:700; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px; margin-bottom:8px;">
          &larr; Back to Orders
        </a>
        <h1 style="font-size: 1.5rem; font-weight:800; color:var(--dark); margin:0;">Order #${escapeHTML(order.id || order.orderId)}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
          Placed on ${AccountUI.formatDate(order.createdAt || order.date)} &bull; ${escapeHTML(order.paymentStatus || 'Paid')}
        </div>
      </div>
      <div>
        ${AccountUI.statusBadge(order.status || 'Processing')}
      </div>
    </div>

    <!-- Items List Card -->
    <div class="account-card" style="margin-bottom: 20px; padding: 24px; border: 1px solid var(--border); border-radius: var(--radius-lg); background:#FFF;">
      <h3 style="font-size: 1.05rem; font-weight:800; color:var(--dark); margin-bottom:16px;">Order Items (${items.length || 1})</h3>
      <div style="display:grid; gap:16px;">
        ${(items.length > 0 ? items : [{ name: 'Item Ordered', price: total, quantity: 1 }]).map(it => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:14px; border-bottom:1px solid var(--border-subtle, #F1F5F9);">
            <div>
              <div style="font-weight:700; color:var(--dark); font-size:0.95rem;">${escapeHTML(it.name || it.title || 'Product')}</div>
              <div style="font-size:0.82rem; color:var(--text-muted);">Qty: ${it.quantity || 1} &bull; Merchant: ${escapeHTML(it.seller || it.vendor || 'Verified Seller')}</div>
            </div>
            <div style="font-weight:800; color:var(--dark); font-size:1rem;">
              ${AccountUI.formatPrice(it.price || 0)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Financial Totals -->
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1.5px dashed var(--border); max-width: 340px; margin-left: auto;">
        <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:var(--text-muted); margin-bottom:6px;">
          <span>Subtotal:</span><span>${AccountUI.formatPrice(subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:var(--text-muted); margin-bottom:6px;">
          <span>Standard U.S. Shipping:</span><span>${shipping > 0 ? AccountUI.formatPrice(shipping) : 'FREE'}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.88rem; color:var(--text-muted); margin-bottom:10px;">
          <span>Estimated Sales Tax:</span><span>${AccountUI.formatPrice(tax)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:900; color:var(--dark); padding-top:8px; border-top:1px solid var(--border);">
          <span>Grand Total:</span><span>${AccountUI.formatPrice(total)}</span>
        </div>
      </div>
    </div>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initOrderDetailPage();
  });
} else {
  initLayout();
  initOrderDetailPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initOrderDetailPage = initOrderDetailPage;
