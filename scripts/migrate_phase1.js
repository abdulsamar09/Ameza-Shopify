/**
 * Phase 1 Migration Script:
 * 1. Copies seller pages into /seller/ with updated relative asset/script paths.
 * 2. Restores storefront.html as the root index.html.
 * 3. Mounts layout.js and replaces duplicated headers and footers across public pages.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Move Seller Pages
const sellerDir = path.join(rootDir, 'seller');
if (!fs.existsSync(sellerDir)) {
  fs.mkdirSync(sellerDir, { recursive: true });
}

const sellerFiles = [
  { src: 'index.html', dest: 'seller/index.html' },
  { src: 'products.html', dest: 'seller/products.html' },
  { src: 'add-product.html', dest: 'seller/add-product.html' },
  { src: 'orders.html', dest: 'seller/orders.html' },
  { src: 'order-detail.html', dest: 'seller/order-detail.html' },
  { src: 'inventory.html', dest: 'seller/inventory.html' },
  { src: 'returns.html', dest: 'seller/returns.html' },
  { src: 'reviews.html', dest: 'seller/reviews.html' },
  { src: 'messages.html', dest: 'seller/messages.html' },
  { src: 'earnings.html', dest: 'seller/earnings.html' },
  { src: 'payouts.html', dest: 'seller/payouts.html' },
  { src: 'discounts.html', dest: 'seller/discounts.html' },
  { src: 'shipping.html', dest: 'seller/shipping.html' },
  { src: 'analytics.html', dest: 'seller/analytics.html' },
  { src: 'settings.html', dest: 'seller/settings.html' }
];

for (const item of sellerFiles) {
  const srcPath = path.join(rootDir, item.src);
  if (!fs.existsSync(srcPath)) continue;
  let content = fs.readFileSync(srcPath, 'utf8');

  // Fix relative paths for nested folder
  content = content.replace(/href="css\//g, 'href="../css/');
  content = content.replace(/href="assets\//g, 'href="../assets/');
  content = content.replace(/src="assets\//g, 'src="../assets/');
  content = content.replace(/src="js\//g, 'src="../js/');
  content = content.replace(/from '\.\/js\//g, "from '../js/");
  content = content.replace(/from '\.\//g, "from '../js/");

  if (!content.includes('data-layout')) {
    content = content.replace('<body', '<body data-layout="none"');
  }

  const destPath = path.join(rootDir, item.dest);
  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`[Seller] Created ${item.dest}`);
}

// 2. Restore Storefront as root index.html
const storefrontPath = path.join(rootDir, 'storefront.html');
const indexPath = path.join(rootDir, 'index.html');
if (fs.existsSync(storefrontPath)) {
  const sfContent = fs.readFileSync(storefrontPath, 'utf8');
  fs.writeFileSync(indexPath, sfContent, 'utf8');
  console.log('[Storefront] Restored storefront.html -> index.html');
}

// 3. Keep root redirect stubs for legacy seller URLs
const legacySellerUrls = [
  'products.html',
  'add-product.html',
  'orders.html',
  'order-detail.html',
  'inventory.html',
  'returns.html',
  'reviews.html',
  'messages.html',
  'earnings.html',
  'payouts.html',
  'discounts.html',
  'shipping.html',
  'analytics.html',
  'settings.html'
];

for (const file of legacySellerUrls) {
  const stubContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=seller/${file}">
  <title>Redirecting to Seller Central...</title>
  <script>
    window.location.replace('seller/${file}' + window.location.search + window.location.hash);
  </script>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px;">
  <p>Redirecting to <a href="seller/${file}">Seller Central</a>...</p>
</body>
</html>
`;
  fs.writeFileSync(path.join(rootDir, file), stubContent, 'utf8');
}
console.log(`[Stubs] Updated ${legacySellerUrls.length} root redirect stubs pointing to /seller/*`);
