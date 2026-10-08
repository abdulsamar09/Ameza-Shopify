/**
 * AMEZA Returns, Refunds & Dispute Escalation Engine — js/api/returns.api.js
 * Handles buyer return requests, merchant approvals, proportional commission reversals,
 * and escalation to admin dispute resolution.
 */

import { LedgerAPI } from './ledger.api.js';

const RETURNS_KEY = 'ameza_order_returns';

function getLocalReturns() {
  try {
    return JSON.parse(localStorage.getItem(RETURNS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalReturns(returns) {
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
}

export const ReturnsAPI = {
  /**
   * Get all returns (optionally filtered by seller or customer)
   */
  async getReturns(filter = {}) {
    let list = getLocalReturns();
    if (filter.sellerId) {
      list = list.filter(r => r.sellerId === filter.sellerId);
    }
    if (filter.customerId) {
      list = list.filter(r => r.customerId === filter.customerId);
    }
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }
    return list;
  },

  /**
   * Customer initiates a return request
   */
  async requestReturn({ subOrderId, sellerId, customerId, reason, photoUrl = null, refundAmountCents }) {
    if (!subOrderId) return { success: false, error: 'Sub-Order ID required' };

    const returns = getLocalReturns();
    const newReturn = {
      id: 'ret_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      subOrderId,
      sellerId,
      customerId,
      reason: reason || 'Item not as described',
      photoUrl: photoUrl || 'assets/wp_products/wp_52_0.webp',
      refundAmountCents: Math.round(refundAmountCents || 0),
      status: 'return_requested',
      createdAt: Date.now(),
      resolvedAt: null,
      disputeNotes: null,
      decision: null
    };

    returns.unshift(newReturn);
    saveLocalReturns(returns);

    // Update sub-order status
    try {
      const subOrders = JSON.parse(localStorage.getItem('ameza_marketplace_sub_orders') || '[]');
      const sub = subOrders.find(s => s.id === subOrderId);
      if (sub) {
        sub.status = 'return_requested';
        localStorage.setItem('ameza_marketplace_sub_orders', JSON.stringify(subOrders));
      }
    } catch (e) {}

    return { success: true, returnRequest: newReturn };
  },

  /**
   * Seller or Admin approves refund and reverses commission proportionally
   */
  async approveRefund(returnId, restockItem = true) {
    const returns = getLocalReturns();
    const ret = returns.find(r => r.id === returnId);
    if (!ret) return { success: false, error: 'Return request not found' };

    ret.status = 'refunded';
    ret.resolvedAt = Date.now();
    ret.decision = 'approved';

    saveLocalReturns(returns);

    // Lookup sub-order to determine commission rate
    const subOrders = JSON.parse(localStorage.getItem('ameza_marketplace_sub_orders') || '[]');
    const sub = subOrders.find(s => s.id === ret.subOrderId);
    const commRate = sub ? (sub.commissionRate || 0.10) : 0.10;

    const refundCents = ret.refundAmountCents || (sub ? sub.subtotalCents : 0);
    const commReversalCents = Math.round(refundCents * commRate);

    // 1. Debit seller gross refund
    await LedgerAPI.recordEntry({
      sellerId: ret.sellerId,
      subOrderId: ret.subOrderId,
      entryType: 'refund',
      amountCents: -refundCents,
      bucket: 'available',
      notes: `Approved customer refund for return #${ret.id}`
    });

    // 2. Reverse platform commission back to seller
    if (commReversalCents > 0) {
      await LedgerAPI.recordEntry({
        sellerId: ret.sellerId,
        subOrderId: ret.subOrderId,
        entryType: 'commission_reversal',
        amountCents: commReversalCents,
        bucket: 'available',
        notes: `Proportional platform commission reversed for return #${ret.id}`
      });
    }

    // 3. Restock inventory if requested
    if (restockItem && sub && sub.items) {
      try {
        const customProducts = JSON.parse(localStorage.getItem('ameza_custom_products') || '[]');
        for (const item of sub.items) {
          const prod = customProducts.find(p => String(p.id) === String(item.productId));
          if (prod) {
            prod.stockCount = (prod.stockCount || 0) + item.quantity;
            prod.inStock = true;
          }
        }
        localStorage.setItem('ameza_custom_products', JSON.stringify(customProducts));
      } catch (e) {}
    }

    // Update sub-order status
    if (sub) {
      sub.status = 'refunded';
      localStorage.setItem('ameza_marketplace_sub_orders', JSON.stringify(subOrders));
    }

    return { success: true, returnRequest: ret };
  },

  /**
   * Seller or Buyer escalates to Admin Dispute
   */
  async escalateToDispute(returnId, notes) {
    const returns = getLocalReturns();
    const ret = returns.find(r => r.id === returnId);
    if (!ret) return { success: false, error: 'Return request not found' };

    ret.status = 'disputed';
    ret.disputeNotes = notes;
    saveLocalReturns(returns);

    // Update sub-order status
    try {
      const subOrders = JSON.parse(localStorage.getItem('ameza_marketplace_sub_orders') || '[]');
      const sub = subOrders.find(s => s.id === ret.subOrderId);
      if (sub) {
        sub.status = 'disputed';
        localStorage.setItem('ameza_marketplace_sub_orders', JSON.stringify(subOrders));
      }
    } catch (e) {}

    return { success: true, returnRequest: ret };
  }
};

if (typeof window !== 'undefined') {
  window.AmezaReturnsAPI = ReturnsAPI;
}
