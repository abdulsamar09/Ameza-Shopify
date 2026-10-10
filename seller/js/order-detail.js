/**
 * AMEZA Seller Dashboard - Order Detail Controller (Screen E)
 * Plain Vanilla ES Modules - High Fidelity & Calculated Money Rules
 */

import { Icons } from './icons.js';
import { COMMISSION_RATE, formatMoney } from './data.js';
import { showToast, escapeHTML } from '/seller/js/dashboard-shell.js';

let order = {
  id: '#AM-1042',
  rawId: '1042',
  date: 'April 29, 2025 at 10:24 AM',
  source: 'Online Store',
  paymentStatus: 'Paid',
  fulfillmentStatus: 'Unfulfilled',
  items: [
    {
      id: 1,
      name: 'Wireless Headphones',
      variant: 'White / Standard',
      sku: 'WH-001',
      price: 9900,
      qty: 1,
      fulfilled: false,
      thumb: 'thumbHeadphones'
    },
    {
      id: 2,
      name: 'Smart Watch',
      variant: 'Black / Standard',
      sku: 'SW-002',
      price: 14900,
      qty: 1,
      fulfilled: false,
      thumb: 'thumbWatch'
    }
  ],
  shipping: 1000, // $10.00
  paymentMethod: {
    cardBrand: 'Credit Card',
    last4: '4242',
    date: 'Apr 29, 2025 at 10:24 AM'
  },
  customer: {
    name: 'John Carter',
    email: 'john@example.com',
    phone: '+1 (555) 234-5678',
    shippingAddress: {
      name: 'John Carter',
      line1: '123 Oak Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States'
    },
    billingSameAsShipping: true
  },
  timeline: [
    {
      id: 1,
      title: 'Order placed',
      time: 'Apr 29, 2025 at 10:24 AM',
      detail: 'Customer placed this order',
      nodeType: 'node-green',
      icon: Icons.check
    },
    {
      id: 2,
      title: 'Payment captured',
      time: 'Apr 29, 2025 at 10:25 AM',
      detail: '$258.00 via Credit Card',
      nodeType: 'node-green',
      icon: Icons.check
    },
    {
      id: 3,
      title: 'Order unfulfilled',
      time: 'Apr 29, 2025 at 10:25 AM',
      detail: '2 items',
      nodeType: 'node-amber',
      icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`
    },
    {
      id: 4,
      title: 'Order created',
      time: 'Apr 29, 2025 at 10:24 AM',
      detail: 'by John Carter',
      nodeType: 'node-gray',
      icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/></svg>`
    }
  ],
  notes: ''
};

export function initOrderDetail() {
  loadOrderState();
  renderOrder();
  bindEvents();
}

function loadOrderState() {
  const saved = localStorage.getItem(`ameza_order_detail_${order.rawId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      order = { ...order, ...parsed };
    } catch (e) {}
  }
}

function saveOrderState() {
  localStorage.setItem(`ameza_order_detail_${order.rawId}`, JSON.stringify(order));
}

function calculateMoney() {
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = order.shipping;
  // Commission: 10% of ITEM SUBTOTAL ONLY (excluding shipping)
  const commission = Math.round(subtotal * COMMISSION_RATE);
  const youEarn = subtotal - commission + shipping;
  const totalPaid = subtotal + shipping;

  return { subtotal, shipping, commission, youEarn, totalPaid };
}

function renderOrder() {
  const money = calculateMoney();
  const unfulfilledItems = order.items.filter(i => !i.fulfilled);
  const isAllFulfilled = unfulfilledItems.length === 0;

  // Header badges & actions
  document.getElementById('order-title-code').textContent = order.id;
  document.getElementById('order-subtitle-text').textContent = `${order.date} from ${order.source}`;

  const fulBadgeEl = document.getElementById('header-ful-badge');
  if (fulBadgeEl) {
    if (isAllFulfilled) {
      fulBadgeEl.className = 'badge badge-success';
      fulBadgeEl.textContent = 'Fulfilled';
    } else {
      fulBadgeEl.className = 'badge badge-warning';
      fulBadgeEl.textContent = 'Unfulfilled';
    }
  }

  // Card 1: Fulfillment items
  const fulCardTitle = document.getElementById('fulfillment-card-title');
  if (fulCardTitle) {
    fulCardTitle.textContent = isAllFulfilled ? 'Fulfilled (2)' : `Unfulfilled (${unfulfilledItems.length})`;
  }

  const itemsListEl = document.getElementById('order-items-list');
  if (itemsListEl) {
    itemsListEl.innerHTML = order.items.map(item => `
      <div class="order-item-row">
        <div class="order-item-left">
          <div class="order-item-thumb">
            ${Icons[item.thumb] || Icons.thumbHeadphones}
          </div>
          <div>
            <div style="font-weight: 600; color: var(--text-main); font-size: 13.5px;">${escapeHTML(item.name)}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${escapeHTML(item.variant)}</div>
            <div style="font-size: 11.5px; color: var(--text-tertiary); font-family: monospace;">SKU: ${escapeHTML(item.sku)}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap: 16px;">
          <span style="font-size: 13px; color: var(--text-secondary);">x ${item.qty}</span>
          <span class="badge ${item.fulfilled ? 'badge-success' : 'badge-warning'}" style="font-size: 11px;">
            ${item.fulfilled ? 'Fulfilled' : 'Unfulfilled'}
          </span>
        </div>
      </div>
    `).join('');
  }

  const btnFulfill = document.getElementById('btn-fulfill-items');
  if (btnFulfill) {
    btnFulfill.style.display = isAllFulfilled ? 'none' : 'inline-flex';
  }

  // Card 2: Payment summary & Payment method
  const subtotalText = document.getElementById('summary-subtotal-val');
  if (subtotalText) subtotalText.textContent = formatMoney(money.subtotal);

  const shippingText = document.getElementById('summary-shipping-val');
  if (shippingText) shippingText.textContent = formatMoney(money.shipping);

  const commissionText = document.getElementById('summary-commission-val');
  if (commissionText) commissionText.textContent = `-${formatMoney(money.commission)}`;

  const earnText = document.getElementById('summary-earn-val');
  if (earnText) earnText.textContent = formatMoney(money.youEarn);

  // Timeline list
  renderTimeline();

  // Customer & Addresses
  const addr = order.customer.shippingAddress;
  const addressFormatted = `${addr.name}\n${addr.line1}\n${addr.line2}\n${addr.city}, ${addr.state} ${addr.postalCode}\n${addr.country}`;
  const addrEl = document.getElementById('shipping-address-text');
  if (addrEl) addrEl.textContent = addressFormatted;

  const mapLink = document.getElementById('link-view-map');
  if (mapLink) {
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr.line1 + ', ' + addr.city + ', ' + addr.state + ' ' + addr.postalCode)}`;
  }
}

