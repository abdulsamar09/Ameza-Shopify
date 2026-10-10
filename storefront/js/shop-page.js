/**
 * AMEZA Unified Shop Engine — js/shop-page.js
 * Handles catalog filtering, dual price slider, sorting, pagination / infinite scroll,
 * responsive mobile filter drawer, quick view modal, cart drawer integration,
 * and bidirectional URL state mirroring.
 */

import { PRODUCTS, CATEGORIES, getBrandList } from './products-data.js';
import { escapeHTML, formatMoney } from '/shared/js/core/utils.js';
import { addToCart } from './cart-drawer.js';

// --- CONFIG & CONSTANTS ---
const PAGE_SIZE = 12;
const WHITELIST_SORT = ['featured', 'newest', 'price-asc', 'price-desc', 'rating', 'best-selling', 'discount'];
const VIEW_MODES = ['3-col', '4-col', 'list'];

const ICONS = {
  starBlack: `<svg class="rating-star-icon" width="13" height="13" viewBox="0 0 24 24" fill="#111827"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  heart: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartFilled: `<svg width="17" height="17" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  cartSolid: `<svg class="btn-cart-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`
};

// Category alias mapping for flexible query matching
const CATEGORY_ALIASES = {
  'belts': ['leather-belts', 'belts'],
  'leather-belts': ['leather-belts', 'belts'],
  'wallets': ['leather-wallets', 'wallets'],
  'leather-wallets': ['leather-wallets', 'wallets'],
  'bags': ['bags', 'bags-totes'],
  'bags-totes': ['bags', 'bags-totes'],
  'leather-goods': ['leather-belts', 'leather-wallets', 'leather-canvas'],
  'clothing': ['clothing', 'apparel'],
  'apparel': ['clothing', 'apparel'],
  'electronics': ['electronics', 'tech'],
  'watches': ['watches', 'timepieces'],
  'new-collection': ['new-collection', 'latest-range']
};

// Global State
const state = {
  categories: new Set(),
  brands: new Set(),
  minPrice: 0,
  maxPrice: 500,
  rating: null,
  inStockOnly: false,
  outOfStockOnly: false,
  dealsOnly: false,
  section: null,
  searchQuery: '',
  sort: 'featured',
  view: localStorage.getItem('ameza_shop_view') || '3-col',
  renderedCount: PAGE_SIZE,
  showAllBrands: false
};

// Cached absolute min/max prices from catalog (in whole dollars)
let catalogMinPrice = 0;
let catalogMaxPrice = 500;

/**
 * Initializes the entire Shop Page application.
 */
export function initShopPage() {
  if (!document.body.classList.contains('shop')) return;

  calculateCatalogPriceBounds();
  parseUrlParams();
  setupDomElements();
  bindEventHandlers();
  setupInfiniteScroll();
  applyFiltersAndRender(false);
  updateBrandListUI();
}

/**
 * Determines minimum and maximum price in catalog.
 */
function calculateCatalogPriceBounds() {
  let min = Infinity;
  let max = -Infinity;
  PRODUCTS.forEach(p => {
    const dollars = Math.round((p.price || 0) / 100);
    if (dollars < min) min = dollars;
    if (dollars > max) max = dollars;
  });
  catalogMinPrice = Math.max(0, Math.floor(min));
  catalogMaxPrice = Math.ceil(max) || 500;
  if (!state.minPrice) state.minPrice = catalogMinPrice;
  if (!state.maxPrice || state.maxPrice === 500) state.maxPrice = catalogMaxPrice;
}

/**
 * Parses initial URL query parameters to populate state.
 */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Category
  const catParam = params.get('category');
  if (catParam) {
    catParam.split(',').map(c => c.trim().toLowerCase()).filter(Boolean).forEach(c => state.categories.add(c));
  }

  // Brand
  const brandParam = params.get('brand');
  if (brandParam) {
    brandParam.split(',').map(b => b.trim().toLowerCase()).filter(Boolean).forEach(b => state.brands.add(b));
  }

  // Section
  const secParam = params.get('section');
  if (secParam) {
    state.section = secParam.trim().toLowerCase();
  }

  // Deals
  if (params.get('deals') === '1' || params.get('deals') === 'true' || params.get('sale') === '1') {
    state.dealsOnly = true;
  }

  // Search Query
  const qParam = params.get('q');
  if (qParam) {
    state.searchQuery = qParam.trim();
  }

  // Sort
  const sortParam = params.get('sort');
  if (sortParam && WHITELIST_SORT.includes(sortParam)) {
    state.sort = sortParam;
  }

  // Price range
  const minP = parseFloat(params.get('minPrice'));
  if (!isNaN(minP) && minP >= 0) {
    state.minPrice = Math.max(catalogMinPrice, Math.min(catalogMaxPrice, Math.round(minP)));
  }
  const maxP = parseFloat(params.get('maxPrice'));
  if (!isNaN(maxP) && maxP >= 0) {
    state.maxPrice = Math.max(state.minPrice, Math.min(catalogMaxPrice, Math.round(maxP)));
  }

  // Rating
  const rParam = parseFloat(params.get('rating'));
  if (!isNaN(rParam) && rParam >= 1 && rParam <= 5) {
    state.rating = rParam;
  }

  // Availability
  const availParam = params.get('availability');
  if (availParam === 'in-stock') state.inStockOnly = true;
  else if (availParam === 'out-of-stock') state.outOfStockOnly = true;

  // View Mode
  const viewParam = params.get('view');
  if (viewParam && VIEW_MODES.includes(viewParam)) {
    state.view = viewParam;
  }
}

/**
 * Synchronizes current state with URL without full page reload.
 */
