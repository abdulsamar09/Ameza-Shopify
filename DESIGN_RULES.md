# AMEZA Multi-Vendor Marketplace — Design & Engineering Rules

> **Status:** Official Foundation Specification  
> **Phase:** Clickable HTML/CSS/Vanilla JS Prototype (Mock Data, No Backend)  
> **Target:** Multi-Vendor Marketplace Architecture

---

## 1. Brand Identity & Visual Language
Every page, component, and interaction must maintain the established AMEZA design aesthetic:
* **Primary Brand Green:** `--primary: #7FB73C`
* **Primary Dark Hover:** `--primary-dark: #6CA030`
* **Primary Darker:** `--primary-darker: #5B8828`
* **Light Green Tint / Background:** `--primary-light: #F3F8EE`
* **Deep Dark Neutral / Headings:** `--dark: #111827`
* **Page Background (Light Mode):** `--bg-page: #F8FAF7`
* **Card & Surface Background (Light Mode):** `--bg-surface: #FFFFFF`
* **Border Color:** `--border: #E5E7EB` (Subtle: `--border-subtle: #F3F4F6`)
* **Corner Radii Scale:**
  * `--radius-xs: 4px`
  * `--radius-sm: 6px`
  * `--radius-md: 10px`
  * `--radius-lg: 14px`
  * `--radius-xl: 20px`
  * `--radius-pill: 9999px`
* **Typography:**
  * Headings, brand titles, KPI numbers: `'Plus Jakarta Sans', sans-serif`
  * Body copy, labels, data tables: `'Inter', sans-serif`
* **Iconography:** Font Awesome 6.5 line/solid icons and lightweight inline SVGs.
* **Admin Portal Distinction:** Admin sidebar uses deep dark navy (`#111827`) with primary green active indicators (`#7FB73C`).

---

## 2. Component Discipline
* **Zero One-Off CSS:** Only use components and utility classes defined in `css/tokens.css` and `css/components.css`.
* If a new UI pattern is needed, add it to `css/components.css` first, document it in `dev/ui-kit.html`, and only then use it across screens.
* Reuse shared shells: All seller and admin dashboard screens must mount `js/dashboard-shell.js`.
* All data tables must use `js/table-kit.js`.
* All customizable metric dashboards must mount `js/widget-grid.js`.

---

## 3. Data Integrity & XSS Prevention
* **Universal HTML Escaping:** Every dynamic string rendered into the DOM must pass through `escapeHTML()`.
* **Zero Plain Text Secret Exposure:** No inline credentials, API keys, passwords, or plain financial details.
* **Deterministic Mock Data:** All data must originate from `/mock/*.json` and be consumed through asynchronous service stubs in `js/api/*.js`. No screen may hardcode inline business records.
* Mock data must be realistic, culturally appropriate (international marketplace addresses, customer profiles, USD charge currency with multi-currency display via currency.js), and mutually consistent across sellers, customers, orders, and ledger balances.

---

## 4. UI State Coverage & Quality Requirements
Every screen and component must explicitly provide:
1. **Loading State:** Shimmering skeleton loader (`.skeleton`, `.skeleton-text`, `.skeleton-card`) during simulated async data fetches.
2. **Empty State:** High-quality illustrative empty state with descriptive text and a clear primary action.
3. **Error State:** Friendly error notification with a retry button and fallback.
4. **Interactive States:** Distinct hover, focus, focus-visible, and active states for all interactive elements.
5. **Visible Focus Rings:** High-contrast focus rings (`0 0 0 3px rgba(127, 183, 60, 0.35)`) for keyboard accessibility (`:focus-visible`).
6. **Color Contrast:** WCAG 2.1 AA compliant contrast ratio (minimum 4.5:1 for body copy, 3:1 for large text).
7. **Dark Mode Support:** Full dark mode support using CSS custom properties responding to both system preference (`prefers-color-scheme: dark`) and `[data-theme="dark"]` attribute.
8. **Reduced Motion:** Honor `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions and animations.
9. **Responsive Range:** Flawless rendering from 360px mobile viewport up to 1440px+ widescreen displays.

---

## 5. Prototype Interactivity Guarantee
* **Zero Dead Links / Dead Buttons:** Every button, tab, dropdown, pagination control, and link must work. It must navigate, open a modal, slide open a drawer, switch a tab, or display an informative toast notification.
* **No "Coming Soon" or Lorem Ipsum:** All preview screens must show rich, contextual mock content.

---

## 6. Mobile-First Administration
* Both Seller and Admin screens must be 100% usable on mobile devices (360px–390px).
* Desktop sidebars collapse into a responsive slide-over drawer and mobile bottom navigation.
* Tables on mobile support horizontal scrolling with sticky primary columns or card-based views.

---

## 7. Design Review & Verification Workflow
For every new screen built:
1. Verify in a browser at **1440px** (Desktop) and **390px** (Mobile), in both **Light** and **Dark** themes.
2. Capture verification screenshots to `/design-review/<screen>-<size>-<theme>.png`.
3. Check browser console for zero errors or unhandled promises.
4. Add the screen entry and link to `prototype-index.html`.
