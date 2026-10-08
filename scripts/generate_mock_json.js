/**
 * AMEZA Mock JSON Generator — scripts/generate_mock_json.js
 * Generates realistic, fully consistent USA mock data files into /mock/*.json:
 * - 4 approved sellers + 1 pending seller (US locations, EIN/SSN, W-9, ACH)
 * - 51 products with integer cents prices (priceCents, compareAtPriceCents)
 * - 30 registered US customers (US addresses, @example.com emails, (555) 010-0xxx phones)
 * - 65 orders in USD (ORD-10001 style, USPS/UPS/FedEx, state sales tax)
 * - Reviews with verified tags and seller replies
 * - Returns & refund dispute cases in USD
 * - Payout requests in USD
 * - US promotional coupons (SAVE10, FREESHIP, SPRING20, etc.)
 * - System & merchant notifications
 * - Buyer-seller message threads
 * - Category tree
 * - Commission rules
 * - Append-only double-entry ledger entries in cents
 * - Platform audit log
 * - Staff roles & RBAC matrix
 */

const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, '../mock');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

// Load tax rates
let taxRates = {};
try {
  taxRates = JSON.parse(fs.readFileSync(path.join(mockDir, 'tax_rates.json'), 'utf8'));
} catch (e) {
  taxRates = { TX: 0.0625, CA: 0.0725, NY: 0.04, FL: 0.06, WA: 0.065, IL: 0.0625, OR: 0.00 };
}

// ─── US Locations (16 Valid Pairs) ──────────────────────────────────────────
const US_LOCATIONS = [
  { city: "Austin", state: "TX", zip: "78701", street: "100 Congress Avenue" },
  { city: "New York", state: "NY", zip: "10001", street: "350 5th Avenue" },
  { city: "Los Angeles", state: "CA", zip: "90012", street: "200 N Spring Street" },
  { city: "Chicago", state: "IL", zip: "60601", street: "100 N Michigan Avenue" },
  { city: "Seattle", state: "WA", zip: "98101", street: "400 Pine Street" },
  { city: "Miami", state: "FL", zip: "33101", street: "100 Biscayne Boulevard" },
  { city: "Denver", state: "CO", zip: "80202", street: "1600 17th Street" },
  { city: "Boston", state: "MA", zip: "02108", street: "100 Beacon Street" },
  { city: "Atlanta", state: "GA", zip: "30303", street: "200 Peachtree Street" },
  { city: "Portland", state: "OR", zip: "97201", street: "500 SW 5th Avenue" },
  { city: "Phoenix", state: "AZ", zip: "85004", street: "100 E Washington Street" },
  { city: "San Diego", state: "CA", zip: "92101", street: "300 Broadway" },
  { city: "Nashville", state: "TN", zip: "37203", street: "1100 Broadway" },
  { city: "Dallas", state: "TX", zip: "75201", street: "1700 Pacific Avenue" },
  { city: "Minneapolis", state: "MN", font: "MN", zip: "55401", street: "100 Washington Avenue N" },
  { city: "Philadelphia", state: "PA", zip: "19103", street: "1500 Market Street" }
];