function syncUrlState() {
  const params = new URLSearchParams();

  if (state.categories.size > 0) {
    params.set('category', Array.from(state.categories).join(','));
  }
  if (state.brands.size > 0) {
    params.set('brand', Array.from(state.brands).join(','));
  }
  if (state.section) {
    params.set('section', state.section);
  }
  if (state.dealsOnly) {
    params.set('deals', '1');
  }
  if (state.searchQuery) {
    params.set('q', state.searchQuery);
  }
  if (state.sort !== 'featured') {
    params.set('sort', state.sort);
  }
  if (state.minPrice > catalogMinPrice) {
    params.set('minPrice', state.minPrice.toString());
  }
  if (state.maxPrice < catalogMaxPrice) {
    params.set('maxPrice', state.maxPrice.toString());
  }
  if (state.rating) {
    params.set('rating', state.rating.toString());
  }
  if (state.inStockOnly) {
    params.set('availability', 'in-stock');
  } else if (state.outOfStockOnly) {
    params.set('availability', 'out-of-stock');
  }
  if (state.view !== '3-col') {
    params.set('view', state.view);
  }

  const newQuery = params.toString();
  const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
  window.history.replaceState({ ...state }, '', newUrl);

  updateSeoMeta();
}

/**
 * Updates dynamic Page Title, Meta Description, and JSON-LD ItemList.
 */
function updateSeoMeta() {
  let titlePrefix = 'Shop all products';
  if (state.categories.size === 1) {
    const slug = Array.from(state.categories)[0];
    const catObj = CATEGORIES.find(c => c.slug === slug || c.id === slug);
    titlePrefix = catObj ? catObj.name : slug.charAt(0).toUpperCase() + slug.slice(1);
  } else if (state.brands.size === 1) {
    const bSlug = Array.from(state.brands)[0];
    const bObj = getBrandList().find(b => b.slug === bSlug);
    titlePrefix = bObj ? bObj.name : bSlug;
  } else if (state.dealsOnly) {
    titlePrefix = 'On Sale Deals';
  } else if (state.searchQuery) {
    titlePrefix = `Search: "${state.searchQuery}"`;
  }

  document.title = `${titlePrefix} | AMEZA`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const descText = `Browse ${titlePrefix.toLowerCase()} at AMEZA. Discover premium handcrafted US goods, guaranteed authentic quality, and rapid nationwide shipping.`;
    metaDesc.setAttribute('content', descText.slice(0, 155));
  }
}

/**
 * Sets up static and initial dynamic elements in DOM.
 */
function setupDomElements() {
  // Sort dropdown
  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect) sortSelect.value = state.sort;

  // Search input in Hero
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) searchInput.value = state.searchQuery;

  // View toggles
  updateViewSwitcherUI();

  // Price inputs & sliders bounds
  const minSlider = document.getElementById('range-slider-min');
  const maxSlider = document.getElementById('range-slider-max');
  const minInput = document.getElementById('price-input-min');
  const maxInput = document.getElementById('price-input-max');

  if (minSlider && maxSlider && minInput && maxInput) {
    minSlider.min = catalogMinPrice;
    minSlider.max = catalogMaxPrice;
    maxSlider.min = catalogMinPrice;
    maxSlider.max = catalogMaxPrice;

    minInput.min = catalogMinPrice;
    minInput.max = catalogMaxPrice;
    maxInput.min = catalogMinPrice;
    maxInput.max = catalogMaxPrice;

    minSlider.value = state.minPrice;
    maxSlider.value = state.maxPrice;
    minInput.value = state.minPrice;
    maxInput.value = state.maxPrice;

    updateSliderTrackFill();
  }

  // Deals toggle
  const dealsToggle = document.getElementById('toggle-on-sale');
  if (dealsToggle) dealsToggle.checked = state.dealsOnly;

  // Availability checkboxes
  const chkIn = document.getElementById('chk-instock');
  if (chkIn) chkIn.checked = state.inStockOnly;
  const chkOut = document.getElementById('chk-outofstock');
  if (chkOut) chkOut.checked = state.outOfStockOnly;

  // Render Category Quick Chips
  renderCategoryQuickChips();

  // Render Rating Filter options
  renderRatingFilters();
}

/**
 * Renders Category Chips in Hero section.
 */
