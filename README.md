# AMEZA | Seller Dashboard & E-Commerce Platform

A AMEZA Admin-style seller dashboard ("Home") built with pixel-perfect attention to detail using **pure HTML5, CSS3, and vanilla JavaScript (ES modules)**. No frameworks, no build step, no npm runtime dependencies.

---

## 🚀 How to Run

### Method 1: Direct File Opening (Zero Install)
You can open the dashboard directly in any modern browser without any web server:
- Double-click **`index.html`** or drag it into Chrome, Edge, Safari, or Firefox.

### Method 2: Local Static Server (Recommended for ES Modules)
If you prefer running via a local HTTP server:
```bash
# Using Node.js built-in static server
node server.js
# Then open: http://localhost:3000
```
Or with Python:
```bash
python -m http.server 3000
# Then open: http://localhost:3000
```

---

## 📁 Architecture & File Structure

```
├── index.html                 # Main Seller Dashboard ("Home")
├── seller/index.html      # Direct mirror of index.html
├── storefront.html            # Customer storefront marketplace
├── store.html                 # Public vendor store page (opened via "View my store")
│
├── css/
│   └── dashboard.css          # Design system tokens (:root & [data-theme="dark"]), layout, components
│
├── js/
│   ├── icons.js               # Clean inline SVG icon set (AMEZA Admin thin-line style)
│   ├── data.js                # Mock data (periods, metrics, charts, setup guide, orders, low stock)
│   ├── shell.js               # Reusable app shell (topbar, sidebar, search palette, bell, avatar, toasts)
│   └── home.js                # Dashboard widgets, SVG area chart, sparklines, edit mode, order selection
│
└── [Placeholder Pages]        # Reusable shell placeholder pages for all sidebar items:
    ├── orders.html, returns.html, products.html, inventory.html, reviews.html
    ├── messages.html, earnings.html, payouts.html, discounts.html, shipping.html
    └── analytics.html, settings.html
```

---

## 🎨 Design System & Specification

- **Viewport Precision**: Pixel-accurate layout at 1536px matching the reference design.
- **Top Bar (60px)**: Dark charcoal (`#1A1A1A`), AMEZA logo with green bag mark, centered search with `Ctrl K` shortcut hint, notification bell with badge (`3`), user avatar (`AO`) and store dropdown.
- **Sidebar (240px)**: Light gray with rounded active pill, thin green indicator bar (`#7FB73C`), badge counts, and bottom "View my store" link opening `store.html` in a new tab.
- **Cards**: White (`#FFFFFF`), `12px` border radius, subtle border (`#E5E7EB`), soft elevation shadow.
- **Typography**: Inter (Google Fonts with system-ui fallbacks), `#303030` primary text, `#616161` secondary.
- **Accent Green**: `#7FB73C` for charts, progress bars, logos, and positive deltas (`#2E7D32` for high-contrast text).
- **Status Badges**:
  - `Paid`: Green badge
  - `Pending`: Yellow badge
  - `Fulfilled`: Blue badge
  - `Cancelled`: Red badge
  - `Low stock`: Red badge

---

## 🧪 Comprehensive Feature Checklist

| Category | Item | Status | Verification Detail |
|---|---|:---:|---|
| **Top Bar** | AMEZA logo + green bag | ✅ | SVG mark and bold brand text rendered |
| **Top Bar** | Search bar with `Ctrl K` | ✅ | Clicking or pressing `Ctrl+K` opens interactive command palette |
| **Top Bar** | Bell notifications | ✅ | Dropdown with 3 notifications and working "Mark all as read" |
| **Top Bar** | User avatar menu | ✅ | Menu includes Profile, Switch to Buying, Dark mode toggle, Logout |
| **Theme** | Dark Mode Toggle | ✅ | Full dark theme override (`[data-theme="dark"]`), saved in `localStorage` |
| **Sidebar** | Navigation Items & Badges | ✅ | Home (active), Orders (12), Returns (2), Messages (5), etc. |
| **Sidebar** | Removed Excluded Items | ✅ | Removed "Sales channels", "Apps", and duplicate bottom Settings |
| **Sidebar** | "View my store" Link | ✅ | Bottom link cleanly opens `store.html` in a new tab |
| **Metrics** | 4 Metric Cards | ✅ | Total sales, Orders, Conversion rate, Available balance with SVG sparklines |
| **Period** | "Last 30 days" Dropdown | ✅ | Switches between Today, 7 days, 30 days, 90 days; live updates metrics & chart |
| **Charts** | Inline SVG Area Chart | ✅ | Custom SVG path + gradient fill; animates on load; hover crosshair & tooltip |
| **Charts** | Time Granularity Dropdown | ✅ | "Daily / Weekly / Monthly" dropdown re-renders chart smoothly |
| **Guide** | Setup Guide Progress | ✅ | Clickable steps toggle complete/incomplete; persists in `localStorage` |
| **Orders** | Recent Orders Table | ✅ | Select-all checkbox, row selection, floating bulk action bar, toasts |
| **Stock** | Low Stock Table | ✅ | Product thumbnails, SKU, quantity count, "Low stock" status pills |
| **Custom** | Customize Mode | ✅ | Toggle edit mode, drag & drop cards, hide card (x), "Add widget" restore, Done & Reset |
| **Screen A** | **Products List** (`products.html`) | ✅ | Active tab, live debounced search, status/category/price filters, inline edit, bulk publish/delete, CSV export/import trigger |
| **Screen B** | **Add Product** (`add-product.html`) | ✅ | Dirty form bar, rich text editor, drag-drop media upload, live profit/margin/commission calculation, variants generator, tags chips |
| **Screen C** | **CSV Import Modal** (`js/import-modal.js`) | ✅ | 4-step stepper, RFC CSV parser, column mapping, validation table (48 valid, 3 warnings, 2 errors), sample CSV generator, "Use demo file" |
| **Screen D** | **Orders List** (`orders.html`) | ✅ | 3 summary cards, tabs with live counts, unseen blue dot for #1041 & #1042, bulk pack/print/tracking bar, filter/sort popovers, CSV export |
| **Screen E** | **Order Detail** (`order-detail.html`) | ✅ | 10% commission on item subtotal ($24.80), $233.20 You earn, fulfillment modal, interactive timeline with internal comment box, print slip |
| **Responsive** | Mobile & Tablet Support | ✅ | Hamburger slide-over drawer (<768px), 2-col metric cards (768-1100px), card stack |
| **Security** | XSS Safe | ✅ | Dynamic text passed through `escapeHTML()` helper |


