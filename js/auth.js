/**
 * AMEZA Auth Engine — js/auth.js
 * ============================================================
 * ⚠️ DEMO / CLIENT-SIDE AUTHENTICATION ONLY ⚠️
 *
 * This module implements a localStorage-based authentication system
 * for a static HTML ecommerce site. It is NOT suitable for production
 * authentication. Passwords are hashed using Web Crypto API SHA-256
 * (client-side), and all state is stored in the browser's localStorage.
 *
 * For real production authentication, move authentication, password
 * hashing, sessions, email verification, password reset, and 2FA
 * secrets to a secure backend/database.
 * ============================================================
 *
 * localStorage Keys:
 *   ameza_users           — Array of user objects
 *   ameza_session         — Current session object
 *   ameza_orders          — All orders (ameza_orders_{userId})
 *   ameza_addresses       — Addresses (ameza_addresses_{userId})
 *   ameza_2fa             — 2FA config (ameza_2fa_{userId})
 *   ameza_recovery_codes  — Recovery codes (ameza_recovery_codes_{userId})
 *   ameza_reset_tokens    — Password reset tokens
 *   ameza_verify_tokens   — Email verification tokens
 */

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEYS = {
  USERS: 'ameza_users',
  SESSION: 'ameza_session',
  RESET_TOKENS: 'ameza_reset_tokens',
  VERIFY_TOKENS: 'ameza_verify_tokens',
};

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;          // 1 hour
const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;    // 24 hours

// ============================================================
// CRYPTO HELPERS (Web Crypto + Pure JS Fallback)
// ============================================================

function pureJsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const unescaped = encodeURIComponent(ascii || '').replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1));
  const utf8Len = unescaped.length;
  const utf8BitLen = utf8Len * 8;
  let str = unescaped + '\x80';
  while (str[lengthProperty] % 64 - 56) str += '\x00';
  for (i = 0; i < str[lengthProperty]; i++) {
    j = str.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((utf8BitLen / maxWord) | 0);
  words[words[lengthProperty]] = (utf8BitLen | 0);
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? (w[i] || 0) : (
            (w[i - 16] || 0)
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + (w[i - 7] || 0)
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Hash a string using SHA-256 via Web Crypto API (if available) or Pure JS fallback.
 */
async function sha256(str) {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback to pure JS below
  }
  return pureJsSha256(str);
}

/**
 * Generate a cryptographically random hex string of given byte length.
 */
function randomHex(byteCount = 16) {
  try {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const arr = new Uint8Array(byteCount);
      window.crypto.getRandomValues(arr);
      return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  let res = '';
  for (let i = 0; i < byteCount; i++) {
    res += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return res;
}

/**
 * Generate a unique session ID.
 */
function generateSessionId() {
  return 'sess_' + randomHex(24);
}

// ============================================================
// TOTP ENGINE (RFC 6238)
// ============================================================
// ⚠️ DEMO: The TOTP secret is stored in localStorage. In production,
// the secret must be stored server-side and TOTP verified server-side.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random Base32 secret (20 bytes = 160 bits).
 */
function generateTOTPSecret() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i];
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      result += BASE32_CHARS[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) {
    result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 31];
  }
  return result;
}

/**
 * Decode a Base32 string to a Uint8Array.
 */
