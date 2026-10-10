/**
 * AMEZA Marketplace - Taxonomy Engine (js/taxonomy-page.js)
 * Powers dedicated Category, Subcategory, and Tag pages with full responsive product listing,
 * real-time filtering, currency formatting, quick add-to-cart, and wishlist syncing.
 */

import { PRODUCTS, CATEGORIES } from '/shared/js/products-data.js';
import { addToCart } from '/shared/js/cart-drawer.js';
import { escapeHTML as escapeHtml } from '/shared/js/core/utils.js';

// Category Taxonomy Map
export const TAXONOMY = {
  'clothing': {
    name: 'Clothing',
    slug: 'clothing',
    icon: 'fa-shirt',
    description: 'Explore our handcrafted clothing collection across the United States. Premium fabrics, durable construction, and timeless aesthetics.',
    subcategories: [
      { id: 'mens-clothing', name: "Men's Apparel", slug: 'mens-clothing' },
      { id: 'womens-clothing', name: "Women's Apparel", slug: 'womens-clothing' },
      { id: 'linen-collection', name: "Linen & Casuals", slug: 'linen-collection' }
    ],
    popularTags: ['Apparel', 'Handcrafted', 'Linen', 'Organic', 'Casual', 'Premium']
  },
  'electronics': {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'fa-headphones',
    description: 'Smart tech electronics and wireless audio engineered for modern performance. Crystal-clear acoustics and reliable design.',
    subcategories: [
      { id: 'audio', name: 'Wireless Audio', slug: 'audio' },
      { id: 'accessories', name: 'MagSafe & Chargers', slug: 'accessories' },
      { id: 'smart-home', name: 'Connected Devices', slug: 'smart-home' }
    ],
    popularTags: ['Smart Tech', 'Wireless', 'Audio', 'Bluetooth', 'Noise-Cancelling', 'Fast Charge']
  },
  'watches': {
    name: 'Watches',
    slug: 'watches',
    icon: 'fa-clock',
    description: 'Precision horology and artisan timepieces. Automatic mechanical movements, chronographs, and sapphire crystal construction.',
    subcategories: [
      { id: 'automatic-watches', name: 'Automatic Mechanical', slug: 'automatic-watches' },
      { id: 'quartz-chronograph', name: 'Chronographs', slug: 'quartz-chronograph' },
      { id: 'smart-watches', name: 'Smart Fitness', slug: 'smart-watches' }
    ],
    popularTags: ['Luxury', 'Automatic', 'Chronograph', 'Stainless Steel', 'Sapphire', 'Heritage']
  },
  'leather-belts': {
    name: 'Leather Belts',
    slug: 'leather-belts',
    icon: 'fa-shield-halved',
    description: 'Heavyweight full-grain vegetable-tanned leather belts handcrafted by verified American artisans. Built for decades of daily wear.',
    subcategories: [
      { id: 'belts', name: 'Full Grain Belts', slug: 'belts' },
      { id: 'vintage-belts', name: 'Vintage Washed Belts', slug: 'vintage-belts' },
      { id: 'dress-belts', name: 'Executive Belts', slug: 'dress-belts' }
    ],
    popularTags: ['Leather', 'Handcrafted', 'Full-Grain', 'Vintage', 'Solid Brass', 'Vegetable-Tanned']
  },
  'leather': { // Alias
    name: 'Leather Belts',
    slug: 'leather-belts',
    icon: 'fa-shield-halved',
    description: 'Heavyweight full-grain vegetable-tanned leather belts handcrafted by verified American artisans. Built for decades of daily wear.',
    subcategories: [
      { id: 'belts', name: 'Full Grain Belts', slug: 'belts' },
      { id: 'vintage-belts', name: 'Vintage Washed Belts', slug: 'vintage-belts' },
      { id: 'dress-belts', name: 'Executive Belts', slug: 'dress-belts' }
    ],
    popularTags: ['Leather', 'Handcrafted', 'Full-Grain', 'Vintage', 'Solid Brass', 'Vegetable-Tanned']
  },
  'leather-wallets': {
    name: 'Leather Wallets',
    slug: 'leather-wallets',
    icon: 'fa-wallet',
    description: 'Slim RFID-protected full-grain leather wallets, bifold cardholders, and passport travel organizers.',
    subcategories: [
      { id: 'wallets', name: 'Slim Bifolds', slug: 'wallets' },
      { id: 'cardholders', name: 'Cardholders', slug: 'cardholders' },
      { id: 'travel-wallets', name: 'Travel Organizers', slug: 'travel-wallets' }
    ],
    popularTags: ['Wallets', 'Leather', 'RFID Blocking', 'Minimalist', 'Slim', 'Handcrafted']
  },
  'wallets': { // Alias
    name: 'Leather Wallets',
    slug: 'leather-wallets',
    icon: 'fa-wallet',
    description: 'Slim RFID-protected full-grain leather wallets, bifold cardholders, and passport travel organizers.',
    subcategories: [
      { id: 'wallets', name: 'Slim Bifolds', slug: 'wallets' },
      { id: 'cardholders', name: 'Cardholders', slug: 'cardholders' },
      { id: 'travel-wallets', name: 'Travel Organizers', slug: 'travel-wallets' }
    ],
    popularTags: ['Wallets', 'Leather', 'RFID Blocking', 'Minimalist', 'Slim', 'Handcrafted']
  },
  'bags': {
    name: 'Bags & Totes',
    slug: 'bags',
    icon: 'fa-bag-shopping',
    description: 'Heavy 18oz cotton canvas and full-grain leather everyday carryalls, commuter backpacks, and weekend travel totes.',
    subcategories: [
      { id: 'totes', name: 'Canvas & Leather Totes', slug: 'totes' },
      { id: 'backpacks', name: 'Commuter Backpacks', slug: 'backpacks' },
      { id: 'shoulder-bags', name: 'Hobo & Shoulder Bags', slug: 'shoulder-bags' }
    ],
    popularTags: ['Bags', 'Canvas', 'Handcrafted', 'Backpacks', 'Totes', 'Travel', 'Water-Resistant']
  },
  'leather-canvas': {
    name: 'Leather & Canvas',
    slug: 'leather-canvas',
    icon: 'fa-gem',
    description: 'Florentine leather craftsmanship fused with rugged industrial cotton canvas for heirloom durability.',
    subcategories: [
      { id: 'canvas-goods', name: 'Canvas Gear', slug: 'canvas-goods' },
      { id: 'accessories', name: 'Artisan Goods', slug: 'accessories' }
    ],
    popularTags: ['Leather', 'Canvas', 'Florentine', 'Handcrafted', 'Heritage']
  }
};

