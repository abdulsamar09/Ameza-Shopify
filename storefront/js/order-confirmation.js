/**
 * AMEZA Marketplace - Order Confirmation Screen Controller (js/order-confirmation.js)
 * Displays verified parent order and multi-vendor sub-orders with tracking numbers,
 * itemized ledger totals, tax, and print invoice functionality.
 */

import { OrdersAPI } from './api/orders.api.js';
import { formatMoney, escapeHTML } from './core/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('order-confirmation-root');
  if (!root) return;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    root.innerHTML = `
      <div class="order-conf-card" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 48px; color: #94A3B8; margin-bottom: 16px;">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 12px;">No Order ID Specified</h2>
        <p style="color: #64748B; font-size: 14px; margin: 0 0 24px;">Please check the link from your confirmation email or return to the marketplace.</p>
        <a href="store.html" class="btn-action-primary">Return to Store</a>
      </div>
    `;
    return;
  }

  // Fetch parent order & sub-orders
  let orderData = null;
  try {
    orderData = await OrdersAPI.getParentOrderDetails(orderId);
  } catch (e) {
    console.error('Failed to load order details:', e);
  }

  // Fallback lookup from localStorage
  if (!orderData) {
    try {
      const parentOrders = JSON.parse(localStorage.getItem('ameza_marketplace_parent_orders') || '[]');
      const parent = parentOrders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (parent) {
        const subOrders = JSON.parse(localStorage.getItem('ameza_marketplace_sub_orders') || '[]')
          .filter(s => s.parentOrderId === parent.id);
        orderData = { ...parent, subOrders };
      }
    } catch (e) {}
  }

  if (!orderData) {
    root.innerHTML = `
      <div class="order-conf-card" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 48px; color: #EF4444; margin-bottom: 16px;">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 12px;">Order Not Found</h2>
        <p style="color: #64748B; font-size: 14px; margin: 0 0 24px;">Could not retrieve details for Order #${escapeHTML(orderId)}. It may have been placed under a different session.</p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <a href="store.html" class="btn-action-primary">Continue Shopping</a>
          <a href="account-orders.html" class="btn-action-secondary">View Order History</a>
        </div>
      </div>
    `;
    return;
  }

  const {
    id,
    orderNumber = id,
    customerName = 'Valued Customer',
    customerEmail = 'customer@example.com',
    shippingAddress = {},
    paymentMethod = 'Credit Card',
    paymentStatus = 'Paid (Verified)',
    subtotalCents = 0,
    shippingCents = 0,
    taxCents = 0,
    taxRate = 0,
    discountCents = 0,
    grandTotalCents = 0,
    date = new Date().toLocaleDateString('en-US'),
    subOrders = []
  } = orderData;

  const addrStr = typeof shippingAddress === 'string'
    ? shippingAddress
    : [
        shippingAddress.address || shippingAddress.line1,
        shippingAddress.apt,
        shippingAddress.city ? `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}` : ''
      ].filter(Boolean).join(', ');

  const taxLabel = taxRate > 0
    ? `State Sales Tax (${(taxRate * 100).toFixed(2)}%)`
    : 'State Sales Tax';

  root.innerHTML = `
    <div class="order-conf-card">
      <div class="order-success-header">
        <div class="success-icon-badge">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="order-number-pill">Order #${escapeHTML(orderNumber)}</div>
        <h1 style="font-family:var(--font-heading, 'Plus Jakarta Sans', sans-serif); font-size:28px; font-weight:800; color:#0F172A; margin:0 0 8px;">
          Thank You, ${escapeHTML(customerName)}!
        </h1>
        <p style="font-size:14.5px; color:#64748B; margin:0; line-height:1.6;">
          Your order has been confirmed. A receipt and tracking notifications have been sent to <strong>${escapeHTML(customerEmail)}</strong>.
        </p>
      </div>

      <!-- Sub-Orders Grouped by Seller -->
      <h3 style="font-size:16px; font-weight:700; color:#0F172A; margin:0 0 16px;">
        Vendor Shipments (${subOrders.length} ${subOrders.length === 1 ? 'Package' : 'Packages'})
      </h3>

      ${subOrders.map((sub, idx) => `
        <div class="seller-suborder-card" data-suborder-id="${escapeHTML(sub.id)}">
          <div class="seller-header">
            <div class="seller-name-tag">
              <i class="fa-solid fa-store" style="color:#7FB73C;"></i>
              <span>${escapeHTML(sub.sellerName || 'Verified Seller')}</span>
              <span style="font-size:12px; font-weight:500; color:#94A3B8;">&bull; Shipment ${idx + 1} of ${subOrders.length}</span>
            </div>
            <div class="tracking-badge">
              <i class="fa-solid fa-truck"></i>
              <span>${escapeHTML(sub.carrier || 'USPS')}: ${escapeHTML(sub.trackingNumber || 'Pending')}</span>
            </div>
          </div>

          <div class="suborder-items-list">
            ${(sub.items || []).map(item => `
              <div class="item-row">
                <div class="item-info-col">
                  <img src="${escapeHTML(item.image || 'assets/products/placeholder.jpg')}" alt="${escapeHTML(item.name || item.productName)}" class="item-img-thumb" onerror="this.src='assets/products/placeholder.jpg'">
                  <div>
                    <div style="font-weight:700; color:#0F172A; font-size:14px;">${escapeHTML(item.name || item.productName || 'Handcrafted Product')}</div>
                    <div style="font-size:12.5px; color:#64748B;">
                      Qty: ${item.quantity || 1} &bull; Unit: ${formatMoney(item.unitPriceCents || item.price || 0)}
                      ${item.selectedColor ? ` &bull; Color: ${escapeHTML(item.selectedColor)}` : ''}
                      ${item.selectedSize ? ` &bull; Size: ${escapeHTML(item.selectedSize)}` : ''}
                    </div>
                  </div>
                </div>
                <div style="font-weight:700; color:#0F172A; font-size:14px;">
                  ${formatMoney(item.lineSubtotalCents || (item.unitPriceCents * item.quantity) || 0)}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:10px; border-top:1px dashed #E2E8F0; font-size:12.5px; color:#64748B;">
            <span>Subtotal: <strong>${formatMoney(sub.subtotalCents || sub.itemSubtotalCents || 0)}</strong> &bull; Shipping: <strong>${sub.shippingCents === 0 ? 'FREE' : formatMoney(sub.shippingCents)}</strong></span>
            <span style="color:#16A34A; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Status: Confirmed</span>
          </div>
        </div>
      `).join('')}

      <!-- Order Details Grid -->
      <div class="summary-grid">
        <div class="summary-block">
          <h4>Delivery Address</h4>
          <p><strong>${escapeHTML(customerName)}</strong></p>
          <p>${escapeHTML(addrStr || 'Address on file')}</p>
          <p style="margin-top:10px;"><strong>Contact:</strong> ${escapeHTML(customerEmail)}</p>

          <h4 style="margin-top:20px;">Payment Details</h4>
          <p><strong>Method:</strong> ${escapeHTML(paymentMethod)}</p>
          <p><strong>Status:</strong> <span style="color:#16A34A; font-weight:700;">${escapeHTML(paymentStatus)}</span></p>
          <p><strong>Date:</strong> ${escapeHTML(date)}</p>
        </div>

        <div class="summary-block">
          <h4>Order Totals</h4>
          <div class="totals-table-row">
            <span>Items Subtotal</span>
            <span>${formatMoney(subtotalCents)}</span>
          </div>

          <div class="totals-table-row">
            <span>Shipping & Handling</span>
            <span>${shippingCents === 0 ? 'FREE' : formatMoney(shippingCents)}</span>
          </div>

          <div class="totals-table-row">
            <span>${escapeHTML(taxLabel)}</span>
            <span>${formatMoney(taxCents)}</span>
          </div>

          ${discountCents > 0 ? `
            <div class="totals-table-row" style="color:#16A34A; font-weight:600;">
              <span>Coupon Discount</span>
              <span>-${formatMoney(discountCents)}</span>
            </div>
          ` : ''}

          <div class="totals-table-row grand-total">
            <span>Total Paid (USD)</span>
            <span>${formatMoney(grandTotalCents)}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons-row">
        <a href="store.html" class="btn-action-primary">
          <i class="fa-solid fa-arrow-left"></i> Continue Shopping
        </a>
        <a href="account-orders.html" class="btn-action-secondary" id="btn-track-order">
          <i class="fa-solid fa-truck-fast"></i> Track Order
        </a>
        <button type="button" class="btn-action-secondary" id="btn-print-invoice" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Print Invoice
        </button>
      </div>
    </div>
  `;
});
