/**
 * AMEZA Multi-Vendor Double-Entry Ledger Engine — js/api/ledger.api.js
 * Append-only financial ledger tracking vendor sales, commission splits,
 * shipping income, and payout buckets in integer minor units (USD cents).
 */

const LEDGER_STORAGE_KEY = 'ameza_ledger_entries';

function getLocalLedger() {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalLedger(entries) {
  localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(entries));
}

export const LedgerAPI = {
  /**
   * Append an entry to the double-entry ledger.
   * @param {Object} entry
   * @param {string} entry.sellerId
   * @param {string} entry.subOrderId
   * @param {string} entry.entryType - 'sale' | 'commission' | 'shipping_income' | 'cod_commission_due' | 'payout' | 'refund'
   * @param {number} entry.amountCents - Positive for credit, Negative for debit
   * @param {string} entry.bucket - 'pending' | 'available' | 'paid_out'
   * @param {string} entry.notes
   */
  async recordEntry({ sellerId, subOrderId = null, payoutId = null, entryType, amountCents, bucket = 'pending', notes = '' }) {
    if (!sellerId) throw new Error('Seller ID is required for ledger entry');
    const entries = getLocalLedger();

    const newEntry = {
      id: 'led_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      sellerId,
      subOrderId,
      payoutId,
      entryType,
      amountCents: Math.round(Number(amountCents) || 0),
      bucket,
      notes,
      description: notes,
      createdAt: Date.now()
    };

    entries.push(newEntry);
    saveLocalLedger(entries);
    return newEntry;
  },

  /**
   * Calculate exact seller balance buckets from append-only ledger entries.
   * @param {string} sellerId
   */
  getSellerBalance(sellerId) {
    const entries = getLocalLedger().filter(e => e.sellerId === sellerId);

    let pendingCents = 0;
    let availableCents = 0;
    let paidOutCents = 0;
    let grossSalesCents = 0;
    let commissionWithheldCents = 0;

    for (const e of entries) {
      const isDebit = e.entryType === 'commission' || e.entryType === 'cod_commission_due' || e.entryType === 'refund' || e.entryType === 'payout';
      const netAmount = isDebit ? -Math.abs(e.amountCents) : Math.abs(e.amountCents);

      if (e.bucket === 'pending') {
        pendingCents += netAmount;
      } else if (e.bucket === 'available') {
        availableCents += netAmount;
      } else if (e.bucket === 'paid_out') {
        paidOutCents += Math.abs(e.amountCents);
      }

      if (e.entryType === 'sale') {
        grossSalesCents += Math.abs(e.amountCents);
      } else if (e.entryType === 'commission' || e.entryType === 'cod_commission_due') {
        commissionWithheldCents += Math.abs(e.amountCents);
      }
    }

    return {
      sellerId,
      pendingCents: Math.max(0, pendingCents),
      availableCents: Math.max(0, availableCents),
      paidOutCents,
      grossSalesCents,
      commissionWithheldCents,
      netEarnedCents: grossSalesCents - commissionWithheldCents,
      entries
    };
  },

  /**
   * Get all ledger entries for a seller
   */
  async getSellerEntries(sellerId) {
    return getLocalLedger().filter(e => e.sellerId === sellerId);
  },

  getSellerStatement(sellerId) {
    return getLocalLedger().filter(e => e.sellerId === sellerId);
  }
};

if (typeof window !== 'undefined') {
  window.AmezaLedgerAPI = LedgerAPI;
}
