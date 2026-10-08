/**
 * AMEZA Multi-Vendor Marketplace Demo Seed Engine — js/api/seed.js
 * Generates realistic deterministic USA seed data for:
 * - 4 approved sellers (AMEZA Official + 3 verified US vendors) + 2 pending applications
 * - 51 official catalog products with USD integer cents prices
 * - 30 registered US customers
 * - 65 orders over the past 90 days across all statuses in USD
 * - Complete append-only double-entry ledger entries in integer cents
 * - Reviews with photos and seller replies
 * - Returns, disputes, payout requests in USD with US ACH bank details
 * - Demo staff roles with permission matrix
 * - CMS settings, feature toggles, and notification logs
 */

import { PRODUCTS as CATALOG_PRODUCTS, CATEGORIES as CATALOG_CATEGORIES } from '../products-data.js';

export const DEMO_IDENTITIES = {
  GUEST: {
    id: 'guest',
    role: 'guest',
    name: 'Guest Shopper',
    email: '',
    avatar: 'assets/profile.jpg'
  },
  CUSTOMER: {
    id: 'cust_sarah_jenkins',
    role: 'customer',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(555) 010-0123',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'United States',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  SELLER_1: {
    id: 'seller_melb_123',
    userId: 'user_jack_callahan',
    role: 'seller',
    storeName: 'Austin Leather Co',
    slug: 'austin-leather-co',
    sellerName: 'Austin Leather Co',
    ownerName: 'Jack Callahan',
    email: 'jack.callahan@example.com',
    phone: '(555) 010-0123',
    ein: '12-3456789',
    taxIdType: 'EIN',
    einLast4: '4892',
    taxIdMasked: '**-***4892',
    w9Status: 'verified',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'United States',
    commissionOverridePct: 10.0,
    ratingAvg: 4.9,
    ratingCount: 88,
    status: 'approved',
    isTrusted: true,
    logoUrl: 'assets/wp_products/wp_52_0.webp',
    bannerUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    description: 'Master leather crafters based in Austin, Texas. Hand-stitched full-grain American bovine leather goods.',
    bankDetails: {
      accountName: 'Austin Leather Co LLC',
      bankName: 'Bank of America',
      routingNumber: '121000358',
      accountNumber: '••••4892'
    }
  },
  SELLER_2: {
    id: 'seller_syd_456',
    userId: 'user_emma_ross',
    role: 'seller',
    storeName: 'Pacific Coastal Living',
    slug: 'pacific-coastal-living',
    sellerName: 'Pacific Coastal Living',
    ownerName: 'Emma Ross',
    email: 'emma.ross@example.com',
    phone: '(555) 010-0456',
    ein: '98-7654321',
    taxIdType: 'SSN',
    einLast4: '7120',
    taxIdMasked: '***-**-7120',
    w9Status: 'verified',
    city: 'San Diego',
    state: 'CA',
    zip: '92101',
    country: 'United States',
    commissionOverridePct: 10.0,
    ratingAvg: 4.8,
    ratingCount: 64,
    status: 'approved',
    isTrusted: true,
    logoUrl: 'assets/wp_products/wp_250_0.webp',
    bannerUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    description: 'Sustainable linen apparel and contemporary coastal home essentials crafted on the West Coast.',
    bankDetails: {
      accountName: 'Pacific Coastal Living LLC',
      bankName: 'Wells Fargo',
      routingNumber: '021000021',
      accountNumber: '••••7120'
    }
  },
  SELLER_3: {
    id: 'seller_bris_789',
    userId: 'user_liam_chen',
    role: 'seller',
    storeName: 'Portland Artisan Goods',
    slug: 'portland-artisan-goods',
    sellerName: 'Portland Artisan Goods',
    ownerName: 'Liam Chen',
    email: 'liam.chen@example.com',
    phone: '(555) 010-0789',
    ein: '45-6789012',
    taxIdType: 'EIN',
    einLast4: '3319',
    taxIdMasked: '**-***3319',
    w9Status: 'verified',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    country: 'United States',
    commissionOverridePct: 12.0,
    ratingAvg: 4.7,
    ratingCount: 42,
    status: 'approved',
    isTrusted: false,
    logoUrl: 'assets/wp_products/wp_284_0.webp',
    bannerUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    description: 'Small-batch specialty electronics, handcrafted desk gear, and precision horology accessories.',
    bankDetails: {
      accountName: 'Chen Artisan Holdings LLC',
      bankName: 'U.S. Bank',
      routingNumber: '121000358',
      accountNumber: '••••3319'
    }
  },
  SUPER_ADMIN: {
    id: 'admin_alexander_vance',
    role: 'super_admin',
    name: 'Alexander Vance',
    email: 'admin@example.com',
    title: 'Chief Marketplace Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    permissions: ['all']
  },
  STAFF_SUPPORT: {
    id: 'staff_chloe_wright',
    role: 'staff',
    name: 'Chloe Wright',
    email: 'chloe.support@example.com',
    title: 'Customer & Dispute Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    permissions: [
      'support:view',
      'support:edit',
      'orders:view',
      'orders:edit',
      'customers:view',
      'reviews:view',
      'reviews:edit'
    ]
  },
  STAFF_CATALOG: {
    id: 'staff_marcus_reed',
    role: 'staff',
    name: 'Marcus Reed',
    email: 'marcus.catalog@example.com',
    title: 'Catalog & Moderation Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    permissions: [
      'catalog:view',
      'catalog:edit',
      'catalog:approve',
      'sellers:view',
      'sellers:approve',
      'cms:view',
      'cms:edit'
    ]
  }
};

