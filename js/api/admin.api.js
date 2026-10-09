/**
 * AMEZA Super Admin API Client — shared/js/api/admin.api.js
 * Endpoints for platform-wide metrics, vendor verification, content moderation, and finance.
 */

import { OrdersAPI } from './orders.api.js';
import { MarketplaceAPI } from './marketplace.api.js';

export const AdminAPI = {
  /**
   * Fetches top-level system KPI metrics (revenue, orders, active sellers, disputes).
   */
  async getDashboardMetrics() {
    const orders = await OrdersAPI.getAllOrders();
    const products = await MarketplaceAPI.getProducts();
    const vendors = await MarketplaceAPI.getVendors();

    const grossSalesCents = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const platformCommissionCents = orders.reduce((sum, o) => {
      const subs = o.subOrders || [];
      return sum + subs.reduce((sSum, s) => sSum + (s.commission || 0), 0);
    }, 0);

    return {
      grossSalesCents,
      platformCommissionCents,
      totalOrders: orders.length,
      activeProducts: products.length,
      verifiedVendors: vendors.length,
      pendingDisputesCount: 2
    };
  },

  /**
   * Returns list of sellers pending compliance approval or onboarding review.
   */
  async getPendingSellers() {
    const vendors = await MarketplaceAPI.getVendors();
    return vendors.filter(v => v.status === 'pending' || v.verificationStatus === 'under_review');
  },

  /**
   * Approves or rejects a merchant.
   */
  async updateSellerStatus(sellerId, newStatus) {
    const vendors = await MarketplaceAPI.getVendors();
    const target = vendors.find(v => v.id === sellerId);
    if (target) {
      target.status = newStatus;
      localStorage.setItem('ameza_marketplace_vendors', JSON.stringify(vendors));
      return { success: true, vendor: target };
    }
    return { success: false, error: 'Vendor not found' };
  }
};