function createSvgDataUri(gradientStart, gradientEnd, emoji, label) {
  const safeLabel = encodeURIComponent(label || '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}"/>
        <stop offset="100%" stop-color="${gradientEnd}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="16" fill="url(#g)"/>
    <circle cx="200" cy="180" r="88" fill="rgba(255,255,255,0.22)"/>
    <text x="200" y="200" font-family="'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" font-size="76" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    <text x="200" y="320" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="20" fill="rgba(255,255,255,0.92)" text-anchor="middle">${safeLabel}</text>
  </svg>`.replace(/\s+/g, ' ').trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ─── 1. Sellers (4 active + 1 pending) ─────────────────────────────────────
const SELLERS = [
  {
    id: "seller_house_001",
    storeName: "AMEZA Official",
    slug: "ameza-official",
    ownerName: "Alexander Vance",
    email: "official@example.com",
    phone: "5550100100",
    phoneFormatted: "(555) 010-0100",
    taxIdType: "EIN",
    einLast4: "1001",
    taxIdMasked: "**-***1001",
    w9Status: "verified",
    status: "approved",
    isTrusted: true,
    ratingAvg: 4.95,
    ratingCount: 142,
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    commissionRatePct: 0.0,
    logo: createSvgDataUri("#7FB73C", "#5B8828", "🏛️", "AMEZA Official"),
    banner: createSvgDataUri("#111827", "#1F2937", "✨", "Flagship Store"),
    description: "Official AMEZA U.S. Flagship Store. Premium certified essentials dispatched across the United States.",
    bankDetails: {
      accountName: "AMEZA Marketplace Inc",
      routingNumber: "021000021",
      accountNumber: "••••9900",
      bankName: "JPMorgan Chase"
    },
    metrics: { totalSalesCents: 12450000, ordersCount: 420, activeProducts: 16 }
  },
  {
    id: "seller_melb_123",
    storeName: "Austin Leather Co",
    slug: "austin-leather-co",
    ownerName: "Jack Callahan",
    email: "jack.callahan@example.com",
    phone: "5550100123",
    phoneFormatted: "(555) 010-0123",
    taxIdType: "EIN",
    einLast4: "4892",
    taxIdMasked: "**-***4892",
    w9Status: "verified",
    status: "approved",
    isTrusted: true,
    ratingAvg: 4.88,
    ratingCount: 88,
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    commissionRatePct: 10.0,
    logo: createSvgDataUri("#854D0E", "#713F12", "👜", "Austin Leather"),
    banner: createSvgDataUri("#451A03", "#78350F", "🐂", "Austin Workshop"),
    description: "Master leather crafters based in Austin, Texas. Hand-stitched full-grain American bovine leather goods.",
    bankDetails: {
      accountName: "Austin Leather Co LLC",
      routingNumber: "121000358",
      accountNumber: "••••4892",
      bankName: "Bank of America"
    },
    metrics: { totalSalesCents: 4892000, ordersCount: 184, activeProducts: 14 }
  },
  {
    id: "seller_syd_456",
    storeName: "Pacific Coastal Living",
    slug: "pacific-coastal-living",
    ownerName: "Emma Ross",
    email: "emma.ross@example.com",
    phone: "5550100456",
    phoneFormatted: "(555) 010-0456",
    taxIdType: "SSN",
    einLast4: "7120",
    taxIdMasked: "***-**-7120",
    w9Status: "verified",
    status: "approved",
    isTrusted: true,
    ratingAvg: 4.81,
    ratingCount: 64,
    city: "San Diego",
    state: "CA",
    zip: "92101",
    country: "United States",
    commissionRatePct: 10.0,
    logo: createSvgDataUri("#0284C7", "#0369A1", "🌊", "Coastal Living"),
    banner: createSvgDataUri("#0C4A6E", "#075985", "🏖️", "Pacific Studio"),
    description: "Sustainable linen apparel and contemporary coastal home essentials inspired by the West Coast.",
    bankDetails: {
      accountName: "Pacific Coastal Living LLC",
      routingNumber: "021000021",
      accountNumber: "••••7120",
      bankName: "Wells Fargo"
    },
    metrics: { totalSalesCents: 3410000, ordersCount: 142, activeProducts: 12 }
  },
  {
    id: "seller_bris_789",
    storeName: "Portland Artisan Goods",
    slug: "portland-artisan-goods",
    ownerName: "Liam Chen",
    email: "liam.chen@example.com",
    phone: "5550100789",
    phoneFormatted: "(555) 010-0789",
    taxIdType: "EIN",
    einLast4: "3319",
    taxIdMasked: "**-***3319",
    w9Status: "verified",
    status: "approved",
    isTrusted: false,
    ratingAvg: 4.70,
    ratingCount: 42,
    city: "Portland",
    state: "OR",
    zip: "97201",
    country: "United States",
    commissionRatePct: 12.0,
    logo: createSvgDataUri("#D97706", "#B45309", "⌚", "Portland Artisan"),
    banner: createSvgDataUri("#78350F", "#92400E", "⚙️", "Precision Studio"),
    description: "Small-batch specialty electronics, handcrafted desk gear, and precision horology accessories.",
    bankDetails: {
      accountName: "Chen Artisan Holdings LLC",
      routingNumber: "121000358",
      accountNumber: "••••3319",
      bankName: "U.S. Bank"
    },
    metrics: { totalSalesCents: 2198000, ordersCount: 96, activeProducts: 9 }
  },
  {
    id: "seller_perth_eco",
    storeName: "Seattle Eco Essentials",
    slug: "seattle-eco-essentials",
    ownerName: "Zoe Henderson",
    email: "zoe.henderson@example.com",
    phone: "5550100488",
    phoneFormatted: "(555) 010-0488",
    taxIdType: "SSN",
    einLast4: "2311",
    taxIdMasked: "***-**-2311",
    w9Status: "pending",
    status: "under_review",
    isTrusted: false,
    ratingAvg: 0.0,
    ratingCount: 0,
    city: "Seattle",
    state: "WA",
    zip: "98101",
    country: "United States",
    commissionRatePct: 10.0,
    logo: createSvgDataUri("#059669", "#047857", "🌿", "Seattle Eco"),
    banner: createSvgDataUri("#064E3B", "#065F46", "🌱", "Zero Waste Workshop"),
    description: "100% compostable packaging and sustainable natural fiber essentials.",
    bankDetails: {
      accountName: "Seattle Eco Essentials LLC",
      routingNumber: "021000021",
      accountNumber: "••••2311",
      bankName: "Chase"
    },
    metrics: { totalSalesCents: 0, ordersCount: 0, activeProducts: 0 }
  }
];

// ─── 2. Categories ─────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "clothing",
    name: "Clothing & Fashion",
    slug: "clothing",
    emoji: "👗",
    itemCount: 16,
    subcategories: [
      { id: "mens-clothing", name: "Men's Apparel", slug: "mens-clothing" },
      { id: "womens-clothing", name: "Women's Apparel", slug: "womens-clothing" },
      { id: "linen-collection", name: "Linen & Casuals", slug: "linen-collection" }
    ]
  },
  {
    id: "leather-goods",
    name: "Leather Belts & Wallets",
    slug: "leather-goods",
    emoji: "👜",
    itemCount: 14,
    subcategories: [
      { id: "belts", name: "Full Grain Belts", slug: "belts" },
      { id: "wallets", name: "Slim Wallets & Cardholders", slug: "wallets" },
      { id: "leather-bags", name: "Weekender Bags & Totes", slug: "leather-bags" }
    ]
  },
  {
    id: "electronics",
    name: "Smart Electronics",
    slug: "electronics",
    emoji: "🎧",
    itemCount: 12,
    subcategories: [
      { id: "audio", name: "Wireless Audio & Earbuds", slug: "audio" },
      { id: "accessories", name: "MagSafe & Fast Chargers", slug: "accessories" },
      { id: "smart-home", name: "Connected Home Hubs", slug: "smart-home" }
    ]
  },
  {
    id: "watches",
    name: "Horology & Watches",
    slug: "watches",
    emoji: "⌚",
    itemCount: 9,
    subcategories: [
      { id: "automatic-watches", name: "Automatic Mechanical", slug: "automatic-watches" },
      { id: "chronographs", name: "Chronographs", slug: "chronographs" },
      { id: "minimalist-watches", name: "Minimalist Quartz", slug: "minimalist-watches" }
    ]
  }
];

// ─── 3. Products (48 catalog items with realistic USD cents prices) ───────
const PRODUCT_TEMPLATES = [
  // Austin Leather Co (14 items) - Belts $24.99-$69.99, Wallets $19.99-$89.99, Bags $49.99-$249.99
  { name: "Classic Saddle Leather Belt", cat: "leather-goods", sellerIdx: 1, priceCents: 5999, compareAtCents: 7999, emoji: "🪵", grad: ["#854D0E", "#713F12"] },
  { name: "Full-Grain Slim Wallet", cat: "leather-goods", sellerIdx: 1, priceCents: 4999, compareAtCents: 6999, emoji: "👛", grad: ["#78350F", "#451A03"] },
  { name: "Heritage Leather Duffle Bag", cat: "leather-goods", sellerIdx: 1, priceCents: 22999, compareAtCents: 27999, emoji: "🧳", grad: ["#592808", "#381704"] },
  { name: "Minimalist Leather Cardholder", cat: "leather-goods", sellerIdx: 1, priceCents: 2999, compareAtCents: 3999, emoji: "💳", grad: ["#A16207", "#713F12"] },
  { name: "Solid Brass Buckle Dress Belt", cat: "leather-goods", sellerIdx: 1, priceCents: 6499, compareAtCents: 8499, emoji: "🎗️", grad: ["#92400E", "#6B2E05"] },
  { name: "Classic Leather Travel Dopp Kit", cat: "leather-goods", sellerIdx: 1, priceCents: 7999, compareAtCents: 9999, emoji: "👝", grad: ["#7C2D12", "#521B0A"] },
  { name: "Vintage Full-Grain Leather Backpack", cat: "leather-goods", sellerIdx: 1, priceCents: 19999, compareAtCents: 24999, emoji: "🎒", grad: ["#78350F", "#5C2607"] },
  { name: "Full-Grain Leather Bifold Wallet", cat: "leather-goods", sellerIdx: 1, priceCents: 5999, compareAtCents: 7499, emoji: "🪙", grad: ["#854D0E", "#5B330B"] },
  { name: "Braided Full-Grain Leather Belt", cat: "leather-goods", sellerIdx: 1, priceCents: 5499, compareAtCents: 6999, emoji: "🪢", grad: ["#9A3412", "#662208"] },
  { name: "Handmade Leather Journal Cover", cat: "leather-goods", sellerIdx: 1, priceCents: 4499, compareAtCents: 5999, emoji: "📔", grad: ["#854D0E", "#592E07"] },
  { name: "Suede Daily Tote Bag", cat: "leather-goods", sellerIdx: 1, priceCents: 14999, compareAtCents: 18999, emoji: "👜", grad: ["#92400E", "#662804"] },
  { name: "Full-Grain Leather Key Organizer", cat: "leather-goods", sellerIdx: 1, priceCents: 2499, compareAtCents: 3499, emoji: "🔑", grad: ["#78350F", "#4E2105"] },
  { name: "Full-Grain Leather Watch Strap", cat: "leather-goods", sellerIdx: 1, priceCents: 3999, compareAtCents: 4999, emoji: "⌚", grad: ["#854D0E", "#56300B"] },
  { name: "Executive Leather Desk Mat", cat: "leather-goods", sellerIdx: 1, priceCents: 6999, compareAtCents: 8999, emoji: "🖥️", grad: ["#713F12", "#472506"] },

  // Pacific Coastal Living (12 items) - Tops $19.99-$59.99, Bottoms $29.99-$79.99
  { name: "Relaxed Linen Shirt", cat: "clothing", sellerIdx: 2, priceCents: 4999, compareAtCents: 6499, emoji: "👕", grad: ["#0284C7", "#0369A1"] },
  { name: "Organic Cotton Chinos", cat: "clothing", sellerIdx: 2, priceCents: 5999, compareAtCents: 7999, emoji: "👖", grad: ["#0D9488", "#0F766E"] },
  { name: "Sunset Linen Overshirt", cat: "clothing", sellerIdx: 2, priceCents: 5499, compareAtCents: 6999, emoji: "🧥", grad: ["#0369A1", "#075985"] },
  { name: "Breathable Canvas Everyday Tote", cat: "clothing", sellerIdx: 2, priceCents: 4999, compareAtCents: 6499, emoji: "🛍️", grad: ["#0E7490", "#155E75"] },
  { name: "Washed Cotton Casual Shorts", cat: "clothing", sellerIdx: 2, priceCents: 3999, compareAtCents: 4999, emoji: "🩳", grad: ["#0284C7", "#0C4A6E"] },
  { name: "Striped Resort Cotton Polo", cat: "clothing", sellerIdx: 2, priceCents: 4499, compareAtCents: 5999, emoji: "🏖️", grad: ["#0284C7", "#075985"] },
  { name: "Lightweight Linen Knit Sweater", cat: "clothing", sellerIdx: 2, priceCents: 5999, compareAtCents: 7499, emoji: "🧶", grad: ["#0F766E", "#115E59"] },
  { name: "Organic Canvas Wide Brim Sun Hat", cat: "clothing", sellerIdx: 2, priceCents: 2999, compareAtCents: 3999, emoji: "👒", grad: ["#CA8A04", "#A16207"] },
  { name: "Classic Canvas Espadrilles", cat: "clothing", sellerIdx: 2, priceCents: 3999, compareAtCents: 4999, emoji: "👟", grad: ["#0369A1", "#075985"] },
  { name: "Heavyweight Linen Trousers", cat: "clothing", sellerIdx: 2, priceCents: 6999, compareAtCents: 8999, emoji: "👖", grad: ["#0284C7", "#0369A1"] },
  { name: "Ribbed Merino Wool Beanie", cat: "clothing", sellerIdx: 2, priceCents: 2499, compareAtCents: 3499, emoji: "🧢", grad: ["#0C4A6E", "#082F49"] },
  { name: "Summer Breeze Linen Dress", cat: "clothing", sellerIdx: 2, priceCents: 5999, compareAtCents: 7999, emoji: "👗", grad: ["#0369A1", "#0284C7"] },

  // Portland Artisan Goods (10 items) - Watches $29.99-$149.99, Audio $24.99-$129.99, Speakers $19.99-$79.99
  { name: "Precision Chronograph 41mm", cat: "watches", sellerIdx: 3, priceCents: 12999, compareAtCents: 16999, emoji: "⏱️", grad: ["#D97706", "#B45309"] },
  { name: "Studio Hi-Fi Wireless ANC Earbuds", cat: "electronics", sellerIdx: 3, priceCents: 8999, compareAtCents: 11999, emoji: "🎧", grad: ["#475569", "#334155"] },
  { name: "Magnetic Fast Wireless Charging Stand", cat: "electronics", sellerIdx: 3, priceCents: 3999, compareAtCents: 4999, emoji: "⚡", grad: ["#2563EB", "#1D4ED8"] },
  { name: "Oceanic Automatic Diver 200M", cat: "watches", sellerIdx: 3, priceCents: 14999, compareAtCents: 19999, emoji: "⌚", grad: ["#0284C7", "#0369A1"] },
  { name: "Anodized Aluminum Keyboard Stand", cat: "electronics", sellerIdx: 3, priceCents: 3499, compareAtCents: 4499, emoji: "⌨️", grad: ["#334155", "#1E293B"] },
  { name: "Dual-Driver Studio Monitor Headphones", cat: "electronics", sellerIdx: 3, priceCents: 11999, compareAtCents: 14999, emoji: "🎙️", grad: ["#0F172A", "#1E293B"] },
  { name: "Titanium Field Watch 38mm", cat: "watches", sellerIdx: 3, priceCents: 13999, compareAtCents: 17999, emoji: "🧭", grad: ["#64748B", "#475569"] },
  { name: "GaN 100W 4-Port Fast Desktop Hub", cat: "electronics", sellerIdx: 3, priceCents: 5999, compareAtCents: 7999, emoji: "🔌", grad: ["#3B82F6", "#1D4ED8"] },
  { name: "Acoustic Walnut Desk Speaker Pair", cat: "electronics", sellerIdx: 3, priceCents: 7999, compareAtCents: 9999, emoji: "🔊", grad: ["#854D0E", "#713F12"] },
  { name: "Heritage Skeleton Mechanical Watch", cat: "watches", sellerIdx: 3, priceCents: 14999, compareAtCents: 19999, emoji: "⚙️", grad: ["#B45309", "#78350F"] },

  // AMEZA Official (12 items)
  { name: "AMEZA Signature Cashmere Crewneck", cat: "clothing", sellerIdx: 0, priceCents: 5999, compareAtCents: 7999, emoji: "👕", grad: ["#7FB73C", "#5B8828"] },
  { name: "AMEZA Executive Carbon Briefcase", cat: "leather-goods", sellerIdx: 0, priceCents: 18999, compareAtCents: 23999, emoji: "💼", grad: ["#111827", "#1F2937"] },
  { name: "AMEZA Horizon GPS Multisport Watch", cat: "watches", sellerIdx: 0, priceCents: 14999, compareAtCents: 19999, emoji: "⌚", grad: ["#7FB73C", "#4D7C0F"] },
  { name: "AMEZA Voyager Waterproof Weekender", cat: "leather-goods", sellerIdx: 0, priceCents: 16999, compareAtCents: 21999, emoji: "🧳", grad: ["#374151", "#1F2937"] },
  { name: "AMEZA Noise-Shield Pro Over-Ear Headphones", cat: "electronics", sellerIdx: 0, priceCents: 12999, compareAtCents: 16999, emoji: "🎧", grad: ["#111827", "#374151"] },
  { name: "AMEZA Tailored Wool Blend Blazer", cat: "clothing", sellerIdx: 0, priceCents: 7999, compareAtCents: 9999, emoji: "🧥", grad: ["#1E293B", "#0F172A"] },
  { name: "AMEZA Minimalist Ceramic Coffee Set", cat: "clothing", sellerIdx: 0, priceCents: 3499, compareAtCents: 4499, emoji: "☕", grad: ["#64748B", "#475569"] },
  { name: "AMEZA Aero Sunglasses Polarized", cat: "clothing", sellerIdx: 0, priceCents: 4999, compareAtCents: 6499, emoji: "🕶️", grad: ["#111827", "#4B5563"] },
  { name: "AMEZA Smart Travel Backpack 30L", cat: "leather-goods", sellerIdx: 0, priceCents: 11999, compareAtCents: 14999, emoji: "🎒", grad: ["#7FB73C", "#6CA030"] },
  { name: "AMEZA Sapphire Dress Watch 40mm", cat: "watches", sellerIdx: 0, priceCents: 13999, compareAtCents: 17999, emoji: "✨", grad: ["#1E3A8A", "#172554"] },
  { name: "AMEZA Mag-Connect Qi2 Power Bank", cat: "electronics", sellerIdx: 0, priceCents: 4499, compareAtCents: 5999, emoji: "🔋", grad: ["#059669", "#047857"] },
  { name: "AMEZA Heritage Full-Zip Cardigan", cat: "clothing", sellerIdx: 0, priceCents: 5999, compareAtCents: 7999, emoji: "🧶", grad: ["#475569", "#1E293B"] }
];

const PRODUCTS = PRODUCT_TEMPLATES.map((tmpl, idx) => {
  const seller = SELLERS[tmpl.sellerIdx];
  const priceCents = tmpl.priceCents;
  const compareAtPriceCents = tmpl.compareAtCents || null;
  const discountPct = compareAtPriceCents ? Math.round((1 - priceCents / compareAtPriceCents) * 100) : 0;
  const id = `prod_${100 + idx}`;

  return {
    id,
    title: tmpl.name,
    slug: tmpl.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: tmpl.cat,
    priceCents,
    compareAtPriceCents,
    discountText: discountPct > 0 ? `-${discountPct}%` : null,
    sellerId: seller.id,
    sellerName: seller.storeName,
    sellerSlug: seller.slug,
    ratingAvg: Number((4.5 + ((idx * 7) % 50) / 100).toFixed(1)),
    ratingCount: 15 + ((idx * 11) % 85),
    stockCount: 8 + ((idx * 9) % 35),
    status: "published",
    badge: idx % 6 === 0 ? "Bestseller" : (idx % 5 === 0 ? "Sale" : (idx % 7 === 0 ? "New" : null)),
    image: createSvgDataUri(tmpl.grad[0], tmpl.grad[1], tmpl.emoji, tmpl.name.split(' ').slice(0, 2).join(' ')),
    description: `Experience exceptional craftsmanship with the ${tmpl.name}. Designed for longevity, high performance, and effortless everyday utility across the United States.`,
    variants: [
      { id: `${id}_v1`, name: "Standard / Black", sku: `SKU-${1000 + idx}-BLK`, priceCents, stock: 12 },
      { id: `${id}_v2`, name: "Premium / Natural", sku: `SKU-${1000 + idx}-NAT`, priceCents: priceCents + 1500, stock: 8 }
    ],
    features: [
      "Ethically sourced premium materials",
      "Hand-finished by verified independent artisans",
      "Backed by AMEZA 30-Day Money-Back Guarantee",
      "Free U.S. Standard Shipping on orders over $100"
    ]
  };
});

// ─── 4. Customers (30 US entries) ──────────────────────────────────────────
const FIRST_NAMES = ['Sarah', 'Liam', 'Emma', 'Oliver', 'Charlotte', 'Noah', 'Amelia', 'Jack', 'Mia', 'Henry', 'Grace', 'William', 'Sophie', 'Lucas', 'Ella', 'Alexander', 'Chloe', 'Thomas', 'Zoe', 'James', 'Harper', 'Benjamin', 'Ruby', 'Daniel', 'Isla', 'Samuel', 'Evelyn', 'Ethan', 'Matilda', 'Mason'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];

const CUSTOMERS = Array.from({ length: 30 }, (_, i) => {
  const fName = FIRST_NAMES[i];
  const lName = LAST_NAMES[i];
  const loc = US_LOCATIONS[i % US_LOCATIONS.length];
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i + 1}@example.com`;
  const phoneDigits = `555010${String(100 + i).padStart(4, '0')}`;
  return {
    id: `cust_${100 + i}`,
    name: `${fName} ${lName}`,
    firstName: fName,
    lastName: lName,
    email,
    phone: phoneDigits,
    phoneFormatted: `(555) 010-${String(100 + i).padStart(4, '0')}`,
    addressLine: `${100 + (i * 35)} ${loc.street}`,
    city: loc.city,
    state: loc.state,
    zip: loc.zip,
    country: "United States",
    registeredAt: Date.now() - (120 - i * 3) * 86400000,
    totalOrders: 1 + (i % 7),
    lifetimeSpendCents: (150 + (i * 95)) * 100,
    status: "active"
  };
});

// ─── 5. Orders (65 orders in USD over 90 days) ─────────────────────────────
const STATUSES = ['delivered', 'completed', 'delivered', 'shipped', 'packed', 'confirmed', 'pending', 'refunded', 'disputed', 'cancelled'];
const CARRIERS = ['USPS', 'UPS', 'FedEx'];
const ORDERS = [];
const SUB_ORDERS = [];
const LEDGER = [];
const now = Date.now();

for (let i = 1; i <= 65; i++) {
  const daysAgo = Math.floor((i / 65) * 88);
  const orderTime = now - (daysAgo * 86400000) - ((i * 1234567) % 43200000);
  const parentId = `ORD-${10000 + i}`;
  const status = STATUSES[i % STATUSES.length];
  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const carrier = CARRIERS[i % CARRIERS.length];

  // Pick 1 to 2 items
  const item1 = PRODUCTS[(i * 3) % PRODUCTS.length];
  const item2 = PRODUCTS[(i * 7 + 3) % PRODUCTS.length];
  const orderItems = [item1];
  if (i % 3 === 0 && item2.sellerId !== item1.sellerId) {
    orderItems.push(item2);
  }

  let totalCents = 0;
  let totalShippingCents = 0;
  const vendorSubs = [];

  orderItems.forEach((prod, idx) => {
    const qty = 1 + (i % 2);
    const subCents = prod.priceCents * qty;
    // Free shipping over $100 (10000 cents), otherwise $5.99 (599 cents)
    const shipCents = subCents >= 10000 ? 0 : 599;
    const subOrderId = `${parentId}-S${idx + 1}`;
    const seller = SELLERS.find(s => s.id === prod.sellerId) || SELLERS[0];
    const commRate = seller.commissionRatePct;
    const commCents = Math.round((subCents * commRate) / 100);
    const netCents = subCents - commCents + shipCents;

    totalCents += subCents;
    totalShippingCents += shipCents;

    const subOrder = {
      id: subOrderId,
      parentOrderId: parentId,
      sellerId: seller.id,
      sellerName: seller.storeName,
      status,
      subtotalCents: subCents,
      shippingCents: shipCents,
      commissionCents: commCents,
      sellerNetCents: netCents,
      items: [{
        productId: prod.id,
        title: prod.title,
        quantity: qty,
        unitPriceCents: prod.priceCents,
        lineTotalCents: subCents,
        image: prod.image
      }],
      carrier,
      trackingNumber: carrier === 'USPS' ? `94001000${10000000 + i * 23 + idx}` : (carrier === 'UPS' ? `1Z999999${10000000 + i * 23 + idx}` : `7946${10000000 + i * 23 + idx}`),
      createdAt: orderTime
    };

    vendorSubs.push(subOrder);
    SUB_ORDERS.push(subOrder);

    // Double-entry ledger entries
    const bucket = (status === 'delivered' || status === 'completed') && (now - orderTime > 7 * 86400000)
      ? 'available'
      : 'pending';

    LEDGER.push({
      id: `led_sale_${i}_${idx}`,
      sellerId: seller.id,
      subOrderId,
      entryType: "sale",
      amountCents: subCents,
      bucket,
      description: `Sale proceeds for Order ${subOrderId}`,
      createdAt: orderTime
    });

    if (commCents > 0) {
      LEDGER.push({
        id: `led_comm_${i}_${idx}`,
        sellerId: seller.id,
        subOrderId,
        entryType: "commission",
        amountCents: commCents,
        bucket,
        description: `Platform fee (${commRate}%) for Order ${subOrderId}`,
        createdAt: orderTime
      });
    }

    if (status === 'refunded') {
      LEDGER.push({
        id: `led_ref_${i}_${idx}`,
        sellerId: seller.id,
        subOrderId,
        entryType: "refund_reversal",
        amountCents: subCents,
        bucket: "available",
        description: `Refund reversal for Order ${subOrderId}`,
        createdAt: orderTime + 86400000 * 2
      });
    }
  });

  // Calculate tax from shipping state
  const stateRate = taxRates[customer.state] || 0.05;
  const taxCents = Math.round(totalCents * stateRate);

  ORDERS.push({
    id: parentId,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    shippingAddress: {
      addressLine: customer.addressLine,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      country: "United States"
    },
    status,
    subtotalCents: totalCents,
    shippingCents: totalShippingCents,
    taxCents,
    totalCents: totalCents + totalShippingCents + taxCents,
    currency: "USD",
    subOrders: vendorSubs,
    createdAt: orderTime
  });
}

// ─── 6. Reviews (with seller replies) ──────────────────────────────────────
const REVIEWS = [
  {
    id: "rev_001",
    productId: "prod_100",
    productTitle: "Classic Saddle Leather Belt",
    customerName: "David Wilson",
    rating: 5,
    title: "Remarkable quality and sturdy brass buckle",
    comment: "The full grain leather is thick and smells incredible. Easily beats luxury retail brands at double the price.",
    verified: true,
    createdAt: now - 86400000 * 5,
    sellerReply: {
      sellerName: "Austin Leather Co",
      comment: "Thank you David! We source all our full-grain leather domestically, glad you love the grain.",
      repliedAt: now - 86400000 * 4
    }
  },
  {
    id: "rev_002",
    productId: "prod_101",
    productTitle: "Full-Grain Slim Wallet",
    customerName: "Sarah Mitchell",
    rating: 5,
    title: "Perfect minimalist front-pocket wallet",
    comment: "Fits 6 cards and cash comfortably without any bulk. Stitching is immaculate.",
    verified: true,
    createdAt: now - 86400000 * 8,
    sellerReply: {
      sellerName: "Austin Leather Co",
      comment: "Cheers Sarah! We spent months perfecting that ultra-slim profile.",
      repliedAt: now - 86400000 * 7
    }
  },
  {
    id: "rev_003",
    productId: "prod_114",
    productTitle: "Relaxed Linen Shirt",
    customerName: "Michael Roberts",
    rating: 5,
    title: "Ultimate summer shirt",
    comment: "Light, airy, and breathes exceptionally well in summer heat. Highly recommend.",
    verified: true,
    createdAt: now - 86400000 * 12,
    sellerReply: {
      sellerName: "Pacific Coastal Living",
      comment: "Thanks Michael! That organic linen gets even softer with every single wash.",
      repliedAt: now - 86400000 * 11
    }
  },
  {
    id: "rev_004",
    productId: "prod_126",
    productTitle: "Precision Chronograph 41mm",
    customerName: "Emily Carter",
    rating: 4,
    title: "Gorgeous watch, slightly stiff strap initially",
    comment: "The dial details and meca-quartz movement are spot on. Leather strap took 3 days to soften up.",
    verified: true,
    createdAt: now - 86400000 * 15,
    sellerReply: {
      sellerName: "Portland Artisan Goods",
      comment: "Thanks Emily! The vegetable-tanned strap molds to your wrist over the first few days of wear.",
      repliedAt: now - 86400000 * 14
    }
  }
];

// ─── 7. Returns & Disputes ────────────────────────────────────────────────
const RETURNS = [
  {
    id: "ret_001",
    orderId: "ORD-10022",
    subOrderId: "ORD-10022-S1",
    customerName: "Chloe Martin",
    productTitle: "Relaxed Linen Shirt",
    reason: "Size too large, requesting exchange for Medium",
    status: "approved",
    requestedAt: now - 86400000 * 3,
    refundAmountCents: 4999
  },
  {
    id: "ret_002",
    orderId: "ORD-10034",
    subOrderId: "ORD-10034-S1",
    customerName: "Benjamin White",
    productTitle: "Solid Brass Buckle Dress Belt",
    reason: "Ordered wrong color variant (requested Black, meant Cognac)",
    status: "completed",
    requestedAt: now - 86400000 * 14,
    refundAmountCents: 6499
  },
  {
    id: "ret_003",
    orderId: "ORD-10041",
    subOrderId: "ORD-10041-S1",
    customerName: "Lucas Taylor",
    productTitle: "Studio Hi-Fi Wireless ANC Earbuds",
    reason: "Damaged packaging upon arrival via postal transit",
    status: "under_review",
    requestedAt: now - 86400000 * 1,
    refundAmountCents: 8999
  }
];

// ─── 8. Payouts (all statuses in USD) ──────────────────────────────────────
const PAYOUTS = [
  {
    id: "pay_001",
    sellerId: "seller_melb_123",
    sellerName: "Austin Leather Co",
    amountCents: 450000,
    status: "paid",
    reference: "PAY-US-98210",
    bankAccount: "••••4892 (Bank of America)",
    requestedAt: now - 86400000 * 20,
    processedAt: now - 86400000 * 19
  },
  {
    id: "pay_002",
    sellerId: "seller_syd_456",
    sellerName: "Pacific Coastal Living",
    amountCents: 320000,
    status: "paid",
    reference: "PAY-US-98211",
    bankAccount: "••••7120 (Wells Fargo)",
    requestedAt: now - 86400000 * 10,
    processedAt: now - 86400000 * 9
  },
  {
    id: "pay_003",
    sellerId: "seller_bris_789",
    sellerName: "Portland Artisan Goods",
    amountCents: 185000,
    status: "processing",
    reference: "PAY-US-98212",
    bankAccount: "••••3319 (U.S. Bank)",
    requestedAt: now - 86400000 * 2,
    processedAt: null
  },
  {
    id: "pay_004",
    sellerId: "seller_melb_123",
    sellerName: "Austin Leather Co",
    amountCents: 295000,
    status: "pending",
    reference: "PAY-US-98213",
    bankAccount: "••••4892 (Bank of America)",
    requestedAt: now - 86400000 * 1,
    processedAt: null
  },
  {
    id: "pay_005",
    sellerId: "seller_bris_789",
    sellerName: "Portland Artisan Goods",
    amountCents: 65000,
    status: "on_hold",
    reference: "PAY-US-98214",
    bankAccount: "••••3319 (U.S. Bank)",
    requestedAt: now - 86400000 * 4,
    notes: "Held pending verification of updated W-9 documentation"
  }
];

// ─── 9. Coupons (US style) ─────────────────────────────────────────────────
const COUPONS = [
  { code: "SAVE10", discountType: "percentage", value: 10, minSpendCents: 5000, active: true, usageCount: 142, description: "10% off entire order", endDate: new Date(now + 86400000 * 60).toISOString() },
  { code: "FREESHIP", discountType: "fixed_shipping", value: 599, minSpendCents: 5000, active: true, usageCount: 0, description: "Free standard shipping on orders over $50", endDate: new Date(now + 86400000 * 30).toISOString() },
  { code: "SPRING20", discountType: "percentage", value: 20, minSpendCents: 10000, active: true, usageCount: 41, description: "20% off spring collection", endDate: new Date(now + 86400000 * 45).toISOString() },
  { code: "WELCOME5", discountType: "fixed_amount", value: 500, minSpendCents: 3500, active: true, usageCount: 88, description: "$5 off first order", endDate: new Date(now + 86400000 * 90).toISOString() },
  { code: "SUMMER25", discountType: "percentage", value: 25, minSpendCents: 10000, active: true, usageCount: 12, description: "25% off summer collection", endDate: new Date(now + 86400000 * 15).toISOString() }
];

// ─── 10. Notifications ─────────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: "notif_001",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-10065 for $189.99 has been placed.",
    timeAgo: "10 mins ago",
    unread: true
  },
  {
    id: "notif_002",
    type: "inventory",
    title: "Low Stock Alert",
    message: "Full-Grain Slim Wallet has only 3 units remaining.",
    timeAgo: "2 hours ago",
    unread: true
  },
  {
    id: "notif_003",
    type: "payout",
    title: "Payout Completed",
    message: "$4,500.00 has been transferred via ACH to your Bank of America account.",
    timeAgo: "1 day ago",
    unread: false
  },
  {
    id: "notif_004",
    type: "review",
    title: "New 5-Star Review",
    message: "David Wilson left a 5-star review on Classic Saddle Leather Belt.",
    timeAgo: "3 days ago",
    unread: false
  }
];

