# AMEZA Super Admin Console & Governance Guide

This guide describes platform oversight, vendor compliance verification, catalog moderation, dispute resolution, and immutable audit logs within the **Super Admin Console** (`/admin/`).

---

## 1. Executive KPI Dashboard (`/admin/index.html`)

- **Gross Marketplace Volume (GMV)**: Cumulative sales total computed across all orders in integer cents.
- **Platform Net Commission**: Snapshotted platform revenue earned from sub-orders.
- **Active Merchants & Verified Vendors**: Real-time count of domestic sellers.
- **Pending Dispute Count**: Flagged returns and customer escalations requiring admin intervention.

---

## 2. Merchant Approval & Compliance (`/admin/index.html`)

1. Review pending vendor submissions under **Seller Verification**.
2. Validate U.S. EIN, business address, and banking verification status.
3. Actions: **Approve Merchant** or **Request Additional Documentation**.

---

## 3. Product Catalog Moderation (`/admin/products.html`)

1. Review flagged products or user-reported reviews.
2. Filter by status: `Under Review`, `Approved`, `Suspended`.
3. Actions: Take down counterfeit or prohibited items; restore compliant listings.

---

## 4. Immutable Audit Trail (`/admin/audit.html`)

1. Every administrative action, balance adjustment, and role change is permanently recorded.
2. Filter audit logs by **Actor**, **Target ID**, **Action Type**, and **Timestamp**.
3. All audit entries are strictly append-only and cryptographically sequenced.
