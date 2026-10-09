/**
 * AMEZA Marketplace - Curated Stores & Vendors Registry
 * Provides realistic vendor profiles, ratings, badges, and catalog previews.
 */

export const STORES_LIST = [
  {
    id: 'store_urban_leather',
    slug: 'urban-leather-co',
    name: 'Urban Leather Co.',
    monogram: 'UL',
    monogramColor: 'linear-gradient(135deg, #1E293B, #0F172A)',
    textColor: '#FFFFFF',
    category: 'Handcrafted Leather',
    categoryKey: 'leather',
    location: 'Austin, TX · USA',
    rating: 4.8,
    reviewsCount: 1200,
    productsCount: 75,
    followers: 3400,
    verified: true,
    badge: 'Master Artisan',
    banner: 'assets/store-banner.jpg',
    tagline: 'Hand-stitched full-grain American bovine leather backpacks, messenger bags, and accessories.',
    shippingSpeed: '1-2 days',
    responseRate: '98%',
    categories: ['Bags', 'Wallets', 'Belts', 'Leather Accessories', 'Travel Goods', 'Other'],
    featuredProducts: [
      { id: 'ul-10', name: 'Luxury Duffle', price: '$159.99', image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'ul-12', name: 'Crossbody Bag', price: '$79.99', image: 'assets/products/leather-crossbody-bag.png' },
      { id: 'ul-11', name: 'Braided Belt', price: '$36.99', image: 'assets/products/braided-leather-belt.png' },
      { id: 'ul-3', name: 'Bifold Wallet', price: '$34.99', image: 'assets/products/bifold-leather-wallet.png' }
    ],
    products: [
      { id: 'ul-1', name: 'Leather Backpack', category: 'Bags', price: 12999, compareAtPrice: 16999, rating: 4.8, reviews: 421, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-backpack.jpg' },
      { id: 'ul-2', name: 'Leather Messenger Bag', category: 'Bags', price: 8999, compareAtPrice: 11999, rating: 4.7, reviews: 356, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-messenger.jpg' },
      { id: 'ul-3', name: 'Leather Wallet', category: 'Wallets', price: 3499, compareAtPrice: 4499, rating: 4.6, reviews: 287, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-wallet.jpg' },
      { id: 'ul-4', name: 'Leather Belt', category: 'Belts', price: 3999, compareAtPrice: 5499, rating: 4.7, reviews: 193, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-belt.jpg' },
      { id: 'ul-5', name: 'Leather Tote Bag', category: 'Bags', price: 8999, compareAtPrice: 11999, rating: 4.8, reviews: 276, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-tote.jpg' },
      { id: 'ul-6', name: 'Leather Card Holder', category: 'Wallets', price: 2499, compareAtPrice: 3299, rating: 4.6, reviews: 154, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-cardholder.jpg' },
      { id: 'ul-7', name: 'Leather Dopp Kit', category: 'Travel Goods', price: 4799, compareAtPrice: 5999, rating: 4.5, reviews: 98, badge: '-20%', badgeType: 'discount', inStock: true, image: 'assets/products/ul-doppkit.jpg' },
      { id: 'ul-8', name: 'Leather Keychain', category: 'Leather Accessories', price: 1999, compareAtPrice: 2499, rating: 4.7, reviews: 142, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-keychain.jpg' },
      { id: 'ul-9', name: 'Leather Notebook', category: 'Other', price: 4249, compareAtPrice: 4999, rating: 4.6, reviews: 119, badge: '-15%', badgeType: 'discount', inStock: true, image: 'assets/products/ul-notebook.jpg' },
      { id: 'ul-10', name: 'Luxury Travel Duffle', category: 'Bags', price: 15999, compareAtPrice: 19999, rating: 4.9, reviews: 84, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'ul-11', name: 'Braided Leather Belt', category: 'Belts', price: 3699, compareAtPrice: 4899, rating: 4.8, reviews: 62, badge: '-24%', badgeType: 'discount', inStock: true, image: 'assets/products/braided-leather-belt.png' },
      { id: 'ul-12', name: 'Leather Crossbody Bag', category: 'Bags', price: 7999, compareAtPrice: 9999, rating: 4.7, reviews: 110, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/leather-crossbody-bag.png' },
      { id: 'ul-13', name: 'Vintage Distressed Leather Belt', category: 'Belts', price: 4499, compareAtPrice: 5999, rating: 4.9, reviews: 88, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/distressed-leather-belt.png' },
      { id: 'ul-14', name: 'Executive Bifold Wallet', category: 'Wallets', price: 4999, compareAtPrice: 6500, rating: 4.8, reviews: 145, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'ul-15', name: 'Heritage Classic Stitched Belt', category: 'Belts', price: 4299, compareAtPrice: 5299, rating: 4.7, reviews: 73, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/classic-stitched-belt.png' },
      { id: 'ul-16', name: 'Teal Artisan Mini Satchel', category: 'Bags', price: 6899, compareAtPrice: 8500, rating: 4.6, reviews: 54, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/teal-mini-satchel.png' },
      { id: 'ul-17', name: 'Emerald Shoulder Handbag', category: 'Bags', price: 9499, compareAtPrice: 12000, rating: 4.9, reviews: 92, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/emerald-shoulder-bag.png' },
      { id: 'ul-18', name: 'Western Buckle Tan Belt', category: 'Belts', price: 4699, compareAtPrice: 5999, rating: 4.7, reviews: 41, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/western-buckle-belt.png' },
      { id: 'ul-19', name: 'Canvas & Leather Contrast Tote', category: 'Bags', price: 7499, compareAtPrice: 9500, rating: 4.8, reviews: 116, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'ul-20', name: 'Silver Buckle Dress Belt', category: 'Belts', price: 3899, compareAtPrice: 4899, rating: 4.5, reviews: 38, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/silver-buckle-belt.png' }
    ]
  },
  {
    id: 'store_austin_leather',
    slug: 'austin-leather-co',
    name: 'Austin Leather Co',
    monogram: 'AL',
    monogramColor: 'linear-gradient(135deg, #7DBA35, #5A9022)',
    textColor: '#FFFFFF',
    category: 'Leather & Saddlery',
    categoryKey: 'leather',
    location: 'Austin, TX · USA',
    rating: 4.9,
    reviewsCount: 188,
    productsCount: 48,
    followers: 2900,
    verified: true,
    badge: 'Top Rated 2026',
    banner: 'assets/banners/promo-leather.png',
    tagline: 'Master leather crafters based in Texas. Hand-finished vegetable-tanned belts and wallets.',
    shippingSpeed: '1-2 days',
    responseRate: '99%',
    categories: ['Belts', 'Wallets', 'Bags', 'Accessories'],
    featuredProducts: [
      { id: 'al-1', name: 'Distressed Belt', price: '$44.99', image: 'assets/products/distressed-leather-belt.png' },
      { id: 'al-2', name: 'Classic Belt', price: '$39.99', image: 'assets/products/classic-stitched-belt.png' },
      { id: 'al-7', name: 'Bifold Wallet', price: '$34.99', image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'al-9', name: 'Travel Duffle', price: '$149.99', image: 'assets/products/luxury-leather-duffle.png' }
    ],
    products: [
      { id: 'al-1', name: 'Vintage Distressed Leather Belt', category: 'Belts', price: 4499, compareAtPrice: 5999, rating: 4.9, reviews: 88, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/distressed-leather-belt.png' },
      { id: 'al-2', name: 'Classic Vegetable-Tanned Belt', category: 'Belts', price: 3999, compareAtPrice: 5499, rating: 4.8, reviews: 64, badge: 'TOP', badgeType: 'popular', inStock: true, image: 'assets/products/classic-stitched-belt.png' },
      { id: 'al-3', name: 'Braided Artisan Leather Belt', category: 'Belts', price: 3699, compareAtPrice: 4899, rating: 4.8, reviews: 52, badge: '-24%', badgeType: 'discount', inStock: true, image: 'assets/products/braided-leather-belt.png' },
      { id: 'al-4', name: 'Western Hand-Tooled Belt', category: 'Belts', price: 4899, compareAtPrice: 6200, rating: 4.9, reviews: 46, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/western-buckle-belt.png' },
      { id: 'al-5', name: 'Silver Buckle Dress Belt', category: 'Belts', price: 4599, compareAtPrice: 5800, rating: 4.7, reviews: 39, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/silver-buckle-belt.png' },
      { id: 'al-6', name: 'Vintage Brown Harness Belt', category: 'Belts', price: 4299, compareAtPrice: 5500, rating: 4.8, reviews: 41, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/vintage-brown-belt.png' },
      { id: 'al-7', name: 'Heritage Full-Grain Bifold Wallet', category: 'Wallets', price: 3499, compareAtPrice: 4500, rating: 4.9, reviews: 92, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'al-8', name: 'Minimalist Artisan Card Sleeve', category: 'Wallets', price: 2499, compareAtPrice: 3299, rating: 4.7, reviews: 48, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-cardholder.jpg' },
      { id: 'al-9', name: 'Texas Range Leather Duffle', category: 'Bags', price: 14999, compareAtPrice: 18999, rating: 4.9, reviews: 36, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'al-10', name: 'Rancher Brass Key Fob', category: 'Accessories', price: 1999, compareAtPrice: 2499, rating: 4.8, reviews: 58, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-keychain.jpg' },
      { id: 'al-11', name: 'Artisan Field Notebook Cover', category: 'Accessories', price: 3999, compareAtPrice: 4999, rating: 4.8, reviews: 31, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-notebook.jpg' },
      { id: 'al-12', name: 'Heavy Utility Leather Crossbody', category: 'Bags', price: 7999, compareAtPrice: 9999, rating: 4.8, reviews: 44, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/leather-crossbody-bag.png' }
    ]
  },
  {
    id: 'store_pacific_coastal',
    slug: 'pacific-coastal-living',
    name: 'Pacific Coastal Living',
    monogram: 'PC',
    monogramColor: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
    textColor: '#FFFFFF',
    category: 'Apparel & Living',
    categoryKey: 'apparel',
    location: 'San Diego, CA · USA',
    rating: 4.8,
    reviewsCount: 164,
    productsCount: 60,
    followers: 4100,
    verified: true,
    badge: 'Sustainable Brand',
    banner: 'assets/banners/promo-clothes.png',
    tagline: 'Sustainable organic cottons, breathable linens, and effortless West Coast silhouettes.',
    shippingSpeed: '1-2 days',
    responseRate: '97%',
    categories: ['Hoodies & Sweats', 'Pants & Bottoms', 'Dresses', 'Polos & Tees', 'Totes & Bags'],
    featuredProducts: [
      { id: 'pc-1', name: 'Fleece Hoodie', price: '$64.99', image: 'assets/products/brown-warm-hoodie.png' },
      { id: 'pc-2', name: 'Cargo Trousers', price: '$59.99', image: 'assets/products/beige-cargo-trousers.png' },
      { id: 'pc-3', name: 'Linen Maxi Dress', price: '$69.99', image: 'assets/products/floral-summer-dress.png' },
      { id: 'pc-4', name: 'Pique Polo', price: '$39.99', image: 'assets/products/brown-polo-shirt.png' }
    ],
    products: [
      { id: 'pc-1', name: 'Organic Warm Fleece Hoodie', category: 'Hoodies & Sweats', price: 6499, compareAtPrice: 8499, rating: 4.9, reviews: 76, badge: 'TOP', badgeType: 'popular', inStock: true, image: 'assets/products/brown-warm-hoodie.png' },
      { id: 'pc-2', name: 'Relaxed Linen Cargo Trousers', category: 'Pants & Bottoms', price: 5999, compareAtPrice: 7999, rating: 4.8, reviews: 54, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/beige-cargo-trousers.png' },
      { id: 'pc-3', name: 'Breeze Floral Summer Maxi Dress', category: 'Dresses', price: 6999, compareAtPrice: 8999, rating: 4.9, reviews: 68, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/floral-summer-dress.png' },
      { id: 'pc-4', name: 'Classic Organic Pique Polo Shirt', category: 'Polos & Tees', price: 3999, compareAtPrice: 5499, rating: 4.7, reviews: 49, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/brown-polo-shirt.png' },
      { id: 'pc-5', name: "Men's Premium Black Cotton Tee", category: 'Polos & Tees', price: 3499, compareAtPrice: 4500, rating: 4.8, reviews: 82, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/mens-black-tee.png' },
      { id: 'pc-6', name: 'Coastal Contrast Beach Tote', category: 'Totes & Bags', price: 4999, compareAtPrice: 6500, rating: 4.8, reviews: 38, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'pc-7', name: 'Emerald Weekend Daypack Satchel', category: 'Totes & Bags', price: 6899, compareAtPrice: 8500, rating: 4.7, reviews: 31, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/teal-mini-satchel.png' },
      { id: 'pc-8', name: 'Navy Coastal Shoulder Bag', category: 'Totes & Bags', price: 8499, compareAtPrice: 11000, rating: 4.8, reviews: 42, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/navy-crossbody-bag.png' },
      { id: 'pc-9', name: 'Casual Desert Cargo Pants', category: 'Pants & Bottoms', price: 5499, compareAtPrice: 7200, rating: 4.6, reviews: 29, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/beige-cargo-trousers.png' },
      { id: 'pc-10', name: 'Sunset Heavyweight Cotton Hoodie', category: 'Hoodies & Sweats', price: 6899, compareAtPrice: 8999, rating: 4.8, reviews: 51, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/brown-warm-hoodie.png' }
    ]
  },
  {
    id: 'store_portland_artisan',
    slug: 'portland-artisan-goods',
    name: 'Portland Artisan Goods',
    monogram: 'PA',
    monogramColor: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    textColor: '#FFFFFF',
    category: 'Tech & Desk Gear',
    categoryKey: 'tech',
    location: 'Portland, OR · USA',
    rating: 4.7,
    reviewsCount: 142,
    productsCount: 35,
    followers: 2200,
    verified: true,
    badge: 'Artisan Workshop',
    banner: 'assets/banners/promo-electronics.png',
    tagline: 'Small-batch precision tech, minimalist desk accessories, and modern smart equipment.',
    shippingSpeed: '1-2 days',
    responseRate: '98%',
    categories: ['Wearables', 'Audio', 'Bags & Sleeves'],
    featuredProducts: [
      { id: 'pa-1', name: 'Golden Smartwatch', price: '$119.99', image: 'assets/products/golden-smartwatch.png' },
      { id: 'pa-2', name: 'Sport Smartwatch', price: '$99.99', image: 'assets/products/black-sport-smartwatch.png' },
      { id: 'pa-3', name: 'Canvas Contrast Tote', price: '$49.99', image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'pa-4', name: 'Emerald Carry Bag', price: '$74.99', image: 'assets/products/emerald-shoulder-bag.png' }
    ],
    products: [
      { id: 'pa-1', name: 'Golden Smartwatch Edition', category: 'Wearables', price: 11999, compareAtPrice: 14999, rating: 4.8, reviews: 54, badge: 'TOP', badgeType: 'popular', inStock: true, image: 'assets/products/golden-smartwatch.png' },
      { id: 'pa-2', name: 'Sport GPS Matte Smartwatch', category: 'Wearables', price: 9999, compareAtPrice: 12999, rating: 4.7, reviews: 42, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/black-sport-smartwatch.png' },
      { id: 'pa-3', name: 'Silver Minimalist Mechanical Watch', category: 'Wearables', price: 13999, compareAtPrice: 17999, rating: 4.9, reviews: 38, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/silver-elegance-watch.png' },
      { id: 'pa-4', name: 'TWS Studio Wireless Buds', category: 'Audio', price: 6999, compareAtPrice: 8999, rating: 4.6, reviews: 63, badge: '-22%', badgeType: 'discount', inStock: true, image: 'assets/products/tws-wireless-earbuds.png' },
      { id: 'pa-5', name: 'Emerald Shoulder Tech Carry Bag', category: 'Bags & Sleeves', price: 7499, compareAtPrice: 9500, rating: 4.8, reviews: 36, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/emerald-shoulder-bag.png' },
      { id: 'pa-6', name: 'Canvas Contrast Tech Organizer Tote', category: 'Bags & Sleeves', price: 4999, compareAtPrice: 6500, rating: 4.7, reviews: 29, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'pa-7', name: 'Teal Mini Satchel Sleeve', category: 'Bags & Sleeves', price: 5899, compareAtPrice: 7500, rating: 4.6, reviews: 24, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/teal-mini-satchel.png' },
      { id: 'pa-8', name: 'Square Pulse Fitness Watch', category: 'Wearables', price: 8999, compareAtPrice: 11999, rating: 4.7, reviews: 31, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/square-fitness-watch.png' }
    ]
  },
  {
    id: 'store_denver_watch',
    slug: 'denver-watch-studio',
    name: 'Denver Watch Studio',
    monogram: 'DW',
    monogramColor: 'linear-gradient(135deg, #D97706, #B45309)',
    textColor: '#FFFFFF',
    category: 'Horology & Watches',
    categoryKey: 'tech',
    location: 'Denver, CO · USA',
    rating: 4.9,
    reviewsCount: 256,
    productsCount: 28,
    followers: 5200,
    verified: true,
    badge: 'Precision Horology',
    banner: 'assets/banners/hero-smart-tech.png',
    tagline: 'Custom automatic timepieces, sapphire crystal engineering, and artisan Horween leather straps.',
    shippingSpeed: '1-2 days',
    responseRate: '100%',
    categories: ['Timepieces', 'Smartwatches', 'Straps & Bands', 'Audio'],
    featuredProducts: [
      { id: 'dw-1', name: 'Chrono Edition', price: '$189.99', image: 'assets/products/golden-smartwatch.png' },
      { id: 'dw-2', name: 'Titanium Sport', price: '$149.99', image: 'assets/products/black-sport-smartwatch.png' },
      { id: 'dw-3', name: 'Horween Strap', price: '$45.00', image: 'assets/products/classic-stitched-belt.png' },
      { id: 'dw-4', name: 'Vintage Pilot', price: '$48.00', image: 'assets/products/distressed-leather-belt.png' }
    ],
    products: [
      { id: 'dw-1', name: 'Chrono Edition Automatic Timepiece', category: 'Timepieces', price: 18999, compareAtPrice: 24999, rating: 4.9, reviews: 88, badge: 'FLAGSHIP', badgeType: 'popular', inStock: true, image: 'assets/products/golden-smartwatch.png' },
      { id: 'dw-2', name: 'Titanium Sport Touch Smartwatch', category: 'Smartwatches', price: 14999, compareAtPrice: 19999, rating: 4.8, reviews: 62, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/black-sport-smartwatch.png' },
      { id: 'dw-3', name: 'Silver Elegance Sapphire Watch', category: 'Timepieces', price: 16999, compareAtPrice: 21999, rating: 4.9, reviews: 54, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/silver-elegance-watch.png' },
      { id: 'dw-4', name: 'Square Pulse Fitness Smartwatch', category: 'Smartwatches', price: 11999, compareAtPrice: 15999, rating: 4.7, reviews: 41, badge: '-25%', badgeType: 'discount', inStock: true, image: 'assets/products/square-fitness-watch.png' },
      { id: 'dw-5', name: 'TWS Hi-Fi Studio Earbuds', category: 'Audio', price: 7999, compareAtPrice: 9999, rating: 4.8, reviews: 36, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/tws-wireless-earbuds.png' },
      { id: 'dw-6', name: 'Horween Vegetable-Tanned Watch Strap', category: 'Straps & Bands', price: 4500, compareAtPrice: 5500, rating: 4.9, reviews: 49, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/classic-stitched-belt.png' },
      { id: 'dw-7', name: 'Vintage Pilot Distressed Leather Strap', category: 'Straps & Bands', price: 4800, compareAtPrice: 6000, rating: 4.8, reviews: 34, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/distressed-leather-belt.png' },
      { id: 'dw-8', name: 'Braided Artisan Leather Watch Band', category: 'Straps & Bands', price: 3800, compareAtPrice: 4800, rating: 4.7, reviews: 29, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/braided-leather-belt.png' },
      { id: 'dw-9', name: 'Western Hand-Tooled Watch Strap', category: 'Straps & Bands', price: 5200, compareAtPrice: 6500, rating: 4.8, reviews: 22, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/western-buckle-belt.png' },
      { id: 'dw-10', name: 'Silver Buckle Dress Watch Band', category: 'Straps & Bands', price: 4200, compareAtPrice: 5200, rating: 4.7, reviews: 27, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/silver-buckle-belt.png' }
    ]
  },
  {
    id: 'store_seattle_outdoor',
    slug: 'seattle-outdoor',
    name: 'Seattle Outdoor Gear',
    monogram: 'SO',
    monogramColor: 'linear-gradient(135deg, #059669, #047857)',
    textColor: '#FFFFFF',
    category: 'Outdoor & Travel',
    categoryKey: 'outdoor',
    location: 'Seattle, WA · USA',
    rating: 4.8,
    reviewsCount: 198,
    productsCount: 52,
    followers: 3700,
    verified: true,
    badge: 'Weather-Proof Gear',
    banner: 'assets/banners/banner-everyday-style.png',
    tagline: 'Pacific Northwest heavy-duty canvas bags, weather-proof carry solutions, and field apparel.',
    shippingSpeed: '1-2 days',
    responseRate: '98%',
    categories: ['Bags & Packs', 'Field Apparel', 'Hardware & Belts', 'Field Tech'],
    featuredProducts: [
      { id: 'so-1', name: 'Rugged Camp Tote', price: '$54.99', image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'so-2', name: 'Expedition Duffle', price: '$169.99', image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'so-3', name: 'Ripstop Field Pants', price: '$69.99', image: 'assets/products/beige-cargo-trousers.png' },
      { id: 'so-4', name: 'Merino Wool Tee', price: '$34.99', image: 'assets/products/mens-black-tee.png' }
    ],
    products: [
      { id: 'so-1', name: 'Rugged Waxed Canvas Camp Tote', category: 'Bags & Packs', price: 5499, compareAtPrice: 7500, rating: 4.9, reviews: 68, badge: 'TOP', badgeType: 'popular', inStock: true, image: 'assets/products/canvas-contrast-tote.png' },
      { id: 'so-2', name: 'Expedition Heavy Leather Travel Duffle', category: 'Bags & Packs', price: 16999, compareAtPrice: 21000, rating: 4.9, reviews: 52, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'so-3', name: 'Ripstop Tactical Field Cargo Pants', category: 'Field Apparel', price: 6999, compareAtPrice: 8999, rating: 4.8, reviews: 47, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/beige-cargo-trousers.png' },
      { id: 'so-4', name: 'All-Weather Merino Wool Field Tee', category: 'Field Apparel', price: 3499, compareAtPrice: 4500, rating: 4.7, reviews: 74, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/mens-black-tee.png' },
      { id: 'so-5', name: 'Heavy Duty Outdoor Field Belt', category: 'Hardware & Belts', price: 4899, compareAtPrice: 6000, rating: 4.8, reviews: 39, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/distressed-leather-belt.png' },
      { id: 'so-6', name: 'Tactical Sport GPS Smartwatch', category: 'Field Tech', price: 12999, compareAtPrice: 16999, rating: 4.8, reviews: 41, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/black-sport-smartwatch.png' },
      { id: 'so-7', name: 'Navy Storm-Proof Crossbody Bag', category: 'Bags & Packs', price: 8499, compareAtPrice: 11000, rating: 4.7, reviews: 33, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/navy-crossbody-bag.png' },
      { id: 'so-8', name: 'Thermal Mountain Fleece Hoodie', category: 'Field Apparel', price: 6499, compareAtPrice: 8499, rating: 4.9, reviews: 58, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/brown-warm-hoodie.png' }
    ]
  },
  {
    id: 'store_ameza_official',
    slug: 'ameza-official',
    name: 'AMEZA Official Store',
    monogram: 'AM',
    monogramColor: 'linear-gradient(135deg, #7DBA35, #4D8714)',
    textColor: '#FFFFFF',
    category: 'Marketplace Flagship',
    categoryKey: 'apparel',
    location: 'Austin, TX · USA',
    rating: 4.9,
    reviewsCount: 3420,
    productsCount: 120,
    followers: 18500,
    verified: true,
    badge: 'Verified Flagship',
    banner: 'assets/banners/promo-elevates.png',
    tagline: 'Direct marketplace flagship. Hand-inspected quality, rapid dispatch, and 30-day guarantee.',
    shippingSpeed: 'Same day',
    responseRate: '100%',
    categories: ['Bags & Luggage', 'Smart Tech', 'Apparel', 'Accessories'],
    featuredProducts: [
      { id: 'am-1', name: 'Signature Duffle', price: '$129.99', image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'am-2', name: 'Flagship Smartwatch', price: '$89.99', image: 'assets/products/golden-smartwatch.png' },
      { id: 'am-3', name: 'Signature Hoodie', price: '$49.99', image: 'assets/products/brown-warm-hoodie.png' },
      { id: 'am-4', name: 'Bifold Wallet', price: '$29.99', image: 'assets/products/bifold-leather-wallet.png' }
    ],
    products: [
      { id: 'am-1', name: 'Signature Luxury Travel Duffle', category: 'Bags & Luggage', price: 12999, compareAtPrice: 16999, rating: 4.9, reviews: 245, badge: 'FLAGSHIP', badgeType: 'popular', inStock: true, image: 'assets/products/luxury-leather-duffle.png' },
      { id: 'am-2', name: 'AMEZA Elite Gold Smartwatch', category: 'Smart Tech', price: 8999, compareAtPrice: 12999, rating: 4.8, reviews: 182, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/golden-smartwatch.png' },
      { id: 'am-3', name: 'Square Touch Fitness Tracker', category: 'Smart Tech', price: 7999, compareAtPrice: 9999, rating: 4.7, reviews: 114, badge: '-20%', badgeType: 'discount', inStock: true, image: 'assets/products/square-fitness-watch.png' },
      { id: 'am-4', name: 'Signature Cozy Fleece Hoodie', category: 'Apparel', price: 4999, compareAtPrice: 6999, rating: 4.9, reviews: 310, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/brown-warm-hoodie.png' },
      { id: 'am-5', name: 'Classic Tailored Pique Polo', category: 'Apparel', price: 3499, compareAtPrice: 4999, rating: 4.8, reviews: 98, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/brown-polo-shirt.png' },
      { id: 'am-6', name: 'Full-Grain Bifold Leather Wallet', category: 'Accessories', price: 2999, compareAtPrice: 4200, rating: 4.9, reviews: 215, badge: 'BESTSELLER', badgeType: 'popular', inStock: true, image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'am-7', name: 'Classic Saddle Stitched Belt', category: 'Accessories', price: 3499, compareAtPrice: 4500, rating: 4.7, reviews: 88, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/classic-stitched-belt.png' },
      { id: 'am-8', name: 'Navy Everyday Crossbody Carry Bag', category: 'Bags & Luggage', price: 6499, compareAtPrice: 8500, rating: 4.8, reviews: 76, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/navy-crossbody-bag.png' }
    ]
  },
  {
    id: 'store_blue_ridge',
    slug: 'blue-ridge-leather',
    name: 'Blue Ridge Leatherworks',
    monogram: 'BR',
    monogramColor: 'linear-gradient(135deg, #854D0E, #713F12)',
    textColor: '#FFFFFF',
    category: 'Handcrafted Leather',
    categoryKey: 'leather',
    location: 'Asheville, NC · USA',
    rating: 4.9,
    reviewsCount: 134,
    productsCount: 38,
    followers: 2400,
    verified: true,
    badge: 'Heritage Workshop',
    banner: 'assets/store-banner.jpg',
    tagline: 'Heritage Appalachian leather crafting. Hand-burnished edges, heavy thread, and solid brass.',
    shippingSpeed: '1-2 days',
    responseRate: '99%',
    categories: ['Bags', 'Belts', 'Wallets', 'Accessories'],
    featuredProducts: [
      { id: 'br-1', name: 'Saddle Crossbody', price: '$89.99', image: 'assets/products/leather-crossbody-bag.png' },
      { id: 'br-2', name: 'Mountain Belt', price: '$39.99', image: 'assets/products/braided-leather-belt.png' },
      { id: 'br-3', name: 'Minimalist Bifold', price: '$29.99', image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'br-4', name: 'Heavy Work Belt', price: '$48.99', image: 'assets/products/distressed-leather-belt.png' }
    ],
    products: [
      { id: 'br-1', name: 'Saddle Tan Leather Crossbody Bag', category: 'Bags', price: 8999, compareAtPrice: 11999, rating: 4.9, reviews: 48, badge: 'TOP', badgeType: 'popular', inStock: true, image: 'assets/products/leather-crossbody-bag.png' },
      { id: 'br-2', name: 'Mountain Braided Leather Belt', category: 'Belts', price: 3999, compareAtPrice: 5500, rating: 4.8, reviews: 36, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/braided-leather-belt.png' },
      { id: 'br-3', name: 'Distressed Heavy Duty Work Belt', category: 'Belts', price: 4899, compareAtPrice: 6500, rating: 4.9, reviews: 42, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/distressed-leather-belt.png' },
      { id: 'br-4', name: 'Appalachian Minimalist Bifold Wallet', category: 'Wallets', price: 2999, compareAtPrice: 4000, rating: 4.8, reviews: 54, badge: 'HOT', badgeType: 'popular', inStock: true, image: 'assets/products/bifold-leather-wallet.png' },
      { id: 'br-5', name: 'Classic Vegetable-Tanned Harness Belt', category: 'Belts', price: 3699, compareAtPrice: 4800, rating: 4.7, reviews: 29, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/classic-stitched-belt.png' },
      { id: 'br-6', name: 'Handmade Leather Journal Cover', category: 'Accessories', price: 3999, compareAtPrice: 4999, rating: 4.9, reviews: 33, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/ul-notebook.jpg' },
      { id: 'br-7', name: 'Western Antique Brass Buckle Belt', category: 'Belts', price: 4699, compareAtPrice: 5999, rating: 4.8, reviews: 26, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/western-buckle-belt.png' },
      { id: 'br-8', name: 'Teal Mountain Satchel Bag', category: 'Bags', price: 6899, compareAtPrice: 8500, rating: 4.7, reviews: 21, badge: 'NEW', badgeType: 'new', inStock: true, image: 'assets/products/teal-mini-satchel.png' }
    ]
  }
];

export function getStoreBySlug(slug) {
  if (!slug) return STORES_LIST[0];
  const cleaned = slug.toLowerCase().trim();
  return STORES_LIST.find(s => s.slug === cleaned || s.id === cleaned) || STORES_LIST[0];
}

export function getAllStoreProducts() {
  const all = [];
  STORES_LIST.forEach(s => {
    if (Array.isArray(s.products)) {
      all.push(...s.products);
    }
  });
  return all;
}
