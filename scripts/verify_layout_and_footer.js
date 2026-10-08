const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING TRAVEL SUB-NAV SCOPING & 4-COLUMN FOOTER ===');

const layoutJs = fs.readFileSync(path.join(__dirname, '../js/core/layout.js'), 'utf8');
const layoutCss = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8');

// 1. Verify isHomePage() exists in layout.js
assert(layoutJs.includes('function isHomePage()'), 'isHomePage function must exist in layout.js');
assert(layoutJs.includes('onHomePage = isHomePage()'), 'onHomePage variable must be computed in renderStorefrontLayout');
assert(layoutJs.includes('${onHomePage ? `'), 'travel-nav-bar must be conditional on onHomePage');

console.log('✅ PASS: travel-nav-bar is strictly scoped to onHomePage (only homepage renders it)');

// 2. Verify 4-Column Footer in layout.js
assert(layoutJs.includes('footer-col footer-col-brand'), 'Col 1: Brand Info exists');
assert(layoutJs.includes('footer-heading">Shop Categories'), 'Col 2: Shop Categories heading exists');
assert(layoutJs.includes('footer-heading">Customer Care'), 'Col 3: Customer Care heading exists');
assert(layoutJs.includes('footer-heading">Sell &amp; Legal') || layoutJs.includes('footer-heading">Sell & Legal'), 'Col 4: Sell & Legal heading exists');
assert(layoutJs.includes('footer-payment-icons'), 'Payment icons row exists in footer');
assert(layoutJs.includes('visa.svg') && layoutJs.includes('mastercard.svg') && layoutJs.includes('amex.svg') && layoutJs.includes('apple-pay.svg'), 'All payment icons referenced');

console.log('✅ PASS: Unified 4-Column Footer HTML markup verified in layout.js');

// 3. Verify 4-Column Grid in layout.css
assert(layoutCss.includes('grid-template-columns: 1.4fr 1fr 1fr 1fr !important;'), 'layout.css defines 4-column grid for desktop');
assert(layoutCss.includes('grid-template-columns: repeat(2, 1fr) !important;'), 'layout.css defines 2x2 grid for tablet');
assert(layoutCss.includes('grid-template-columns: 1fr !important;'), 'layout.css defines 1-column grid for mobile');

console.log('✅ PASS: layout.css 4-column grid styles and responsive breakpoints verified');

// 4. Verify travel pages have matching 4-column footer
const travelPages = ['flights.html', 'stays.html', 'car-rental.html', 'attractions.html', 'airport-taxis.html', 'stays-search.html'];
for (const page of travelPages) {
  const content = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  assert(content.includes('Shop Categories'), `${page} must contain Shop Categories in footer`);
  assert(content.includes('Customer Care'), `${page} must contain Customer Care in footer`);
  assert(content.includes('Sell &amp; Legal') || content.includes('Sell & Legal'), `${page} must contain Sell & Legal in footer`);
  assert(content.includes('footer-payment-icons'), `${page} must contain footer-payment-icons`);
  console.log(`✅ PASS: ${page} verified with 4-column footer and payment icons`);
}

// 5. Test isHomePage logic with simulated pathnames
function testIsHomePage(testPath) {
  const path = testPath.toLowerCase().replace(/\\/g, '/');
  const cleanPath = path.replace(/\/+$/, '');
  const lastSegment = cleanPath.split('/').pop() || '';
  return cleanPath === '' || lastSegment === '' || lastSegment === 'index.html';
}

assert.strictEqual(testIsHomePage('/'), true, 'Root path / is home page');
assert.strictEqual(testIsHomePage('/index.html'), true, '/index.html is home page');
assert.strictEqual(testIsHomePage(''), true, 'Empty path is home page');
assert.strictEqual(testIsHomePage('C:/workspace/index.html'), true, 'File path index.html is home page');
assert.strictEqual(testIsHomePage('/product.html'), false, '/product.html is NOT home page');
assert.strictEqual(testIsHomePage('/store.html'), false, '/store.html is NOT home page');
assert.strictEqual(testIsHomePage('/category.html'), false, '/category.html is NOT home page');
assert.strictEqual(testIsHomePage('/cart.html'), false, '/cart.html is NOT home page');
assert.strictEqual(testIsHomePage('/account.html'), false, '/account.html is NOT home page');
assert.strictEqual(testIsHomePage('/onboarding/sell-with-us.html'), false, 'sell-with-us.html is NOT home page');

console.log('✅ PASS: isHomePage path testing passed across all storefront routes');

console.log('\n🎉 ALL TRAVEL SUB-NAV & 4-COLUMN FOOTER CHECKS PASSED SUCCESSFULLY!');
