/**
 * Apply Unified Layout to All Public and Focus Pages.
 * Replaces fragmented, copy-pasted headers and footers with js/core/layout.js mount.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const storefrontPages = [
  'index.html',
  'product.html',
  'store.html',
  'cart.html',
  'wishlist.html',
  'account.html',
  'account-profile.html',
  'account-orders.html',
  'account-order-detail.html',
  'account-addresses.html',
  'account-security.html',
  'account-wishlist.html',
  'onboarding/sell-with-us.html'
];

const focusPages = [
  'login.html',
  'signup.html',
  'forgot-password.html',
  'reset-password.html',
  'verify-email.html',
  'checkout.html',
  'onboarding/apply.html'
];

function updateHead(html, isSubdir) {
  const cssPrefix = isSubdir ? '../css/' : 'css/';
  
  // Remove travel.css
  html = html.replace(/<link[^>]*href=["'][^"']*travel\.css["'][^>]*>\s*/gi, '');

  // Ensure tokens.css and base.css are present
  if (!html.includes('tokens.css')) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="${cssPrefix}tokens.css">\n</head>`);
  }
  if (!html.includes('base.css')) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="${cssPrefix}base.css">\n</head>`);
  }
  return html;
}

function processPage(relPath, layoutType) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`[Skip] ${relPath} not found`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const isSubdir = relPath.includes('/');
  const scriptPath = isSubdir ? '../js/core/layout.js' : 'js/core/layout.js';

  html = updateHead(html, isSubdir);

  // Set data-layout on body
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs.replace(/\s*data-layout=["'][^"']*["']/i, '');
    return `<body${cleanAttrs} data-layout="${layoutType}">\n  <div id="site-header"></div>`;
  });

  // Remove hardcoded top announcement bar if present
  html = html.replace(/<div class="top-bar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i, '');
  html = html.replace(/<div class="top-bar">[\s\S]*?<\/header>/i, '<div id="site-header"></div>');

  // Remove travel categories bar if present
  html = html.replace(/<!--\s*2\.1 BOOKING SERVICES CATEGORIES BAR\s*-->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i, '');
  html = html.replace(/<div class="travel-nav-bar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i, '');

  // Remove hardcoded <header>...</header>
  html = html.replace(/<header[\s\S]*?<\/header>/i, '<div id="site-header"></div>');

  // Remove hardcoded <footer>...</footer>
  html = html.replace(/<footer[\s\S]*?<\/footer>/i, '<div id="site-footer"></div>');

  // Clean duplicate #site-header / #site-footer if regex matched multiple
  let headerCount = 0;
  html = html.replace(/<div id="site-header"><\/div>/g, () => {
    headerCount++;
    return headerCount === 1 ? '<div id="site-header"></div>' : '';
  });

  let footerCount = 0;
  html = html.replace(/<div id="site-footer"><\/div>/g, () => {
    footerCount++;
    return footerCount === 1 ? '<div id="site-footer"></div>' : '';
  });

  if (!html.includes('<div id="site-footer"></div>')) {
    html = html.replace('</body>', '  <div id="site-footer"></div>\n</body>');
  }

  // Ensure layout.js is included
  if (!html.includes('js/core/layout.js')) {
    html = html.replace('</body>', `  <!-- Unified Layout Module -->\n  <script type="module" src="${scriptPath}"></script>\n</body>`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[Layout] Updated ${relPath} (layout="${layoutType}")`);
}

for (const p of storefrontPages) {
  processPage(p, 'storefront');
}

for (const p of focusPages) {
  processPage(p, 'focus');
}

console.log('All public & focus pages updated with unified layout.');
