/**
 * AMEZA Unified Layout Manager — js/core/layout.js
 * Universal header and footer engine for public storefront, focus screens, and dashboards.
 * Single source of truth for header and footer markups.
 */

import { escapeHTML, formatMoney } from './utils.js';

/**
 * Calculates relative base path from current page to project root.
 * Ensures all assets and links resolve correctly regardless of folder depth.
 */
function getBasePath() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path) return './';
  const segments = path.split('/').filter(Boolean);
  // If at root level file (e.g. index.html or empty)
  if (segments.length <= 1) return './';
  // If inside a subdirectory (e.g. seller/index.html or onboarding/apply.html)
  return '../'.repeat(segments.length - 1);
}

/**
 * Detects if the current page is the storefront homepage.
 * Returns true only for root URL, /index.html, or empty path.
 * Ensures travel sub-navigation bar only appears on the home page.
 */
function isHomePage() {
  const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
  const cleanPath = path.replace(/\/+$/, '');
  const lastSegment = cleanPath.split('/').pop() || '';
  return cleanPath === '' || lastSegment === '' || lastSegment === 'index.html';
}

/**
 * Reads current authenticated session.
 * @returns {Object|null}
 */
function getSession() {
  try {
    const raw = localStorage.getItem('ameza_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Reads current cart item count.
 * @returns {number}
 */
function getCartCount() {
  try {
    const rawV2 = localStorage.getItem('ameza_cart_v2');
    if (rawV2) {
      const cart = JSON.parse(rawV2);
      return Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    }
    const rawV1 = localStorage.getItem('ameza_cart');
    if (rawV1) {
      const cart = JSON.parse(rawV1);
      return Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    }
  } catch (e) {}
  return 0;
}

/**
 * Reads current wishlist count.
 * @returns {number}
 */
function getWishlistCount() {
  try {
    const raw = localStorage.getItem('ameza_wishlist');
    if (raw) {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.length : 0;
    }
  } catch (e) {}
  return 0;
}

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, flag: '🇺🇸', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦', decimals: 2 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 18.5, flag: '🇲🇽', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.0, flag: '🇯🇵', decimals: 0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5, flag: '🇮🇳', decimals: 0 },
};

/**
 * Renders the single site-wide currency changer button & dropdown in the utility bar.
 */
export function renderCurrencyChanger(wrapper) {
  if (!wrapper) return;

  // Guarantee strictly one wrapper in parent container
  const parent = wrapper.parentElement;
  if (parent) {
    const allWrappers = parent.querySelectorAll('.top-bar-currency-wrapper');
    for (let i = 1; i < allWrappers.length; i++) {
      allWrappers[i].remove();
    }
    // Remove any legacy currency selector or static text
    parent.querySelectorAll('.currency-selector-wrap, #currency-select').forEach(el => el.remove());
  }

  const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('ameza_currency')) || 'USD';
  const activeCode = CURRENCIES[stored] ? stored : 'USD';
  const curr = CURRENCIES[activeCode];
  const displayText = `${curr.code} (${curr.symbol.trim()})`;

  wrapper.innerHTML = `
    <button type="button" class="top-bar-currency-btn" id="header-currency-btn" aria-expanded="false" aria-haspopup="true" title="Current Currency: ${curr.name} (${curr.code}) — Click to change">
      <i class="fa-solid fa-globe"></i>
      <span class="current-currency-text">${displayText}</span>
      <i class="fa-solid fa-chevron-down currency-chevron"></i>
    </button>
    <div class="top-bar-currency-dropdown" role="menu">
      <div class="currency-dropdown-header">
        <span class="currency-dropdown-title">
          <span>Select Currency</span>
          <i class="fa-solid fa-coins" style="color:var(--primary, #7DBA35); font-size:0.75rem;"></i>
        </span>
      </div>
      <div class="currency-dropdown-list">
        ${Object.values(CURRENCIES).map(c => `
          <button type="button" class="currency-dropdown-item ${c.code === activeCode ? 'active' : ''}" data-currency-code="${c.code}">
            <div class="currency-item-left">
              <span class="currency-item-flag">${c.flag}</span>
              <div class="currency-item-info">
                <span class="currency-item-code">${c.code}</span>
                <span class="currency-item-name">${c.name}</span>
              </div>
            </div>
            <span class="currency-item-symbol">${c.symbol.trim()}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const btn = wrapper.querySelector('.top-bar-currency-btn');
  if (btn) {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('is-open');
      document.querySelectorAll('.top-bar-currency-wrapper.is-open').forEach(w => {
        w.classList.remove('is-open');
        const b = w.querySelector('.top-bar-currency-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        wrapper.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    };
  }

  wrapper.querySelectorAll('.currency-dropdown-item').forEach(item => {
    item.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = item.getAttribute('data-currency-code');
      if (code && CURRENCIES[code]) {
        try {
          localStorage.setItem('ameza_currency', code);
        } catch (e) {}

        const updated = CURRENCIES[code];
        document.querySelectorAll('.current-currency-text').forEach(t => {
          t.textContent = `${updated.code} (${updated.symbol.trim()})`;
        });

        wrapper.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');

        wrapper.querySelectorAll('.currency-dropdown-item').forEach(i => {
          i.classList.toggle('active', i.getAttribute('data-currency-code') === code);
        });

        window.dispatchEvent(new CustomEvent('ameza:currency-changed', {
          detail: { currency: code, config: updated }
        }));

        if (window.AmezaCurrency && typeof window.AmezaCurrency.setCurrency === 'function') {
          window.AmezaCurrency.setCurrency(code);
        }

        if (window.AmezaCart && typeof window.AmezaCart.render === 'function') {
          window.AmezaCart.render();
        }
      }
    };
  });
}

/**
 * Injects mobile drawer structure and backdrop for travel pages so mobile navigation works consistently.
 */
function initTravelDrawer(base) {
  const session = getSession();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  let nav = document.getElementById('main-nav-menu') || document.querySelector('header .main-nav, .header-sticky .main-nav, nav.main-nav');
  if (!nav) {
    const header = document.getElementById('main-header') || document.querySelector('header');
    if (header) {
      nav = document.createElement('nav');
      nav.className = 'main-nav';
      nav.id = 'main-nav-menu';
      header.appendChild(nav);
    } else {
      return;
    }
  }

  if (!nav.id) {
    nav.id = 'main-nav-menu';
  }

  // Prepend icons to top links if missing
  const iconMap = {
    'store': 'fa-house',
    'home': 'fa-house',
    'stay': 'fa-bed',
    'flight': 'fa-plane-departure',
    'car': 'fa-car',
    'attraction': 'fa-ticket',
    'taxi': 'fa-taxi'
  };
  nav.querySelectorAll('.nav-link').forEach(link => {
    if (!link.querySelector('.nav-icon') && !link.closest('.mobile-nav-extras')) {
      const text = link.textContent.toLowerCase();
      let iconClass = 'fa-arrow-right';
      for (const [key, icon] of Object.entries(iconMap)) {
        if (text.includes(key)) {
          iconClass = icon;
          break;
        }
      }
      const icon = document.createElement('i');
      icon.className = `fa-solid ${iconClass} nav-icon`;
      link.insertBefore(icon, link.firstChild);
    }
  });

  // Prepend drawer header if not already present
  if (!nav.querySelector('.mobile-nav-drawer-header')) {
    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'mobile-nav-drawer-header';
    drawerHeader.innerHTML = `
      <a href="${base}index.html" class="logo-wrap" style="display:inline-flex; align-items:center;">
        <img src="${base}assets/ameza-logo.png" alt="AMEZA Logo" style="height:32px; width:auto;" onerror="this.src='${base}assets/logo.png'">
      </a>
      <button type="button" class="btn-mobile-nav-close" id="btn-mobile-nav-close" aria-label="Close navigation">&times;</button>
    `;
    nav.insertBefore(drawerHeader, nav.firstChild);
  }

  // Ensure extras exist
  if (!nav.querySelector('.mobile-nav-extras')) {
    const extras = document.createElement('div');
    extras.className = 'mobile-nav-extras';
    extras.innerHTML = `
      <!-- Store & Catalog Categories -->
      <div class="mobile-nav-section-title">Store &amp; Catalog</div>
      <a href="${base}shop.html?category=clothing" class="nav-link">
        <i class="fa-solid fa-shirt nav-icon"></i>
        <span>Clothing</span>
      </a>
      <a href="${base}shop.html?category=electronics" class="nav-link">
        <i class="fa-solid fa-headphones nav-icon"></i>
        <span>Electronics</span>
      </a>
      <a href="${base}shop.html?category=watches" class="nav-link">
        <i class="fa-solid fa-clock nav-icon"></i>
        <span>Watches</span>
      </a>
      <a href="${base}shop.html?category=leather-belts" class="nav-link">
        <i class="fa-solid fa-shield-halved nav-icon"></i>
        <span>Leather Belts</span>
      </a>
      <a href="${base}shop.html?category=leather-wallets" class="nav-link">
        <i class="fa-solid fa-wallet nav-icon"></i>
        <span>Wallets</span>
      </a>
      <a href="${base}shop.html?category=bags" class="nav-link">
        <i class="fa-solid fa-bag-shopping nav-icon"></i>
        <span>Bags &amp; Totes</span>
        <span class="badge-new">NEW</span>
      </a>

      <!-- Customer Account & Cart -->
      <div class="mobile-nav-section-title">My Account</div>
      <a href="${base}${session ? 'account.html' : 'login.html'}" class="nav-link">
        <i class="fa-solid fa-user nav-icon"></i>
        <span>${session ? (session.name || 'Account Dashboard') : 'Sign In / Register'}</span>
      </a>
      <a href="${base}account-wishlist.html" class="nav-link">
        <i class="fa-solid fa-heart nav-icon"></i>
        <span>Wishlist</span>
        <span class="mobile-nav-count" style="${wishlistCount > 0 ? '' : 'display: none;'}">${wishlistCount}</span>
      </a>
      <a href="${base}cart.html" class="nav-link">
        <i class="fa-solid fa-cart-shopping nav-icon"></i>
        <span>Cart</span>
        <span class="mobile-nav-count" style="${cartCount > 0 ? '' : 'display: none;'}">${cartCount}</span>
      </a>

      <!-- Merchant Link -->
      <div class="mobile-nav-section-title">Merchant &amp; Support</div>
      <a href="${base}onboarding/sell-with-us.html" class="nav-link">
        <i class="fa-solid fa-store nav-icon" style="color:var(--primary, #7DBA35);"></i>
        <span style="font-weight:700; color:var(--primary, #7DBA35);">Become a Seller</span>
      </a>
    `;
    nav.appendChild(extras);
  }

  // Ensure backdrop exists
  if (!document.getElementById('main-nav-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'main-nav-backdrop';
    backdrop.id = 'main-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  // Update layout cart count badge if present
  const layoutCartCount = document.getElementById('layout-cart-count');
  if (layoutCartCount) {
    layoutCartCount.textContent = cartCount;
    layoutCartCount.style.display = cartCount > 0 ? 'inline-flex' : 'none';
  }
}

/**
 * Initializes and mounts universal header and footer.
 */
export function initLayout() {
  // Ensure mobile OS dark mode does not invert or auto-darken website background
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = 'light';
      if (!document.querySelector('meta[name="color-scheme"]')) {
        const meta = document.createElement('meta');
        meta.name = 'color-scheme';
        meta.content = 'light';
        document.head.prepend(meta);
      }
      if (!document.querySelector('meta[name="theme-color"]')) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#FFFFFF';
        document.head.prepend(meta);
      }
    }
  } catch (e) {}

  const layoutType = document.body.getAttribute('data-layout') || 'storefront';
  if (layoutType === 'none') {
    return; // Dashboards handle their own shell
  }

  const base = getBasePath();

  if (layoutType === 'travel') {
    // Travel pages use their specialized headers; layout.js renders the single currency changer
    const wrapper = document.getElementById('global-currency-wrapper') || document.querySelector('.top-bar-currency-wrapper');
    if (wrapper) {
      renderCurrencyChanger(wrapper);
    }
    initTravelDrawer(base);
    bindLayoutEvents(base);
    return;
  }

  const session = getSession();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  let headerMount = document.getElementById('site-header');
  if (!headerMount) {
    headerMount = document.createElement('div');
    headerMount.id = 'site-header';
    document.body.insertBefore(headerMount, document.body.firstChild);
  }

  let footerMount = document.getElementById('site-footer');
  if (!footerMount) {
    footerMount = document.createElement('div');
    footerMount.id = 'site-footer';
    document.body.appendChild(footerMount);
  }

  if (layoutType === 'focus') {
    renderFocusLayout(headerMount, footerMount, base);
  } else {
    renderStorefrontLayout(headerMount, footerMount, base, session, cartCount, wishlistCount);
  }

  // Ensure Global Back to Top button exists
  if (!document.getElementById('global-back-to-top')) {
    const btt = document.createElement('button');
    btt.type = 'button';
    btt.id = 'global-back-to-top';
    btt.className = 'back-to-top-btn';
    btt.setAttribute('aria-label', 'Back to top');
    btt.setAttribute('title', 'Back to top');
    btt.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(btt);
  }

  // Load and initialize cart drawer on storefront pages
  if (layoutType !== 'focus' && layoutType !== 'none') {
    const cartDrawerUrl = new URL(`${base}js/cart-drawer.js`, window.location.href).href;
    import(cartDrawerUrl).then(module => {
      if (module && typeof module.initCartDrawer === 'function') {
        module.initCartDrawer();
      }
    }).catch(err => {
      console.warn('[AMEZA] Error loading cart drawer:', err);
    });
  }

  // Ensure currency engine is active
  if (!window.AmezaCurrency) {
    const currScript = document.createElement('script');
    currScript.src = `${base}js/currency.js`;
    currScript.onload = () => {
      if (window.AmezaCurrency && typeof window.AmezaCurrency.updateTopBarLabels === 'function') {
        window.AmezaCurrency.updateTopBarLabels();
      }
    };
    document.head.appendChild(currScript);
  } else {
    window.AmezaCurrency.updateTopBarLabels();
  }

  bindLayoutEvents(base);
}

/**
 * Renders the focus layout header and footer (Checkout, Auth, Onboarding).
 * Perfectly matches user Screenshot 1.
 */
function renderFocusLayout(headerMount, footerMount, base) {
  headerMount.innerHTML = `
    <header class="focus-header">
      <div class="container focus-header-container">
        <div class="focus-header-spacer"></div>
        <a href="${base}index.html" class="focus-logo" title="Return to AMEZA Storefront">
          <img src="${base}assets/ameza-logo.png" alt="AMEZA Logo" class="brand-logo-img" onerror="this.src='${base}assets/logo.png'">
        </a>
        <div class="focus-security-col">
          <span class="focus-header-badge">
            <i class="fa-solid fa-lock"></i> 256-Bit SSL Encrypted Connection
          </span>
        </div>
      </div>
    </header>
  `;

  footerMount.innerHTML = `
    <footer class="focus-footer">
      <div class="container focus-footer-container">
        <p>&copy; 2026 AMEZA Marketplace Inc. &bull; Secure Multi-Vendor Platform &bull; <a href="${base}index.html">Return to Storefront</a></p>
      </div>
    </footer>
  `;
}

/**
 * Renders the full storefront header and footer.
 */
function renderStorefrontLayout(headerMount, footerMount, base, session, cartCount, wishlistCount) {
  const role = session ? (session.role || 'customer') : 'guest';
  const userName = session ? (session.name || session.email || 'My Account') : 'Sign In';
  const onHomePage = isHomePage();

  // 1. HEADER MARKUP
  headerMount.innerHTML = `
    <!-- Top Announcement Bar (Green) -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <div class="top-bar-left">
          <span class="top-bar-badge"><i class="fa-solid fa-truck"></i> U.S. DELIVERY</span>
          <span>Free U.S. shipping on orders over $100 &bull; 30-day returns</span>
        </div>
        <div class="top-bar-right">
          <a href="${base}onboarding/sell-with-us.html" class="top-bar-link" id="top-bar-become-seller">
            <i class="fa-solid fa-store"></i> Become a Seller
          </a>
          <span class="top-bar-divider">|</span>
          <a href="${base}account-orders.html" class="top-bar-link" id="top-bar-track-order">
            <i class="fa-solid fa-truck"></i> Track Order
          </a>
          <span class="top-bar-divider">|</span>
          <div class="top-bar-currency-wrapper" id="global-currency-wrapper"></div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header (White) -->
    <header class="header-sticky" id="main-header">
      <div class="container header-inner">
        <!-- Logo -->
        <a href="${base}index.html" class="logo-wrap" title="AMEZA E-Commerce Home">
          <img src="${base}assets/ameza-logo.png" alt="AMEZA Logo" class="brand-logo-img" onerror="this.src='${base}assets/logo.png'">
        </a>

        <!-- Center Nav -->
        <nav class="main-nav" id="main-nav-menu">
          <div class="mobile-nav-drawer-header">
            <a href="${base}index.html" class="logo-wrap" style="display:inline-flex; align-items:center;">
              <img src="${base}assets/ameza-logo.png" alt="AMEZA Logo" style="height:32px; width:auto;" onerror="this.src='${base}assets/logo.png'">
            </a>
            <button type="button" class="btn-mobile-nav-close" id="btn-mobile-nav-close" aria-label="Close navigation">&times;</button>
          </div>
          <a href="${base}index.html" class="nav-link" id="nav-home">
            <i class="fa-solid fa-house nav-icon"></i>
            <span>Home</span>
          </a>
          <a href="${base}shop.html?category=clothing" class="nav-link" id="nav-clothing">
            <i class="fa-solid fa-shirt nav-icon"></i>
            <span>Clothing</span>
          </a>
          <a href="${base}shop.html?category=electronics" class="nav-link" id="nav-electronics">
            <i class="fa-solid fa-headphones nav-icon"></i>
            <span>Electronics</span>
          </a>
          <a href="${base}shop.html?category=watches" class="nav-link" id="nav-watches">
            <i class="fa-solid fa-clock nav-icon"></i>
            <span>Watches</span>
          </a>
          <a href="${base}shop.html?category=leather-belts" class="nav-link" id="nav-leather">
            <i class="fa-solid fa-shield-halved nav-icon"></i>
            <span>Leather Belts</span>
          </a>
          <a href="${base}shop.html?category=leather-wallets" class="nav-link" id="nav-wallets">
            <i class="fa-solid fa-wallet nav-icon"></i>
            <span>Wallets</span>
          </a>
          <a href="${base}shop.html?category=bags" class="nav-link" id="nav-bags">
            <i class="fa-solid fa-bag-shopping nav-icon"></i>
            <span>Bags &amp; Totes</span>
            <span class="badge-new">NEW</span>
          </a>
          <a href="${base}stores.html" class="nav-link" id="nav-stores">
            <i class="fa-solid fa-store nav-icon"></i>
            <span>Stores</span>
          </a>

          <!-- Mobile Navigation Sections (Categories, Travel Services, and My Account) -->
          <div class="mobile-nav-extras">
            <!-- Travel & Booking Services -->
            <div class="mobile-nav-section-title">Travel &amp; Booking Services</div>
            <a href="${base}stays.html" class="nav-link" id="mobile-nav-stays">
              <i class="fa-solid fa-bed nav-icon"></i>
              <span>AMEZA Hotels</span>
            </a>
            <a href="${base}car-rental.html" class="nav-link" id="mobile-nav-cars">
              <i class="fa-solid fa-car nav-icon"></i>
              <span>Car Rental</span>
            </a>
            <a href="${base}attractions.html" class="nav-link" id="mobile-nav-attractions">
              <i class="fa-solid fa-ticket nav-icon"></i>
              <span>Attractions &amp; Tours</span>
            </a>
            <a href="${base}airport-taxis.html" class="nav-link" id="mobile-nav-taxis">
              <i class="fa-solid fa-taxi nav-icon"></i>
              <span>Airport Taxis</span>
            </a>
            <a href="${base}flights.html" class="nav-link" id="mobile-nav-flights">
              <i class="fa-solid fa-plane-departure nav-icon"></i>
              <span>Flights</span>
            </a>

            <!-- Customer Account & Cart -->
            <div class="mobile-nav-section-title">My Account</div>
            <a href="${base}${session ? 'account.html' : 'login.html'}" class="nav-link" id="mobile-nav-account">
              <i class="fa-solid fa-user nav-icon"></i>
              <span>${session ? (session.name || 'Account Dashboard') : 'Sign In / Register'}</span>
            </a>
            <a href="${base}account-wishlist.html" class="nav-link" id="mobile-nav-wishlist">
              <i class="fa-solid fa-heart nav-icon"></i>
              <span>Wishlist</span>
              <span class="mobile-nav-count" id="mobile-nav-wishlist-count" style="${wishlistCount > 0 ? '' : 'display: none;'}">${wishlistCount}</span>
            </a>
            <a href="${base}cart.html" class="nav-link" id="mobile-nav-cart">
              <i class="fa-solid fa-cart-shopping nav-icon"></i>
              <span>Cart</span>
              <span class="mobile-nav-count" id="mobile-nav-cart-count" style="${cartCount > 0 ? '' : 'display: none;'}">${cartCount}</span>
            </a>
            <a href="${base}account-orders.html" class="nav-link" id="mobile-nav-orders">
              <i class="fa-solid fa-truck-fast nav-icon"></i>
              <span>Track Orders</span>
            </a>

            <!-- Merchant / Seller Link -->
            <div class="mobile-nav-section-title">Merchant &amp; Support</div>
            <a href="${base}onboarding/sell-with-us.html" class="nav-link" id="mobile-nav-seller">
              <i class="fa-solid fa-store nav-icon" style="color:var(--primary, #7DBA35);"></i>
              <span style="font-weight:700; color:var(--primary, #7DBA35);">Become a Seller</span>
            </a>

            ${session ? `
            <button type="button" class="nav-link mobile-nav-logout" id="mobile-nav-logout">
              <i class="fa-solid fa-right-from-bracket nav-icon"></i>
              <span>Sign Out</span>
            </button>` : ''}
          </div>
        </nav>
        <div class="main-nav-backdrop" id="main-nav-backdrop"></div>

        <!-- Right Utility Actions -->
        <div class="header-actions">
          <!-- Search Button (Opens Live Search Modal) -->
          <button class="action-btn" id="header-search-btn" data-action="open-search" title="Search Products" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>

          <!-- Account Trigger with Popover -->
          <div class="account-menu-wrap" style="position: relative;">
            <button class="action-btn" id="header-account-btn" title="My Account" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
            <div class="account-dropdown-popover" id="account-dropdown" style="display: none;">
              ${session ? `
                <div class="account-popover-header">
                  <div class="account-user-name">${escapeHTML(userName)}</div>
                  <div class="account-user-role"><span class="badge badge-primary">${escapeHTML(role.toUpperCase())}</span></div>
                </div>
                <div class="account-popover-body">
                  <a href="${base}account.html" class="account-menu-item"><i class="fa-solid fa-user"></i> My Profile</a>
                  <a href="${base}account-orders.html" class="account-menu-item"><i class="fa-solid fa-box"></i> Orders &amp; Tracking</a>
                  <a href="${base}account-wishlist.html" class="account-menu-item"><i class="fa-solid fa-heart"></i> My Wishlist</a>
                  <a href="${base}account-addresses.html" class="account-menu-item"><i class="fa-solid fa-location-dot"></i> Saved Addresses</a>
                  ${role === 'seller' ? `
                    <div class="dropdown-divider"></div>
                    <a href="${base}seller/index.html" class="account-menu-item" style="color:var(--primary); font-weight:700;"><i class="fa-solid fa-store"></i> Seller Dashboard</a>
                    <a href="${base}seller/orders.html" class="account-menu-item"><i class="fa-solid fa-truck-fast"></i> Seller Orders</a>
                  ` : `
                    <div class="dropdown-divider"></div>
                    <a href="${base}onboarding/sell-with-us.html" class="account-menu-item" style="color:var(--primary); font-weight:700;"><i class="fa-solid fa-rocket"></i> Become a Seller</a>
                  `}
                  ${role === 'admin' || role === 'staff' ? `
                    <div class="dropdown-divider"></div>
                    <a href="${base}admin-moderation.html" class="account-menu-item" style="color:var(--danger); font-weight:700;"><i class="fa-solid fa-shield-halved"></i> Admin Portal</a>
                  ` : ''}
                  <div class="dropdown-divider"></div>
                  <button type="button" class="account-menu-item text-danger" id="layout-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
                </div>
              ` : `
                <div class="account-popover-header">
                  <div style="font-weight:700; font-size:14px;">Welcome to AMEZA</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Sign in for orders, wishlist &amp; perks</div>
                </div>
                <div class="account-popover-body">
                  <a href="${base}login.html" class="btn btn-primary btn-sm btn-block" style="width:100%; text-align:center; margin-bottom:8px;">Sign In</a>
                  <a href="${base}signup.html" class="btn btn-secondary btn-sm btn-block" style="width:100%; text-align:center; margin-bottom:12px;">Create Account</a>
                  <div class="dropdown-divider"></div>
                  <a href="${base}account-orders.html" class="account-menu-item"><i class="fa-solid fa-clipboard-list"></i> Track Order</a>
                  <a href="${base}onboarding/sell-with-us.html" class="account-menu-item" style="color:var(--primary); font-weight:700;"><i class="fa-solid fa-store"></i> Sell on AMEZA</a>
                </div>
              `}
            </div>
          </div>

          <!-- Wishlist Trigger -->
          <a href="${base}account-wishlist.html" class="action-btn" title="Wishlist" aria-label="Wishlist" id="header-wishlist-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="badge-count wishlist-count-badge" id="layout-wishlist-count" style="${wishlistCount > 0 ? '' : 'display: none;'}">${wishlistCount}</span>
          </a>

          <!-- Cart Trigger -->
          <a href="${base}cart.html" class="action-btn" title="Shopping Cart" aria-label="Cart" id="header-cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span class="badge-count cart-count-badge" id="layout-cart-count" style="${cartCount > 0 ? '' : 'display: none;'}">${cartCount}</span>
          </a>

          <!-- Mobile Hamburger -->
          <button class="action-btn hamburger-btn" id="header-mobile-toggle" aria-label="Toggle Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </header>

    ${onHomePage ? `
    <!-- 3. Travel & Booking Services Sub-Navigation Bar (Dark Navy - Homepage Only) -->
    <div class="travel-nav-bar" id="travel-nav-bar">
      <div class="container travel-nav-container">
        <div class="services-nav-dropdown" id="services-nav-dropdown">
          <button class="services-nav-btn" id="services-nav-btn" type="button" aria-expanded="false" aria-haspopup="true">
            <i class="fa-solid fa-plane-departure"></i>
            <span>Travel &amp; Booking Services</span>
            <span class="services-btn-pill">Stays &bull; Flights &bull; Cars &bull; Taxis</span>
            <i class="fa-solid fa-chevron-down services-chevron"></i>
          </button>
          <div class="services-menu-dropdown" id="services-menu-dropdown">
            <div class="services-menu-header">
              <span>Explore Services</span>
              <i class="fa-solid fa-compass" style="color: var(--primary, #7DBA35);"></i>
            </div>
            <a href="${base}stays.html" class="services-menu-item">
              <div class="services-item-icon"><i class="fa-solid fa-bed"></i></div>
              <div class="services-item-text">
                <span class="services-item-title">AMEZA Hotels</span>
                <span class="services-item-sub">Hotels, Resorts &amp; Homes</span>
              </div>
            </a>
            <a href="${base}car-rental.html" class="services-menu-item">
              <div class="services-item-icon"><i class="fa-solid fa-car"></i></div>
              <div class="services-item-text">
                <span class="services-item-title">Car rental</span>
                <span class="services-item-sub">Self-drive &amp; Chauffeur</span>
              </div>
            </a>
            <a href="${base}attractions.html" class="services-menu-item">
              <div class="services-item-icon"><i class="fa-solid fa-ticket"></i></div>
              <div class="services-item-text">
                <span class="services-item-title">Attraction</span>
                <span class="services-item-sub">Tours, Activities &amp; Passes</span>
              </div>
            </a>
            <a href="${base}airport-taxis.html" class="services-menu-item">
              <div class="services-item-icon"><i class="fa-solid fa-taxi"></i></div>
              <div class="services-item-text">
                <span class="services-item-title">Airport Taxis</span>
                <span class="services-item-sub">Fast &amp; Reliable Airport Pickups</span>
              </div>
            </a>
            <a href="${base}flights.html" class="services-menu-item">
              <div class="services-item-icon"><i class="fa-solid fa-plane-departure"></i></div>
              <div class="services-item-text">
                <span class="services-item-title">Flight</span>
                <span class="services-item-sub">Worldwide Flight Bookings</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
  `;

  // 2. UNIFIED 4-COLUMN FOOTER MARKUP
  footerMount.innerHTML = `
    <footer class="site-footer" id="main-footer">
      <div class="container footer-container">
        <div class="footer-main-row">
          <!-- Col 1: Brand Info & Support (Semantic <aside>) -->
          <aside class="footer-col footer-col-brand" aria-label="Brand Information">
            <div class="footer-brand-logo">
              <a href="${base}index.html" aria-label="AMEZA Home" style="display:inline-flex; align-items:center; gap:10px; text-decoration:none;">
                <img src="${base}assets/ameza-logo.png" alt="AMEZA" onerror="this.src='${base}assets/logo.png'" style="height:36px; width:auto; object-fit:contain; display:block;">
                <span style="font-family:var(--font-heading, 'Plus Jakarta Sans', sans-serif); font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:-0.5px;">AMEZA</span>
              </a>
            </div>
            <p class="footer-tagline">
              Premium U.S. multi-vendor marketplace connecting verified domestic merchants with shoppers nationwide.
            </p>
            <div class="footer-contact-simple">
              <a href="mailto:support@ameza.com" class="footer-contact-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>support@ameza.com</span>
              </a>
              <a href="tel:18005550123" class="footer-contact-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>1-800-555-0123</span>
              </a>
            </div>
            <div class="footer-social-links" aria-label="Social Media">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="footer-social-btn" title="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="footer-social-btn" title="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" class="footer-social-btn" title="X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="footer-social-btn" title="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.738-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </aside>

          <!-- Col 2: Shop Categories (Semantic <nav>) -->
          <nav class="footer-col footer-col-nav" aria-label="Shop Categories">
            <h4 class="footer-heading">Shop Categories</h4>
            <ul class="footer-links-list">
              <li><a href="${base}shop.html?category=clothing" class="footer-nav-link">Clothing</a></li>
              <li><a href="${base}shop.html?category=electronics" class="footer-nav-link">Electronics</a></li>
              <li><a href="${base}shop.html?category=watches" class="footer-nav-link">Watches</a></li>
              <li><a href="${base}shop.html?category=leather-belts" class="footer-nav-link">Leather Belts</a></li>
              <li><a href="${base}shop.html?category=leather-wallets" class="footer-nav-link">Leather Wallets</a></li>
              <li><a href="${base}shop.html?category=bags" class="footer-nav-link">Bags &amp; Totes</a></li>
              <li><a href="${base}shop.html" class="footer-nav-link" style="color:var(--primary, #7DBA35); font-weight:600;">Browse All Products &rarr;</a></li>
            </ul>
          </nav>

          <!-- Col 3: Customer Care (Semantic <nav>) -->
          <nav class="footer-col footer-col-nav" aria-label="Customer Care">
            <h4 class="footer-heading">Customer Care</h4>
            <ul class="footer-links-list">
              <li><a href="${base}account-orders.html" class="footer-nav-link">Track Your Order</a></li>
              <li><a href="${base}legal/shipping-policy.html" class="footer-nav-link">Shipping &amp; Delivery</a></li>
              <li><a href="${base}legal/returns-policy.html" class="footer-nav-link">Returns &amp; Refunds</a></li>
              <li><a href="${base}account.html" class="footer-nav-link">Help Center &amp; FAQs</a></li>
              <li><a href="${base}account-wishlist.html" class="footer-nav-link">My Wishlist</a></li>
              <li><a href="mailto:support@ameza.com" class="footer-nav-link">Contact Support</a></li>
            </ul>
          </nav>

          <!-- Col 4: Sell & Legal (Semantic <nav>) -->
          <nav class="footer-col footer-col-nav" aria-label="Sell and Legal">
            <h4 class="footer-heading">Sell &amp; Legal</h4>
            <ul class="footer-links-list">
              <li><a href="${base}onboarding/sell-with-us.html" class="footer-nav-link" style="color:var(--primary, #7DBA35); font-weight:600;">Become a Seller</a></li>
              <li><a href="${base}login.html" class="footer-nav-link">Seller Sign In</a></li>
              <li><a href="${base}legal/seller-agreement.html" class="footer-nav-link">Merchant Agreement</a></li>
              <li><a href="${base}legal/privacy.html" class="footer-nav-link">Privacy Policy</a></li>
              <li><a href="${base}legal/terms.html" class="footer-nav-link">Terms of Service</a></li>
              <li><a href="${base}legal/accessibility.html" class="footer-nav-link">Accessibility</a></li>
            </ul>
          </nav>
        </div>

        <!-- Clean Minimalist Bottom Row: Payment Icons + Copyright -->
        <div class="footer-bottom-row">
          <div class="footer-payment-icons" aria-label="Payment Methods">
            <img src="${base}assets/icons/visa.svg" alt="Visa" title="Visa" loading="lazy">
            <img src="${base}assets/icons/mastercard.svg" alt="Mastercard" title="Mastercard" loading="lazy">
            <img src="${base}assets/icons/amex.svg" alt="American Express" title="American Express" loading="lazy">
            <img src="${base}assets/icons/apple-pay.svg" alt="Apple Pay" title="Apple Pay" loading="lazy">
            <img src="${base}assets/icons/google-pay.svg" alt="Google Pay" title="Google Pay" loading="lazy">
            <img src="${base}assets/icons/paypal.svg" alt="PayPal" title="PayPal" loading="lazy">
          </div>
          <div class="footer-copyright">
            &copy; 2026 AMEZA Marketplace Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  `;
  highlightActiveNav();
  const currWrapper = headerMount.querySelector('#global-currency-wrapper') || headerMount.querySelector('.top-bar-currency-wrapper');
  if (currWrapper) {
    renderCurrencyChanger(currWrapper);
  }
}

/**
 * Highlights the current active nav link based on URL and query params.
 */
function highlightActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
    const homeLink = document.getElementById('nav-home');
    if (homeLink) homeLink.classList.add('active');
  } else if (path.includes('shop.html') || path.includes('store.html')) {
    if (search.includes('clothing') || search.includes('apparel')) {
      const el = document.getElementById('nav-clothing');
      if (el) el.classList.add('active');
    } else if (search.includes('electronics') || search.includes('tech')) {
      const el = document.getElementById('nav-electronics');
      if (el) el.classList.add('active');
    } else if (search.includes('watches')) {
      const el = document.getElementById('nav-watches');
      if (el) el.classList.add('active');
    } else if (search.includes('belt') || search.includes('leather-belts')) {
      const el = document.getElementById('nav-leather');
      if (el) el.classList.add('active');
    } else if (search.includes('wallet') || search.includes('leather-wallets')) {
      const el = document.getElementById('nav-wallets');
      if (el) el.classList.add('active');
    } else if (search.includes('bag') || search.includes('totes')) {
      const el = document.getElementById('nav-bags');
      if (el) el.classList.add('active');
    }
  } else if (path.includes('stores.html')) {
    const el = document.getElementById('nav-stores');
    if (el) el.classList.add('active');
  }
}

/**
 * Binds interactivity to layout elements.
 */
function bindLayoutEvents(base) {
  // 1. Account popover dropdown
  const accBtn = document.getElementById('header-account-btn');
  const accDropdown = document.getElementById('account-dropdown');
  const searchBtn = document.getElementById('header-search-btn');

  if (accBtn && accDropdown) {
    accBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.AmezaCurrency && typeof window.AmezaCurrency.closeAllDropdowns === 'function') {
        window.AmezaCurrency.closeAllDropdowns();
      }
      const isVisible = accDropdown.style.display === 'block';
      accDropdown.style.display = isVisible ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!accDropdown.contains(e.target) && e.target !== accBtn) {
        accDropdown.style.display = 'none';
      }
    });
  }

  // 2. Travel & Booking Services dropdown toggle
  const servicesBtn = document.getElementById('services-nav-btn');
  const servicesDropdown = document.getElementById('services-nav-dropdown');
  if (servicesBtn && servicesDropdown) {
    servicesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      servicesDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', (e) => {
      if (!servicesDropdown.contains(e.target)) {
        servicesDropdown.classList.remove('is-open');
      }
    });
  }

  // 3. Search Modal Trigger (Matching Screenshot 2)
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.AmezaCurrency && typeof window.AmezaCurrency.closeAllDropdowns === 'function') {
        window.AmezaCurrency.closeAllDropdowns();
      }
      if (accDropdown) accDropdown.style.display = 'none';
      if (servicesDropdown) servicesDropdown.classList.remove('is-open');

      openSearchModal(base);
    });
  }

  // Also bind any other elements with data-action="open-search"
  document.querySelectorAll('[data-action="open-search"]').forEach(el => {
    if (el !== searchBtn) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal(base);
      });
    }
  });

  // Close modals & flyouts on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.remove('active');
      if (accDropdown) accDropdown.style.display = 'none';
      if (servicesDropdown) servicesDropdown.classList.remove('is-open');
    }
  });

  // Close dropdowns on window scroll
  window.addEventListener('scroll', () => {
    if (accDropdown && accDropdown.style.display === 'block') {
      accDropdown.style.display = 'none';
    }
    if (servicesDropdown && servicesDropdown.classList.contains('is-open')) {
      servicesDropdown.classList.remove('is-open');
    }
  }, { passive: true });

  // 3. Mobile menu drawer toggle
  const mobileToggle = document.getElementById('header-mobile-toggle');
  const navMenu = document.getElementById('main-nav-menu');
  const navBackdrop = document.getElementById('main-nav-backdrop');
  const closeNavBtn = document.getElementById('btn-mobile-nav-close');

  const closeMobileNav = () => {
    if (navMenu) navMenu.classList.remove('nav-menu-open');
    if (navBackdrop) navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  const openMobileNav = () => {
    if (navMenu) {
      navMenu.scrollTop = 0;
      navMenu.classList.add('nav-menu-open');
    }
    if (navBackdrop) navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Delegated click listener to guarantee opening mobile nav even if re-rendered or dynamic
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#header-mobile-toggle, .hamburger-btn, [data-action="mobile-menu-toggle"]');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const menu = document.getElementById('main-nav-menu');
      const backdrop = document.getElementById('main-nav-backdrop');
      if (menu) {
        if (menu.classList.contains('nav-menu-open')) {
          menu.classList.remove('nav-menu-open');
          if (backdrop) backdrop.classList.remove('active');
          document.body.style.overflow = '';
        } else {
          menu.scrollTop = 0;
          menu.classList.add('nav-menu-open');
          if (backdrop) backdrop.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
      return;
    }

    const closeBtn = e.target.closest('#btn-mobile-nav-close, #main-nav-backdrop');
    if (closeBtn) {
      e.preventDefault();
      closeMobileNav();
      return;
    }

    const link = e.target.closest('.main-nav .nav-link');
    if (link && !link.classList.contains('mobile-nav-logout')) {
      closeMobileNav();
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('nav-menu-open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (closeNavBtn) closeNavBtn.addEventListener('click', closeMobileNav);
  if (navBackdrop) navBackdrop.addEventListener('click', closeMobileNav);

  if (navMenu) {
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // Close drawer on Escape and when resizing back to desktop (prevents stuck scroll-lock)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('nav-menu-open')) closeMobileNav();
  });
  const desktopMq = window.matchMedia('(min-width: 1101px)');
  const onMqChange = (mq) => { if (mq.matches) closeMobileNav(); };
  if (desktopMq.addEventListener) desktopMq.addEventListener('change', onMqChange);
  else if (desktopMq.addListener) desktopMq.addListener(onMqChange);

  // Mobile drawer cart link opens the cart drawer (same as header cart icon)
  const mobileCartLink = document.getElementById('mobile-nav-cart');
  if (mobileCartLink) {
    mobileCartLink.addEventListener('click', (e) => {
      const opener = typeof window.openCartDrawer === 'function' ? window.openCartDrawer
        : (window.AmezaCart && typeof window.AmezaCart.open === 'function' ? () => window.AmezaCart.open() : null);
      if (opener) {
        e.preventDefault();
        closeMobileNav();
        opener();
      }
    });
  }

  // Mobile drawer sign out
  const mobileLogout = document.getElementById('mobile-nav-logout');
  if (mobileLogout) {
    mobileLogout.addEventListener('click', () => {
      if (window.AmezaAuth && typeof window.AmezaAuth.logout === 'function') {
        window.AmezaAuth.logout();
      }
      localStorage.removeItem('ameza_session');
      localStorage.removeItem('ameza_auth_token');
      window.location.href = `${base}index.html`;
    });
  }

  // Ensure the account profile pill (rendered by auth.js) exists on EVERY storefront page,
  // so the desktop header matches the homepage exactly.
  if (!window.AmezaAuth && !document.querySelector('script[src*="auth.js"]')) {
    const authScript = document.createElement('script');
    authScript.src = `${base}js/auth.js`;
    document.body.appendChild(authScript);
  }

  // 4. Logout action
  const logoutBtn = document.getElementById('layout-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ameza_session');
      localStorage.removeItem('ameza_auth_token');
      window.location.href = `${base}index.html`;
    });
  }

  // 5. Header Cart Button smooth side-drawer trigger
  const headerCartBtn = document.getElementById('header-cart-btn');
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
      } else if (window.AmezaCart && typeof window.AmezaCart.open === 'function') {
        window.AmezaCart.open();
      } else {
        window.location.href = `${base}cart.html`;
      }
    });
  }

  // 6. Global Back to Top Button interactivity
  const bttBtn = document.getElementById('global-back-to-top');
  if (bttBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        bttBtn.classList.add('is-visible');
      } else {
        bttBtn.classList.remove('is-visible');
      }
    }, { passive: true });
    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 7. Update currency dropdown labels if AmezaCurrency is present
  if (window.AmezaCurrency && typeof window.AmezaCurrency.updateTopBarLabels === 'function') {
    window.AmezaCurrency.updateTopBarLabels();
  }

  // 6. Listen for storage events to update cart and wishlist counters in real time
  window.addEventListener('storage', () => {
    updateBadges();
  });
  window.addEventListener('ameza:cart-updated', () => {
    updateBadges();
  });
  window.addEventListener('ameza:wishlist-updated', () => {
    updateBadges();
  });
}

/**
 * Opens and initializes the full Live Search Modal (matching Screenshot 2).
 */
export function openSearchModal(base = '') {
  let modal = document.getElementById('search-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'search-modal';
    modal.innerHTML = `
      <div class="search-modal-box">
        <div class="search-modal-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="live-search-input" placeholder="Type to search smartwatches, hoodies, belts, bags..." autofocus>
          <button class="btn-close-drawer" data-action="close-search" aria-label="Close search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="search-results-wrap" id="live-search-results"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-action="close-search"]')) {
        modal.classList.remove('active');
      }
    });

    const input = modal.querySelector('#live-search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        renderLiveSearchResultsUI(e.target.value, base);
      });
      // Enter submits a full search on the shop page
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = input.value.trim();
          if (q) window.location.href = `${base}shop.html?q=${encodeURIComponent(q)}`;
        }
      });
    }
  } else {
    modal.querySelectorAll('[data-action="close-search"]').forEach(b => {
      b.onclick = () => modal.classList.remove('active');
    });
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
    const input = modal.querySelector('#live-search-input');
    if (input) {
      input.oninput = (e) => renderLiveSearchResultsUI(e.target.value, base);
    }
  }

  modal.classList.add('active');
  const input = modal.querySelector('#live-search-input');
  if (input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 80);
  }
  renderLiveSearchResultsUI('', base);
}

