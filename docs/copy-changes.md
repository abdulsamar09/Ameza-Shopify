# AMEZA Marketplace — U.S. Localization & Copy Changes Audit

**Document Date:** October 2026  
**Jurisdiction / Market:** United States (Federal & 50 States + DC)  
**Corporate Headquarters:** 123 Main Street, Austin, TX 78701  

---

## 1. Summary of Changes

All market-facing copy, policies, checkout workflows, currencies, legal documents, and travel suites across AMEZA have been completely converted from U.S. / American / international mock data into a unified, authentic United States marketplace.

---

## 2. Storefront & Branding Changes

| Area | Before (Non-US / Legacy) | After (U.S. Standard) |
|---|---|---|
| **Demo Bar Badge** | `🇦🇺 AMEZA DEMO` (rendered as `AU AMEZA DEMO` on Windows) | `🇺🇸 AMEZA DEMO` |
| **Demo Identities** | Austin Leather Co, Pacific Coastal Living, Portland Artisan Goods | Austin Leather Co (TX), Pacific Coastal Living (CA), Portland Artisan Goods (OR) |
| **Brand Logo** | Image with "AMEZA" sub-badge | Clean cropped vector AMEZA branding (zero AMEZA references) |
| **Top Announcement** | U.S. shipping / AU phone numbers | Free U.S. shipping on orders over $100 · 30-day returns |
| **Support Phone & Hours** | U.S. AEST times | 1-800-555-0123 · Mon–Fri, 8 AM – 8 PM ET |
| **Currency Switcher** | USD default with USD, USD, USD | USD ($) primary charge currency; display conversions: EUR, GBP, CAD, MXN, USD, JPY, INR |
| **Desktop Grid** | 4 columns on medium laptops | 5 cards per row on desktop across all catalog sections |
| **Product Card Clicks** | Quick View popup modal | Direct link to single product page (`product.html?id=...`) |
| **Cart Drawer** | Multiple disparate drawers | Single unified slide-out drawer (`cart-drawer.js`) on all pages |

---

## 3. Checkout, Shipping & Tax (U4)

- **Sales Tax:** Dynamic destination-based sales tax calculated by state from `mock/tax_rates.json` (50 states + DC).
- **Shipping Carriers:** Domestic shipping tiers via USPS Ground Advantage ($5.99 / free over $100), USPS Priority / UPS 2nd Day ($12.99), and FedEx / UPS Next Day ($24.99).
- **Address Validation:** 2-letter state codes and 5-digit US ZIP code enforcement.
- **Payment Methods:** Credit/Debit (Visa, Mastercard, Amex, Discover), PayPal Express, Apple Pay, Google Pay. All charges in USD.

---

## 4. Merchant Onboarding & Seller API (U4)

- **Tax Compliance:** Replaced U.S. EIN with U.S. EIN / SSN collection, automated W-9 certification, and IRS Form 1099-K reporting thresholds.
- **Banking / Disbursements:** Replaced Routing # with 9-digit ABA Bank Routing Number checksum validation and ACH direct deposit into U.S. checking accounts.
- **Holding Period:** 7-day reserve hold post-delivery before funds transition to Available balance.

---

## 5. Travel Suite Localization (U5)

- **Flights (`flights.html`, `js/flights-data.js`):** U.S. domestic routes (JFK, LAX, ORD, MIA, SFO, DFW, ATL, SEA, BOS, DEN) with domestic carriers (Sample Air, Demo Airways).
- **Stays (`stays.html`, `js/travel-engine.js`):** Austin, New York, San Francisco, Miami, Chicago, Los Angeles boutique stays ($89–$429/night).
- **Car Rentals (`car-rental.html`):** U.S. airport hubs, daily USD rates ($39–$119), mileage in miles, CDW coverage.
- **Attractions & Taxis (`attractions.html`, `airport-taxis.html`):** Major U.S. landmarks, fixed-rate airport transfers in USD.

---

## 6. Legal Suite (`/legal/`)

1. **`terms.html`:** Governed by the laws of the State of Texas (Travis County), Travis County jurisdiction, USD terms.
2. **`privacy.html`:** Full California Consumer Privacy Act (CCPA / CPRA) disclosures, consumer rights, cookie opt-out.
3. **`shipping-policy.html`:** USPS/UPS/FedEx carrier tiers, 48-hour handling times, APO/FPO and U.S. territory policies.
4. **`returns-policy.html`:** 30-day satisfaction guarantee, domestic return shipping labels, 3–5 business day refund processing.
5. **`seller-agreement.html`:** U.S. merchant terms, 10–15% category commissions, W-9 and 1099-K compliance, ACH terms.
6. **`accessibility.html`:** ADA Title III and WCAG 2.1 Level AA conformance statement.
