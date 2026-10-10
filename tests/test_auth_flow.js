/**
 * AMEZA Auth Flow Verification Test
 * Tests that:
 * 1. Clean registration and login works.
 * 2. Removed demo accounts and backdoor no longer work.
 * 3. Sessions and user storage operate securely without leaks.
 */

// Mock browser localStorage and crypto for Node test
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Simple sha256 mock matching the WebCrypto or pureJs
const crypto = require('crypto');
global.crypto = {
  subtle: {
    digest: async (algo, data) => {
      const hash = crypto.createHash('sha256').update(Buffer.from(data)).digest();
      return hash.buffer;
    }
  }
};

// Load auth engine
const fs = require('fs');
const path = require('path');
const authCode = fs.readFileSync(path.join(__dirname, '../auth/js/auth.js'), 'utf8');

// Evaluate in global context
global.window = global;
eval(authCode);

async function runTests() {
  console.log('--- Running AMEZA Auth Security Tests ---');

  // Test 1: Deleted demo accounts must NOT be present initially
  const usersBefore = window.AmezaAuth.findUserByEmail('abdulsamar411@gmail.com');
  console.log('Test 1 - Old demo user exists before registration:', usersBefore !== null ? 'FAILED (Still exists)' : 'PASSED (Clean state)');

  // Test 2: Attempt login with old demo user credentials -> Must fail
  const oldLoginRes = await window.AmezaAuth.login({
    email: 'abdulsamar411@gmail.com',
    password: 'Password123!'
  });
  console.log('Test 2 - Old demo account login rejected:', !oldLoginRes.success ? 'PASSED (Rejected)' : 'FAILED (Allowed)');

  // Test 3: Register a real user
  const regRes = await window.AmezaAuth.register({
    email: 'buyer@ameza.com',
    password: 'BuyerSecurePass2026!',
    firstName: 'Alice',
    lastName: 'Smith',
    phone: '+1 555 987 6543'
  });
  console.log('Test 3 - Fresh user registration:', regRes.success ? 'PASSED (Registered)' : `FAILED (${regRes.error})`);

  // Test 4: Login with the newly registered user
  const loginRes = await window.AmezaAuth.login({
    email: 'buyer@ameza.com',
    password: 'BuyerSecurePass2026!'
  });
  console.log('Test 4 - Login with fresh credentials:', loginRes.success ? 'PASSED (Logged in)' : `FAILED (${loginRes.error})`);

  // Test 5: Verify session contains proper user details and no password hashes
  const currentUser = window.AmezaAuth.getCurrentUser();
  const safeSession = currentUser && !currentUser.passwordHash && currentUser.email === 'buyer@ameza.com';
  console.log('Test 5 - Session sanitized (no password hash exposed):', safeSession ? 'PASSED' : 'FAILED');

  if (usersBefore === null && !oldLoginRes.success && regRes.success && loginRes.success && safeSession) {
    console.log('\n🎉 ALL AUTH MIGRATION & HARDENING TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME AUTH TESTS FAILED.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