/**
 * Gets all available products from products-data.js and localStorage.
 */
export function getAllProducts() {
  let catalog = [...PRODUCTS];
  try {
    const raw = localStorage.getItem('ameza_marketplace_products');
    if (raw) {
      const extra = JSON.parse(raw);
      if (Array.isArray(extra)) {
        extra.forEach(ep => {
          if (!catalog.some(p => String(p.id) === String(ep.id))) {
            catalog.push(ep);
          }
        });
      }
    }
  } catch (e) {}
  return catalog;
}

/**
 * Derives tags for a product.
 */
export function getProductTags(product) {
  const tags = new Set();
  const cat = (product.categorySlug || product.category || '').toLowerCase();
  
  if (cat.includes('cloth')) { tags.add('Clothing'); tags.add('Apparel'); }
  if (cat.includes('elect')) { tags.add('Electronics'); tags.add('Smart Tech'); }
  if (cat.includes('watch')) { tags.add('Watches'); tags.add('Precision'); }
  if (cat.includes('belt')) { tags.add('Belts'); tags.add('Leather'); tags.add('Full-Grain'); }
  if (cat.includes('wallet')) { tags.add('Wallets'); tags.add('Leather'); tags.add('RFID'); }
  if (cat.includes('bag')) { tags.add('Bags'); tags.add('Totes'); tags.add('Canvas'); }

  tags.add('Handcrafted');

  if (product.badge) {
    tags.add(product.badge);
  }
  if (product.discount) {
    tags.add('Sale');
  }
  if (product.rating >= 4.8) {
    tags.add('Top Rated');
  }

  return Array.from(tags);
}

