/**
 * AMEZA Multi-Vendor Seller API Engine — js/api/seller.api.js
 * Comprehensive seller onboarding, store management, product CRUD, 
 * moderation queues, and CSV bulk import (USA Standard).
 */

import { apiFetch, config } from './client.js';
import { CatalogAPI } from './catalog.api.js';
import { escapeHTML } from '../core/utils.js';

const SELLER_STORAGE_KEYS = {
  SELLERS: 'ameza_sellers',
  APPLICATIONS: 'ameza_seller_applications',
  SELLER_PRODUCTS: 'ameza_custom_products'
};

// Initial house seller (USA)
const DEFAULT_HOUSE_SELLER = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000002',
  storeName: 'AMEZA Official',
  slug: 'ameza-official',
  logoUrl: 'assets/ameza-logo.png',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  description: 'Official AMEZA U.S. Flagship Store. Premium lifestyle, leather goods, and certified essentials dispatched nationwide.',
  status: 'approved',
  commissionOverridePct: 0.0,
  isTrusted: true,
  country: 'US',
  city: 'Austin, TX',
  policies: {
    shipping: 'Fast express dispatch across the United States via USPS Priority Mail & UPS. Free delivery on orders over $100.',
    refund: '30-day hassle-free money back guarantee across all 50 states.'
  },
  settings: {
    accentColor: '#7FB73C',
    vacationMode: false
  },
  ratingAvg: 5.0,
  ratingCount: 142
};

function getLocalSellers() {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEYS.SELLERS);
    if (!raw) {
      const initial = [DEFAULT_HOUSE_SELLER];
      localStorage.setItem(SELLER_STORAGE_KEYS.SELLERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [DEFAULT_HOUSE_SELLER];
  }
}

