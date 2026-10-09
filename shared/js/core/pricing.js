/**
 * AMEZA Pricing Engine — js/core/pricing.js
 * Single source of truth for pricing calculations, tax resolutions, shipping rates, and coupon validation.
 * ALL internal units are integer cents (minor currency units).
 */

import { formatMoney } from './utils.js';

export const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // $100.00
export const STANDARD_SHIPPING_CENTS = 599; // $5.99
export const EXPRESS_SHIPPING_CENTS = 1299; // $12.99
export const OVERNIGHT_SHIPPING_CENTS = 2499; // $24.99

/**
 * Calculates shipping cost for a given subtotal and method.
 * @param {number} subtotalCents 
 * @param {'standard'|'express'|'overnight'} method 
 * @returns {number} Shipping cost in integer cents.
 */
export function getShippingCost(subtotalCents, method = 'standard') {
  const sub = Math.max(0, parseInt(subtotalCents || 0, 10));
  if (method === 'express') {
    return EXPRESS_SHIPPING_CENTS;
  }
  if (method === 'overnight') {
    return OVERNIGHT_SHIPPING_CENTS;
  }
  // Standard shipping is free at or above threshold
  return sub >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

/**
 * Calculates state sales tax in integer cents.
 * @param {number} subtotalCents 
 * @param {string} stateCode - 2-letter US state abbreviation.
 * @param {Object} taxRates - Map of state codes to decimal rates.
 * @returns {{ taxCents: number, rate: number }}
 */
export function calculateTax(subtotalCents, stateCode, taxRates = {}) {
  const sub = Math.max(0, parseInt(subtotalCents || 0, 10));
  const code = (stateCode || '').toUpperCase().trim();
  const rate = (taxRates && typeof taxRates[code] === 'number') ? taxRates[code] : 0.0625; // Default 6.25%
  const taxCents = Math.round(sub * rate);
  return { taxCents, rate };
}

/**
 * Validates and applies a coupon code against subtotal in integer cents.
 * @param {string} code 
 * @param {number} subtotalCents 
 * @param {Array} couponsList 
 * @returns {{ valid: boolean, discountCents: number, coupon: Object|null, error: string|null }}
 */
export function validateAndApplyCoupon(code, subtotalCents, couponsList = []) {
  if (!code || typeof code !== 'string') {
    return { valid: false, discountCents: 0, coupon: null, error: 'Please enter a coupon code.' };
  }

  const cleanCode = code.trim().toUpperCase();
  const sub = Math.max(0, parseInt(subtotalCents || 0, 10));
  const coupon = couponsList.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, discountCents: 0, coupon: null, error: `Coupon "${cleanCode}" is not recognized.` };
  }

  if (coupon.active === false) {
    return { valid: false, discountCents: 0, coupon, error: `Coupon "${cleanCode}" is currently inactive.` };
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, discountCents: 0, coupon, error: `Coupon "${cleanCode}" is not yet active.` };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, discountCents: 0, coupon, error: `Coupon "${cleanCode}" has expired.` };
  }

  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
    return { valid: false, discountCents: 0, coupon, error: `Coupon "${cleanCode}" usage limit has been reached.` };
  }

  const minSpend = coupon.minSpendCents || 0;
  if (sub < minSpend) {
    return {
      valid: false,
      discountCents: 0,
      coupon,
      error: `Coupon "${cleanCode}" requires a minimum order of ${formatMoney(minSpend)}.`
    };
  }

  let discountCents = 0;
  if (coupon.discountType === 'percentage') {
    discountCents = Math.round((sub * coupon.value) / 100);
  } else if (coupon.discountType === 'fixed_amount') {
    discountCents = Math.min(sub, coupon.value);
  } else if (coupon.discountType === 'fixed_shipping') {
    discountCents = Math.min(STANDARD_SHIPPING_CENTS, coupon.value || STANDARD_SHIPPING_CENTS);
  }

  return { valid: true, discountCents, coupon, error: null };
}

/**
 * Computes discount percentage from compareAtCents and priceCents.
 * Only returns a positive percentage if compareAtCents is strictly higher.
 * @param {number} compareAtCents 
 * @param {number} priceCents 
 * @returns {number} e.g. 25 for 25% off, or 0.
 */
export function calculateDiscountPercent(compareAtCents, priceCents) {
  const compare = Number(compareAtCents) || 0;
  const price = Number(priceCents) || 0;
  if (compare > price && compare > 0) {
    return Math.round(((compare - price) / compare) * 100);
  }
  return 0;
}

/**
 * Groups cart items by merchant / seller.
 * @param {Array} cartItems 
 * @returns {Object} Map of sellerId to vendor group.
 */
export function groupCartBySeller(cartItems = []) {
  const groups = {};
  for (const item of cartItems) {
    const sellerId = item.sellerId || item.seller_id || 'ameza-official';
    const sellerName = item.sellerName || item.seller_name || 'AMEZA Official';
    const sellerSlug = item.sellerSlug || item.seller_slug || 'ameza-official';

    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerName,
        sellerSlug,
        items: [],
        subtotalCents: 0,
        shippingCents: 0
      };
    }

    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    const priceCents = Math.round(Number(item.price) || 0);
    const lineTotal = priceCents * qty;

    groups[sellerId].items.push({
      ...item,
      quantity: qty,
      price: priceCents,
      lineTotalCents: lineTotal
    });
    groups[sellerId].subtotalCents += lineTotal;
  }

  return groups;
}

/**
 * Comprehensive pricing calculator for an entire order.
 * @param {Object} params
 * @returns {Object} Complete breakdown in integer cents.
 */
export function calculateOrderPricing({
  cartItems = [],
  shippingState = 'TX',
  shippingMethod = 'standard',
  coupon = null,
  taxRates = {}
}) {
  const sellerGroups = groupCartBySeller(cartItems);
  const vendors = Object.values(sellerGroups);

  let subtotalCents = 0;
  let totalShippingCents = 0;

  for (const vendor of vendors) {
    subtotalCents += vendor.subtotalCents;
    // Calculate shipping per vendor shipment
    const vendorShip = getShippingCost(vendor.subtotalCents, shippingMethod);
    vendor.shippingCents = vendorShip;
    totalShippingCents += vendorShip;
  }

  // Calculate coupon discount
  let discountCents = 0;
  if (coupon && typeof coupon === 'object') {
    if (coupon.discountType === 'percentage') {
      discountCents = Math.round((subtotalCents * coupon.value) / 100);
    } else if (coupon.discountType === 'fixed_amount') {
      discountCents = Math.min(subtotalCents, coupon.value);
    } else if (coupon.discountType === 'fixed_shipping') {
      discountCents = Math.min(totalShippingCents, coupon.value || STANDARD_SHIPPING_CENTS);
    }
  }

  const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents);
  const { taxCents, rate: taxRate } = calculateTax(discountedSubtotalCents, shippingState, taxRates);
  const grandTotalCents = discountedSubtotalCents + totalShippingCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    discountedSubtotalCents,
    shippingCents: totalShippingCents,
    taxCents,
    taxRate,
    grandTotalCents,
    sellerGroups,
    vendors
  };
}