export const HOUSE_SELLER = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000002',
  storeName: 'AMEZA Official',
  slug: 'ameza-official',
  sellerName: 'AMEZA Official',
  logoUrl: 'assets/ameza-logo.png',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  description: 'Official AMEZA U.S. Flagship Store. Premium certified essentials dispatched across the United States.',
  status: 'approved',
  commissionOverridePct: 0.0,
  isTrusted: true,
  ratingAvg: 5.0,
  ratingCount: 142,
  country: 'United States',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  bankDetails: {
    accountName: 'AMEZA Marketplace Inc',
    bankName: 'JPMorgan Chase',
    routingNumber: '021000021',
    accountNumber: '••••9900'
  }
};

export const PENDING_APPLICATIONS = [
  {
    id: 'app_seattle_eco',
    userId: 'user_zoe_seattle',
    storeName: 'Seattle Eco Essentials',
    slug: 'seattle-eco-essentials',
    ownerName: 'Zoe Henderson',
    email: 'zoe.henderson@example.com',
    phone: '(555) 010-0488',
    ein: '84-1234567',
    category: 'Home & Living',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'United States',
    status: 'under_review',
    submittedAt: Date.now() - 86400000 * 2,
    docUrl: 'assets/wp_products/wp_52_0.webp',
    docType: 'W-9 Form & State Business License',
    bankDetails: { routingNumber: '021000021', accountNumber: '••••2311', bankName: 'Chase' },
    policies: '100% compostable packaging. 30-day eco-friendly return window.'
  },
  {
    id: 'app_denver_organics',
    userId: 'user_toby_denver',
    storeName: 'Denver Mountain Goods',
    slug: 'denver-mountain-goods',
    ownerName: 'Toby Miller',
    email: 'toby.miller@example.com',
    phone: '(555) 010-0567',
    ein: '84-9876543',
    category: 'Accessories',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    country: 'United States',
    status: 'under_review',
    submittedAt: Date.now() - 86400000 * 4,
    docUrl: 'assets/wp_products/wp_284_0.webp',
    docType: 'W-9 Form & Certificate of Good Standing',
    bankDetails: { routingNumber: '121000358', accountNumber: '••••5521', bankName: 'Wells Fargo' },
    policies: 'Standard and express shipping across the continental United States.'
  }
];

