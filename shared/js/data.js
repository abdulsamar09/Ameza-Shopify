/**
 * AMEZA Seller Dashboard - Mock Data Layer
 * NOTE: Replace with real backend API in future phase.
 */

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', url: '/seller/index.html', icon: 'home', badge: null },
  { id: 'orders', label: 'Orders', url: '/seller/orders.html', icon: 'orders', badge: '12' },
  { id: 'returns', label: 'Returns', url: '/seller/returns.html', icon: 'returns', badge: '2' },
  { id: 'products', label: 'Products', url: '/seller/products.html', icon: 'products', badge: null },
  { id: 'inventory', label: 'Inventory', url: '/seller/inventory.html', icon: 'inventory', badge: null },
  { id: 'reviews', label: 'Reviews', url: '/seller/reviews.html', icon: 'reviews', badge: null },
  { id: 'messages', label: 'Messages', url: '/seller/messages.html', icon: 'messages', badge: '5' },
  { id: 'earnings', label: 'Earnings', url: '/seller/earnings.html', icon: 'earnings', badge: null },
  { id: 'payouts', label: 'Payouts', url: '/seller/payouts.html', icon: 'payouts', badge: null },
  { id: 'discounts', label: 'Discounts', url: '/seller/discounts.html', icon: 'discounts', badge: null },
  { id: 'shipping', label: 'Shipping', url: '/seller/shipping.html', icon: 'shipping', badge: null },
  { id: 'analytics', label: 'Analytics', url: '/seller/analytics.html', icon: 'analytics', badge: null },
  { id: 'settings', label: 'Settings', url: '/seller/settings.html', icon: 'settings', badge: null }
];

export const PERIOD_DATA = {
  '30d': {
    label: 'Last 30 days',
    comparisonLabel: 'vs. previous 30 days',
    metrics: {
      sales: { value: '$12,480', delta: '↑ 12.4%', up: true },
      orders: { value: '312', delta: '↑ 8.7%', up: true },
      conversion: { value: '3.2%', delta: '↑ 0.6%', up: true },
      balance: { value: '$3,920', delta: '↑ 15.2%', up: true }
    },
    sparklines: {
      sales: [40, 52, 48, 65, 59, 78, 70, 85, 80, 95],
      orders: [25, 30, 28, 42, 36, 50, 45, 60, 55, 68],
      conversion: [2.1, 2.4, 2.2, 2.8, 2.6, 3.0, 2.9, 3.1, 3.0, 3.2],
      balance: [1200, 1600, 1400, 2100, 1900, 2800, 2500, 3400, 3100, 3920]
    },
    chart: {
      labels: ['Apr 24', 'Apr 28', 'May 2', 'May 6', 'May 10', 'May 14', 'May 18', 'May 22'],
      values: [550, 720, 640, 910, 820, 1420, 1100, 1680]
    }
  },
  '7d': {
    label: 'Last 7 days',
    comparisonLabel: 'vs. previous 7 days',
    metrics: {
      sales: { value: '$3,420', delta: '↑ 9.2%', up: true },
      orders: { value: '84', delta: '↑ 5.1%', up: true },
      conversion: { value: '3.4%', delta: '↑ 0.3%', up: true },
      balance: { value: '$1,850', delta: '↑ 8.4%', up: true }
    },
    sparklines: {
      sales: [380, 420, 510, 490, 620, 580, 710],
      orders: [9, 11, 14, 12, 16, 15, 18],
      conversion: [2.9, 3.1, 3.2, 3.0, 3.5, 3.3, 3.4],
      balance: [800, 950, 1100, 1300, 1500, 1700, 1850]
    },
    chart: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [420, 580, 650, 510, 890, 780, 1150]
    }
  },
  'today': {
    label: 'Today',
    comparisonLabel: 'vs. yesterday',
    metrics: {
      sales: { value: '$640', delta: '↑ 14.1%', up: true },
      orders: { value: '16', delta: '↑ 12.0%', up: true },
      conversion: { value: '3.8%', delta: '↑ 1.1%', up: true },
      balance: { value: '$3,920', delta: '↑ 2.5%', up: true }
    },
    sparklines: {
      sales: [40, 80, 120, 240, 360, 490, 640],
      orders: [1, 2, 4, 7, 10, 13, 16],
      conversion: [2.0, 2.5, 3.0, 3.2, 3.5, 3.7, 3.8],
      balance: [3700, 3750, 3800, 3850, 3880, 3900, 3920]
    },
    chart: {
      labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
      values: [40, 120, 290, 410, 550, 640]
    }
  },
  '90d': {
    label: 'Last 90 days',
    comparisonLabel: 'vs. previous 90 days',
    metrics: {
      sales: { value: '$38,940', delta: '↑ 18.6%', up: true },
      orders: { value: '948', delta: '↑ 14.2%', up: true },
      conversion: { value: '3.1%', delta: '↑ 0.4%', up: true },
      balance: { value: '$11,400', delta: '↑ 22.0%', up: true }
    },
    sparklines: {
      sales: [8000, 11000, 15000, 19000, 24000, 29000, 33000, 38940],
      orders: [210, 300, 420, 540, 680, 780, 880, 948],
      conversion: [2.5, 2.7, 2.9, 3.0, 3.2, 3.1, 3.0, 3.1],
      balance: [3000, 4500, 6000, 7200, 8500, 9800, 10500, 11400]
    },
    chart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [4200, 5800, 7100, 8400, 10200, 12480]
    }
  }
};

