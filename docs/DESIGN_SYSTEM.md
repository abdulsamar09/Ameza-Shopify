# AMEZA Design System & Styling Specifications

This document defines the visual design tokens, typography scales, accessibility mandates, responsive viewport standards, and layout paradigms for AMEZA.

---

## 1. Palette & Design Tokens (`shared/css/tokens.css`)

```css
:root {
  /* Brand Green Spectrum */
  --primary: #7DBA35;
  --primary-hover: #6BA32B;
  --primary-light: #F2F8EC;
  --primary-border: rgba(125, 186, 53, 0.35);

  /* Slate & Dark Accents */
  --navy-dark: #0F172A;
  --slate-800: #1E293B;
  --slate-600: #475569;
  --slate-400: #94A3B8;
  --slate-200: #E2E8F0;
  --slate-100: #F1F5F9;

  /* Surfaces & Backgrounds */
  --bg-page: #F8FAFC;
  --bg-surface: #FFFFFF;
  --border-light: #E2E8F0;

  /* Status Colors */
  --status-success: #15803D;
  --status-warning: #B45309;
  --status-danger: #B91C1C;
  --status-info: #0284C7;
}
```

---

## 2. Typography Scale

- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings**:
  - `H1`: 32px / 700 bold (Mobile: 24px)
  - `H2`: 24px / 700 bold (Mobile: 20px)
  - `H3`: 18px / 600 semi-bold
  - `H4`: 15px / 600 semi-bold
- **Body Text**: 14px (never below 14px on mobile)
- **Inputs**: Form inputs are minimum **16px** on mobile to avoid iOS automatic viewport zoom.

---

## 3. Responsive Breakpoints Matrix

All user interfaces are audited across 5 exact viewport widths:

| Viewport Width | Device Category | Behavioral Transformation |
|---|---|---|
| **1440px** | Desktop Large | Multi-column grids (4-col products, full sidebar). |
| **1024px** | Tablet Landscape | 3-column products, collapsible filter drawers. |
| **768px** | Tablet Portrait | Data tables convert into stacked cards, sidebar transforms to drawer. |
| **390px** | Mobile Modern (iPhone 14/15) | Single column, full-screen dialogs, bottom sheets, sticky bars. |
| **360px** | Mobile Compact (Android) | Zero horizontal scroll, touch targets minimum 44px x 44px. |

---

## 4. The Three Layout Paradigms

1. **`data-layout="storefront"`**:
   - Header with Announcement Bar, Searchbar, Category Dropdown, Cart Trigger, and Comprehensive Footer with payment icons.
2. **`data-layout="focus"`**:
   - Used for Checkout, Login, and Registration. Stripped-down navigation with prominent Logo and SSL trust badges to minimize checkout abandonment.
3. **`data-layout="dashboard"`**:
   - Fixed left sidebar with collapsible navigation items, header with breadcrumbs and notification center, and analytical KPI cards.