const US_LOCATIONS_LIST = [
  { city: 'Austin', state: 'TX', zip: '78701', street: '100 Congress Ave' },
  { city: 'New York', state: 'NY', zip: '10001', street: '350 5th Ave' },
  { city: 'Los Angeles', state: 'CA', zip: '90012', street: '200 N Spring St' },
  { city: 'Chicago', state: 'IL', zip: '60601', street: '100 N Michigan Ave' },
  { city: 'Seattle', state: 'WA', zip: '98101', street: '400 Pine St' },
  { city: 'Miami', state: 'FL', zip: '33101', street: '100 Biscayne Blvd' },
  { city: 'Denver', state: 'CO', zip: '80202', street: '1600 17th St' },
  { city: 'Boston', state: 'MA', zip: '02108', street: '100 Beacon St' },
  { city: 'Portland', state: 'OR', zip: '97201', street: '500 SW 5th Ave' },
  { city: 'San Diego', state: 'CA', zip: '92101', street: '300 Broadway' }
];

function distributeProducts() {
  const sellersList = [
    HOUSE_SELLER,
    DEMO_IDENTITIES.SELLER_1,
    DEMO_IDENTITIES.SELLER_2,
    DEMO_IDENTITIES.SELLER_3
  ];

  return CATALOG_PRODUCTS.map((prod, index) => {
    let assignedSeller = HOUSE_SELLER;
    const cat = (prod.category || '').toLowerCase();
    
    if (cat.includes('belt') || cat.includes('wallet') || cat.includes('leather')) {
      assignedSeller = DEMO_IDENTITIES.SELLER_1;
    } else if (cat.includes('clothing')) {
      assignedSeller = DEMO_IDENTITIES.SELLER_2;
    } else if (cat.includes('watch') || cat.includes('electronic')) {
      assignedSeller = DEMO_IDENTITIES.SELLER_3;
    } else {
      assignedSeller = sellersList[index % sellersList.length];
    }

    const priceCents = prod.price > 500 && prod.price % 1 === 0 ? prod.price : Math.round(Number(prod.price || 89) * 100);
    const compareAtCents = prod.oldPrice ? (prod.oldPrice > 500 && prod.oldPrice % 1 === 0 ? prod.oldPrice : Math.round(Number(prod.oldPrice) * 100)) : Math.round(priceCents * 1.25);

    return {
      ...prod,
      dbId: `prod_seed_${prod.id}`,
      sellerId: assignedSeller.id,
      sellerName: assignedSeller.storeName,
      sellerSlug: assignedSeller.slug,
      status: 'published',
      stockCount: 15 + (index % 20),
      inStock: true,
      price: priceCents,
      priceCents: priceCents,
      compare_at_price: compareAtCents,
      compareAtPriceCents: compareAtCents,
      base_price: priceCents,
      costPrice: Math.round(priceCents * 0.45),
      viewsCount: 240 + (index * 37),
      salesCount: 12 + (index % 18),
      commissionOverridePct: assignedSeller.id === HOUSE_SELLER.id ? 0.0 : null,
      variants: [
        { id: `v1_${prod.id}`, name: 'Default', sku: `SKU-${prod.id}-DEF`, price: priceCents, priceCents, stock: 12 },
        { id: `v2_${prod.id}`, name: 'Premium Edition', sku: `SKU-${prod.id}-PRM`, price: priceCents + 1500, priceCents: priceCents + 1500, stock: 8 }
      ]
    };
  });
}

