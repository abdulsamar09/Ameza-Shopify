const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

// 301 Permanent Redirects Map (Old -> New)
const REDIRECTS_301 = {
  '/account.html': '/buyer/',
  '/account-orders.html': '/buyer/orders.html',
  '/account-order-detail.html': '/buyer/order-detail.html',
  '/account-wishlist.html': '/buyer/wishlist.html',
  '/account-addresses.html': '/buyer/addresses.html',
  '/account-profile.html': '/buyer/profile.html',
  '/account-security.html': '/buyer/security.html',

  '/login.html': '/auth/login.html',
  '/signup.html': '/auth/signup.html',
  '/forgot-password.html': '/auth/forgot-password.html',
  '/reset-password.html': '/auth/reset-password.html',
  '/verify-email.html': '/auth/verify-email.html',

  '/shop.html': '/storefront/shop.html',
  '/product.html': '/storefront/product.html',
  '/category.html': '/storefront/category.html',
  '/subcategory.html': '/storefront/subcategory.html',
  '/tag.html': '/storefront/tag.html',
  '/stores.html': '/storefront/stores.html',
  '/store.html': '/storefront/seller-store.html',
  '/cart.html': '/storefront/cart.html',
  '/checkout.html': '/storefront/checkout.html',
  '/order-confirmation.html': '/storefront/order-confirmation.html',
  '/wishlist.html': '/storefront/wishlist.html',

  '/stays.html': '/travel/stays.html',
  '/stays-search.html': '/travel/stays-search.html',
  '/flights.html': '/travel/flights.html',
  '/car-rental.html': '/travel/car-rental.html',
  '/attractions.html': '/travel/attractions.html',
  '/airport-taxis.html': '/travel/airport-taxis.html',

  '/seller-orders.html': '/seller/orders.html',
  '/seller-products.html': '/seller/products.html',
  '/seller-payouts.html': '/seller/payouts.html',

  '/admin-audit.html': '/admin/audit.html',
  '/admin-categories.html': '/admin/categories.html',
  '/admin-cms.html': '/admin/content.html',
  '/admin-finance.html': '/admin/finance.html',
  '/admin-moderation.html': '/admin/products.html',
  '/admin-settings.html': '/admin/settings.html',

  '/prototype-index.html': '/dev/prototype-index.html',
  '/selftest.html': '/dev/selftest.html',
  '/ui-kit.html': '/dev/ui-kit.html',
  '/account': '/buyer/',
  '/seller/seller': '/seller/',
  '/seller/seller/index.html': '/seller/'
};

// Clean URLs rewrites map
const REWRITES = {
  '/shop': '/storefront/shop.html',
  '/cart': '/storefront/cart.html',
  '/checkout': '/storefront/checkout.html',
  '/login': '/auth/login.html',
  '/signup': '/auth/signup.html',
  '/seller': '/seller/index.html',
  '/admin': '/admin/index.html',
  '/buyer': '/buyer/index.html'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const [rawPath, queryString] = req.url.split('?');
  const query = queryString ? `?${queryString}` : '';
  let reqPath = decodeURI(rawPath);

  // Block access to _trash, db, scripts, tests, docs (always return 404)
  const BLOCKED_PREFIXES = ['/_trash', '/db', '/scripts', '/tests', '/docs'];
  if (BLOCKED_PREFIXES.some(prefix => reqPath === prefix || reqPath.startsWith(prefix + '/'))) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>404 Not Found</h1><p><a href="/">Return to Home</a></p>');
    return;
  }

  // Check 301 redirects
  if (REDIRECTS_301[reqPath]) {
    res.writeHead(301, {
      'Location': `${REDIRECTS_301[reqPath]}${query}`,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end();
    return;
  }

  // Handle /onboarding/* redirect
  if (reqPath.startsWith('/onboarding/')) {
    const newPath = reqPath.replace(/^\/onboarding\//, '/seller/onboarding/');
    res.writeHead(301, {
      'Location': `${newPath}${query}`,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end();
    return;
  }

  // Handle Clean URL rewrites
  if (REWRITES[reqPath]) {
    reqPath = REWRITES[reqPath];
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, reqPath);

  // Guard against path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  // If path doesn't have an extension and direct file doesn't exist, check for .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 Not Found</h1><p><a href="/">Return to Home</a></p>');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 500;
        res.end('500 Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