function renderCategoryQuickChips() {
  const container = document.getElementById('shop-quick-chips');
  if (!container) return;

  const isAll = state.categories.size === 0 && !state.dealsOnly && !state.section;

  let html = `
    <button type="button" class="shop-chip ${isAll ? 'active' : ''}" data-category="all" role="tab" aria-selected="${isAll}">
      <span>All Products</span>
      <span class="shop-chip-count">${PRODUCTS.length}</span>
    </button>
  `;

  CATEGORIES.forEach(cat => {
    const count = PRODUCTS.filter(p => matchCategory(p, cat.slug)).length;
    const isActive = state.categories.has(cat.slug);
    html += `
      <button type="button" class="shop-chip ${isActive ? 'active' : ''}" data-category="${cat.slug}" role="tab" aria-selected="${isActive}">
        <span>${escapeHTML(cat.name)}</span>
        <span class="shop-chip-count">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

/**
 * Checks if a product matches a category slug (with aliases).
 */
function matchCategory(product, targetCatSlug) {
  const pSlug = (product.categorySlug || '').toLowerCase();
  const pName = (product.category || '').toLowerCase();
  const target = targetCatSlug.toLowerCase();

  if (pSlug === target || pName === target) return true;

  // Alias lookup
  const aliases = CATEGORY_ALIASES[target];
  if (aliases) {
    if (aliases.includes(pSlug) || aliases.includes(pName)) return true;
  }
  return false;
}

/**
 * Renders Rating sidebar options.
 */
function renderRatingFilters() {
  const container = document.getElementById('rating-filters-list');
  if (!container) return;

  const ratings = [4, 3, 2, 1];
  let html = '';
  ratings.forEach(star => {
    const count = PRODUCTS.filter(p => (p.rating || 0) >= star).length;
    const isChecked = state.rating === star;
    html += `
      <label class="rating-filter-item">
        <input type="radio" name="filter-rating" class="filter-checkbox" value="${star}" ${isChecked ? 'checked' : ''}>
        <div class="rating-stars-wrap">
          ${Array.from({ length: 5 }, (_, i) => `<i class="fa-${i < star ? 'solid' : 'regular'} fa-star"></i>`).join('')}
        </div>
        <span style="font-size:0.82rem; font-weight:600; color:var(--text-main); margin-left:4px;">&amp; up</span>
        <span class="filter-option-count" style="margin-left:auto;">(${count})</span>
      </label>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renders or updates Brands list inside Sidebar.
 */
function updateBrandListUI() {
  const container = document.getElementById('brands-checkbox-list');
  const toggleBtn = document.getElementById('btn-toggle-more-brands');
  if (!container) return;

  const allBrands = getBrandList();
  const brandSearchInput = document.getElementById('brand-search-input');
  const searchVal = brandSearchInput ? brandSearchInput.value.trim().toLowerCase() : '';

  let filteredBrands = allBrands;
  if (searchVal) {
    filteredBrands = allBrands.filter(b => b.name.toLowerCase().includes(searchVal));
  }

  const limit = state.showAllBrands || searchVal ? filteredBrands.length : 6;
  const visibleBrands = filteredBrands.slice(0, limit);

  container.innerHTML = visibleBrands.map(b => {
    const isChecked = state.brands.has(b.slug);
    const count = PRODUCTS.filter(p => (p.brandSlug || '').toLowerCase() === b.slug).length;
    return `
      <label class="filter-option">
        <div class="filter-option-left">
          <input type="checkbox" class="filter-checkbox brand-chk" value="${b.slug}" ${isChecked ? 'checked' : ''}>
          <span>${escapeHTML(b.name)}</span>
        </div>
        <span class="filter-option-count">(${count})</span>
      </label>
    `;
  }).join('');

  if (toggleBtn) {
    if (filteredBrands.length > 6 && !searchVal) {
      toggleBtn.style.display = 'inline-flex';
      toggleBtn.textContent = state.showAllBrands ? '- Show fewer brands' : `+ Show more brands (${allBrands.length - 6} more)`;
    } else {
      toggleBtn.style.display = 'none';
    }
  }
}

/**
 * Renders or updates Category sidebar checkboxes and counts.
 */
function updateCategoriesSidebarUI() {
  const container = document.getElementById('filter-body-categories');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isChecked = state.categories.has(cat.slug);
    const count = PRODUCTS.filter(p => matchCategory(p, cat.slug)).length;
    return `
      <label class="filter-option">
        <div class="filter-option-left">
          <input type="checkbox" class="filter-checkbox category-chk" value="${cat.slug}" ${isChecked ? 'checked' : ''}>
          <span>${escapeHTML(cat.name)}</span>
        </div>
        <span class="filter-option-count">(${count})</span>
      </label>
    `;
  }).join('');
}

/**
 * Binds all interactive event handlers via data-action and delegated listeners.
 */
function bindEventHandlers() {
  // Sort select
  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    });
  }

  // Hero Search input
  const searchInput = document.getElementById('shop-search-input');
  const searchBtn = document.getElementById('shop-search-btn');

  function executeSearchInput() {
    state.searchQuery = searchInput.value.trim();
    state.renderedCount = PAGE_SIZE;
    applyFiltersAndRender(true);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearchInput();
      }
    });
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim() === '' && state.searchQuery !== '') {
        state.searchQuery = '';
        state.renderedCount = PAGE_SIZE;
        applyFiltersAndRender(true);
      }
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', executeSearchInput);
  }

  // Brand search input
  const brandSearchInput = document.getElementById('brand-search-input');
  if (brandSearchInput) {
    brandSearchInput.addEventListener('input', () => {
      updateBrandListUI();
    });
  }

  // Show more brands toggle
  const toggleMoreBrands = document.getElementById('btn-toggle-more-brands');
  if (toggleMoreBrands) {
    toggleMoreBrands.addEventListener('click', () => {
      state.showAllBrands = !state.showAllBrands;
      updateBrandListUI();
    });
  }

  // Dual Price Range Sliders & Inputs
  const minSlider = document.getElementById('range-slider-min');
  const maxSlider = document.getElementById('range-slider-max');
  const minInput = document.getElementById('price-input-min');
  const maxInput = document.getElementById('price-input-max');

  if (minSlider && maxSlider && minInput && maxInput) {
    const handleSliderChange = () => {
      let minVal = parseInt(minSlider.value, 10);
      let maxVal = parseInt(maxSlider.value, 10);

      if (minVal > maxVal) {
        const temp = minVal;
        minVal = maxVal;
        maxVal = temp;
      }

      state.minPrice = minVal;
      state.maxPrice = maxVal;
      minInput.value = minVal;
      maxInput.value = maxVal;

      updateSliderTrackFill();
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    };

    minSlider.addEventListener('input', handleSliderChange);
    maxSlider.addEventListener('input', handleSliderChange);

    const handleInputChange = () => {
      let minVal = parseInt(minInput.value, 10) || catalogMinPrice;
      let maxVal = parseInt(maxInput.value, 10) || catalogMaxPrice;

      minVal = Math.max(catalogMinPrice, Math.min(catalogMaxPrice, minVal));
      maxVal = Math.max(catalogMinPrice, Math.min(catalogMaxPrice, maxVal));

      if (minVal > maxVal) {
        maxVal = minVal;
        maxInput.value = maxVal;
      }

      state.minPrice = minVal;
      state.maxPrice = maxVal;
      minSlider.value = minVal;
      maxSlider.value = maxVal;

      updateSliderTrackFill();
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    };

    minInput.addEventListener('change', handleInputChange);
    maxInput.addEventListener('change', handleInputChange);
  }

  // On sale toggle
  const dealsToggle = document.getElementById('toggle-on-sale');
  if (dealsToggle) {
    dealsToggle.addEventListener('change', (e) => {
      state.dealsOnly = e.target.checked;
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    });
  }

  // Availability checkboxes
  const chkIn = document.getElementById('chk-instock');
  const chkOut = document.getElementById('chk-outofstock');
  if (chkIn) {
    chkIn.addEventListener('change', (e) => {
      state.inStockOnly = e.target.checked;
      if (state.inStockOnly && chkOut) {
        chkOut.checked = false;
        state.outOfStockOnly = false;
      }
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    });
  }
  if (chkOut) {
    chkOut.addEventListener('change', (e) => {
      state.outOfStockOnly = e.target.checked;
      if (state.outOfStockOnly && chkIn) {
        chkIn.checked = false;
        state.inStockOnly = false;
      }
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
    });
  }

  // Collapsible Filter Groups (Accordion)
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.closest('.filter-group');
      if (group) {
        const isCollapsed = group.classList.toggle('collapsed');
        header.setAttribute('aria-expanded', !isCollapsed);
      }
    });
  });

  // Delegated clicks across body.shop
  document.body.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    const action = actionEl ? actionEl.getAttribute('data-action') : null;

    if (action === 'reset-filters') {
      e.preventDefault();
      resetAllFilters();
      return;
    }

    if (action === 'load-more') {
      e.preventDefault();
      loadMoreProducts();
      return;
    }

    if (action === 'toggle-wishlist') {
      e.preventDefault();
      const pId = actionEl.getAttribute('data-product-id');
      if (pId) toggleWishlist(pId, actionEl);
      return;
    }

    if (action === 'add-cart') {
      e.preventDefault();
      const pId = actionEl.getAttribute('data-product-id');
      if (pId) handleAddToCart(pId);
      return;
    }

    if (action === 'quick-view') {
      e.preventDefault();
      const pId = actionEl.getAttribute('data-product-id');
      if (pId) openQuickView(pId);
      return;
    }

    // View toggle buttons
    const viewBtn = e.target.closest('.btn-view-toggle');
    if (viewBtn) {
      e.preventDefault();
      const viewMode = viewBtn.getAttribute('data-view');
      if (viewMode && VIEW_MODES.includes(viewMode)) {
        setViewMode(viewMode);
      }
      return;
    }

    // Category Quick Chips click
    const chip = e.target.closest('.shop-chip');
    if (chip) {
      e.preventDefault();
      const cat = chip.getAttribute('data-category');
      if (cat === 'all') {
        state.categories.clear();
        state.dealsOnly = false;
        state.section = null;
      } else {
        if (state.categories.has(cat)) {
          state.categories.delete(cat);
        } else {
          state.categories.clear();
          state.categories.add(cat);
        }
      }
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
      return;
    }

    // Sidebar Category checkbox click
    const catChk = e.target.closest('.category-chk');
    if (catChk) {
      const val = catChk.value;
      if (catChk.checked) {
        state.categories.add(val);
      } else {
        state.categories.delete(val);
      }
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
      return;
    }

    // Sidebar Brand checkbox click
    const brandChk = e.target.closest('.brand-chk');
    if (brandChk) {
      const val = brandChk.value;
      if (brandChk.checked) {
        state.brands.add(val);
      } else {
        state.brands.delete(val);
      }
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
      return;
    }

    // Rating radio button click
    const ratingRadio = e.target.closest('input[name="filter-rating"]');
    if (ratingRadio) {
      const val = parseFloat(ratingRadio.value);
      state.rating = state.rating === val ? null : val;
      state.renderedCount = PAGE_SIZE;
      applyFiltersAndRender(true);
      return;
    }

    // Active filter tag removal
    const tagRemove = e.target.closest('.filter-tag-remove');
    if (tagRemove) {
      e.preventDefault();
      const tagType = tagRemove.getAttribute('data-tag-type');
      const tagVal = tagRemove.getAttribute('data-tag-val');
      removeActiveFilterTag(tagType, tagVal);
      return;
    }

    // Mobile Filters Trigger
    const mobileTrigger = e.target.closest('#btn-mobile-filters-trigger');
    if (mobileTrigger) {
      e.preventDefault();
      openMobileFilterDrawer();
      return;
    }

    // Close Mobile Filters (close button or backdrop or apply button)
    if (e.target.closest('#btn-close-mobile-filters') || e.target.closest('#mobile-filter-backdrop') || e.target.closest('#btn-mobile-apply')) {
      closeMobileFilterDrawer();
      return;
    }

    // Close Quick View Modal (backdrop or close button)
    if (e.target.closest('#btn-close-quickview') || e.target.id === 'shop-quickview-modal') {
      closeQuickView();
      return;
    }
  });

  // Keyboard navigation & Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileFilterDrawer();
      closeQuickView();
    }
  });

  // Browser back/forward navigation
  window.addEventListener('popstate', () => {
    state.categories.clear();
    state.brands.clear();
    state.section = null;
    state.dealsOnly = false;
    state.searchQuery = '';
    state.sort = 'featured';
    state.rating = null;
    state.inStockOnly = false;
    state.outOfStockOnly = false;
    parseUrlParams();
    setupDomElements();
    applyFiltersAndRender(false);
  });
}

