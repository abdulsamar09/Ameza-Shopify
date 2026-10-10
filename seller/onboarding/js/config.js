/**
 * AMEZA Seller Onboarding - Landing Page Configuration
 * All text, statistics, commission rates, and FAQs are managed here.
 * USA Standard: USD currency, U.S. national coverage, ACH/PayPal payouts, IRS 1099-K note.
 */

// ============================================================================
// 1. STATS (PLACEHOLDER VALUES - REPLACE WITH REAL NUMBERS BEFORE LAUNCH)
// ============================================================================
export const STATS_CONFIG = [
  {
    icon: 'store',
    targetNumber: 10000,
    displayNumber: '10,000+',
    label: 'Active U.S. Sellers'
  },
  {
    icon: 'cart',
    targetNumber: 2000000,
    displayNumber: '2M+',
    label: 'Monthly Shoppers'
  },
  {
    icon: 'box',
    targetNumber: 5000000,
    displayNumber: '5M+',
    label: 'Products Sold'
  },
  {
    icon: 'star',
    targetNumber: 4.8,
    displayNumber: '4.8/5',
    label: 'Seller Satisfaction'
  }
];

// ============================================================================
// 2. HOW IT WORKS (4 Simple Steps)
// ============================================================================
export const STEPS_CONFIG = [
  {
    step: 1,
    icon: 'user-plus',
    title: 'Create your account',
    description: 'Sign up with your business or personal email to get started.'
  },
  {
    step: 2,
    icon: 'store',
    title: 'Set up your store',
    description: 'Add your store name, brand details, and U.S. shipping profile.'
  },
  {
    step: 3,
    icon: 'cloud-arrow-up',
    title: 'Upload products',
    description: 'List your items with USD prices and manage inventory levels.'
  },
  {
    step: 4,
    icon: 'rocket',
    title: 'Start selling',
    description: 'Complete quick identity & W-9 verification to start selling across the U.S.'
  }
];

// ============================================================================
// 3. WHY SELL ON AMEZA (8 Feature Cards)
// ============================================================================
export const FEATURES_CONFIG = [
  {
    icon: 'percent',
    title: 'Low Commission',
    description: 'Keep more of what you earn with competitive rates starting at 8%.'
  },
  {
    icon: 'flag-usa',
    title: 'Nationwide Reach',
    description: 'Sell to shoppers across all 50 states and U.S. territories.'
  },
  {
    icon: 'shield-check',
    title: 'Secure Payouts',
    description: 'Receive automated ACH direct deposits or PayPal payouts on time.'
  },
  {
    icon: 'bullhorn',
    title: 'Marketing Support',
    description: 'Get featured in curated collections and seasonal campaigns.'
  },
  {
    icon: 'cubes',
    title: 'Easy Inventory Management',
    description: 'Track your stock and multi-vendor orders all in one place.'
  },
  {
    icon: 'headset',
    title: 'Dedicated Seller Support',
    description: 'Our U.S.-based team is available Mon-Fri, 9 AM to 6 PM ET.'
  },
  {
    icon: 'truck-fast',
    title: 'Integrated Carrier Labels',
    description: 'Print discounted labels with USPS, UPS, and FedEx.'
  },
  {
    icon: 'arrow-trend-up',
    title: 'Grow Your Brand',
    description: 'Build your reputation with verified buyer reviews and analytics.'
  }
];

// ============================================================================
// 4. COMMISSION & FEES SETTINGS
// ============================================================================
export const COMMISSION_SETTINGS = {
  defaultRate: 10,
  showPromoRibbon: false,
  promoText: '0% commission for your first 30 days',
  categories: [
    { category: 'Fashion & Apparel', rate: 12 },
    { category: 'Electronics', rate: 8 },
    { category: 'Home & Living', rate: 10 },
    { category: 'Beauty & Personal Care', rate: 12 },
    { category: 'Sports & Outdoors', rate: 10 },
    { category: 'Other Categories', rate: 10 }
  ]
};

// ============================================================================
// 5. TESTIMONIALS (SAMPLE TESTIMONIALS - REPLACE WITH REAL ONES BEFORE LAUNCH)
// ============================================================================
export const TESTIMONIALS_CONFIG = [
  {
    initial: 'S',
    color: '#7FB73C',
    name: 'Sarah Jenkins',
    business: 'Austin Leather Co · Austin, TX',
    quote: 'AMEZA made it effortless to expand our handcrafted leather goods brand across the U.S. The dashboard is intuitive and payouts are always on time.',
    stars: 5
  },
  {
    initial: 'M',
    color: '#6CA030',
    name: 'Michael Cooper',
    business: 'Pacific Coastal Living · Los Angeles, CA',
    quote: 'We saw a 3x increase in orders within 90 days of listing on AMEZA. The seller analytics and USPS shipping integrations save us hours every week.',
    stars: 5
  },
  {
    initial: 'E',
    color: '#4B7A1B',
    name: 'Emily Carter',
    business: 'Portland Artisan Goods · Portland, OR',
    quote: 'Fair commission rates, transparent reporting, and reliable ACH payouts make AMEZA our favorite marketplace partner.',
    stars: 5
  }
];

// ============================================================================
// 6. FREQUENTLY ASKED QUESTIONS (FAQ)
// ============================================================================
export const FAQ_CONFIG = [
  {
    question: 'Is there a signup fee to become a seller?',
    answer: 'No, creating an AMEZA seller account and listing your products is completely free with zero setup fees or monthly subscription charges. You only pay a competitive commission when you make a sale.'
  },
  {
    question: 'How and when do I get paid?',
    answer: 'Seller earnings are disbursed directly into your verified U.S. bank account via ACH direct deposit or PayPal. Payouts follow a standard 7-day holding period for buyer delivery confirmation with a low $50 minimum threshold.'
  },
  {
    question: 'Where can I ship products?',
    answer: 'AMEZA operates across all 50 U.S. states and territories. Sellers can offer standard ground, express, and overnight shipping via USPS, UPS, and FedEx with automated tracking.'
  },
  {
    question: 'What tax information is required (W-9 / 1099-K)?',
    answer: 'All U.S. sellers must provide basic taxpayer identification (SSN last 4 or EIN) through our secure W-9 verification step. AMEZA provides annual IRS Form 1099-K reporting in accordance with federal tax regulations. Please confirm reporting details with your tax advisor.'
  },
  {
    question: 'How long does application review take?',
    answer: 'Store applications are reviewed by our compliance team within 1 to 2 business days. Once your identity and store information are verified, your storefront is instantly activated.'
  }
];

// Helper: Escape HTML strings to prevent XSS (from core utils)
import { escapeHTML } from '/shared/js/core/utils.js';
export { escapeHTML };
