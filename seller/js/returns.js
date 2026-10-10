/**
 * AMEZA Seller Central — Returns Hub Engine (js/returns.js)
 * Comprehensive Two-Pane Merchant Return & Dispute Center
 * USA compliance: USD cents formatting, American English, Eastern Time formats.
 */

import { escapeHTML, showToast } from '/seller/js/dashboard-shell.js';
import { formatMoney } from '/shared/js/core/utils.js';

const STORAGE_KEY = 'ameza_seller_returns_data';

// Standard 6 Returns Statuses
export const RETURN_STATUSES = [
  { id: 'requested', label: 'Requested', badgeClass: 'badge-warning' },
  { id: 'approved', label: 'Approved', badgeClass: 'badge-info' },
  { id: 'in_transit', label: 'In transit', badgeClass: 'badge-primary' },
  { id: 'refunded', label: 'Refunded', badgeClass: 'badge-success' },
  { id: 'rejected', label: 'Rejected', badgeClass: 'badge-danger' },
  { id: 'disputed', label: 'Disputed', badgeClass: 'badge-purple' }
];

const INITIAL_RETURNS = [
  {
    id: 'R-2031',
    orderId: 'ORD-10045',
    subOrderId: 'ORD-10045-S1',
    customerName: 'Sophia Anderson',
    customerEmail: 'sophia.anderson@example.com',
    createdAt: Date.now() - (14 * 3600 * 1000), // 14 hours ago
    respondDeadline: Date.now() + (34 * 3600 * 1000), // within 2 days
    status: 'requested',
    reason: 'Size too small on shoulders and torso',
    detailedReason: 'I usually wear a Medium in US sizing, but this jacket fits like an Extra Small around the armholes and shoulders. Tags are still attached and in original packaging.',
    product: {
      id: 'prod_549',
      name: 'Unisex Winter Fleece Hoodie',
      variant: 'Olive Green / Large',
      priceCents: 5999,
      quantity: 1,
      image: '../assets/wp_products/wp_52_0.webp'
    },
    photos: [
      '../assets/wp_products/wp_52_0.webp',
      '../assets/wp_products/wp_239_0.webp'
    ],
    timeline: [
      { time: Date.now() - (14 * 3600 * 1000), actor: 'Customer', text: 'Return requested: Size too small on shoulders' }
    ],
    messages: [
      { sender: 'customer', name: 'Sophia Anderson', time: Date.now() - (14 * 3600 * 1000), text: 'Hello, I loved the material but the shoulders are too tight. Would like to return this for a refund so I can order an XL.' }
    ],
    commissionRate: 0.10,
    trackingNumber: null,
    refundType: 'full',
    refundAmountCents: 5999
  },
  {
    id: 'R-2028',
    orderId: 'ORD-10038',
    subOrderId: 'ORD-10038-S1',
    customerName: 'Liam Davis',
    customerEmail: 'liam.davis@example.com',
    createdAt: Date.now() - (36 * 3600 * 1000),
    respondDeadline: Date.now() + (12 * 3600 * 1000),
    status: 'approved',
    reason: 'Defective strap hardware rivet',
    detailedReason: 'The brass clasp on the front pocket came loose on day two of use. Defective seam rivets.',
    product: {
      id: 'prod_100',
      name: 'Classic Saddle Leather Belt',
      variant: 'Cognac / 34"',
      priceCents: 6499,
      quantity: 1,
      image: '../assets/products/ul-belt.jpg'
    },
    photos: [
      '../assets/products/ul-belt.jpg'
    ],
    timeline: [
      { time: Date.now() - (36 * 3600 * 1000), actor: 'Customer', text: 'Return requested for defective hardware' },
      { time: Date.now() - (28 * 3600 * 1000), actor: 'Merchant', text: 'Return approved: Customer provided prepaid USPS label' }
    ],
    messages: [
      { sender: 'customer', name: 'Liam Davis', time: Date.now() - (36 * 3600 * 1000), text: 'The brass rivet on the buckle prong feels loose. Photos attached.' },
      { sender: 'seller', name: 'Ameza Official', time: Date.now() - (28 * 3600 * 1000), text: 'We sincerely apologize Liam. We have approved your return and emailed you a prepaid USPS priority return label.' }
    ],
    commissionRate: 0.10,
    trackingNumber: '9400111899223190882191',
    refundType: 'pending_receipt',
    refundAmountCents: 6499
  },
  {
    id: 'R-2025',
    orderId: 'ORD-10034',
    subOrderId: 'ORD-10034-S1',
    customerName: 'Emma Watson',
    customerEmail: 'emma.watson@example.com',
    createdAt: Date.now() - (3 * 86400 * 1000),
    respondDeadline: null,
    status: 'in_transit',
    reason: 'Color differs from product photos',
    detailedReason: 'Expected a light camel beige, but the bag received is dark mocha brown. Returning in original box.',
    product: {
      id: 'prod_101',
      name: 'Full-Grain Slim Leather Wallet',
      variant: 'Tan / Standard',
      priceCents: 4999,
      quantity: 1,
      image: '../assets/products/ul-wallet.jpg'
    },
    photos: [
      '../assets/products/ul-wallet.jpg'
    ],
    timeline: [
      { time: Date.now() - (3 * 86400 * 1000), actor: 'Customer', text: 'Return requested' },
      { time: Date.now() - (2 * 86400 * 1000), actor: 'Merchant', text: 'Approved return. Prepaid label provided.' },
      { time: Date.now() - (18 * 3600 * 1000), actor: 'Carrier (USPS)', text: 'Package scanned at Austin Regional Postal Facility. In transit.' }
    ],
    messages: [
      { sender: 'customer', name: 'Emma Watson', time: Date.now() - (3 * 86400 * 1000), text: 'I dropped off the return box at the post office yesterday.' }
    ],
    commissionRate: 0.10,
    trackingNumber: '9400111899223190882345',
    refundType: 'pending_receipt',
    refundAmountCents: 4999
  },
  {
    id: 'R-2019',
    orderId: 'ORD-10022',
    subOrderId: 'ORD-10022-S1',
    customerName: 'Chloe Martin',
    customerEmail: 'chloe.martin@example.com',
    createdAt: Date.now() - (6 * 86400 * 1000),
    respondDeadline: null,
    status: 'refunded',
    reason: 'Package arrived significantly past event date',
    detailedReason: 'Ordered for an anniversary event that passed. Package was refused and returned unopened.',
    product: {
      id: 'prod_114',
      name: 'Artisan Chronograph Watch',
      variant: 'Stainless Steel / 42mm',
      priceCents: 12999,
      quantity: 1,
      image: '../assets/products/silver-elegance-watch.png'
    },
    photos: [
      '../assets/products/silver-elegance-watch.png'
    ],
    timeline: [
      { time: Date.now() - (6 * 86400 * 1000), actor: 'Customer', text: 'Return requested' },
      { time: Date.now() - (4 * 86400 * 1000), actor: 'Merchant', text: 'Return approved' },
      { time: Date.now() - (1 * 86400 * 1000), actor: 'Merchant', text: 'Item received & inspected. $129.99 full refund credited to customer.' }
    ],
    messages: [
      { sender: 'seller', name: 'Ameza Official', time: Date.now() - (1 * 86400 * 1000), text: 'Your return has been inspected and full refund of $129.99 has been issued to your original payment method.' }
    ],
    commissionRate: 0.10,
    trackingNumber: '9400111899223190881987',
    refundType: 'full',
    refundAmountCents: 12999
  },
  {
    id: 'R-2015',
    orderId: 'ORD-10019',
    subOrderId: 'ORD-10019-S1',
    customerName: 'Mason Miller',
    customerEmail: 'mason.miller@example.com',
    createdAt: Date.now() - (10 * 86400 * 1000),
    respondDeadline: null,
    status: 'rejected',
    reason: 'Used item past 30-day return window',
    detailedReason: 'Customer requested return 48 days after verified delivery date. Item shows noticeable fabric wear and strong perfume odor.',
    product: {
      id: 'prod_200',
      name: 'Organic Cotton Polo Shirt',
      variant: 'Navy / Medium',
      priceCents: 3999,
      quantity: 1,
      image: '../assets/wp_products/wp_240_0.webp'
    },
    photos: [
      '../assets/wp_products/wp_240_0.webp'
    ],
    timeline: [
      { time: Date.now() - (10 * 86400 * 1000), actor: 'Customer', text: 'Return requested' },
      { time: Date.now() - (9 * 86400 * 1000), actor: 'Merchant', text: 'Return rejected: Exceeds 30-day standard return policy.' }
    ],
    messages: [
      { sender: 'seller', name: 'Ameza Official', time: Date.now() - (9 * 86400 * 1000), text: 'Unfortunately, this order was delivered over 45 days ago, which exceeds our standard 30-day marketplace return policy.' }
    ],
    commissionRate: 0.10,
    trackingNumber: null,
    refundType: null,
    refundAmountCents: 0
  },
  {
    id: 'R-2012',
    orderId: 'ORD-10012',
    subOrderId: 'ORD-10012-S1',
    customerName: 'Noah Clark',
    customerEmail: 'noah.clark@example.com',
    createdAt: Date.now() - (12 * 86400 * 1000),
    respondDeadline: null,
    status: 'disputed',
    reason: 'Customer reported empty delivery box',
    detailedReason: 'Buyer claims parcel was empty on arrival. USPS transit weigh-in logs confirm parcel weight was 2.4 lbs at dispatch and final delivery scan.',
    product: {
      id: 'prod_205',
      name: 'Studio Bluetooth ANC Headphones',
      variant: 'Midnight Black',
      priceCents: 8999,
      quantity: 1,
      image: '../assets/products/tws-wireless-earbuds.png'
    },
    photos: [
      '../assets/products/tws-wireless-earbuds.png'
    ],
    timeline: [
      { time: Date.now() - (12 * 86400 * 1000), actor: 'Customer', text: 'Return requested for missing contents' },
      { time: Date.now() - (11 * 86400 * 1000), actor: 'Merchant', text: 'Escalated to AMEZA Trust & Safety with carrier postal weight verification receipts.' }
    ],
    messages: [
      { sender: 'seller', name: 'Ameza Official', time: Date.now() - (11 * 86400 * 1000), text: 'This claim has been escalated to AMEZA Marketplace Trust & Safety with carrier dispatch logs for investigation.' }
    ],
    commissionRate: 0.10,
    trackingNumber: '9400111899223190881112',
    refundType: null,
    refundAmountCents: 8999
  }
];