/**
 * Updates range slider progress bar color strip.
 */
function updateSliderTrackFill() {
  const progressBar = document.getElementById('range-slider-progress');
  if (!progressBar) return;

  const rangeSpan = catalogMaxPrice - catalogMinPrice || 1;
  const leftPct = ((state.minPrice - catalogMinPrice) / rangeSpan) * 100;
  const rightPct = ((catalogMaxPrice - state.maxPrice) / rangeSpan) * 100;

  progressBar.style.left = `${Math.max(0, leftPct)}%`;
  progressBar.style.right = `${Math.max(0, rightPct)}%`;
}

/**
 * Updates active view mode and applies classes.
 */
function setViewMode(mode) {
  state.view = mode;
  localStorage.setItem('ameza_shop_view', mode);
  updateViewSwitcherUI();

  const grid = document.getElementById('shop-products-grid');
  if (grid) {
    grid.classList.remove('view-4-col', 'view-list');
    if (mode === '4-col') grid.classList.add('view-4-col');
    else if (mode === 'list') grid.classList.add('view-list');
  }

  syncUrlState();
}

/**
 * Updates UI of View Mode buttons.
 */
function updateViewSwitcherUI() {
  document.querySelectorAll('.btn-view-toggle').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === state.view);
  });
}

/**
 * Filters the product catalog and renders results.
 */