export const SETUP_GUIDE_STEPS = [
  {
    id: 1,
    title: '1. Add your store details',
    desc: 'Your store is ready to go.',
    completed: true
  },
  {
    id: 2,
    title: '2. Set up payments',
    desc: 'Accept payments from your customers.',
    completed: true
  },
  {
    id: 3,
    title: '3. Add your first product',
    desc: 'Start selling and grow your business.',
    completed: true
  },
  {
    id: 4,
    title: '4. Configure shipping',
    desc: 'Set up your shipping zones and rates.',
    completed: false
  }
];

export const RECENT_ORDERS = [
  {
    id: '#1042',
    date: 'May 22, 2025',
    customer: 'Sarah Khan',
    total: '$89.00',
    status: 'Paid',
    statusClass: 'status-paid',
    thumb: 'thumbBag'
  },
  {
    id: '#1041',
    date: 'May 21, 2025',
    customer: 'Ali Raza',
    total: '$45.50',
    status: 'Pending',
    statusClass: 'status-pending',
    thumb: 'thumbHeadphones'
  },
  {
    id: '#1040',
    date: 'May 20, 2025',
    customer: 'Fatima Zahra',
    total: '$120.00',
    status: 'Paid',
    statusClass: 'status-paid',
    thumb: 'thumbShoes'
  },
  {
    id: '#1039',
    date: 'May 19, 2025',
    customer: 'Hassan Ali',
    total: '$62.00',
    status: 'Fulfilled',
    statusClass: 'status-fulfilled',
    thumb: 'thumbBackpack'
  },
  {
    id: '#1038',
    date: 'May 18, 2025',
    customer: 'Ayesha Malik',
    total: '$34.99',
    status: 'Cancelled',
    statusClass: 'status-cancelled',
    thumb: 'thumbCap'
  }
];

export const LOW_STOCK_PRODUCTS = [
  {
    name: 'Wireless Earbuds',
    sku: 'SKU: WB-001',
    available: 3,
    status: 'Low stock',
    statusClass: 'status-lowstock',
    thumb: 'thumbEarbuds'
  },
  {
    name: 'Smart Watch',
    sku: 'SKU: SW-002',
    available: 5,
    status: 'Low stock',
    statusClass: 'status-lowstock',
    thumb: 'thumbWatch'
  },
  {
    name: 'Backpack Pro',
    sku: 'SKU: BP-003',
    available: 7,
    status: 'Low stock',
    statusClass: 'status-lowstock',
    thumb: 'thumbBackpack'
  },
  {
    name: 'Running Shoes',
    sku: 'SKU: RS-004',
    available: 12,
    status: 'Low stock',
    statusClass: 'status-lowstock',
    thumb: 'thumbShoes'
  },
  {
    name: 'Baseball Cap',
    sku: 'SKU: BC-005',
    available: 15,
    status: 'Low stock',
    statusClass: 'status-lowstock',
    thumb: 'thumbCap'
  }
];

