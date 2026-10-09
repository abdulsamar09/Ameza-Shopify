# AMEZA Authentication, Roles & Security Model

This document outlines the identity system, Role-Based Access Control (RBAC), security guards, session lifecycles, and pre-seeded demo accounts.

---

## 1. Roles & Permissions Hierarchy

AMEZA defines 4 primary authorization roles:

| Role | Scope | Default Dashboard | Permitted Actions |
|---|---|---|---|
| **Public / Guest** | Storefront & Travel | `/index.html` | Browsing catalog, viewing reviews, adding to cart, searching travel. |
| **Buyer** | Consumer Portal | `/buyer/index.html` | Order tracking, payment methods, shipping addresses, return requests. |
| **Seller** | Merchant Central | `/seller/index.html` | Product cataloging, order fulfillment, shipping rate setup, coupons, review replies. |
| **Admin / Staff** | Super Admin Console | `/admin/index.html` | Vendor verification, content moderation, dispute arbitration, financial ledgers. |

---

## 2. Session Lifecycle & Storage Keys

Session state is managed uniformly by `shared/js/core/session.js`:

- **Primary Session Key**: `ameza_session` (stores JSON object: `{ id, email, name, role, token, avatar }`)
- **Auth Token Key**: `ameza_auth_token` (cryptographic bearer token string)
- **Two-Factor Key**: `ameza_2fa_pending` (temporary verification state during MFA challenges)
- **Event Bus Notification**: When session changes occur, a custom DOM event `ameza:session-change` is fired globally.

---

## 3. Client-Side Route Guards (`shared/js/core/access.js`)

Access control is enforced automatically on DOM initialization by inspecting the `data-access` attribute of `<body data-access="...">`:

- `public`: Unrestricted. Allows all visitors.
- `buyer`: Requires `role === 'buyer'`, `'seller'`, or `'admin'`. Guests are redirected to `/auth/login.html?return=<current_path>`.
- `seller`: Requires `role === 'seller'` or `'admin'`. Non-sellers are redirected to `/seller/onboarding/sell-with-us.html`.
- `admin` / `staff`: Requires `role === 'admin'` or `'staff'`. Unauthorized users are redirected to `/admin/index.html` or forbidden.

---

## 4. Pre-Seeded Demo Accounts (Development & QA Only)

For rapid visual review, testing, and automated evaluation, the following pre-configured credentials are available:

| Account Type | Email | Password | Role | Features Accessible |
|---|---|---|---|---|
| **Buyer Demo** | `sarah.jenkins@example.com` | `Pass123!` | `buyer` | Order history, Saved addresses, Wishlist |
| **Seller Demo** | `merchant@austinleather.com` | `Seller123!` | `seller` | Artisan leather store, 15 active orders, Returns hub |
| **Super Admin** | `admin@ameza.com` | `Admin2026!` | `admin` | Full platform oversight, Finance, Moderation |

> [!NOTE]
> All credentials above are strictly intended for local mock demonstrations. In production, password authentication will use bcrypt hashing with salted rounds managed by the backend identity provider.