function base32Decode(base32) {
  const str = base32.toUpperCase().replace(/=+$/, '');
  let buffer = 0;
  let bitsLeft = 0;
  const output = [];
  for (const char of str) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      output.push((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(output);
}

/**
 * Compute TOTP code for a given secret and time (RFC 6238 / RFC 4226).
 * Uses HMAC-SHA1 with 30-second time steps and 6-digit output.
 */
async function computeTOTP(secret, time = Date.now()) {
  const timeStep = Math.floor(time / 1000 / 30);

  // Encode counter as 8-byte big-endian
  const counter = new ArrayBuffer(8);
  const view = new DataView(counter);
  const high = Math.floor(timeStep / 0x100000000);
  const low = timeStep >>> 0;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);

  // Import the key
  const keyBytes = base32Decode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  // Sign
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counter);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * Verify a TOTP code. Allows ±1 time step for clock drift.
 */
async function verifyTOTP(secret, enteredCode) {
  const now = Date.now();
  for (const offset of [-1, 0, 1]) {
    const expected = await computeTOTP(secret, now + offset * 30 * 1000);
    if (expected === enteredCode.trim()) return true;
  }
  return false;
}

/**
 * Generate an otpauth:// URI for QR code generation.
 */
function generateOtpauthURI(secret, email, issuer = 'AMEZA') {
  const enc = encodeURIComponent;
  return `otpauth://totp/${enc(issuer)}:${enc(email)}?secret=${secret}&issuer=${enc(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// ============================================================
// RECOVERY CODES
// ============================================================

/**
 * Generate 8 one-time recovery codes (random 10-char alphanumeric).
 * Returns { plainCodes, hashedCodes }
 */
async function generateRecoveryCodes() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const plainCodes = [];
  for (let i = 0; i < 8; i++) {
    const arr = new Uint8Array(10);
    crypto.getRandomValues(arr);
    let code = '';
    for (let j = 0; j < 10; j++) {
      code += chars[arr[j] % chars.length];
    }
    // Format as XXXXX-XXXXX
    plainCodes.push(code.slice(0, 5) + '-' + code.slice(5));
  }
  const hashedCodes = await Promise.all(
    plainCodes.map(c => sha256(c.replace('-', '')))
  );
  return { plainCodes, hashedCodes };
}

/**
 * Check a recovery code against stored hashed codes.
 * Returns the index if valid, -1 if invalid.
 */
async function checkRecoveryCode(enteredCode, hashedCodes) {
  const normalized = enteredCode.replace('-', '').toUpperCase().trim();
  const enteredHash = await sha256(normalized);
  return hashedCodes.indexOf(enteredHash);
}

// ============================================================
// USER STORAGE HELPERS
// ============================================================

const DEMO_USER_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // sha256 of 'password'

function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      // Seed default demo user
      const initialUsers = [
        {
          id: 'usr_demo_001',
          firstName: 'Samar',
          lastName: 'Umar',
          email: 'abdulsamar411@gmail.com',
          phone: '+923332478690',
          passwordHash: 'b55ab9c57b8e74b2e531e0396efeeed67d973c0dea285e129228f01502f50cf6', // Samar7861-
          emailVerified: true,
          verifyToken: 'token_demo_samar',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          twoFAEnabled: false,
        },
        {
          id: 'usr_demo_002',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@ameza.com',
          phone: '+1 (555) 123-4567',
          passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // Password123!
          emailVerified: true,
          verifyToken: 'token_demo_user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          twoFAEnabled: false,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      return initialUsers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('getUsers error:', e);
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('saveUsers error:', e);
  }
}

function findUserByEmail(email) {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  return getUsers().find(u => u && u.email && u.email.toLowerCase().trim() === clean);
}

function findUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u && u.id === id);
}

function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u && u.id === id);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates, updatedAt: Date.now() };
  saveUsers(users);
  return true;
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isLoggedIn() {
  const session = getSession();
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }
  return true;
}

function getCurrentUser() {
  if (!isLoggedIn()) return null;
  const session = getSession();
  return findUserById(session.userId);
}

function createSession(userId, remember = true) {
  const session = {
    sessionId: generateSessionId(),
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Browser',
    remember,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {}
  return session;
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (e) {}
}

// ============================================================
// AUTHENTICATION FLOWS
// ============================================================

/**
 * Register a new user.
 * Returns { success, error, userId, user }
 */
async function register({ firstName, lastName, email, password, phone = '', autoLogin = true }) {
  if (!firstName || !lastName || !email || !password) {
    return { success: false, error: 'All required fields must be filled.' };
  }

  const emailLower = email.toLowerCase().trim();
  const existing = findUserByEmail(emailLower);
  if (existing) {
    // Check if password matches existing account to auto-login, otherwise inform user
    const existingHash = await sha256(password);
    if (existing.passwordHash === existingHash) {
      if (autoLogin) createSession(existing.id, true);
      return { success: true, userId: existing.id, user: existing, isExisting: true };
    }
    return { success: false, error: 'An account with this email already exists. Please Sign In.' };
  }

  const passwordHash = await sha256(password);
  const userId = 'usr_' + randomHex(12);

  // Generate email verification token
  const verifyToken = randomHex(32);
  const verifyExpiry = Date.now() + VERIFY_TOKEN_EXPIRY_MS;
  saveVerifyToken(verifyToken, { userId, email: emailLower, expiresAt: verifyExpiry });

  const user = {
    id: userId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: emailLower,
    phone: phone ? phone.trim() : '',
    passwordHash,
    emailVerified: true, // Activated immediately for instant shopping & dashboard access
    verifyToken,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    twoFAEnabled: false,
  };

  const users = getUsers();
  users.push(user);
  saveUsers(users);

  // Auto-login session creation
  if (autoLogin) {
    createSession(userId, true);
  }

  return { success: true, userId, user, verifyToken };
}

/**
 * Login with email + password.
 * Returns { success, error, requiresTwoFA, userId, user }
 */
async function login({ email, password, remember = true }) {
  if (!email || !password) {
    return { success: false, error: 'Please enter both your email address and password.' };
  }

  const emailLower = email.toLowerCase().trim();
  let user = findUserByEmail(emailLower);

  // If user not found, check if it's the Samar Umar account from screenshot
  if (!user && emailLower === 'abdulsamar411@gmail.com') {
    const defaultHash = 'b55ab9c57b8e74b2e531e0396efeeed67d973c0dea285e129228f01502f50cf6'; // Samar7861-
    const users = getUsers();
    user = {
      id: 'usr_' + randomHex(12),
      firstName: 'Samar',
      lastName: 'Umar',
      email: 'abdulsamar411@gmail.com',
      phone: '+923332478690',
      passwordHash: defaultHash,
      emailVerified: true,
      verifyToken: randomHex(32),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      twoFAEnabled: false,
    };
    users.push(user);
    saveUsers(users);
  }

  if (!user) {
    return { success: false, error: 'Incorrect email or password. Please check your credentials.' };
  }

  const hash = await sha256(password);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Incorrect email or password. Please check your credentials.' };
  }

  // Check 2FA
  if (user.twoFAEnabled) {
    return { success: false, requiresTwoFA: true, userId: user.id };
  }

  createSession(user.id, remember);
  return { success: true, userId: user.id, user };
}

/**
 * Complete login after 2FA verification.
 */
async function completeTwoFALogin({ userId, code, remember = true }) {
  const user = findUserById(userId);
  if (!user || !user.twoFAEnabled) {
    return { success: false, error: 'Invalid authentication attempt.' };
  }

  // Get 2FA config
  const config = getTwoFAConfig(userId);
  if (!config) {
    return { success: false, error: '2FA configuration not found.' };
  }

  // Try TOTP first
  const totpValid = await verifyTOTP(config.secret, code);
  if (totpValid) {
    createSession(userId, remember);
    return { success: true, userId };
  }

  // Try recovery code
  const storedCodes = getRecoveryCodes(userId);
  if (storedCodes && storedCodes.length > 0) {
    const codeIndex = await checkRecoveryCode(code, storedCodes);
    if (codeIndex !== -1) {
      // Mark code as used (remove it)
      const updatedCodes = storedCodes.filter((_, i) => i !== codeIndex);
      saveRecoveryCodes(userId, updatedCodes);
      createSession(userId, remember);
      return { success: true, userId, usedRecoveryCode: true, codesRemaining: updatedCodes.length };
    }
  }

  return { success: false, error: 'Invalid verification code.' };
}

function logout() {
  clearSession();
}

/**
 * Require authentication — redirects to login if not logged in.
 */
function requireAuth(redirectBack = true) {
  if (!isLoggedIn()) {
    const currentPage = encodeURIComponent(window.location.href);
    window.location.href = redirectBack
      ? `login.html?redirect=${currentPage}`
      : 'login.html';
    return false;
  }
  return true;
}

// ============================================================
// EMAIL VERIFICATION
// ============================================================

function getVerifyTokens() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFY_TOKENS) || '{}');
}

function saveVerifyToken(token, data) {
  const tokens = getVerifyTokens();
  tokens[token] = data;
  localStorage.setItem(STORAGE_KEYS.VERIFY_TOKENS, JSON.stringify(tokens));
}

function verifyEmail(token) {
  const tokens = getVerifyTokens();
  const data = tokens[token];
  if (!data) return { success: false, error: 'Invalid verification link.' };
  if (Date.now() > data.expiresAt) {
    return { success: false, error: 'Verification link has expired. Please request a new one.' };
  }

  // Mark user as verified
  updateUser(data.userId, { emailVerified: true, verifyToken: null });

  // Remove used token
  delete tokens[token];
  localStorage.setItem(STORAGE_KEYS.VERIFY_TOKENS, JSON.stringify(tokens));

  return { success: true, userId: data.userId };
}

function resendVerificationEmail(userId) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };
  if (user.emailVerified) return { success: false, error: 'Email is already verified.' };

  const newToken = randomHex(32);
  const expiry = Date.now() + VERIFY_TOKEN_EXPIRY_MS;
  saveVerifyToken(newToken, { userId, email: user.email, expiresAt: expiry });
  updateUser(userId, { verifyToken: newToken });

  return { success: true, token: newToken };
}

// ============================================================
// PASSWORD RESET
// ============================================================

function getResetTokens() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
}

function saveResetToken(token, data) {
  const tokens = getResetTokens();
  tokens[token] = data;
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(tokens));
}

/**
 * Initiate password reset flow.
 * NOTE: Does NOT reveal if email exists.
 */
function requestPasswordReset(email) {
  const user = findUserByEmail(email);
  if (!user) {
    // Return success anyway to prevent email enumeration
    return { success: true, simulated: true };
  }

  const token = randomHex(40);
  const expiry = Date.now() + RESET_TOKEN_EXPIRY_MS;
  saveResetToken(token, { userId: user.id, email: user.email, expiresAt: expiry, used: false });

  return { success: true, token, simulated: false };
}

function validateResetToken(token) {
  const tokens = getResetTokens();
  const data = tokens[token];
  if (!data) return { valid: false, error: 'Invalid reset link.' };
  if (data.used) return { valid: false, error: 'This reset link has already been used.' };
  if (Date.now() > data.expiresAt) return { valid: false, error: 'Reset link has expired. Please request a new one.' };
  return { valid: true, data };
}

async function resetPassword(token, newPassword) {
  const validation = validateResetToken(token);
  if (!validation.valid) return { success: false, error: validation.error };

  const { data } = validation;
  const passwordHash = await sha256(newPassword);

  updateUser(data.userId, { passwordHash, updatedAt: Date.now() });

  // Mark token as used
  const tokens = getResetTokens();
  tokens[token].used = true;
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(tokens));

  // Clear any active sessions (security)
  const session = getSession();
  if (session && session.userId === data.userId) {
    clearSession();
  }

  return { success: true };
}

// ============================================================
// PROFILE MANAGEMENT
// ============================================================

async function updateProfile(userId, { firstName, lastName, phone }) {
  if (!firstName || !lastName) {
    return { success: false, error: 'First name and last name are required.' };
  }
  updateUser(userId, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: (phone || '').trim(),
    updatedAt: Date.now(),
  });
  return { success: true };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const currentHash = await sha256(currentPassword);
  if (currentHash !== user.passwordHash) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newHash = await sha256(newPassword);
  updateUser(userId, { passwordHash: newHash, updatedAt: Date.now() });
  return { success: true };
}

async function changeEmail(userId, { newEmail, currentPassword }) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const hash = await sha256(currentPassword);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Password is incorrect.' };
  }

  const existing = findUserByEmail(newEmail);
  if (existing && existing.id !== userId) {
    return { success: false, error: 'This email address is already in use.' };
  }

  const verifyToken = randomHex(32);
  const expiry = Date.now() + VERIFY_TOKEN_EXPIRY_MS;
  saveVerifyToken(verifyToken, { userId, email: newEmail.toLowerCase().trim(), expiresAt: expiry });
  updateUser(userId, {
    email: newEmail.toLowerCase().trim(),
    emailVerified: false,
    verifyToken,
    updatedAt: Date.now(),
  });

  return { success: true, token: verifyToken };
}

// ============================================================
// ADDRESS MANAGEMENT
// ============================================================

function getAddresses(userId) {
  return JSON.parse(localStorage.getItem(`ameza_addresses_${userId}`) || '[]');
}

function saveAddresses(userId, addresses) {
  localStorage.setItem(`ameza_addresses_${userId}`, JSON.stringify(addresses));
}

function addAddress(userId, address) {
  const addresses = getAddresses(userId);
  const newAddress = {
    id: 'addr_' + randomHex(8),
    ...address,
    isDefault: addresses.length === 0, // first address is default
    createdAt: Date.now(),
  };
  addresses.push(newAddress);
  saveAddresses(userId, addresses);
  return { success: true, address: newAddress };
}

function updateAddress(userId, addressId, updates) {
  const addresses = getAddresses(userId);
  const idx = addresses.findIndex(a => a.id === addressId);
  if (idx === -1) return { success: false, error: 'Address not found.' };
  addresses[idx] = { ...addresses[idx], ...updates, updatedAt: Date.now() };
  saveAddresses(userId, addresses);
  return { success: true };
}

function deleteAddress(userId, addressId) {
  let addresses = getAddresses(userId);
  const addr = addresses.find(a => a.id === addressId);
  if (!addr) return { success: false, error: 'Address not found.' };

  addresses = addresses.filter(a => a.id !== addressId);

  // If deleted was default, set next one as default
  if (addr.isDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  saveAddresses(userId, addresses);
  return { success: true };
}

function setDefaultAddress(userId, addressId) {
  const addresses = getAddresses(userId);
  addresses.forEach(a => { a.isDefault = (a.id === addressId); });
  saveAddresses(userId, addresses);
  return { success: true };
}

// ============================================================
// ORDER MANAGEMENT
// ============================================================

function getOrders(userId) {
  return JSON.parse(localStorage.getItem(`ameza_orders_${userId}`) || '[]');
}

function saveOrders(userId, orders) {
  localStorage.setItem(`ameza_orders_${userId}`, JSON.stringify(orders));
}

function addOrder(userId, order) {
  const orders = getOrders(userId);
  const newOrder = {
    id: order.id || ('AMZ-' + Math.floor(100000 + Math.random() * 900000)),
    ...order,
    createdAt: Date.now(),
  };
  orders.unshift(newOrder);
  saveOrders(userId, orders);
  return newOrder;
}

function getOrderById(userId, orderId) {
  return getOrders(userId).find(o => o.id === orderId);
}

// ============================================================
// 2FA MANAGEMENT
// ============================================================
// ⚠️ DEMO: Storing the TOTP secret in localStorage is NOT secure for production.

function getTwoFAConfig(userId) {
  return JSON.parse(localStorage.getItem(`ameza_2fa_${userId}`) || 'null');
}

function saveTwoFAConfig(userId, config) {
  localStorage.setItem(`ameza_2fa_${userId}`, JSON.stringify(config));
}

function getRecoveryCodes(userId) {
  return JSON.parse(localStorage.getItem(`ameza_recovery_codes_${userId}`) || '[]');
}

function saveRecoveryCodes(userId, hashedCodes) {
  localStorage.setItem(`ameza_recovery_codes_${userId}`, JSON.stringify(hashedCodes));
}

/**
 * Begin 2FA setup — generates secret and otpauth URI.
 */
async function beginTwoFASetup(userId) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const secret = generateTOTPSecret();
  const uri = generateOtpauthURI(secret, user.email);

  // Store pending setup (not yet confirmed)
  saveTwoFAConfig(userId, { secret, enabled: false, pendingSetup: true });

  return { success: true, secret, uri };
}

/**
 * Verify setup code and enable 2FA. Generate recovery codes.
 */
async function confirmTwoFASetup(userId, code) {
  const config = getTwoFAConfig(userId);
  if (!config || !config.pendingSetup) {
    return { success: false, error: '2FA setup not in progress.' };
  }

  const valid = await verifyTOTP(config.secret, code);
  if (!valid) {
    return { success: false, error: 'Invalid verification code. Please check your authenticator app.' };
  }

  // Enable 2FA
  saveTwoFAConfig(userId, { secret: config.secret, enabled: true, pendingSetup: false, enabledAt: Date.now() });
  updateUser(userId, { twoFAEnabled: true });

  // Generate recovery codes
  const { plainCodes, hashedCodes } = await generateRecoveryCodes();
  saveRecoveryCodes(userId, hashedCodes);

  return { success: true, recoveryCodes: plainCodes };
}

/**
 * Disable 2FA — requires current password AND current TOTP code (or recovery code).
 */
async function disableTwoFA(userId, { password, code }) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  // Verify password
  const passwordHash = await sha256(password);
  if (passwordHash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  // Verify TOTP or recovery code
  const config = getTwoFAConfig(userId);
  if (!config || !config.enabled) {
    return { success: false, error: '2FA is not enabled.' };
  }

  const totpValid = await verifyTOTP(config.secret, code);
  if (!totpValid) {
    // Try recovery code
    const storedCodes = getRecoveryCodes(userId);
    const codeIndex = await checkRecoveryCode(code, storedCodes);
    if (codeIndex === -1) {
      return { success: false, error: 'Invalid verification code.' };
    }
    // Use the recovery code
    const updatedCodes = storedCodes.filter((_, i) => i !== codeIndex);
    saveRecoveryCodes(userId, updatedCodes);
  }

  // Disable
  saveTwoFAConfig(userId, { secret: null, enabled: false });
  updateUser(userId, { twoFAEnabled: false });
  localStorage.removeItem(`ameza_recovery_codes_${userId}`);

  return { success: true };
}

/**
 * Regenerate recovery codes (invalidates existing ones).
 */
async function regenerateRecoveryCodes(userId, { password }) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const hash = await sha256(password);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  const { plainCodes, hashedCodes } = await generateRecoveryCodes();
  saveRecoveryCodes(userId, hashedCodes);

  return { success: true, recoveryCodes: plainCodes };
}

// ============================================================
// DELETE ACCOUNT
// ============================================================

async function deleteAccount(userId, { password }) {
  const user = findUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const hash = await sha256(password);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  // Remove user
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);

  // Remove all user-specific data
  localStorage.removeItem(`ameza_orders_${userId}`);
  localStorage.removeItem(`ameza_addresses_${userId}`);
  localStorage.removeItem(`ameza_2fa_${userId}`);
  localStorage.removeItem(`ameza_recovery_codes_${userId}`);

  // Clear session
  clearSession();

  return { success: true };
}

// ============================================================
// ACCOUNT ICON & PROFILE HEADER HELPER
// ============================================================

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Update all account elements on the page based on login state.
 * Transforms the account button in header into a user profile pill & dropdown.
 * Called on DOMContentLoaded and whenever auth state changes.
 */
function updateAccountIconState() {
  const loggedIn = isLoggedIn();
  const user = loggedIn ? getCurrentUser() : null;

  // 1. Process all header actions containers
  const headerActionsList = document.querySelectorAll('.header-actions');

  headerActionsList.forEach(actionsBar => {
    let wrapper = actionsBar.querySelector('.header-user-menu-wrapper');
    let existingBtn = actionsBar.querySelector('#header-account-btn') || actionsBar.querySelector('[data-action="open-account"]');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'header-user-menu-wrapper';
      wrapper.id = 'header-user-menu-wrapper';
      if (existingBtn) {
        existingBtn.parentNode.insertBefore(wrapper, existingBtn);
        existingBtn.remove();
      } else {
        actionsBar.insertBefore(wrapper, actionsBar.firstChild);
      }
    }

    if (loggedIn && user) {
      const firstInitial = (user.firstName ? user.firstName.charAt(0) : '').toUpperCase() || 'U';
      const lastInitial = (user.lastName ? user.lastName.charAt(0) : '').toUpperCase() || '';
      const initials = (firstInitial + lastInitial) || 'U';
      const displayName = user.firstName || 'Profile';
      const fullName = (user.firstName + ' ' + (user.lastName || '')).trim() || 'My Account';
      const email = user.email || '';

      wrapper.innerHTML = `
        <button class="header-profile-pill" id="header-profile-pill" aria-expanded="false" aria-haspopup="true" type="button" title="Account Menu: ${escapeHTML(fullName)}">
          <div class="header-avatar-circle">
            <span class="header-avatar-text">${initials}</span>
            <span class="header-avatar-status-dot"></span>
          </div>
          <span class="header-profile-name">${escapeHTML(displayName)}</span>
          <svg class="header-profile-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>

        <div class="header-profile-dropdown" id="header-profile-dropdown" role="menu">
          <div class="header-dropdown-user-card">
            <div class="header-dropdown-avatar">${initials}</div>
            <div class="header-dropdown-info">
              <div class="header-dropdown-name">${escapeHTML(fullName)}</div>
              <div class="header-dropdown-email">${escapeHTML(email)}</div>
              <div class="header-dropdown-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Verified Member</span>
              </div>
            </div>
          </div>

          <div class="header-dropdown-divider"></div>

          <div class="header-dropdown-links">
            <a href="account.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">Account Dashboard</span>
                <span class="item-sub">Overview &amp; quick summary</span>
              </div>
            </a>

            <a href="account-orders.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">My Orders</span>
                <span class="item-sub">Track &amp; manage purchases</span>
              </div>
            </a>

            <a href="account-profile.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">Personal Profile</span>
                <span class="item-sub">Edit name, email &amp; phone</span>
              </div>
            </a>

            <a href="account-addresses.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">Saved Addresses</span>
                <span class="item-sub">Manage shipping addresses</span>
              </div>
            </a>

            <a href="account-wishlist.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">My Wishlist</span>
                <span class="item-sub">Saved favorite products</span>
              </div>
            </a>

            <a href="account-security.html" class="header-dropdown-item" role="menuitem">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">Security &amp; 2FA</span>
                <span class="item-sub">Password, 2FA &amp; sessions</span>
              </div>
            </a>
          </div>

          <div class="header-dropdown-divider"></div>

          <div class="header-dropdown-footer">
            <button type="button" class="header-dropdown-logout-btn" id="header-profile-logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      `;

      // Setup Pill click toggle
      const pillBtn = wrapper.querySelector('#header-profile-pill');
      if (pillBtn) {
        pillBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = wrapper.classList.toggle('is-open');
          pillBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      // Setup Logout button in dropdown
      const logoutBtn = wrapper.querySelector('#header-profile-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          logout();
          updateAccountIconState();
          if (window.location.pathname.includes('account-') || window.location.pathname.includes('account.html')) {
            window.location.href = 'login.html';
          } else {
            window.location.reload();
          }
        });
      }
    } else {
      // Logged out guest state
      wrapper.innerHTML = `
        <button class="action-btn header-account-guest-btn" id="header-account-btn" title="Sign In / Register" aria-label="Account" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>

        <div class="header-profile-dropdown header-guest-dropdown" id="header-profile-dropdown" role="menu">
          <div class="header-guest-dropdown-head">
            <div class="header-guest-title">Welcome to AMEZA</div>
            <div class="header-guest-subtitle">Sign in to view orders, wishlist &amp; save details.</div>
          </div>
          <div class="header-guest-actions">
            <a href="login.html" class="header-guest-btn-primary">Sign In</a>
            <a href="signup.html" class="header-guest-btn-secondary">Create Account</a>
          </div>
          <div class="header-dropdown-divider"></div>
          <div class="header-dropdown-links">
            <a href="login.html?redirect=account-orders.html" class="header-dropdown-item">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">Track Your Order</span>
                <span class="item-sub">Check shipping &amp; delivery</span>
              </div>
            </a>
            <a href="login.html?redirect=account-wishlist.html" class="header-dropdown-item">
              <div class="header-dropdown-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <div class="header-dropdown-item-text">
                <span class="item-title">My Wishlist</span>
                <span class="item-sub">View saved items</span>
              </div>
            </a>
          </div>
        </div>
      `;

      const guestBtn = wrapper.querySelector('#header-account-btn');
      if (guestBtn) {
        guestBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = wrapper.classList.toggle('is-open');
          guestBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    }
  });

  // 2. Update standalone top-bar links
  const topBarAccountLinks = document.querySelectorAll('.top-bar-account-link');
  topBarAccountLinks.forEach(link => {
    if (loggedIn && user) {
      link.textContent = `Hi, ${user.firstName}`;
      link.href = 'account.html';
    } else {
      link.textContent = 'Sign In / Register';
      link.href = 'login.html';
    }
  });

  // 3. Attach global close listener once
  if (!window._headerDropdownListenerAttached) {
    window._headerDropdownListenerAttached = true;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-user-menu-wrapper')) {
        document.querySelectorAll('.header-user-menu-wrapper.is-open').forEach(w => {
          w.classList.remove('is-open');
          const btn = w.querySelector('button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.header-user-menu-wrapper.is-open').forEach(w => {
          w.classList.remove('is-open');
          const btn = w.querySelector('button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
}

// ============================================================
// HEAVY MOBILE SIDE DRAWER SYSTEM
// ============================================================

function buildHeavyMobileDrawer() {
  let backdrop = document.getElementById('heavy-drawer-backdrop');
  let drawer = document.getElementById('heavy-mobile-drawer');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'heavy-drawer-backdrop';
    backdrop.className = 'heavy-drawer-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', closeHeavyMobileDrawer);
  }

  if (!drawer) {
    drawer = document.createElement('aside');
    drawer.id = 'heavy-mobile-drawer';
    drawer.className = 'heavy-mobile-drawer';
    document.body.appendChild(drawer);
  }

  const loggedIn = isLoggedIn();
  const user = loggedIn ? getCurrentUser() : null;

  // Initial user avatar / names
  const firstInitial = (user?.firstName ? user.firstName.charAt(0) : '').toUpperCase() || 'U';
  const lastInitial = (user?.lastName ? user.lastName.charAt(0) : '').toUpperCase() || '';
  const initials = (firstInitial + lastInitial) || 'U';
  const fullName = user ? (user.firstName + ' ' + (user.lastName || '')).trim() : 'Guest User';
  const email = user ? (user.email || '') : '';

  // Get orders count
  let ordersCount = 0;
  try {
    const orders = getOrders();
    ordersCount = Array.isArray(orders) ? orders.length : 0;
  } catch (e) {}

  // Get wishlist count
  let wishCount = 0;
  try {
    const wish = JSON.parse(localStorage.getItem('ameza_wishlist')) || [];
    wishCount = wish.length;
  } catch (e) {}

  // Get active currency
  let currCode = 'USD';
  let currSymbol = '$';
  if (window.AmezaCurrency) {
    currCode = window.AmezaCurrency.getCurrencyCode();
    currSymbol = window.AmezaCurrency.getCurrency().symbol.trim();
  }

  // Profile or Guest Card HTML
  const userCardHTML = loggedIn ? `
    <div class="heavy-drawer-user-card">
      <div class="heavy-drawer-user-main">
        <div class="heavy-drawer-avatar">
          <span>${initials}</span>
          <span class="heavy-drawer-avatar-dot"></span>
        </div>
        <div class="heavy-drawer-user-meta">
          <div class="heavy-drawer-user-name">${escapeHTML(fullName)}</div>
          <div class="heavy-drawer-user-email">${escapeHTML(email)}</div>
          <span class="heavy-drawer-user-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Verified Member
          </span>
        </div>
      </div>
    </div>
  ` : `
    <div class="heavy-drawer-guest-card">
      <div class="heavy-drawer-guest-title">Welcome to AMEZA Store</div>
      <p class="heavy-drawer-guest-sub">Sign in to track orders, save wishlist items & manage reservations</p>
      <div class="heavy-drawer-guest-btns">
        <a href="login.html" class="heavy-drawer-btn-signin"><i class="fa-solid fa-right-to-bracket" style="margin-right:6px;"></i> Sign In</a>
        <a href="signup.html" class="heavy-drawer-btn-signup"><i class="fa-solid fa-user-plus" style="margin-right:6px;"></i> Register</a>
      </div>
    </div>
  `;

  // Quick Stats Bar
  const statsHTML = `
    <div class="heavy-drawer-stats">
      <a href="${loggedIn ? 'account-orders.html' : 'login.html?redirect=account-orders.html'}" class="heavy-drawer-stat-item">
        <span class="heavy-drawer-stat-num">${ordersCount}</span>
        <span class="heavy-drawer-stat-label">Orders</span>
      </a>
      <a href="wishlist.html" class="heavy-drawer-stat-item">
        <span class="heavy-drawer-stat-num">${wishCount}</span>
        <span class="heavy-drawer-stat-label">Wishlist</span>
      </a>
      <a href="javascript:void(0)" class="heavy-drawer-stat-item" id="drawer-currency-btn" data-action="open-currency-modal">
        <span class="heavy-drawer-stat-num" style="font-size:0.88rem;">${currCode}</span>
        <span class="heavy-drawer-stat-label">${currSymbol} Currency</span>
      </a>
    </div>
  `;

  drawer.innerHTML = `
    <div class="heavy-drawer-head">
      <a href="index.html" class="heavy-drawer-logo">
        <img src="assets/amezashopify logo.png" alt="AMEZA Logo" onerror="this.src='assets/logo.png'">
      </a>
      <button class="heavy-drawer-close" id="heavy-drawer-close-btn" aria-label="Close menu">&times;</button>
    </div>

    ${userCardHTML}
    ${statsHTML}

    <div class="heavy-drawer-body">
      <!-- Section 1: Store Categories -->
      <div class="heavy-drawer-section">
        <div class="heavy-drawer-section-title">
          <span>Shopping Categories</span>
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <a href="index.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-house"></i></span>
            <span>Home Store</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-clothes-jewellery" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-shirt"></i></span>
            <span>Clothing &amp; Apparel</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-electronics-watches" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-headphones"></i></span>
            <span>Electronics &amp; Gadgets</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-electronics-watches" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-clock"></i></span>
            <span>Luxury Watches</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-leather-collection" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-tape"></i></span>
            <span>Genuine Leather Belts</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-leather-collection" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-wallet"></i></span>
            <span>Wallets &amp; Purses</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#section-latest-range" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-bag-shopping"></i></span>
            <span>Bags &amp; Totes</span>
          </div>
          <span class="heavy-drawer-tag-new">NEW</span>
        </a>
        <a href="index.html#section-deals" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:#EA580C;"><i class="fa-solid fa-fire"></i></span>
            <span style="color:#EA580C; font-weight:750;">Limited Deals</span>
          </div>
          <span class="heavy-drawer-tag-deal">50% OFF</span>
        </a>
      </div>

      <!-- Section 2: Travel & Booking Services -->
      <div class="heavy-drawer-section">
        <div class="heavy-drawer-section-title">
          <span>Travel &amp; Booking Services</span>
          <i class="fa-solid fa-plane-departure"></i>
        </div>
        <a href="stays.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:var(--primary, #7DBA35);"><i class="fa-solid fa-bed"></i></span>
            <span>Stay (Hotels &amp; Resorts)</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="car-rental.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:var(--primary, #7DBA35);"><i class="fa-solid fa-car"></i></span>
            <span>Car Rental &amp; Chauffeur</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="attractions.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:var(--primary, #7DBA35);"><i class="fa-solid fa-ticket"></i></span>
            <span>Attractions &amp; Tours</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="airport-taxis.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:var(--primary, #7DBA35);"><i class="fa-solid fa-taxi"></i></span>
            <span>Airport Taxis &amp; Transfers</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="flights.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon" style="color:var(--primary, #7DBA35);"><i class="fa-solid fa-plane-departure"></i></span>
            <span>Worldwide Flight Bookings</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
      </div>

      <!-- Section 3: Customer Account Hub (when logged in) -->
      ${loggedIn ? `
        <div class="heavy-drawer-section">
          <div class="heavy-drawer-section-title">
            <span>My Account &amp; Settings</span>
            <i class="fa-solid fa-user-gear"></i>
          </div>
          <a href="account.html" class="heavy-drawer-link">
            <div class="heavy-drawer-link-left">
              <span class="heavy-drawer-icon"><i class="fa-solid fa-gauge"></i></span>
              <span>Account Dashboard</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
          </a>
          <a href="account-orders.html" class="heavy-drawer-link">
            <div class="heavy-drawer-link-left">
              <span class="heavy-drawer-icon"><i class="fa-solid fa-box"></i></span>
              <span>Orders &amp; Tracking</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
          </a>
          <a href="account-profile.html" class="heavy-drawer-link">
            <div class="heavy-drawer-link-left">
              <span class="heavy-drawer-icon"><i class="fa-solid fa-user"></i></span>
              <span>Personal Profile</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
          </a>
          <a href="account-addresses.html" class="heavy-drawer-link">
            <div class="heavy-drawer-link-left">
              <span class="heavy-drawer-icon"><i class="fa-solid fa-location-dot"></i></span>
              <span>Saved Addresses</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
          </a>
          <a href="account-security.html" class="heavy-drawer-link">
            <div class="heavy-drawer-link-left">
              <span class="heavy-drawer-icon"><i class="fa-solid fa-shield-halved"></i></span>
              <span>Security &amp; 2FA</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
          </a>
        </div>
      ` : ''}

      <!-- Section 4: Help & Support -->
      <div class="heavy-drawer-section">
        <div class="heavy-drawer-section-title">
          <span>Customer Support</span>
          <i class="fa-solid fa-headset"></i>
        </div>
        <a href="account-orders.html" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-clipboard-list"></i></span>
            <span>Track My Order</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
        <a href="index.html#newsletter" class="heavy-drawer-link">
          <div class="heavy-drawer-link-left">
            <span class="heavy-drawer-icon"><i class="fa-solid fa-envelope-open-text"></i></span>
            <span>Newsletter &amp; VIP Perks</span>
          </div>
          <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:#CBD5E1;"></i>
        </a>
      </div>
    </div>

    <!-- Drawer Footer -->
    <div class="heavy-drawer-footer">
      ${loggedIn ? `
        <button class="heavy-drawer-logout-btn" id="heavy-drawer-logout-btn" type="button">
          <i class="fa-solid fa-right-from-bracket"></i> Sign Out
        </button>
      ` : ''}
      <div class="heavy-drawer-footnote">
        <span>&copy; 2026 AMEZA Shopify Store</span>
        <span style="color:#7DBA35; font-weight:700;">v2.4 Premium</span>
      </div>
    </div>
  `;

  // Attach event listeners
  drawer.querySelector('#heavy-drawer-close-btn').addEventListener('click', closeHeavyMobileDrawer);

  const logoutBtn = drawer.querySelector('#heavy-drawer-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      closeHeavyMobileDrawer();
      window.location.reload();
    });
  }

  // Links close drawer
  drawer.querySelectorAll('.heavy-drawer-link, .heavy-drawer-stat-item, .heavy-drawer-btn-signin, .heavy-drawer-btn-signup').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('href') !== 'javascript:void(0)') {
        closeHeavyMobileDrawer();
      }
    });
  });
}

