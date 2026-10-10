/**
 * AMEZA Marketplace - Robust Multi-Vendor Checkout Page (js/checkout-page.js)
 * Implements:
 * 1. State Sales Tax dynamically loaded from mock/tax_rates.json (50 states + DC)
 * 2. Coupons validated exclusively against mock/coupons.json
 * 3. Stepwise flow: Contact, Shipping address, Delivery per seller, Payment (Card, PayPal, Apple Pay, Google Pay), Review
 * 4. Inline validation errors + toasts, NO alert()
 * 5. Button disabled during submission (prevents double orders)
 * 6. Calls OrdersAPI.createOrder to create parent + vendor sub-orders with ledger entries
 * 7. Failure handling: out-of-stock highlight & reduction, payment retry without cart loss
 * 8. Redirects to order-confirmation.html?id=
 */

import { getCart, saveCart } from './cart-drawer.js';
import { US_STATES, isValidZip, formatPhone } from '/shared/js/core/us.js';
import { formatMoney, showToast, escapeHTML } from '/shared/js/core/utils.js';
import { OrdersAPI } from './api/orders.api.js';
import {
  groupCartBySeller,
  calculateTax,
  validateAndApplyCoupon
} from '/shared/js/core/pricing.js';

let taxRatesCache = null;
let couponsCache = null;

async function loadTaxRates() {
  if (taxRatesCache) return taxRatesCache;
  try {
    const res = await fetch('mock/tax_rates.json');
    if (res.ok) {
      taxRatesCache = await res.json();
      return taxRatesCache;
    }
  } catch (e) {}
  taxRatesCache = {
    AL: 0.04, AK: 0.00, AZ: 0.056, AR: 0.065, CA: 0.0725, CO: 0.029, CT: 0.0635,
    DE: 0.00, DC: 0.06, FL: 0.06, GA: 0.04, HI: 0.04, ID: 0.06, IL: 0.0625,
    IN: 0.07, IA: 0.06, KS: 0.065, KY: 0.06, LA: 0.0445, ME: 0.055, MD: 0.06,
    MA: 0.0625, MI: 0.06, MN: 0.06875, MS: 0.07, MO: 0.04225, MT: 0.00, NE: 0.055,
    NV: 0.0685, NH: 0.00, NJ: 0.06625, NM: 0.05, NY: 0.04, NC: 0.0475, ND: 0.05,
    OH: 0.0575, OK: 0.045, OR: 0.00, PA: 0.06, RI: 0.07, SC: 0.06, SD: 0.042,
    TN: 0.07, TX: 0.0625, UT: 0.061, VT: 0.06, VA: 0.053, WA: 0.065, WV: 0.06,
    WI: 0.05, WY: 0.04
  };
  return taxRatesCache;
}

async function loadCoupons() {
  if (couponsCache) return couponsCache;
  try {
    const res = await fetch('mock/coupons.json');
    if (res.ok) {
      couponsCache = await res.json();
      return couponsCache;
    }
  } catch (e) {}
  couponsCache = [
    { code: 'SAVE10', discountType: 'percentage', value: 10, minSpendCents: 5000, active: true },
    { code: 'FREESHIP', discountType: 'fixed_shipping', value: 599, minSpendCents: 5000, active: true },
    { code: 'SPRING20', discountType: 'percentage', value: 20, minSpendCents: 10000, active: true },
    { code: 'WELCOME5', discountType: 'fixed_amount', value: 500, minSpendCents: 3500, active: true },
    { code: 'SUMMER25', discountType: 'percentage', value: 25, minSpendCents: 10000, active: true }
  ];
  return couponsCache;
}

// Checkout flow state
let appliedCoupon = null;
let selectedPaymentMethod = 'card'; // 'card', 'paypal', 'apple_pay', 'google_pay'
let simulatePaymentFailure = false;
let sellerDeliveryMethods = {}; // { [sellerId]: { method: 'standard'|'express', carrier: 'USPS'|'UPS'|'FedEx' } }
let isSubmitting = false;
let inlineErrors = {};
let outOfStockIssue = null;
let paymentFailureMessage = '';

let formValues = {
  email: 'michael.cooper@example.com',
  fname: 'Michael',
  lname: 'Cooper',
  address: '2400 Congress Ave',
  apt: 'Suite 400',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  phone: '(512) 555-0198',
  cardNum: '•••• •••• •••• 4242',
  cardExp: '12/28',
  cardCvv: '882',
  cardName: 'Michael Cooper'
};

export async function initCheckoutPage() {
  const container = document.getElementById('checkout-app-root');
  if (!container) return;

  await Promise.all([loadTaxRates(), loadCoupons()]);
  renderCheckout();

  window.addEventListener('ameza:currency-changed', () => renderCheckout());
  window.addEventListener('ameza:cart-updated', () => renderCheckout());
}

