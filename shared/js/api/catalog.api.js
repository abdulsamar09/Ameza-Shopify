/**
 * AMEZA Catalog API Service — js/api/catalog.api.js
 * Fetches dynamic catalog with fallback to offline catalog data.
 */

import { apiFetch, config } from './client.js';
import { CATEGORIES as FALLBACK_CATEGORIES, PRODUCTS as FALLBACK_PRODUCTS, PROMOTIONAL_BANNERS as FALLBACK_BANNERS } from '../products-data.js';

export const CatalogAPI = {
  /**
   * Get all active categories
   */
  async getCategories() {
    if (config.isConfigured()) {
      const { data, error } = await apiFetch('categories?is_active=eq.true&order=sort_order.asc');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    // Offline / fallback
    return FALLBACK_CATEGORIES;
  },

  /**
   * Get filtered products
   */
  async getProducts(filter = {}) {
    if (config.isConfigured()) {
      let query = 'products?status=eq.published&select=*,seller:sellers(store_name,slug,rating_avg)';
      if (filter.section) {
        query += `&section=eq.${encodeURIComponent(filter.section)}`;
      }
      if (filter.category) {
        query += `&category_id=eq.${encodeURIComponent(filter.category)}`;
      }
      if (filter.sellerId) {
        query += `&seller_id=eq.${encodeURIComponent(filter.sellerId)}`;
      }
      if (filter.limit) {
        query += `&limit=${filter.limit}`;
      }

      const { data, error } = await apiFetch(query);
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(item => ({
          id: item.legacy_id || item.id,
          dbId: item.id,
          name: item.title,
          slug: item.slug,
          category: item.category_id,
          categorySlug: item.category_id,
          price: (item.base_price || 0) / 100, // Cents to decimal for formatPrice
          oldPrice: item.compare_at_price ? item.compare_at_price / 100 : null,
          discount: item.compare_at_price && item.compare_at_price > item.base_price
            ? `-${Math.round((1 - item.base_price / item.compare_at_price) * 100)}%`
            : '',
          rating: Number(item.rating_avg) || 5.0,
          reviews: item.rating_count || 0,
          badge: item.badge,
          image: item.image_url || (FALLBACK_PRODUCTS.find(fp => fp.id === item.legacy_id)?.image) || '',
          images: [item.image_url],
          section: item.section,
          description: item.description_html || item.short_description,
          features: item.features || [],
          inStock: item.in_stock,
          stockCount: item.stock_count,
          isDeal: item.is_deal,
          sellerId: item.seller_id,
          sellerName: item.seller?.store_name || 'AMEZA Official',
          sellerSlug: item.seller?.slug || 'ameza-official'
        }));
      }
    }

    // Offline fallback + Custom Seller Products
    let customProducts = [];
    try {
      const raw = localStorage.getItem('ameza_custom_products');
      if (raw) {
        customProducts = JSON.parse(raw).filter(p => p.status === 'published');
      }
    } catch (e) {}

    let results = [...customProducts, ...FALLBACK_PRODUCTS];
    if (filter.sellerId) {
      results = results.filter(p => p.sellerId === filter.sellerId);
    }
    if (filter.sellerSlug) {
      results = results.filter(p => p.sellerSlug === filter.sellerSlug);
    }
    if (filter.section) {
      results = results.filter(p => p.section === filter.section);
    }
    if (filter.category && filter.category !== 'all') {
      results = results.filter(p => p.categorySlug === filter.category || p.category === filter.category);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }
    return results.map(p => ({
      ...p,
      sellerName: p.sellerName || 'AMEZA Official',
      sellerSlug: p.sellerSlug || 'ameza-official'
    }));
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => String(p.id) === String(id) || String(p.dbId) === String(id)) || null;
  },

  /**
   * Get single product by Slug
   */
  async getProductBySlug(slug) {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  /**
   * Get promotional banners
   */
  async getPromotionalBanners() {
    return FALLBACK_BANNERS;
  }
};