// ─── 11. Messages ──────────────────────────────────────────────────────────
const MESSAGES = [
  {
    id: "thread_001",
    contactName: "David Wilson",
    contactRole: "Customer",
    subject: "Sizing inquiry for Classic Saddle Belt",
    unread: true,
    lastUpdated: now - 3600000 * 2,
    messages: [
      { sender: "customer", text: "Hi Jack, is the belt measured to the center hole or overall length?", time: now - 3600000 * 3 },
      { sender: "seller", text: "Hi David! It is measured from the buckle fold to the center hole.", time: now - 3600000 * 2 }
    ]
  },
  {
    id: "thread_002",
    contactName: "Alexander Vance (Admin)",
    contactRole: "Platform Support",
    subject: "Featured Merchant Showcase Selection",
    unread: false,
    lastUpdated: now - 86400000,
    messages: [
      { sender: "admin", text: "Hi Jack, Austin Leather Co has been selected for the autumn banner spotlight!", time: now - 86400000 }
    ]
  }
];

// ─── 12. Commission Rules ──────────────────────────────────────────────────
const COMMISSION_RULES = {
  defaultRatePct: 10.0,
  categoryOverrides: {
    "electronics": 12.0,
    "watches": 12.0,
    "clothing": 10.0,
    "leather-goods": 10.0
  },
  sellerOverrides: {
    "seller_house_001": 0.0,
    "seller_melb_123": 10.0,
    "seller_syd_456": 10.0,
    "seller_bris_789": 12.0
  },
  payoutSchedule: "Weekly (Every Monday 09:00 ET)",
  holdPeriodDays: 7
};