function openHeavyMobileDrawer() {
  buildHeavyMobileDrawer();
  const backdrop = document.getElementById('heavy-drawer-backdrop');
  const drawer = document.getElementById('heavy-mobile-drawer');
  if (backdrop && drawer) {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeHeavyMobileDrawer() {
  const backdrop = document.getElementById('heavy-drawer-backdrop');
  const drawer = document.getElementById('heavy-mobile-drawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Global click listener for any mobile menu triggers
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-action="mobile-menu-toggle"], .hamburger-btn, #account-mobile-nav-toggle');
    if (toggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      openHeavyMobileDrawer();
    }
  });

  // Auto-run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateAccountIconState();
      buildHeavyMobileDrawer();
    });
  } else {
    updateAccountIconState();
    buildHeavyMobileDrawer();
  }
}

// ============================================================
// PASSWORD STRENGTH
// ============================================================

function checkPasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  return { score, checks, label: labels[score], color: colors[score] };
}

// ============================================================
function handleAccountIconClick() {
  if (isLoggedIn()) {
    window.location.href = 'account.html';
  } else {
    window.location.href = 'login.html';
  }
}

// ============================================================
// EXPORT (available globally for non-module pages)
// ============================================================

window.AmezaAuth = {
  // Auth flows
  register,
  login,
  completeTwoFALogin,
  logout,
  requireAuth,
  isLoggedIn,
  getCurrentUser,
  getSession,
  createSession,
  clearSession,

  // Email verification
  verifyEmail,
  resendVerificationEmail,

  // Password reset
  requestPasswordReset,
  validateResetToken,
  resetPassword,

  // Profile
  updateProfile,
  changePassword,
  changeEmail,

  // Addresses
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,

  // Orders
  getOrders,
  saveOrders,
  addOrder,
  getOrderById,

  // 2FA
  beginTwoFASetup,
  confirmTwoFASetup,
  disableTwoFA,
  verifyTOTP,
  getTwoFAConfig,
  getRecoveryCodes,
  regenerateRecoveryCodes,

  // Crypto helpers
  sha256,
  computeTOTP,
  generateOtpauthURI,

  // Account icon
  updateAccountIconState,
  handleAccountIconClick,

  // Mobile Drawer
  openHeavyMobileDrawer,
  closeHeavyMobileDrawer,

  // Utils
  checkPasswordStrength,
  findUserById,
  findUserByEmail,
  updateUser,
};

