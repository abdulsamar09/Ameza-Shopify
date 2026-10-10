/**
 * AMEZA Marketplace - Slide-Out Cart Drawer Component (js/cart-drawer.js)
 * Unified cart manager, real-time slide-out drawer, trust badges, order notes,
 * multi-currency formatting, and responsive design.
 */

import { formatMoney } from './core/utils.js';

function getBasePath() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path) return './';
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return './';
  return '../'.repeat(segments.length - 1);
}

/**
 * Returns normalized cart items from localStorage.
 * Guarantee: all prices are integer cents.
 */
export function getCart() {
  try {
    const raw = localStorage.getItem('ameza_cart');
    const items = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const priceCents = Math.round(Number(item.price) || 0);
      return {
        id: String(item.id || ''),
        name: item.name || 'Handcrafted Product',
        price: priceCents, // strictly integer cents
        image: item.image || 'assets/products/ul-backpack.jpg',
        category: item.category || 'Apparel',
        variant: item.variant || (item.options && Object.keys(item.options).length > 0
          ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')
          : 'Standard'),
        quantity: Math.max(1, parseInt(item.quantity || 1, 10)),
        options: item.options || {},
        sellerId: item.sellerId || item.seller_id || 'ameza-official',
        sellerName: item.sellerName || item.seller_name || 'AMEZA Official'
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Persists normalized cart items to localStorage.
 */
export function saveCart(cart) {
  try {
    localStorage.setItem('ameza_cart', JSON.stringify(cart));
  } catch (e) {}
}

/**
 * Formats integer cents into active currency string.
 */
export function formatCartPrice(cents) {
  return formatMoney(cents);
}

/**
 * Updates all cart badge counters in the DOM.
 */
export function updateAllCartBadges() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('#layout-cart-count, #header-cart-badge, .cart-count-badge, #cart-count').forEach(el => {
    el.textContent = totalQty;
    el.style.display = totalQty > 0 ? '' : 'none';
  });
}

/**
 * Adds product to cart, updates state & badges, and slides out drawer smoothly.
 */
export function addToCart(productOrId, quantity = 1, options = {}) {
  let cart = getCart();
  let product = null;

  if (typeof productOrId === 'object' && productOrId !== null) {
    product = { ...productOrId };
  } else {
    const idStr = String(productOrId);
    if (window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
      product = window.PRODUCTS.find(p => String(p.id) === idStr);
    }
    if (!product && window.STORE_DATA && Array.isArray(window.STORE_DATA.products)) {
      product = window.STORE_DATA.products.find(p => String(p.id) === idStr);
    }
    if (!product) {
      product = { id: idStr, name: 'Handcrafted Product', price: 4900, image: 'assets/products/ul-backpack.jpg' };
    }
  }

  const priceCents = Math.round(Number(product.priceCents !== undefined ? product.priceCents : product.price) || 0);

  const optKey = JSON.stringify(options);
  const existingIdx = cart.findIndex(item => String(item.id) === String(product.id) && JSON.stringify(item.options || {}) === optKey);

  if (existingIdx > -1) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      id: String(product.id),
      name: product.name || 'Handcrafted Product',
      price: priceCents,
      image: product.image || 'assets/products/ul-backpack.jpg',
      category: product.category || 'Apparel',
      variant: product.variant || (Object.keys(options).length > 0 ? Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(' · ') : 'Standard'),
      quantity: Math.max(1, quantity),
      options: options,
      sellerId: product.sellerId || product.seller_id || 'ameza-official',
      sellerName: product.sellerName || product.seller_name || 'AMEZA Official'
    });
  }

  saveCart(cart);
  updateAllCartBadges();
  renderDrawerItems();
  window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart } }));

  if (typeof window.openCartDrawer === 'function') {
    window.openCartDrawer();
  }
}

/**
 * Initializes drawer DOM and event bindings.
 */
