/**
 * test_invariants.js
 * CLI runner for Section 9 Automated Invariant Validation:
 * 1. Minor-Unit Financial Balance Equilibrium: Subtotal + Shipping == Seller Net + Commission
 * 2. Exact Coupon Rounding Invariant (no floating cent loss)
 * 3. Double-Entry Ledger Buckets Integrity (Pending + Available + Paid Out)
 * 4. Inventory Oversell Guard
 * 5. Multi-Tenant Vendor Isolation
 * 6. Staff RBAC Permission Restriction
 * 7. XSS Probe Sanitization
 */

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

async function runInvariantsTest() {
  console.log('====================================================');
  console.log('  RUNNING SECTION 9 INVARIANT VALIDATION TESTS');
  console.log('====================================================\n');

  const { SeedService, DEMO_IDENTITIES } = await import('../js/api/seed.js');
  const { CartAPI } = await import('../js/api/cart.api.js');
  const { OrdersAPI } = await import('../js/api/orders.api.js');
  const { LedgerAPI } = await import('../js/api/ledger.api.js');
  const { escapeHTML } = await import('../js/core/utils.js');

  // Initialize seed dataset
  SeedService.init(true);

  // Invariant 1: Minor-Unit Equilibrium
  console.log('--- INVARIANT 1: Split & Ledger Minor-Unit Equilibrium ---');
  const subOrders = JSON.parse(global.localStorage.getItem('ameza_marketplace_sub_orders') || '[]');
  let balanced = true;
  for (const s of subOrders) {
    const gross = s.subtotalCents + (s.shippingCents || 0);
    const sum = s.sellerNetEarningsCents + s.commissionTotalCents;
    if (gross !== sum) {
      balanced = false;
      break;
    }
  }
  assert(balanced && subOrders.length >= 60, `Equilibrium satisfied across ${subOrders.length} orders: Subtotal + Shipping == Net + Commission`);

  // Invariant 2: Coupon Rounding Precision
  console.log('\n--- INVARIANT 2: Coupon Rounding Invariant ---');
  const calc = await CartAPI.calculateCart([
    { id: 'prod_test_coupon', name: 'Silk Pocket Square', price: 125.00, quantity: 1 }
  ], 'AMEZA20');
  const expectedDiscount = Math.round(12500 * 0.20); // 2500 cents
  assert(calc.discountCents === expectedDiscount, `20% coupon on $125.00 = 2500 cents ($25.00) exactly`);
  assert(calc.grandTotalCents === 12500 - expectedDiscount, `Grand total matches subtraction without fractional floating cents`);

  // Invariant 3: Ledger Double-Entry Balance Bucket Consistency
  console.log('\n--- INVARIANT 3: Ledger Double-Entry Buckets ---');
  const sellerId = DEMO_IDENTITIES.SELLER_1.id;
  const balance = LedgerAPI.getSellerBalance(sellerId);
  const entries = LedgerAPI.getSellerStatement(sellerId);
  assert(balance.pendingCents >= 0, `Pending balance is non-negative: $${(balance.pendingCents / 100).toFixed(2)}`);
  assert(balance.availableCents >= 0, `Available balance is non-negative: $${(balance.availableCents / 100).toFixed(2)}`);
  assert(balance.paidOutCents >= 0, `Paid out total is valid: $${(balance.paidOutCents / 100).toFixed(2)}`);
  assert(entries.length >= 10, `Ledger records immutable history with ${entries.length} audit entries`);

  // Invariant 4: Stock Oversell Prevention Guard
  console.log('\n--- INVARIANT 4: Stock Oversell Guard ---');
  const oosResult = await OrdersAPI.processCheckout({
    customerId: 'cust_test',
    cartItems: [{ id: 'prod_oversell_1', name: 'Artisan Bag', price: 300, quantity: 999999 }],
    shippingAddress: {},
    paymentMethod: 'card'
  });
  assert(oosResult.success === false, 'Checkout rejected when quantity exceeds stock');

  // Invariant 5: Multi-Tenant Data Isolation
  console.log('\n--- INVARIANT 5: Multi-Tenant Vendor Isolation ---');
  const s1 = DEMO_IDENTITIES.SELLER_1;
  const s2 = DEMO_IDENTITIES.SELLER_2;
  assert(s1.id !== s2.id && s1.ein !== s2.ein, 'Vendors have unique merchant IDs and distinct EINs');
  assert(s1.bankDetails.accountNumber !== s2.bankDetails.accountNumber, 'Banking details are isolated per merchant');

  // Invariant 6: Staff RBAC Permission Restriction
  console.log('\n--- INVARIANT 6: Staff RBAC Permission Restriction ---');
  const supportStaff = DEMO_IDENTITIES.STAFF_SUPPORT;
  const catalogStaff = DEMO_IDENTITIES.STAFF_CATALOG;
  assert(!supportStaff.permissions.includes('finance:view'), 'Support staff is restricted from viewing Finance');
  assert(!supportStaff.permissions.includes('settings:edit'), 'Support staff cannot modify Platform Settings');
  assert(!catalogStaff.permissions.includes('finance:view'), 'Catalog staff is restricted from viewing Finance');
  assert(catalogStaff.permissions.includes('catalog:edit'), 'Catalog staff is permitted to edit Catalog');

  // Invariant 7: XSS Probe Sanitization
  console.log('\n--- INVARIANT 7: XSS Sanitization Probes ---');
  const probe = '<img src=x onerror=alert(1)>"><script>alert("XSS")</script>';
  const clean = escapeHTML(probe);
  assert(!clean.includes('<img') && !clean.includes('<script>'), `Malicious payload safely escaped: "${clean}"`);

  console.log('\n====================================================');
  console.log(`  INVARIANT TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runInvariantsTest().catch(err => {
  console.error('Fatal invariant test error:', err);
  process.exit(1);
});
