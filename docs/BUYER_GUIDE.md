# AMEZA Buyer Experience & Shopper Guide

This guide walks through the customer purchasing journey on AMEZA, from product discovery to multi-vendor checkout and post-purchase tracking.

---

## 1. Catalog Discovery & Search

1. **Browse Categories**: Navigate to `/storefront/shop.html` or choose specific categories (Clothing, Electronics, Luxury Watches, Leather Goods).
2. **Filter & Sort**: Use price range sliders, in-stock toggles, and rating filters.
3. **Product Detail View (`/storefront/product.html`)**:
   - Inspect high-resolution product imagery and zoom previews.
   - Verify domestic merchant identity (e.g. *Austin Leather Co &bull; Austin, TX*).
   - Read customer reviews and verified purchaser badges.

---

## 2. Cart Management & Drawer (`/storefront/cart.html`)

1. Click **Add to Cart** on any product card or detail screen.
2. The dynamic Cart Drawer slides in from the right:
   - Displays line items with unit integer cents prices.
   - Live shipping progress bar showing progress toward free shipping threshold.
   - Real-time quantity adjustment with stock oversell protection.

---

## 3. Multi-Vendor Checkout (`/storefront/checkout.html`)

1. **Address Entry**: Input standard U.S. domestic address (Street, City, State, ZIP code).
2. **Sales Tax Calculation**: Automatically applies correct state sales tax (e.g., Texas 6.25%).
3. **Split Shipment Breakdown**:
   - Cart automatically splits items by merchant.
   - Independent shipping rates calculated per vendor profile.
4. **Order Confirmation (`/storefront/order-confirmation.html`)**:
   - Generates Parent Order #ORD-XXXX.
   - Assigns distinct USPS domestic tracking numbers per sub-order.

---

## 4. Buyer Self-Service Portal (`/buyer/`)

- **Order History (`/buyer/orders.html`)**: Track shipment status and view printable invoice receipts.
- **Saved Addresses (`/buyer/addresses.html`)**: Manage default billing and domestic delivery addresses.
- **Returns & Exchanges (`/buyer/index.html`)**: Initiate return requests with photo upload within 14 days of delivery.