/**
 * Main initialization entry point for category.html, subcategory.html, tag.html.
 */
export function initTaxonomyPage(mode = 'category') {
  const root = document.getElementById('taxonomy-app-root');
  if (!root) return;

  const urlParams = new URLSearchParams(window.location.search);
  const catParam = (urlParams.get('cat') || urlParams.get('category') || '').trim().toLowerCase();
  const subParam = (urlParams.get('sub') || urlParams.get('subcategory') || '').trim().toLowerCase();
  const tagParam = (urlParams.get('tag') || '').trim();

  let activeMode = mode;
  if (tagParam && mode !== 'tag') activeMode = 'tag';
  else if (subParam && mode !== 'subcategory') activeMode = 'subcategory';

  let state = {
    mode: activeMode,
    catSlug: catParam || 'clothing',
    subSlug: subParam || '',
    tagSlug: tagParam || '',
    catFilter: catParam || 'all',
    brandFilter: 'all',
    sizeFilter: 'all',
    colorFilter: 'all',
    priceFilter: 'all',
    shippingFilter: 'all',
    conditionFilter: 'all',
    availabilityFilter: 'all',
    sortBy: 'relevance',
    openDropdown: null,
    products: getAllProducts()
  };

  renderTaxonomyPage(root, state);

  window.addEventListener('ameza:currency-changed', () => {
    renderTaxonomyPage(root, state);
  });
}

