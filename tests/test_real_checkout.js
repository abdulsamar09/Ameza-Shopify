/**
 * test_real_checkout.js
 * Acceptance test for Real Mock Checkout:
 * - Cart with items from 2 sellers produces 1 payment, 2 sub-orders
 * - Correct shipping ($0.00 free over $100 for Seller 1, $5.99 for Seller 2)
 * - Correct state sales tax dynamically from mock/tax_rates.json
 * - Snapshotted commissions (0% for AMEZA Official, 10% for Austin Leather Co)
 * - Double-entry ledger entries for sales, commissions, shipping
 * - Totals are identical across cart, checkout, and order confirmation
 * - Order persists in buyer's orders and in each seller's orders
 * - Failure handling: out-of-stock rejection, payment failure retains cart
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment
const storage = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.window = global;
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

async function runRealCheckoutTests() {
  console.log('====================================================');
  console.log('  RUNNING REAL MULTI-VENDOR CHECKOUT ACCEPTANCE TESTS');
  console.log('====================================================\n');

  // Load modules
  const { OrdersAPI } = await import('../js/api/orders.api.js');
  const { LedgerAPI } = await import('../js/api/ledger.api.js');
  const { formatMoney } = await import('../js/core/utils.js');

  // Reset storage
  global.localStorage.clear();

  // 1. Seed sellers
  const houseSeller = {
    id: 'ameza-official',
    business_name: 'AMEZA Official',
    storeName: 'AMEZA Official',
    commission_rate: 0.00
  };

  const artisanSeller = {
    id: 'seller_melb_123',
    business_name: 'Austin Leather Co',
    storeName: 'Austin Leather Co',
    commission_rate: 0.10
  };

  global.localStorage.setItem('ameza_sellers', JSON.stringify([houseSeller, artisanSeller]));

  // 2. Seed custom products with stock counts
  const prodHouse = {
    id: '549',
    name: 'Small Driftwood Tote',
    price: 5999, // $59.99
    priceCents: 5999,
    sellerId: houseSeller.id,
    sellerName: houseSeller.storeName,
    stockCount: 15
  };

  const prodArtisan = {
    id: 'prod_100',
    name: 'Classic Saddle Leather Belt',
    price: 5999, // $59.99
    priceCents: 5999,
    sellerId: artisanSeller.id,
    sellerName: artisanSeller.storeName,
    stockCount: 8
  };

  global.localStorage.setItem('ameza_custom_products', JSON.stringify([prodHouse, prodArtisan]));

  // 3. Create Multi-Seller Cart
  // House Seller: 2 totes * $59.99 = $119.98 (11998 cents) -> >= $100 -> Standard shipping FREE ($0.00)
  // Artisan Seller: 1 belt * $59.99 = $59.99 (5999 cents) -> < $100 -> Standard shipping $5.99 (599 cents)
  const cartItems = [
    { ...prodHouse, quantity: 2 },
    { ...prodArtisan, quantity: 1 }
  ];
  global.localStorage.setItem('ameza_cart', JSON.stringify(cartItems));

  // Load tax rates from mock/tax_rates.json
  const taxRatesRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../mock/tax_rates.json'), 'utf8'));
  const txRate = taxRatesRaw['TX']; // 0.0625 = 6.25%
  assert(txRate === 0.0625, 'State sales tax for TX is 6.25% from mock/tax_rates.json');

  // Expected math (all in minor unit integer cents):
  const expectedSubtotal = (5999 * 2) + (5999 * 1); // 17997 cents ($179.97)
  const expectedShipHouse = 0; // Free over $100
  const expectedShipArtisan = 599; // $5.99
  const expectedTotalShipping = expectedShipHouse + expectedShipArtisan; // 599 cents ($5.99)
  const expectedTax = Math.round(expectedSubtotal * txRate); // round(17997 * 0.0625) = 1125 cents ($11.25)
  const expectedGrandTotal = expectedSubtotal + expectedTotalShipping + expectedTax; // 19721 cents ($197.21)

  console.log('--- TEST STEP 1: Multi-Vendor Order Placement & Splitting ---');
  const customerId = 'cust_sarah_101';
  const checkoutResult = await OrdersAPI.createOrder({
    customerId,
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    cartItems,
    shippingAddress: {
      address: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States'
    },
    sellerDeliveryMethods: {
      [houseSeller.id]: { method: 'standard', carrier: 'USPS' },
      [artisanSeller.id]: { method: 'standard', carrier: 'USPS' }
    },
    paymentMethod: 'card',
    simulatePaymentFailure: false,
    taxRates: taxRatesRaw
  });

  assert(checkoutResult.success === true, 'OrdersAPI.createOrder completed successfully');
  assert(checkoutResult.parentOrder !== undefined, 'Parent order object returned');
  assert(checkoutResult.subOrders.length === 2, 'Parent order split into exactly 2 vendor sub-orders');

  const parent = checkoutResult.parentOrder;
  assert(parent.subtotalCents === expectedSubtotal, `Parent order subtotal matches expected: ${formatMoney(expectedSubtotal)}`);
  assert(parent.shippingCents === expectedTotalShipping, `Parent order shipping matches expected: ${formatMoney(expectedTotalShipping)}`);
  assert(parent.taxCents === expectedTax, `Parent order state sales tax matches expected: ${formatMoney(expectedTax)}`);
  assert(parent.grandTotalCents === expectedGrandTotal, `Parent order grand total matches expected: ${formatMoney(expectedGrandTotal)}`);

  console.log('\n--- TEST STEP 2: Sub-Order Commission & Shipment Verification ---');
  const subHouse = checkoutResult.subOrders.find(s => s.sellerId === houseSeller.id);
  const subArtisan = checkoutResult.subOrders.find(s => s.sellerId === artisanSeller.id);

  assert(subHouse !== undefined, 'Sub-order for AMEZA Official exists');
  assert(subHouse.subtotalCents === 11998, 'AMEZA Official subtotal is 11998 cents ($119.98)');
  assert(subHouse.shippingCents === 0, 'AMEZA Official shipping is $0.00 (Free standard over $100)');
  assert(subHouse.commissionRatePct === 0, 'AMEZA Official snapshotted commission rate is 0%');
  assert(subHouse.commissionTotalCents === 0, 'AMEZA Official snapshotted commission is $0.00');
  assert(subHouse.sellerNetEarningsCents === 11998, 'AMEZA Official net earnings is $119.98');
  assert(subHouse.trackingNumber.startsWith('94001000'), 'AMEZA Official USPS tracking number generated');

  assert(subArtisan !== undefined, 'Sub-order for Austin Leather Co exists');
  assert(subArtisan.subtotalCents === 5999, 'Austin Leather Co subtotal is 5999 cents ($59.99)');
  assert(subArtisan.shippingCents === 599, 'Austin Leather Co shipping is $5.99 (599 cents)');
  assert(subArtisan.commissionRatePct === 10, 'Austin Leather Co snapshotted commission rate is 10%');
  const expectedArtisanCommission = Math.round(5999 * 0.10); // 600 cents
  assert(subArtisan.commissionTotalCents === expectedArtisanCommission, `Austin Leather Co commission is exactly ${formatMoney(expectedArtisanCommission)}`);
  const expectedArtisanNet = 5999 - expectedArtisanCommission + 599; // 5998 cents ($59.98)
  assert(subArtisan.sellerNetEarningsCents === expectedArtisanNet, `Austin Leather Co net earnings is ${formatMoney(expectedArtisanNet)}`);
  assert(subArtisan.trackingNumber.startsWith('94001000'), 'Austin Leather Co USPS tracking number generated');

  console.log('\n--- TEST STEP 3: Double-Entry Immutable Ledger Verification ---');
  const artisanLedger = LedgerAPI.getSellerStatement(artisanSeller.id);
  assert(artisanLedger.length >= 2, 'Austin Leather Co ledger records sale and commission entries');

  const saleEntry = artisanLedger.find(e => e.entryType === 'sale');
  const commEntry = artisanLedger.find(e => e.entryType === 'commission');
  const shipEntry = artisanLedger.find(e => e.entryType === 'shipping_income');

  assert(saleEntry && saleEntry.amountCents === 5999, 'Sale credit recorded: 5999 cents');
  assert(commEntry && commEntry.amountCents === expectedArtisanCommission, `Commission debit recorded: ${expectedArtisanCommission} cents`);
  assert(shipEntry && shipEntry.amountCents === 599, 'Shipping income recorded: 599 cents');

  console.log('\n--- TEST STEP 4: Inventory Decrement Verification ---');
  const updatedProds = JSON.parse(global.localStorage.getItem('ameza_custom_products'));
  const updHouse = updatedProds.find(p => p.id === '549');
  const updArtisan = updatedProds.find(p => p.id === 'prod_100');
  assert(updHouse.stockCount === 13, 'House product stock decremented from 15 to 13 (bought 2)');
  assert(updArtisan.stockCount === 7, 'Artisan product stock decremented from 8 to 7 (bought 1)');

  console.log('\n--- TEST STEP 5: Order Persistence (Buyer & Seller Views) ---');
  // Buyer view
  const buyerOrders = JSON.parse(global.localStorage.getItem(`ameza_orders_${customerId}`) || '[]');
  assert(buyerOrders.length === 1, 'Order persisted in buyer order history');
  assert(buyerOrders[0].id === parent.id, 'Buyer order ID matches parent order ID');
  assert(buyerOrders[0].grandTotalCents === expectedGrandTotal, 'Buyer order total matches grand total');

  // Seller views
  const sellerOrdersHouse = await OrdersAPI.getSellerOrders(houseSeller.id);
  const sellerOrdersArtisan = await OrdersAPI.getSellerOrders(artisanSeller.id);
  assert(sellerOrdersHouse.some(s => s.id === subHouse.id), 'AMEZA Official can view their sub-order');
  assert(sellerOrdersArtisan.some(s => s.id === subArtisan.id), 'Austin Leather Co can view their sub-order');

  console.log('\n--- TEST STEP 6: Confirmation Screen Data Invariance ---');
  const confDetails = await OrdersAPI.getParentOrderDetails(parent.id);
  assert(confDetails !== null, 'Order confirmation details retrieved');
  assert(confDetails.grandTotalCents === parent.grandTotalCents, 'Confirmation total matches checkout grand total');
  assert(confDetails.subOrders.length === 2, 'Confirmation includes both vendor sub-orders');

  console.log('\n--- TEST STEP 7: Failure Handling - Out of Stock ---');
  const oversellCart = [{ ...prodArtisan, quantity: 999 }];
  const oversellResult = await OrdersAPI.createOrder({
    customerId,
    cartItems: oversellCart,
    shippingAddress: { state: 'TX', zip: '78701' },
    taxRates: taxRatesRaw
  });
  assert(oversellResult.success === false, 'Checkout correctly rejected for oversell');
  assert(oversellResult.errorCode === 'OUT_OF_STOCK', 'Error code is OUT_OF_STOCK');
  assert(oversellResult.outOfStockItem.availableStock === 7, 'Returns available stock count');

  console.log('\n--- TEST STEP 8: Failure Handling - Simulated Payment Failure ---');
  const testCartBefore = [{ ...prodArtisan, quantity: 1 }];
  global.localStorage.setItem('ameza_cart', JSON.stringify(testCartBefore));

  const failResult = await OrdersAPI.createOrder({
    customerId,
    cartItems: testCartBefore,
    shippingAddress: { state: 'TX', zip: '78701' },
    simulatePaymentFailure: true,
    taxRates: taxRatesRaw
  });

  assert(failResult.success === false, 'Payment failure simulated properly');
  assert(failResult.errorCode === 'PAYMENT_FAILED', 'Error code is PAYMENT_FAILED');
  const cartAfterFail = JSON.parse(global.localStorage.getItem('ameza_cart') || '[]');
  assert(cartAfterFail.length === 1, 'Cart remains preserved after payment failure (no cart loss)');

  console.log('\n====================================================');
  console.log(`  REAL CHECKOUT TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRealCheckoutTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