export const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New order #1042 received',
    desc: 'Sarah Khan ordered Leather Weekend Duffle ($89.00)',
    time: '12m ago',
    unread: true
  },
  {
    id: 2,
    title: 'Low stock alert',
    desc: 'Wireless Earbuds (SKU: WB-001) has only 3 left in inventory',
    time: '1h ago',
    unread: true
  },
  {
    id: 3,
    title: 'Weekly payout processed',
    desc: '$1,420.00 was transferred to your bank account',
    time: '1d ago',
    unread: true
  }
];

// Global Commission Rate (10% default)
export const COMMISSION_RATE = 0.10;

import { formatMoney as coreFormatMoney } from './core/utils.js';

/**
 * Format integer cents to currency string (single source of truth: js/core/utils.js)
 */
export const formatMoney = coreFormatMoney;

export const CATEGORIES_LIST = [
  'Accessories',
  'Bags',
  'Clothing',
  'Electronics',
  'Footwear',
  'Home & Living'
];

export const BRANDS_LIST = [
  'Ameza Audio',
  'Ameza Living',
  'Ameza Gear',
  'Ameza Apparel',
  'Urban Craft'
];

// Initial 8 products matching Image 1
export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Leather Wallet',
    sku: 'WL-001',
    status: 'Active',
    inventory: 12,
    category: 'Accessories',
    price: 2999, // $29.99
    compareAtPrice: 3999,
    cost: 1500,
    sales: 342,
    thumb: 'thumbWallet',
    tags: ['leather', 'wallet', 'accessories'],
    brand: 'Urban Craft'
  },
  {
    id: 2,
    name: 'Wireless Earbuds',
    sku: 'EB-002',
    status: 'Active',
    inventory: 24,
    category: 'Electronics',
    price: 4999, // $49.99
    compareAtPrice: 6999,
    cost: 2200,
    sales: 1248,
    thumb: 'thumbEarbuds',
    tags: ['audio', 'earbuds', 'wireless'],
    brand: 'Ameza Audio'
  },
  {
    id: 3,
    name: 'LED Desk Lamp',
    sku: 'DL-003',
    status: 'Active',
    inventory: 8,
    category: 'Home & Living',
    price: 3999, // $39.99
    compareAtPrice: 4999,
    cost: 1800,
    sales: 563,
    thumb: 'thumbLamp',
    tags: ['home', 'lighting', 'lamp'],
    brand: 'Ameza Living'
  },
  {
    id: 4,
    name: 'Classic Cotton T-Shirt',
    sku: 'TS-004',
    status: 'Draft',
    inventory: 50,
    category: 'Clothing',
    price: 1999, // $19.99
    compareAtPrice: 2499,
    cost: 800,
    sales: 0,
    thumb: 'thumbTshirt',
    tags: ['clothing', 'cotton', 'tshirt'],
    brand: 'Ameza Apparel'
  },
  {
    id: 5,
    name: 'Running Shoes',
    sku: 'RS-005',
    status: 'Active',
    inventory: 5,
    category: 'Footwear',
    price: 6999, // $69.99
    compareAtPrice: 8999,
    cost: 3500,
    sales: 876,
    thumb: 'thumbShoes',
    tags: ['shoes', 'running', 'sport'],
    brand: 'Ameza Gear'
  },
  {
    id: 6,
    name: 'Travel Backpack',
    sku: 'BP-006',
    status: 'Pending review',
    inventory: 15,
    category: 'Bags',
    price: 5999, // $59.99
    compareAtPrice: 7999,
    cost: 2800,
    sales: 245,
    thumb: 'thumbBackpack',
    tags: ['bag', 'travel', 'backpack'],
    brand: 'Ameza Gear'
  },
  {
    id: 7,
    name: 'Smart Watch',
    sku: 'SW-007',
    status: 'Active',
    inventory: 0, // Out of stock
    category: 'Electronics',
    price: 8999, // $89.99
    compareAtPrice: 11999,
    cost: 4500,
    sales: 1032,
    thumb: 'thumbWatch',
    tags: ['watch', 'smartwatch', 'tech'],
    brand: 'Ameza Audio'
  },
  {
    id: 8,
    name: 'Insulated Water Bottle',
    sku: 'WB-008',
    status: 'Rejected',
    inventory: 0,
    category: 'Home & Living',
    price: 2499, // $24.99
    compareAtPrice: 2999,
    cost: 1000,
    sales: 0,
    thumb: 'thumbBottle',
    tags: ['bottle', 'kitchen', 'drinkware'],
    brand: 'Ameza Living',
    rejectionReason: 'Product imagery does not meet minimum quality and resolution standards. Please re-upload with high-resolution white background images.'
  }
];

