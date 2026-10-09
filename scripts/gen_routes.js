/**
 * AMEZA Route Registry Generator — scripts/gen_routes.js
 * Scans all HTML files across root, storefront, travel, auth, buyer, seller, admin, dev, legal
 * and outputs docs/ROUTES.md detailing URL, Area, Access Role, Layout, and Title.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const scanDirs = [
  { area: 'root', dir: '' },
  { area: 'storefront', dir: 'storefront' },
  { area: 'travel', dir: 'travel' },
  { area: 'auth', dir: 'auth' },
  { area: 'buyer', dir: 'buyer' },
  { area: 'seller', dir: 'seller' },
  { area: 'seller-onboarding', dir: 'seller/onboarding' },
  { area: 'admin', dir: 'admin' },
  { area: 'legal', dir: 'legal' },
  { area: 'dev', dir: 'dev' }
];

function extractMetadata(filePath, relUrl) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'AMEZA Marketplace';

    const bodyMatch = content.match(/<body([^>]*)>/i);
    const bodyAttrs = bodyMatch ? bodyMatch[1] : '';

    const layoutMatch = bodyAttrs.match(/data-layout=["']([^"']+)["']/i);
    const layout = layoutMatch ? layoutMatch[1] : 'standard';

    const accessMatch = bodyAttrs.match(/data-access=["']([^"']+)["']/i);
    const access = accessMatch ? accessMatch[1] : 'public';

    const areaMatch = bodyAttrs.match(/data-area=["']([^"']+)["']/i);
    const area = areaMatch ? areaMatch[1] : 'general';

    return {
      url: relUrl.startsWith('/') ? relUrl : '/' + relUrl,
      title,
      layout,
      access,
      area
    };
  } catch (e) {
    return null;
  }
}

const routes = [];

for (const sd of scanDirs) {
  const fullDirPath = path.join(rootDir, sd.dir);
  if (!fs.existsSync(fullDirPath)) continue;

  const entries = fs.readdirSync(fullDirPath);
  for (const entry of entries) {
    if (!entry.endsWith('.html')) continue;
    const filePath = path.join(fullDirPath, entry);
    const relUrl = sd.dir ? `${sd.dir}/${entry}` : entry;
    const meta = extractMetadata(filePath, relUrl);
    if (meta) {
      routes.push(meta);
    }
  }
}

// Generate Markdown table
let md = `# AMEZA Route & Navigation Registry\n\n`;
md += `Generated automatically by \`scripts/gen_routes.js\` on ${new Date().toISOString().split('T')[0]}.\n\n`;
md += `This registry documents every active user-facing route across the 6 major areas, including required RBAC role permissions, layout paradigms, and page titles.\n\n`;
md += `| Route URL | Area | Layout | Access Role | Page Title |\n`;
md += `|---|---|---|---|---|\n`;

routes.sort((a, b) => a.url.localeCompare(b.url));

for (const r of routes) {
  md += `| \`${r.url}\` | **${r.area}** | \`${r.layout}\` | \`${r.access}\` | ${r.title} |\n`;
}

md += `\n## Clean URL Rewrites Reference\n\n`;
md += `| Public Clean Route | Serves Internal Target |\n`;
md += `|---|---|\n`;
md += `| \`/shop\` | \`/storefront/shop.html\` |\n`;
md += `| \`/cart\` | \`/storefront/cart.html\` |\n`;
md += `| \`/checkout\` | \`/storefront/checkout.html\` |\n`;
md += `| \`/login\` | \`/auth/login.html\` |\n`;
md += `| \`/signup\` | \`/auth/signup.html\` |\n`;
md += `| \`/account\` | \`/buyer/\` (Redirect) |\n`;
md += `| \`/seller\` | \`/seller/index.html\` |\n`;
md += `| \`/admin\` | \`/admin/index.html\` |\n`;
md += `| \`/buyer\` | \`/buyer/index.html\` |\n`;

const outPath = path.join(rootDir, 'docs', 'ROUTES.md');
fs.writeFileSync(outPath, md, 'utf8');
console.log(`[Routes] Successfully generated ${routes.length} routes into docs/ROUTES.md`);
