/**
 * AMEZA Cart & Multi-Vendor Pricing Engine — js/api/cart.api.js
 * Calculates pricing, server-side validation, coupon discounts,
 * and groups cart items by vendor in integer minor units (USD cents).
 */

import { CatalogAPI } from './catalog.api.js';

export const CartAPI = {
  /**
   * Validate and compute pricing for cart items.
   * All internal computations use integer cents.
   * @param {Array} cartItems - [{ id, quantity, selectedColor, selectedSize }]
   * @param {string|null} couponCode - optional coupon string
   */
  async calculateCart(cartItems = [], couponCode = null) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return {
        items: [],
        vendors: {},
        subtotalCents: 0,
        discountCents: 0,
        shippingCents: 0,
        grandTotalCents: 0,
        appliedCoupon: null,
        isValid: true
      };
    }

    const allProducts = await CatalogAPI.getProducts();
    const validatedItems = [];
    const vendors = {};
    let subtotalCents = 0;
    let totalItems = 0;
    let errors = [];

    for (const item of cartItems) {
      let product = allProducts.find(p => String(p.id) === String(item.id) || String(p.dbId) === String(item.id));
      if (!product) {
        if (item.name && item.price !== undefined) {
          product = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || '',
            category: item.category || 'General',
            stockCount: item.stockCount !== undefined ? item.stockCount : (item.stock !== undefined ? item.stock : 999),
            sellerId: item.sellerId || item.seller_id || '00000000-0000-0000-0000-000000000001',
            sellerName: item.sellerName || item.seller_name || 'AMEZA Official',
            sellerSlug: item.sellerSlug || 'ameza-official'
          };
        } else {
          errors.push(`Product #${item.id} not found in catalog.`);
          continue;
        }
      }

      const availableStock = product.stockCount !== undefined ? product.stockCount : (product.stock !== undefined ? product.stock : 999);
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      if (availableStock < qty) {
        errors.push(`Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${qty}`);
      }

      const unitPriceCents = Math.round(Number(product.price || 0) * 100);
      const lineSubtotalCents = unitPriceCents * qty;
      subtotalCents += lineSubtotalCents;
      totalItems += qty;

      const sellerId = product.sellerId || product.seller_id || '00000000-0000-0000-0000-000000000001';
      const sellerName = product.sellerName || product.seller_name || 'AMEZA Official';
      const sellerSlug = product.sellerSlug || 'ameza-official';

      const validatedItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        quantity: qty,
        unitPriceCents,
        lineSubtotalCents,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        sellerId,
        sellerName,
        sellerSlug,
        commissionOverridePct: product.commissionOverridePct !== undefined ? product.commissionOverridePct : null
      };

      validatedItems.push(validatedItem);

      // Group by vendor
      if (!vendors[sellerId]) {
        vendors[sellerId] = {
          sellerId,
          sellerName,
          sellerSlug,
          items: [],
          vendorSubtotalCents: 0,
          itemSubtotalCents: 0,
          shippingCents: 0
        };
      }
      vendors[sellerId].items.push(validatedItem);
      vendors[sellerId].vendorSubtotalCents += lineSubtotalCents;
      vendors[sellerId].itemSubtotalCents += lineSubtotalCents;
    }

    // Shipping calculation: Free if vendor subtotal >= $100.00 (10000 cents), else $10.00 (1000 cents)
    let totalShippingCents = 0;
    Object.values(vendors).forEach(v => {
      if (v.vendorSubtotalCents < 10000) {
        v.shippingCents = 1000; // $10.00
      } else {
        v.shippingCents = 0;    // Free Shipping
      }
      totalShippingCents += v.shippingCents;
    });

    // Coupon logic (server-side evaluated)
    let discountCents = 0;
    let appliedCouponInfo = null;

    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      if (code === 'AMEZA20') {
        discountCents = Math.round(subtotalCents * 0.20);
        appliedCouponInfo = { code: 'AMEZA20', discountPct: 20, discountCents };
      } else if (code === 'FREESHIP') {
        discountCents = totalShippingCents;
        totalShippingCents = 0;
        appliedCouponInfo = { code: 'FREESHIP', freeShipping: true, discountCents };
      } else if (code === 'WELCOME10') {
        discountCents = 1000; // $10.00 fixed
        appliedCouponInfo = { code: 'WELCOME10', discountFixed: 1000, discountCents };
      }
    }

    const grandTotalCents = Math.max(0, subtotalCents - discountCents + totalShippingCents);

    return {
      items: validatedItems,
      totalItems,
      vendors,
      vendorGroups: Object.values(vendors),
      subtotalCents,
      itemSubtotalCents: subtotalCents,
      discountCents,
      shippingCents: totalShippingCents,
      grandTotalCents,
      appliedCoupon: appliedCouponInfo,
      errors,
      error: errors.join('; '),
      isValid: errors.length === 0
    };
  }
};

if (typeof window !== 'undefined') {
  window.AmezaCartAPI = CartAPI;
}