export function getProducts() {
  try {
    const stored = localStorage.getItem('ameza_products_data');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed reading products from localStorage', e);
  }
  return [...INITIAL_PRODUCTS];
}

export function saveProducts(products) {
  try {
    localStorage.setItem('ameza_products_data', JSON.stringify(products));
  } catch (e) {
    console.error('Failed saving products to localStorage', e);
  }
}

// Initial 10 orders matching Image 4
export const INITIAL_ORDERS = [
  {
    id: '#1042',
    rawId: '1042',
    date: 'Apr 29, 2025 10:24 AM',
    customer: 'John Carter',
    email: 'john@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
    itemsCount: 2,
    itemsText: '2 items',
    thumb: 'thumbHeadphones',
    total: 12998, // $129.98
    isNew: true
  },
  {
    id: '#1041',
    rawId: '1041',
    date: 'Apr 29, 2025 09:17 AM',
    customer: 'Sarah Khan',
    email: 'sarah@example.com',
    paymentStatus: 'COD pending',
    fulfillmentStatus: 'Unfulfilled',
    itemsCount: 1,
    itemsText: '1 item',
    thumb: 'thumbWatch',
    total: 8900, // $89.00
    isNew: true
  },
  {
    id: '#1040',
    rawId: '1040',
    date: 'Apr 28, 2025 06:32 PM',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
    itemsCount: 3,
    itemsText: '3 items',
    thumb: 'thumbShoes',
    total: 24997 // $249.97
  },
  {
    id: '#1039',
    rawId: '1039',
    date: 'Apr 28, 2025 02:11 PM',
    customer: 'Emily Davis',
    email: 'emily@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Unfulfilled',
    itemsCount: 1,
    itemsText: '1 item',
    thumb: 'thumbBackpack',
    total: 6900 // $69.00
  },
  {
    id: '#1038',
    rawId: '1038',
    date: 'Apr 27, 2025 11:45 AM',
    customer: 'Ahmed Raza',
    email: 'ahmed@example.com',
    paymentStatus: 'Refunded',
    fulfillmentStatus: 'Unfulfilled',
    itemsCount: 2,
    itemsText: '2 items',
    thumb: 'thumbBottle',
    total: 11800 // $118.00
  },
  {
    id: '#1037',
    rawId: '1037',
    date: 'Apr 27, 2025 09:20 AM',
    customer: 'Lisa Wong',
    email: 'lisa@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
    itemsCount: 1,
    itemsText: '1 item',
    thumb: 'thumbWallet',
    total: 4500 // $45.00
  },
  {
    id: '#1036',
    rawId: '1036',
    date: 'Apr 26, 2025 04:17 PM',
    customer: 'David Smith',
    email: 'david@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Unfulfilled',
    itemsCount: 2,
    itemsText: '2 items',
    thumb: 'thumbCap',
    total: 7800 // $78.00
  },
  {
    id: '#1035',
    rawId: '1035',
    date: 'Apr 26, 2025 12:05 PM',
    customer: 'Ayesha Malik',
    email: 'ayesha@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
    itemsCount: 1,
    itemsText: '1 item',
    thumb: 'thumbTshirt',
    total: 3200 // $32.00
  },
  {
    id: '#1034',
    rawId: '1034',
    date: 'Apr 25, 2025 08:42 PM',
    customer: 'Chris Lee',
    email: 'chris@example.com',
    paymentStatus: 'COD pending',
    fulfillmentStatus: 'Unfulfilled',
    itemsCount: 1,
    itemsText: '1 item',
    thumb: 'thumbEarbuds',
    total: 5900 // $59.00
  },
  {
    id: '#1033',
    rawId: '1033',
    date: 'Apr 25, 2025 03:28 PM',
    customer: 'Fatima Noor',
    email: 'fatima@example.com',
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
    itemsCount: 4,
    itemsText: '4 items',
    thumb: 'thumbBackpack',
    total: 19600 // $196.00
  }
];