function getStoredReturns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RETURNS));
  return [...INITIAL_RETURNS];
}

function saveReturns(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Format relative time (e.g. "14 hours ago", "2 days ago")
function formatTimeAgo(timestamp) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format standard US ET Date/Time (e.g. "10/08/2026, 04:30 PM EDT")
function formatUSDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' ET';
}

export function initReturns() {
  const container = document.getElementById('returns-content-container');
  if (!container) return;

  let allReturns = getStoredReturns();
  let currentTab = 'requested';
  let activeReturnId = allReturns.find(r => r.status === 'requested')?.id || allReturns[0]?.id || null;
  let activeLightboxImg = null;

  function renderView() {
    // Compute counts per tab dynamically from one single dataset
    const counts = {
      requested: allReturns.filter(r => r.status === 'requested').length,
      approved: allReturns.filter(r => r.status === 'approved').length,
      in_transit: allReturns.filter(r => r.status === 'in_transit').length,
      refunded: allReturns.filter(r => r.status === 'refunded').length,
      rejected: allReturns.filter(r => r.status === 'rejected').length,
      disputed: allReturns.filter(r => r.status === 'disputed').length
    };

    const filtered = allReturns.filter(r => r.status === currentTab);
    const activeReturn = allReturns.find(r => r.id === activeReturnId) || filtered[0] || null;

    container.innerHTML = `
      <div class="returns-page-wrapper">
        <!-- Top Page Header -->
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
          <div>
            <h1 class="page-title" style="margin:0; font-size:24px; font-weight:800; color:var(--text-main);">Returns</h1>
            <p class="page-subtitle" style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">Manage buyer return authorizations, inspection clearances, and ledger refund adjustments.</p>
          </div>
          <div class="page-header-actions" style="display:flex; gap:10px;">
            <button type="button" class="btn-header-secondary" id="btn-export-returns" data-action="export-returns">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Export
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards with Hand-Written SVG Sparklines -->
        <div class="returns-kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:16px; margin-bottom:20px;">
          <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
            <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Pending Action</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
              <span style="font-size:26px; font-weight:800; color:var(--text-main);">${counts.requested}</span>
              <span style="font-size:12px; font-weight:700; color:#D97706; background:rgba(217, 119, 6, 0.12); padding:2px 8px; border-radius:12px;">Needs reply</span>
            </div>
          </div>
          <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
            <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">In Transit to Store</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
              <span style="font-size:26px; font-weight:800; color:var(--text-main);">${counts.in_transit + counts.approved}</span>
              <span style="font-size:12px; font-weight:700; color:#2563EB; background:rgba(37, 99, 235, 0.12); padding:2px 8px; border-radius:12px;">Carrier active</span>
            </div>
          </div>
          <div class="dashboard-card" style="padding:16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px;">
            <div style="font-size:12px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Total Resolved</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
              <span style="font-size:26px; font-weight:800; color:var(--text-main);">${counts.refunded + counts.rejected}</span>
              <span style="font-size:12px; font-weight:700; color:#059669; background:rgba(5, 150, 105, 0.12); padding:2px 8px; border-radius:12px;">Completed</span>
            </div>
          </div>
        </div>

        <!-- Returns Status Tabs with Dynamic Counters -->
        <div class="returns-tabs-bar" style="display:flex; gap:8px; border-bottom:1px solid var(--border); margin-bottom:20px; overflow-x:auto; padding-bottom:4px;">
          ${RETURN_STATUSES.map(tab => {
            const isActive = tab.id === currentTab;
            const cnt = counts[tab.id] || 0;
            return `
              <button type="button" class="tab-btn ${isActive ? 'active' : ''}" data-action="switch-tab" data-tab-id="${tab.id}"
                style="padding:10px 16px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; border-bottom:2px solid ${isActive ? 'var(--text-main)' : 'transparent'}; color:${isActive ? 'var(--text-main)' : 'var(--text-muted)'}; display:flex; align-items:center; gap:8px; white-space:nowrap; min-height:44px;">
                <span>${tab.label}</span>
                <span class="tab-badge" style="background:${isActive ? 'var(--text-main)' : 'var(--bg-hover, #F3F4F6)'}; color:${isActive ? 'var(--text-inverse, #fff)' : 'var(--text-muted)'}; padding:2px 7px; border-radius:10px; font-size:11px;">${cnt}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Two-Pane Layout Container -->
        <div class="returns-two-pane-layout" id="returns-two-pane-container">
          <!-- Left Pane: Request List -->
          <div class="returns-list-pane" id="returns-list-pane">
            <div class="returns-list-scroll">
              ${filtered.length === 0 ? `
                <div class="returns-empty-state" style="text-align:center; padding:48px 20px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px;">
                  <div style="font-size:32px; margin-bottom:12px;">📦</div>
                  <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0 0 6px;">No ${RETURN_STATUSES.find(t => t.id === currentTab)?.label} returns</h3>
                  <p style="font-size:13px; color:var(--text-muted); margin:0;">There are currently zero return requests under this status bucket.</p>
                </div>
              ` : filtered.map(item => {
                const isSelected = activeReturn && activeReturn.id === item.id;
                const statusMeta = RETURN_STATUSES.find(s => s.id === item.status) || RETURN_STATUSES[0];
                return `
                  <div class="return-item-card ${isSelected ? 'selected' : ''}" data-action="select-return" data-return-id="${item.id}"
                    style="background:var(--bg-surface); border:1px solid ${isSelected ? 'var(--primary, #7FB73C)' : 'var(--border)'}; border-radius:10px; padding:14px; margin-bottom:10px; cursor:pointer; transition:all 0.15s ease; position:relative; box-shadow:${isSelected ? '0 0 0 2px rgba(127,183,60,0.2)' : 'none'};">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                      <div>
                        <span style="font-size:13px; font-weight:800; color:var(--text-main);">Return #${escapeHTML(item.id)}</span>
                        <span style="font-size:12px; color:var(--text-muted); margin-left:6px;">for Order #${escapeHTML(item.orderId)}</span>
                      </div>
                      <span class="badge ${statusMeta.badgeClass}" style="font-size:11px; padding:3px 8px; border-radius:6px; font-weight:700;">${statusMeta.label}</span>
                    </div>

                    <div style="display:flex; gap:12px; align-items:center; margin:10px 0;">
                      <img src="${escapeHTML(item.product.image)}" alt="${escapeHTML(item.product.name)}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid var(--border); flex-shrink:0;">
                      <div style="min-width:0; flex:1;">
                        <div style="font-size:13px; font-weight:700; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.product.name)}</div>
                        <div style="font-size:12px; color:var(--text-muted);">${escapeHTML(item.customerName)} &bull; ${formatMoney(item.product.priceCents)}</div>
                      </div>
                    </div>

                    <div style="font-size:12px; color:var(--text-secondary, #4B5563); margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                      <strong>Reason:</strong> ${escapeHTML(item.reason)}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                      <span style="font-size:11.5px; color:var(--text-muted);">${formatTimeAgo(item.createdAt)}</span>
                      ${item.status === 'requested' ? `
                        <span class="amber-chip" style="font-size:11px; font-weight:700; color:#B45309; background:#FEF3C7; padding:2px 8px; border-radius:4px; display:inline-flex; align-items:center; gap:4px;">
                          <i class="fa-regular fa-clock" style="font-size:10px;"></i> Respond within 2 days
                        </span>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Pane: Detail View -->
          <div class="returns-detail-pane" id="returns-detail-pane">
            ${activeReturn ? renderDetailPanel(activeReturn) : `
              <div style="text-align:center; padding:60px 20px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px;">
                <p style="color:var(--text-muted); font-size:14px;">Select a return request from the left list to review details and take action.</p>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Lightbox Modal Container -->
      <div id="returns-lightbox-modal" class="returns-lightbox-overlay" style="display:none;">
        <button type="button" class="btn-close-lightbox" data-action="close-lightbox" aria-label="Close photo preview">&times;</button>
        <img id="returns-lightbox-img" src="" alt="Enlarged buyer proof" style="max-width:90%; max-height:85vh; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
      </div>

      <!-- Action Confirmation Modals -->
      <div id="returns-action-modal-backdrop" class="returns-modal-backdrop" style="display:none;"></div>
    `;

    bindEvents();
  }

  function renderDetailPanel(item) {
    const commRate = item.commissionRate || 0.10;
    const maxRefundCents = item.product.priceCents;
    const currentInputCents = item.refundAmountCents || maxRefundCents;
    const commReversalCents = Math.round(currentInputCents * commRate);
    const netDebitCents = currentInputCents - commReversalCents;

    return `
      <div class="return-detail-card" style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden;">
        <!-- Mobile Back Button (Under 900px) -->
        <div class="detail-mobile-back-bar" style="display:none; padding:12px 16px; border-bottom:1px solid var(--border); background:var(--bg-surface-alt, #F9FAFB);">
          <button type="button" class="btn-back-to-list" data-action="back-to-list" style="border:none; background:none; font-size:14px; font-weight:700; color:var(--text-main); display:inline-flex; align-items:center; gap:8px; cursor:pointer; min-height:44px;">
            <i class="fa-solid fa-arrow-left"></i> &larr; Back to Returns List
          </button>
        </div>

        <!-- Detail Header -->
        <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              <h2 style="font-size:18px; font-weight:800; color:var(--text-main); margin:0;">Return #${escapeHTML(item.id)}</h2>
              <span class="badge ${RETURN_STATUSES.find(s => s.id === item.status)?.badgeClass || 'badge-warning'}" style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">
                ${RETURN_STATUSES.find(s => s.id === item.status)?.label}
              </span>
            </div>
            <div style="font-size:13px; color:var(--text-muted);">
              Order <strong>#${escapeHTML(item.orderId)}</strong> &bull; Requested on ${formatUSDateTime(item.createdAt)}
            </div>
          </div>
          ${item.trackingNumber ? `
            <div style="text-align:right;">
              <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); font-weight:700; display:block;">USPS Tracking</span>
              <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(item.trackingNumber)}" target="_blank" rel="noopener" style="font-size:13px; font-weight:700; color:var(--primary, #7FB73C); text-decoration:none;">
                ${escapeHTML(item.trackingNumber)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:11px;"></i>
              </a>
            </div>
          ` : ''}
        </div>

        <div style="padding:20px; display:flex; flex-direction:column; gap:24px;">
          <!-- Section 1: Item Details -->
          <div class="detail-section">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin:0 0 12px;">Items</h3>
            <div style="display:flex; gap:14px; align-items:center; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-surface-alt, #FAFAFA);">
              <img src="${escapeHTML(item.product.image)}" alt="${escapeHTML(item.product.name)}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; border:1px solid var(--border);">
              <div style="flex:1;">
                <div style="font-size:14px; font-weight:700; color:var(--text-main);">${escapeHTML(item.product.name)}</div>
                <div style="font-size:12px; color:var(--text-muted);">Variant: ${escapeHTML(item.product.variant)} &bull; Qty: ${item.product.quantity}</div>
                <div style="font-size:13px; font-weight:800; color:var(--text-main); margin-top:2px;">${formatMoney(item.product.priceCents)}</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Reason & Buyer Photos (Lightbox) -->
          <div class="detail-section">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin:0 0 8px;">Reason for Return</h3>
            <div style="padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-surface-alt, #FAFAFA); margin-bottom:12px;">
              <div style="font-size:13px; font-weight:700; color:var(--text-main); margin-bottom:4px;">${escapeHTML(item.reason)}</div>
              <p style="font-size:13px; color:var(--text-secondary, #374151); margin:0; line-height:1.5;">${escapeHTML(item.detailedReason)}</p>
            </div>

            <!-- Photos -->
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:8px;">Buyer Uploaded Photos (${item.photos.length}):</div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                ${item.photos.map((photo, pIdx) => `
                  <div class="buyer-photo-thumb" data-action="open-lightbox" data-img-src="${escapeHTML(photo)}"
                    style="width:80px; height:80px; border-radius:8px; overflow:hidden; border:1px solid var(--border); cursor:pointer; position:relative; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <img src="${escapeHTML(photo)}" alt="Return proof ${pIdx + 1}" style="width:100%; height:100%; object-fit:cover;">
                    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.25); opacity:0; transition:opacity 0.15s ease; display:flex; align-items:center; justify-content:center; color:#fff;" class="photo-overlay">
                      <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Section 3: Refund Configuration & Impact on Earnings -->
          <div class="detail-section" style="padding:16px; border:1px solid var(--border); border-radius:10px; background:var(--bg-surface);">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin:0 0 12px;">Refund Calculation</h3>
            
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
              <div style="flex:1; min-width:200px;">
                <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px; color:var(--text-main);">
                  Refund Amount (USD) <span style="font-weight:400; color:var(--text-muted);">(Max ${formatMoney(maxRefundCents)})</span>
                </label>
                <div style="position:relative;">
                  <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:var(--text-muted);">$</span>
                  <input type="number" id="input-refund-amount" step="0.01" min="1.00" max="${(maxRefundCents / 100).toFixed(2)}" value="${(currentInputCents / 100).toFixed(2)}"
                    style="width:100%; padding:10px 12px 10px 28px; border:1px solid var(--border); border-radius:8px; font-size:16px; font-weight:700; color:var(--text-main); background:var(--bg-surface);"
                    ${item.status === 'refunded' ? 'disabled' : ''}>
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:flex-end;">
                <button type="button" class="btn-subtle" id="btn-full-refund-preset" data-action="set-full-refund" data-max-cents="${maxRefundCents}" style="padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-hover, #F3F4F6); font-size:13px; font-weight:700; cursor:pointer; min-height:44px;" ${item.status === 'refunded' ? 'disabled' : ''}>
                  Full (${formatMoney(maxRefundCents)})
                </button>
              </div>
            </div>

            <!-- Impact on Earnings Note -->
            <div class="earnings-impact-box" id="earnings-impact-box" style="padding:12px 14px; background:#F8FAFC; border-left:4px solid var(--primary, #7FB73C); border-radius:4px; font-size:12.5px; line-height:1.6; color:#1E293B;">
              <strong style="color:var(--text-main);">Impact on earnings:</strong><br>
              Refund to Customer: <span style="font-weight:700; color:#DC2626;">-${formatMoney(currentInputCents)}</span> &bull;
              Commission Reversed (10%): <span style="font-weight:700; color:#059669;">+${formatMoney(commReversalCents)}</span> &bull;
              <strong>Net Debit from Balance: <span style="color:#B91C1C;">-${formatMoney(netDebitCents)}</span></strong>
            </div>
          </div>

          <!-- Section 4: Customer Conversation Thread & Composer -->
          <div class="detail-section">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin:0 0 12px;">Customer Conversation</h3>
            
            <div class="conversation-thread" style="display:flex; flex-direction:column; gap:12px; margin-bottom:14px; max-height:260px; overflow-y:auto; padding-right:4px;">
              ${item.messages.map(msg => {
                const isSeller = msg.sender === 'seller';
                return `
                  <div style="display:flex; flex-direction:column; align-items:${isSeller ? 'flex-end' : 'flex-start'};">
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">
                      <strong>${escapeHTML(msg.name)}</strong> &bull; ${formatTimeAgo(msg.time)}
                    </div>
                    <div style="max-width:85%; padding:10px 14px; border-radius:${isSeller ? '14px 14px 2px 14px' : '14px 14px 14px 2px'}; background:${isSeller ? 'var(--dark, #111827)' : 'var(--bg-hover, #F3F4F6)'}; color:${isSeller ? '#FFFFFF' : 'var(--text-main)'}; font-size:13px; line-height:1.5;">
                      ${escapeHTML(msg.text)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Composer -->
            <div class="message-composer" style="display:flex; gap:8px;">
              <input type="text" id="returns-msg-input" placeholder="Type a message to ${escapeHTML(item.customerName)}..."
                style="flex:1; padding:10px 14px; border:1px solid var(--border); border-radius:8px; font-size:16px; color:var(--text-main); background:var(--bg-surface);"
                data-return-id="${item.id}">
              <button type="button" class="btn-send-reply" data-action="send-message" data-return-id="${item.id}"
                style="padding:0 18px; border:none; border-radius:8px; background:var(--dark, #111827); color:#fff; font-weight:700; font-size:13px; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:6px;">
                <span>Send</span>
                <i class="fa-solid fa-paper-plane" style="font-size:11px;"></i>
              </button>
            </div>
          </div>

          <!-- Section 5: Timeline of Status Events -->
          <div class="detail-section">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin:0 0 12px;">Activity Timeline</h3>
            <div style="display:flex; flex-direction:column; gap:8px; border-left:2px solid var(--border); padding-left:14px; margin-left:6px;">
              ${item.timeline.map(t => `
                <div style="position:relative; font-size:12.5px; color:var(--text-body);">
                  <div style="position:absolute; left:-19px; top:4px; width:8px; height:8px; border-radius:50%; background:var(--primary, #7FB73C);"></div>
                  <span style="font-weight:700; color:var(--text-main);">${escapeHTML(t.actor)}:</span> ${escapeHTML(t.text)}
                  <span style="font-size:11px; color:var(--text-muted); margin-left:6px;">${formatTimeAgo(t.time)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Sticky Merchant Action Bar -->
        <div class="returns-sticky-action-bar" style="padding:14px 20px; border-top:1px solid var(--border); background:var(--bg-surface); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; position:sticky; bottom:0; z-index:10; box-shadow:0 -4px 12px rgba(0,0,0,0.05);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${item.status === 'requested' ? `
              <button type="button" class="btn-action-reject" data-action="open-reject-modal" data-return-id="${item.id}"
                style="padding:10px 16px; border:1px solid #DC2626; color:#DC2626; background:transparent; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">
                Reject Return
              </button>
              <button type="button" class="btn-action-partial" data-action="open-partial-modal" data-return-id="${item.id}"
                style="padding:10px 16px; border:1px solid var(--border); color:var(--text-main); background:var(--bg-hover, #F3F4F6); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">
                Offer Partial Refund
              </button>
            ` : ''}

            <button type="button" class="btn-action-escalate" data-action="open-escalate-modal" data-return-id="${item.id}"
              style="padding:10px 16px; border:1px solid var(--border); color:#6D28D9; background:rgba(109,40,217,0.06); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;"
              ${item.status === 'disputed' ? 'disabled' : ''}>
              ${item.status === 'disputed' ? 'Dispute Under Review' : 'Escalate to AMEZA'}
            </button>
          </div>

          <div>
            ${item.status === 'requested' || item.status === 'in_transit' ? `
              <button type="button" class="btn-action-approve" data-action="open-approve-modal" data-return-id="${item.id}"
                style="padding:10px 22px; border:none; background:var(--dark, #111827); color:#FFFFFF; border-radius:8px; font-size:13.5px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-check"></i>
                <span>Approve Return</span>
              </button>
            ` : item.status === 'approved' ? `
              <button type="button" class="btn-action-refund-now" data-action="execute-refund-now" data-return-id="${item.id}"
                style="padding:10px 22px; border:none; background:#059669; color:#FFFFFF; border-radius:8px; font-size:13.5px; font-weight:700; cursor:pointer; min-height:44px;">
                Issue Refund Now (${formatMoney(currentInputCents)})
              </button>
            ` : `
              <span style="font-size:13px; font-weight:700; color:var(--text-muted);">
                ${item.status === 'refunded' ? 'Refund Completed' : 'Case Closed'}
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // 1. Tab switches
    container.querySelectorAll('[data-action="switch-tab"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab-id');
        currentTab = tabId;
        const firstMatch = allReturns.find(r => r.status === tabId);
        activeReturnId = firstMatch ? firstMatch.id : null;
        renderView();
      });
    });

    // 2. Select Return Item
    container.querySelectorAll('[data-action="select-return"]').forEach(card => {
      card.addEventListener('click', () => {
        activeReturnId = card.getAttribute('data-return-id');
        renderView();

        // Responsive Mobile Under 900px scroll / view toggle
        if (window.innerWidth < 900) {
          const listPane = document.getElementById('returns-list-pane');
          const detailPane = document.getElementById('returns-detail-pane');
          if (listPane && detailPane) {
            listPane.style.display = 'none';
            detailPane.style.display = 'block';
            const backBar = detailPane.querySelector('.detail-mobile-back-bar');
            if (backBar) backBar.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
    });

    // 3. Mobile Back to List (Under 900px)
    const backBtn = container.querySelector('[data-action="back-to-list"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const listPane = document.getElementById('returns-list-pane');
        const detailPane = document.getElementById('returns-detail-pane');
        if (listPane && detailPane) {
          listPane.style.display = 'block';
          detailPane.style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // 4. Refund amount input dynamically updates Impact on Earnings
    const refundInput = document.getElementById('input-refund-amount');
    if (refundInput) {
      refundInput.addEventListener('input', () => {
        const ret = allReturns.find(r => r.id === activeReturnId);
        if (!ret) return;
        const val = parseFloat(refundInput.value) || 0;
        const cents = Math.round(val * 100);
        ret.refundAmountCents = cents;

        const impactBox = document.getElementById('earnings-impact-box');
        if (impactBox) {
          const commRate = ret.commissionRate || 0.10;
          const commReversal = Math.round(cents * commRate);
          const netDebit = cents - commReversal;
          impactBox.innerHTML = `
            <strong style="color:var(--text-main);">Impact on earnings:</strong><br>
            Refund to Customer: <span style="font-weight:700; color:#DC2626;">-${formatMoney(cents)}</span> &bull;
            Commission Reversed (10%): <span style="font-weight:700; color:#059669;">+${formatMoney(commReversal)}</span> &bull;
            <strong>Net Debit from Balance: <span style="color:#B91C1C;">-${formatMoney(netDebit)}</span></strong>
          `;
        }
      });
    }

    // 5. Full refund preset button
    const fullPresetBtn = document.getElementById('btn-full-refund-preset');
    if (fullPresetBtn) {
      fullPresetBtn.addEventListener('click', () => {
        const maxCents = parseInt(fullPresetBtn.getAttribute('data-max-cents'), 10);
        if (refundInput) {
          refundInput.value = (maxCents / 100).toFixed(2);
          refundInput.dispatchEvent(new Event('input'));
        }
      });
    }

    // 6. Lightbox triggers
    container.querySelectorAll('[data-action="open-lightbox"]').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.getAttribute('data-img-src');
        const modal = document.getElementById('returns-lightbox-modal');
        const img = document.getElementById('returns-lightbox-img');
        if (modal && img) {
          img.src = src;
          modal.style.display = 'flex';
          activeLightboxImg = src;
        }
      });
    });

    const closeLightboxBtn = container.querySelector('[data-action="close-lightbox"]');
    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener('click', () => {
        const modal = document.getElementById('returns-lightbox-modal');
        if (modal) modal.style.display = 'none';
      });
    }

    // Lightbox backdrop click to dismiss
    const lightboxModal = document.getElementById('returns-lightbox-modal');
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          lightboxModal.style.display = 'none';
        }
      });
    }

    // 7. Message composer
    const sendMsgBtn = container.querySelector('[data-action="send-message"]');
    if (sendMsgBtn) {
      sendMsgBtn.addEventListener('click', () => {
        const input = document.getElementById('returns-msg-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        const ret = allReturns.find(r => r.id === activeReturnId);
        if (ret) {
          ret.messages.push({
            sender: 'seller',
            name: 'Ameza Official',
            time: Date.now(),
            text: text
          });
          saveReturns(allReturns);
          input.value = '';
          showToast('Message sent to customer', 'success');
          renderView();
        }
      });
    }

    // Message input Enter key
    const msgInput = document.getElementById('returns-msg-input');
    if (msgInput) {
      msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (sendMsgBtn) sendMsgBtn.click();
        }
      });
    }

    // 8. Action Modals: Reject, Approve, Escalate
    const rejectBtn = container.querySelector('[data-action="open-reject-modal"]');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        showRejectModal(activeReturnId);
      });
    }

    const partialBtn = container.querySelector('[data-action="open-partial-modal"]');
    if (partialBtn) {
      partialBtn.addEventListener('click', () => {
        showPartialModal(activeReturnId);
      });
    }

    const approveBtn = container.querySelector('[data-action="open-approve-modal"]');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        showApproveModal(activeReturnId);
      });
    }

    const escalateBtn = container.querySelector('[data-action="open-escalate-modal"]');
    if (escalateBtn) {
      escalateBtn.addEventListener('click', () => {
        showEscalateModal(activeReturnId);
      });
    }

    const refundNowBtn = container.querySelector('[data-action="execute-refund-now"]');
    if (refundNowBtn) {
      refundNowBtn.addEventListener('click', () => {
        executeRefund(activeReturnId);
      });
    }

    // Export Returns CSV
    const exportBtn = document.getElementById('btn-export-returns');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportReturnsCSV(allReturns);
      });
    }
  }

  // --- Modal Helpers ---

  function showApproveModal(returnId) {
    const ret = allReturns.find(r => r.id === returnId);
    if (!ret) return;
    const backdrop = document.getElementById('returns-action-modal-backdrop');
    if (!backdrop) return;

    backdrop.innerHTML = `
      <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:480px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
        <h3 style="font-size:17px; font-weight:800; margin:0 0 8px; color:var(--text-main);">Approve Return Request</h3>
        <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">
          Choose whether to release funds immediately or wait for the physical item to be returned and inspected.
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; border:1px solid var(--border); border-radius:8px; cursor:pointer;">
            <input type="radio" name="approve-choice" value="pending_receipt" checked style="margin-top:3px;">
            <div>
              <div style="font-size:13.5px; font-weight:700; color:var(--text-main);">Refund after item is received (Recommended)</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Sends buyer a prepaid USPS return label. Funds remain in escrow until inspection.</div>
            </div>
          </label>
          <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; border:1px solid var(--border); border-radius:8px; cursor:pointer;">
            <input type="radio" name="approve-choice" value="refund_now" style="margin-top:3px;">
            <div>
              <div style="font-size:13.5px; font-weight:700; color:var(--text-main);">Refund now (${formatMoney(ret.refundAmountCents || ret.product.priceCents)})</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Immediately debits seller ledger and refunds buyer without requiring item return.</div>
            </div>
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-cancel-modal" id="btn-cancel-approve" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
          <button type="button" class="btn-confirm-approve" id="btn-confirm-approve" style="padding:10px 20px; border:none; background:var(--dark, #111827); color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Confirm Approval</button>
        </div>
      </div>
    `;
    backdrop.style.display = 'block';

    document.getElementById('btn-cancel-approve')?.addEventListener('click', () => { backdrop.style.display = 'none'; });
    document.getElementById('btn-confirm-approve')?.addEventListener('click', () => {
      const choice = backdrop.querySelector('input[name="approve-choice"]:checked')?.value || 'pending_receipt';
      backdrop.style.display = 'none';

      if (choice === 'refund_now') {
        executeRefund(returnId);
      } else {
        ret.status = 'approved';
        ret.trackingNumber = '940011189922319088' + Math.floor(1000 + Math.random() * 9000);
        ret.timeline.push({ time: Date.now(), actor: 'Merchant', text: 'Approved return. Prepaid USPS tracking label generated.' });
        saveReturns(allReturns);
        showToast('Return approved. Buyer sent prepaid return label.', 'success');
        renderView();
      }
    });
  }

  function showRejectModal(returnId) {
    const ret = allReturns.find(r => r.id === returnId);
    if (!ret) return;
    const backdrop = document.getElementById('returns-action-modal-backdrop');
    if (!backdrop) return;

    backdrop.innerHTML = `
      <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:460px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
        <h3 style="font-size:17px; font-weight:800; margin:0 0 8px; color:#DC2626;">Reject Return Request</h3>
        <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">
          A policy reason is required to reject a return. This explanation will be delivered directly to the buyer.
        </p>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-main);">Reason for Rejection *</label>
          <select id="select-reject-reason" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; background:var(--bg-surface); color:var(--text-main); margin-bottom:10px;">
            <option value="Item worn, washed, or altered">Item worn, washed, or altered</option>
            <option value="Requested past 30-day marketplace window">Requested past 30-day marketplace window</option>
            <option value="Final clearance / non-returnable merchandise">Final clearance / non-returnable merchandise</option>
            <option value="Missing serial numbers / tags removed">Missing serial numbers / tags removed</option>
            <option value="Other policy violation">Other policy violation</option>
          </select>
          <textarea id="textarea-reject-notes" placeholder="Additional notes or policy details for the buyer..." rows="3" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; background:var(--bg-surface); color:var(--text-main); box-sizing:border-box;"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-cancel-modal" id="btn-cancel-reject" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
          <button type="button" id="btn-confirm-reject" style="padding:10px 20px; border:none; background:#DC2626; color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Reject Request</button>
        </div>
      </div>
    `;
    backdrop.style.display = 'block';

    document.getElementById('btn-cancel-reject')?.addEventListener('click', () => { backdrop.style.display = 'none'; });
    document.getElementById('btn-confirm-reject')?.addEventListener('click', () => {
      const reasonSelect = document.getElementById('select-reject-reason')?.value || 'Policy violation';
      const notes = document.getElementById('textarea-reject-notes')?.value.trim();
      const combinedReason = notes ? `${reasonSelect}: ${notes}` : reasonSelect;

      ret.status = 'rejected';
      ret.timeline.push({ time: Date.now(), actor: 'Merchant', text: `Return rejected: ${combinedReason}` });
      ret.messages.push({ sender: 'seller', name: 'Ameza Official', time: Date.now(), text: `Your return request has been rejected for the following policy reason: ${combinedReason}` });
      saveReturns(allReturns);
      backdrop.style.display = 'none';
      showToast('Return request rejected', 'info');
      renderView();
    });
  }

  function showPartialModal(returnId) {
    const ret = allReturns.find(r => r.id === returnId);
    if (!ret) return;
    const backdrop = document.getElementById('returns-action-modal-backdrop');
    if (!backdrop) return;

    const maxCents = ret.product.priceCents;
    const defaultPartial = Math.round(maxCents * 0.5);

    backdrop.innerHTML = `
      <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:440px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
        <h3 style="font-size:17px; font-weight:800; margin:0 0 8px; color:var(--text-main);">Offer Partial Refund</h3>
        <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">
          Offer the customer a partial credit to keep the merchandise and avoid return shipping friction.
        </p>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-main);">Offer Amount (USD)</label>
          <div style="position:relative;">
            <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:var(--text-muted);">$</span>
            <input type="number" id="input-modal-partial" step="0.01" min="1.00" max="${(maxCents / 100).toFixed(2)}" value="${(defaultPartial / 100).toFixed(2)}"
              style="width:100%; padding:10px 12px 10px 28px; border:1px solid var(--border); border-radius:8px; font-size:16px; font-weight:700; background:var(--bg-surface); color:var(--text-main);">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-cancel-modal" id="btn-cancel-partial" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
          <button type="button" id="btn-confirm-partial" style="padding:10px 20px; border:none; background:var(--dark, #111827); color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Send Offer</button>
        </div>
      </div>
    `;
    backdrop.style.display = 'block';

    document.getElementById('btn-cancel-partial')?.addEventListener('click', () => { backdrop.style.display = 'none'; });
    document.getElementById('btn-confirm-partial')?.addEventListener('click', () => {
      const val = parseFloat(document.getElementById('input-modal-partial')?.value) || 0;
      const offerCents = Math.round(val * 100);
      ret.refundAmountCents = offerCents;
      ret.timeline.push({ time: Date.now(), actor: 'Merchant', text: `Offered partial refund of ${formatMoney(offerCents)} (Keep item).` });
      ret.messages.push({ sender: 'seller', name: 'Ameza Official', time: Date.now(), text: `We would like to offer you a partial refund of ${formatMoney(offerCents)} to keep the item without hassle of repacking and shipping. Let us know if you accept!` });
      saveReturns(allReturns);
      backdrop.style.display = 'none';
      showToast(`Partial refund offer of ${formatMoney(offerCents)} sent`, 'success');
      renderView();
    });
  }

  function showEscalateModal(returnId) {
    const ret = allReturns.find(r => r.id === returnId);
    if (!ret) return;
    const backdrop = document.getElementById('returns-action-modal-backdrop');
    if (!backdrop) return;

    backdrop.innerHTML = `
      <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:480px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
        <h3 style="font-size:17px; font-weight:800; margin:0 0 8px; color:#6D28D9;">Escalate to AMEZA Trust & Safety</h3>
        <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">
          If you believe a return violates terms or involves fraudulent claims, escalate the matter with evidence for marketplace mediation.
        </p>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-main);">Evidence Note & Statement *</label>
          <textarea id="textarea-dispute-notes" placeholder="Describe the dispute circumstances (carrier receipts, postal weigh-ins, security logs)..." rows="4" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; background:var(--bg-surface); color:var(--text-main); box-sizing:border-box; margin-bottom:10px;"></textarea>
          
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-main);">Upload Evidence File (Optional)</label>
          <input type="file" id="file-dispute-evidence" style="width:100%; font-size:13px; color:var(--text-secondary);">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-cancel-modal" id="btn-cancel-dispute" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
          <button type="button" id="btn-confirm-dispute" style="padding:10px 20px; border:none; background:#6D28D9; color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Submit for Mediation</button>
        </div>
      </div>
    `;
    backdrop.style.display = 'block';

    document.getElementById('btn-cancel-dispute')?.addEventListener('click', () => { backdrop.style.display = 'none'; });
    document.getElementById('btn-confirm-dispute')?.addEventListener('click', () => {
      const notes = document.getElementById('textarea-dispute-notes')?.value.trim() || 'Merchant requested dispute review.';
      ret.status = 'disputed';
      ret.timeline.push({ time: Date.now(), actor: 'Merchant', text: `Escalated dispute to AMEZA: ${notes}` });
      saveReturns(allReturns);
      backdrop.style.display = 'none';
      showToast('Dispute escalated to AMEZA Trust & Safety', 'info');
      currentTab = 'disputed';
      renderView();
    });
  }

  function executeRefund(returnId) {
    const ret = allReturns.find(r => r.id === returnId);
    if (!ret) return;

    const refundCents = ret.refundAmountCents || ret.product.priceCents;
    const commRate = ret.commissionRate || 0.10;
    const commReversalCents = Math.round(refundCents * commRate);

    // Record Ledger entries in persistent ledger
    try {
      const ledgerRaw = localStorage.getItem('ameza_marketplace_ledger') || '[]';
      const ledger = JSON.parse(ledgerRaw);
      
      // Debit entry
      ledger.unshift({
        id: 'led_' + Date.now() + '_ref',
        sellerId: 'sel_ameza_official',
        subOrderId: ret.subOrderId,
        entryType: 'refund',
        amountCents: -refundCents,
        bucket: 'available',
        timestamp: Date.now(),
        notes: `Customer refund for Return #${ret.id}`
      });

      // Commission reversal entry
      if (commReversalCents > 0) {
        ledger.unshift({
          id: 'led_' + Date.now() + '_com_rev',
          sellerId: 'sel_ameza_official',
          subOrderId: ret.subOrderId,
          entryType: 'commission_reversal',
          amountCents: commReversalCents,
          bucket: 'available',
          timestamp: Date.now(),
          notes: `Proportional 10% commission reversal for Return #${ret.id}`
        });
      }
      localStorage.setItem('ameza_marketplace_ledger', JSON.stringify(ledger));
    } catch (e) {}

    ret.status = 'refunded';
    ret.timeline.push({ time: Date.now(), actor: 'Merchant', text: `Refund of ${formatMoney(refundCents)} issued. Commission of ${formatMoney(commReversalCents)} reversed.` });
    ret.messages.push({ sender: 'seller', name: 'Ameza Official', time: Date.now(), text: `Your refund of ${formatMoney(refundCents)} has been processed to your original payment method.` });
    saveReturns(allReturns);

    showToast(`Refund of ${formatMoney(refundCents)} processed successfully`, 'success');
    currentTab = 'refunded';
    renderView();
  }

  function exportReturnsCSV(data) {
    const headers = ['Return ID', 'Order ID', 'Customer Name', 'Customer Email', 'Product Name', 'Amount Cents', 'Status', 'Date ET'];
    const rows = data.map(r => [
      r.id,
      r.orderId,
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.customerEmail,
      `"${r.product.name.replace(/"/g, '""')}"`,
      r.product.priceCents,
      r.status,
      `"${formatUSDateTime(r.createdAt)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ameza_returns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Returns exported to CSV', 'success');
  }

  // Initial render
  renderView();
}
