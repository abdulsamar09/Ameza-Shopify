# AMEZA Engineering Changelog

This document logs significant architectural milestones, feature additions, and compliance improvements across all phases of development.

---

## [Phase 6] - Architecture Restructure, Clean Routing & Documentation (Current)
### Added
- Created complete documentation suite in `docs/` (`README.md`, `ARCHITECTURE.md`, `ROUTES.md`, `DATA_MODEL.md`, `API_CONTRACT.md`, `DESIGN_SYSTEM.md`, `BUYER_GUIDE.md`, `SELLER_GUIDE.md`, `ADMIN_GUIDE.md`, `QA_CHECKLIST.md`, `DEPLOYMENT.md`, `BACKEND_MIGRATION.md`).
- Automated route catalog generator `scripts/gen_routes.js` indexing 118 page endpoints.
- `.vercelignore` excluding `_trash/` and development utilities from production deployments.
- Implemented `_trash/` archive rule with sub-path preservation, 404 security block in `server.js`, and `_trash/MANIFEST.md` audit register.
- Clean URL rewrites (`/shop`, `/cart`, `/checkout`, `/login`, `/signup`, `/seller`, `/admin`, `/buyer`) and 301 redirect map in `server.js` and `vercel.json`.

### Fixed
- Replaced "Stays" with "AMEZA Hotels" across all travel navigation bars, dark sub-navigation pills, and layout modules.
- Bulletproofed travel suite stylesheets and introduced inline logo containment to prevent unstyled logo stretching.

---

## [Phase 5] - Seller Central Suite (Returns, Discounts, Shipping, Reviews)
### Added
- Complete Returns Hub (`seller/returns.html` + `js/returns.js`) with two-pane layout, photo lightbox, conversation composer, and ledger earnings impact.
- Discounts & Coupons Manager (`seller/discounts.html`, `seller/create-discount.html` + `js/discounts.js`) with dynamic status, bulk actions, and CSV export.
- Shipping Profiles Matrix (`seller/shipping.html` + `js/shipping.js`) with US zone rates, handling time radios, and free shipping progress bar.
- Customer Reviews Hub (`seller/reviews.html` + `js/reviews.js`) with rating distribution bars, verified purchaser badges, and inline reply composer with 500-char counter.
- Headless visual testing runner `scripts/test_seller_suite.js` capturing screenshots across 5 viewports.

---

## [Phase 4] - Multi-Vendor Splitting & Ledger Accounting
### Added
- Minor-unit integer cents equilibrium invariant across 85 orders.
- Automated multi-vendor order splitting engine decomposing orders into sub-orders by merchant.
- Snapshotted commission calculation with immutable double-entry ledger bookkeeping.
- Simulated payment failure guards with zero-cart-loss recovery.

---

## [Phase 3] - Unified Layout Engine & Design System
### Added
- Centralized `js/core/layout.js` mounting universal header, drawer, announcement bar, and footer.
- Removed fragmented, copy-pasted headers and eliminated legacy demo bar.
- Token standardization in `css/tokens.css` locking light color-scheme against mobile dark mode inversion.

---

## [Phase 2] - Travel Suite Integration
### Added
- Complete booking engine for AMEZA Hotels, Flights, Car Rental, Attractions, and Airport Transfers.
- Dedicated interactive voucher modals and active reservations state viewer.

---

## [Phase 1] - Initial Marketplace Setup
### Added
- Product catalog schema, customer auth simulation, cart store, and basic storefront pages.
