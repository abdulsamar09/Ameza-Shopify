/**
 * AMEZA Account Overview Module — js/account-overview.js
 * Handles account overview rendering, stats computation, active order tracking,
 * recent orders with loading skeleton & empty states, quick links, and seller card.
 */

import { escapeHTML, formatMoney, showToast } from './core/utils.js';

export function formatUSDate(dateValue) {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return String(dateValue);
  }
}

export function getTrackingUrl(carrier, trackingNumber) {
  if (!trackingNumber) return '#';
  const cleanCarrier = (carrier || 'USPS').toUpperCase();
  const cleanNum = encodeURIComponent(trackingNumber.trim());

  if (cleanCarrier.includes('UPS') || cleanNum.startsWith('1Z')) {
    return `https://www.ups.com/track?tracknum=${cleanNum}`;
  }
  if (cleanCarrier.includes('FEDEX') || cleanNum.startsWith('79')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${cleanNum}`;
  }
  // Default to USPS
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNum}`;
}

export function renderAccountOverview() {
  const Auth = window.AmezaAuth;
  const UI = window.AccountUI;

  if (!Auth || !UI) {
    console.error('[Account Overview] Required modules window.AmezaAuth or window.AccountUI not found.');
    return;
  }

  // 1. Guard — Require authentication without throwing
  const user = UI.requireAuth();
  if (!user) {
    return;
  }

  try {
    // 2. Render Shared Sidebar
    const sidebarEl = document.getElementById('account-sidebar');
    if (sidebarEl) {
      sidebarEl.innerHTML = UI.sidebarHTML(user, 'overview');
      UI.initMobileSidebar();
    }

    // 3. Welcome Banner
    const welcomeNameEl = document.getElementById('welcome-name');
    const welcomeSubtitleEl = document.getElementById('welcome-subtitle');
    const welcomeBannerEl = document.getElementById('dashboard-welcome');

    if (welcomeNameEl) {
      welcomeNameEl.textContent = `Welcome back, ${user.firstName || 'Member'}!`;
    }

    if (welcomeSubtitleEl && welcomeBannerEl) {
      // Remove any existing unverified banner
      const existingUnverified = welcomeBannerEl.querySelector('.unverified-banner');
      if (existingUnverified) existingUnverified.remove();

      if (user.emailVerified) {
        welcomeSubtitleEl.style.display = 'block';
        welcomeSubtitleEl.textContent = "Here's what's happening with your account today.";
      } else {
        welcomeSubtitleEl.style.display = 'none';
        const unverifiedHtml = `
          <div class="unverified-banner" id="unverified-email-banner">
            <div class="unverified-banner-text">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>Your email address <strong>${escapeHTML(user.email)}</strong> is unverified. Please verify to access all account features.</span>
            </div>
            <button type="button" class="btn-resend-verification" id="btn-resend-verification" data-action="resend-verification">
              Resend verification email
            </button>
          </div>
        `;
        const infoDiv = welcomeBannerEl.querySelector('.welcome-info') || welcomeBannerEl.firstElementChild;
        if (infoDiv) {
          infoDiv.insertAdjacentHTML('beforeend', unverifiedHtml);
        }
      }
    }

    // 4. Compute Stats from Data (Never hardcoded)
    const orders = Auth.getOrders(user.id) || [];
    const pendingOrders = orders.filter(o =>
      ['pending', 'processing', 'packed', 'shipped'].includes((o.status || '').toLowerCase())
    );

    let wishlist = [];
    try {
      const rawWish = localStorage.getItem('ameza_wishlist');
      if (rawWish) wishlist = JSON.parse(rawWish) || [];
    } catch (e) {
      wishlist = [];
    }

    const statTotalEl = document.getElementById('stat-total-orders');
    const statPendingEl = document.getElementById('stat-pending-orders');
    const statWishlistEl = document.getElementById('stat-wishlist');
    const statStatusEl = document.getElementById('stat-status');

    if (statTotalEl) statTotalEl.textContent = orders.length;
    if (statPendingEl) statPendingEl.textContent = pendingOrders.length;
    if (statWishlistEl) statWishlistEl.textContent = wishlist.length;
    if (statStatusEl) statStatusEl.textContent = user.emailVerified ? 'Active' : 'Unverified';

    // 5. In-Transit Order Tracker
    const inTransitOrder = orders.find(o =>
      ['shipped', 'in_transit', 'out_for_delivery', 'packed'].includes((o.status || '').toLowerCase())
    );

    const trackerContainer = document.getElementById('order-tracker-container');
    if (trackerContainer) {
      if (inTransitOrder) {
        const orderStatus = (inTransitOrder.status || 'shipped').toLowerCase();
        const carrier = inTransitOrder.carrier || 'USPS';
        const trackingNum = inTransitOrder.trackingNumber || inTransitOrder.tracking_number || '9400111899562537628190';
        const trackingUrl = inTransitOrder.trackingUrl || getTrackingUrl(carrier, trackingNum);

        // Progress steps: Placed, Packed, Shipped, Delivered
        const isPackedDone = ['packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(orderStatus);
        const isShippedDone = ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(orderStatus);
        const isDeliveredDone = orderStatus === 'delivered';

        const step1Cls = 'completed';
        const step2Cls = isShippedDone ? 'completed' : (isPackedDone ? 'active' : '');
        const step3Cls = isDeliveredDone ? 'completed' : (isShippedDone ? 'active' : '');
        const step4Cls = isDeliveredDone ? 'completed active' : '';

        const itemPreview = Array.isArray(inTransitOrder.items) && inTransitOrder.items.length > 0
          ? inTransitOrder.items[0]
          : null;
        const itemImg = itemPreview?.image || itemPreview?.thumbnail || 'assets/wp_products/wp_52_0.webp';
        const itemName = itemPreview?.name || 'Artisan Marketplace Package';

        trackerContainer.innerHTML = `
          <div class="order-tracker-card">
            <div class="order-tracker-header">
              <div class="tracker-title-wrap">
                <div class="tracker-title">
                  <i class="fa-solid fa-truck-fast" style="color: var(--primary); margin-right: 6px;"></i>
                  Shipment Tracker &bull; #${escapeHTML(inTransitOrder.orderNumber || inTransitOrder.id)}
                </div>
                <span class="tracker-badge">
                  <i class="fa-solid fa-circle-dot" style="font-size: 8px;"></i>
                  ${orderStatus === 'shipped' ? 'In Transit' : (orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1))}
                </span>
              </div>
              <div class="tracker-carrier-info">
                <span><strong>${escapeHTML(carrier)}</strong> &bull; Tracking #${escapeHTML(trackingNum)}</span>
                <a href="${escapeHTML(trackingUrl)}" target="_blank" rel="noopener noreferrer" class="tracker-link" data-action="track-package">
                  Track Package &rarr;
                </a>
              </div>
            </div>

            <div class="tracker-steps-grid">
              <div class="tracker-step-item ${step1Cls}">
                <div class="tracker-step-circle">
                  <i class="fa-solid fa-check"></i>
                </div>
                <div class="tracker-step-label">Placed</div>
                <div class="tracker-step-sub">${formatUSDate(inTransitOrder.createdAt || inTransitOrder.date)}</div>
              </div>
              <div class="tracker-step-item ${step2Cls}">
                <div class="tracker-step-circle">
                  ${isShippedDone ? '<i class="fa-solid fa-check"></i>' : (isPackedDone ? '<i class="fa-solid fa-box"></i>' : '2')}
                </div>
                <div class="tracker-step-label">Packed</div>
                <div class="tracker-step-sub">${isPackedDone ? 'Verified' : 'Pending'}</div>
              </div>
              <div class="tracker-step-item ${step3Cls}">
                <div class="tracker-step-circle">
                  ${isDeliveredDone ? '<i class="fa-solid fa-check"></i>' : (isShippedDone ? '<i class="fa-solid fa-truck"></i>' : '3')}
                </div>
                <div class="tracker-step-label">Shipped</div>
                <div class="tracker-step-sub">${isShippedDone ? 'On the way' : 'Upcoming'}</div>
              </div>
              <div class="tracker-step-item ${step4Cls}">
                <div class="tracker-step-circle">
                  ${isDeliveredDone ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-house-chimney"></i>'}
                </div>
                <div class="tracker-step-label">Delivered</div>
                <div class="tracker-step-sub">${isDeliveredDone ? 'Delivered' : 'Est. 2-3 Days'}</div>
              </div>
            </div>

            <div class="tracker-item-preview">
              <img src="${escapeHTML(itemImg)}" alt="${escapeHTML(itemName)}" class="order-item-thumb" onerror="this.src='assets/wp_products/wp_52_0.webp'">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--dark);">${escapeHTML(itemName)}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Dispatched to ${escapeHTML(inTransitOrder.shippingAddress?.line1 || inTransitOrder.shippingAddress || 'Austin, TX')}</div>
              </div>
              <a href="account-order-detail.html?id=${encodeURIComponent(inTransitOrder.id)}" class="btn-section-action secondary" style="font-size: 0.8rem; padding: 6px 14px;">
                View Order Details
              </a>
            </div>
          </div>
        `;
        trackerContainer.style.display = 'block';
      } else {
        trackerContainer.innerHTML = '';
        trackerContainer.style.display = 'none';
      }
    }

    // 6. Recent Orders (Last 5 orders)
    const recentOrdersContainer = document.getElementById('recent-orders-container');
    if (recentOrdersContainer) {
      const recentOrders = orders.slice(0, 5);

      if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
          <div class="account-empty-state">
            <div class="account-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h3>No orders yet</h3>
            <p>Start shopping and your orders will appear here.</p>
            <a href="shop.html" class="btn-section-action">Start Shopping</a>
          </div>
        `;
      } else {
        recentOrdersContainer.innerHTML = recentOrders.map(o => {
          const orderItems = Array.isArray(o.items) ? o.items : [];
          const firstThumb = orderItems[0]?.image || orderItems[0]?.thumbnail || 'assets/wp_products/wp_52_0.webp';
          const itemsPreview = orderItems.length > 0
            ? orderItems.map(i => i.name || i).join(', ')
            : 'Artisan Marketplace Goods';

          const totalCents = o.grandTotalCents !== undefined
            ? o.grandTotalCents
            : Math.round((Number(o.total) || 0) * 100);

          const formattedTotal = formatMoney(totalCents);
          const orderDateFormatted = formatUSDate(o.createdAt || o.date);
          const statusBadgeHtml = UI.statusBadge(o.status || 'Processing');

          return `
            <div class="order-row" data-order-id="${escapeHTML(o.id)}">
              <div>
                <div class="order-id">#${escapeHTML(o.orderNumber || o.id)}</div>
                <div class="order-date">${escapeHTML(orderDateFormatted)}</div>
              </div>

              <div class="order-items-col">
                <img src="${escapeHTML(firstThumb)}" alt="Order Item" class="order-item-thumb" onerror="this.src='assets/wp_products/wp_52_0.webp'">
                <div class="order-items-preview" title="${escapeHTML(itemsPreview)}">${escapeHTML(itemsPreview)}</div>
              </div>

              <div>${statusBadgeHtml}</div>

              <div class="order-total">${formattedTotal}</div>

              <a href="account-order-detail.html?id=${encodeURIComponent(o.id)}" class="btn-view-order" aria-label="View Order #${escapeHTML(o.orderNumber || o.id)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View
              </a>
            </div>
          `;
        }).join('');
      }
    }

    // 7. Seller CTA Card
    const sellerCtaContainer = document.getElementById('seller-cta-container');
    if (sellerCtaContainer) {
      const isApprovedSeller = user.role === 'seller' || user.isSeller === true;
      if (isApprovedSeller) {
        sellerCtaContainer.innerHTML = `
          <div class="account-seller-cta-card">
            <div class="seller-cta-info">
              <h3><i class="fa-solid fa-briefcase" style="color: #A3E635; margin-right: 8px;"></i> Open Seller Dashboard</h3>
              <p>Manage your artisan products, fulfillment workflows, customer reviews, and ACH payouts.</p>
            </div>
            <a href="seller/index.html" class="btn-seller-cta">
              Open Seller Central &rarr;
            </a>
          </div>
        `;
      } else {
        sellerCtaContainer.innerHTML = `
          <div class="account-seller-cta-card">
            <div class="seller-cta-info">
              <h3><i class="fa-solid fa-store" style="color: #A3E635; margin-right: 8px;"></i> Become a Seller on AMEZA</h3>
              <p>Join top American artisans and businesses. Zero setup fees, transparent 10% commission, and automated U.S. fulfillment.</p>
            </div>
            <a href="onboarding/sell-with-us.html" class="btn-seller-cta">
              Become a Seller &rarr;
            </a>
          </div>
        `;
      }
    }

    // 8. Event Delegation for Interactive Controls
    const mainContent = document.getElementById('account-main-content');
    if (mainContent && !mainContent.dataset.eventsBound) {
      mainContent.dataset.eventsBound = 'true';
      mainContent.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-action]');
        if (!targetBtn) return;

        const action = targetBtn.dataset.action;
        if (action === 'resend-verification') {
          e.preventDefault();
          if (Auth.resendVerificationEmail) {
            Auth.resendVerificationEmail(user.email);
          }
          showToast(`Verification email resent to ${user.email}! Please check your inbox.`, 'success');
          targetBtn.disabled = true;
          targetBtn.textContent = 'Email Sent!';
          setTimeout(() => {
            targetBtn.disabled = false;
            targetBtn.textContent = 'Resend verification email';
          }, 8000);
        } else if (action === 'retry') {
          e.preventDefault();
          renderAccountOverview();
        }
      });
    }

  } catch (error) {
    console.error('[Account Overview Render Failure]', error);
    renderErrorCard(error);
  }
}

function renderErrorCard(error) {
  const UI = window.AccountUI;
  const user = window.AmezaAuth?.getCurrentUser() || { firstName: 'Member', lastName: '', email: '' };

  // Guarantee sidebar is populated
  const sidebarEl = document.getElementById('account-sidebar');
  if (sidebarEl && UI && typeof UI.sidebarHTML === 'function') {
    sidebarEl.innerHTML = UI.sidebarHTML(user, 'overview');
    UI.initMobileSidebar();
  }

  const mainContent = document.getElementById('account-main-content');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="account-error-card">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #FEE2E2; color: #DC2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--dark); margin-bottom: 8px;">Unable to load account overview</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 20px;">
          We encountered an issue loading your account data. Please click Retry below to re-render your dashboard.
        </p>
        <button type="button" class="btn-section-action" data-action="retry" style="margin: 0 auto;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Retry
        </button>
      </div>
    `;

    mainContent.addEventListener('click', (e) => {
      const retryBtn = e.target.closest('[data-action="retry"]');
      if (retryBtn) {
        e.preventDefault();
        renderAccountOverview();
      }
    }, { once: true });
  }
}

// Auto-initialize when loaded as a module in the browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAccountOverview);
  } else {
    renderAccountOverview();
  }
}
