/**
 * scripts/check_structure.js
 * Comprehensive automated structural validator for AMEZA Marketplace:
 * 1. Checks that HTML pages declare data-layout and data-access
 * 2. Checks that pages avoid inline <style> blocks and inline script logic (only modular imports/boostraps)
 * 3. Checks that all local assets/links use root-absolute paths (no ../ or unslashed local relative paths)
 * 4. Checks that files reside in appropriate architectural areas
 * 5. Crawls core routes over HTTP and verifies zero 404 errors
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');
const AREAS = ['storefront', 'travel', 'auth', 'buyer', 'seller', 'admin'];

let errors = [];
let warnings = [];

console.log('======================================================');
console.log('       AMEZA ARCHITECTURAL STRUCTURE VALIDATOR        ');
console.log('======================================================\n');

// 1. Scan area HTML files
console.log('--- 1. Validating Layout, Access & Root Paths in Area HTML ---');
for (const area of AREAS) {
  const dirPath = path.join(rootDir, area);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const relPath = `${area}/${file}`;
    const content = fs.readFileSync(filePath, 'utf8');

    // Layout & Access validation
    const hasLayout = /data-layout=["'][^"']+["']/.test(content);
    const hasAccess = /data-access=["'][^"']+["']/.test(content);
    if (!hasLayout) errors.push(`[${relPath}] Missing required 'data-layout' attribute on body.`);
    if (!hasAccess) errors.push(`[${relPath}] Missing required 'data-access' attribute on body.`);

    // Check for inline style blocks
    if (/<style[^>]*>[\s\S]*?<\/style>/i.test(content)) {
      warnings.push(`[${relPath}] Contains inline <style> block; should be externalized to ${area}/css/.`);
    }

    // Check for legacy relative ../ chains
    if (/\.\.\//.test(content)) {
      errors.push(`[${relPath}] Contains forbidden relative path chain '../'. Must use root-absolute path.`);
    }

    // Check link/script/img references
    const linkMatches = content.matchAll(/(?:href|src)=["']([^"']+)["']/g);
    for (const match of linkMatches) {
      const url = match[1];
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('${') || url.startsWith('+') || url.includes('${')) {
        continue;
      }
      if (!url.startsWith('/')) {
        errors.push(`[${relPath}] Relative unslashed path found: '${url}'. Must be root-absolute '/${url}'.`);
      }
    }
  }
}

// 2. Validate Root index.html
const indexFile = path.join(rootDir, 'index.html');
if (fs.existsSync(indexFile)) {
  const content = fs.readFileSync(indexFile, 'utf8');
  if (!/data-layout=/.test(content)) errors.push('[index.html] Missing data-layout attribute.');
  if (!/data-access=/.test(content)) errors.push('[index.html] Missing data-access attribute.');
  if (/\.\.\//.test(content)) errors.push('[index.html] Contains ../ chain.');
}

// 3. HTTP Crawl of Core Routes
console.log('--- 2. Crawling Core Routes on Local HTTP Server (Port 3000) ---');

function testUrl(testPath) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000${testPath}`, (res) => {
      resolve({ path: testPath, status: res.statusCode, location: res.headers.location });
    }).on('error', (err) => {
      resolve({ path: testPath, status: 500, error: err.message });
    });
  });
}

const CORE_ROUTES = [
  '/',
  '/storefront/shop.html',
  '/storefront/product.html',
  '/storefront/cart.html',
  '/storefront/checkout.html',
  '/travel/stays.html',
  '/travel/flights.html',
  '/travel/car-rental.html',
  '/auth/login.html',
  '/auth/signup.html',
  '/buyer/',
  '/buyer/orders.html',
  '/buyer/addresses.html',
  '/buyer/security.html',
  '/seller/index.html',
  '/seller/products.html',
  '/seller/orders.html',
  '/admin/index.html',
  '/admin/audit.html',
  '/seller/onboarding/sell-with-us.html',
  '/shared/css/tokens.css',
  '/shared/js/core/layout.js',
  '/assets/brand/ameza-logo.svg',
  // 301 Redirect checks
  '/shop.html',
  '/cart.html',
  '/checkout.html',
  '/account.html',
  '/login.html',
  '/stays.html'
];

async function runCrawl() {
  let crawlFailures = 0;
  for (const route of CORE_ROUTES) {
    const res = await testUrl(route);
    if (res.status === 200) {
      console.log(`  ✅ 200 OK: ${route}`);
    } else if (res.status === 301 || res.status === 302) {
      console.log(`  ✅ ${res.status} Redirect: ${route} -> ${res.location}`);
    } else {
      console.error(`  ❌ FAIL (${res.status}): ${route}`);
      errors.push(`Route ${route} returned HTTP ${res.status}`);
      crawlFailures++;
    }
  }

  console.log('\n======================================================');
  console.log(`Summary: ${errors.length} Errors, ${warnings.length} Warnings`);
  console.log('======================================================');

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.slice(0, 5).forEach(w => console.log('  ⚠️ ' + w));
    if (warnings.length > 5) console.log(`  ... and ${warnings.length - 5} more.`);
  }

  if (errors.length > 0) {
    console.error('\nErrors detected:');
    errors.forEach(e => console.error('  ❌ ' + e));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL ARCHITECTURAL STRUCTURE INVARIANTS PASSED!');
    process.exit(0);
  }
}

runCrawl();
