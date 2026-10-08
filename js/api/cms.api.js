/**
 * AMEZA Admin CMS & Platform Settings Engine — js/api/cms.api.js
 * Drives homepage layout sections, scheduled banners, feature flags,
 * theme color tokens (--primary), currency rates, and navigation menus.
 */

const CMS_STORAGE_KEY = 'ameza_platform_cms';
const SETTINGS_STORAGE_KEY = 'ameza_platform_settings';

const DEFAULT_CMS = {
  announcementBar: {
    enabled: true,
    text: '🇺🇸 Welcome to AMEZA USA • Free Express Dispatch on orders over $100.00!',
    linkText: 'Shop New Arrivals →',
    linkUrl: 'index.html#featured-deals'
  },
  heroBanners: [
    {
      id: 'banner_1',
      title: 'Handcrafted U.S. Luxury',
      subtitle: 'Ethically sourced kangaroo and bovine leather essentials by Austin artisans.',
      ctaText: 'Explore Leather Collection',
      ctaUrl: 'product.html?id=wp_52',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      active: true
    },
    {
      id: 'banner_2',
      title: 'Coastal Living & Sustainable Linen',
      subtitle: 'Designed in California. Organic apparel crafted for effortless U.S. living.',
      ctaText: 'View Coastal Apparel',
      ctaUrl: 'store.html?slug=pacific-coastal-living',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      active: true
    }
  ],
  navItems: [
    { label: 'Clothing', url: 'index.html?cat=clothing' },
    { label: 'Electronics', url: 'index.html?cat=electronics' },
    { label: 'Watches', url: 'index.html?cat=watches' },
    { label: 'Leather Goods', url: 'index.html?cat=leather-canvas' },
    { label: 'Stores', url: 'store.html?slug=austin-leather-co' },
    { label: 'Sell With Us', url: 'onboarding/sell-with-us.html' }
  ]
};

const DEFAULT_SETTINGS = {
  siteName: 'AMEZA USA',
  baseCurrency: 'USD',
  brandColor: '#7FB73C',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  defaultCommissionPct: 10.0,
  holdPeriodDays: 7,
  minPayoutCents: 5000,
  features: {
    reviews: true,
    cod: true,
    messaging: true,
    coupons: true,
    autoApproveSellers: false,
    wishlist: true
  },
  currencyRates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    MXN: 18.5,
    USD: 1.52,
    JPY: 155.0,
    INR: 83.5
  }
};

function getLocalCMS() {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CMS;
  } catch (e) {
    return DEFAULT_CMS;
  }
}

function saveLocalCMS(data) {
  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
}

function getLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(data) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
  applyThemeVariables(data);
}

export function applyThemeVariables(settings = null) {
  if (typeof document === 'undefined') return;
  const cfg = settings || getLocalSettings();
  if (cfg.brandColor) {
    document.documentElement.style.setProperty('--primary', cfg.brandColor);
  }
}

export const CmsAPI = {
  getCMS() {
    return getLocalCMS();
  },

  updateCMS(updated) {
    const current = getLocalCMS();
    const merged = { ...current, ...updated };
    saveLocalCMS(merged);
    return merged;
  },

  getSettings() {
    return getLocalSettings();
  },

  updateSettings(updated) {
    const current = getLocalSettings();
    const merged = { 
      ...current, 
      ...updated,
      features: { ...(current.features || {}), ...(updated.features || {}) }
    };
    saveLocalSettings(merged);
    return merged;
  },

  isFeatureEnabled(featureName) {
    const settings = getLocalSettings();
    return settings.features ? Boolean(settings.features[featureName]) : true;
  }
};

if (typeof window !== 'undefined') {
  window.AmezaCmsAPI = CmsAPI;
  // Auto-apply theme variables on load
  applyThemeVariables();
}
