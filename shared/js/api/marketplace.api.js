/**
 * AMEZA Marketplace Unified API Service — js/api/marketplace.api.js
 * Asynchronous facade layer accessing /mock/*.json datasets with local mutations.
 */

import { fetchMock } from './mock-client.js';

export const MarketplaceAPI = {
  // ─── Sellers ─────────────────────────────────────────────────────────────
  async getSellers(filter = {}) {
    const list = await fetchMock('sellers');
    let results = list;
    if (filter.status) {
      results = results.filter(s => s.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(s =>
        s.storeName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }
    return results;
  },

  async getSellerById(id) {
    const list = await fetchMock('sellers');
    return list.find(s => s.id === id || s.slug === id) || null;
  },

  async approveSeller(sellerId) {
    const list = await fetchMock('sellers');
    const target = list.find(s => s.id === sellerId);
    if (target) {
      target.status = 'approved';
    }
    return target;
  },

  // ─── Products ────────────────────────────────────────────────────────────
  async getProducts(filter = {}) {
    let list = await fetchMock('products');
    if (filter.category && filter.category !== 'all') {
      list = list.filter(p => p.category === filter.category);
    }
    if (filter.sellerId) {
      list = list.filter(p => p.sellerId === filter.sellerId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filter.sort) {
      if (filter.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
      else if (filter.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
      else if (filter.sort === 'rating') list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    }
    if (filter.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  },

  async getProductById(id) {
    const list = await fetchMock('products');
    return list.find(p => p.id === id || p.slug === id) || null;
  },

  // ─── Orders ──────────────────────────────────────────────────────────────
  async getOrders(filter = {}) {
    let list = await fetchMock('orders');
    if (filter.status && filter.status !== 'all') {
      list = list.filter(o => o.status === filter.status);
    }
    if (filter.sellerId) {
      list = list.filter(o => o.subOrders.some(so => so.sellerId === filter.sellerId));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getOrderById(id) {
    const list = await fetchMock('orders');
    return list.find(o => o.id === id) || null;
  },

  // ─── Customers ───────────────────────────────────────────────────────────
  async getCustomers(filter = {}) {
    let list = await fetchMock('customers');
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return list;
  },

  // ─── Payouts ─────────────────────────────────────────────────────────────
  async getPayouts(sellerId = null) {
    let list = await fetchMock('payouts');
    if (sellerId) {
      list = list.filter(p => p.sellerId === sellerId);
    }
    return list;
  },

  // ─── Reviews ─────────────────────────────────────────────────────────────
  async getReviews(productId = null) {
    let list = await fetchMock('reviews');
    if (productId) {
      list = list.filter(r => r.productId === productId);
    }
    return list;
  },

  // ─── Categories ──────────────────────────────────────────────────────────
  async getCategories() {
    return await fetchMock('categories');
  },

  // ─── Notifications & Messages ────────────────────────────────────────────
  async getNotifications() {
    return await fetchMock('notifications');
  },

  async getMessages() {
    return await fetchMock('messages');
  },

  // ─── Platform Administration (Commission, Ledger, Audit, Staff) ──────────
  async getCommissionRules() {
    return await fetchMock('commission_rules');
  },

  async getLedgerEntries(sellerId = null) {
    let list = await fetchMock('ledger_entries');
    if (sellerId) {
      list = list.filter(l => l.sellerId === sellerId);
    }
    return list;
  },

  async getAuditLog() {
    return await fetchMock('audit_log');
  },

  async getStaffRoles() {
    return await fetchMock('staff_roles');
  }
};

if (typeof window !== 'undefined') {
  window.MarketplaceAPI = MarketplaceAPI;
}
