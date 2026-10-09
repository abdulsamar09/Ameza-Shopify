# AMEZA Quality Assurance & Acceptance Testing Checklist

This document details the automated test suites, manual verification protocols, and responsive viewport criteria.

---

## 1. Automated Test Suite (100% Pass Required)

Run `npm test` before any deployment. All tests must exit with code 0:

- [x] **Invariant 1: Split & Ledger Minor-Unit Equilibrium**
  - Confirms $\text{Subtotal} + \text{Shipping} == \text{Net Earnings} + \text{Commission}$ across all orders.
- [x] **Invariant 2: Coupon Rounding Invariant**
  - Validates exact integer cents deductions (no fractional floating-point cents).
- [x] **Invariant 3: Ledger Double-Entry Buckets**
  - Asserts non-negative `pendingBalance`, `availableBalance`, and valid `paidOutTotal`.
- [x] **Invariant 4: Stock Oversell Guard**
  - Rejects checkout when requested quantity exceeds inventory level.
- [x] **Invariant 5: Multi-Tenant Vendor Isolation**
  - Verifies distinct merchant IDs, separate EINs, and isolated banking records.
- [x] **Invariant 6: Staff RBAC Permission Restriction**
  - Enforces permission guards across Finance, Catalog, and Settings screens.
- [x] **Invariant 7: XSS Sanitization Probes**
  - Confirms HTML entity escaping across dynamic user input.
- [x] **Invariant 8: U.S. Localization Invariant**
  - `node scripts/check_usa.js` verifies 0 banned foreign currency, tax, or platform terms across 400+ files.

---

## 2. Responsive Viewport Audits (Headless Chrome & Browser)

Verify with `node scripts/test_seller_suite.js` across all 5 standard viewports:

| Viewport | Test Criteria | Expected Pass Behavior |
|---|---|---|
| **1440px** | Wide Desktop | Multi-column layouts, full sidebars, zero element overflow. |
| **1024px** | Tablet Landscape | 3-column product cards, sticky summary card positioned cleanly. |
| **768px** | Tablet Portrait | Data tables convert into readable stacked cards; sidebar collapses to drawer. |
| **390px** | Modern Mobile | Touch targets $\ge$ 44px, body text $\ge$ 14px, inputs 16px (no iOS zoom). |
| **360px** | Compact Mobile | Zero horizontal scrolling (`scrollWidth == clientWidth`), modal dialogs full-screen. |

---

## 3. End-to-End User Flow Scenarios

1. **Buyer Purchase Flow**:
   - Storefront &rarr; Add to Cart &rarr; Cart Drawer &rarr; Checkout &rarr; Order Confirmation &rarr; Buyer Orders view.
2. **Seller Fulfillment Flow**:
   - Order Notification &rarr; Sub-order review &rarr; Assign USPS tracking &rarr; Mark as Shipped &rarr; Ledger update.
3. **Returns Lifecycle Flow**:
   - Customer return request &rarr; Seller photo review &rarr; Partial or full refund calculation &rarr; Escalate to Admin.
4. **Travel Booking Flow**:
   - Explore Services &rarr; Select AMEZA Hotels / Car Rental &rarr; Dates & Vehicle selection &rarr; Voucher generation.