function saveLocalSellers(sellers) {
  localStorage.setItem(SELLER_STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
}

function getLocalApplications() {
  try {
    return JSON.parse(localStorage.getItem(SELLER_STORAGE_KEYS.APPLICATIONS) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalApplications(apps) {
  localStorage.setItem(SELLER_STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
}

function getLocalCustomProducts() {
  try {
    return JSON.parse(localStorage.getItem(SELLER_STORAGE_KEYS.SELLER_PRODUCTS) || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalCustomProducts(prods) {
  localStorage.setItem(SELLER_STORAGE_KEYS.SELLER_PRODUCTS, JSON.stringify(prods));
}

export const SellerAPI = {
  /**
   * Get all active sellers
   */
  async getSellers() {
    if (config.isConfigured()) {
      const { data, error } = await apiFetch('sellers?status=eq.approved&order=store_name.asc');
      if (!error && Array.isArray(data)) return data;
    }
    return getLocalSellers().filter(s => s.status === 'approved');
  },

  /**
   * Get seller by slug
   */
  async getSellerBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    if (config.isConfigured()) {
      const { data, error } = await apiFetch(`sellers?slug=eq.${encodeURIComponent(cleanSlug)}&limit=1`);
      if (!error && Array.isArray(data) && data[0]) return data[0];
    }
    return getLocalSellers().find(s => s.slug === cleanSlug) || null;
  },

  /**
   * Get seller by ID
   */
  async getSellerById(id) {
    if (!id) return null;
    const sellers = getLocalSellers();
    return sellers.find(s => s.id === id) || null;
  },

  /**
   * Get seller belonging to current authenticated user
   */
  async getCurrentUserSeller() {
    const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
    const user = session?.user || (window.AmezaAuth && window.AmezaAuth.getCurrentUser());
    if (!user || !user.id) return null;

    const sellers = getLocalSellers();
    return sellers.find(s => s.userId === user.id) || null;
  },

  /**
   * Submit seller onboarding application (USA)
   */
  async submitSellerApplication(appData) {
    const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
    const user = session?.user || (window.AmezaAuth && window.AmezaAuth.getCurrentUser());
    if (!user || !user.id) {
      return { success: false, error: 'You must be logged in to apply as a seller.' };
    }

    const sellers = getLocalSellers();
    const existing = sellers.find(s => s.userId === user.id);
    if (existing && existing.status === 'approved') {
      return { success: false, error: 'You are already an approved seller on AMEZA.' };
    }

    const sellerId = existing?.id || 'sel_' + Math.floor(100000 + Math.random() * 900000);
    const slug = (appData.storeName || 'store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + sellerId.slice(-4);

    const newSeller = {
      id: sellerId,
      userId: user.id,
      storeName: appData.storeName.trim(),
      slug,
      logoUrl: appData.logoUrl || 'assets/ameza-logo.png',
      bannerUrl: appData.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      description: appData.description || '',
      status: 'under_review',
      commissionOverridePct: 10.0,
      isTrusted: false,
      country: 'US',
      city: `${appData.city || 'Austin'}, ${appData.state || 'TX'}`,
      policies: {
        shipping: appData.shippingPolicy || 'Standard and express nationwide U.S. shipping via USPS, UPS, and FedEx.',
        refund: appData.returnPolicy || '30-day money back guarantee across the United States.'
      },
      settings: {
        accentColor: '#7FB73C',
        vacationMode: false
      },
      businessDetails: {
        businessType: appData.businessType || 'individual',
        taxIdType: appData.taxIdType || 'EIN',
        taxIdMasked: appData.taxIdMasked || '***-**-1234',
        w9Status: 'certified',
        contactPhone: appData.phone || user.phone || '(555) 012-3456'
      },
      payoutMethod: {
        type: 'ach_bank',
        bankName: appData.bankName || 'JPMorgan Chase',
        accountName: appData.payoutAccountName || appData.storeName,
        routingNumber: appData.routingNumber || '111000025',
        accountNumber: appData.payoutAccountNumber ? '•••• ' + appData.payoutAccountNumber.slice(-4) : '•••• 4821'
      },
      ratingAvg: 5.0,
      ratingCount: 0,
      appliedAt: Date.now()
    };

    // Save seller
    const updatedSellers = sellers.filter(s => s.id !== sellerId);
    updatedSellers.push(newSeller);
    saveLocalSellers(updatedSellers);

    // Save application record
    const apps = getLocalApplications();
    apps.unshift({
      id: 'app_' + Date.now(),
      sellerId,
      storeName: newSeller.storeName,
      userEmail: user.email,
      submittedAt: Date.now(),
      status: 'under_review',
      details: newSeller
    });
    saveLocalApplications(apps);

    return { success: true, seller: newSeller };
  },

  /**
   * Admin: get all pending applications
   */
  async getPendingApplications() {
    const apps = getLocalApplications();
    return apps.filter(a => a.status === 'under_review');
  },

  /**
   * Admin: approve seller
   */
  async approveSeller(sellerId) {
    const sellers = getLocalSellers();
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return { success: false, error: 'Seller not found' };

    seller.status = 'approved';
    saveLocalSellers(sellers);

    // Update application
    const apps = getLocalApplications();
    const app = apps.find(a => a.sellerId === sellerId);
    if (app) app.status = 'approved';
    saveLocalApplications(apps);

    return { success: true, seller };
  },

  /**
   * Admin: reject seller
   */
  async rejectSeller(sellerId, reason) {
    const sellers = getLocalSellers();
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return { success: false, error: 'Seller not found' };

    seller.status = 'rejected';
    seller.rejectionReason = reason;
    saveLocalSellers(sellers);

    const apps = getLocalApplications();
    const app = apps.find(a => a.sellerId === sellerId);
    if (app) {
      app.status = 'rejected';
      app.rejectionReason = reason;
    }
    saveLocalApplications(apps);

    return { success: true };
  },

  /**
   * Get products listed by specific seller
   */
  async getProductsBySeller(sellerId) {
    const allProducts = await CatalogAPI.getProducts();
    const customProducts = getLocalCustomProducts();
    const map = new Map();
    [...allProducts, ...customProducts].forEach(p => {
      if (p.sellerId === sellerId && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  },

  /**
   * Create or update product for seller
   */
  async saveProduct(productData, seller) {
    if (!seller || !seller.id) {
      return { success: false, error: 'Unauthorized seller' };
    }

    const customProducts = getLocalCustomProducts();
    const isEdit = Boolean(productData.id);
    const prodId = isEdit ? productData.id : 'PRD-' + Math.floor(100000 + Math.random() * 900000);

    const basePriceUSD = Number(productData.price) || 0;
    const comparePriceUSD = productData.oldPrice ? Number(productData.oldPrice) : null;
    const discountStr = comparePriceUSD && comparePriceUSD > basePriceUSD
      ? `-${Math.round((1 - basePriceUSD / comparePriceUSD) * 100)}%`
      : '';

    // Status: if trusted seller, publish immediately; otherwise pending review
    const status = seller.isTrusted ? 'published' : 'pending_review';

    const cleanProduct = {
      id: prodId,
      name: productData.name.trim(),
      slug: (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + prodId,
      category: productData.category || 'Accessories',
      categorySlug: (productData.category || 'accessories').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      price: basePriceUSD,
      oldPrice: comparePriceUSD,
      discount: discountStr,
      rating: 5.0,
      reviews: 0,
      badge: productData.badge || (seller.isTrusted ? 'NEW' : null),
      image: productData.image || 'assets/wp_products/wp_549_0.webp',
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : [productData.image || 'assets/wp_products/wp_549_0.webp'],
      section: productData.section || 'latest-range',
      description: productData.description || '',
      features: Array.isArray(productData.features) ? productData.features : ['100% Genuine Quality Guarantee', 'Fast USPS / UPS Priority Dispatch'],
      inStock: Boolean(productData.stockCount > 0),
      stockCount: Number(productData.stockCount) || 10,
      isDeal: Boolean(productData.isDeal),
      colors: productData.colors || null,
      sizes: productData.sizes || null,
      sellerId: seller.id,
      sellerName: seller.storeName,
      sellerSlug: seller.slug,
      status: isEdit && productData.status ? productData.status : status,
      updatedAt: Date.now()
    };

    if (isEdit) {
      const idx = customProducts.findIndex(p => p.id === prodId);
      if (idx > -1) customProducts[idx] = cleanProduct;
      else customProducts.push(cleanProduct);
    } else {
      customProducts.unshift(cleanProduct);
    }

    saveLocalCustomProducts(customProducts);
    return { success: true, product: cleanProduct };
  },

  /**
   * Delete seller product
   */
  async deleteProduct(productId, sellerId) {
    let customProducts = getLocalCustomProducts();
    const product = customProducts.find(p => p.id === productId);
    if (!product) return { success: false, error: 'Product not found' };
    if (product.sellerId !== sellerId) return { success: false, error: 'Unauthorized to delete this product' };

    customProducts = customProducts.filter(p => p.id !== productId);
    saveLocalCustomProducts(customProducts);
    return { success: true };
  },

  /**
   * Bulk import CSV
   */
  async importWooCommerceCSV(csvText, seller) {
    if (!csvText || !seller) return { success: false, error: 'Invalid CSV or seller' };

    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return { success: false, error: 'CSV file is empty or missing data rows' };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const importedProducts = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (row.length < 2) continue;

      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = row[idx] || '';
      });

      const name = rowObj['Name'] || rowObj['Title'] || rowObj['post_title'] || '';
      if (!name) continue;

      const regPrice = parseFloat(rowObj['Regular price'] || rowObj['Price'] || '49.00') || 49.00;
      const salePrice = parseFloat(rowObj['Sale price'] || '') || null;
      const finalPrice = salePrice && salePrice < regPrice ? salePrice : regPrice;
      const oldPrice = salePrice && salePrice < regPrice ? regPrice : null;

      const prod = {
        name,
        price: finalPrice,
        oldPrice,
        category: rowObj['Categories']?.split(',')[0]?.trim() || 'General',
        description: rowObj['Short description'] || rowObj['Description'] || 'Imported Catalog Product.',
        stockCount: parseInt(rowObj['Stock'] || '25', 10) || 25,
        image: rowObj['Images']?.split(',')[0]?.trim() || 'assets/wp_products/wp_549_0.webp',
        badge: 'NEW',
        section: 'latest-range'
      };

      const res = await this.saveProduct(prod, seller);
      if (res.success) importedProducts.push(res.product);
    }

    return { success: true, count: importedProducts.length, products: importedProducts };
  },

  /**
   * Get products awaiting admin moderation
   */
  async getPendingProducts() {
    const customProducts = getLocalCustomProducts();
    return customProducts.filter(p => p.status === 'pending_review');
  },

  /**
   * Admin: Approve product
   */
  async approveProduct(productId) {
    const customProducts = getLocalCustomProducts();
    const prod = customProducts.find(p => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    prod.status = 'published';
    saveLocalCustomProducts(customProducts);
    return { success: true, product: prod };
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.AmezaSeller = SellerAPI;
}
