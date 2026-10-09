import { formatMoney } from './core/utils.js';
import { getStoreBySlug } from './data/stores-data.js';

export const STORE_DATA = {
  name: 'Urban Leather Co.',
  slug: 'urban-leather-co',
  verified: true,
  rating: 4.8,
  reviewsCount: 1200,
  joined: '2024',
  location: 'Austin, TX · USA',
  baseFollowers: 3400,
  productsCount: 75,
  responseRate: '98%',
  shippingSpeed: '1-2 days',
  products: [
    {
      id: 'ul-1',
      name: 'Leather Backpack',
      category: 'Bags',
      price: 12999, // $129.99
      compareAtPrice: 16999,
      discountTag: '-24%',
      rating: 4.8,
      reviews: 421,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-backpack.jpg'
    },
    {
      id: 'ul-2',
      name: 'Leather Messenger Bag',
      category: 'Bags',
      price: 8999, // $89.99
      compareAtPrice: 11999,
      discountTag: '-25%',
      rating: 4.7,
      reviews: 356,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-messenger.jpg'
    },
    {
      id: 'ul-3',
      name: 'Leather Wallet',
      category: 'Wallets',
      price: 3499, // $34.99
      compareAtPrice: 4499,
      discountTag: '-22%',
      rating: 4.6,
      reviews: 287,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-wallet.jpg'
    },
    {
      id: 'ul-4',
      name: 'Leather Belt',
      category: 'Belts',
      price: 3999, // $39.99
      compareAtPrice: 5499,
      discountTag: '-27%',
      rating: 4.7,
      reviews: 193,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-belt.jpg'
    },
    {
      id: 'ul-5',
      name: 'Leather Tote Bag',
      category: 'Bags',
      price: 8999, // $89.99
      compareAtPrice: 11999,
      discountTag: '-25%',
      rating: 4.8,
      reviews: 276,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-tote.jpg'
    },
    {
      id: 'ul-6',
      name: 'Leather Card Holder',
      category: 'Wallets',
      price: 2499, // $24.99
      compareAtPrice: 3299,
      discountTag: '-24%',
      rating: 4.6,
      reviews: 154,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-cardholder.jpg'
    },
    {
      id: 'ul-7',
      name: 'Leather Dopp Kit',
      category: 'Travel Goods',
      price: 4799, // $47.99
      compareAtPrice: 5999,
      discountTag: '-20%',
      rating: 4.5,
      reviews: 98,
      badge: '-20%',
      badgeType: 'discount',
      inStock: true,
      image: 'assets/products/ul-doppkit.jpg'
    },
    {
      id: 'ul-8',
      name: 'Leather Keychain',
      category: 'Leather Accessories',
      price: 1999, // $19.99
      compareAtPrice: 2499,
      discountTag: '-20%',
      rating: 4.7,
      reviews: 142,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-keychain.jpg'
    },
    {
      id: 'ul-9',
      name: 'Leather Notebook',
      category: 'Other',
      price: 4249, // $42.49
      compareAtPrice: 4999,
      discountTag: '-15%',
      rating: 4.6,
      reviews: 119,
      badge: '-15%',
      badgeType: 'discount',
      inStock: true,
      image: 'assets/products/ul-notebook.jpg'
    },
    {
      id: 'ul-10',
      name: 'Luxury Travel Duffle',
      category: 'Bags',
      price: 15999, // $159.99
      compareAtPrice: 19999,
      discountTag: '-20%',
      rating: 4.9,
      reviews: 84,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/luxury-leather-duffle.png'
    },
    {
      id: 'ul-11',
      name: 'Braided Leather Belt',
      category: 'Belts',
      price: 3699, // $36.99
      compareAtPrice: 4899,
      discountTag: '-24%',
      rating: 4.8,
      reviews: 62,
      badge: '-24%',
      badgeType: 'discount',
      inStock: true,
      image: 'assets/products/braided-leather-belt.png'
    },
    {
      id: 'ul-12',
      name: 'Leather Crossbody Bag',
      category: 'Bags',
      price: 7999, // $79.99
      compareAtPrice: 9999,
      discountTag: '-20%',
      rating: 4.7,
      reviews: 110,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/leather-crossbody-bag.png'
    },
    // Next Batch of 12 Products (for Load More functionality)
    {
      id: 'ul-13',
      name: 'Vintage Distressed Leather Belt',
      category: 'Belts',
      price: 4499, // $44.99
      compareAtPrice: 5999,
      discountTag: '-25%',
      rating: 4.9,
      reviews: 88,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/distressed-leather-belt.png'
    },
    {
      id: 'ul-14',
      name: 'Executive Bifold Wallet',
      category: 'Wallets',
      price: 4999, // $49.99
      compareAtPrice: 6500,
      discountTag: '-23%',
      rating: 4.8,
      reviews: 145,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/bifold-leather-wallet.png'
    },
    {
      id: 'ul-15',
      name: 'Heritage Classic Stitched Belt',
      category: 'Belts',
      price: 4299, // $42.99
      compareAtPrice: 5299,
      discountTag: '-19%',
      rating: 4.7,
      reviews: 73,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/classic-stitched-belt.png'
    },
    {
      id: 'ul-16',
      name: 'Teal Artisan Mini Satchel',
      category: 'Bags',
      price: 6899, // $68.99
      compareAtPrice: 8500,
      discountTag: '-18%',
      rating: 4.6,
      reviews: 54,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/teal-mini-satchel.png'
    },
    {
      id: 'ul-17',
      name: 'Emerald Shoulder Handbag',
      category: 'Bags',
      price: 9499, // $94.99
      compareAtPrice: 12000,
      discountTag: '-21%',
      rating: 4.9,
      reviews: 92,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/emerald-shoulder-bag.png'
    },
    {
      id: 'ul-18',
      name: 'Western Buckle Tan Belt',
      category: 'Belts',
      price: 4699, // $46.99
      compareAtPrice: 5999,
      discountTag: '-22%',
      rating: 4.7,
      reviews: 41,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/western-buckle-belt.png'
    },
    {
      id: 'ul-19',
      name: 'Canvas & Leather Contrast Tote',
      category: 'Bags',
      price: 7499, // $74.99
      compareAtPrice: 9500,
      discountTag: '-21%',
      rating: 4.8,
      reviews: 116,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/canvas-contrast-tote.png'
    },
    {
      id: 'ul-20',
      name: 'Silver Buckle Dress Belt',
      category: 'Belts',
      price: 3899, // $38.99
      compareAtPrice: 4899,
      discountTag: '-20%',
      rating: 4.5,
      reviews: 38,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/silver-buckle-belt.png'
    },
    {
      id: 'ul-21',
      name: 'Vintage Brown Leather Belt',
      category: 'Belts',
      price: 4199, // $41.99
      compareAtPrice: 5500,
      discountTag: '-24%',
      rating: 4.6,
      reviews: 67,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/vintage-brown-belt.png'
    },
    {
      id: 'ul-22',
      name: 'Navy Blue Crossbody Bag',
      category: 'Bags',
      price: 8499, // $84.99
      compareAtPrice: 11000,
      discountTag: '-23%',
      rating: 4.8,
      reviews: 82,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/navy-crossbody-bag.png'
    },
    {
      id: 'ul-23',
      name: 'Minimalist Card Sleeve',
      category: 'Wallets',
      price: 2199, // $21.99
      compareAtPrice: 2899,
      discountTag: '-24%',
      rating: 4.6,
      reviews: 95,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-cardholder.jpg'
    },
    {
      id: 'ul-24',
      name: 'Artisan Passport Travel Wallet',
      category: 'Travel Goods',
      price: 3899, // $38.99
      compareAtPrice: 4999,
      discountTag: '-22%',
      rating: 4.7,
      reviews: 112,
      badge: 'NEW',
      badgeType: 'new',
      inStock: true,
      image: 'assets/products/ul-wallet.jpg'
    }
  ]
};

