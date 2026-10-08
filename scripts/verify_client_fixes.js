/**
 * AMEZA Marketplace - Comprehensive Client Fixes Verifier
 * Validates:
 * 1. Single currency dropdown in top bar (no duplicate wrappers or selects)
 * 2. Tri-banner heading text legibility styling (white text with text-shadow)
 * 3. Unified slide-out cart drawer integration across pages
 * 4. Empty cart state without forced fake demo seeding
 * 5. Checkout page single header & correct layout tokens
 * 6. Global back-to-top button inclusion and styling
 * 7. Travel pages cart drawer integration
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('  RUNNING CLIENT-SIDE FIXES COMPREHENSIVE AUDIT');
console.log('====================================================\n');

// 1. Currency Dropdown Verifications
console.log('--- 1. SINGLE CURRENCY SELECTOR AUDIT ---');
const layoutJs = fs.readFileSync('js/core/layout.js', 'utf8');
const layoutCss = fs.readFileSync('css/layout.css', 'utf8');
const currencyJs = fs.readFileSync('js/currency.js', 'utf8');

assert(!layoutJs.includes('<select id="currency-select"'), 'No redundant inline <select id="currency-select"> in layout.js');
assert(layoutJs.includes('top-bar-currency-wrapper') && layoutJs.includes('global-currency-wrapper'), 'layout.js renders #global-currency-wrapper placeholder');
assert(currencyJs.includes('#global-currency-wrapper') || currencyJs.includes('.top-bar-currency-wrapper'), 'currency.js targets top-bar-currency-wrapper');
assert(currencyJs.includes('for (let i = 1; i < wrappers.length; i++)'), 'currency.js enforces strictly ONE wrapper by removing duplicates');
assert(layoutCss.includes('.top-bar-currency-wrapper') && layoutCss.includes('.top-bar-currency-dropdown'), 'layout.css contains complete styling for currency dropdown');

// 2. Collection Cards Text Legibility (Screenshot 2 check)
console.log('\n--- 2. COLLECTION CARDS (TRI-BANNER) TEXT AUDIT ---');
const styleCss = fs.readFileSync('css/style.css', 'utf8');
assert(styleCss.includes('.tri-banner-title') && styleCss.includes('color: #FFFFFF !important'), '.tri-banner-title is explicitly forced to #FFFFFF !important');
assert(styleCss.includes('text-shadow: 0 2px 5px rgba(0, 0, 0, 0.75)'), '.tri-banner-title has high-contrast text-shadow for dark-image overlay');

// 3. Global Cart Drawer Architecture
console.log('\n--- 3. GLOBAL CART DRAWER ARCHITECTURE AUDIT ---');
const cartDrawerJs = fs.readFileSync('js/cart-drawer.js', 'utf8');
const cartDrawerCss = fs.readFileSync('css/cart-drawer.css', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');

assert(cartDrawerJs.includes('export function getCart()'), 'cart-drawer.js exports getCart()');
assert(cartDrawerJs.includes('export function saveCart('), 'cart-drawer.js exports saveCart()');
assert(cartDrawerJs.includes('export function addToCart('), 'cart-drawer.js exports addToCart()');
assert(cartDrawerJs.includes('window.openCartDrawer = openDrawer'), 'cart-drawer.js exposes window.openCartDrawer');
assert(cartDrawerJs.includes('window.closeCartDrawer = closeDrawer'), 'cart-drawer.js exposes window.closeCartDrawer');
assert(cartDrawerJs.includes('window.AmezaCart ='), 'cart-drawer.js provides window.AmezaCart global object');
assert(cartDrawerJs.includes("if (e.key === 'Escape'"), 'cart-drawer.js handles Escape key to close');
assert(cartDrawerJs.includes('freeShippingThresholdCents = 10000'), 'cart-drawer.js tracks $100 free shipping meter');
assert(!indexHtml.includes('<aside class="cart-drawer" id="cart-drawer">'), 'index.html has no redundant hardcoded cart-drawer markup');
assert(appJs.includes('if (typeof window.addToCart === \'function\')'), 'app.js delegates to window.addToCart');
assert(appJs.includes('if (typeof window.openCartDrawer === \'function\')'), 'app.js delegates to window.openCartDrawer');
assert(layoutJs.includes('headerCartBtn.addEventListener(\'click\''), 'layout.js intercepts #header-cart-btn click to open drawer');

// 4. Cart Page Audit
console.log('\n--- 4. CART PAGE (cart.html) AUDIT ---');
const cartPageJs = fs.readFileSync('js/cart-page.js', 'utf8');
const cartHtml = fs.readFileSync('cart.html', 'utf8');

assert(!cartPageJs.includes('demoItems'), 'cart-page.js has NO forced fake demo items seeding on empty state');
assert(cartPageJs.includes('Your cart is empty'), 'cart-page.js renders clean empty state when cart is empty');
assert(cartPageJs.includes('formatCartPrice'), 'cart-page.js formats prices with active currency');
assert(cartHtml.includes('js/currency.js'), 'cart.html includes js/currency.js');

// 5. Checkout Page Audit
console.log('\n--- 5. CHECKOUT PAGE (checkout.html) AUDIT ---');
const checkoutPageJs = fs.readFileSync('js/checkout-page.js', 'utf8');
const checkoutHtml = fs.readFileSync('checkout.html', 'utf8');
const tokensCss = fs.readFileSync('css/tokens.css', 'utf8');

assert(!checkoutPageJs.includes('checkout-header-logo-row'), 'checkout-page.js removed duplicate header logo/SSL badge');
assert(checkoutPageJs.includes('getCart()'), 'checkout-page.js reads normalized cart');
assert(checkoutPageJs.includes('formatCartPrice'), 'checkout-page.js formats prices with active currency');
assert(checkoutHtml.includes('js/currency.js'), 'checkout.html includes js/currency.js');
assert(tokensCss.includes('--AMEZA-font') && tokensCss.includes('--AMEZA-bg'), 'tokens.css provides all --AMEZA-* design tokens');
assert(tokensCss.includes('--container-max: 1280px'), 'tokens.css defines --container-max to avoid container stretching');

// 6. Global Back to Top Button Audit
console.log('\n--- 6. GLOBAL BACK TO TOP BUTTON AUDIT ---');
assert(layoutJs.includes('global-back-to-top') && layoutJs.includes('back-to-top-btn'), 'layout.js injects #global-back-to-top button');
assert(layoutJs.includes('window.scrollY > 300'), 'layout.js handles 300px scroll threshold');
assert(layoutJs.includes("window.scrollTo({ top: 0, behavior: 'smooth' })"), 'layout.js provides smooth scroll to top');
assert(layoutCss.includes('.back-to-top-btn') && layoutCss.includes('.back-to-top-btn.is-visible'), 'layout.css provides complete styles for back-to-top button');
assert(cartDrawerJs.includes('initBackToTop'), 'cart-drawer.js ensures Back to Top is initialized everywhere');

// 7. Travel Pages Audit
console.log('\n--- 7. TRAVEL PAGES CART & CURRENCY AUDIT ---');
const travelFiles = ['stays.html', 'flights.html', 'car-rental.html', 'attractions.html', 'airport-taxis.html', 'stays-search.html'];
travelFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('id="header-cart-btn"'), `${file} has header cart button`);
  assert(content.includes('js/cart-drawer.js'), `${file} loads js/cart-drawer.js`);
  assert(content.includes('js/currency.js'), `${file} loads js/currency.js`);
});

console.log('\n====================================================');
console.log(`  VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
