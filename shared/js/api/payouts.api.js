/**
 * AMEZA Payouts Engine — js/api/payouts.api.js
 * Handles merchant payout requests, minimum threshold validation,
 * admin approvals, proof attachment, and ledger integrations.
 */

import { LedgerAPI } from './ledger.api.js';

const PAYOUTS_KEY = 'ameza_payout_requests';

function getLocalPayouts() {
  try {
    return JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalPayouts(payouts) {
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
}

export const PayoutsAPI = {
  /**
   * Get all payout requests (Admin or filtered by seller)
   */
  async getPayouts(sellerId = null) {
    const list = getLocalPayouts();
    if (sellerId) {
      return list.filter(p => p.sellerId === sellerId);
    }
    return list;
  },

  /**
   * Request a payout for an U.S. merchant
   * @param {Object} payload - { sellerId, sellerName, amountCents, bankDetails }
   */
  async requestPayout({ sellerId, sellerName, amountCents, bankDetails }) {
    if (!sellerId) return { success: false, error: 'Seller ID is required' };
    
    const balance = LedgerAPI.getSellerBalance(sellerId);
    const minPayout = 5000; // $50.00 minimum threshold

    if (amountCents < minPayout) {
      return { success: false, error: `Minimum payout amount is $${(minPayout / 100).toFixed(2)}.` };
    }

    if (amountCents > balance.availableCents) {
      return { 
        success: false, 
        error: `Insufficient available funds. Available: $${(balance.availableCents / 100).toFixed(2)}, Requested: $${(amountCents / 100).toFixed(2)}` 
      };
    }

    const payouts = getLocalPayouts();
    const newPayout = {
      id: 'pay_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      sellerId,
      sellerName: sellerName || 'Merchant',
      amountCents: Math.round(amountCents),
      status: 'pending',
      requestedAt: Date.now(),
      processedAt: null,
      bankDetails: bankDetails || { routingNumber: '121000358', accountNumber: '••••1234' },
      reference: null,
      proofUrl: null,
      rejectionReason: null
    };

    payouts.unshift(newPayout);
    saveLocalPayouts(payouts);

    // Record pending payout debit on ledger
    await LedgerAPI.recordEntry({
      sellerId,
      payoutId: newPayout.id,
      entryType: 'payout',
      amountCents: -newPayout.amountCents,
      bucket: 'available',
      notes: `Payout request #${newPayout.id} submitted for $${(newPayout.amountCents / 100).toFixed(2)}`
    });

    return { success: true, payout: newPayout };
  },

  /**
   * Admin approves and marks payout as paid
   * @param {string} payoutId
   * @param {string} reference - ABA bank batch reference or PayID trace
   * @param {string} proofUrl
   */
  async approveAndPay(payoutId, reference = null, proofUrl = null) {
    const payouts = getLocalPayouts();
    const payout = payouts.find(p => p.id === payoutId);
    if (!payout) return { success: false, error: 'Payout request not found' };

    payout.status = 'paid';
    payout.processedAt = Date.now();
    payout.reference = reference || `ABA-AMZ-${Date.now().toString().slice(-6)}`;
    payout.proofUrl = proofUrl || 'assets/wp_products/wp_52_0.webp';

    saveLocalPayouts(payouts);

    // Record completed payout bucket transition
    await LedgerAPI.recordEntry({
      sellerId: payout.sellerId,
      payoutId: payout.id,
      entryType: 'payout',
      amountCents: payout.amountCents,
      bucket: 'paid_out',
      notes: `Payout #${payout.id} disbursed via ${payout.reference}`
    });

    return { success: true, payout };
  },

  /**
   * Admin rejects a payout with explanation
   */
  async rejectPayout(payoutId, reason = 'Bank details verification required') {
    const payouts = getLocalPayouts();
    const payout = payouts.find(p => p.id === payoutId);
    if (!payout) return { success: false, error: 'Payout request not found' };

    payout.status = 'rejected';
    payout.rejectionReason = reason;
    payout.processedAt = Date.now();

    saveLocalPayouts(payouts);

    // Refund funds back to seller available bucket
    await LedgerAPI.recordEntry({
      sellerId: payout.sellerId,
      payoutId: payout.id,
      entryType: 'adjustment',
      amountCents: payout.amountCents,
      bucket: 'available',
      notes: `Refund of rejected payout #${payout.id}: ${reason}`
    });

    return { success: true, payout };
  }
};

if (typeof window !== 'undefined') {
  window.AmezaPayoutsAPI = PayoutsAPI;
}
