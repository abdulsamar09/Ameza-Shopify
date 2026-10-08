/**
 * AMEZA Multi-Tenant Isolation Test: Order Segregation
 * Verifies that:
 * 1. Customer A can only see Customer A's orders.
 * 2. Customer B cannot see Customer A's orders.
 * 3. RLS SQL policy enforces `customer_id = auth.uid()`.
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.crypto = {
  subtle: {
    digest: async (algo, data) => require('crypto').createHash('sha256').update(Buffer.from(data)).digest().buffer
  }
};

global.window = global;
const authCode = fs.readFileSync(path.join(__dirname, '../js/auth.js'), 'utf8');
eval(authCode);

async function testOrderIsolation() {
  console.log('--- Testing Multi-Tenant Order Isolation ---');

  const customerA = 'usr_customer_alice_101';
  const customerB = 'usr_customer_bob_202';

  // 1. Add order for Customer A
  window.AmezaAuth.addOrder(customerA, {
    id: 'AMZ-ALICE-01',
    total: 120.00,
    items: ['365 All Leather Tote']
  });

  // 2. Add order for Customer B
  window.AmezaAuth.addOrder(customerB, {
    id: 'AMZ-BOB-01',
    total: 85.00,
    items: ['Classic Leather Belt']
  });

  // 3. Customer A queries orders
  const aliceOrders = window.AmezaAuth.getOrders(customerA);
  const bobOrders = window.AmezaAuth.getOrders(customerB);

  const aliceSeesOnlyOwn = aliceOrders.every(o => o.id.startsWith('AMZ-ALICE'));
  const bobSeesOnlyOwn = bobOrders.every(o => o.id.startsWith('AMZ-BOB'));
  const crossAccessBlocked = !aliceOrders.some(o => o.id === 'AMZ-BOB-01') && !bobOrders.some(o => o.id === 'AMZ-ALICE-01');

  console.log('Test 1 - Alice orders isolated:', aliceSeesOnlyOwn ? 'PASSED' : 'FAILED');
  console.log('Test 2 - Bob orders isolated:', bobSeesOnlyOwn ? 'PASSED' : 'FAILED');
  console.log('Test 3 - Cross-customer access prohibited:', crossAccessBlocked ? 'PASSED' : 'FAILED');

  // 4. Verify SQL Migration RLS rules exist
  const rlsSql = fs.readFileSync(path.join(__dirname, '../db/migrations/002_rls_policies.sql'), 'utf8');
  const hasOrdersRls = rlsSql.includes('customer_id = auth.uid()');
  const hasSellerOrdersRls = rlsSql.includes('seller_id = public.current_seller_id()');

  console.log('Test 4 - Database RLS policy for customer orders:', hasOrdersRls ? 'PASSED' : 'FAILED');
  console.log('Test 5 - Database RLS policy for seller sub-orders:', hasSellerOrdersRls ? 'PASSED' : 'FAILED');

  if (aliceSeesOnlyOwn && bobSeesOnlyOwn && crossAccessBlocked && hasOrdersRls && hasSellerOrdersRls) {
    console.log('\n🎉 ALL TENANT & ORDER ISOLATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ TENANT ISOLATION TEST FAILED.');
    process.exit(1);
  }
}

testOrderIsolation();