function applyFiltersAndRender(shouldSyncUrl = true) {
  let filtered = [...PRODUCTS];

  // 1. Category Filter
  if (state.categories.size > 0) {
    filtered = filtered.filter(p => {
      for (const catSlug of state.categories) {
        if (matchCategory(p, catSlug)) return true;
      }
      return false;
    });
  }

  // 2. Brand Filter
  if (state.brands.size > 0) {
    filtered = filtered.filter(p => {
      const pBrandSlug = (p.brandSlug || '').toLowerCase();
      return state.brands.has(pBrandSlug);
    });
  }

  // 3. Section Filter (e.g. latest-range)
  if (state.section) {
    filtered = filtered.filter(p => (p.section || '').toLowerCase() === state.section);
  }

  // 4. Deals / On Sale Only
  if (state.dealsOnly) {
    filtered = filtered.filter(p => {
      const hasDiscount = (p.oldPrice && p.oldPrice > p.price);
      return hasDiscount || p.isDeal;
    });
  }

  // 5. Search Query
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      return (p.name && p.name.toLowerCase().includes(q)) ||
             (p.category && p.category.toLowerCase().includes(q)) ||
             (p.brand && p.brand.toLowerCase().includes(q)) ||
             (p.description && p.description.toLowerCase().includes(q));
    });
  }

  // 6. Price Range
  filtered = filtered.filter(p => {
    const dollars = (p.price || 0) / 100;
    return dollars >= state.minPrice && dollars <= state.maxPrice;
  });

  // 7. Rating
  if (state.rating !== null) {
    filtered = filtered.filter(p => (p.rating || 0) >= state.rating);
  }

  // 8. Availability
  if (state.inStockOnly) {
    filtered = filtered.filter(p => p.inStock && (p.stockCount === undefined || p.stockCount > 0));
  } else if (state.outOfStockOnly) {
    filtered = filtered.filter(p => !p.inStock || p.stockCount === 0);
  }

  // Sort
  sortProducts(filtered);

  // Render to DOM
  renderProductsGrid(filtered);
  updateActiveFilterTags();
  updateHeroAndToolbarCounts(filtered.length);
  renderCategoryQuickChips();
  updateCategoriesSidebarUI();
  updateBrandListUI();
  updateAvailabilityCounts();

  if (shouldSyncUrl) {
    syncUrlState();
  }
}

/**
 * Sorts array of products in place according to state.sort.
 */
function sortProducts(list) {
  switch (state.sort) {
    case 'newest':
      list.sort((a, b) => {
        const aNew = a.badge === 'NEW' ? 1 : 0;
        const bNew = b.badge === 'NEW' ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        return Number(b.id) - Number(a.id);
      });
      break;
    case 'price-asc':
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'rating':
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'best-selling':
      list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      break;
    case 'discount':
      list.sort((a, b) => {
        const discA = a.oldPrice > a.price ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const discB = b.oldPrice > b.price ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return discB - discA;
      });
      break;
    case 'featured':
    default:
      // Catalog default order
      break;
  }
}

/**
 * Renders the product cards into the grid container.
 */