/**
 * Renders live product search rows in search modal.
 */
function renderLiveSearchResultsUI(query, base = '') {
  const wrap = document.getElementById('live-search-results');
  if (!wrap) return;

  let products = [];
  if (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0) {
    products = window.PRODUCTS;
  } else {
    try {
      const raw = localStorage.getItem('ameza_marketplace_products') || localStorage.getItem('ameza_products');
      if (raw) products = JSON.parse(raw);
    } catch (e) {}
  }

  const q = (query || '').trim().toLowerCase();
  let filtered = products;
  if (q) {
    filtered = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    wrap.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted, #64748B);">
        <p style="font-weight: 700; font-size: 1.1rem; color: #0F172A; margin-bottom: 6px;">No products found</p>
        <p style="font-size: 0.85rem;">Try searching for "Tote", "Belt", "Watch", "Speaker", or "Wallet".</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = filtered.slice(0, 12).map(p => {
    const id = p.id || p.productId || '';
    const name = escapeHTML(p.name || p.title || 'Product');
    const category = escapeHTML((p.category || 'Product').toUpperCase());
    const priceCents = Number(p.priceCents !== undefined ? p.priceCents : p.price) || 0;
    const priceStr = formatMoney(priceCents);
    const img = escapeHTML(p.image || p.imageUrl || `${base}assets/products/placeholder.jpg`);

    return `
      <div class="search-item-row" data-product-id="${escapeHTML(id)}" style="display:flex; align-items:center; gap:14px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all 0.15s ease;">
        <div class="search-item-thumb" style="width:48px; height:48px; border-radius:8px; overflow:hidden; background:#F1F5F9; flex-shrink:0;">
          <img src="${img}" alt="${name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${base}assets/products/leather-belt-1.jpg'">
        </div>
        <div style="flex-grow: 1;">
          <div style="font-size: 0.72rem; font-weight: 700; color: #7DBA35; text-transform: uppercase;">${category}</div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #0F172A;">${name}</div>
        </div>
        <div style="font-size: 0.95rem; font-weight: 800; color: #0F172A;">${priceStr}</div>
      </div>
    `;
  }).join('');

  wrap.querySelectorAll('.search-item-row').forEach(row => {
    row.addEventListener('click', () => {
      const pid = row.getAttribute('data-product-id');
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.remove('active');
      window.location.href = `${base}product.html?id=${encodeURIComponent(pid)}`;
    });
  });
}

function updateBadges() {
  const cartBadge = document.getElementById('layout-cart-count');
  if (cartBadge) {
    const count = getCartCount();
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? '' : 'none';
  }
  const wishBadge = document.getElementById('layout-wishlist-count');
  if (wishBadge) {
    const count = getWishlistCount();
    wishBadge.textContent = count;
    wishBadge.style.display = count > 0 ? '' : 'none';
  }
  const mCart = document.getElementById('mobile-nav-cart-count');
  if (mCart) {
    const count = getCartCount();
    mCart.textContent = count;
    mCart.style.display = count > 0 ? '' : 'none';
  }
  const mWish = document.getElementById('mobile-nav-wishlist-count');
  if (mWish) {
    const count = getWishlistCount();
    mWish.textContent = count;
    mWish.style.display = count > 0 ? '' : 'none';
  }
}

// Auto-initialize layout on DOMContentLoaded if not already initialized
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLayout());
  } else {
    initLayout();
  }
}