// USA-Based Verified Customer Reviews Data
export const STORE_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    avatar: 'SJ',
    location: 'Austin, TX',
    rating: 5,
    date: '2 days ago',
    product: 'Leather Backpack',
    title: 'Outstanding craftsmanship, supple full-grain leather!',
    body: 'Received my leather backpack in Austin within 2 business days. The packaging was immaculate with a branded cotton dust bag. The leather thickness is top-tier and the brass zippers glide smoothly. Highly recommended!',
    helpful: 34,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-2',
    author: 'David Miller',
    avatar: 'DM',
    location: 'Denver, CO',
    rating: 5,
    date: '4 days ago',
    product: 'Leather Messenger Bag',
    title: 'Perfect work bag for my 15-inch laptop and essentials',
    body: 'This bag looks and smells amazing. The strap is super comfortable on long commutes and the brass buckles give it a vintage executive look. Exceeded all my expectations.',
    helpful: 28,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-3',
    author: 'Emily Roberts',
    avatar: 'ER',
    location: 'Seattle, WA',
    rating: 5,
    date: '1 week ago',
    product: 'Leather Tote Bag',
    title: 'The perfect daily tote, elegant and durable',
    body: 'Fits my MacBook Air, water bottle, planner, and daily pouch comfortably without bulging. The handles are reinforced with double-needle saddle stitching. Proud to support such exceptional craftsmanship.',
    helpful: 19,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-4',
    author: 'Michael Bennett',
    avatar: 'MB',
    location: 'Chicago, IL',
    rating: 4,
    date: '1 week ago',
    product: 'Leather Belt',
    title: 'Heavy gauge leather, solid brass hardware',
    body: 'The leather is genuine vegetable tanned cowhide that will patina beautifully. Sizing was true to chart. Solid brass buckle is substantial and looks great with jeans or chinos.',
    helpful: 15,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-5',
    author: 'Jessica Taylor',
    avatar: 'JT',
    location: 'New York, NY',
    rating: 5,
    date: '2 weeks ago',
    product: 'Leather Wallet',
    title: 'Sleek bifold with ample card slots',
    body: 'Card slots are snug initially but break in nicely after a couple of days. The RFID blocking works as advertised and the profile is slim in my front pocket.',
    helpful: 22,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-6',
    author: 'Robert Hayes',
    avatar: 'RH',
    location: 'San Francisco, CA',
    rating: 5,
    date: '2 weeks ago',
    product: 'Leather Dopp Kit',
    title: 'Best travel toiletry kit I have ever owned',
    body: 'Water-resistant interior lining with durable brass zipper. Traveled with me through three countries already and holds up like a tank. Well worth the price.',
    helpful: 12,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-7',
    author: 'Amanda Collins',
    avatar: 'AC',
    location: 'Nashville, TN',
    rating: 4,
    date: '3 weeks ago',
    product: 'Leather Card Holder',
    title: 'Minimalist perfection for quick errands',
    body: 'Holds 6 cards and folded cash with zero bulk. The saddle stitch is flawless. Delivery was fast via USPS Priority.',
    helpful: 9,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-8',
    author: 'Christopher Davis',
    avatar: 'CD',
    location: 'Atlanta, GA',
    rating: 5,
    date: '3 weeks ago',
    product: 'Leather Keychain',
    title: 'Simple, rugged, and stylish',
    body: 'Solid brass hardware with thick bridle leather. Makes a great gift or everyday carry piece. Will be purchasing more for the holidays.',
    helpful: 14,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-9',
    author: 'Megan Wilson',
    avatar: 'MW',
    location: 'Boston, MA',
    rating: 5,
    date: '1 month ago',
    product: 'Leather Notebook',
    title: 'Gorgeous refillable journal for creative work',
    body: 'The leather wrap strap gives it an old-world explorer feel. Paper quality inside is heavy weight and handles fountain pen ink without bleeding.',
    helpful: 31,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-10',
    author: 'Daniel Martinez',
    avatar: 'DM',
    location: 'Phoenix, AZ',
    rating: 5,
    date: '1 month ago',
    product: 'Luxury Travel Duffle',
    title: 'The ultimate weekender bag, stunning quality',
    body: 'Fits overhead airplane compartments easily. Solid brass feet keep the bottom off airport floors. It draws compliments everywhere I travel.',
    helpful: 42,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-11',
    author: 'Rachel Adams',
    avatar: 'RA',
    location: 'Portland, OR',
    rating: 4,
    date: '1 month ago',
    product: 'Braided Leather Belt',
    title: 'Very comfortable and easy to micro-adjust',
    body: 'Love the flexible woven design. Can fasten anywhere along the strap without fixed holes. High quality leather smell right out of the box.',
    helpful: 8,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-12',
    author: 'Brian Walker',
    avatar: 'BW',
    location: 'Miami, FL',
    rating: 5,
    date: '1 month ago',
    product: 'Leather Crossbody Bag',
    title: 'Compact yet holds everything I need',
    body: 'Carries my iPad mini, Kindle, sunglasses, and keys easily. The strap is nicely padded and the magnetic closures are strong.',
    helpful: 16,
    verified: true,
    hasPhoto: true
  },
  {
    id: 'rev-13',
    author: 'Lauren Scott',
    avatar: 'LS',
    location: 'San Diego, CA',
    rating: 5,
    date: '2 months ago',
    product: 'Leather Backpack',
    title: 'Five stars all the way!',
    body: 'Customer service answered my monogramming question in 10 minutes. Delivered 2 days early. The craftsmanship on this bag rivals luxury brands charging 4x the price.',
    helpful: 27,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-14',
    author: 'James Turner',
    avatar: 'JT',
    location: 'Dallas, TX',
    rating: 3,
    date: '2 months ago',
    product: 'Leather Belt',
    title: 'Good quality, runs slightly small',
    body: 'Great leather, but recommend ordering one size up from your pant waist. Exchange process was smooth and fast though.',
    helpful: 11,
    verified: true,
    hasPhoto: false
  },
  {
    id: 'rev-15',
    author: 'Olivia Harris',
    avatar: 'OH',
    location: 'Minneapolis, MN',
    rating: 5,
    date: '2 months ago',
    product: 'Leather Tote Bag',
    title: 'Heirloom quality piece I will cherish forever',
    body: 'The leather softens and gets richer color with each week of use. It stands upright on its own without collapsing. Best purchase of the year.',
    helpful: 35,
    verified: true,
    hasPhoto: true
  }
];