export function getOrders() {
  try {
    const stored = localStorage.getItem('ameza_orders_data');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed reading orders from localStorage', e);
  }
  return [...INITIAL_ORDERS];
}

export function saveOrders(orders) {
  try {
    localStorage.setItem('ameza_orders_data', JSON.stringify(orders));
  } catch (e) {
    console.error('Failed saving orders to localStorage', e);
  }
}

// Initial Inventory Mock Data (10 Variants)
export const INITIAL_INVENTORY = [
  {
    id: 1,
    name: 'Leather Wallet',
    variant: 'Black / Classic',
    sku: 'WL-001',
    thumb: 'thumbWallet',
    committed: 3,
    available: 12,
    history: [
      { date: 'Today, 2:15 PM', type: 'Sale', qty: -1, who: 'Order #AM-1037', reason: 'Customer purchase' },
      { date: 'Yesterday, 11:30 AM', type: 'Sale', qty: -2, who: 'Order #AM-1032', reason: 'Customer purchase' },
      { date: 'Apr 24, 09:00 AM', type: 'Restock', qty: 15, who: 'Ameza Official', reason: 'Supplier batch delivery' },
      { date: 'Apr 20, 04:45 PM', type: 'Adjustment', qty: -1, who: 'Warehouse Staff', reason: 'Damaged packaging' }
    ]
  },
  {
    id: 2,
    name: 'Wireless Earbuds',
    variant: 'White / Standard',
    sku: 'EB-002',
    thumb: 'thumbEarbuds',
    committed: 5,
    available: 24,
    history: [
      { date: 'Today, 10:14 AM', type: 'Sale', qty: -1, who: 'Order #AM-1034', reason: 'Customer purchase' },
      { date: 'Apr 26, 03:20 PM', type: 'Restock', qty: 20, who: 'Ameza Official', reason: 'Restock inbound' },
      { date: 'Apr 22, 01:10 PM', type: 'Return', qty: 1, who: 'Order #AM-1025', reason: 'Customer return to stock' }
    ]
  },
  {
    id: 3,
    name: 'LED Desk Lamp',
    variant: 'Matte Black',
    sku: 'DL-003',
    thumb: 'thumbLamp',
    committed: 2,
    available: 8,
    history: [
      { date: 'Apr 28, 04:12 PM', type: 'Sale', qty: -2, who: 'Order #AM-1040', reason: 'Customer purchase' },
      { date: 'Apr 21, 10:00 AM', type: 'Restock', qty: 10, who: 'Ameza Official', reason: 'Batch reorder' }
    ]
  },
  {
    id: 4,
    name: 'Classic Cotton T-Shirt',
    variant: 'Navy Blue / L',
    sku: 'TS-004',
    thumb: 'thumbTshirt',
    committed: 0,
    available: 50,
    history: [
      { date: 'Apr 26, 12:05 PM', type: 'Sale', qty: -1, who: 'Order #AM-1035', reason: 'Customer purchase' },
      { date: 'Apr 25, 08:30 AM', type: 'Restock', qty: 50, who: 'Ameza Official', reason: 'Initial inventory' }
    ]
  },
  {
    id: 5,
    name: 'Running Shoes',
    variant: 'Grey / 42 EU',
    sku: 'RS-005',
    thumb: 'thumbShoes',
    committed: 2,
    available: 5,
    history: [
      { date: 'Apr 28, 06:32 PM', type: 'Sale', qty: -1, who: 'Order #AM-1040', reason: 'Customer purchase' },
      { date: 'Apr 23, 02:40 PM', type: 'Adjustment', qty: -2, who: 'Ameza Official', reason: 'Correction' }
    ]
  },
  {
    id: 6,
    name: 'Travel Backpack',
    variant: 'Charcoal Black',
    sku: 'BP-006',
    thumb: 'thumbBackpack',
    committed: 4,
    available: 15,
    history: [
      { date: 'Apr 28, 02:11 PM', type: 'Sale', qty: -1, who: 'Order #AM-1039', reason: 'Customer purchase' },
      { date: 'Apr 25, 03:28 PM', type: 'Sale', qty: -1, who: 'Order #AM-1033', reason: 'Customer purchase' },
      { date: 'Apr 18, 11:15 AM', type: 'Restock', qty: 20, who: 'Ameza Official', reason: 'Shipment received' }
    ]
  },
  {
    id: 7,
    name: 'Smart Watch',
    variant: 'Midnight Black',
    sku: 'SW-007',
    thumb: 'thumbWatch',
    committed: 1,
    available: 0,
    history: [
      { date: 'Apr 29, 09:17 AM', type: 'Sale', qty: -1, who: 'Order #AM-1041', reason: 'Customer purchase' },
      { date: 'Apr 27, 04:30 PM', type: 'Sale', qty: -3, who: 'Order #AM-1036', reason: 'Stock exhausted' }
    ]
  },
  {
    id: 8,
    name: 'Insulated Water Bottle',
    variant: 'Olive Green / 750ml',
    sku: 'WB-008',
    thumb: 'thumbBottle',
    committed: 0,
    available: 0,
    history: [
      { date: 'Apr 27, 11:45 AM', type: 'Adjustment', qty: -5, who: 'Ameza Official', reason: 'Supplier quality hold' }
    ]
  },
  {
    id: 9,
    name: 'Wireless Headphones',
    variant: 'White / Pro',
    sku: 'WH-001',
    thumb: 'thumbHeadphones',
    committed: 2,
    available: 6,
    history: [
      { date: 'Apr 29, 10:24 AM', type: 'Sale', qty: -1, who: 'Order #AM-1042', reason: 'Customer purchase' },
      { date: 'Apr 22, 11:00 AM', type: 'Restock', qty: 10, who: 'Ameza Official', reason: 'Inbound delivery' }
    ]
  },
  {
    id: 10,
    name: 'Ergonomic Laptop Stand',
    variant: 'Silver Aluminium',
    sku: 'LS-003',
    thumb: 'thumbLamp',
    committed: 0,
    available: 0,
    history: [
      { date: 'Apr 20, 10:30 AM', type: 'Sale', qty: -4, who: 'Store order batch', reason: 'Sold out' }
    ]
  }
];

export function getInventory() {
  try {
    const stored = localStorage.getItem('ameza_inventory_data');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed reading inventory from localStorage', e);
  }
  return [...INITIAL_INVENTORY];
}

export function saveInventory(inventory) {
  try {
    localStorage.setItem('ameza_inventory_data', JSON.stringify(inventory));
  } catch (e) {
    console.error('Failed saving inventory to localStorage', e);
  }
}

export function getLowStockThreshold() {
  try {
    const val = localStorage.getItem('ameza_low_stock_threshold');
    if (val !== null && !isNaN(Number(val))) return Number(val);
  } catch (e) {}
  return 10;
}

export function saveLowStockThreshold(val) {
  try {
    localStorage.setItem('ameza_low_stock_threshold', String(val));
  } catch (e) {}
}


