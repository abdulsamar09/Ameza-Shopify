const fs = require('fs');
const path = require('path');

const publicPages = [
  'index.html',
  'product.html',
  'store.html',
  'cart.html',
  'wishlist.html',
  'account.html',
  'account-profile.html',
  'account-orders.html',
  'account-order-detail.html',
  'account-addresses.html',
  'account-security.html',
  'account-wishlist.html',
  'onboarding/sell-with-us.html',
  'login.html',
  'signup.html',
  'forgot-password.html',
  'reset-password.html',
  'verify-email.html',
  'checkout.html',
  'onboarding/apply.html'
];

let updated = 0;
for (const rel of publicPages) {
  const p = path.resolve(__dirname, '..', rel);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  const isSubdir = rel.includes('/') || rel.includes('\\');
  const layoutHref = isSubdir ? '../css/layout.css' : 'css/layout.css';
  const baseHref = isSubdir ? '../css/base.css' : 'css/base.css';

  if (!html.includes('layout.css')) {
    if (html.includes(baseHref)) {
      html = html.replace(
        new RegExp(`<link[^>]*${baseHref.replace('.', '\\.')}[^>]*>`),
        `<link rel="stylesheet" href="${layoutHref}">\n  <link rel="stylesheet" href="${baseHref}">`
      );
    } else {
      html = html.replace('</head>', `  <link rel="stylesheet" href="${layoutHref}">\n</head>`);
    }
    fs.writeFileSync(p, html, 'utf8');
    console.log(`Added layout.css to ${rel}`);
    updated++;
  } else {
    console.log(`Already has layout.css: ${rel}`);
  }
}
console.log(`Updated ${updated} pages.`);