function renderTimeline() {
  const container = document.getElementById('timeline-items-list');
  if (!container) return;

  container.innerHTML = order.timeline.map(t => `
    <div class="timeline-item">
      <div class="timeline-node ${t.nodeType}">
        ${t.icon}
      </div>
      <div>
        <div class="timeline-main-text">${escapeHTML(t.title)}</div>
        <div class="timeline-sub-text">${escapeHTML(t.time)}</div>
      </div>
      <div class="timeline-right-text">${escapeHTML(t.detail)}</div>
    </div>
  `).join('');
}

function bindEvents() {
  // Fulfill Modal Trigger
  document.getElementById('btn-fulfill-items')?.addEventListener('click', openFulfillModal);
  document.getElementById('btn-header-mark-packed')?.addEventListener('click', openFulfillModal);

  // Print Slip
  document.getElementById('btn-print-slip')?.addEventListener('click', () => window.print());

  // More actions dropdown
  const moreBtn = document.getElementById('btn-more-actions');
  const morePopover = document.getElementById('popover-order-more');
  moreBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    morePopover?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#btn-more-actions') && !e.target.closest('#popover-order-more')) {
      morePopover?.classList.remove('open');
    }
  });

  document.getElementById('action-print-invoice')?.addEventListener('click', () => {
    window.print();
    morePopover?.classList.remove('open');
  });

  document.getElementById('action-add-tracking')?.addEventListener('click', () => {
    morePopover?.classList.remove('open');
    openFulfillModal();
  });

  document.getElementById('action-cancel-order')?.addEventListener('click', () => {
    morePopover?.classList.remove('open');
    if (confirm('Cancel this entire order and refund customer?')) {
      order.paymentStatus = 'Refunded';
      order.timeline.unshift({
        id: Date.now(),
        title: 'Order cancelled & refunded',
        time: 'Just now',
        detail: 'Refund processed to Credit Card',
        nodeType: 'node-amber',
        icon: Icons.close
      });
      saveOrderState();
      renderOrder();
      showToast('Order cancelled and refunded');
    }
  });

  document.getElementById('action-message-buyer')?.addEventListener('click', () => {
    morePopover?.classList.remove('open');
    showToast(`Drafted message to ${order.customer.email}`);
  });

  // Timeline comment
  const commentInput = document.getElementById('timeline-comment-input');
  const btnPostComment = document.getElementById('btn-post-comment');

  const postComment = () => {
    const text = commentInput.value.trim();
    if (!text) return;

    order.timeline.unshift({
      id: Date.now(),
      title: 'Staff note added',
      time: 'Just now',
      detail: text,
      nodeType: 'node-gray',
      icon: Icons.info
    });

    commentInput.value = '';
    saveOrderState();
    renderTimeline();
    showToast('Internal comment added to timeline');
  };

  btnPostComment?.addEventListener('click', postComment);
  commentInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') postComment();
  });

  // Copy buttons
  document.getElementById('btn-copy-email')?.addEventListener('click', () => {
    navigator.clipboard.writeText(order.customer.email).catch(() => {});
    showToast('Customer email copied to clipboard');
  });

  document.getElementById('btn-copy-address')?.addEventListener('click', () => {
    const addr = order.customer.shippingAddress;
    const text = `${addr.line1}, ${addr.city}, ${addr.state} ${addr.postalCode}`;
    navigator.clipboard.writeText(text).catch(() => {});
    showToast('Shipping address copied to clipboard');
  });

  document.getElementById('link-view-customer')?.addEventListener('click', () => {
    showToast(`Viewing customer profile: ${order.customer.name}`);
  });
}

function openFulfillModal() {
  const modal = document.getElementById('fulfill-modal-overlay');
  if (modal) modal.classList.add('open');

  document.getElementById('btn-close-fulfill')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('btn-cancel-fulfill')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('btn-confirm-fulfill')?.addEventListener('click', () => {
    const tracking = document.getElementById('fulfill-tracking-input')?.value || 'AP-982471923AU';

    order.items.forEach(i => i.fulfilled = true);
    order.fulfillmentStatus = 'Fulfilled';

    order.timeline.unshift({
      id: Date.now(),
      title: 'Items fulfilled',
      time: 'Just now',
      detail: `Tracking: ${tracking} (USPS)`,
      nodeType: 'node-green',
      icon: Icons.check
    });

    saveOrderState();
    modal.classList.remove('open');
    renderOrder();
    showToast('Items marked as fulfilled! Customer notified.');
  });
}
