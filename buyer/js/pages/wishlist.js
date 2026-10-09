/**
 * AMEZA Buyer Wishlist Page Module — buyer/js/pages/wishlist.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { escapeHTML } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initWishlistPage() {
  const session = getSession() || (window.AmezaAuth && window.AmezaAuth.getCurrentUser && window.AmezaAuth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = AccountUI.sidebarHTML(session, 'wishlist');
    AccountUI.initMobileSidebar();
  }

  const container = document.getElementById('account-wishlist-container') || document.getElementById('wishlist-grid') || document.getElementById('wishlist-items-container');
  if (!container) return;

  function loadWishlist() {
    try {
      const raw = localStorage.getItem('ameza_wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function renderWishlist() {
    const items = loadWishlist();
    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 48px 16px; color: var(--text-muted); grid-column: 1 / -1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display:block; opacity:0.4;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <h3 style="font-size: 1.15rem; color: var(--dark); font-weight:700; margin-bottom: 6px;">Your Wishlist is Empty</h3>
          <p style="font-size: 0.9rem; margin-bottom: 18px;">Save items you love to your wishlist while browsing.</p>
          <a href="/storefront/shop.html" class="btn-section-action" style="display:inline-flex; padding:10px 22px; text-decoration:none;">Explore Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map((item, idx) => `
      <div class="wishlist-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; background: #FFF; display: flex; flex-direction: column;">
        <div style="position:relative; aspect-ratio: 1; border-radius: var(--radius-md); overflow:hidden; background:#F8FAFC; margin-bottom:12px;">
          <img src="${escapeHTML(item.image || item.imageUrl || '/assets/products/placeholder.jpg')}" alt="${escapeHTML(item.name || item.title || 'Item')}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/assets/products/leather-belt-1.jpg'">
          <button type="button" class="btn-remove-wishlist" data-idx="${idx}" aria-label="Remove item" style="position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:#FFF; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#EF4444;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--dark); margin: 0 0 4px; line-height: 1.3;">${escapeHTML(item.name || item.title || 'Item')}</h4>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary, #7DBA35); margin-bottom: 14px;">${AccountUI.formatPrice(item.price || item.priceCents || 0)}</div>
        <div style="margin-top:auto;">
          <a href="/storefront/product.html?id=${encodeURIComponent(item.id || item.productId || '')}" class="btn-section-action" style="display:block; text-align:center; padding: 8px 12px; text-decoration:none; font-size:0.85rem;">View Product</a>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const current = loadWishlist();
        current.splice(idx, 1);
        localStorage.setItem('ameza_wishlist', JSON.stringify(current));
        AccountUI.toast('Item removed from wishlist');
        renderWishlist();
      });
    });
  }

  renderWishlist();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initWishlistPage();
  });
} else {
  initLayout();
  initWishlistPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initWishlistPage = initWishlistPage;