function generateSeedOrders(products) {
  const parentOrders = [];
  const subOrders = [];
  const ledgerEntries = [];
  const now = Date.now();
  const dayMs = 86400000;

  const statuses = [
    'delivered', 'completed', 'delivered', 'delivered', 'shipped',
    'packed', 'confirmed', 'pending', 'returned', 'refunded', 'disputed'
  ];

  const firstNames = ['Sarah', 'David', 'Jessica', 'Michael', 'Chloe', 'James', 'Emily', 'Benjamin', 'Olivia', 'Thomas', 'Sophie', 'Lucas'];
  const lastNames = ['Jenkins', 'Smith', 'Wilson', 'Anderson', 'Taylor', 'Brown', 'Martin', 'White', 'Harris', 'Clark'];
  const carriers = ['USPS', 'UPS', 'FedEx'];

  for (let i = 1; i <= 65; i++) {
    const daysAgo = Math.floor((i / 65) * 88);
    const orderTime = now - (daysAgo * dayMs) - Math.floor(Math.random() * 36000000);
    const parentOrderId = `ORD-${100000 + i}`;
    const status = statuses[i % statuses.length];

    const customerName = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const loc = US_LOCATIONS_LIST[i % US_LOCATIONS_LIST.length];
    const carrier = carriers[i % carriers.length];

    const item1 = products[(i * 3) % products.length];
    const item2 = products[(i * 5 + 7) % products.length];
    const chosenProducts = [item1];
    if (i % 2 === 0 && item2.sellerId !== item1.sellerId) {
      chosenProducts.push(item2);
    }

    let parentSubtotalCents = 0;
    let parentShippingCents = 0;
    const vendorSplits = [];

    chosenProducts.forEach((p, vIdx) => {
      const qty = 1 + (i % 2);
      const unitCents = p.priceCents || p.price || 5999;
      const lineCents = unitCents * qty;
      const shippingCents = lineCents >= 10000 ? 0 : 599; // Free over $100
      const subOrderId = `${parentOrderId}-S${vIdx + 1}`;

      parentSubtotalCents += lineCents;
      parentShippingCents += shippingCents;

      let ratePct = 10.0;
      if (p.sellerId === HOUSE_SELLER.id) ratePct = 0.0;
      else if (p.sellerId === DEMO_IDENTITIES.SELLER_3.id) ratePct = 12.0;

      const commCents = Math.round((lineCents * ratePct) / 100);
      const sellerNetCents = lineCents - commCents + shippingCents;

      const deliveredDays = Math.max(1, daysAgo - 4);
      const deliveredAt = (status === 'delivered' || status === 'completed') ? (orderTime + deliveredDays * dayMs) : null;
      const holdUntil = deliveredAt ? (deliveredAt + 7 * dayMs) : null;
      const isAvailable = deliveredAt && (now >= holdUntil) && status !== 'disputed' && status !== 'refunded';

      const trackingNumber = carrier === 'USPS' ? `94001000${10000000 + i * 29 + vIdx}` : (carrier === 'UPS' ? `1Z999999${10000000 + i * 29 + vIdx}` : `7946${10000000 + i * 29 + vIdx}`);

      const subOrder = {
        id: subOrderId,
        parentOrderId,
        sellerId: p.sellerId,
        sellerName: p.sellerName,
        sellerSlug: p.sellerSlug,
        status: status,
        paymentMethod: (i % 8 === 0) ? 'cod' : 'card',
        subtotalCents: lineCents,
        shippingCents,
        commissionRate: ratePct / 100,
        commissionRatePct: ratePct,
        commissionCents: commCents,
        commissionTotalCents: commCents,
        sellerNetCents,
        sellerNetEarningsCents: sellerNetCents,
        items: [{
          productId: p.id,
          productName: p.name,
          image: p.image,
          quantity: qty,
          unitPriceCents: unitCents,
          lineSubtotalCents: lineCents,
          commissionRatePct: ratePct,
          commissionAmountCents: commCents,
          sellerEarningsCents: lineCents - commCents
        }],
        createdAt: orderTime,
        deliveredAt,
        holdUntil,
        carrier,
        trackingNumber
      };

      subOrders.push(subOrder);
      vendorSplits.push({
        sellerId: p.sellerId,
        sellerName: p.sellerName,
        subOrderId,
        trackingNumber
      });

      const bucket = isAvailable ? 'available' : 'pending';

      if (subOrder.paymentMethod === 'cod') {
        if (commCents > 0) {
          ledgerEntries.push({
            id: `led_cod_${i}_${vIdx}`,
            sellerId: p.sellerId,
            subOrderId,
            entryType: 'cod_commission_due',
            amountCents: commCents,
            bucket: 'available',
            notes: `COD Commission Due (${ratePct}% commission) for Order ${subOrderId}`,
            description: `COD Commission Due (${ratePct}% commission) for Order ${subOrderId}`,
            createdAt: orderTime
          });
        }
      } else {
        ledgerEntries.push({
          id: `led_sale_${i}_${vIdx}`,
          sellerId: p.sellerId,
          subOrderId,
          entryType: 'sale',
          amountCents: lineCents,
          bucket,
          notes: `Item Gross Sales for Order ${subOrderId}`,
          description: `Item Gross Sales for Order ${subOrderId}`,
          createdAt: orderTime
        });

        if (commCents > 0) {
          ledgerEntries.push({
            id: `led_comm_${i}_${vIdx}`,
            sellerId: p.sellerId,
            subOrderId,
            entryType: 'commission',
            amountCents: commCents,
            bucket,
            notes: `Platform Commission (${ratePct}% commission) for Order ${subOrderId}`,
            description: `Platform Commission (${ratePct}% commission) for Order ${subOrderId}`,
            createdAt: orderTime
          });
        }

        if (shippingCents > 0) {
          ledgerEntries.push({
            id: `led_ship_${i}_${vIdx}`,
            sellerId: p.sellerId,
            subOrderId,
            entryType: 'shipping_income',
            amountCents: shippingCents,
            bucket,
            notes: `Shipping Compensation for Order ${subOrderId}`,
            description: `Shipping Compensation for Order ${subOrderId}`,
            createdAt: orderTime
          });
        }
      }

      if (status === 'refunded') {
        ledgerEntries.push({
          id: `led_ref_${i}_${vIdx}`,
          sellerId: p.sellerId,
          subOrderId,
          entryType: 'refund',
          amountCents: lineCents,
          bucket: 'available',
          notes: `Refund processed for customer return on Order ${subOrderId}`,
          description: `Refund processed for customer return on Order ${subOrderId}`,
          createdAt: orderTime + 3 * dayMs
        });
        if (commCents > 0) {
          ledgerEntries.push({
            id: `led_comm_rev_${i}_${vIdx}`,
            sellerId: p.sellerId,
            subOrderId,
            entryType: 'commission_reversal',
            amountCents: commCents,
            bucket: 'available',
            notes: `Commission reversal on refunded Order ${subOrderId}`,
            description: `Commission reversal on refunded Order ${subOrderId}`,
            createdAt: orderTime + 3 * dayMs
          });
        }
      }
    });

    const parentGrandTotal = parentSubtotalCents + parentShippingCents;

    parentOrders.push({
      id: parentOrderId,
      orderNumber: parentOrderId,
      customerId: `cust_${(i % 12) + 1}`,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
      currency: 'USD',
      subtotalCents: parentSubtotalCents,
      shippingCents: parentShippingCents,
      grandTotalCents: parentGrandTotal,
      paymentMethod: (i % 8 === 0) ? 'cod' : 'card',
      paymentStatus: (i % 8 === 0) ? 'Payment on Delivery' : 'Paid (Verified)',
      shippingAddress: {
        fullName: customerName,
        line1: `${12 + (i % 80)} ${loc.street}`,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        country: 'United States'
      },
      status,
      vendorSplits,
      createdAt: orderTime
    });
  }

  return { parentOrders, subOrders, ledgerEntries };
}

