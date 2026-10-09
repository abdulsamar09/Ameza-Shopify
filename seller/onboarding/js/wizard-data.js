/**
 * AMEZA Store Application Wizard - Data Definitions & Mock Catalogs
 * USA Standard: U.S. only at launch, ACH major banks, U.S. Marketplace Agreement.
 */

export const SITE_DOMAIN = '.ameza.com';

export const RESERVED_SLUGS = [
  'admin', 'ameza', 'shop', 'store', 'official', 'api', 'app', 'dashboard',
  'account', 'support', 'help', 'marketplace', 'auth', 'login', 'signup',
  'root', 'billing', 'finance', 'system', 'seller'
];

export const MOCK_CATEGORIES = [
  { id: 'fashion', name: 'Fashion & Apparel' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'home', name: 'Home & Living' },
  { id: 'beauty', name: 'Beauty & Personal Care' },
  { id: 'electronics', name: 'Electronics & Audio' },
  { id: 'leather', name: 'Handcrafted Leather Goods' },
  { id: 'bags', name: 'Bags & Totes' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'watches', name: 'Watches & Jewelry' },
  { id: 'art', name: 'Art & Collectibles' }
];

export const COUNTRIES_LIST = [
  { code: 'US', name: 'United States', flag: '🇺🇸' }
];

export const US_MAJOR_BANKS = [
  'JPMorgan Chase',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'U.S. Bank',
  'PNC Bank',
  'Capital One',
  'TD Bank',
  'Truist Financial',
  'Charles Schwab',
  'Fifth Third Bank',
  'Other U.S. Commercial Bank'
];

export const SELLER_AGREEMENT_TEXT = `
AMEZA MARKETPLACE SELLER AGREEMENT (v1.0 - 2026)
AMEZA Marketplace Inc. · 123 Main Street, Austin, TX 78701

1. INTRODUCTION & ELIGIBILITY
Welcome to AMEZA Marketplace. By submitting a seller application on AMEZA, you agree to be bound by the terms and conditions outlined in this Seller Agreement, our U.S. Merchant Guidelines, and Platform Commission Schedule. This document constitutes a legally binding agreement between your business entity and AMEZA Marketplace Inc.

2. SELLER COMMITMENT & PRODUCT AUTHENTICITY
You represent and warrant that all goods listed through your store are 100% genuine, authentic, and compliant with all applicable U.S. federal, state, and local laws and consumer safety standards (including CPSC regulations). Counterfeit, trademark-infringing, or unauthorized items are strictly prohibited and will result in immediate termination, reporting, and forfeiture of unsettled balances.

3. COMMISSIONS & PAYOUT DISBURSEMENT
AMEZA retains an agreed category-specific commission (standard 8% - 12%) on all completed item sub-totals. Shipping fees collected from customers are credited 100% to your seller ledger without platform deductions. Payouts are transferred in U.S. Dollars (USD) via ACH direct deposit or PayPal with a standard 7-calendar-day settlement holding period and a $50.00 minimum payout threshold.

4. TAX COMPLIANCE & FORM 1099-K
Sellers must provide accurate taxpayer identification (SSN last 4 or EIN) and submit an electronic Form W-9 prior to disbursement. AMEZA Marketplace Inc. complies with IRS regulations regarding Form 1099-K annual merchant reporting. Sellers are solely responsible for consulting with a qualified tax advisor regarding their sales and income tax obligations.

5. FULFILLMENT & SHIPPING SLA
Confirmed orders must be processed and handed over to an approved domestic carrier (USPS, UPS, or FedEx) within 2 business days of order receipt. All shipments must include valid carrier tracking. Failure to adhere to shipping SLAs may result in seller performance penalties.

6. RETURNS POLICY & BUYER PROTECTION
Sellers agree to honor the AMEZA 30-Day Customer Return Guarantee for eligible unused items in accordance with the Platform Returns Policy.

7. DATA PRIVACY & COMPLIANCE
Seller business credentials, banking details, and identification records are encrypted and held strictly confidential in accordance with the AMEZA Privacy Policy.
`;
