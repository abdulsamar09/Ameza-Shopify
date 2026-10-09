# AMEZA Directory Structure & Code Standards

This document establishes the official filesystem layout, naming conventions, and modularity guidelines for the AMEZA codebase.

---

## 1. Directory Tree

```
ameza/
|-- index.html                     storefront home (stays at root for "/" HTTP root route)
|-- server.js                      local Node.js HTTP server (handles 301 redirects, clean URLs & blocks _trash/)
|-- package.json                   NPM dependencies and automated test scripts
|-- vercel.json                    Vercel deployment configuration (301 redirects, clean URL rewrites)
|-- .vercelignore                  excludes _trash/, .git, and local dev tools from cloud builds
|-- .env.example                   sample environment variables for future backend integrations
|-- README.md                      project repository introduction and setup notes
|-- storefront/                    public shop (buyer-facing, no login required)
|   |-- shop.html, product.html, category.html, subcategory.html, tag.html, seller-store.html, stores.html
|   |-- cart.html, checkout.html, order-confirmation.html, wishlist.html
|   |-- css/                       storefront.css, home.css, product.css, shop.css, store.css, cart.css, checkout.css, cart-drawer.css
|   `-- js/                        pages/ (controllers) & components/ (product-card.js, quick-view.js, cart-drawer.js)
|-- travel/                        travel suite (hotels, flights, cars, attractions, airport taxis)
|   |-- stays.html, stays-search.html, flights.html, car-rental.html, attractions.html, airport-taxis.html
|   |-- css/                       travel.css
|   `-- js/                        travel-engine.js, travel-searchbox.js, flights-data.js, flight-api-service.js, booking-cars-api.js
|-- auth/                          authentication portal
|   |-- login.html, signup.html, forgot-password.html, reset-password.html, verify-email.html
|   |-- css/                       auth.css
|   `-- js/                        pages/ (controllers for login, registration, recovery, verification)
|-- buyer/                         customer dashboard
|   |-- index.html, orders.html, order-detail.html, wishlist.html, addresses.html, profile.html, security.html
|   |-- css/                       account.css
|   `-- js/                        pages/ (dashboard UI, address editor, profile updates)
|-- seller/                        merchant dashboard (Seller Central)
|   |-- index.html, orders.html, order-detail.html, products.html, add-product.html, inventory.html, returns.html, reviews.html, messages.html, earnings.html, payouts.html, discounts.html, create-discount.html, shipping.html, analytics.html, settings.html
|   |-- onboarding/                sell-with-us.html, apply.html
|   |-- css/                       dashboard.css, seller.css
|   `-- js/                        pages/ (controllers for inventory, returns hub, shipping rates, reviews)
|-- admin/                         platform super admin dashboard
|   |-- index.html, categories.html, content.html, finance.html, products.html, settings.html, audit.html
|   |-- css/                       dashboard.css
|   `-- js/                        pages/ (controllers for moderation, commission settings, audit trail)
|-- legal/                         public regulatory policies
|   `-- terms.html, privacy.html, shipping-policy.html, returns-policy.html, seller-agreement.html, accessibility.html
|-- shared/                        universal foundation layer
|   |-- css/                       tokens.css, base.css, components.css, layout.css, dashboard.css, travel.css
|   |-- js/core/                   layout.js, shell.js, utils.js, session.js, access.js, cart-store.js, pricing.js, back-to-top.js, us.js, currency.js
|   |-- js/api/                    client.js, auth.api.js, catalog.api.js, cart.api.js, orders.api.js, seller.api.js, admin.api.js, audit.api.js, returns.api.js, mailer.api.js
|   `-- data/                      mock/*.json, tax_rates.json
|-- assets/                        visual brand assets
|   |-- brand/                     ameza-logo.svg, ameza-logo.png, logo.png
|   `-- products/, categories/, icons/, banners/
|-- docs/                          engineering and operator documentation
|-- tests/                         test suites (`test_*.js`, invariant checks, pricing verification)
|-- scripts/                       developer automation tools (`gen_routes.js`, `check_usa.js`, `seed_catalog.js`)
|-- dev/                           test harnesses and developer consoles (`ui-kit.html`, `selftest.html`, `prototype-index.html`, `mail-outbox.html`)
`-- _trash/                        retired file archive with MANIFEST.md (blocked by server.js, excluded on Vercel)
```

---

## 2. Naming & Code Rules

1. **Files & Folders**: Strictly `kebab-case`. Never use uppercase or spaces in filenames.
2. **Page Architecture**: 
   - One HTML file = One controller module: `<area>/js/pages/<page>.js`.
   - No inline JavaScript logic or `<style>` blocks in production pages (only `<script type="module" src="...">`).
3. **Module Standards**:
   - Native ES modules (`import`/`export`).
   - Every module imports shared utilities from `/shared/js/...`.
   - Zero global window pollutions. The single permissible debug namespace is `window.Ameza`.
4. **CSS Scoping**:
   - Design tokens originate exclusively from `shared/css/tokens.css`.
   - Area CSS is scoped under its body root class: `body.buyer`, `body.seller`, `body.admin`, `body.store`.
5. **Body Metadata Invariant**:
   Every HTML document must declare:
   ```html
   <body data-layout="storefront|focus|dashboard|travel|none" data-access="public|buyer|seller|staff|admin" data-area="...">
   ```
