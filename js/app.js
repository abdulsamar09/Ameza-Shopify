/**
 * AMEZA Premium E-Commerce Application Engine
 * Inventory Source: wc-products-all-2026-09-16.csv
 */

import { CATEGORIES, PRODUCTS, PROMOTIONAL_BANNERS } from './products-data.js';

// Application State
const state = {
  cart: JSON.parse(localStorage.getItem('ameza_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('ameza_wishlist')) || [],
  activeCategory: 'all',
  searchQuery: '',
  appliedCoupon: null,
  activeProductModal: null,
  user: {
    isLoggedIn: false,
    name: 'Guest User',
    orders: [
      {
        id: 'AMZ-89241',
        date: '2026-09-10',
        total: 139.98,
        status: 'Delivered',
        items: ['365 All Leather Tote', 'Saddle Belt']
      }
    ]
  }
};

// SVG Icon Helpers
const ICONS = {
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  heart: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartFilled: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  cart: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  eye: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

// Price Formatter (uses AmezaCurrency if available)
function formatPrice(amount) {
  if (window.AmezaCurrency && typeof window.AmezaCurrency.format === 'function') {
    return window.AmezaCurrency.format(amount);
  }
  return '$' + (Number(amount) || 0).toFixed(2);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  renderLimitedDeals();
  renderWishlistPage();
  setupEventListeners();
  updateBadges();
  startCountdownTimers();

  // Listen to currency changes and re-render product grids & drawers
  window.addEventListener('ameza:currency-changed', () => {
    renderProducts();
    renderLimitedDeals();
    renderCartDrawer();
    renderWishlistDrawer();
    renderWishlistPage();
  });
});

/* ==========================================================================
   RENDER FUNCTIONS
   ========================================================================== */

function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card ${state.activeCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
      <div class="category-img-wrap">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy">
      </div>
      <h3 class="category-name">${cat.name}</h3>
      <span class="category-count">${cat.count}</span>
    </div>
  `).join('');
}

function renderProducts() {
  // 1. Electronics & Watches
  const elWatchContainer = document.getElementById('grid-electronics-watches');
  if (elWatchContainer) {
    const elProducts = PRODUCTS.filter(p => p.section === 'electronics-watches');
    elWatchContainer.innerHTML = elProducts.slice(0, 10).map(createProductCardHTML).join('');
  }

  // 2. Clothes & Fashion
  const clothesContainer = document.getElementById('grid-clothes-jewellery');
  if (clothesContainer) {
    const clothesProducts = PRODUCTS.filter(p => p.section === 'clothes-jewellery');
    clothesContainer.innerHTML = clothesProducts.slice(0, 10).map(createProductCardHTML).join('');
  }

  // 3. Leather Collection
  const leatherContainer = document.getElementById('grid-leather-collection');
  if (leatherContainer) {
    const leatherProducts = PRODUCTS.filter(p => p.section === 'leather-collection');
    leatherContainer.innerHTML = leatherProducts.slice(0, 10).map(createProductCardHTML).join('');
  }

  // 4. Latest Range & Bags
  const latestContainer = document.getElementById('grid-latest-range');
  if (latestContainer) {
    const latestProducts = PRODUCTS.filter(p => p.section === 'latest-range');
    latestContainer.innerHTML = latestProducts.slice(0, 12).map(createProductCardHTML).join('');
  }
}

function createProductCardHTML(p) {
  const isWish = state.wishlist.some(w => w.id === p.id);
  const badgeClass = p.badge === 'HOT DEAL' ? 'badge-discount' : (p.badge === 'NEW' ? 'badge-tag' : 'badge-special');

  return `
    <div class="product-card" data-product-id="${p.id}">
      <div class="product-img-wrap">
        <div class="card-badges">
          ${p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : ''}
          ${p.discount ? `<span class="badge badge-discount">${p.discount}</span>` : ''}
        </div>

        <button class="btn-wishlist ${isWish ? 'active' : ''}" data-action="toggle-wishlist" data-product-id="${p.id}" title="${isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${isWish ? ICONS.heartFilled : ICONS.heart}
        </button>

        <img src="${p.image}" alt="${p.name}" loading="lazy" data-action="quick-view" data-product-id="${p.id}">
        
        <button class="quick-view-btn" data-action="quick-view" data-product-id="${p.id}">
          ${ICONS.eye} Quick View
        </button>
      </div>

      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name" title="${p.name}" data-action="quick-view" data-product-id="${p.id}">${p.name}</h3>
        <div class="product-rating">
          <div class="stars">
            ${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}
          </div>
          <span class="rating-num">${p.rating}</span>
          <span class="review-count">(${p.reviews})</span>
        </div>
      </div>

      <div class="product-bottom">
        <div class="price-wrap">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <button class="btn-add-cart" data-action="add-cart" data-product-id="${p.id}">
          ${ICONS.cart} Add
        </button>
      </div>
    </div>
  `;
}

function renderLimitedDeals() {
  const dealsContainer = document.getElementById('grid-limited-deals');
  if (!dealsContainer) return;

  const dealProducts = PRODUCTS.filter(p => p.isDeal).slice(0, 4);
  dealsContainer.innerHTML = dealProducts.map(createProductCardHTML).join('');
}

/* ==========================================================================
   EVENT LISTENERS & DISPATCHER
   ========================================================================== */

function setupEventListeners() {
  // Delegate all clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const productId = target.getAttribute('data-product-id');

    switch (action) {
      case 'open-cart':
        toggleCartDrawer(true);
        break;
      case 'close-cart':
        toggleCartDrawer(false);
        break;
      case 'open-wishlist':
        toggleWishlistDrawer(true);
        break;
      case 'close-wishlist':
        toggleWishlistDrawer(false);
        break;
      case 'open-search':
        toggleSearchModal(true);
        break;
      case 'close-search':
        toggleSearchModal(false);
        break;
      case 'open-account':
        // Redirect to account system (auth.js handles login state)
        // Check localStorage session instead of importing auth.js module
        (function() {
          try {
            const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
            if (session && session.expiresAt && Date.now() < session.expiresAt) {
              window.location.href = 'account.html';
            } else {
              window.location.href = 'login.html';
            }
          } catch(err) {
            window.location.href = 'login.html';
          }
        })();
        break;
      case 'close-account':
        toggleAccountModal(false);
        break;
      case 'open-checkout':
        toggleCartDrawer(false);
        toggleCheckoutModal(true);
        break;
      case 'close-checkout':
        toggleCheckoutModal(false);
        break;
      case 'close-quick-view':
        toggleQuickViewModal(false);
        break;
      case 'quick-view':
        if (productId) openQuickView(productId);
        break;
      case 'add-cart':
        if (productId) addToCart(productId);
        break;
      case 'toggle-wishlist':
        if (productId) toggleWishlist(productId);
        break;
      case 'open-wishlist-page':
        openWishlistPage();
        break;
      case 'close-wishlist-page':
        closeWishlistPage();
        break;
      case 'wishlist-move-all':
        moveAllWishlistToCart();
        break;
      case 'wishlist-clear-all':
        clearWishlist();
        break;
      case 'clear-search-filter':
        clearSearchFilter();
        break;
      case 'filter-category':
        const cat = target.getAttribute('data-category');
        if (cat) filterByCategory(cat);
        break;
      case 'scroll-section':
        const secId = target.getAttribute('data-target');
        const el = document.getElementById(secId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        const mobileMenu = document.getElementById('mobile-nav-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
        }
        break;
      case 'mobile-menu-toggle':
        toggleMobileMenu();
        break;
    }
  });

  // Category Cards Click
  const categoriesContainer = document.getElementById('categories-container');
  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.category-card');
      if (card) {
        const cat = card.getAttribute('data-category');
        filterByCategory(cat);
      }
    });
  }

  // Hero Search Form & Dropdowns
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroCategorySelect = document.getElementById('hero-category-select');
  const heroPriceSelect = document.getElementById('hero-price-select');

  function triggerHeroSearch(shouldScroll = true) {
    const query = heroSearchInput ? heroSearchInput.value.trim() : '';
    const cat = heroCategorySelect ? heroCategorySelect.value : 'all';
    const price = heroPriceSelect ? heroPriceSelect.value : 'all';
    executeSearch(query, cat, price, shouldScroll);
  }

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => triggerHeroSearch(true));
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        triggerHeroSearch(true);
      }
    });
    // Debounced live typing update
    let debounceTimer;
    heroSearchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (e.target.value.trim().length >= 2 || e.target.value.trim().length === 0) {
          triggerHeroSearch(false);
        }
      }, 300);
    });
  }

  if (heroCategorySelect) {
    heroCategorySelect.addEventListener('change', () => triggerHeroSearch(true));
  }

  if (heroPriceSelect) {
    heroPriceSelect.addEventListener('change', () => triggerHeroSearch(true));
  }

  // Live Search Input in Modal
  const liveSearchInput = document.getElementById('live-search-input');
  if (liveSearchInput) {
    liveSearchInput.addEventListener('input', (e) => {
      renderLiveSearchResults(e.target.value);
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        showToast(`🎉 Thank you for subscribing! Welcome code sent to ${emailInput.value}`);
        emailInput.value = '';
      }
    });
  }

  // Cart Coupon
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener('click', applyCouponCode);
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

/* ==========================================================================
   CART ENGINE
   ========================================================================== */

function addToCart(productId, quantity = 1, options = {}) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = state.cart.findIndex(
    item => item.id === productId && JSON.stringify(item.options) === JSON.stringify(options)
  );

  if (existingItemIndex > -1) {
    state.cart[existingItemIndex].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity,
      options: options
    });
  }

  saveCart();
  updateBadges();
  renderCartDrawer();
  showToast(`🛒 "${product.name}" added to cart!`);
  toggleCartDrawer(true);
}

function updateCartItemQty(index, change) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += change;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
    showToast('🗑️ Item removed from cart');
  }
  saveCart();
  updateBadges();
  renderCartDrawer();
}

function removeCartItem(index) {
  if (!state.cart[index]) return;
  state.cart.splice(index, 1);
  saveCart();
  updateBadges();
  renderCartDrawer();
  showToast('🗑️ Item removed from cart');
}

function saveCart() {
  localStorage.setItem('ameza_cart', JSON.stringify(state.cart));
}

function renderCartDrawer() {
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const shippingFill = document.getElementById('shipping-progress-fill');
  const shippingText = document.getElementById('shipping-meter-text');

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-state">
        ${ICONS.cart}
        <p style="font-weight: 700; font-size: 1.1rem; color: var(--dark); margin-bottom: 6px;">Your cart is empty</p>
        <p style="font-size: 0.85rem;">Discover our authentic collection and start shopping today.</p>
        <button class="btn-primary" data-action="close-cart" style="margin-top: 18px; width: 100%;">
          Start Shopping
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    if (shippingFill) shippingFill.style.width = '0%';
    if (shippingText) shippingText.textContent = 'Add $100.00 more for FREE Express Shipping!';
    return;
  }

  let subtotal = 0;
  itemsContainer.innerHTML = state.cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    const variantText = Object.entries(item.options || {}).map(([k, v]) => `${k}: ${v}`).join(' | ');

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          ${variantText ? `<div class="cart-item-variant">${variantText}</div>` : ''}
          <div class="cart-item-price">${formatPrice(itemTotal)}</div>
          <div class="flex items-center justify-between" style="margin-top: 8px;">
            <div class="cart-qty-controls">
              <button class="qty-btn" onclick="window.amezaApp.updateCartItemQty(${idx}, -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="window.amezaApp.updateCartItemQty(${idx}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="window.amezaApp.removeCartItem(${idx})" title="Remove">
              ${ICONS.trash}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Discount / Coupons
  let discount = 0;
  if (state.appliedCoupon === 'AMEZA20') {
    discount = subtotal * 0.20;
  }

  const finalTotal = Math.max(0, subtotal - discount);

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(finalTotal);

  // Free shipping progress ($100 target)
  const freeShipThreshold = 100;
  const progress = Math.min(100, (subtotal / freeShipThreshold) * 100);
  if (shippingFill) shippingFill.style.width = `${progress}%`;
  if (shippingText) {
    if (subtotal >= freeShipThreshold) {
      shippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You qualified for <strong>FREE Shipping</strong>!`;
    } else {
      const remaining = freeShipThreshold - subtotal;
      shippingText.textContent = `Add ${formatPrice(remaining)} more for FREE Express Shipping!`;
    }
  }
}

