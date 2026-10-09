# AMEZA Deployment & Cloud Hosting Guide

This guide covers deployment settings, URL rewrite configurations, environment variables, and exclusion rules for **Vercel** and **Netlify**.

---

## 1. Vercel Configuration (`vercel.json`)

Deploying to Vercel requires zero build steps (static HTML/CSS/ES Modules architecture):

- **Framework Preset**: Other / None
- **Build Command**: None (or `npm test` for CI verification)
- **Output Directory**: `.` (Root)

### Key Rules Configured in `vercel.json`:
1. **`cleanUrls: true`**: Automatically strips `.html` extensions from URLs.
2. **301 Permanent Redirects**: Maps legacy flat URLs (`/account.html`, `/login.html`, `/shop.html`, etc.) to organized domain paths.
3. **Clean Route Rewrites**: Maps clean paths (`/shop`, `/cart`, `/checkout`, `/login`, `/signup`, `/seller`, `/admin`, `/buyer`) directly to their HTML templates.

---

## 2. Netlify Configuration (`_redirects`)

For deployment to Netlify, mirror the `vercel.json` rewrites using standard `_redirects` syntax:

```
/shop        /storefront/shop.html         200
/cart        /storefront/cart.html         200
/checkout    /storefront/checkout.html     200
/login       /auth/login.html              200
/signup      /auth/signup.html             200
/seller      /seller/index.html            200
/admin       /admin/index.html             200
/buyer       /buyer/index.html             200
/_trash/*    /404.html                     404
```

---

## 3. Exclusion Rules (`.vercelignore`)

The `.vercelignore` file ensures that retired archives and local development tools are excluded from cloud builds:

```
_trash
_trash/**
.git
.gitignore
*.ps1
```

---

## 4. Environment Variables (`.env.example`)

For production backend integration, configure the following variables in the cloud dashboard:

```env
PORT=3000
NODE_ENV=production
AMEZA_DATABASE_URL=postgres://user:password@host:5432/ameza_db
AMEZA_JWT_SECRET=super_secret_jwt_key
AMEZA_STRIPE_SECRET_KEY=sk_live_...
AMEZA_STRIPE_WEBHOOK_SECRET=whsec_...
AMEZA_RESEND_API_KEY=re_...
```