export function initCartDrawer() {
  if (document.getElementById('cart-drawer-root')) {
    renderDrawerItems();
    return;
  }

  const base = getBasePath();

  const drawerHtml = `
    <div class="cart-drawer-backdrop" id="cart-drawer-backdrop"></div>
    <aside class="cart-drawer" id="cart-drawer-root" aria-label="Shopping Cart Drawer">
      
      <!-- Drawer Header -->
      <div class="cart-drawer-header">
        <h3 class="cart-drawer-title">
          <i class="fa-solid fa-cart-shopping" style="color: #7FB73C; font-size: 16px;"></i>
          <span>Your Cart</span>
          <span id="drawer-header-count" style="font-size: 14px; color: #64748B; font-weight: 600;">(0)</span>
        </h3>
        <button class="cart-drawer-close-btn" id="btn-close-cart-drawer" aria-label="Close cart">
          &times;
        </button>
      </div>

      <!-- Free Shipping Meter -->
      <div class="cart-shipping-meter">
        <p class="shipping-meter-text" id="drawer-shipping-text">
          <i class="fa-solid fa-truck-fast" style="color: #7FB73C;"></i>
          <span>Add $100 for <strong>FREE Shipping</strong></span>
        </p>
        <div class="shipping-meter-track">
          <div class="shipping-meter-fill" id="drawer-shipping-fill" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Cart Items Container -->
      <div class="cart-drawer-items" id="drawer-items-list">
        <!-- Rendered dynamically -->
      </div>

      <!-- Order Notes Accordion -->
      <div class="cart-order-notes-wrap">
        <button class="cart-notes-toggle" id="btn-toggle-cart-notes">
          <i class="fa-regular fa-note-sticky"></i> Add order note / instructions
        </button>
        <textarea class="cart-notes-textarea" id="drawer-order-notes" placeholder="Special instructions for seller or delivery note..."></textarea>
      </div>

      <!-- Drawer Footer -->
      <div class="cart-drawer-footer">
        <div class="cart-subtotal-row">
          <span class="cart-subtotal-label">Subtotal:</span>
          <span class="cart-subtotal-val" id="drawer-subtotal-val">$0.00</span>
        </div>

        <div class="cart-drawer-actions">
          <a href="${base}cart.html" class="btn-drawer-view-cart">View Cart</a>
          <a href="${base}checkout.html" class="btn-drawer-checkout">Checkout</a>
        </div>

        <!-- Trust Badges Strip -->
        <div class="cart-drawer-trust-badges">
          <span class="cart-trust-text">
            <i class="fa-solid fa-lock" style="color: #7FB73C;"></i> Guaranteed Safe &amp; Secure Checkout
          </span>
          <div class="cart-trust-icons">
            <i class="fa-brands fa-cc-visa" title="Visa"></i>
            <i class="fa-brands fa-cc-mastercard" title="Mastercard"></i>
            <i class="fa-brands fa-cc-amex" title="American Express"></i>
            <i class="fa-brands fa-cc-apple-pay" title="Apple Pay"></i>
            <i class="fa-brands fa-cc-paypal" title="PayPal"></i>
          </div>
        </div>
      </div>

    </aside>
  `;

  const container = document.createElement('div');
  container.innerHTML = drawerHtml;
  document.body.appendChild(container);

  // Load cart drawer CSS if not loaded
  if (!document.querySelector('link[href*="cart-drawer.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base}css/cart-drawer.css`;
    document.head.appendChild(link);
  }

  // Bind Events
  const drawerEl = document.getElementById('cart-drawer-root');
  const backdropEl = document.getElementById('cart-drawer-backdrop');
  const btnClose = document.getElementById('btn-close-cart-drawer');
  const notesToggle = document.getElementById('btn-toggle-cart-notes');
  const notesTextarea = document.getElementById('drawer-order-notes');

  if (btnClose) btnClose.addEventListener('click', closeDrawer);
  if (backdropEl) backdropEl.addEventListener('click', closeDrawer);

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const d = document.getElementById('cart-drawer-root');
      if (d && d.classList.contains('open')) {
        closeDrawer();
      }
    }
  });

  if (notesToggle && notesTextarea) {
    notesToggle.addEventListener('click', () => {
      notesTextarea.classList.toggle('show');
      if (notesTextarea.classList.contains('show')) notesTextarea.focus();
    });
    const savedNotes = localStorage.getItem('ameza_order_notes') || '';
    notesTextarea.value = savedNotes;
    notesTextarea.addEventListener('input', (e) => {
      localStorage.setItem('ameza_order_notes', e.target.value);
    });
  }

  // Intercept header cart buttons to open drawer smoothly
  document.querySelectorAll('a[href*="#cart"], #header-cart-btn, .action-icon-circle[aria-label="Cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  });

  // Listen for global cart update
  window.addEventListener('ameza:cart-updated', () => {
    renderDrawerItems();
    updateAllCartBadges();
  });

  // Listen for currency change
  window.addEventListener('ameza:currency-changed', () => {
    renderDrawerItems();
  });

  window.openCartDrawer = openDrawer;
  window.closeCartDrawer = closeDrawer;

  renderDrawerItems();
  updateAllCartBadges();
}