function applyCouponCode() {
  const input = document.getElementById('cart-coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'AMEZA20') {
    state.appliedCoupon = 'AMEZA20';
    showToast('🏷️ Promo code AMEZA20 applied! 20% discount added.');
    renderCartDrawer();
  } else if (code === 'FREESHIP') {
    state.appliedCoupon = 'FREESHIP';
    showToast('🚚 Free shipping coupon applied!');
    renderCartDrawer();
  } else {
    showToast('⚠️ Invalid coupon code. Try "AMEZA20" for 20% off.');
  }
}

/* ==========================================================================
   WISHLIST ENGINE & DEDICATED VIEW
   ========================================================================== */

function toggleWishlist(productId) {
  if (!productId) return;
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  const idx = state.wishlist.findIndex(w => String(w.id) === String(productId));

  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast(`🤍 Removed "<strong>${product.name}</strong>" from wishlist`);
  } else {
    state.wishlist.push(product);
    showToast(`❤️ Saved "<strong>${product.name}</strong>" to your wishlist!`);
  }

  localStorage.setItem('ameza_wishlist', JSON.stringify(state.wishlist));
  
  // 1. Update badges (Header + Mobile nav)
  updateBadges();

  // 2. Re-render all grids so heart icons toggle active state with animation
  renderProducts();
  renderLimitedDeals();
  renderWishlistDrawer();
  renderWishlistPage();

  // 3. Update quick view modal heart if open
  const modalWishBtn = document.querySelector('.btn-wishlist-modal');
  if (modalWishBtn && state.activeProductModal) {
    const isWishModal = state.wishlist.some(w => String(w.id) === String(state.activeProductModal.id));
    modalWishBtn.classList.toggle('active', isWishModal);
  }
}

