/**
 * test_phase3_orders_commission.js
 * Acceptance test for Phase 3:
 * - Multi-vendor cart calculation
 * - Multi-vendor order splitting (Parent Order -> N Sub-Orders)
 * - Commission snapshotting (0% for AMEZA Official, 10% for Austin Leather Co)
 * - Double-entry ledger immutability and balance accuracy
 * - COD cash-on-delivery commission debit handling
 * - Stock reservation / decrement
 * - Edge case handling (invalid stock, coupon allocation)
 */

// Initialize Node browser environment mocks
const storage = {};
global.localStorage = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null),
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.window = global;

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

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('  RUNNING PHASE 3 MULTI-VENDOR CHECKOUT & LEDGER TESTS');
  console.log('====================================================\n');

  const { CartAPI } = await import('../js/api/cart.api.js');
  const { OrdersAPI } = await import('../js/api/orders.api.js');
  const { LedgerAPI } = await import('../js/api/ledger.api.js');

  // Clear mock storage to ensure clean test environment
  global.localStorage.clear();

  // 1. Setup mock sellers and products
  const houseSeller = {
    id: 'ameza-official',
    business_name: 'AMEZA Official',
    commission_rate: 0.00
  };

  const vendorSeller = {
    id: 'seller_melb_123',
    business_name: 'Austin Leather Co',
    ein: '12-3456789',
    commission_rate: 0.10
  };

  // Seed sellers to localStorage so OrdersAPI can lookup commission rate
  const sellers = [houseSeller, vendorSeller];
  global.localStorage.setItem('ameza_sellers', JSON.stringify(sellers));

  // Seed products
  const productA = {
    id: 'prod_house_1',
    name: 'Silk Linen Shirt',
    price: 150.00, // $150.00 USD = 15000 cents
    seller_id: houseSeller.id,
    seller_name: houseSeller.business_name,
    stock: 20
  };

  const productB = {
    id: 'prod_vendor_1',
    name: 'Handcrafted Kangaroo Leather Wallet',
    price: 90.00, // $90.00 USD = 9000 cents
    seller_id: vendorSeller.id,
    seller_name: vendorSeller.business_name,
    stock: 10
  };

  const productC = {
    id: 'prod_vendor_2',
    name: 'Austin Saddle Leather Belt',
    price: 110.00, // $110.00 USD = 11000 cents
    seller_id: vendorSeller.id,
    seller_name: vendorSeller.business_name,
    stock: 5
  };

  global.localStorage.setItem('ameza_custom_products', JSON.stringify([productA, productB, productC]));

  console.log('--- TEST STEP 1: Multi-Vendor Cart Calculation & Grouping ---');
  const cartItems = [
    { ...productA, quantity: 2 }, // 2 * $150 = $300 (30000 cents) from AMEZA Official
    { ...productB, quantity: 1 }, // 1 * $90 = $90 (9000 cents) from Austin Leather Co
    { ...productC, quantity: 1 }  // 1 * $110 = $110 (11000 cents) from Austin Leather Co
  ];

  const cartCalculation = await CartAPI.calculateCart(cartItems, null);
  assert(cartCalculation.totalItems === 4, 'Cart total items count is 4');
  assert(cartCalculation.itemSubtotalCents === 50000, 'Cart item subtotal is 50000 cents ($500.00 USD)');
  assert(cartCalculation.vendorGroups.length === 2, 'Cart successfully partitioned into 2 distinct vendor shipments');
  
  const houseGroup = cartCalculation.vendorGroups.find(g => g.sellerId === houseSeller.id);
  const vendorGroup = cartCalculation.vendorGroups.find(g => g.sellerId === vendorSeller.id);
  assert(houseGroup !== undefined, 'AMEZA Official vendor shipment present');
  assert(vendorGroup !== undefined, 'Austin Leather Co vendor shipment present');
  assert(houseGroup.itemSubtotalCents === 30000, 'AMEZA Official subtotal is $300.00 (30000 cents)');
  assert(vendorGroup.itemSubtotalCents === 20000, 'Austin Leather Co subtotal is $200.00 (20000 cents)');

  console.log('\n--- TEST STEP 2: Multi-Vendor Order Splitting & Commission Snapshots ---');
  const checkoutPayload = {
    customerId: 'cust_sydney_456',
    cartItems,
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com.au',
      line1: '45 George Street',
      city: 'San Diego',
      state: 'NSW',
      postcode: '2000',
      country: 'United States'
    },
    paymentMethod: 'card',
    couponCode: null
  };

  const checkoutResult = await OrdersAPI.processCheckout(checkoutPayload);
  assert(checkoutResult.success === true, 'Checkout processing succeeded');
  assert(checkoutResult.parentOrder.id.startsWith('ORD-'), `Parent order created: #${checkoutResult.parentOrder.id}`);
  assert(checkoutResult.subOrders.length === 2, 'Parent order split into exactly 2 vendor sub-orders');

  const houseSubOrder = checkoutResult.subOrders.find(s => s.sellerId === houseSeller.id);
  const vendorSubOrder = checkoutResult.subOrders.find(s => s.sellerId === vendorSeller.id);

  assert(houseSubOrder !== undefined, 'Sub-order created for AMEZA Official');
  assert(vendorSubOrder !== undefined, 'Sub-order created for Austin Leather Co');

  // Verify Commission Snapshots:
  // House seller: 0% commission rate -> $0.00 commission
  assert(houseSubOrder.commissionRate === 0.00, 'AMEZA Official has 0% commission rate snapshotted');
  assert(houseSubOrder.commissionCents === 0, 'AMEZA Official commission is exactly 0 cents ($0.00)');
  assert(houseSubOrder.sellerNetCents === houseSubOrder.itemSubtotalCents + houseSubOrder.shippingCents, 
    'AMEZA Official receives 100% of sales and shipping');

  // Registered seller: 10% commission rate -> 10% of $200 = $20.00 (2000 cents)
  assert(vendorSubOrder.commissionRate === 0.10, 'Austin Leather Co has 10% commission rate snapshotted');
  assert(vendorSubOrder.itemSubtotalCents === 20000, 'Austin Leather Co item subtotal is 20000 cents ($200.00)');
  assert(vendorSubOrder.commissionCents === 2000, 'Austin Leather Co platform commission is 2000 cents ($20.00 USD)');
  assert(vendorSubOrder.sellerNetCents === 18000, 'Austin Leather Co net payout is 18000 cents ($180.00 USD)');

  // Verify Tracking Numbers generated
  assert(houseSubOrder.trackingNumber && (houseSubOrder.trackingNumber.startsWith('9400') || houseSubOrder.trackingNumber.startsWith('USPS')), 'USPS tracking number generated for shipment 1');
  assert(vendorSubOrder.trackingNumber && (vendorSubOrder.trackingNumber.startsWith('9400') || vendorSubOrder.trackingNumber.startsWith('USPS')), 'USPS tracking number generated for shipment 2');

  console.log('\n--- TEST STEP 3: Double-Entry Immutable Ledger Verification ---');
  const vendorBalance = LedgerAPI.getSellerBalance(vendorSeller.id);
  assert(vendorBalance.pendingCents === 18000, `Vendor pending balance credited net: $${(vendorBalance.pendingCents / 100).toFixed(2)}`);
  assert(vendorBalance.availableCents === 0, 'Balance is currently held in pending state prior to dispatch');

  const vendorStatement = LedgerAPI.getSellerStatement(vendorSeller.id);
  assert(vendorStatement.length >= 2, 'Ledger has at least 2 entries for vendor (Sale credit and Commission debit)');
  
  const saleEntry = vendorStatement.find(e => e.entryType === 'sale');
  const commEntry = vendorStatement.find(e => e.entryType === 'commission');
  assert(saleEntry !== undefined && saleEntry.amountCents === 20000, 'Sale recorded as 20000 cents credit');
  assert(commEntry !== undefined && commEntry.amountCents === 2000, 'Commission recorded as 2000 cents debit');
  assert(commEntry.description.includes('10% commission'), 'Commission ledger description records snapshotted rate');

  console.log('\n--- TEST STEP 4: Inventory / Stock Decrement ---');
  const storedProducts = JSON.parse(global.localStorage.getItem('ameza_custom_products') || '[]');
  const updatedProdA = storedProducts.find(p => p.id === productA.id);
  const updatedProdB = storedProducts.find(p => p.id === productB.id);
  const updatedProdC = storedProducts.find(p => p.id === productC.id);

  assert(updatedProdA.stock === 18, `Product A stock decremented from 20 to 18 (bought 2)`);
  assert(updatedProdB.stock === 9, `Product B stock decremented from 10 to 9 (bought 1)`);
  assert(updatedProdC.stock === 4, `Product C stock decremented from 5 to 4 (bought 1)`);

  console.log('\n--- TEST STEP 5: Cash on Delivery (COD) Ledger Handling ---');
  // For COD, the customer pays the vendor / courier on delivery.
  // The platform didn't collect the funds, so the platform commission must be debited from the seller's account.
  const codCart = [{ ...productB, quantity: 1 }];
  const codCheckout = await OrdersAPI.processCheckout({
    customerId: 'cust_melbourne_789',
    cartItems: codCart,
    shippingAddress: {
      fullName: 'David Bruce',
      email: 'david@example.com.au',
      line1: '12 Collins St',
      city: 'Austin',
      state: 'VIC',
      postcode: '3000',
      country: 'United States'
    },
    paymentMethod: 'cod',
    couponCode: null
  });

  assert(codCheckout.success === true, 'COD Checkout successfully processed');
  const codSubOrder = codCheckout.subOrders[0];
  assert(codSubOrder.paymentMethod === 'cod', 'Sub-order marked with COD payment method');
  assert(codSubOrder.commissionCents === 900, 'COD commission is 900 cents ($9.00 on $90.00 wallet)');

  const codStatement = LedgerAPI.getSellerStatement(vendorSeller.id);
  const codDueEntry = codStatement.find(e => e.entryType === 'cod_commission_due' && e.subOrderId === codSubOrder.id);
  assert(codDueEntry !== undefined, 'COD commission recorded as cod_commission_due in ledger');
  assert(codDueEntry.amountCents === 900, 'COD commission due amount matches expected 900 cents');

  console.log('\n--- TEST STEP 6: Coupon Allocation Edge Case ---');
  const promoCart = [{ ...productB, quantity: 2 }]; // 2 * $90 = $180 (18000 cents)
  const promoCalc = await CartAPI.calculateCart(promoCart, 'AMEZA20');
  assert(promoCalc.discountCents === 3600, '20% coupon correctly calculates 3600 cents ($36.00 discount)');
  assert(promoCalc.grandTotalCents === 14400, 'Grand total after discount is 14400 cents ($144.00)');

  console.log('\n--- TEST STEP 7: Out-of-Stock Validation ---');
  const oosCart = [{ ...productC, quantity: 999 }]; // Stock is only 4
  const oosResult = await OrdersAPI.processCheckout({
    customerId: 'cust_test',
    cartItems: oosCart,
    shippingAddress: {},
    paymentMethod: 'card'
  });
  assert(oosResult.success === false, 'Checkout correctly rejected when requested quantity exceeds available stock');
  assert(oosResult.error.includes('Insufficient stock'), `Proper error returned: "${oosResult.error}"`);

  console.log('\n====================================================');
  console.log(`  PHASE 3 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
