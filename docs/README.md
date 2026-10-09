# AMEZA Marketplace Documentation Hub

Welcome to the official developer and operator documentation for **AMEZA**, a multi-vendor e-commerce marketplace and travel suite tailored for the U.S. market.

---

## Quick Start

### 1. Requirements
- **Node.js**: v18.0.0 or higher
- **Local Port**: 3000

### 2. Running Locally
Because all assets, styles, and modules use standard root-relative paths (`/shared/css/tokens.css`, `/assets/brand/ameza-logo.svg`), the site must be served over an HTTP web server:

```bash
# Start the local development server (defaults to http://localhost:3000/)
npm start
# or
node server.js
```

> [!NOTE]
> Opening HTML files directly by double-clicking (`file:///`) is not supported due to modern browser CORS restrictions on ES modules and root-absolute paths.

### 3. Automated Test Commands
Run the complete acceptance and invariant test suite:

```bash
# Run all automated verification suites (Invariants, Pricing, Multi-Vendor Checkout, US Compliance)
npm test

# Specialized Sub-Suites
npm run test:invariants     # Ledger double-entry, stock guards, RBAC, XSS probes
npm run test:pricing        # Minor-unit equilibrium, integer cents across surfaces
npm run test:checkout       # Multi-vendor splitting, commissions, tax calculation
node scripts/check_usa.js   # Automated U.S. terminology and localization audit
```

---

## Documentation Sitemap

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Area breakdown, shared layer, data flow diagram (Mermaid), prototype vs backend boundary |
| [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Complete directory tree, naming conventions, and code modularity rules |
| [ROUTES.md](ROUTES.md) | Generated catalog of all 118 page routes, layouts, and access roles |
| [AUTH_AND_ROLES.md](AUTH_AND_ROLES.md) | Role-based access control, login flows, 2FA, guards, demo accounts |
| [DATA_MODEL.md](DATA_MODEL.md) | Mock data entities, double-entry ledger schema, minor-unit money rules |
| [API_CONTRACT.md](API_CONTRACT.md) | Shared API client specifications and REST migration mappings |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Design tokens, typography, layouts, accessibility, and responsive breakpoints |
| [BUYER_GUIDE.md](BUYER_GUIDE.md) | End-to-end customer journey, catalog search, cart, and checkout walkthrough |
| [SELLER_GUIDE.md](SELLER_GUIDE.md) | Merchant onboarding, inventory management, shipping, discounts, and returns |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Platform operations, dispute handling, moderation queue, and financial audits |
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | Manual & automated verification checklists across 5 viewports |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel and Netlify configuration, clean URLs, 301 redirects, `_trash` exclusion |
| [BACKEND_MIGRATION.md](BACKEND_MIGRATION.md) | Roadmap for replacing mock storage with real Supabase / Node.js backend |
| [CHANGELOG.md](CHANGELOG.md) | Evolution of the platform codebase across all engineering phases |
