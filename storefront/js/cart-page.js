/**
 * AMEZA Marketplace - Modern Cart Page Controller (js/cart-page.js)
 * Clean, currency-aware, supports empty state, item removal, +/- quantity steppers,
 * and order delivery notes.
 */

import { getCart, saveCart, updateAllCartBadges } from './cart-drawer.js';
import { formatMoney } from '/shared/js/core/utils.js';

export function initCartPage() {
  const container = document.getElementById('cart-page-content');
  if (!container) return;

  renderCartPage();

  window.addEventListener('ameza:cart-updated', () => {
    renderCartPage();
  });

  window.addEventListener('ameza:currency-changed', () => {
    renderCartPage();
  });

  window.addEventListener('storage', () => {
    renderCartPage();
  });
}

export function renderCartPage() {
  const container = document.getElementById('cart-page-content');
  if (!container) return;

  const cart = getCart();
  const savedNotes = localStorage.getItem('ameza_order_notes') || '';
  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalSubtotalCents = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Sync count badges
  updateAllCartBadges();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-container">
        <div class="cart-empty-icon"><i class="fa-solid fa-basket-shopping"></i></div>
        <h2 class="cart-empty-title">Your cart is empty</h2>
        <p class="cart-empty-desc">Looks like you haven't added any handcrafted items to your cart yet. Explore our curated artisan workshops.</p>
        <a href="shop.html" class="btn-cart-shop-now">
          <i class="fa-solid fa-arrow-left"></i> Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- Page Top Header -->
    <div class="cart-header-section">
      <h1 class="cart-page-title">
        <span style="font-family: var(--font-heading, 'Plus Jakarta Sans', sans-serif); font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">Your cart</span>
        <span style="font-size: 18px; font-weight: 500; color: #64748B; font-family: var(--font-body, 'Inter', sans-serif);">(${totalQuantity} item${totalQuantity > 1 ? 's' : ''})</span>
      </h1>
      <a href="shop.html" class="cart-continue-link" style="color: #7FB73C; font-weight: 600; text-decoration: underline; text-underline-offset: 4px;">Continue shopping &rarr;</a>
    </div>

    <!-- 2-Column Cart Grid -->
    <div class="cart-content-grid">
      
      <!-- Left Column: Table of Items & Notes -->
      <div class="cart-left-col">
        <div class="cart-table-card">
          <div class="cart-table-header">
            <div>PRODUCT</div>
            <div style="text-align: center;">QUANTITY</div>
            <div style="text-align: right;">TOTAL</div>
          </div>

          <div class="cart-items-container">
            ${cart.map(item => {
              const itemTotal = formatMoney(item.price * (item.quantity || 1));
              const singlePrice = formatMoney(item.price);
              const variantText = item.variant || 'Standard';

              return `
                <div class="cart-table-row" data-id="${item.id}">
                  <!-- Col 1: Product details -->
                  <div class="cart-item-col-prod">
                    <a href="product.html?id=${item.id}">
                      <img src="${item.image || 'assets/products/ul-backpack.jpg'}" alt="${item.name}" class="cart-prod-thumb">
                    </a>
                    <div class="cart-prod-details">
                      <a href="product.html?id=${item.id}" class="cart-prod-name">${item.name}</a>
                      <span class="cart-prod-variant">${variantText}</span>
                      <span class="cart-prod-price-single">${singlePrice} each</span>
                      <button class="cart-btn-remove" data-action="remove" data-id="${item.id}">
                        <i class="fa-regular fa-trash-can"></i> Remove
                      </button>
                    </div>
                  </div>

                  <!-- Col 2: Quantity stepper -->
                  <div class="cart-item-col-qty" style="justify-content: center;">
                    <div class="cart-stepper">
                      <button class="cart-stepper-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
                      <span class="cart-stepper-val">${item.quantity || 1}</span>
                      <button class="cart-stepper-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">&#43;</button>
                    </div>
                  </div>

                  <!-- Col 3: Line total -->
                  <div class="cart-item-col-total">
                    ${itemTotal}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Order Notes Box -->
        <div class="cart-auxiliary-box">
          <label class="cart-notes-label" for="cart-order-instructions" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="cart-notes-toggle" ${savedNotes ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #7FB73C; cursor: pointer;">
            <span>Add order note / special instructions for delivery:</span>
          </label>
          <textarea class="cart-notes-input" id="cart-order-instructions" placeholder="e.g. Please leave package at the side door, or gift packaging requested...">${savedNotes}</textarea>
        </div>
      </div>

      <!-- Right Column: Order Summary Card -->
      <div class="cart-right-col">
        <div class="cart-summary-card">
          <h2 class="cart-summary-title">Order summary</h2>

          <div class="summary-calc-row">
            <span>Subtotal</span>
            <strong>${formatMoney(totalSubtotalCents)}</strong>
          </div>

          <div class="summary-calc-row">
            <span>Shipping</span>
            <span style="color: var(--text-muted);">${totalSubtotalCents >= 10000 ? 'FREE Standard' : 'Calculated at checkout'}</span>
          </div>

          <div class="summary-subtotal-row">
            <span class="summary-subtotal-label">Estimated Total</span>
            <span class="summary-subtotal-amount">${formatMoney(totalSubtotalCents)}</span>
          </div>

          <p class="summary-tax-note">
            Taxes, promo codes, and precise shipping rates will be calculated during checkout.
          </p>

          <a href="checkout.html" class="btn-checkout-primary btn-AMEZA-checkout" id="btn-proceed-checkout">
            <i class="fa-solid fa-lock"></i> Check out
          </a>

          <!-- Trust Badges -->
          <div class="cart-trust-badges-card">
            <span class="cart-trust-headline">
              <i class="fa-solid fa-shield-halved" style="color:var(--primary);"></i> Guaranteed Safe Checkout
            </span>
            <div class="cart-trust-card-icons">
              <i class="fa-brands fa-cc-visa" title="Visa"></i>
              <i class="fa-brands fa-cc-mastercard" title="Mastercard"></i>
              <i class="fa-brands fa-cc-amex" title="Amex"></i>
              <i class="fa-brands fa-cc-apple-pay" title="Apple Pay"></i>
              <i class="fa-brands fa-cc-paypal" title="PayPal"></i>
            </div>
            <span style="font-size: 11px; color: var(--text-light);">256-Bit SSL Encrypted Payment</span>
          </div>
        </div>
      </div>

    </div>
  `;

  // Bind Order Notes auto-save
  const notesInput = document.getElementById('cart-order-instructions');
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      localStorage.setItem('ameza_order_notes', e.target.value);
    });
  }

  // Bind Cart Table Actions (stepper + remove)
  container.onclick = (e) => {
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
    renderCartPage();
    window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart: currentCart } }));
  };
}