function renderProductsGrid(products) {
  const grid = document.getElementById('shop-products-grid');
  const emptyState = document.getElementById('shop-empty-state');
  const paginationWrap = document.getElementById('shop-pagination-wrap');

  if (!grid) return;

  // Apply view layout mode
  grid.classList.remove('view-4-col', 'view-list');
  if (state.view === '4-col') grid.classList.add('view-4-col');
  else if (state.view === 'list') grid.classList.add('view-list');

  const total = products.length;

  if (total === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (paginationWrap) paginationWrap.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (paginationWrap) paginationWrap.style.display = 'flex';

  const visibleProducts = products.slice(0, state.renderedCount);
  const wishlist = getSavedWishlist();

  grid.innerHTML = visibleProducts.map(p => renderSingleCard(p, wishlist.includes(String(p.id)))).join('');

  // Update progress bar
  const progressLabel = document.getElementById('shop-progress-label');
  const progressFill = document.getElementById('shop-progress-fill');
  const btnLoadMore = document.getElementById('btn-load-more');

  const showingCount = visibleProducts.length;
  if (progressLabel) progressLabel.textContent = `Showing ${showingCount} of ${total} products`;
  if (progressFill) progressFill.style.width = `${Math.min(100, Math.round((showingCount / total) * 100))}%`;

  if (btnLoadMore) {
    btnLoadMore.style.display = showingCount >= total ? 'none' : 'inline-flex';
  }

  updateJsonLd(visibleProducts.slice(0, 12));
}

/**
 * Builds HTML for a single product card matching home page structure.
 */
function renderSingleCard(p, isWishlisted) {
  const safeId = escapeHTML(String(p.id));
  const safeName = escapeHTML(p.name || 'Artisan Product');
  const safeImg = escapeHTML(p.image || 'assets/wp_products/wp_549_0.webp');
  const productUrl = `product.html?id=${safeId}`;

  const currentPrice = Number(p.price) || 0;
  const compareAt = Number(p.oldPrice || 0);
  const hasDiscount = compareAt > currentPrice && currentPrice > 0;
  const discountPct = hasDiscount ? Math.round(((compareAt - currentPrice) / compareAt) * 100) : 0;

  // Badges
  let badgeHtml = '';
  if (hasDiscount) {
    badgeHtml += `<span class="badge badge-discount">-${discountPct}%</span>`;
  } else if (p.badge) {
    const safeBadge = escapeHTML(p.badge);
    const badgeClass = p.badge === 'NEW' ? 'badge-new' : (p.badge === 'BEST SELLER' ? 'badge-bestseller' : 'badge-popular');
    badgeHtml += `<span class="badge ${badgeClass}">${safeBadge}</span>`;
  }
  if (p.stockCount !== undefined && p.stockCount <= 5 && p.stockCount > 0) {
    badgeHtml += `<span class="badge badge-low-stock">Low Stock</span>`;
  }

  const ratingVal = Number(p.rating || 4.8).toFixed(1);
  const reviewsCount = Number(p.reviews || 120);

  return `
    <div class="product-card" data-product-id="${safeId}">
      <div class="product-img-wrap">
        ${badgeHtml ? `
        <div class="card-badges">
          ${badgeHtml}
        </div>` : ''}

        <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-action="toggle-wishlist" data-product-id="${safeId}" aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${isWishlisted ? ICONS.heartFilled : ICONS.heart}
        </button>

        <a href="${productUrl}" class="product-card-img-link" style="display:block; width:100%; height:100%; cursor:pointer;">
          <img src="${safeImg}" alt="${safeName}" loading="lazy">
        </a>
      </div>

      <div class="product-info">
        <h3 class="product-name" title="${safeName}">
          <a href="${productUrl}" style="color:inherit; text-decoration:none;">${safeName}</a>
        </h3>
        <div class="product-rating">
          <svg class="rating-star-icon" width="13" height="13" viewBox="0 0 24 24" fill="#111827"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
          <span class="rating-num">${ratingVal}</span>
          <span class="review-count">(${reviewsCount})</span>
        </div>
      </div>

      <div class="product-bottom">
        <div class="price-wrap">
          <span class="price-current">${formatMoney(currentPrice)}</span>
          ${hasDiscount ? `<span class="price-old">${formatMoney(compareAt)}</span>` : ''}
          ${hasDiscount ? `<span class="price-discount-tag">-${discountPct}%</span>` : ''}
        </div>
        <button class="btn-add-cart" data-action="add-cart" data-product-id="${safeId}">
          ${ICONS.cartSolid} Add to cart
        </button>
      </div>
    </div>
  `;
}

/**
 * Updates dynamic JSON-LD structured data.
 */
function updateJsonLd(items) {
  const jsonLdEl = document.getElementById('shop-jsonld');
  if (!jsonLdEl) return;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AMEZA Catalog Products",
    "numberOfItems": items.length,
    "itemListElement": items.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image,
        "description": p.description || p.name,
        "brand": {
          "@type": "Brand",
          "name": p.brand || "AMEZA"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": (p.price / 100).toFixed(2),
          "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };

  jsonLdEl.textContent = JSON.stringify(data);
}

/**
 * Updates text in Hero heading and live count announcement.
 */
function updateHeroAndToolbarCounts(matchingTotal) {
  const heroTitle = document.getElementById('shop-main-title');
  const heroCount = document.getElementById('shop-hero-count');
  const toolbarAnnouncement = document.getElementById('shop-results-announcement');
  const crumbCurrent = document.getElementById('shop-crumb-current');
  const mobileApplyBtn = document.getElementById('btn-mobile-apply');
  const mobileFilterBadge = document.getElementById('mobile-filter-badge');

  let title = 'Shop all products';
  if (state.categories.size === 1) {
    const slug = Array.from(state.categories)[0];
    const cat = CATEGORIES.find(c => c.slug === slug || c.id === slug);
    title = cat ? cat.name : slug;
  } else if (state.brands.size === 1) {
    const bSlug = Array.from(state.brands)[0];
    const bObj = getBrandList().find(b => b.slug === bSlug);
    title = bObj ? bObj.name : bSlug;
  } else if (state.dealsOnly) {
    title = 'Limited Time Deals';
  } else if (state.searchQuery) {
    title = `Search results for "${state.searchQuery}"`;
  }

  if (heroTitle) heroTitle.textContent = title;
  if (crumbCurrent) crumbCurrent.textContent = title === 'Shop all products' ? 'Shop' : title;

  const countStr = `${matchingTotal} product${matchingTotal === 1 ? '' : 's'}`;
  if (heroCount) heroCount.textContent = `Showing ${countStr}`;

  const currentShowing = Math.min(state.renderedCount, matchingTotal);
  if (toolbarAnnouncement) {
    toolbarAnnouncement.textContent = matchingTotal > 0
      ? `Showing 1-${currentShowing} of ${matchingTotal} products`
      : 'Showing 0 products';
  }

  if (mobileApplyBtn) {
    mobileApplyBtn.textContent = `Show ${matchingTotal} results`;
  }

  // Active filter count for mobile badge
  let activeFilterCount = 0;
  if (state.categories.size > 0) activeFilterCount += state.categories.size;
  if (state.brands.size > 0) activeFilterCount += state.brands.size;
  if (state.dealsOnly) activeFilterCount += 1;
  if (state.searchQuery) activeFilterCount += 1;
  if (state.minPrice > catalogMinPrice || state.maxPrice < catalogMaxPrice) activeFilterCount += 1;
  if (state.rating !== null) activeFilterCount += 1;
  if (state.inStockOnly || state.outOfStockOnly) activeFilterCount += 1;

  if (mobileFilterBadge) {
    if (activeFilterCount > 0) {
      mobileFilterBadge.textContent = activeFilterCount.toString();
      mobileFilterBadge.style.display = 'inline-block';
    } else {
      mobileFilterBadge.style.display = 'none';
    }
  }
}

/**
 * Renders active removable chips inside Toolbar.
 */
function updateActiveFilterTags() {
  const container = document.getElementById('active-filters-container');
  const listEl = document.getElementById('active-tags-list');
  if (!container || !listEl) return;

  const tags = [];

  // Category tags
  state.categories.forEach(slug => {
    const cat = CATEGORIES.find(c => c.slug === slug || c.id === slug);
    const label = cat ? cat.name : slug;
    tags.push({ type: 'category', val: slug, text: `Category: ${label}` });
  });

  // Brand tags
  state.brands.forEach(slug => {
    const bObj = getBrandList().find(b => b.slug === slug);
    const label = bObj ? bObj.name : slug;
    tags.push({ type: 'brand', val: slug, text: `Brand: ${label}` });
  });

  // Price tag
  if (state.minPrice > catalogMinPrice || state.maxPrice < catalogMaxPrice) {
    tags.push({ type: 'price', val: 'range', text: `Price: $${state.minPrice} - $${state.maxPrice}` });
  }

  // Rating tag
  if (state.rating !== null) {
    tags.push({ type: 'rating', val: state.rating.toString(), text: `Rating: ${state.rating}★ & up` });
  }

  // Deals tag
  if (state.dealsOnly) {
    tags.push({ type: 'deals', val: '1', text: 'On Sale Deals' });
  }

  // Search tag
  if (state.searchQuery) {
    tags.push({ type: 'search', val: state.searchQuery, text: `Search: "${state.searchQuery}"` });
  }

  // Availability tag
  if (state.inStockOnly) {
    tags.push({ type: 'availability', val: 'in-stock', text: 'In Stock' });
  } else if (state.outOfStockOnly) {
    tags.push({ type: 'availability', val: 'out-of-stock', text: 'Out of Stock' });
  }

  if (tags.length === 0) {
    container.style.display = 'none';
    listEl.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  listEl.innerHTML = tags.map(t => `
    <span class="filter-tag">
      <span>${escapeHTML(t.text)}</span>
      <button type="button" class="filter-tag-remove" data-tag-type="${t.type}" data-tag-val="${escapeHTML(t.val)}" aria-label="Remove filter ${escapeHTML(t.text)}">&times;</button>
    </span>
  `).join('');
}

/**
 * Removes a specific filter tag.
 */
function removeActiveFilterTag(type, val) {
  switch (type) {
    case 'category':
      state.categories.delete(val);
      break;
    case 'brand':
      state.brands.delete(val);
      break;
    case 'price':
      state.minPrice = catalogMinPrice;
      state.maxPrice = catalogMaxPrice;
      const minSlider = document.getElementById('range-slider-min');
      const maxSlider = document.getElementById('range-slider-max');
      const minInput = document.getElementById('price-input-min');
      const maxInput = document.getElementById('price-input-max');
      if (minSlider) minSlider.value = catalogMinPrice;
      if (maxSlider) maxSlider.value = catalogMaxPrice;
      if (minInput) minInput.value = catalogMinPrice;
      if (maxInput) maxInput.value = catalogMaxPrice;
      updateSliderTrackFill();
      break;
    case 'rating':
      state.rating = null;
      document.querySelectorAll('input[name="filter-rating"]').forEach(r => r.checked = false);
      break;
    case 'deals':
      state.dealsOnly = false;
      const dt = document.getElementById('toggle-on-sale');
      if (dt) dt.checked = false;
      break;
    case 'search':
      state.searchQuery = '';
      const si = document.getElementById('shop-search-input');
      if (si) si.value = '';
      break;
    case 'availability':
      state.inStockOnly = false;
      state.outOfStockOnly = false;
      const ci = document.getElementById('chk-instock');
      const co = document.getElementById('chk-outofstock');
      if (ci) ci.checked = false;
      if (co) co.checked = false;
      break;
  }

  state.renderedCount = PAGE_SIZE;
  applyFiltersAndRender(true);
}

/**
 * Resets all filters back to catalog defaults.
 */
function resetAllFilters() {
  state.categories.clear();
  state.brands.clear();
  state.section = null;
  state.dealsOnly = false;
  state.searchQuery = '';
  state.rating = null;
  state.inStockOnly = false;
  state.outOfStockOnly = false;
  state.minPrice = catalogMinPrice;
  state.maxPrice = catalogMaxPrice;
  state.renderedCount = PAGE_SIZE;

  // DOM resets
  const si = document.getElementById('shop-search-input');
  if (si) si.value = '';

  const bi = document.getElementById('brand-search-input');
  if (bi) bi.value = '';

  const dt = document.getElementById('toggle-on-sale');
  if (dt) dt.checked = false;

  const ci = document.getElementById('chk-instock');
  if (ci) ci.checked = false;

  const co = document.getElementById('chk-outofstock');
  if (co) co.checked = false;

  document.querySelectorAll('input[name="filter-rating"]').forEach(r => r.checked = false);

  const minSlider = document.getElementById('range-slider-min');
  const maxSlider = document.getElementById('range-slider-max');
  const minInput = document.getElementById('price-input-min');
  const maxInput = document.getElementById('price-input-max');
  if (minSlider) minSlider.value = catalogMinPrice;
  if (maxSlider) maxSlider.value = catalogMaxPrice;
  if (minInput) minInput.value = catalogMinPrice;
  if (maxInput) maxInput.value = catalogMaxPrice;
  updateSliderTrackFill();

  applyFiltersAndRender(true);
}

/**
 * Updates availability filter counts in sidebar.
 */
function updateAvailabilityCounts() {
  const inStockCount = PRODUCTS.filter(p => p.inStock && (p.stockCount === undefined || p.stockCount > 0)).length;
  const outOfStockCount = PRODUCTS.filter(p => !p.inStock || p.stockCount === 0).length;

  const cIn = document.getElementById('count-instock');
  const cOut = document.getElementById('count-outofstock');
  if (cIn) cIn.textContent = inStockCount.toString();
  if (cOut) cOut.textContent = outOfStockCount.toString();
}

/**
 * Loads 12 more products.
 */
function loadMoreProducts() {
  state.renderedCount += PAGE_SIZE;
  applyFiltersAndRender(false);
}

/**
 * Sets up IntersectionObserver for Infinite Scrolling.
 */
function setupInfiniteScroll() {
  const sentinel = document.getElementById('shop-infinite-sentinel');
  if (!sentinel || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const btnLoadMore = document.getElementById('btn-load-more');
        if (btnLoadMore && btnLoadMore.style.display !== 'none') {
          loadMoreProducts();
        }
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.1
  });

  observer.observe(sentinel);
}

/**
 * Toggles product wishlist state and saves to localStorage.
 */
function toggleWishlist(productId, btnEl) {
  const list = getSavedWishlist();
  const idStr = String(productId);
  const idx = list.indexOf(idStr);

  let isNowWishlisted = false;
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(idStr);
    isNowWishlisted = true;
  }

  localStorage.setItem('ameza_wishlist', JSON.stringify(list));

  // Update button visual state
  if (btnEl) {
    btnEl.classList.toggle('active', isNowWishlisted);
    const svg = btnEl.querySelector('svg');
    if (svg) svg.setAttribute('fill', isNowWishlisted ? 'currentColor' : 'none');
  }

  // Update header wishlist badge if layout.js is present
  const badge = document.getElementById('layout-wishlist-count');
  if (badge) {
    badge.textContent = list.length.toString();
    badge.style.display = list.length > 0 ? 'inline-flex' : 'none';
  }

  window.dispatchEvent(new CustomEvent('ameza:wishlist-updated', { detail: { wishlist: list } }));
}

function getSavedWishlist() {
  try {
    const raw = localStorage.getItem('ameza_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Adds product to cart and immediately triggers Cart Drawer.
 */
function handleAddToCart(productId) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  addToCart(product, 1);

  if (typeof window.openCartDrawer === 'function') {
    window.openCartDrawer();
  }
}

/**
 * Mobile Filter Drawer open / close handlers.
 */
function openMobileFilterDrawer() {
  const sidebar = document.getElementById('shop-sidebar');
  const backdrop = document.getElementById('mobile-filter-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileFilterDrawer() {
  const sidebar = document.getElementById('shop-sidebar');
  const backdrop = document.getElementById('mobile-filter-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Quick View Modal Handlers.
 */
function openQuickView(productId) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  const modal = document.getElementById('shop-quickview-modal');
  const modalContent = document.getElementById('shop-quickview-content');
  if (!modal || !modalContent) return;

  const safeName = escapeHTML(product.name);
  const safeBrand = escapeHTML(product.brand || 'AMEZA');
  const safeImg = escapeHTML(product.image);
  const currentPrice = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice || 0);
  const hasDiscount = oldPrice > currentPrice;
  const ratingVal = Number(product.rating || 5).toFixed(1);
  const reviewsCount = Number(product.reviews || 80);

  modalContent.innerHTML = `
    <button type="button" class="btn-modal-close" id="btn-close-quickview" aria-label="Close dialog">&times;</button>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; align-items:start;">
      <div style="border-radius:12px; overflow:hidden; background:#F8FAFC; aspect-ratio:1/1;">
        <img src="${safeImg}" alt="${safeName}" style="width:100%; height:100%; object-fit:cover; display:block;">
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <span style="font-size:12px; font-weight:700; color:var(--primary, #7FB73C); text-transform:uppercase; letter-spacing:0.05em;">${safeBrand}</span>
        <h2 id="qv-product-title" style="margin:0; font-size:1.4rem; font-weight:800; color:var(--dark, #0F172A); line-height:1.25;">${safeName}</h2>
        <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:#64748B;">
          <span style="color:#F59E0B; display:inline-flex; gap:2px;">
            ${Array.from({ length: 5 }, (_, i) => `<i class="fa-${i < Math.floor(product.rating || 5) ? 'solid' : 'regular'} fa-star"></i>`).join('')}
          </span>
          <span style="font-weight:700; color:#0F172A;">${ratingVal}</span>
          <span>(${reviewsCount} verified reviews)</span>
        </div>
        <div style="display:flex; align-items:baseline; gap:8px; margin:6px 0;">
          <span style="font-size:1.45rem; font-weight:800; color:var(--dark, #0F172A);">${formatMoney(currentPrice)}</span>
          ${hasDiscount ? `<span style="font-size:1rem; color:#94A3B8; text-decoration:line-through;">${formatMoney(oldPrice)}</span>` : ''}
          ${hasDiscount ? `<span class="price-discount-tag">Save ${Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}%</span>` : ''}
        </div>
        <p style="font-size:13.5px; line-height:1.6; color:#475569; margin:0;">
          ${escapeHTML(product.description || 'Authentic handcrafted excellence curated from US artisans.')}
        </p>
        <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
          <button type="button" class="btn-primary" data-action="add-cart" data-product-id="${escapeHTML(String(product.id))}" style="flex:1; min-height:48px; border-radius:8px; font-weight:700; font-size:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
          <a href="product.html?id=${escapeHTML(String(product.id))}" class="btn-secondary" style="padding:12px 18px; min-height:48px; border-radius:8px; font-weight:700; font-size:14px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; border:1px solid #CBD5E1; color:#0F172A;">
            Full Details &rarr;
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('shop-quickview-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Auto-run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShopPage);
} else {
  initShopPage();
}