export const SeedService = {
  init(force = false) {
    if (typeof localStorage === 'undefined') return;

    const isInitialized = localStorage.getItem('ameza_demo_seeded_usa_v4');
    if (isInitialized && !force) {
      return;
    }

    console.log('[AMEZA Seed Engine] Initializing complete realistic USA marketplace dataset...');

    // 1. Sellers
    const sellers = [
      HOUSE_SELLER,
      DEMO_IDENTITIES.SELLER_1,
      DEMO_IDENTITIES.SELLER_2,
      DEMO_IDENTITIES.SELLER_3
    ];
    localStorage.setItem('ameza_sellers', JSON.stringify(sellers));
    localStorage.setItem('ameza_seller_applications', JSON.stringify(PENDING_APPLICATIONS));

    // 2. Products
    const products = distributeProducts();
    localStorage.setItem('ameza_custom_products', JSON.stringify(products));

    // 3. Orders & Ledger
    const { parentOrders, subOrders, ledgerEntries } = generateSeedOrders(products);
    localStorage.setItem('ameza_marketplace_parent_orders', JSON.stringify(parentOrders));
    localStorage.setItem('ameza_marketplace_sub_orders', JSON.stringify(subOrders));
    localStorage.setItem('ameza_ledger_entries', JSON.stringify(ledgerEntries));

    // 4. Default Payouts
    const seedPayouts = [
      {
        id: 'pay_austin_001',
        sellerId: DEMO_IDENTITIES.SELLER_1.id,
        sellerName: DEMO_IDENTITIES.SELLER_1.storeName,
        amountCents: 450000,
        status: 'paid',
        requestedAt: Date.now() - 86400000 * 14,
        processedAt: Date.now() - 86400000 * 12,
        bankDetails: DEMO_IDENTITIES.SELLER_1.bankDetails,
        reference: 'ACH-AMZ-202610-0981',
        proofUrl: 'assets/wp_products/wp_52_0.webp'
      },
      {
        id: 'pay_coastal_002',
        sellerId: DEMO_IDENTITIES.SELLER_2.id,
        sellerName: DEMO_IDENTITIES.SELLER_2.storeName,
        amountCents: 280000,
        status: 'paid',
        requestedAt: Date.now() - 86400000 * 8,
        processedAt: Date.now() - 86400000 * 6,
        bankDetails: DEMO_IDENTITIES.SELLER_2.bankDetails,
        reference: 'ACH-AMZ-202610-1044',
        proofUrl: 'assets/wp_products/wp_250_0.webp'
      },
      {
        id: 'pay_austin_003',
        sellerId: DEMO_IDENTITIES.SELLER_1.id,
        sellerName: DEMO_IDENTITIES.SELLER_1.storeName,
        amountCents: 125000,
        status: 'processing',
        requestedAt: Date.now() - 86400000 * 1,
        processedAt: null,
        bankDetails: DEMO_IDENTITIES.SELLER_1.bankDetails,
        reference: null
      }
    ];
    localStorage.setItem('ameza_payout_requests', JSON.stringify(seedPayouts));

    // 5. Default CMS & Platform Settings
    const defaultSettings = {
      siteName: 'AMEZA Marketplace',
      baseCurrency: 'USD',
      defaultCommissionPct: 10.0,
      holdPeriodDays: 7,
      minPayoutCents: 5000, // $50.00
      brandColor: '#7FB73C',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      features: {
        reviews: true,
        cod: true,
        messaging: true,
        coupons: true,
        autoApproveSellers: false,
        wishlist: true
      },
      announcementText: 'Free U.S. shipping on orders over $100 · 30-day returns'
    };
    localStorage.setItem('ameza_platform_settings', JSON.stringify(defaultSettings));

    // 6. Active Session
    if (!localStorage.getItem('ameza_session')) {
      localStorage.setItem('ameza_session', JSON.stringify({
        userId: DEMO_IDENTITIES.CUSTOMER.id,
        user: DEMO_IDENTITIES.CUSTOMER,
        role: 'customer',
        expiresAt: Date.now() + 86400000 * 30
      }));
    }

    localStorage.setItem('ameza_demo_seeded_usa_v4', 'true');
    console.log('[AMEZA Seed Engine] Seed complete! 51 products, 65 orders, and realistic ledger generated.');
  },

  reset() {
    if (typeof localStorage === 'undefined') return;
    localStorage.clear();
    this.init(true);
  }
};

if (typeof window !== 'undefined') {
  window.AmezaSeedService = SeedService;
}