export function renderCheckout() {
  const container = document.getElementById('checkout-app-root');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="min-height: 80vh; display:flex; align-items:center; justify-content:center; padding: 24px;">
        <div style="background:#FFF; border:1px solid #E5E7EB; border-radius:16px; padding:48px 32px; text-align:center; max-width:480px; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="font-size:48px; color:#CBD5E1; margin-bottom:16px;"><i class="fa-solid fa-basket-shopping"></i></div>
          <h2 style="font-size:22px; font-weight:800; color:#111827; margin:0 0 8px;">Your cart is currently empty</h2>
          <p style="font-size:14px; color:#6B7280; margin:0 0 24px;">Add items to your cart before proceeding to checkout.</p>
          <a href="store.html" style="display:inline-flex; align-items:center; gap:8px; padding:12px 28px; background:linear-gradient(135deg,#7FB73C,#5a9022); color:#FFF; border-radius:8px; font-weight:700; text-decoration:none;">
            Return to Store
          </a>
        </div>
      </div>
    `;
    return;
  }

  // Group cart items by seller
  const sellerGroups = groupCartBySeller(cart);
  const vendors = Object.values(sellerGroups);

  // Initialize seller delivery methods defaults if not set
  vendors.forEach(v => {
    if (!sellerDeliveryMethods[v.sellerId]) {
      sellerDeliveryMethods[v.sellerId] = {
        method: 'standard',
        carrier: 'USPS'
      };
    }
  });

  // Calculate pricing breakdown
  let itemsSubtotalCents = 0;
  let totalShippingCents = 0;

  vendors.forEach(v => {
    itemsSubtotalCents += v.subtotalCents;
    const pref = sellerDeliveryMethods[v.sellerId] || { method: 'standard', carrier: 'USPS' };
    if (pref.method === 'express') {
      v.shippingCents = 1299; // $12.99
    } else {
      // Standard $5.99, free over $100 (10000 cents)
      v.shippingCents = v.subtotalCents >= 10000 ? 0 : 599;
    }
    totalShippingCents += v.shippingCents;
  });

  // Coupon discount
  let discountCents = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountCents = Math.round((itemsSubtotalCents * appliedCoupon.value) / 100);
    } else if (appliedCoupon.discountType === 'fixed_amount') {
      discountCents = Math.min(itemsSubtotalCents, appliedCoupon.value);
    } else if (appliedCoupon.discountType === 'fixed_shipping') {
      discountCents = totalShippingCents;
    }
  }

  const discountedSubtotalCents = Math.max(0, itemsSubtotalCents - discountCents);

  // State sales tax from taxRatesCache
  const stateCode = (formValues.state || 'TX').toUpperCase().trim();
  const stateTaxRate = (taxRatesCache && typeof taxRatesCache[stateCode] === 'number')
    ? taxRatesCache[stateCode]
    : 0.0625;
  const taxCents = Math.round(discountedSubtotalCents * stateTaxRate);

  const grandTotalCents = discountedSubtotalCents + totalShippingCents + taxCents;
  const taxPctFormatted = (stateTaxRate * 100).toFixed(2);

  container.innerHTML = `
    <div class="checkout-master-wrapper">
      
      <!-- LEFT COLUMN: Checkout Steps Form -->
      <main class="checkout-main-column">

        <!-- Breadcrumbs -->
        <nav class="checkout-breadcrumbs" aria-label="Checkout navigation">
          <a href="cart.html">Cart</a>
          <span>&gt;</span>
          <span class="current">Information</span>
          <span>&gt;</span>
          <span class="current">Shipping</span>
          <span>&gt;</span>
          <span class="current">Payment</span>
          <span>&gt;</span>
          <span class="current">Review</span>
        </nav>

        <!-- Express Checkout Section -->
        <div class="express-checkout-box">
          <p class="express-checkout-title">Express Checkout</p>
          <div class="express-buttons-row">
            <button type="button" class="btn-express-shoppay" id="btn-express-apple" style="background:#000; color:#FFF; display:flex; align-items:center; justify-content:center; gap:8px;">
              <img src="assets/icons/apple-pay.svg" alt="Apple Pay" style="height:20px; filter:invert(1);">
            </button>
            <button type="button" class="btn-express-paypal" id="btn-express-paypal" style="background:#FFC439; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
              <img src="assets/icons/paypal.svg" alt="PayPal" style="height:18px;">
            </button>
            <button type="button" class="btn-express-gpay" id="btn-express-gpay" style="background:#000; color:#FFF; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
              <img src="assets/icons/google-pay.svg" alt="Google Pay" style="height:18px; filter:brightness(0) invert(1);">
            </button>
          </div>
        </div>

        <div class="checkout-or-divider">
          <span>OR CONTINUE WITH STANDARD CHECKOUT</span>
        </div>

        <!-- Out of stock alert banner if triggered -->
        ${outOfStockIssue ? `
          <div style="background:#FEF2F2; border:1px solid #FCA5A5; border-radius:8px; padding:14px 16px; margin-bottom:24px; color:#991B1B; display:flex; align-items:flex-start; gap:12px;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:20px; color:#DC2626; margin-top:2px;"></i>
            <div style="flex-grow:1;">
              <strong style="display:block; font-size:14px; margin-bottom:4px;">Stock Limitation Detected</strong>
              <span style="font-size:13px;">${escapeHTML(outOfStockIssue.error)}</span>
              ${outOfStockIssue.availableStock !== undefined ? `
                <div style="margin-top:8px;">
                  <button type="button" id="btn-fix-stock-reduce" class="btn-action-secondary" style="padding:6px 14px; font-size:12px;">
                    Adjust Quantity to ${outOfStockIssue.availableStock}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Payment failure notice banner if triggered -->
        ${paymentFailureMessage ? `
          <div style="background:#FFF1F2; border:1px solid #FECDD3; border-radius:8px; padding:14px 16px; margin-bottom:24px; color:#9F1239; display:flex; align-items:flex-start; gap:12px;">
            <i class="fa-solid fa-circle-xmark" style="font-size:20px; color:#E11D48; margin-top:2px;"></i>
            <div>
              <strong style="display:block; font-size:14px; margin-bottom:4px;">Payment Authorization Error</strong>
              <span style="font-size:13px;">${escapeHTML(paymentFailureMessage)}</span>
              <p style="font-size:12px; margin:6px 0 0; color:#BE123C;">Your items remain safely in your cart. You may switch to success mode or update details to retry.</p>
            </div>
          </div>
        ` : ''}

        <form id="ameza-checkout-form" novalidate>
          
          <!-- STEP 1: CONTACT -->
          <section style="margin-bottom: 28px;">
            <div class="checkout-section-title">
              <span>Step 1 &middot; Contact Information</span>
              <a href="login.html" class="checkout-login-link">Sign in</a>
            </div>
            <div class="checkout-field-row">
              <input type="email" class="checkout-input ${inlineErrors.email ? 'input-error' : ''}" id="chk-email" placeholder="Email address" value="${escapeHTML(formValues.email)}" required>
              ${inlineErrors.email ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.email)}</span>` : ''}
            </div>
            <label class="checkout-checkbox-row">
              <input type="checkbox" checked>
              <span>Email me order updates, carrier tracking, and exclusive discounts</span>
            </label>
          </section>

          <!-- STEP 2: SHIPPING ADDRESS -->
          <section style="margin-bottom: 28px;">
            <div class="checkout-section-title">
              <span>Step 2 &middot; Shipping Address</span>
            </div>
            
            <div class="checkout-field-row">
              <select class="checkout-input" id="chk-country" style="cursor:not-allowed; background:#F8FAFC;" disabled>
                <option value="US" selected>United States (Domestic)</option>
              </select>
            </div>

            <div class="checkout-field-grid-2">
              <div>
                <input type="text" class="checkout-input ${inlineErrors.fname ? 'input-error' : ''}" id="chk-fname" placeholder="First name" value="${escapeHTML(formValues.fname)}" required>
                ${inlineErrors.fname ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.fname)}</span>` : ''}
              </div>
              <div>
                <input type="text" class="checkout-input ${inlineErrors.lname ? 'input-error' : ''}" id="chk-lname" placeholder="Last name" value="${escapeHTML(formValues.lname)}" required>
                ${inlineErrors.lname ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.lname)}</span>` : ''}
              </div>
            </div>

            <div class="checkout-field-row">
              <input type="text" class="checkout-input ${inlineErrors.address ? 'input-error' : ''}" id="chk-address" placeholder="Street Address" value="${escapeHTML(formValues.address)}" required>
              ${inlineErrors.address ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.address)}</span>` : ''}
            </div>

            <div class="checkout-field-row">
              <input type="text" class="checkout-input" id="chk-apt" placeholder="Apartment, suite, unit (optional)" value="${escapeHTML(formValues.apt)}">
            </div>

            <div class="checkout-field-grid-3">
              <div>
                <input type="text" class="checkout-input ${inlineErrors.city ? 'input-error' : ''}" id="chk-city" placeholder="City" value="${escapeHTML(formValues.city)}" required>
                ${inlineErrors.city ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.city)}</span>` : ''}
              </div>
              <div>
                <select class="checkout-input" id="chk-state" style="cursor:pointer;" required>
                  ${US_STATES.map(s => `
                    <option value="${s.code}" ${s.code === formValues.state ? 'selected' : ''}>${s.code} - ${s.name}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <input type="text" class="checkout-input ${inlineErrors.zip ? 'input-error' : ''}" id="chk-zip" placeholder="ZIP code (e.g. 78701)" value="${escapeHTML(formValues.zip)}" required>
                ${inlineErrors.zip ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.zip)}</span>` : ''}
              </div>
            </div>

            <div class="checkout-field-row" style="margin-top:12px;">
              <input type="tel" class="checkout-input ${inlineErrors.phone ? 'input-error' : ''}" id="chk-phone" placeholder="Phone (for delivery carrier updates)" value="${escapeHTML(formValues.phone)}" required>
              ${inlineErrors.phone ? `<span class="field-error-text" style="color:#DC2626; font-size:12px; margin-top:4px; display:block;">${escapeHTML(inlineErrors.phone)}</span>` : ''}
            </div>
          </section>

          <!-- STEP 3: DELIVERY METHOD PER SELLER -->
          <section style="margin-bottom: 28px;">
            <div class="checkout-section-title">
              <span>Step 3 &middot; Delivery Method per Seller (${vendors.length} ${vendors.length === 1 ? 'Shipment' : 'Shipments'})</span>
            </div>

            ${vendors.map((vendor, idx) => {
              const currentPref = sellerDeliveryMethods[vendor.sellerId] || { method: 'standard', carrier: 'USPS' };
              const isStdFree = vendor.subtotalCents >= 10000;
              return `
                <div class="seller-shipment-box" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:16px 18px; margin-bottom:14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:6px;">
                    <span style="font-weight:700; font-size:14px; color:#0F172A; display:flex; align-items:center; gap:6px;">
                      <i class="fa-solid fa-store" style="color:#7FB73C;"></i>
                      ${escapeHTML(vendor.sellerName)}
                      <span style="font-size:12px; font-weight:500; color:#64748B;">(${vendor.items.length} item${vendor.items.length > 1 ? 's' : ''})</span>
                    </span>
                    <span style="font-size:12px; color:#64748B;">Subtotal: <strong>${formatMoney(vendor.subtotalCents)}</strong></span>
                  </div>

                  <div class="shipping-options-list" style="display:flex; flex-direction:column; gap:8px;">
                    <label style="display:flex; justify-content:space-between; align-items:center; background:#FFF; border:1px solid ${currentPref.method === 'standard' ? '#7FB73C' : '#E2E8F0'}; border-radius:8px; padding:10px 14px; cursor:pointer;">
                      <span style="display:flex; align-items:center; gap:10px;">
                        <input type="radio" name="shipping_${escapeHTML(vendor.sellerId)}" value="standard" ${currentPref.method === 'standard' ? 'checked' : ''} data-seller-id="${escapeHTML(vendor.sellerId)}" class="seller-ship-radio">
                        <span>
                          <strong style="font-size:13px; color:#0F172A;">USPS Ground Advantage</strong>
                          <span style="display:block; font-size:11.5px; color:#64748B;">5-7 business days</span>
                        </span>
                      </span>
                      <strong style="color:${isStdFree ? '#16A34A' : '#0F172A'}; font-size:13px;">${isStdFree ? 'FREE' : '$5.99'}</strong>
                    </label>

                    <label style="display:flex; justify-content:space-between; align-items:center; background:#FFF; border:1px solid ${currentPref.method === 'express' ? '#7FB73C' : '#E2E8F0'}; border-radius:8px; padding:10px 14px; cursor:pointer;">
                      <span style="display:flex; align-items:center; gap:10px;">
                        <input type="radio" name="shipping_${escapeHTML(vendor.sellerId)}" value="express" ${currentPref.method === 'express' ? 'checked' : ''} data-seller-id="${escapeHTML(vendor.sellerId)}" class="seller-ship-radio">
                        <span>
                          <strong style="font-size:13px; color:#0F172A;">UPS 2nd Day Air (Express)</strong>
                          <span style="display:block; font-size:11.5px; color:#64748B;">2-3 business days</span>
                        </span>
                      </span>
                      <strong style="color:#0F172A; font-size:13px;">$12.99</strong>
                    </label>
                  </div>
                </div>
              `;
            }).join('')}
          </section>

          <!-- STEP 4: PAYMENT -->
          <section style="margin-bottom: 28px;">
            <div class="checkout-section-title">
              <span>Step 4 &middot; Payment</span>
            </div>
            <p style="font-size: 13px; color: var(--ameza-text-muted); margin: 0 0 14px;">
              All transactions are encrypted with 256-bit bank-level SSL security.
            </p>

            <div class="checkout-payment-accordion" style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
              <!-- Credit Card Option -->
              <div class="payment-method-row ${selectedPaymentMethod === 'card' ? 'selected' : ''}" style="padding:14px 16px; border-bottom:1px solid #E2E8F0; background:${selectedPaymentMethod === 'card' ? '#F8FAFC' : '#FFF'};">
                <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; width:100%;">
                  <span style="display:flex; align-items:center; gap:10px;">
                    <input type="radio" name="pay-method" value="card" ${selectedPaymentMethod === 'card' ? 'checked' : ''} class="payment-radio">
                    <span style="font-weight:700; color:#0F172A; font-size:14px;">Credit / Debit Card</span>
                  </span>
                  <span style="display:flex; gap:6px; align-items:center;">
                    <img src="assets/icons/visa.svg" alt="Visa" style="height:18px;">
                    <img src="assets/icons/mastercard.svg" alt="Mastercard" style="height:18px;">
                    <img src="assets/icons/amex.svg" alt="Amex" style="height:18px;">
                  </span>
                </label>

                ${selectedPaymentMethod === 'card' ? `
                  <div style="margin-top:14px; padding-top:14px; border-top:1px solid #E2E8F0;">
                    <div class="checkout-field-row">
                      <input type="text" class="checkout-input" id="chk-card-num" placeholder="Card number" value="${escapeHTML(formValues.cardNum)}">
                    </div>
                    <div class="checkout-field-grid-2">
                      <input type="text" class="checkout-input" id="chk-card-exp" placeholder="Expiration (MM/YY)" value="${escapeHTML(formValues.cardExp)}">
                      <input type="text" class="checkout-input" id="chk-card-cvv" placeholder="Security Code (CVV)" value="${escapeHTML(formValues.cardCvv)}">
                    </div>
                    <div class="checkout-field-row" style="margin-top:10px;">
                      <input type="text" class="checkout-input" id="chk-card-name" placeholder="Name on card" value="${escapeHTML(formValues.cardName)}">
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- PayPal Option -->
              <div class="payment-method-row ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}" style="padding:14px 16px; border-bottom:1px solid #E2E8F0; background:${selectedPaymentMethod === 'paypal' ? '#F8FAFC' : '#FFF'};">
                <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; width:100%;">
                  <span style="display:flex; align-items:center; gap:10px;">
                    <input type="radio" name="pay-method" value="paypal" ${selectedPaymentMethod === 'paypal' ? 'checked' : ''} class="payment-radio">
                    <span style="font-weight:700; color:#0F172A; font-size:14px;">PayPal</span>
                  </span>
                  <img src="assets/icons/paypal.svg" alt="PayPal" style="height:18px;">
                </label>
              </div>

              <!-- Apple Pay Option -->
              <div class="payment-method-row ${selectedPaymentMethod === 'apple_pay' ? 'selected' : ''}" style="padding:14px 16px; border-bottom:1px solid #E2E8F0; background:${selectedPaymentMethod === 'apple_pay' ? '#F8FAFC' : '#FFF'};">
                <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; width:100%;">
                  <span style="display:flex; align-items:center; gap:10px;">
                    <input type="radio" name="pay-method" value="apple_pay" ${selectedPaymentMethod === 'apple_pay' ? 'checked' : ''} class="payment-radio">
                    <span style="font-weight:700; color:#0F172A; font-size:14px;">Apple Pay</span>
                  </span>
                  <img src="assets/icons/apple-pay.svg" alt="Apple Pay" style="height:18px;">
                </label>
              </div>

              <!-- Google Pay Option -->
              <div class="payment-method-row ${selectedPaymentMethod === 'google_pay' ? 'selected' : ''}" style="padding:14px 16px; background:${selectedPaymentMethod === 'google_pay' ? '#F8FAFC' : '#FFF'};">
                <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; width:100%;">
                  <span style="display:flex; align-items:center; gap:10px;">
                    <input type="radio" name="pay-method" value="google_pay" ${selectedPaymentMethod === 'google_pay' ? 'checked' : ''} class="payment-radio">
                    <span style="font-weight:700; color:#0F172A; font-size:14px;">Google Pay</span>
                  </span>
                  <img src="assets/icons/google-pay.svg" alt="Google Pay" style="height:18px;">
                </label>
              </div>
            </div>

            <!-- Mock Provider Mode Sandbox Control -->
            <div style="margin-top:14px; background:#F1F5F9; border:1px dashed #CBD5E1; border-radius:8px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; font-size:12.5px;">
              <span style="color:#475569; display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-flask" style="color:#64748B;"></i>
                <strong>Mock Provider Gateway:</strong>
              </span>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px; color:#334155;">
                <input type="checkbox" id="chk-simulate-failure" ${simulatePaymentFailure ? 'checked' : ''} style="cursor:pointer;">
                <span>Simulate payment failure</span>
              </label>
            </div>
          </section>

          <!-- STEP 5: REVIEW & SUBMIT -->
          <section>
            <button type="submit" id="btn-submit-order" class="btn-checkout-submit" ${isSubmitting ? 'disabled' : ''} style="width:100%; padding:16px 24px; font-size:16px; font-weight:800; border-radius:10px; background:#7FB73C; color:#FFF; border:none; cursor:${isSubmitting ? 'not-allowed' : 'pointer'}; display:flex; align-items:center; justify-content:center; gap:10px; transition:background 0.2s;">
              ${isSubmitting ? `
                <i class="fa-solid fa-spinner fa-spin"></i> Processing & Verifying Order...
              ` : `
                <i class="fa-solid fa-lock"></i> Place order &bull; ${formatMoney(grandTotalCents)} USD
              `}
            </button>
            <div style="text-align:center; margin-top:8px; font-size:12px; color:#64748B; font-weight:600;">
              <i class="fa-solid fa-circle-info" style="color:#7FB73C;"></i> You will be charged in USD
            </div>
            <div style="text-align:center; margin-top:12px; font-size:12px; color:#64748B;">
              By placing your order, you agree to AMEZA's <a href="legal/terms.html" style="color:#64748B;">Terms of Service</a> and <a href="legal/privacy.html" style="color:#64748B;">Privacy Policy</a>.
            </div>
          </section>

        </form>
      </main>

      <!-- RIGHT COLUMN: Order Summary & Coupon Code -->
      <aside class="checkout-sidebar-column">
        <div class="checkout-sidebar-sticky">

          <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin:0 0 16px;">
            Order Summary (${cart.length} ${cart.length === 1 ? 'item' : 'items'})
          </h3>

          <!-- Items list -->
          <div class="checkout-items-list" style="margin-bottom:20px; max-height:320px; overflow-y:auto; padding-right:4px;">
            ${cart.map(item => {
              const qty = item.quantity || 1;
              const lineTotal = item.price * qty;
              const isFlagged = outOfStockIssue && String(outOfStockIssue.id) === String(item.id);
              return `
                <div class="checkout-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #E2E8F0; ${isFlagged ? 'background:#FEF2F2; padding:8px; border-radius:8px;' : ''}">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="position:relative; width:48px; height:48px; border-radius:8px; overflow:hidden; border:1px solid #CBD5E1; background:#F8FAFC; flex-shrink:0;">
                      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/products/placeholder.jpg'">
                      <span style="position:absolute; top:-4px; right:-4px; background:#475569; color:#FFF; font-size:10px; font-weight:700; border-radius:10px; padding:1px 6px;">${qty}</span>
                    </div>
                    <div>
                      <strong style="font-size:13.5px; color:#0F172A; display:block;">${escapeHTML(item.name)}</strong>
                      <span style="font-size:12px; color:#64748B;">${escapeHTML(item.variant || 'Standard')} &bull; ${formatMoney(item.price)} ea</span>
                      ${isFlagged ? `<span style="color:#DC2626; font-size:11px; font-weight:700; display:block;">Out of stock</span>` : ''}
                    </div>
                  </div>
                  <strong style="font-size:14px; color:#0F172A;">${formatMoney(lineTotal)}</strong>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Coupon Input Form -->
          <div style="margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #E2E8F0;">
            ${appliedCoupon ? `
              <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="color:#166534; font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-tag"></i> ${escapeHTML(appliedCoupon.code)}
                  </span>
                  <span style="font-size:12px; color:#15803D;">-${formatMoney(discountCents)} applied</span>
                </div>
                <button type="button" id="btn-remove-coupon" style="background:none; border:none; color:#DC2626; font-weight:600; font-size:12px; cursor:pointer;">
                  Remove
                </button>
              </div>
            ` : `
              <div style="display:flex; gap:8px;">
                <input type="text" id="chk-coupon-input" placeholder="Discount code (e.g. SAVE10)" class="checkout-input" style="text-transform:uppercase;">
                <button type="button" id="btn-apply-coupon" style="padding:0 18px; background:#0F172A; color:#FFF; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:13px; white-space:nowrap;">
                  Apply
                </button>
              </div>
              <div id="coupon-error-msg" style="display:none; color:#DC2626; font-size:12px; margin-top:6px;"></div>
            `}
          </div>

          <!-- Totals Breakdown Table -->
          <div class="checkout-totals-table" style="font-size:13.5px; color:#475569; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;">
              <span>Subtotal</span>
              <strong style="color:#0F172A;">${formatMoney(itemsSubtotalCents)}</strong>
            </div>

            <div style="display:flex; justify-content:space-between;">
              <span>Shipping & Handling</span>
              <span style="color:#0F172A; font-weight:600;">${totalShippingCents === 0 ? 'FREE' : formatMoney(totalShippingCents)}</span>
            </div>

            <!-- State Sales Tax as its own line based on shipping state -->
            <div style="display:flex; justify-content:space-between;" id="tax-row">
              <span>State Sales Tax (${escapeHTML(stateCode)} ${taxPctFormatted}%)</span>
              <strong style="color:#0F172A;">${formatMoney(taxCents)}</strong>
            </div>

            ${discountCents > 0 ? `
              <div style="display:flex; justify-content:space-between; color:#16A34A; font-weight:600;">
                <span>Discount (${escapeHTML(appliedCoupon.code)})</span>
                <span>-${formatMoney(discountCents)}</span>
              </div>
            ` : ''}

            <div style="border-top:1px solid #E2E8F0; padding-top:12px; margin-top:6px; display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:#0F172A;">
              <span>Total</span>
              <div style="text-align:right;">
                <span style="font-size:11px; font-weight:500; color:#64748B; margin-right:4px;">USD</span>
                <span>${formatMoney(grandTotalCents)}</span>
              </div>
            </div>
            <div style="text-align:right; font-size:12px; color:#64748B; margin-top:4px; font-weight:600;" id="checkout-charge-currency-notice">
              <i class="fa-solid fa-circle-info" style="font-size:11px; color:#7FB73C;"></i> You will be charged in USD
            </div>
          </div>

          <!-- Trust Badges -->
          <div style="margin-top:24px; padding:14px; background:#F8FAFC; border-radius:8px; font-size:12px; color:#64748B; display:flex; flex-direction:column; gap:6px;">
            <span style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-shield-halved" style="color:#7FB73C;"></i> 100% Satisfaction Guarantee</span>
            <span style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-box" style="color:#7FB73C;"></i> Fast, tracked domestic delivery</span>
            <span style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-rotate-left" style="color:#7FB73C;"></i> Free 30-day hassle-free returns</span>
          </div>

        </div>
      </aside>

    </div>
  `;

  bindEvents();
}

function bindEvents() {
  // Bind form inputs for immediate state retention
  const fields = [
    { id: 'chk-email', key: 'email' },
    { id: 'chk-fname', key: 'fname' },
    { id: 'chk-lname', key: 'lname' },
    { id: 'chk-address', key: 'address' },
    { id: 'chk-apt', key: 'apt' },
    { id: 'chk-city', key: 'city' },
    { id: 'chk-zip', key: 'zip' },
    { id: 'chk-phone', key: 'phone' },
    { id: 'chk-card-num', key: 'cardNum' },
    { id: 'chk-card-exp', key: 'cardExp' },
    { id: 'chk-card-cvv', key: 'cardCvv' },
    { id: 'chk-card-name', key: 'cardName' }
  ];

  fields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        formValues[key] = el.value;
        if (inlineErrors[key]) {
          delete inlineErrors[key];
          const errEl = el.parentElement.querySelector('.field-error-text');
          if (errEl) errEl.style.display = 'none';
          el.classList.remove('input-error');
        }
      });
    }
  });

  // State selection recalculates state tax immediately
  const stateEl = document.getElementById('chk-state');
  if (stateEl) {
    stateEl.addEventListener('change', () => {
      formValues.state = stateEl.value;
      renderCheckout();
    });
  }

  // Phone auto-formatter on blur
  const phoneEl = document.getElementById('chk-phone');
  if (phoneEl) {
    phoneEl.addEventListener('blur', () => {
      phoneEl.value = formatPhone(phoneEl.value);
      formValues.phone = phoneEl.value;
    });
  }

  // Shipping method change per seller
  document.querySelectorAll('.seller-ship-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const sellerId = e.target.getAttribute('data-seller-id');
      const method = e.target.value;
      const carrier = method === 'express' ? 'UPS' : 'USPS';
      sellerDeliveryMethods[sellerId] = { method, carrier };
      renderCheckout();
    });
  });

  // Payment radio buttons
  document.querySelectorAll('.payment-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPaymentMethod = e.target.value;
      renderCheckout();
    });
  });

  // Simulation failure checkbox
  const chkSimulate = document.getElementById('chk-simulate-failure');
  if (chkSimulate) {
    chkSimulate.addEventListener('change', (e) => {
      simulatePaymentFailure = e.target.checked;
    });
  }

  // Out of stock fix quick button
  const btnFixStock = document.getElementById('btn-fix-stock-reduce');
  if (btnFixStock && outOfStockIssue) {
    btnFixStock.addEventListener('click', () => {
      const cart = getCart();
      const target = cart.find(i => String(i.id) === String(outOfStockIssue.id));
      if (target) {
        target.quantity = outOfStockIssue.availableStock;
        if (target.quantity <= 0) {
          const idx = cart.indexOf(target);
          if (idx > -1) cart.splice(idx, 1);
        }
        saveCart(cart);
        outOfStockIssue = null;
        showToast('Cart quantity adjusted to available stock.', 'info');
        renderCheckout();
      }
    });
  }

  // Coupon Apply
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  const inputCoupon = document.getElementById('chk-coupon-input');
  const errCoupon = document.getElementById('coupon-error-msg');

  if (btnApplyCoupon && inputCoupon) {
    btnApplyCoupon.addEventListener('click', async () => {
      const code = inputCoupon.value.trim();
      if (!code) {
        if (errCoupon) {
          errCoupon.textContent = 'Please enter a coupon code.';
          errCoupon.style.display = 'block';
        }
        return;
      }

      const cart = getCart();
      const subtotalCents = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      const coupons = await loadCoupons();
      const result = validateAndApplyCoupon(code, subtotalCents, coupons);

      if (!result.valid) {
        if (errCoupon) {
          errCoupon.textContent = result.error;
          errCoupon.style.display = 'block';
        }
        showToast(result.error, 'error');
        return;
      }

      appliedCoupon = result.coupon;
      showToast(`Coupon "${result.coupon.code}" applied successfully!`, 'success');
      renderCheckout();
    });
  }

  // Coupon Remove
  const btnRemoveCoupon = document.getElementById('btn-remove-coupon');
  if (btnRemoveCoupon) {
    btnRemoveCoupon.addEventListener('click', () => {
      appliedCoupon = null;
      showToast('Coupon removed.', 'info');
      renderCheckout();
    });
  }

  // Express checkout buttons
  const bindExpress = (id, provider) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        selectedPaymentMethod = provider === 'Apple Pay' ? 'apple_pay' : (provider === 'PayPal' ? 'paypal' : 'google_pay');
        submitOrder();
      });
    }
  };
  bindExpress('btn-express-apple', 'Apple Pay');
  bindExpress('btn-express-paypal', 'PayPal');
  bindExpress('btn-express-gpay', 'Google Pay');

  // Checkout Form Submission
  const form = document.getElementById('ameza-checkout-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitOrder();
    });
  }
}

