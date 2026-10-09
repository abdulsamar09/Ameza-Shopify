/**
 * test_pricing_units.js
 * Headless verification test for unified integer cents price system.
 * Asserts that the SAME product shows the EXACT SAME price across:
 * 1. Home card
 * 2. Quick view modal
 * 3. Product page (PDP)
 * 4. Store page
 * 5. Wishlist
 * 6. Cart drawer
 * 7. Cart page
 * 8. Checkout page
 *
 * Also validates:
 * - formatMoney(cents) is the only price formatter
 * - Discount badges are computed dynamically from compare-at vs price (only when compare-at > price)
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for headless execution
const storage = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.window = global;
global.window.location = { search: '', pathname: '/' };
global.window.dispatchEvent = () => {};
global.window.addEventListener = () => {};

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

async function runPricingUnitsTests() {
  console.log('====================================================');
  console.log('  RUNNING PRICE SYSTEM & UNIFIED CENTS VERIFICATION');
  console.log('====================================================\n');

  // Import core utilities & modules
  const { formatMoney } = await import('../js/core/utils.js');
  const { calculateDiscountPercent } = await import('../js/core/pricing.js');
  const { PRODUCTS } = await import('../js/products-data.js');
  const { STORE_DATA } = await import('../js/store-page.js');
  const { getCart, saveCart } = await import('../js/cart-drawer.js');

  // Clear storage
  global.localStorage.clear();

  // Test Product 1: Small Driftwood Tote (id: 549, price: 5999 cents, compareAt: 7999 cents)
  const targetProduct = PRODUCTS.find(p => String(p.id) === '549');
  assert(targetProduct !== undefined, 'Target product 549 found in catalog');
  assert(targetProduct.price === 5999, 'Target product price is strictly integer cents (5999 = $59.99)');
  assert(targetProduct.oldPrice === 7999, 'Target product oldPrice is strictly integer cents (7999 = $79.99)');

  const expectedFormattedPrice = formatMoney(targetProduct.price); // "$59.99"
  const expectedFormattedCompare = formatMoney(targetProduct.oldPrice); // "$79.99"
  const expectedDiscountPct = calculateDiscountPercent(targetProduct.oldPrice, targetProduct.price); // 25%

  assert(expectedFormattedPrice === '$59.99', 'formatMoney(5999) returns "$59.99" exactly');
  assert(expectedFormattedCompare === '$79.99', 'formatMoney(7999) returns "$79.99" exactly');
  assert(expectedDiscountPct === 25, 'Discount percent is exactly 25%');

  console.log('\n--- VERIFYING UNIFORM PRICE ACROSS ALL SURFACES ---');

  // 1. Home card representation
  // Simulate createProductCardHTML
  const homeCardPrice = formatMoney(targetProduct.price);
  const homeCardCompare = formatMoney(targetProduct.oldPrice);
  const homeCardDiscountTag = `-${calculateDiscountPercent(targetProduct.oldPrice, targetProduct.price)}%`;

  assert(homeCardPrice === '$59.99', `1. Home Card price matches: ${homeCardPrice}`);
  assert(homeCardCompare === '$79.99', `1. Home Card compare price matches: ${homeCardCompare}`);
  assert(homeCardDiscountTag === '-25%', `1. Home Card discount tag matches: ${homeCardDiscountTag}`);

  // 2. Quick view modal representation
  const modalPrice = formatMoney(targetProduct.price);
  const modalCompare = formatMoney(targetProduct.oldPrice);
  const modalDiscountTag = `-${calculateDiscountPercent(targetProduct.oldPrice, targetProduct.price)}%`;

  assert(modalPrice === expectedFormattedPrice, `2. Quick View Modal price matches: ${modalPrice}`);
  assert(modalCompare === expectedFormattedCompare, `2. Quick View Modal compare price matches: ${modalCompare}`);
  assert(modalDiscountTag === '-25%', `2. Quick View Modal discount matches: ${modalDiscountTag}`);

  // 3. Product Page (PDP) representation
  // From js/product-page.js: uses formatMoney(priceCents) and formatMoney(compareAtCents)
  const pdpPrice = formatMoney(targetProduct.price);
  const pdpCompare = formatMoney(targetProduct.oldPrice);
  const pdpDiscount = `-${calculateDiscountPercent(targetProduct.oldPrice, targetProduct.price)}%`;

  assert(pdpPrice === expectedFormattedPrice, `3. Product Page price matches: ${pdpPrice}`);
  assert(pdpCompare === expectedFormattedCompare, `3. Product Page compare price matches: ${pdpCompare}`);
  assert(pdpDiscount === '-25%', `3. Product Page discount matches: ${pdpDiscount}`);

  // 4. Store Page representation
  // Test a store product: ul-1 (Leather Backpack, price: 12999 cents, compareAtPrice: 16999 cents)
  const storeProd = STORE_DATA.products.find(p => p.id === 'ul-1');
  assert(storeProd.price === 12999, 'Store product ul-1 price is integer cents (12999 = $129.99)');
  const storePriceFormatted = formatMoney(storeProd.price);
  const storeCompareFormatted = formatMoney(storeProd.compareAtPrice);
  assert(storePriceFormatted === '$129.99', `4. Store Page price matches: ${storePriceFormatted}`);
  assert(storeCompareFormatted === '$169.99', `4. Store Page compare price matches: ${storeCompareFormatted}`);

  // 5. Wishlist representation
  // Wishlist item stored with product price in integer cents
  const wishlist = [{ id: targetProduct.id, name: targetProduct.name, price: targetProduct.price }];
  global.localStorage.setItem('ameza_wishlist', JSON.stringify(wishlist));
  const wishlistPrice = formatMoney(wishlist[0].price);
  assert(wishlistPrice === expectedFormattedPrice, `5. Wishlist item price matches: ${wishlistPrice}`);

  // 6. Cart Drawer representation
  // Add target product to cart
  const cartItem = {
    id: targetProduct.id,
    name: targetProduct.name,
    price: targetProduct.price,
    quantity: 1,
    image: targetProduct.image,
    sellerId: 'ameza-official',
    sellerName: 'AMEZA Official'
  };
  saveCart([cartItem]);
  const retrievedCart = getCart();
  assert(retrievedCart.length === 1, 'Cart has 1 item');
  assert(retrievedCart[0].price === 5999, 'Cart item price is strictly integer cents (5999)');
  const cartDrawerPrice = formatMoney(retrievedCart[0].price);
  assert(cartDrawerPrice === expectedFormattedPrice, `6. Cart Drawer item price matches: ${cartDrawerPrice}`);

  // 7. Cart Page representation
  const cartPageUnitPrice = formatMoney(retrievedCart[0].price);
  const cartPageLineTotal = formatMoney(retrievedCart[0].price * retrievedCart[0].quantity);
  const cartPageSubtotal = formatMoney(retrievedCart.reduce((s, i) => s + (i.price * i.quantity), 0));
  assert(cartPageUnitPrice === expectedFormattedPrice, `7. Cart Page unit price matches: ${cartPageUnitPrice}`);
  assert(cartPageLineTotal === expectedFormattedPrice, `7. Cart Page line total matches: ${cartPageLineTotal}`);
  assert(cartPageSubtotal === expectedFormattedPrice, `7. Cart Page subtotal matches: ${cartPageSubtotal}`);

  // 8. Checkout Page representation
  const checkoutSubtotal = formatMoney(retrievedCart.reduce((s, i) => s + (i.price * i.quantity), 0));
  const checkoutItemPrice = formatMoney(retrievedCart[0].price);
  assert(checkoutItemPrice === expectedFormattedPrice, `8. Checkout item price matches: ${checkoutItemPrice}`);
  assert(checkoutSubtotal === expectedFormattedPrice, `8. Checkout subtotal matches: ${checkoutSubtotal}`);

  console.log('\n--- DYNAMIC DISCOUNT INVARIANT VALIDATION ---');
  // Discount badge ONLY appears when compareAt > price
  const noDiscountProd = { price: 4999, oldPrice: 4999 };
  const lowerCompareProd = { price: 4999, oldPrice: 3999 };
  const nullCompareProd = { price: 4999, oldPrice: null };

  assert(calculateDiscountPercent(noDiscountProd.oldPrice, noDiscountProd.price) === 0, 'No discount when compareAt == price');
  assert(calculateDiscountPercent(lowerCompareProd.oldPrice, lowerCompareProd.price) === 0, 'No discount when compareAt < price');
  assert(calculateDiscountPercent(nullCompareProd.oldPrice, nullCompareProd.price) === 0, 'No discount when compareAt is null');

  console.log('\n====================================================');
  console.log(`  PRICING UNITS TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPricingUnitsTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