// ─── 13. Audit Log (with realistic before/after JSON diffs) ────────────────
const AUDIT_LOG = [
  {
    id: "aud_01",
    action: "Approved",
    actor: { name: "admin@example.com", email: "admin@example.com", role: "Super admin", initials: "AT" },
    target: { type: "Seller", name: "Austin Leather Co", icon: "store" },
    timestamp: now - 86400000 * 50,
    ip: "203.0.113.12",
    changes: ["status", "w9Status"],
    before: { status: "under_review", w9Status: "pending" },
    after: { status: "approved", w9Status: "verified" }
  },
  {
    id: "aud_02",
    action: "Updated",
    actor: { name: "admin@example.com", email: "admin@example.com", role: "Super admin", initials: "AT" },
    target: { type: "Commission", name: "Portland Artisan Goods (12%)", icon: "percent" },
    timestamp: now - 86400000 * 30,
    ip: "203.0.113.12",
    changes: ["commissionRatePct"],
    before: { commissionRatePct: 10.0 },
    after: { commissionRatePct: 12.0 }
  },
  {
    id: "aud_03",
    action: "Updated",
    actor: { name: "maria.smith@example.com", email: "maria.smith@example.com", role: "Staff", initials: "MS" },
    target: { type: "Product", name: "Gaming Laptop", icon: "box" },
    timestamp: now - 86400000 * 12,
    ip: "203.0.113.67",
    changes: ["priceCents", "inventory"],
    before: { id: 7821, title: "Gaming Laptop", priceCents: 129900, inventory: 15, status: "active" },
    after: { id: 7821, title: "Gaming Laptop", priceCents: 124900, inventory: 25, status: "active" }
  },
  {
    id: "aud_04",
    action: "Created",
    actor: { name: "jack.callahan@example.com", email: "jack.callahan@example.com", role: "Seller", initials: "JD" },
    target: { type: "Order", name: "#ORD-10042", icon: "cart" },
    timestamp: now - 86400000 * 5,
    ip: "203.0.113.18",
    changes: ["orderStatus"],
    before: null,
    after: { id: "ORD-10042", status: "confirmed", subtotalCents: 14999 }
  },
  {
    id: "aud_05",
    action: "Deleted",
    actor: { name: "admin@example.com", email: "admin@example.com", role: "Super admin", initials: "AT" },
    target: { type: "Content", name: "Outdated Promotion Page", icon: "file" },
    timestamp: now - 86400000 * 2,
    ip: "203.0.113.12",
    changes: ["status"],
    before: { title: "Outdated Promotion Page", status: "published" },
    after: { title: "Outdated Promotion Page", status: "deleted" }
  }
];