function renderTaxonomyPage(root, state) {
  // 1. Resolve filtered products based on mode
  let filtered = [];
  let pageTitle = '';
  let breadcrumbTrail = [];

  const catMeta = TAXONOMY[state.catSlug] || TAXONOMY['clothing'];

  if (state.mode === 'tag') {
    const rawTag = state.tagSlug || 'Handcrafted';
    const cleanTag = rawTag.toLowerCase().replace(/^[#]/, '');
    
    filtered = state.products.filter(p => {
      const pTags = getProductTags(p).map(t => t.toLowerCase());
      const pName = (p.name || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();

      return pTags.some(t => t.includes(cleanTag)) ||
             pName.includes(cleanTag) ||
             pCat.includes(cleanTag) ||
             pDesc.includes(cleanTag);
    });

    pageTitle = `#${rawTag.replace(/^[#]/, '')}`;
    breadcrumbTrail = [
      { label: 'Home', url: 'index.html' },
      { label: 'Tags', url: 'tag.html?tag=handcrafted' },
      { label: `#${rawTag.replace(/^[#]/, '')}`, current: true }
    ];
  } else if (state.mode === 'subcategory') {
    const targetSub = state.subSlug || 'mens-clothing';
    
    // Find parent category matching this subcategory
    let parentCat = catMeta;
    for (const key of Object.keys(TAXONOMY)) {
      const foundSub = TAXONOMY[key].subcategories.find(s => s.slug === targetSub || s.id === targetSub);
      if (foundSub) {
        parentCat = TAXONOMY[key];
        break;
      }
    }

    const subObj = parentCat.subcategories.find(s => s.slug === targetSub || s.id === targetSub) || { name: targetSub };

    filtered = state.products.filter(p => {
      const pCatSlug = (p.categorySlug || p.category || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const subKeyword = targetSub.replace(/-/g, ' ');

      const matchesCat = pCatSlug.includes(parentCat.slug) || parentCat.slug.includes(pCatSlug);
      const matchesSub = pName.includes(targetSub) || pDesc.includes(targetSub) || pName.includes(subKeyword);
      
      return matchesCat && (matchesSub || filtered.length < 4);
    });

    if (filtered.length === 0) {
      filtered = state.products.filter(p => {
        const pCatSlug = (p.categorySlug || p.category || '').toLowerCase();
        return pCatSlug.includes(parentCat.slug) || parentCat.slug.includes(pCatSlug);
      });
    }

    pageTitle = subObj.name;
    breadcrumbTrail = [
      { label: 'Home', url: 'index.html' },
      { label: parentCat.name, url: `category.html?cat=${parentCat.slug}` },
      { label: subObj.name, current: true }
    ];
  } else {
    // Mode: Category
    filtered = state.products.filter(p => {
      const pCatSlug = (p.categorySlug || p.category || '').toLowerCase();
      const targetSlug = (state.catFilter && state.catFilter !== 'all' ? state.catFilter : catMeta.slug).toLowerCase();

      if (targetSlug === 'all') return true;
      if (targetSlug === 'clothing') return pCatSlug.includes('cloth');
      if (targetSlug === 'electronics') return pCatSlug.includes('elect');
      if (targetSlug === 'watches') return pCatSlug.includes('watch');
      if (targetSlug === 'leather-belts') return pCatSlug.includes('belt') || (pCatSlug.includes('leather') && !pCatSlug.includes('wallet'));
      if (targetSlug === 'leather-wallets') return pCatSlug.includes('wallet');
      if (targetSlug === 'bags') return pCatSlug.includes('bag') || pCatSlug.includes('tote');
      if (targetSlug === 'leather-canvas') return pCatSlug.includes('canvas') || pCatSlug.includes('leather');
      
      return pCatSlug.includes(targetSlug) || targetSlug.includes(pCatSlug);
    });

    pageTitle = catMeta.name;
    breadcrumbTrail = [
      { label: 'Home', url: 'index.html' },
      { label: 'Categories', url: 'category.html?cat=clothing' },
      { label: catMeta.name, current: true }
    ];
  }

  // Brand filter
  if (state.brandFilter && state.brandFilter !== 'all') {
    filtered = filtered.filter(p => (p.brand || '').toLowerCase().includes(state.brandFilter.toLowerCase()) || (p.name || '').toLowerCase().includes(state.brandFilter.toLowerCase()));
  }

  // Price filter
  if (state.priceFilter === '0-50') {
    filtered = filtered.filter(p => p.price <= 5000);
  } else if (state.priceFilter === '50-100') {
    filtered = filtered.filter(p => p.price > 5000 && p.price <= 10000);
  } else if (state.priceFilter === '100+') {
    filtered = filtered.filter(p => p.price > 10000);
  }

  // Availability filter
  if (state.availabilityFilter === 'in-stock') {
    filtered = filtered.filter(p => p.inStock !== false);
  }

  // Condition filter
  if (state.conditionFilter === 'brand-new') {
    filtered = filtered.filter(p => p.badge === 'NEW');
  } else if (state.conditionFilter === 'handcrafted') {
    filtered = filtered.filter(p => {
      const tags = getProductTags(p).map(t => t.toLowerCase());
      return tags.includes('handcrafted');
    });
  }

  // Sorting
  if (state.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (state.sortBy === 'newest') {
    filtered.sort((a, b) => Number(b.id) - Number(a.id));
  }

  let appliedCount = 0;
  if (state.catFilter && state.catFilter !== 'all' && state.catFilter !== catMeta.slug) appliedCount++;
  if (state.brandFilter !== 'all') appliedCount++;
  if (state.sizeFilter !== 'all') appliedCount++;
  if (state.colorFilter !== 'all') appliedCount++;
  if (state.priceFilter !== 'all') appliedCount++;
  if (state.shippingFilter !== 'all') appliedCount++;
  if (state.conditionFilter !== 'all') appliedCount++;
  if (state.availabilityFilter !== 'all') appliedCount++;

  const sortMap = {
    'relevance': 'Relevance',
    'featured': 'Relevance',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'rating': 'Highest Rated',
    'newest': 'Newest'
  };
  const sortLabel = sortMap[state.sortBy] || 'Relevance';

  // Read stored wishlist
  let storedWishlist = [];
  try {
    const rawWish = localStorage.getItem('ameza_wishlist');
    if (rawWish) storedWishlist = JSON.parse(rawWish);
    if (!Array.isArray(storedWishlist)) storedWishlist = [];
  } catch (e) {}

  // 4. Render HTML matching Screenshot 4 exactly
  root.innerHTML = `
    <div class="taxonomy-page-container">
      
      <!-- Breadcrumbs -->
      <nav class="tax-breadcrumbs" aria-label="Breadcrumb navigation">
        ${breadcrumbTrail.map((b, i) => `
          ${i > 0 ? '<span class="sep">&gt;</span>' : ''}
          ${b.current ? `<span class="current">${escapeHtml(b.label)}</span>` : `<a href="${b.url}">${escapeHtml(b.label)}</a>`}
        `).join('')}
      </nav>

      <!-- Gray Box Hero Banner (Matches Screenshot 4) -->
      <div class="tax-gray-hero-box">
        <h1 class="tax-serif-title">${escapeHtml(pageTitle)}</h1>
      </div>

      <!-- Horizontal Filter Pills Bar (Matches Screenshot 4) -->
      <div class="tax-filter-pills-bar">
        <div class="tax-pills-left">
          
          <!-- Category Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'category' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.catFilter && state.catFilter !== 'all' ? 'active' : ''}" data-toggle-pill="category">
              Category <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.catFilter === 'all' ? 'selected' : ''}" data-action="cat" data-val="all">All Categories</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'clothing' ? 'selected' : ''}" data-action="cat" data-val="clothing">Clothing</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'electronics' ? 'selected' : ''}" data-action="cat" data-val="electronics">Electronics</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'watches' ? 'selected' : ''}" data-action="cat" data-val="watches">Watches</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'leather-belts' ? 'selected' : ''}" data-action="cat" data-val="leather-belts">Leather Belts</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'leather-wallets' ? 'selected' : ''}" data-action="cat" data-val="leather-wallets">Leather Wallets</button>
              <button type="button" class="tax-drop-item ${state.catFilter === 'bags' ? 'selected' : ''}" data-action="cat" data-val="bags">Bags &amp; Totes</button>
            </div>
          </div>

          <!-- Brand Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'brand' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.brandFilter !== 'all' ? 'active' : ''}" data-toggle-pill="brand">
              ${state.brandFilter !== 'all' ? escapeHtml(state.brandFilter) : 'Brand'} <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.brandFilter === 'all' ? 'selected' : ''}" data-action="brand" data-val="all">All Brands</button>
              <button type="button" class="tax-drop-item ${state.brandFilter === 'Urban Leather Co.' ? 'selected' : ''}" data-action="brand" data-val="Urban Leather Co.">Urban Leather Co.</button>
              <button type="button" class="tax-drop-item ${state.brandFilter === 'Artisan Studio' ? 'selected' : ''}" data-action="brand" data-val="Artisan Studio">Artisan Studio</button>
              <button type="button" class="tax-drop-item ${state.brandFilter === 'AMEZA Select' ? 'selected' : ''}" data-action="brand" data-val="AMEZA Select">AMEZA Select</button>
            </div>
          </div>

          <!-- Size Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'size' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.sizeFilter !== 'all' ? 'active' : ''}" data-toggle-pill="size">
              Size <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.sizeFilter === 'all' ? 'selected' : ''}" data-action="size" data-val="all">All Sizes</button>
              <button type="button" class="tax-drop-item ${state.sizeFilter === 'S' ? 'selected' : ''}" data-action="size" data-val="S">Small (S)</button>
              <button type="button" class="tax-drop-item ${state.sizeFilter === 'M' ? 'selected' : ''}" data-action="size" data-val="M">Medium (M)</button>
              <button type="button" class="tax-drop-item ${state.sizeFilter === 'L' ? 'selected' : ''}" data-action="size" data-val="L">Large (L)</button>
              <button type="button" class="tax-drop-item ${state.sizeFilter === 'One Size' ? 'selected' : ''}" data-action="size" data-val="One Size">Standard / One Size</button>
            </div>
          </div>

          <!-- Color Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'color' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.colorFilter !== 'all' ? 'active' : ''}" data-toggle-pill="color">
              Color <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.colorFilter === 'all' ? 'selected' : ''}" data-action="color" data-val="all">All Colors</button>
              <button type="button" class="tax-drop-item ${state.colorFilter === 'Brown' ? 'selected' : ''}" data-action="color" data-val="Brown">Brown / Tan</button>
              <button type="button" class="tax-drop-item ${state.colorFilter === 'Black' ? 'selected' : ''}" data-action="color" data-val="Black">Black</button>
              <button type="button" class="tax-drop-item ${state.colorFilter === 'Natural' ? 'selected' : ''}" data-action="color" data-val="Natural">Natural / Olive</button>
            </div>
          </div>

          <!-- Price Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'price' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.priceFilter !== 'all' ? 'active' : ''}" data-toggle-pill="price">
              ${state.priceFilter === '0-50' ? 'Under $50' : state.priceFilter === '50-100' ? '$50–$100' : state.priceFilter === '100+' ? '$100+' : 'Price'} <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.priceFilter === 'all' ? 'selected' : ''}" data-action="price" data-val="all">All Prices</button>
              <button type="button" class="tax-drop-item ${state.priceFilter === '0-50' ? 'selected' : ''}" data-action="price" data-val="0-50">Under $50</button>
              <button type="button" class="tax-drop-item ${state.priceFilter === '50-100' ? 'selected' : ''}" data-action="price" data-val="50-100">$50 &ndash; $100</button>
              <button type="button" class="tax-drop-item ${state.priceFilter === '100+' ? 'selected' : ''}" data-action="price" data-val="100+">$100+</button>
            </div>
          </div>

          <!-- Shipping Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'shipping' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.shippingFilter !== 'all' ? 'active' : ''}" data-toggle-pill="shipping">
              Shipping <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.shippingFilter === 'all' ? 'selected' : ''}" data-action="shipping" data-val="all">All Shipping</button>
              <button type="button" class="tax-drop-item ${state.shippingFilter === 'free' ? 'selected' : ''}" data-action="shipping" data-val="free">Free Shipping ($100+)</button>
              <button type="button" class="tax-drop-item ${state.shippingFilter === 'fast' ? 'selected' : ''}" data-action="shipping" data-val="fast">Fast 1-2 Day Dispatch</button>
            </div>
          </div>

          <!-- Condition Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'condition' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.conditionFilter !== 'all' ? 'active' : ''}" data-toggle-pill="condition">
              Condition <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.conditionFilter === 'all' ? 'selected' : ''}" data-action="condition" data-val="all">All Conditions</button>
              <button type="button" class="tax-drop-item ${state.conditionFilter === 'brand-new' ? 'selected' : ''}" data-action="condition" data-val="brand-new">Brand New</button>
              <button type="button" class="tax-drop-item ${state.conditionFilter === 'handcrafted' ? 'selected' : ''}" data-action="condition" data-val="handcrafted">Handcrafted Artisan</button>
            </div>
          </div>

          <!-- Availability Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'availability' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${state.availabilityFilter !== 'all' ? 'active' : ''}" data-toggle-pill="availability">
              Availability <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <button type="button" class="tax-drop-item ${state.availabilityFilter === 'all' ? 'selected' : ''}" data-action="avail" data-val="all">All Items</button>
              <button type="button" class="tax-drop-item ${state.availabilityFilter === 'in-stock' ? 'selected' : ''}" data-action="avail" data-val="in-stock">In Stock Only</button>
            </div>
          </div>

          <!-- Applied Filters Pill -->
          <div class="tax-pill-wrapper ${state.openDropdown === 'applied' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn ${appliedCount > 0 ? 'active' : ''}" data-toggle-pill="applied">
              Applied Filters ${appliedCount > 0 ? `(${appliedCount})` : ''} <span class="tax-pill-chevron">▾</span>
            </button>
            <div class="tax-pill-dropdown">
              <div style="padding: 10px 14px; font-size: 13px; color: #64748B;">
                ${appliedCount === 0 ? 'No active filters applied.' : `${appliedCount} filter${appliedCount > 1 ? 's' : ''} currently active.`}
              </div>
              ${appliedCount > 0 ? `
                <button type="button" class="tax-drop-item" data-action="reset-all" style="color: #E11D48; font-weight: 700; border-top: 1px solid #F1F5F9;">
                  <i class="fa-solid fa-rotate-left"></i> Clear All Filters
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Sort By Pill -->
        <div class="tax-pills-right">
          <div class="tax-pill-wrapper ${state.openDropdown === 'sort' ? 'open' : ''}">
            <button type="button" class="tax-pill-btn tax-sort-pill" data-toggle-pill="sort">
              Sort By: ${sortLabel} <span class="tax-pill-sort-icon">⇅</span>
            </button>
            <div class="tax-pill-dropdown tax-dropdown-right">
              <button type="button" class="tax-drop-item ${state.sortBy === 'relevance' || state.sortBy === 'featured' ? 'selected' : ''}" data-action="sort" data-val="relevance">Relevance</button>
              <button type="button" class="tax-drop-item ${state.sortBy === 'price-asc' ? 'selected' : ''}" data-action="sort" data-val="price-asc">Price: Low to High</button>
              <button type="button" class="tax-drop-item ${state.sortBy === 'price-desc' ? 'selected' : ''}" data-action="sort" data-val="price-desc">Price: High to Low</button>
              <button type="button" class="tax-drop-item ${state.sortBy === 'rating' ? 'selected' : ''}" data-action="sort" data-val="rating">Highest Rated</button>
              <button type="button" class="tax-drop-item ${state.sortBy === 'newest' ? 'selected' : ''}" data-action="sort" data-val="newest">Newest First</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Cards Grid (Uses Exact Home Page .product-card Design) -->
      <div class="tax-products-grid products-grid-4">
        ${filtered.length === 0 ? `
          <div class="tax-empty-state">
            <div class="tax-empty-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3 class="tax-empty-title">No products match your current filters</h3>
            <p class="tax-empty-desc">Try clearing your filters or explore another collection.</p>
            <button type="button" class="tax-btn-reset" data-action="reset-all">Reset Filters</button>
          </div>
        ` : filtered.map(p => {
          const isWishlisted = storedWishlist.includes(String(p.id));
          const priceDollars = (p.price || 0) / 100;
          const oldPriceDollars = p.oldPrice ? p.oldPrice / 100 : (p.compareAtPrice ? p.compareAtPrice / 100 : null);
          const priceFormatted = window.AmezaCurrency ? window.AmezaCurrency.format(priceDollars) : `$${priceDollars.toFixed(2)}`;
          const oldPriceFormatted = oldPriceDollars ? (window.AmezaCurrency ? window.AmezaCurrency.format(oldPriceDollars) : `$${oldPriceDollars.toFixed(2)}`) : null;
          
          let discountTag = p.discount ? `${p.discount} OFF` : '';
          if (!discountTag && oldPriceDollars && oldPriceDollars > priceDollars) {
            discountTag = `-${Math.round(((oldPriceDollars - priceDollars) / oldPriceDollars) * 100)}%`;
          }
          if (p.discountTag) discountTag = p.discountTag;

          const badgeText = p.badge || (p.discount ? `${p.discount} OFF` : '');
          const badgeClass = p.badge === 'NEW' ? 'badge-new' : (p.discount ? 'badge-discount' : 'badge-tag');

          return `
            <div class="product-card" data-product-id="${p.id}">
              <div class="product-img-wrap" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">
                <div class="card-badges">
                  ${badgeText ? `<span class="badge ${badgeClass}">${escapeHtml(badgeText)}</span>` : ''}
                </div>
                <button type="button" class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-action="wishlist" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.stopPropagation();">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <img src="${p.image || 'assets/products/placeholder.jpg'}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='assets/products/ul-backpack.jpg'">
                <div class="quick-view-btn"><i class="fa-regular fa-eye"></i> Quick View</div>
              </div>

              <div class="product-info">
                <h3 class="product-name" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">${escapeHtml(p.name)}</h3>
                
                <div class="product-rating">
                  <svg class="rating-star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <span class="rating-num">${(p.rating || 4.8).toFixed(1)}</span>
                  <span class="review-count">(${p.reviews || p.reviewsCount || 84})</span>
                </div>

                <div class="product-bottom">
                  <div class="price-wrap">
                    <span class="price-current">${priceFormatted}</span>
                    ${oldPriceFormatted ? `<span class="price-old">${oldPriceFormatted}</span>` : ''}
                    ${discountTag ? `<span class="price-discount-tag">${escapeHtml(discountTag)}</span>` : ''}
                  </div>

                  <button type="button" class="btn-add-cart" data-action="add-cart" data-id="${p.id}" onclick="event.stopPropagation();">
                    <i class="fa-solid fa-cart-shopping"></i> Add to cart
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Bind Pill Dropdown Toggles & Actions
  root.querySelectorAll('[data-toggle-pill]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pillName = btn.dataset.togglePill;
      state.openDropdown = state.openDropdown === pillName ? null : pillName;
      renderTaxonomyPage(root, state);
    };
  });

  // Close dropdown when clicking outside
  document.onclick = (e) => {
    if (state.openDropdown && !e.target.closest('.tax-pill-wrapper')) {
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    }
  };

  // Bind Dropdown Items
  root.querySelectorAll('[data-action="cat"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const val = btn.dataset.val;
      state.catFilter = val;
      state.openDropdown = null;
      if (val !== 'all') {
        window.history.replaceState(null, '', `category.html?cat=${encodeURIComponent(val)}`);
        state.catSlug = val;
      }
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="brand"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.brandFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="size"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.sizeFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="color"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.colorFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="price"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.priceFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="shipping"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.shippingFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="condition"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.conditionFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="avail"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.availabilityFilter = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="sort"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.sortBy = btn.dataset.val;
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  root.querySelectorAll('[data-action="reset-all"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.brandFilter = 'all';
      state.sizeFilter = 'all';
      state.colorFilter = 'all';
      state.priceFilter = 'all';
      state.shippingFilter = 'all';
      state.conditionFilter = 'all';
      state.availabilityFilter = 'all';
      state.sortBy = 'relevance';
      state.openDropdown = null;
      renderTaxonomyPage(root, state);
    };
  });

  // Bind Add to Cart & Wishlist Actions
  root.querySelectorAll('[data-action="add-cart"]').forEach(addBtn => {
    addBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const pid = addBtn.dataset.id;
      const product = state.products.find(p => String(p.id) === String(pid));
      if (product) {
        addToCart(product, 1);
        const originalHtml = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        setTimeout(() => {
          addBtn.innerHTML = originalHtml;
        }, 1200);
      }
    };
  });

  root.querySelectorAll('[data-action="wishlist"]').forEach(wishBtn => {
    wishBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const pid = wishBtn.dataset.id;
      toggleWishlist(pid, wishBtn);
    };
  });
}

function renderStarIcons(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  const empty = 5 - full - half;
  for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
  return html;
}

function toggleWishlist(productId, btn) {
  try {
    let wishlist = [];
    const raw = localStorage.getItem('ameza_wishlist');
    if (raw) wishlist = JSON.parse(raw);
    if (!Array.isArray(wishlist)) wishlist = [];

    const idx = wishlist.indexOf(String(productId));
    if (idx > -1) {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
    } else {
      wishlist.push(String(productId));
      btn.classList.add('active');
    }
    localStorage.setItem('ameza_wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent('ameza:wishlist-updated', { detail: { wishlist } }));
  } catch (e) {}
}

function syncWishlistButtons(root) {
  try {
    const raw = localStorage.getItem('ameza_wishlist');
    const wishlist = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(wishlist)) return;

    root.querySelectorAll('.btn-wishlist').forEach(btn => {
      const pid = btn.dataset.id;
      if (wishlist.includes(String(pid))) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  } catch (e) {}
}


