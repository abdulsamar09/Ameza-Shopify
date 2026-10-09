/**
 * AMEZA Multi-Vendor Orders & Commission Splitting Engine — js/api/orders.api.js
 * Creates 1 Parent Order -> N Vendor Sub-Orders with permanent commission snapshots,
 * stock reservation, and double-entry ledger integration.
 */

import { CartAPI } from './cart.api.js';
import { LedgerAPI } from './ledger.api.js';
import { SellerAPI } from './seller.api.js';

const PARENT_ORDERS_KEY = 'ameza_marketplace_parent_orders';
const SUB_ORDERS_KEY = 'ameza_marketplace_sub_orders';

function getLocalParentOrders() {
  try {
    return JSON.parse(localStorage.getItem(PARENT_ORDERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalParentOrders(orders) {
  localStorage.setItem(PARENT_ORDERS_KEY, JSON.stringify(orders));
}

function getLocalSubOrders() {
  try {
    return JSON.parse(localStorage.getItem(SUB_ORDERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalSubOrders(subOrders) {
  localStorage.setItem(SUB_ORDERS_KEY, JSON.stringify(subOrders));
}

export const OrdersAPI = {
  /**
   * Process complete multi-vendor checkout
   */
  async processCheckout({ customerId, cartItems, shippingAddress, paymentMethod = 'card', couponCode = null }) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, error: 'Cannot checkout with an empty cart.' };
    }

    // 1. Calculate and validate cart
    const cartCalc = await CartAPI.calculateCart(cartItems, couponCode);
    if (!cartCalc.isValid) {
      return { success: false, error: cartCalc.errors.join('; ') };
    }

    // 2. Reserve / decrement inventory
    const customProducts = JSON.parse(localStorage.getItem('ameza_custom_products') || '[]');
    for (const item of cartCalc.items) {
      const customProd = customProducts.find(p => String(p.id) === String(item.id));
      if (customProd) {
        if (customProd.stock !== undefined) {
          customProd.stock = Math.max(0, customProd.stock - item.quantity);
        }
        if (customProd.stockCount !== undefined) {
          customProd.stockCount = Math.max(0, customProd.stockCount - item.quantity);
        }
      }
    }
    localStorage.setItem('ameza_custom_products', JSON.stringify(customProducts));

    // 3. Generate Parent Order ID
    const parentOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderTimestamp = Date.now();

    // 4. Create Seller Sub-Orders & Commission Snapshots
    const subOrders = [];
    const vendorsList = Object.values(cartCalc.vendors);
    let subOrderIndex = 1;

    for (const vendor of vendorsList) {
      const seller = await SellerAPI.getSellerById(vendor.sellerId);

      // Determine commission rate hierarchy:
      // 1. Per-product override -> 2. Per-seller override -> 3. Global default (10%)
      let sellerDefaultRate = 10.0;
      if (seller && typeof seller.commissionOverridePct === 'number') {
        sellerDefaultRate = seller.commissionOverridePct;
      } else if (seller && typeof seller.commission_rate === 'number') {
        sellerDefaultRate = seller.commission_rate <= 1 ? seller.commission_rate * 100 : seller.commission_rate;
      } else if (seller && typeof seller.commissionRate === 'number') {
        sellerDefaultRate = seller.commissionRate <= 1 ? seller.commissionRate * 100 : seller.commissionRate;
      } else if (vendor.sellerId === 'ameza-official' || vendor.sellerId === '00000000-0000-0000-0000-000000000001' || vendor.sellerName === 'AMEZA Official') {
        sellerDefaultRate = 0.0;
      }

      let vendorCommissionTotalCents = 0;
      const snapshottedItems = [];

      for (const item of vendor.items) {
        let itemRatePct = sellerDefaultRate;
        if (typeof item.commissionOverridePct === 'number') {
          itemRatePct = item.commissionOverridePct;
        }

        // Commission math (exact minor unit cents)
        const itemCommissionCents = Math.round((item.lineSubtotalCents * itemRatePct) / 100);
        const itemSellerEarningsCents = item.lineSubtotalCents - itemCommissionCents;

        vendorCommissionTotalCents += itemCommissionCents;

        snapshottedItems.push({
          productId: item.id,
          productName: item.name,
          image: item.image,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineSubtotalCents: item.lineSubtotalCents,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          commissionRate: itemRatePct / 100,
          commissionRatePct: itemRatePct,
          commissionAmountCents: itemCommissionCents,
          sellerEarningsCents: itemSellerEarningsCents
        });
      }

      const subOrderId = `${parentOrderId}-S${subOrderIndex++}`;
      const sellerNetEarningsCents = vendor.vendorSubtotalCents - vendorCommissionTotalCents + vendor.shippingCents;

      const subOrder = {
        id: subOrderId,
        parentOrderId,
        sellerId: vendor.sellerId,
        sellerName: vendor.sellerName,
        sellerSlug: vendor.sellerSlug,
        status: 'confirmed',
        payoutStatus: 'on_hold',
        paymentMethod,
        subtotalCents: vendor.vendorSubtotalCents,
        itemSubtotalCents: vendor.vendorSubtotalCents,
        shippingCents: vendor.shippingCents,
        commissionRate: sellerDefaultRate / 100,
        commissionRatePct: sellerDefaultRate,
        commissionCents: vendorCommissionTotalCents,
        commissionTotalCents: vendorCommissionTotalCents,
        sellerNetCents: sellerNetEarningsCents,
        sellerNetEarningsCents,
        items: snapshottedItems,
        createdAt: orderTimestamp,
        deliveredAt: null,
        holdUntil: null,
        carrier: 'USPS',
        trackingNumber: '94001000' + Math.floor(10000000 + Math.random() * 90000000)
      };

      subOrders.push(subOrder);

      // 5. Append to Double-Entry Ledger
      if (paymentMethod === 'cod') {
        // Cash on delivery: Customer pays merchant directly.
        // Platform records a debit commission owed by seller.
        if (vendorCommissionTotalCents > 0) {
          await LedgerAPI.recordEntry({
            sellerId: vendor.sellerId,
            subOrderId,
            entryType: 'cod_commission_due',
            amountCents: vendorCommissionTotalCents,
            bucket: 'available',
            notes: `COD Platform Commission Due (${sellerDefaultRate}% commission) for Order ${subOrderId}`
          });
        }
      } else {
        // Online Card / Stripe: Platform collected funds.
        // Record sale (+) and commission (-) in pending bucket.
        await LedgerAPI.recordEntry({
          sellerId: vendor.sellerId,
          subOrderId,
          entryType: 'sale',
          amountCents: vendor.vendorSubtotalCents,
          bucket: 'pending',
          notes: `Item Gross Sales for Order ${subOrderId}`
        });

        if (vendorCommissionTotalCents > 0) {
          await LedgerAPI.recordEntry({
            sellerId: vendor.sellerId,
            subOrderId,
            entryType: 'commission',
            amountCents: vendorCommissionTotalCents,
            bucket: 'pending',
            notes: `Platform Commission (${sellerDefaultRate}% commission) for Order ${subOrderId}`
          });
        }

        if (vendor.shippingCents > 0) {
          await LedgerAPI.recordEntry({
            sellerId: vendor.sellerId,
            subOrderId,
            entryType: 'shipping_income',
            amountCents: vendor.shippingCents,
            bucket: 'pending',
            notes: `Shipping Compensation for Order ${subOrderId}`
          });
        }
      }
    }

    // 6. Create Parent Order
    const parentOrder = {
      id: parentOrderId,
      orderNumber: parentOrderId,
      customerId: customerId || 'guest',
      currency: 'USD',
      subtotalCents: cartCalc.subtotalCents,
      discountCents: cartCalc.discountCents,
      shippingCents: cartCalc.shippingCents,
      grandTotalCents: cartCalc.grandTotalCents,
      grandTotalAUD: cartCalc.grandTotalCents / 100,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Payment on Delivery' : 'Paid (Verified)',
      shippingAddress: shippingAddress || { address: 'On File', country: 'United States' },
      status: 'confirmed',
      subOrderIds: subOrders.map(s => s.id),
      subOrdersCount: subOrders.length,
      createdAt: orderTimestamp,
      date: new Date(orderTimestamp).toLocaleDateString('en-US')
    };

    // 7. Persist Orders
    const allParentOrders = getLocalParentOrders();
    allParentOrders.unshift(parentOrder);
    saveLocalParentOrders(allParentOrders);

    const allSubOrders = getLocalSubOrders();
    allSubOrders.unshift(...subOrders);
    saveLocalSubOrders(allSubOrders);

    // Also persist into existing user order history ameza_orders_{userId} for backward compatibility
    if (customerId) {
      const userOrdersKey = `ameza_orders_${customerId}`;
      const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
      userOrders.unshift({
        id: parentOrderId,
        status: 'Processing',
        paymentStatus: parentOrder.paymentStatus,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Card',
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : (shippingAddress?.line1 || 'United States'),
        subtotal: parentOrder.subtotalCents / 100,
        shipping: parentOrder.shippingCents / 100,
        total: parentOrder.grandTotalAUD,
        items: cartCalc.items.map(i => ({
          id: i.id,
          name: i.name,
          image: i.image,
          price: i.unitPriceCents / 100,
          quantity: i.quantity,
          sellerName: i.sellerName
        })),
        subOrders: subOrders.map(s => ({
          subOrderId: s.id,
          sellerName: s.sellerName,
          carrier: s.carrier,
          trackingNumber: s.trackingNumber
        })),
        createdAt: orderTimestamp,
        date: parentOrder.date
      });
      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
    }

    return {
      success: true,
      parentOrder,
      subOrders,
      vendorSplits: subOrders.map(s => ({
        subOrderId: s.id,
        sellerName: s.sellerName,
        itemCount: s.items.length,
        subtotalAUD: s.subtotalCents / 100,
        commissionAUD: s.commissionTotalCents / 100,
        sellerEarningsAUD: s.sellerNetEarningsCents / 100,
        trackingNumber: s.trackingNumber
      }))
    };
  },

  /**
   * Complete Mock Order Creation Engine
   * Validates stock, resolves per-seller delivery methods, applies state tax, validates coupons,
   * snapshots commissions, writes to double-entry ledger, and persists parent and sub-orders.
   */
  async createOrder({
    customerId = 'guest',
    customerName = 'Valued Customer',
    customerEmail = 'customer@example.com',
    cartItems = [],
    shippingAddress = {},
    sellerDeliveryMethods = {},
    paymentMethod = 'card',
    simulatePaymentFailure = false,
    couponCode = null,
    taxRates = null
  }) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, error: 'Cannot create an order with an empty cart.' };
    }

    // 1. Re-check stock against catalog & stored custom products
    const customProducts = JSON.parse(localStorage.getItem('ameza_custom_products') || '[]');
    for (const item of cartItems) {
      const customProd = customProducts.find(p => String(p.id) === String(item.id));
      if (customProd) {
        const available = customProd.stock !== undefined ? customProd.stock : (customProd.stockCount !== undefined ? customProd.stockCount : 999);
        const requested = Math.max(1, parseInt(item.quantity || 1, 10));
        if (available < requested) {
          return {
            success: false,
            errorCode: 'OUT_OF_STOCK',
            error: `Insufficient stock for "${item.name || customProd.name}". Available: ${available}, Requested: ${requested}`,
            outOfStockItem: {
              id: item.id,
              name: item.name || customProd.name,
              availableStock: available,
              requested
            }
          };
        }
      }
    }

    // 2. Simulated payment provider check
    if (simulatePaymentFailure) {
      return {
        success: false,
        errorCode: 'PAYMENT_FAILED',
        error: 'Payment authorization failed with mock provider. Your card was not charged. Please try again.'
      };
    }

    // 3. Group items by seller
    const sellerGroups = {};
    for (const item of cartItems) {
      const sellerId = item.sellerId || item.seller_id || '00000000-0000-0000-0000-000000000001';
      const sellerName = item.sellerName || item.seller_name || 'AMEZA Official';
      const sellerSlug = item.sellerSlug || item.seller_slug || 'ameza-official';

      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          sellerId,
          sellerName,
          sellerSlug,
          items: [],
          subtotalCents: 0,
          shippingCents: 0,
          carrier: 'USPS',
          deliveryMethod: 'standard'
        };
      }

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const unitPriceCents = Math.round(Number(item.priceCents !== undefined ? item.priceCents : item.price) || 0);
      const lineTotalCents = unitPriceCents * qty;

      sellerGroups[sellerId].items.push({
        id: item.id,
        productId: item.id,
        name: item.name || 'Handcrafted Product',
        productName: item.name || 'Handcrafted Product',
        image: item.image || '',
        quantity: qty,
        unitPriceCents,
        lineSubtotalCents: lineTotalCents,
        selectedColor: item.options?.color || item.selectedColor || null,
        selectedSize: item.options?.size || item.selectedSize || null,
        sellerId,
        sellerName,
        sellerSlug,
        commissionOverridePct: item.commissionOverridePct !== undefined ? item.commissionOverridePct : null
      });

      sellerGroups[sellerId].subtotalCents += lineTotalCents;
    }

    // 4. Calculate per-seller shipping
    let itemsSubtotalCents = 0;
    let totalShippingCents = 0;

    for (const sId in sellerGroups) {
      const group = sellerGroups[sId];
      itemsSubtotalCents += group.subtotalCents;

      const pref = sellerDeliveryMethods[sId] || { method: 'standard', carrier: 'USPS' };
      group.deliveryMethod = pref.method || 'standard';
      group.carrier = pref.carrier || (group.deliveryMethod === 'express' ? 'UPS' : 'USPS');

      if (group.deliveryMethod === 'express') {
        group.shippingCents = 1299; // $12.99
      } else if (group.deliveryMethod === 'overnight') {
        group.shippingCents = 2499; // $24.99
      } else {
        // Standard $5.99, free over $100 (10000 cents)
        group.shippingCents = group.subtotalCents >= 10000 ? 0 : 599;
      }

      totalShippingCents += group.shippingCents;
    }

    // 5. Coupon validation
    let discountCents = 0;
    let appliedCouponInfo = null;

    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      let couponsList = [];
      try {
        const raw = localStorage.getItem('ameza_coupons');
        if (raw) couponsList = JSON.parse(raw);
      } catch (e) {}

      if (couponsList.length === 0) {
        couponsList = [
          { code: 'SAVE10', discountType: 'percentage', value: 10, minSpendCents: 5000, active: true },
          { code: 'FREESHIP', discountType: 'fixed_shipping', value: totalShippingCents, minSpendCents: 5000, active: true },
          { code: 'SPRING20', discountType: 'percentage', value: 20, minSpendCents: 10000, active: true },
          { code: 'WELCOME5', discountType: 'fixed_amount', value: 500, minSpendCents: 3500, active: true },
          { code: 'SUMMER25', discountType: 'percentage', value: 25, minSpendCents: 10000, active: true }
        ];
      }

      const foundCoupon = couponsList.find(c => c.code.toUpperCase() === code);
      if (!foundCoupon) {
        return { success: false, errorCode: 'INVALID_COUPON', error: `Coupon code "${code}" is not valid.` };
      }

      if (foundCoupon.active === false) {
        return { success: false, errorCode: 'INVALID_COUPON', error: `Coupon code "${code}" is inactive.` };
      }

      const minSpend = foundCoupon.minSpendCents || 0;
      if (itemsSubtotalCents < minSpend) {
        return {
          success: false,
          errorCode: 'MIN_SPEND_NOT_MET',
          error: `Coupon "${code}" requires a minimum order of $${(minSpend / 100).toFixed(2)}.`
        };
      }

      if (foundCoupon.discountType === 'percentage') {
        discountCents = Math.round((itemsSubtotalCents * foundCoupon.value) / 100);
      } else if (foundCoupon.discountType === 'fixed_amount') {
        discountCents = Math.min(itemsSubtotalCents, foundCoupon.value);
      } else if (foundCoupon.discountType === 'fixed_shipping') {
        discountCents = totalShippingCents;
      }

      appliedCouponInfo = { code, discountCents, discountType: foundCoupon.discountType, value: foundCoupon.value };
    }

    const discountedSubtotalCents = Math.max(0, itemsSubtotalCents - discountCents);

    // 6. State sales tax calculation
    const stateCode = (shippingAddress.state || 'TX').toUpperCase().trim();
    let rates = taxRates;
    if (!rates) {
      try {
        const rawTax = localStorage.getItem('ameza_tax_rates');
        if (rawTax) rates = JSON.parse(rawTax);
      } catch (e) {}
    }
    const stateRate = (rates && typeof rates[stateCode] === 'number') ? rates[stateCode] : 0.0625;
    const taxCents = Math.round(discountedSubtotalCents * stateRate);

    // 7. Grand total
    const grandTotalCents = discountedSubtotalCents + totalShippingCents + taxCents;

    // 8. Inventory decrement
    for (const item of cartItems) {
      const customProd = customProducts.find(p => String(p.id) === String(item.id));
      if (customProd) {
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        if (customProd.stock !== undefined) customProd.stock = Math.max(0, customProd.stock - qty);
        if (customProd.stockCount !== undefined) customProd.stockCount = Math.max(0, customProd.stockCount - qty);
      }
    }
    localStorage.setItem('ameza_custom_products', JSON.stringify(customProducts));

    // 9. Generate parent order ID
    const parentOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderTimestamp = Date.now();

    // 10. Create sub-orders & ledger entries
    const subOrders = [];
    const vendorsList = Object.values(sellerGroups);
    let subOrderIndex = 1;

    for (const vendor of vendorsList) {
      const seller = await SellerAPI.getSellerById(vendor.sellerId);

      let sellerDefaultRate = 10.0;
      if (seller && typeof seller.commissionOverridePct === 'number') {
        sellerDefaultRate = seller.commissionOverridePct;
      } else if (seller && typeof seller.commission_rate === 'number') {
        sellerDefaultRate = seller.commission_rate <= 1 ? seller.commission_rate * 100 : seller.commission_rate;
      } else if (seller && typeof seller.commissionRate === 'number') {
        sellerDefaultRate = seller.commissionRate <= 1 ? seller.commissionRate * 100 : seller.commissionRate;
      } else if (vendor.sellerId === 'ameza-official' || vendor.sellerId === '00000000-0000-0000-0000-000000000001' || vendor.sellerName === 'AMEZA Official') {
        sellerDefaultRate = 0.0;
      }

      let vendorCommissionTotalCents = 0;
      const snapshottedItems = [];

      for (const item of vendor.items) {
        let itemRatePct = sellerDefaultRate;
        if (typeof item.commissionOverridePct === 'number') {
          itemRatePct = item.commissionOverridePct;
        }

        const itemCommissionCents = Math.round((item.lineSubtotalCents * itemRatePct) / 100);
        const itemSellerEarningsCents = item.lineSubtotalCents - itemCommissionCents;

        vendorCommissionTotalCents += itemCommissionCents;

        snapshottedItems.push({
          productId: item.id,
          productName: item.name,
          image: item.image,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineSubtotalCents: item.lineSubtotalCents,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          commissionRate: itemRatePct / 100,
          commissionRatePct: itemRatePct,
          commissionAmountCents: itemCommissionCents,
          sellerEarningsCents: itemSellerEarningsCents
        });
      }

      const subOrderId = `${parentOrderId}-S${subOrderIndex++}`;
      const sellerNetEarningsCents = vendor.subtotalCents - vendorCommissionTotalCents + vendor.shippingCents;

      const subOrder = {
        id: subOrderId,
        parentOrderId,
        sellerId: vendor.sellerId,
        sellerName: vendor.sellerName,
        sellerSlug: vendor.sellerSlug,
        status: 'confirmed',
        payoutStatus: 'on_hold',
        paymentMethod,
        subtotalCents: vendor.subtotalCents,
        itemSubtotalCents: vendor.subtotalCents,
        shippingCents: vendor.shippingCents,
        commissionRate: sellerDefaultRate / 100,
        commissionRatePct: sellerDefaultRate,
        commissionCents: vendorCommissionTotalCents,
        commissionTotalCents: vendorCommissionTotalCents,
        sellerNetCents: sellerNetEarningsCents,
        sellerNetEarningsCents,
        items: snapshottedItems,
        createdAt: orderTimestamp,
        deliveredAt: null,
        holdUntil: null,
        carrier: vendor.carrier,
        trackingNumber: '94001000' + Math.floor(10000000 + Math.random() * 90000000)
      };

      subOrders.push(subOrder);

      // Ledger double-entry
      if (LedgerAPI && typeof LedgerAPI.recordEntry === 'function') {
        await LedgerAPI.recordEntry({
          sellerId: vendor.sellerId,
          subOrderId,
          entryType: 'sale',
          amountCents: vendor.subtotalCents,
          bucket: 'pending',
          notes: `Item Gross Sales for Order ${subOrderId}`
        });

        if (vendorCommissionTotalCents > 0) {
          await LedgerAPI.recordEntry({
            sellerId: vendor.sellerId,
            subOrderId,
            entryType: 'commission',
            amountCents: vendorCommissionTotalCents,
            bucket: 'pending',
            notes: `Platform Commission (${sellerDefaultRate}% commission) for Order ${subOrderId}`
          });
        }

        if (vendor.shippingCents > 0) {
          await LedgerAPI.recordEntry({
            sellerId: vendor.sellerId,
            subOrderId,
            entryType: 'shipping_income',
            amountCents: vendor.shippingCents,
            bucket: 'pending',
            notes: `Shipping Compensation for Order ${subOrderId}`
          });
        }
      }

      // Persist to individual seller orders
      try {
        const sellerKey = `ameza_seller_orders_${vendor.sellerId}`;
        const sellerExisting = JSON.parse(localStorage.getItem(sellerKey) || '[]');
        sellerExisting.unshift(subOrder);
        localStorage.setItem(sellerKey, JSON.stringify(sellerExisting));
      } catch (e) {}
    }

    // 11. Parent order
    const parentOrder = {
      id: parentOrderId,
      orderNumber: parentOrderId,
      customerId: customerId || 'guest',
      customerName,
      customerEmail,
      currency: 'USD',
      subtotalCents: itemsSubtotalCents,
      discountCents,
      shippingCents: totalShippingCents,
      taxCents,
      taxRate: stateRate,
      grandTotalCents,
      paymentMethod,
      paymentStatus: 'Paid (Verified)',
      shippingAddress,
      sellerDeliveryMethods,
      status: 'confirmed',
      subOrderIds: subOrders.map(s => s.id),
      subOrdersCount: subOrders.length,
      createdAt: orderTimestamp,
      date: new Date(orderTimestamp).toLocaleDateString('en-US'),
      coupon: appliedCouponInfo
    };

    // 12. Persist parent and sub-orders
    const allParentOrders = getLocalParentOrders();
    allParentOrders.unshift(parentOrder);
    saveLocalParentOrders(allParentOrders);

    const allSubOrders = getLocalSubOrders();
    allSubOrders.unshift(...subOrders);
    saveLocalSubOrders(allSubOrders);

    // Buyer history
    if (customerId) {
      const userOrdersKey = `ameza_orders_${customerId}`;
      const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
      userOrders.unshift({
        id: parentOrderId,
        status: 'Processing',
        paymentStatus: parentOrder.paymentStatus,
        paymentMethod,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : `${shippingAddress.address || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zip || ''}`,
        subtotal: parentOrder.subtotalCents / 100,
        shipping: parentOrder.shippingCents / 100,
        tax: parentOrder.taxCents / 100,
        total: parentOrder.grandTotalCents / 100,
        subtotalCents: parentOrder.subtotalCents,
        shippingCents: parentOrder.shippingCents,
        taxCents: parentOrder.taxCents,
        grandTotalCents: parentOrder.grandTotalCents,
        items: cartItems,
        subOrders: subOrders.map(s => ({
          subOrderId: s.id,
          sellerName: s.sellerName,
          carrier: s.carrier,
          trackingNumber: s.trackingNumber
        })),
        createdAt: orderTimestamp,
        date: parentOrder.date
      });
      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
    }

    return {
      success: true,
      parentOrder,
      subOrders,
      orderId: parentOrderId
    };
  },

  /**
   * Get sub-orders for a specific seller
   */
  async getSellerOrders(sellerId) {
    const subOrders = getLocalSubOrders();
    return subOrders.filter(s => s.sellerId === sellerId);
  },

  /**
   * Get full details of parent order including its sub-orders
   */
  async getParentOrderDetails(orderId) {
    const parentOrders = getLocalParentOrders();
    const parent = parentOrders.find(o => o.id === orderId);
    if (!parent) return null;

    const subOrders = getLocalSubOrders().filter(s => s.parentOrderId === orderId);
    return { ...parent, subOrders };
  }
};

if (typeof window !== 'undefined') {
  window.AmezaOrdersAPI = OrdersAPI;
}
