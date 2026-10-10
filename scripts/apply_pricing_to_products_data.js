const fs = require('fs');
const path = require('path');
const { PRODUCT_PRICING } = require('./build_pricing_review.js');

const productsDataFile = path.join(__dirname, '../js/products-data.js');
let content = fs.readFileSync(productsDataFile, 'utf8');

// Extract CATEGORIES and PRODUCTS
const catMatch = content.match(/export const CATEGORIES = (\[[\s\S]*?\]);/);
const prodMatch = content.match(/export const PRODUCTS = (\[[\s\S]*?\]);/);
const promoMatch = content.match(/export const PROMOTIONAL_BANNERS = (\[[\s\S]*?\]);/);

if (!catMatch || !prodMatch) {
  console.error('Could not find CATEGORIES or PRODUCTS in js/products-data.js');
  process.exit(1);
}

const categories = JSON.parse(catMatch[1]);
const products = JSON.parse(prodMatch[1]);
const promoBanners = promoMatch ? JSON.parse(promoMatch[1]) : [];

// Update categories to remove any banned terms or U.S. references
categories.forEach(c => {
  c.description = c.description.replace(/handcrafted (.*) collection/i, 'handcrafted $1 collection across the United States');
});

// Update products
products.forEach(p => {
  const cfg = PRODUCT_PRICING[p.id];
  if (cfg) {
    p.price = Math.round(cfg.suggested * 100); // integer cents
    p.oldPrice = cfg.compareAt ? Math.round(cfg.compareAt * 100) : null;
    if (p.oldPrice && p.oldPrice > p.price) {
      const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
      p.discount = `-${pct}%`;
    } else {
      p.discount = "";
    }
  } else {
    // If not in mapping, ensure integer cents
    p.price = p.price > 500 && p.price % 1 === 0 ? p.price : Math.round(p.price * 100);
    p.oldPrice = p.oldPrice ? (p.oldPrice > 500 && p.oldPrice % 1 === 0 ? p.oldPrice : Math.round(p.oldPrice * 100)) : null;
  }

  // Update features: replace worldwide shipping with US shipping
  if (Array.isArray(p.features)) {
    p.features = p.features.map(f => {
      if (/worldwide|international|australia/i.test(f)) {
        return "Free U.S. Standard Shipping on orders over $100";
      }
      return f;
    });
  }

  // Update description
  if (p.description) {
    p.description = p.description
      .replace(/worldwide|international/gi, 'across the United States')
      .replace(/United States Post/gi, 'USPS');
  }
});

// Update promotional banners
promoBanners.forEach(b => {
  if (b.title) b.title = b.title.replace(/worldwide|international|australia/gi, 'U.S.');
  if (b.subtitle) b.subtitle = b.subtitle.replace(/worldwide|international|australia/gi, 'across the United States');
});

const newFileContent = `/**
 * AMEZA E-Commerce Catalog Data (USA Standard - Integer Cents)
 * Total Products: 51
 * Currency: USD (minor units: cents)
 */

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const PRODUCTS = ${JSON.stringify(products, null, 2)};

export const PROMOTIONAL_BANNERS = ${JSON.stringify(promoBanners, null, 2)};
`;

fs.writeFileSync(productsDataFile, newFileContent, 'utf8');
console.log('✅ Updated js/products-data.js with integer cents and US features.');
