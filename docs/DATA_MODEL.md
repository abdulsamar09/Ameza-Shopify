# AMEZA Data Model & Minor-Unit Financial Invariants

This document specifies the core schema entities within `shared/data/mock/*.json` and the strict mathematical rules governing multi-vendor financial transactions.

---

## 1. Universal Financial Invariant: Integer Cents

All prices, charges, taxes, discounts, commissions, and balances across AMEZA are **strictly stored and manipulated as integer minor units (USD cents)**:

$$ \text{Price in Cents} = \text{Round}(\text{Dollars} \times 100) $$

- $59.99 is stored as `5999`
- $129.00 is stored as `12900`
- Zero fractional or floating-point cents exist in state persistence.
- Currency formatting uses `formatMoney(cents)` from `shared/js/core/pricing.js`.

---

## 2. Multi-Vendor Order Splitting & Commission Snapshots

When a customer checks out a cart containing items from multiple distinct merchants, a **Parent Order** is placed and automatically decomposed into atomic **Sub-Orders**:

```
Parent Order (e.g. #ORD-9821)
|-- Subtotal: 17997 cents ($179.97)
|-- Shipping: 599 cents ($5.99)
|-- Tax: 1125 cents ($11.25)
|-- Grand Total: 19721 cents ($197.21)
|
|-- Sub-Order 1 (Merchant: AMEZA Official)
|   |-- Items: 2x Urban Hoodie
|   |-- Subtotal: 11998 cents ($119.98)
|   |-- Snapshotted Commission Rate: 0%
|   |-- Platform Commission Debit: 0 cents ($0.00)
|   `-- Net Vendor Earnings: 11998 cents ($119.98)
|
`-- Sub-Order 2 (Merchant: Austin Leather Co)
    |-- Items: 1x Handcrafted Leather Belt
    |-- Subtotal: 5999 cents ($59.99)
    |-- Shipping: 599 cents ($5.99)
    |-- Snapshotted Commission Rate: 10%
    |-- Platform Commission Debit: 600 cents ($6.00)
    `-- Net Vendor Earnings: 5998 cents ($59.98)
```

### Equilibrium Invariant Formula:
For every vendor sub-order, equilibrium is enforced:

$$ \text{Net Earnings} = (\text{Subtotal} + \text{Shipping}) - \text{Platform Commission} $$

---

## 3. Double-Entry Immutable Ledger

Every monetary transaction generates two immutable ledger rows in `ledger_entries.json`:
1. `CREDIT` row: Vendor credited for sale and allocated shipping fees.
2. `DEBIT` row: Vendor debited for platform commission fee.

Ledger balances are calculated dynamically from historical entries into three distinct buckets:
- `pendingBalance`: Funds held during return window (e.g., 14 days).
- `availableBalance`: Cleared funds ready for payout request.
- `paidOutTotal`: Cumulative sum of disbursed merchant payouts.

---

## 4. Key Entities Schema Reference

### Product (`shared/data/mock/products.json`)
```typescript
interface Product {
  id: string;                  // e.g. "549" or "ul-1"
  vendorId: string;            // e.g. "v_ameza" or "v_austin"
  title: string;               // e.g. "Classic Leather Belt"
  slug: string;                // e.g. "classic-leather-belt"
  priceCents: number;          // strictly integer cents (e.g. 5999)
  compareAtCents?: number;     // original MSRP in cents (e.g. 7999)
  inventoryQty: number;        // available stock count (e.g. 15)
  category: string;            // e.g. "leather-belts"
  images: string[];            // asset paths (e.g. ["/assets/products/..."])
  rating: number;              // average score 1.0 - 5.0
  reviewCount: number;         // number of verified reviews
}
```

### Return Request (`shared/data/mock/returns.json`)
```typescript
interface ReturnRequest {
  id: string;                  // e.g. "RET-8841"
  orderId: string;             // parent order reference
  vendorId: string;            // merchant id
  status: "requested" | "approved" | "in_transit" | "refunded" | "rejected" | "disputed";
  refundAmountCents: number;   // calculated refund
  restockingFeeCents: number;  // optional vendor fee
  reason: string;              // return cause
  photos: string[];            // uploaded customer proof images
  history: Array<{ action: string; timestamp: string; note?: string }>;
}
```
