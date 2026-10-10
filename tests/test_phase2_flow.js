/**
 * AMEZA Phase 2 Acceptance Test: Seller Onboarding & Product Lifecycle (United States)
 * Validates:
 * 1. User registers and applies to become an U.S. seller with EIN & AU bank info.
 * 2. Admin reviews and approves the application.
 * 3. Seller creates a new product (starts in moderation queue).
 * 4. Admin approves the product into active status.
 * 5. Product is dynamically retrieved on the storefront with "Sold by Austin Leather Co".
 * 6. Store page correctly displays seller profile and their products.
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

// Load auth engine
const authCode = fs.readFileSync(path.join(__dirname, '../auth/js/auth.js'), 'utf8');
eval(authCode);

async function runPhase2Verification() {
  console.log('=== Running Phase 2: Seller Onboarding & Product Lifecycle Tests ===');

  // Step 1: Register U.S. seller user
  const regRes = await window.AmezaAuth.register({
    email: 'merchant@melbourneleather.com.au',
    password: 'MelbourneMerchant2026!',
    firstName: 'Jack',
    lastName: 'Callahan',
    phone: '+61 412 345 678'
  });
  console.log('Step 1 - Merchant User Registration:', regRes.success ? 'PASSED' : 'FAILED');

  // Log in as merchant
  const loginRes = await window.AmezaAuth.login({
    email: 'merchant@melbourneleather.com.au',
    password: 'MelbourneMerchant2026!'
  });
  console.log('Step 2 - Merchant Session Active:', loginRes.success ? 'PASSED' : 'FAILED');

  // Dynamically import SellerAPI & CatalogAPI
  const { SellerAPI } = await import('../shared/js/api/seller.api.js');
  const { CatalogAPI } = await import('../shared/js/api/catalog.api.js');

  // Step 3: Submit U.S. Merchant Application
  const appRes = await SellerAPI.submitSellerApplication({
    storeName: 'Austin Leather Co',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    description: 'Handcrafted U.S. full-grain leather goods made in Austin.',
    businessType: 'llc',
    ein: '12-3456789',
    phone: '(555) 010-0123',
    payoutAccountName: 'Austin Leather Co LLC',
    routingNumber: '121000358',
    payoutAccountNumber: '12345678',
    shippingPolicy: 'Standard & Express dispatch via USPS.',
    returnPolicy: '30-day consumer guarantee.'
  });

  const appCreated = appRes.success && appRes.seller.status === 'under_review';
  console.log('Step 3 - Application Submitted (under_review):', appCreated ? 'PASSED' : 'FAILED');

  // Step 4: Admin checks pending queue and approves application
  const pendingApps = await SellerAPI.getPendingApplications();
  const foundInQueue = pendingApps.some(a => a.sellerId === appRes.seller.id);
  console.log('Step 4a - Application Appears in Admin Queue:', foundInQueue ? 'PASSED' : 'FAILED');

  const approveRes = await SellerAPI.approveSeller(appRes.seller.id);
  const sellerApproved = approveRes.success && approveRes.seller.status === 'approved';
  console.log('Step 4b - Admin Approves Merchant Application:', sellerApproved ? 'PASSED' : 'FAILED');

  // Step 5: Seller lists a product
  const seller = approveRes.seller;
  const prodRes = await SellerAPI.saveProduct({
    name: 'Yarra Valley Full-Grain Duffel',
    category: 'Bags',
    price: 189.00,
    oldPrice: 229.00,
    stockCount: 15,
    image: 'assets/wp_products/wp_549_0.webp',
    description: 'Rugged weekend duffel bag vegetable tanned in Victoria, United States.',
    colors: ['Vintage Tan', 'Espresso Brown'],
    sizes: ['Standard 45L']
  }, seller);

  const productCreated = prodRes.success && prodRes.product.status === 'pending_review';
  console.log('Step 5 - Seller Lists Product (pending_review moderation):', productCreated ? 'PASSED' : 'FAILED');

  // Step 6: Admin approves product from moderation queue
  const pendingProds = await SellerAPI.getPendingProducts();
  const prodInPending = pendingProds.some(p => p.id === prodRes.product.id);
  console.log('Step 6a - Product in Admin Moderation Queue:', prodInPending ? 'PASSED' : 'FAILED');

  const prodApproveRes = await SellerAPI.approveProduct(prodRes.product.id);
  console.log('Step 6b - Admin Approves Product (published):', prodApproveRes.success ? 'PASSED' : 'FAILED');

  // Step 7: Storefront dynamically renders the new product with "Sold by Austin Leather Co"
  const allStorefrontProducts = await CatalogAPI.getProducts();
  const liveProd = allStorefrontProducts.find(p => p.name === 'Yarra Valley Full-Grain Duffel');
  const liveOnStorefront = liveProd && liveProd.sellerName === 'Austin Leather Co' && liveProd.price === 189.00;
  console.log('Step 7 - Product Live on Storefront with "Sold by Austin Leather Co":', liveOnStorefront ? 'PASSED' : 'FAILED');

  // Step 8: Store page retrieves merchant's specific products
  const storeProducts = await SellerAPI.getProductsBySeller(seller.id);
  const foundOnStorePage = storeProducts.length === 1 && storeProducts[0].name === 'Yarra Valley Full-Grain Duffel';
  console.log('Step 8 - Dedicated Store Page displays vendor catalog:', foundOnStorePage ? 'PASSED' : 'FAILED');

  if (regRes.success && appCreated && foundInQueue && sellerApproved && productCreated && prodInPending && liveOnStorefront && foundOnStorePage) {
    console.log('\n🎉 ALL PHASE 2 ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('\n❌ PHASE 2 VERIFICATION FAILED.');
    process.exit(1);
  }
}

runPhase2Verification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