export function openDrawer() {
  let drawerEl = document.getElementById('cart-drawer-root');
  let backdropEl = document.getElementById('cart-drawer-backdrop');
  if (!drawerEl || !backdropEl) {
    initCartDrawer();
    drawerEl = document.getElementById('cart-drawer-root');
    backdropEl = document.getElementById('cart-drawer-backdrop');
  }
  if (drawerEl && backdropEl) {
    renderDrawerItems();
    drawerEl.classList.add('open');
    backdropEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeDrawer() {
  const drawerEl = document.getElementById('cart-drawer-root');
  const backdropEl = document.getElementById('cart-drawer-backdrop');
  if (drawerEl && backdropEl) {
    drawerEl.classList.remove('open');
    backdropEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

window.openCartDrawer = openDrawer;
window.closeCartDrawer = closeDrawer;

/**
 * Re-renders drawer items list, free shipping meter, and subtotal.
 */
export function renderDrawerItems() {
  const itemsContainer = document.getElementById('drawer-items-list');
  const countEl = document.getElementById('drawer-header-count');
  const subtotalEl = document.getElementById('drawer-subtotal-val');
  const shippingText = document.getElementById('drawer-shipping-text');
  const shippingFill = document.getElementById('drawer-shipping-fill');

  const cart = getCart();
  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalSubtotalCents = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  if (countEl) countEl.textContent = `(${totalQuantity})`;
  if (subtotalEl) subtotalEl.textContent = formatCartPrice(totalSubtotalCents);

  // Free shipping meter ($100 threshold = 10000 cents)
  const freeShippingThresholdCents = 10000;
  if (shippingText && shippingFill) {
    if (totalSubtotalCents >= freeShippingThresholdCents) {
      shippingText.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#7FB73C;"></i> You unlocked <strong>FREE Shipping!</strong>';
      shippingFill.style.width = '100%';
    } else {
      const remainingCents = freeShippingThresholdCents - totalSubtotalCents;
      const pct = Math.min(100, Math.round((totalSubtotalCents / freeShippingThresholdCents) * 100));
      shippingText.innerHTML = `<i class="fa-solid fa-truck-fast" style="color:#7FB73C;"></i> Add <strong>${formatCartPrice(remainingCents)}</strong> more for <strong>FREE Shipping</strong>`;
      shippingFill.style.width = `${pct}%`;
    }
  }

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-basket-shopping cart-empty-icon"></i>
        <h4 style="margin: 0 0 6px; font-size: 16px; color: #111827;">Your cart is currently empty</h4>
        <p style="margin: 0 0 20px; font-size: 13px; color: #64748B;">Explore our handcrafted catalog and add something special.</p>
        <button type="button" class="btn-drawer-view-cart" id="btn-empty-continue-shopping" style="height: 42px; font-size: 14px; text-decoration: none; cursor:pointer;">Continue Shopping</button>
      </div>
    `;
    const btnContinue = document.getElementById('btn-empty-continue-shopping');
    if (btnContinue && typeof window.closeCartDrawer === 'function') {
      btnContinue.addEventListener('click', () => window.closeCartDrawer());
    }
    return;
  }

  itemsContainer.innerHTML = cart.map(item => {
    const singlePrice = formatCartPrice(item.price);
    const variantText = item.variant || 'Standard';

    return `
      <div class="cart-drawer-item" data-id="${item.id}">
        <img src="${item.image || 'assets/products/ul-backpack.jpg'}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <p class="cart-item-variant">${variantText}</p>
          <div class="cart-item-price-line">${item.quantity || 1} &times; ${singlePrice}</div>
          
          <div class="cart-item-stepper">
            <button class="stepper-btn-drawer" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
            <span class="stepper-val-drawer">${item.quantity || 1}</span>
            <button class="stepper-btn-drawer" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">&#43;</button>
          </div>
        </div>
        <button class="cart-item-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }).join('');

  // Item Click Handlers (stepper + remove)
  itemsContainer.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    let currentCart = getCart();
    const itemIndex = currentCart.findIndex(i => String(i.id) === String(id));
    if (itemIndex === -1) return;

    if (action === 'increase') {
      currentCart[itemIndex].quantity = (currentCart[itemIndex].quantity || 1) + 1;
    } else if (action === 'decrease') {
      if ((currentCart[itemIndex].quantity || 1) > 1) {
        currentCart[itemIndex].quantity--;
      } else {
        currentCart.splice(itemIndex, 1);
      }
    } else if (action === 'remove') {
      currentCart.splice(itemIndex, 1);
    }

    saveCart(currentCart);
    renderDrawerItems();
    updateAllCartBadges();
    window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart: currentCart } }));
  };
}

// Global Export bindings
window.AmezaCart = {
  getCart,
  saveCart,
  addToCart,
  open: () => (window.openCartDrawer ? window.openCartDrawer() : null),
  close: () => (window.closeCartDrawer ? window.closeCartDrawer() : null),
  render: renderDrawerItems,
  updateBadges: updateAllCartBadges,
  formatPrice: formatCartPrice
};
window.addToCart = addToCart;

export function initBackToTop() {
  let bttBtn = document.getElementById('global-back-to-top');
  if (!bttBtn) {
    bttBtn = document.createElement('button');
    bttBtn.type = 'button';
    bttBtn.id = 'global-back-to-top';
    bttBtn.className = 'back-to-top-btn';
    bttBtn.setAttribute('aria-label', 'Back to top');
    bttBtn.setAttribute('title', 'Back to top');
    bttBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(bttBtn);
  }
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

// Auto-initialize if DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCartDrawer();
      initBackToTop();
    });
  } else {
    initCartDrawer();
    initBackToTop();
  }
}