// ─── 14. Staff Roles ───────────────────────────────────────────────────────
const STAFF_ROLES = [
  { id: "role_admin", title: "Super Administrator", user: "Alexander Vance", permissions: ["all"], email: "admin@example.com" },
  { id: "role_support", title: "Customer Support Specialist", user: "Chloe Wright", permissions: ["orders:view", "orders:edit", "customers:view", "reviews:view"], email: "chloe.support@example.com" },
  { id: "role_moderator", title: "Catalog & Moderation Specialist", user: "Marcus Reed", permissions: ["catalog:view", "catalog:edit", "sellers:view"], email: "marcus.catalog@example.com" },
  { id: "role_finance", title: "Finance & Payouts Officer", user: "Sarah Lin", permissions: ["finance:view", "finance:edit", "payouts:approve"], email: "sarah.finance@example.com" }
];

// ─── Write All JSON Files ──────────────────────────────────────────────────
const outputs = [
  { file: 'sellers.json', data: SELLERS },
  { file: 'categories.json', data: CATEGORIES },
  { file: 'products.json', data: PRODUCTS },
  { file: 'customers.json', data: CUSTOMERS },
  { file: 'orders.json', data: ORDERS },
  { file: 'reviews.json', data: REVIEWS },
  { file: 'returns.json', data: RETURNS },
  { file: 'payouts.json', data: PAYOUTS },
  { file: 'coupons.json', data: COUPONS },
  { file: 'notifications.json', data: NOTIFICATIONS },
  { file: 'messages.json', data: MESSAGES },
  { file: 'commission_rules.json', data: COMMISSION_RULES },
  { file: 'ledger_entries.json', data: LEDGER },
  { file: 'audit_log.json', data: AUDIT_LOG },
  { file: 'staff_roles.json', data: STAFF_ROLES }
];

outputs.forEach(({ file, data }) => {
  const filePath = path.join(mockDir, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Created mock/${file} (${Array.isArray(data) ? data.length + ' records' : 'object'})`);
});

console.log('🎉 All USA mock JSON files generated successfully in /mock!');
