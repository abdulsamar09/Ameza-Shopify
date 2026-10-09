# AMEZA Merchant Central & Seller Operations Guide

This guide details merchant onboarding, order fulfillment, shipping matrix configuration, coupon promotions, review replies, and returns processing in **Seller Central**.

---

## 1. Merchant Onboarding & Application

1. Visit `/seller/onboarding/sell-with-us.html` to review fee schedules and platform terms.
2. Complete the multi-step verification form (`/seller/onboarding/apply.html`):
   - Legal business name, U.S. Employer Identification Number (EIN).
   - Domestic dispatch warehouse address.
   - Payout banking details (ACH Routing & Account Number).

---

## 2. Returns Hub (`/seller/returns.html`)

Sellers manage customer return requests through a two-pane interface:

![Returns Hub Screen](/qa-shots/seller_returns_1440px.png)

1. **Status Filtering**: Filter by 6 lifecycle states: `Requested`, `Approved`, `In Transit`, `Refunded`, `Rejected`, `Disputed`.
2. **Customer Proof Lightbox**: Click customer photo thumbnails to inspect damage claims full-screen.
3. **Ledger Impact Calculation**: The dialog shows the exact effect of restocking fees on merchant ledger earnings before confirmation.
4. **Escalation**: Disputed returns can be escalated to AMEZA platform arbitration.

---

## 3. Discounts & Coupon Manager (`/seller/discounts.html`)

Create and oversee storewide or category-specific promotional campaigns:

![Discounts Manager Screen](/qa-shots/seller_discounts_1440px.png)

1. **Computed Status**: Status is evaluated dynamically (`Active`, `Scheduled`, `Expired`, `Disabled`).
2. **Bulk Actions**: Select multiple codes to Activate, Deactivate, or Delete in bulk.
3. **Export**: One-click CSV export of coupon performance and redemption totals.
4. **Creation (`/seller/create-discount.html`)**: Interactive builder with live coupon summary card.

---

## 4. Shipping Profiles & Rates (`/seller/shipping.html`)

Configure shipping methods across U.S. regional zones:

![Shipping Profiles Screen](/qa-shots/seller_shipping_1440px.png)

1. **Profile Matrix**: Maintain separate profiles for General merchandise vs. Fragile items.
2. **Zone Rates**: Set flat rates for Contiguous U.S., Alaska & Hawaii, and U.S. Territories.
3. **Free Shipping Threshold**: Dynamic progress bar preview for customer carts.
4. **Vacation Mode**: Toggle to temporarily pause checkout purchases with an informative customer toast.

---

## 5. Reviews & Ratings Management (`/seller/reviews.html`)

Engage with verified customers and monitor sentiment:

![Reviews Hub Screen](/qa-shots/seller_reviews_1440px.png)

1. **Rating Distribution**: 5 interactive rating bars filter reviews by 1 to 5 stars.
2. **Verified Badges**: Verified purchaser badges distinguish real customer orders.
3. **Inline Replies**: Post official merchant replies with a live 500-character counter.
4. **Moderation Reporting**: Flag inappropriate or abusive feedback directly to Super Admin.