function renderWishlistDrawer() {
  const container = document.getElementById('wishlist-items-container');
  const footer = document.getElementById('wishlist-drawer-footer');
  const countEl = document.getElementById('wishlist-drawer-count');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${state.wishlist.length} item${state.wishlist.length === 1 ? '' : 's'}`;
  }

  if (state.wishlist.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        ${ICONS.heart}
        <p style="font-weight: 700; font-size: 1.1rem; color: var(--dark); margin-bottom: 6px;">Your Wishlist is Empty</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 18px;">Click the heart icon on any product to save your favorites here.</p>
        <button class="btn-primary" style="padding: 10px 20px; font-size: 0.85rem;" onclick="window.amezaApp.toggleWishlistDrawer(false)">
          Continue Shopping &rarr;
        </button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  container.innerHTML = state.wishlist.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-img" style="cursor: pointer;" onclick="window.amezaApp.openQuickView('${item.id}'); window.amezaApp.toggleWishlistDrawer(false);">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title" style="cursor: pointer;" onclick="window.amezaApp.openQuickView('${item.id}'); window.amezaApp.toggleWishlistDrawer(false);">${item.name}</h4>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="flex items-center justify-between" style="margin-top: 10px;">
          <button class="btn-primary" style="padding: 7px 14px; font-size: 0.78rem;" onclick="window.amezaApp.moveWishlistToCart('${item.id}', ${idx})">
            ${ICONS.cart} Move to Cart
          </button>
          <button class="cart-item-remove" onclick="window.amezaApp.toggleWishlist('${item.id}')" title="Remove from wishlist">
            ${ICONS.trash}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderWishlistPage() {
  const section = document.getElementById('section-wishlist');
  const grid = document.getElementById('grid-wishlist-page');
  const empty = document.getElementById('wishlist-empty-page');
  const countSpan = document.getElementById('wishlist-page-count');
  const moveAllBtn = document.getElementById('btn-wishlist-page-move-all');
  const clearBtn = document.getElementById('btn-wishlist-page-clear');

  if (!section || !grid) return;

  if (countSpan) countSpan.textContent = state.wishlist.length;

  if (state.wishlist.length === 0) {
    grid.innerHTML = '';
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    if (moveAllBtn) moveAllBtn.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.style.display = 'grid';
  if (moveAllBtn) moveAllBtn.style.display = 'inline-flex';
  if (clearBtn) clearBtn.style.display = 'inline-flex';

  grid.innerHTML = state.wishlist.map(createProductCardHTML).join('');
}

function openWishlistPage() {
  const section = document.getElementById('section-wishlist');
  if (section) {
    section.style.display = 'block';
    renderWishlistPage();
    section.scrollIntoView({ behavior: 'smooth' });
  }
  toggleWishlistDrawer(false);
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
  }
}

function closeWishlistPage() {
  const section = document.getElementById('section-wishlist');
  if (section) {
    section.style.display = 'none';
  }
}

function moveWishlistToCart(productId, idx) {
  addToCart(productId);
  const productIdx = typeof idx === 'number' ? idx : state.wishlist.findIndex(w => String(w.id) === String(productId));
  if (productIdx > -1) {
    state.wishlist.splice(productIdx, 1);
  }
  localStorage.setItem('ameza_wishlist', JSON.stringify(state.wishlist));
  updateBadges();
  renderProducts();
  renderLimitedDeals();
  renderWishlistDrawer();
  renderWishlistPage();
}

function moveAllWishlistToCart() {
  if (state.wishlist.length === 0) {
    showToast('🤍 Your wishlist is empty');
    return;
  }
  const count = state.wishlist.length;
  state.wishlist.forEach(item => {
    addToCart(item.id);
  });
  state.wishlist = [];
  localStorage.setItem('ameza_wishlist', JSON.stringify(state.wishlist));
  updateBadges();
  renderProducts();
  renderLimitedDeals();
  renderWishlistDrawer();
  renderWishlistPage();
  toggleWishlistDrawer(false);
  toggleCartDrawer(true);
  showToast(`🎉 Moved ${count} item${count > 1 ? 's' : ''} to your cart!`);
}

function clearWishlist() {
  if (state.wishlist.length === 0) return;
  state.wishlist = [];
  localStorage.setItem('ameza_wishlist', JSON.stringify(state.wishlist));
  updateBadges();
  renderProducts();
  renderLimitedDeals();
  renderWishlistDrawer();
  renderWishlistPage();
  showToast('🤍 Wishlist cleared');
}

/* ==========================================================================
   QUICK VIEW & PRODUCT MODAL (Single-View / Zero-Scroll)
   ========================================================================== */

function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  state.activeProductModal = product;
  const modalContainer = document.getElementById('product-modal-content');
  if (!modalContainer) return;

  const isWish = state.wishlist.some(w => w.id === product.id);

  // Gallery thumbnails if multiple
  const galleryThumbs = (product.images && product.images.length > 1) ? `
    <div style="display: flex; gap: 6px; margin-top: 8px;">
      ${product.images.slice(0, 4).map((img, i) => `
        <div style="width: 44px; height: 44px; border-radius: 6px; border: 1px solid var(--border); overflow: hidden; cursor: pointer; padding: 2px;" onclick="document.getElementById('modal-img-display').src='${img}'">
          <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `).join('')}
    </div>
  ` : '';

  modalContainer.innerHTML = `
    <div class="product-modal-grid">
      <div class="modal-gallery">
        <div class="modal-main-img">
          <img id="modal-img-display" src="${product.image}" alt="${product.name}">
        </div>
        ${galleryThumbs}
      </div>

      <div class="modal-details">
        <span class="modal-cat">${product.category}</span>
        <h2 class="modal-title">${product.name}</h2>

        <div class="product-rating">
          <div class="stars">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span class="rating-num">${product.rating}</span>
          <span class="review-count">(${product.reviews} Reviews)</span>
        </div>

        <div class="modal-price-wrap">
          <span class="modal-price-current">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="modal-price-old">${formatPrice(product.oldPrice)}</span>` : ''}
          ${product.discount ? `<span class="badge badge-discount">${product.discount}</span>` : ''}
        </div>

        <p class="modal-desc">${product.description}</p>

        ${product.colors ? `
          <div class="variant-group">
            <span class="variant-label">Color: <strong id="selected-color-label">${product.colors[0]}</strong></span>
            <div class="variant-options" id="modal-color-options">
              ${product.colors.map((c, i) => `
                <button class="variant-chip ${i === 0 ? 'active' : ''}" onclick="window.amezaApp.selectVariantColor('${c}', this)">${c}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${product.sizes ? `
          <div class="variant-group">
            <span class="variant-label">Size: <strong id="selected-size-label">${product.sizes[0]}</strong></span>
            <div class="variant-options" id="modal-size-options">
              ${product.sizes.map((s, i) => `
                <button class="variant-chip ${i === 0 ? 'active' : ''}" onclick="window.amezaApp.selectVariantSize('${s}', this)">${s}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${product.features ? `
          <div class="modal-highlights-box">
            <ul class="modal-highlights-list">
              ${product.features.slice(0, 3).map(f => `<li>${ICONS.check} ${f}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="modal-actions">
          <div class="modal-qty">
            <button onclick="window.amezaApp.changeModalQty(-1)">-</button>
            <span id="modal-qty-val">1</span>
            <button onclick="window.amezaApp.changeModalQty(1)">+</button>
          </div>
          <button class="btn-modal-add" onclick="window.amezaApp.submitModalAddCart()">
            ${ICONS.cart} Add to Cart
          </button>
          <button class="btn-wishlist-modal ${isWish ? 'active' : ''}" onclick="window.amezaApp.toggleWishlist('${product.id}')" title="Wishlist">
            ${isWish ? ICONS.heartFilled : ICONS.heart}
          </button>
        </div>

        <button class="btn-modal-buynow" onclick="window.amezaApp.buyNowDirect()">
          ⚡ Buy Now (Instant Checkout)
        </button>
      </div>
    </div>
  `;

  toggleQuickViewModal(true);
}

let modalCurrentQty = 1;
let selectedColor = '';
let selectedSize = '';

function changeModalQty(delta) {
  modalCurrentQty = Math.max(1, modalCurrentQty + delta);
  const el = document.getElementById('modal-qty-val');
  if (el) el.textContent = modalCurrentQty;
}

function selectVariantColor(color, btn) {
  selectedColor = color;
  const label = document.getElementById('selected-color-label');
  if (label) label.textContent = color;
  const container = document.getElementById('modal-color-options');
  if (container) {
    container.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }
}

function selectVariantSize(size, btn) {
  selectedSize = size;
  const label = document.getElementById('selected-size-label');
  if (label) label.textContent = size;
  const container = document.getElementById('modal-size-options');
  if (container) {
    container.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }
}

function submitModalAddCart() {
  if (!state.activeProductModal) return;
  const options = {};
  if (state.activeProductModal.colors) {
    options.Color = selectedColor || state.activeProductModal.colors[0];
  }
  if (state.activeProductModal.sizes) {
    options.Size = selectedSize || state.activeProductModal.sizes[0];
  }

  addToCart(state.activeProductModal.id, modalCurrentQty, options);
  toggleQuickViewModal(false);
  modalCurrentQty = 1;
}

function buyNowDirect() {
  submitModalAddCart();
  toggleCartDrawer(false);
  toggleCheckoutModal(true);
}

/* ==========================================================================
   SEARCH & FILTERING
   ========================================================================== */

function filterByCategory(slug, shouldScroll = true) {
  state.activeCategory = slug;
  
  // Sync Hero Category select
  const heroCatSelect = document.getElementById('hero-category-select');
  if (heroCatSelect) {
    heroCatSelect.value = slug || 'all';
  }

  // Sync Shortcut Pills
  const pills = document.querySelectorAll('.shortcut-pill');
  pills.forEach(pill => {
    if (pill.getAttribute('data-category') === slug) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  renderCategories();

  const priceRange = document.getElementById('hero-price-select')?.value || 'all';
  const query = document.getElementById('hero-search-input')?.value.trim() || '';

  executeSearch(query, slug, priceRange, shouldScroll);
}

function clearSearchFilter() {
  state.activeCategory = 'all';

  const heroSearchInput = document.getElementById('hero-search-input');
  const heroCategorySelect = document.getElementById('hero-category-select');
  const heroPriceSelect = document.getElementById('hero-price-select');

  if (heroSearchInput) heroSearchInput.value = '';
  if (heroCategorySelect) heroCategorySelect.value = 'all';
  if (heroPriceSelect) heroPriceSelect.value = 'all';

  const pills = document.querySelectorAll('.shortcut-pill');
  pills.forEach(pill => pill.classList.remove('active'));

  const searchSec = document.getElementById('section-search-results');
  if (searchSec) {
    searchSec.style.display = 'none';
  }

  renderCategories();
  showToast(`✨ Filters cleared — Showing full catalog`);
}

function executeSearch(query = '', category = 'all', priceRange = 'all', shouldScroll = false) {
  let results = [...PRODUCTS];

  // 1. Query Filter
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(q))) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (category && category !== 'all') {
    const targetCat = category.toLowerCase().replace(/[\s&]+/g, '-');
    results = results.filter(p => {
      const pSlug = (p.categorySlug || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase().replace(/[\s&]+/g, '-');
      return pSlug === targetCat || pCat === targetCat || pSlug.includes(targetCat) || targetCat.includes(pSlug);
    });
  }

  // 3. Price Filter
  if (priceRange && priceRange !== 'all') {
    if (priceRange === '0-50') {
      results = results.filter(p => p.price <= 50);
    } else if (priceRange === '50-100') {
      results = results.filter(p => p.price >= 50 && p.price <= 100);
    } else if (priceRange === '100+') {
      results = results.filter(p => p.price > 100);
    }
  }

  // Sync active shortcut pill UI
  const pills = document.querySelectorAll('.shortcut-pill');
  pills.forEach(pill => {
    if (category !== 'all' && pill.getAttribute('data-category') === category) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Check if any filter is active
  const isFilterActive = (query && query.trim() !== '') || (category && category !== 'all') || (priceRange && priceRange !== 'all');

  const searchSec = document.getElementById('section-search-results');
  const searchGrid = document.getElementById('grid-search-results');
  const searchEmpty = document.getElementById('search-empty-state');
  const searchHeading = document.getElementById('search-results-heading');
  const searchSubtext = document.getElementById('search-results-subtext');

  if (searchSec) {
    if (isFilterActive) {
      searchSec.style.display = 'block';

      // Build friendly heading and summary
      let titleText = 'Filtered Results';
      if (query) {
        titleText = `Results for "${query}"`;
      } else if (category && category !== 'all') {
        const catObj = CATEGORIES.find(c => c.slug === category || c.id === category);
        titleText = catObj ? `${catObj.name} Collection` : `${category.replace(/-/g, ' ')} Collection`;
      }

      let filterSummary = [];
      if (query) filterSummary.push(`Query: "${query}"`);
      if (category && category !== 'all') filterSummary.push(`Category: ${category.replace(/-/g, ' ')}`);
      if (priceRange && priceRange !== 'all') {
        filterSummary.push(`Price: ${priceRange === '0-50' ? 'Under $50' : priceRange === '50-100' ? '$50–$100' : '$100+'}`);
      }

      if (searchHeading) searchHeading.textContent = titleText;
      if (searchSubtext) {
        searchSubtext.textContent = `Found ${results.length} product${results.length === 1 ? '' : 's'} matching criteria (${filterSummary.join(' • ')})`;
      }

      if (results.length > 0) {
        if (searchGrid) {
          searchGrid.style.display = 'grid';
          searchGrid.innerHTML = results.map(createProductCardHTML).join('');
        }
        if (searchEmpty) searchEmpty.style.display = 'none';
      } else {
        if (searchGrid) {
          searchGrid.style.display = 'none';
          searchGrid.innerHTML = '';
        }
        if (searchEmpty) searchEmpty.style.display = 'block';
      }

      if (shouldScroll) {
        setTimeout(() => {
          searchSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    } else {
      searchSec.style.display = 'none';
    }
  }

  return results;
}

function renderLiveSearchResults(query) {
  const resultsContainer = document.getElementById('live-search-results');
  if (!resultsContainer) return;

  const q = query.trim().toLowerCase();
  let results = PRODUCTS;

  if (q) {
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <p style="font-weight: 700; font-size: 1.1rem; color: var(--dark); margin-bottom: 6px;">No products found</p>
        <p style="font-size: 0.85rem;">Try searching for "Tote", "Belt", "Watch", "Speaker", or "Wallet".</p>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = results.slice(0, 15).map(p => `
      <div class="search-item-row" onclick="window.amezaApp.openProductFromSearch('${p.id}')">
        <div class="search-item-thumb">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div style="flex-grow: 1;">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-dark); text-transform: uppercase;">${p.category}</div>
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--dark);">${p.name}</div>
        </div>
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--dark);">${formatPrice(p.price)}</div>
      </div>
    `).join('');
  }
}

function openProductFromSearch(productId) {
  toggleSearchModal(false);
  openQuickView(productId);
}

/* ==========================================================================
   CHECKOUT SIMULATOR & ACCOUNT
   ========================================================================== */

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const orderId = 'AMZ-' + Math.floor(100000 + Math.random() * 900000);

  // Compute final amount
  let subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = state.appliedCoupon === 'AMEZA20' ? subtotal * 0.20 : 0;
  let total = Math.max(0, subtotal - discount);

  const checkoutCard = document.getElementById('checkout-modal-content');
  if (checkoutCard) {
    checkoutCard.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="width: 68px; height: 68px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 2px solid var(--primary);">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="font-size: 1.7rem; font-weight: 800; color: var(--dark); margin-bottom: 6px;">Order Confirmed!</h2>
        <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 18px;">Thank you for shopping with AMEZA. Your order <strong>#${orderId}</strong> has been placed successfully.</p>
        
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; max-width: 420px; margin: 0 auto 24px; text-align: left;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Order Total:</span>
            <span style="font-weight: 800; color: var(--dark);">${formatPrice(total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
            <span style="color: var(--text-muted);">Payment:</span>
            <span style="font-weight: 700; color: var(--success);">Paid / Verified</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Estimated Delivery:</span>
            <span style="font-weight: 700; color: var(--dark);">2-4 Business Days</span>
          </div>
        </div>

        <button class="btn-primary" onclick="window.amezaApp.finishCheckoutOrder('${orderId}', ${total})">
          Continue Shopping
        </button>
      </div>
    `;
  }

  showToast(`🎉 Order #${orderId} completed successfully!`);
}

function finishCheckoutOrder(orderId, total) {
  // Legacy state (kept for backward compatibility)
  state.user.orders.unshift({
    id: orderId,
    date: new Date().toISOString().split('T')[0],
    total: total,
    status: 'Processing',
    items: state.cart.map(i => i.name)
  });

  // Persist to ameza_orders_{userId} so account order history works
  try {
    const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
    if (session && session.userId && session.expiresAt && Date.now() < session.expiresAt) {
      const key = `ameza_orders_${session.userId}`;
      const orders = JSON.parse(localStorage.getItem(key) || '[]');
      const checkoutForm = document.getElementById('checkout-form');
      const formData = checkoutForm ? new FormData(checkoutForm) : null;
      const newOrder = {
        id: orderId,
        status: 'Processing',
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        shippingAddress: checkoutForm
          ? (checkoutForm.querySelector('input[placeholder="123 Luxury Avenue, Suite 400"]')?.value || 'On file')
          : 'On file',
        subtotal: total,
        shipping: 0,
        total: total,
        items: state.cart.map(i => ({
          id: i.id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity || 1,
          size: i.selectedSize || i.size || '',
          color: i.selectedColor || i.color || '',
        })),
        createdAt: Date.now(),
        date: new Date().toLocaleDateString('en-US'),
      };
      orders.unshift(newOrder);
      localStorage.setItem(key, JSON.stringify(orders));
    }
  } catch(err) {
    // Not logged in or auth error — order only saved to legacy state
  }

  state.cart = [];
  state.appliedCoupon = null;
  saveCart();
  updateBadges();
  toggleCheckoutModal(false);
}

function renderAccountDetails() {
  const container = document.getElementById('account-modal-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 24px;">
      <div class="flex items-center gap-4" style="gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; border: 2px solid var(--primary);">
          A
        </div>
        <div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--dark);">Welcome to AMEZA</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Premium Member &bull; Fast Checkout Enabled</p>
        </div>
      </div>

      <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 12px; color: var(--dark);">Recent Orders</h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${state.user.orders.map(o => `
          <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px;">
            <div class="flex justify-between items-center" style="margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 0.88rem; color: var(--dark);">#${o.id}</span>
              <span class="badge" style="background: var(--primary); font-size: 0.65rem;">${o.status}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Placed on ${o.date} &bull; Total: $${o.total.toFixed(2)}</div>
            <div style="font-size: 0.78rem; color: var(--text-main);">${o.items.join(', ')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODAL & DRAWER TOGGLES
   ========================================================================== */

function toggleCartDrawer(open) {
  const backdrop = document.getElementById('drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    if (open) {
      renderCartDrawer();
      backdrop.classList.add('active');
      drawer.classList.add('active');
    } else {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
    }
  }
}

function toggleWishlistDrawer(open) {
  const backdrop = document.getElementById('wishlist-backdrop');
  const drawer = document.getElementById('wishlist-drawer');
  if (backdrop && drawer) {
    if (open) {
      renderWishlistDrawer();
      backdrop.classList.add('active');
      drawer.classList.add('active');
    } else {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
    }
  }
}

function toggleSearchModal(open) {
  const modal = document.getElementById('search-modal');
  if (modal) {
    if (open) {
      modal.classList.add('active');
      const input = document.getElementById('live-search-input');
      if (input) setTimeout(() => input.focus(), 100);
      renderLiveSearchResults('');
    } else {
      modal.classList.remove('active');
    }
  }
}

function toggleQuickViewModal(open) {
  const modal = document.getElementById('product-modal');
  if (modal) {
    if (open) modal.classList.add('active');
    else modal.classList.remove('active');
  }
}

function toggleCheckoutModal(open) {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    if (open) {
      renderCheckoutSummary();
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkout-order-summary');
  if (!summaryEl) return;

  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discount = state.appliedCoupon === 'AMEZA20' ? subtotal * 0.20 : 0;
  const total = Math.max(0, subtotal - discount);

  summaryEl.innerHTML = `
    <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
      <div style="font-size: 0.82rem; font-weight: 700; color: var(--dark); margin-bottom: 8px;">Order Summary (${state.cart.length} items)</div>
      ${state.cart.map(i => `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
          <span>${i.name} (x${i.quantity})</span>
          <span style="font-weight: 700;">${formatPrice(i.price * i.quantity)}</span>
        </div>
      `).join('')}
      <div style="border-top: 1px solid var(--border); margin-top: 8px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 800; font-size: 0.95rem; color: var(--dark);">
        <span>Total Due:</span>
        <span style="color: var(--primary-dark);">${formatPrice(total)}</span>
      </div>
    </div>
  `;
}

function toggleAccountModal(open) {
  const modal = document.getElementById('account-modal');
  if (modal) {
    if (open) {
      renderAccountDetails();
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }
}

function toggleMobileMenu() {
  if (window.AmezaAuth && typeof window.AmezaAuth.openHeavyMobileDrawer === 'function') {
    window.AmezaAuth.openHeavyMobileDrawer();
    return;
  }
  const menu = document.getElementById('mobile-nav-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

/* ==========================================================================
   TIMERS, TOASTS & UTILITIES
   ========================================================================== */

function updateBadges() {
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const wishCount = state.wishlist.length;

  const cartBadges = document.querySelectorAll('.cart-count-badge');
  const wishBadges = document.querySelectorAll('.wishlist-count-badge');

  cartBadges.forEach(b => {
    b.textContent = cartCount;
    b.style.display = cartCount > 0 ? 'flex' : 'none';
  });

  wishBadges.forEach(b => {
    b.textContent = wishCount;
    b.style.display = wishCount > 0 ? 'flex' : 'none';
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function startCountdownTimers() {
  let totalSeconds = 24 * 3600 - 1420;

  function update() {
    totalSeconds--;
    if (totalSeconds < 0) totalSeconds = 24 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');

    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');

    const dealsTimer = document.getElementById('deals-live-timer');
    if (dealsTimer) {
      dealsTimer.textContent = `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
    }
  }

  setInterval(update, 1000);
  update();
}

// Attach global methods to window for inline onclicks
window.amezaApp = {
  updateCartItemQty,
  removeCartItem,
  toggleWishlist,
  moveWishlistToCart,
  moveAllWishlistToCart,
  clearWishlist,
  openWishlistPage,
  closeWishlistPage,
  toggleWishlistDrawer,
  openQuickView,
  selectVariantColor,
  selectVariantSize,
  changeModalQty,
  submitModalAddCart,
  buyNowDirect,
  openProductFromSearch,
  finishCheckoutOrder,
  filterByCategory,
  clearSearchFilter,
  executeSearch
};