export function initStorePage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const targetSlug = params ? (params.get('slug') || params.get('vendor') || params.get('store')) : null;
  const activeStore = targetSlug ? getStoreBySlug(targetSlug) : null;

  if (activeStore) {
    if (activeStore.slug !== 'urban-leather-co') {
      document.title = `${activeStore.name} | Official Store - AMEZA Marketplace`;
      const titleEl = document.getElementById('store-title-name');
      if (titleEl) titleEl.textContent = activeStore.name;

      const crumbEl = document.querySelector('.tax-breadcrumbs .current');
      if (crumbEl) crumbEl.textContent = activeStore.name;

      const bannerEl = document.querySelector('.store-banner-wrapper');
      if (bannerEl && activeStore.banner) bannerEl.style.backgroundImage = `url('${activeStore.banner}')`;

      const monogramEl = document.querySelector('.store-logo-monogram');
      if (monogramEl) {
        monogramEl.style.background = activeStore.monogramColor;
        monogramEl.innerHTML = `<span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:36px; font-weight:800; color:#FFFFFF;">${activeStore.monogram}</span><span class="store-logo-subtext">${activeStore.name.toUpperCase()}</span>`;
      }

      const ratingValEl = document.querySelector('.store-rating-val');
      if (ratingValEl) ratingValEl.textContent = activeStore.rating.toFixed(1);

      const reviewsLinkEl = document.getElementById('link-open-reviews-tab');
      if (reviewsLinkEl) reviewsLinkEl.textContent = `(${activeStore.reviewsCount} reviews)`;

      const statProductsEl = document.getElementById('stat-products-count');
      if (statProductsEl) statProductsEl.textContent = activeStore.productsCount;

      const statFollowersEl = document.getElementById('stat-followers-count');
      if (statFollowersEl) statFollowersEl.textContent = (activeStore.followers / 1000).toFixed(1) + 'k';

      const aboutTextEl = document.querySelector('.store-about-text');
      if (aboutTextEl) aboutTextEl.textContent = activeStore.tagline;

      const storyP = document.querySelector('.store-story-box p');
      if (storyP) storyP.textContent = `${activeStore.name} is a verified independent marketplace merchant based in ${activeStore.location}. ${activeStore.tagline}`;

      STORE_DATA.name = activeStore.name;
      STORE_DATA.slug = activeStore.slug;
      STORE_DATA.rating = activeStore.rating;
      STORE_DATA.reviewsCount = activeStore.reviewsCount;
      STORE_DATA.productsCount = activeStore.productsCount;
      STORE_DATA.baseFollowers = activeStore.followers || 3400;
      STORE_DATA.location = activeStore.location;
      STORE_DATA.shippingSpeed = activeStore.shippingSpeed || '1-2 days';
      STORE_DATA.responseRate = activeStore.responseRate || '98%';
      STORE_DATA.tagline = activeStore.tagline;
    }

    if (Array.isArray(activeStore.products) && activeStore.products.length > 0) {
      STORE_DATA.products = activeStore.products;
    }
  }

  // Populate dynamic category checkboxes for this store
  const catListContainer = document.getElementById('store-category-filters-list');
  if (catListContainer && activeStore && activeStore.slug !== 'urban-leather-co') {
    const catMap = {};
    STORE_DATA.products.forEach(p => {
      const c = p.category || 'Other';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    catListContainer.innerHTML = Object.entries(catMap).map(([c, count]) => `
      <label class="filter-check-row">
        <input type="checkbox" class="sidebar-check-input cat-filter-checkbox" value="${c}">
        <span>${c} <span class="filter-item-count">(${count})</span></span>
      </label>
    `).join('');
  }

  // Calculate price boundaries from current store catalog
  const storePriceValues = STORE_DATA.products.map(p => Math.ceil((Number(p.priceCents !== undefined ? p.priceCents : p.price) || 0) / 100));
  const maxStorePrice = Math.max(150, Math.max(...storePriceValues));
  let displayedCount = 12; // Initial 12 products per user request!
  let selectedCategories = [];
  let maxPrice = maxStorePrice;
  let inStockOnly = true;
  let sortBy = 'popular';
  let searchQuery = '';

  const followKey = `ameza_mkt_follow_${(activeStore ? activeStore.slug : STORE_DATA.slug)}`;
  let isFollowing = localStorage.getItem(followKey) === 'true';

  // DOM references
  const gridContainer = document.getElementById('store-products-grid');
  const countDisplay = document.getElementById('grid-total-count');
  const progressText = document.getElementById('grid-progress-text');
  const progressFill = document.getElementById('grid-progress-fill');
  const btnLoadMore = document.getElementById('btn-load-more');
  const btnFollow = document.getElementById('btn-follow-store');
  const followersCountEl = document.getElementById('stat-followers-count');
  const cartBadge = document.getElementById('header-cart-badge');
  const wishlistBadge = document.getElementById('header-wishlist-badge');

  const priceSlider = document.getElementById('price-range-slider');
  const priceDisplay = document.getElementById('price-range-max-val');
  if (priceSlider) {
    priceSlider.max = String(maxStorePrice);
    priceSlider.value = String(maxStorePrice);
  }
  if (priceDisplay) {
    priceDisplay.textContent = `$${maxStorePrice}`;
  }

  function updateFollowButton() {
    if (!btnFollow) return;
    const currentFollowers = STORE_DATA.baseFollowers + (isFollowing ? 1 : 0);
    if (followersCountEl) {
      followersCountEl.textContent = isFollowing ? (currentFollowers / 1000).toFixed(1) + 'k' : (STORE_DATA.baseFollowers / 1000).toFixed(1) + 'k';
    }
    if (isFollowing) {
      btnFollow.classList.add('following');
      btnFollow.innerHTML = '<i class="fa-solid fa-check"></i> Following';
    } else {
      btnFollow.classList.remove('following');
      btnFollow.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow';
    }
  }

  if (btnFollow) {
    btnFollow.addEventListener('click', () => {
      isFollowing = !isFollowing;
      localStorage.setItem(followKey, String(isFollowing));
      updateFollowButton();
      showStoreToast(isFollowing ? `You are now following ${STORE_DATA.name}` : `Unfollowed ${STORE_DATA.name}`);
    });
  }

  function getFilteredProducts() {
    return STORE_DATA.products.filter(p => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (p.price / 100 > maxPrice) return false;
      if (inStockOnly && !p.inStock) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.reviews - a.reviews;
      if (sortBy === 'newest') return (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0);
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }

  function renderProductsGrid() {
    if (!gridContainer) return;
    const filtered = getFilteredProducts();
    const visible = filtered.slice(0, displayedCount);

    let totalCount = STORE_DATA.products.length;
    if (selectedCategories.length === 1) {
      const match = STORE_DATA.products.filter(p => p.category === selectedCategories[0]);
      totalCount = match.length || filtered.length;
    } else if (selectedCategories.length > 1 || searchQuery || maxPrice < maxStorePrice) {
      totalCount = filtered.length;
    }

    if (countDisplay) countDisplay.textContent = `${totalCount} products`;
    if (progressText) progressText.textContent = `Showing ${visible.length} of ${totalCount} products`;
    if (progressFill) {
      const pct = Math.min(100, Math.round((visible.length / totalCount) * 100));
      progressFill.style.width = `${pct}%`;
    }

    if (btnLoadMore) {
      btnLoadMore.style.display = visible.length >= filtered.length ? 'none' : 'inline-block';
    }

    if (visible.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; background: #fff; border-radius: 12px; border: 1px solid var(--border);">
          <i class="fa-solid fa-box-open" style="font-size: 36px; color: var(--text-light); margin-bottom: 12px;"></i>
          <h3 style="font-size: 17px; margin: 0 0 6px;">No products match your criteria</h3>
          <p style="font-size: 13.5px; color: var(--text-muted); margin: 0 0 16px;">Try adjusting your category filter, price slider, or search term.</p>
          <button class="btn-load-more" id="btn-reset-empty-filters">Reset Filters</button>
        </div>
      `;
      const btnResetEmpty = document.getElementById('btn-reset-empty-filters');
      if (btnResetEmpty) btnResetEmpty.addEventListener('click', resetFilters);
      return;
    }

    const wishlist = getStoredWishlist();

    gridContainer.innerHTML = visible.map(p => {
      const isWishlisted = wishlist.includes(p.id);
      const currentPrice = Number(p.priceCents !== undefined ? p.priceCents : p.price) || 0;
      const comparePrice = Number(p.compareAtCents || p.compareAtPriceCents || p.compareAtPrice || 0);
      const hasDiscount = comparePrice > currentPrice && currentPrice > 0;
      const discountPct = hasDiscount ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;
      const tagText = hasDiscount ? `-${discountPct}%` : '';

      let badgeHtml = '';
      if (hasDiscount) {
        badgeHtml = `<span class="badge badge-discount">-${discountPct}%</span>`;
      } else if (p.badge) {
        const cls = p.badgeType === 'new' ? 'badge-new' : 'badge-popular';
        badgeHtml = `<span class="badge ${cls}">${p.badge}</span>`;
      }

      return `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-img-wrap" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">
            <div class="card-badges">
              ${badgeHtml}
            </div>
            <button type="button" class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-action="toggle-wishlist" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.stopPropagation();">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="quick-view-btn"><i class="fa-regular fa-eye"></i> Quick View</div>
          </div>
          <div class="product-info">
            <h3 class="product-name" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">${p.name}</h3>
            <div class="product-rating">
              <svg class="rating-star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span class="rating-num">${p.rating}</span>
              <span class="review-count">(${p.reviews})</span>
            </div>
            <div class="product-bottom">
              <div class="price-wrap">
                <span class="price-current">${formatMoney(currentPrice)}</span>
                ${hasDiscount ? `<span class="price-old">${formatMoney(comparePrice)}</span>` : ''}
                ${tagText ? `<span class="price-discount-tag">${tagText}</span>` : ''}
              </div>
              <button type="button" class="btn-add-cart" data-action="add-cart" data-id="${p.id}" onclick="event.stopPropagation();">
                <i class="fa-solid fa-cart-shopping"></i> Add to cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Load More Button (Increments by 12 products per click!)
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      displayedCount += 12;
      renderProductsGrid();
    });
  }

  // Reset Filters
  function resetFilters() {
    selectedCategories = [];
    maxPrice = maxStorePrice;
    inStockOnly = true;
    searchQuery = '';

    document.querySelectorAll('.cat-filter-checkbox').forEach(cb => cb.checked = false);
    const priceSlider = document.getElementById('price-range-slider');
    const priceDisplay = document.getElementById('price-range-max-val');
    if (priceSlider) priceSlider.value = maxStorePrice;
    if (priceDisplay) priceDisplay.textContent = `$${maxStorePrice}`;
    const inStockBox = document.getElementById('filter-in-stock');
    if (inStockBox) inStockBox.checked = true;
    const outStockBox = document.getElementById('filter-out-of-stock');
    if (outStockBox) outStockBox.checked = false;
    const searchInputEl = document.getElementById('store-search-input');
    if (searchInputEl) searchInputEl.value = '';

    displayedCount = 12;
    renderProductsGrid();
  }

  const btnReset = document.getElementById('btn-reset-filters');
  if (btnReset) btnReset.addEventListener('click', resetFilters);

  // Category Filter Checkboxes
  function bindCategoryCheckboxListeners() {
    const catBoxes = document.querySelectorAll('.cat-filter-checkbox');
    catBoxes.forEach(box => {
      box.addEventListener('change', () => {
        selectedCategories = Array.from(document.querySelectorAll('.cat-filter-checkbox'))
          .filter(b => b.checked)
          .map(b => b.value);
        displayedCount = 12;
        renderProductsGrid();
      });
    });
  }
  bindCategoryCheckboxListeners();

  // Price Slider Input Listener
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', (e) => {
      maxPrice = Number(e.target.value);
      priceDisplay.textContent = `$${maxPrice}`;
      displayedCount = 12;
      renderProductsGrid();
    });
  }

  // In Stock Filter
  const inStockBox = document.getElementById('filter-in-stock');
  if (inStockBox) {
    inStockBox.addEventListener('change', (e) => {
      inStockOnly = e.target.checked;
      displayedCount = 12;
      renderProductsGrid();
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById('sort-products-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderProductsGrid();
    });
  }

  // Mobile Filter Drawer Toggle (Filter Button & Drawer)
  const btnStoreFilterTrigger = document.getElementById('btn-store-filters-trigger');
  const btnStoreFilterClose = document.getElementById('btn-close-store-filters');
  const storeFiltersSidebar = document.getElementById('store-filters-sidebar');
  const storeFilterBackdrop = document.getElementById('store-filter-backdrop');

  const openStoreFilters = () => {
    if (storeFiltersSidebar) storeFiltersSidebar.classList.add('mobile-open');
    if (storeFilterBackdrop) storeFilterBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeStoreFilters = () => {
    if (storeFiltersSidebar) storeFiltersSidebar.classList.remove('mobile-open');
    if (storeFilterBackdrop) storeFilterBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  const btnStoreFilterApply = document.getElementById('btn-apply-store-filters');
  if (btnStoreFilterTrigger) btnStoreFilterTrigger.addEventListener('click', openStoreFilters);
  if (btnStoreFilterClose) btnStoreFilterClose.addEventListener('click', closeStoreFilters);
  if (btnStoreFilterApply) btnStoreFilterApply.addEventListener('click', closeStoreFilters);
  if (storeFilterBackdrop) storeFilterBackdrop.addEventListener('click', closeStoreFilters);

  // Search inside store (Top of sidebar)
  const searchInput = document.getElementById('store-search-input');
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        displayedCount = 12;
        renderProductsGrid();
      }, 200);
    });
  }

  // Product Grid Clicks: Add to Cart & Wishlist
  if (gridContainer) {
    gridContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-action="add-cart"]');
      if (addBtn) {
        const id = addBtn.dataset.id;
        const product = STORE_DATA.products.find(p => p.id === id);
        if (product) addToStoreCart(product, addBtn);
        return;
      }

      const wishBtn = e.target.closest('[data-action="toggle-wishlist"]');
      if (wishBtn) {
        const id = wishBtn.dataset.id;
        toggleStoreWishlist(id, wishBtn);
        return;
      }
    });
  }

  // Add to Cart integration with ameza_cart
  function addToStoreCart(product, btn) {
    try {
      if (typeof window.addToCart === 'function') {
        window.addToCart(product, 1);
      } else {
        let cart = JSON.parse(localStorage.getItem('ameza_cart') || '[]');
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1,
            sellerId: STORE_DATA.slug,
            sellerName: STORE_DATA.name
          });
        }
        localStorage.setItem('ameza_cart', JSON.stringify(cart));
        updateCartBadge();

        // Dispatch sync event
        window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart } }));

        if (typeof window.openCartDrawer === 'function') {
          window.openCartDrawer();
        }
      }

      // Button visual feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
      btn.style.backgroundColor = 'var(--primary-dark)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = 'var(--primary)';
      }, 1200);

      showStoreToast(`Added "${product.name}" to cart`);
    } catch (e) {
      console.error('Cart error', e);
    }
  }

  function getStoredWishlist() {
    try {
      return JSON.parse(localStorage.getItem('ameza_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  }

  function toggleStoreWishlist(id, btn) {
    try {
      let wishlist = getStoredWishlist();
      const idx = wishlist.indexOf(id);
      let added = false;
      if (idx > -1) {
        wishlist.splice(idx, 1);
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-regular fa-heart';
      } else {
        wishlist.push(id);
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-heart';
        added = true;
      }
      localStorage.setItem('ameza_wishlist', JSON.stringify(wishlist));
      updateWishlistBadge();
      showStoreToast(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch (e) {
      console.error('Wishlist error', e);
    }
  }

  function updateCartBadge() {
    try {
      const cart = JSON.parse(localStorage.getItem('ameza_cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      if (cartBadge) {
        cartBadge.textContent = total;
        cartBadge.style.display = total > 0 ? 'flex' : 'none';
      }
    } catch (e) {}
  }

  function updateWishlistBadge() {
    try {
      const wishlist = getStoredWishlist();
      if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
      }
    } catch (e) {}
  }

  // Tabs Switching Logic (Products, About, Reviews)
  const tabButtons = document.querySelectorAll('.store-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  function switchTab(targetTab) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${targetTab}`);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      window.location.hash = `#${target}`;
      switchTab(target);
    });
  });

  const reviewsLink = document.getElementById('link-open-reviews-tab');
  if (reviewsLink) {
    reviewsLink.addEventListener('click', () => {
      window.location.hash = '#reviews';
      switchTab('reviews');
    });
  }

  // ==========================================
  // REVIEWS TAB CONTROLLER (10 initial + filter pills + load more)
  // ==========================================
  let reviewsDisplayLimit = 10;
  let activeReviewFilter = 'all'; // all, 5star, 4star, photos, verified

  const reviewsListContainer = document.getElementById('customer-reviews-container');
  const btnLoadMoreReviews = document.getElementById('btn-load-more-reviews');
  const reviewFilterPills = document.querySelectorAll('.rev-filter-pill');

  function renderReviews() {
    if (!reviewsListContainer) return;

    let filteredRev = STORE_REVIEWS.filter(r => {
      if (activeReviewFilter === '5star') return r.rating === 5;
      if (activeReviewFilter === '4star') return r.rating === 4;
      if (activeReviewFilter === 'photos') return r.hasPhoto;
      if (activeReviewFilter === 'verified') return r.verified;
      return true;
    });

    const visibleRev = filteredRev.slice(0, reviewsDisplayLimit);

    if (btnLoadMoreReviews) {
      btnLoadMoreReviews.style.display = visibleRev.length >= filteredRev.length ? 'none' : 'inline-block';
      btnLoadMoreReviews.textContent = `Load More Reviews (${filteredRev.length - visibleRev.length} remaining)`;
    }

    if (visibleRev.length === 0) {
      reviewsListContainer.innerHTML = `
        <div style="text-align: center; padding: 36px; background: #fff; border-radius: 12px; border: 1px solid var(--border);">
          <p style="color: var(--text-muted); margin: 0;">No reviews found for this filter.</p>
        </div>
      `;
      return;
    }

    reviewsListContainer.innerHTML = visibleRev.map(r => `
      <div class="review-card-item">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary-dark); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px;">${r.avatar}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 14.5px; color: var(--text);">${r.author}</strong>
                ${r.verified ? `<span style="font-size: 11px; background: #EBF8EC; color: #166534; padding: 2px 7px; border-radius: 4px; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Verified Buyer</span>` : ''}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                ${r.location} &middot; Purchased: ${r.product} &middot; ${r.date}
              </div>
            </div>
          </div>
          <div class="store-rating-stars" style="font-size: 13px;">
            ${Array.from({ length: 5 }).map((_, i) => `<i class="fa-solid fa-star" style="color: ${i < r.rating ? 'var(--star)' : '#E5E7EB'};"></i>`).join('')}
          </div>
        </div>
        <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: var(--text);">${r.title}</h4>
        <p style="margin: 0 0 12px; font-size: 13.5px; color: var(--text-muted); line-height: 1.55;">
          ${r.body}
        </p>
        <div style="display: flex; align-items: center; gap: 14px; font-size: 12px;">
          <button class="btn-helpful" style="background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; cursor: pointer; color: var(--text-muted); font-size: 12px;">
            <i class="fa-regular fa-thumbs-up"></i> Helpful (${r.helpful})
          </button>
          ${r.hasPhoto ? `<span style="color: var(--primary-dark); font-weight: 600;"><i class="fa-solid fa-camera"></i> Customer photo included</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  reviewFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      reviewFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeReviewFilter = pill.dataset.filter;
      reviewsDisplayLimit = 10;
      renderReviews();
    });
  });

  if (btnLoadMoreReviews) {
    btnLoadMoreReviews.addEventListener('click', () => {
      reviewsDisplayLimit += 5;
      renderReviews();
    });
  }

  // Contact Seller Modal
  const btnContact = document.getElementById('btn-contact-seller');
  const modalOverlay = document.getElementById('contact-seller-modal');
  const btnCloseModal = document.getElementById('btn-close-contact-modal');
  const btnCancelModal = document.getElementById('btn-cancel-contact-modal');
  const formContact = document.getElementById('contact-seller-form');

  if (btnContact && modalOverlay) {
    btnContact.addEventListener('click', () => {
      modalOverlay.classList.add('show');
    });
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('show');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  if (formContact) {
    formContact.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      showStoreToast(`Message sent to ${STORE_DATA.name}`);
    });
  }

  // Initial Boot
  updateFollowButton();
  updateCartBadge();
  updateWishlistBadge();

  // Hash route support (products, about, reviews)
  const initialHash = window.location.hash.replace('#', '');
  if (['products', 'about', 'reviews'].includes(initialHash)) {
    switchTab(initialHash);
  } else {
    switchTab('products');
  }

  renderProductsGrid();
  renderReviews();
}

function showStoreToast(msg) {
  let toast = document.getElementById('store-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'store-global-toast';
    toast.className = 'store-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-check" style="color:var(--primary);"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