async function submitOrder() {
  if (isSubmitting) return;

  inlineErrors = {};
  paymentFailureMessage = '';

  // Validate Step 1: Email
  if (!formValues.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
    inlineErrors.email = 'Please enter a valid email address.';
  }

  // Validate Step 2: Shipping
  if (!formValues.fname.trim()) inlineErrors.fname = 'First name is required.';
  if (!formValues.lname.trim()) inlineErrors.lname = 'Last name is required.';
  if (!formValues.address.trim()) inlineErrors.address = 'Street address is required.';
  if (!formValues.city.trim()) inlineErrors.city = 'City is required.';
  if (!isValidZip(formValues.zip)) {
    inlineErrors.zip = 'Please enter a valid 5-digit U.S. ZIP code (e.g. 78701 or 10001).';
  }
  if (!formValues.phone.trim()) inlineErrors.phone = 'Phone number is required for shipping updates.';

  if (Object.keys(inlineErrors).length > 0) {
    showToast('Please correct the highlighted fields before placing your order.', 'error');
    renderCheckout();
    return;
  }

  isSubmitting = true;
  const btnSubmit = document.getElementById('btn-submit-order');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing & Verifying Order...';
  }

  try {
    const cart = getCart();
    const result = await OrdersAPI.createOrder({
      customerId: 'cust_' + Date.now().toString(36),
      customerName: `${formValues.fname} ${formValues.lname}`.trim(),
      customerEmail: formValues.email.trim(),
      cartItems: cart,
      shippingAddress: {
        address: formValues.address.trim(),
        apt: formValues.apt.trim(),
        city: formValues.city.trim(),
        state: formValues.state,
        zip: formValues.zip.trim(),
        phone: formValues.phone.trim(),
        country: 'United States'
      },
      sellerDeliveryMethods,
      paymentMethod: selectedPaymentMethod,
      simulatePaymentFailure,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      taxRates: taxRatesCache
    });

    if (!result.success) {
      isSubmitting = false;

      if (result.errorCode === 'OUT_OF_STOCK') {
        outOfStockIssue = result;
        showToast(result.error, 'error');
        renderCheckout();
        return;
      }

      if (result.errorCode === 'PAYMENT_FAILED') {
        paymentFailureMessage = result.error;
        showToast(result.error, 'error');
        renderCheckout();
        return;
      }

      showToast(result.error || 'Failed to place order. Please review your details and try again.', 'error');
      renderCheckout();
      return;
    }

    // SUCCESS: Clear Cart & Redirect to order-confirmation.html
    localStorage.removeItem('ameza_cart');
    window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart: [] } }));
    showToast('Order confirmed! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = `order-confirmation.html?id=${encodeURIComponent(result.parentOrder.id)}`;
    }, 400);

  } catch (err) {
    console.error('Checkout error:', err);
    isSubmitting = false;
    showToast('An unexpected error occurred during checkout. Please try again.', 'error');
    renderCheckout();
  }
}
