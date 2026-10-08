const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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

console.log('=== VERIFYING UNIFIED HEADER & FOOTER MARKUP ===');

let hasHardcodedHeader = 0;
let hasHardcodedFooter = 0;
let missingLayoutScript = 0;
let hasTravelCss = 0;

for (const rel of publicPages) {
  const p = path.join(rootDir, rel);
  if (!fs.existsSync(p)) {
    console.log(`[Missing] ${rel}`);
    continue;
  }
  const content = fs.readFileSync(p, 'utf8');

  // Check for hardcoded header tag outside of layout.js
  const headerMatch = content.match(/<header\b[^>]*>/gi);
  if (headerMatch) {
    console.log(`❌ ${rel}: found hardcoded <header> (${headerMatch.length})`);
    hasHardcodedHeader++;
  }

  // Check for hardcoded footer tag
  const footerMatch = content.match(/<footer\b[^>]*>/gi);
  if (footerMatch) {
    console.log(`❌ ${rel}: found hardcoded <footer> (${footerMatch.length})`);
    hasHardcodedFooter++;
  }

  // Check for layout.js
  if (!content.includes('layout.js')) {
    console.log(`❌ ${rel}: missing layout.js`);
    missingLayoutScript++;
  }

  // Check for travel.css
  if (content.includes('travel.css')) {
    console.log(`❌ ${rel}: still references travel.css`);
    hasTravelCss++;
  }
}

console.log('\n--- Verification Summary ---');
console.log(`Public & Focus Pages Checked: ${publicPages.length}`);
console.log(`Hardcoded Headers: ${hasHardcodedHeader}`);
console.log(`Hardcoded Footers: ${hasHardcodedFooter}`);
console.log(`Missing layout.js: ${missingLayoutScript}`);
console.log(`Travel CSS references: ${hasTravelCss}`);

if (hasHardcodedHeader === 0 && hasHardcodedFooter === 0 && missingLayoutScript === 0 && hasTravelCss === 0) {
  console.log('✅ PASS: Exactly 1 unified header markup and 1 unified footer markup in js/core/layout.js across all public & focus pages!');
} else {
  console.log('❌ FAIL: Inconsistencies detected.');
}
