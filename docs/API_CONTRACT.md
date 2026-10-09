# AMEZA API Client Contract & REST Migration Mapping

This document catalogs every client method in `shared/js/api/*.js`, specifying function parameters, return payloads, and the corresponding future REST endpoint.

---

## 1. Authentication API (`shared/js/api/auth.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `login(email, password)` | `{ email, password }` | `{ success, user, token }` | `POST /api/v1/auth/login` |
| `register(details)` | `{ email, password, name, role }` | `{ success, user }` | `POST /api/v1/auth/register` |
| `verify2FA(email, code)` | `{ email, code }` | `{ success, valid }` | `POST /api/v1/auth/2fa/verify` |
| `requestPasswordReset(email)` | `email: string` | `{ success, message }` | `POST /api/v1/auth/password/reset-request` |

---

## 2. Catalog & Products API (`shared/js/api/catalog.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `getProducts(filters)` | `{ category?, vendorId?, sort?, query? }` | `Product[]` | `GET /api/v1/products` |
| `getProductById(id)` | `id: string` | `Product` | `GET /api/v1/products/:id` |
| `decrementStock(items)` | `Array<{ productId, qty }>` | `{ success, stockLevels }` | `POST /api/v1/products/stock/decrement` |

---

## 3. Orders & Checkout API (`shared/js/api/orders.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `createOrder(payload)` | `{ items, shippingAddress, paymentMethod, couponCode? }` | `{ order, subOrders }` | `POST /api/v1/orders/checkout` |
| `getOrderById(orderId)` | `orderId: string` | `ParentOrder` | `GET /api/v1/orders/:orderId` |
| `getSellerOrders(vendorId)` | `vendorId: string` | `SubOrder[]` | `GET /api/v1/sellers/:vendorId/orders` |
| `updateFulfillmentStatus(subOrderId, status, trackingNumber)` | `{ subOrderId, status, trackingNumber }` | `{ success, subOrder }` | `PATCH /api/v1/sub-orders/:id/fulfill` |

---

## 4. Ledger & Accounting API (`shared/js/api/ledger.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `getVendorBalance(vendorId)` | `vendorId: string` | `{ pendingCents, availableCents, paidOutCents }` | `GET /api/v1/sellers/:vendorId/balance` |
| `getLedgerEntries(vendorId)` | `vendorId: string` | `LedgerEntry[]` | `GET /api/v1/sellers/:vendorId/ledger` |
| `requestPayout(vendorId, amountCents)` | `{ vendorId, amountCents }` | `{ success, payoutId }` | `POST /api/v1/sellers/:vendorId/payouts` |

---

## 5. Returns & Disputes API (`shared/js/api/returns.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `getReturns(vendorId, status?)` | `{ vendorId, status? }` | `ReturnRequest[]` | `GET /api/v1/sellers/:vendorId/returns` |
| `approveReturn(returnId)` | `returnId: string` | `{ success, returnRequest }` | `POST /api/v1/returns/:id/approve` |
| `rejectReturn(returnId, reason)` | `{ returnId, reason }` | `{ success, returnRequest }` | `POST /api/v1/returns/:id/reject` |
| `escalateToPlatform(returnId, note)` | `{ returnId, note }` | `{ success, returnRequest }` | `POST /api/v1/returns/:id/escalate` |

---

## 6. Super Admin API (`shared/js/api/admin.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `getDashboardMetrics()` | `none` | `{ grossSalesCents, commissionCents, orders, sellers }` | `GET /api/v1/admin/metrics` |
| `getPendingSellers()` | `none` | `Vendor[]` | `GET /api/v1/admin/sellers/pending` |
| `updateSellerStatus(sellerId, status)` | `{ sellerId, status }` | `{ success, vendor }` | `PATCH /api/v1/admin/sellers/:id/status` |

---

## 7. Transactional Mailer API (`shared/js/api/mailer.api.js`)

| Client Method | Parameters | Return Value | Future REST Endpoint |
|---|---|---|---|
| `sendMail({ to, subject, body })` | `{ to, subject, body }` | `{ success, messageId }` | `POST /api/v1/mailer/send` |
| `sendPasswordReset(email, code)` | `{ email, code }` | `{ success, messageId }` | `POST /api/v1/mailer/password-reset` |
| `sendTwoFactorCode(email, code)` | `{ email, code }` | `{ success, messageId }` | `POST /api/v1/mailer/2fa-code` |
| `sendOrderConfirmation(email, order)` | `{ email, order }` | `{ success, messageId }` | `POST /api/v1/mailer/order-confirm` |
