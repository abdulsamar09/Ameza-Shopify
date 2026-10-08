/**
 * AMEZA Multi-Vendor Marketplace - Catalog Seeder
 * Converts current 51 products and categories into:
 * 1. db/seed.sql (for direct execution in PostgreSQL / Supabase SQL Editor)
 * 2. db/seeds/initial_catalog.json (for local API development)
 * Sets "AMEZA Official" as house vendor with 0% commission.
 */

const fs = require('fs');
const path = require('path');

// Extract CATEGORIES and PRODUCTS from js/products-data.js
const productsDataPath = path.join(__dirname, '../js/products-data.js');
const fileContent = fs.readFileSync(productsDataPath, 'utf8');

// Use VM or regex/parsing to extract exported arrays
let categories = [];
let products = [];

try {
  // Simple extraction of CATEGORIES
  const catMatch = fileContent.match(/export const CATEGORIES = (\[[\s\S]*?\]);/);
  if (catMatch) {
    categories = JSON.parse(catMatch[1]);
  }

  // Simple extraction of PRODUCTS
  const prodMatch = fileContent.match(/export const PRODUCTS = (\[[\s\S]*?\]);/);
  if (prodMatch) {
    products = JSON.parse(prodMatch[1]);
  }
} catch (e) {
  console.error('Error parsing products-data.js:', e);
  process.exit(1);
}

console.log(`Parsed ${categories.length} categories and ${products.length} products.`);

const HOUSE_SELLER_ID = '00000000-0000-0000-0000-000000000001';
const HOUSE_USER_ID = '00000000-0000-0000-0000-000000000002';

// Ensure output directories exist
const seedsDir = path.join(__dirname, '../db/seeds');
if (!fs.existsSync(seedsDir)) {
  fs.mkdirSync(seedsDir, { recursive: true });
}

// 1. Write JSON snapshot
const catalogJson = {
  seller: {
    id: HOUSE_SELLER_ID,
    userId: HOUSE_USER_ID,
    storeName: 'AMEZA Official',
    slug: 'ameza-official',
    status: 'approved',
    commissionOverridePct: 0.0,
    isTrusted: true,
    country: 'US',
    description: 'Official AMEZA Flagship Collection. 100% Genuine Certified Luxury & Lifestyle Goods.'
  },
  categories,
  products: products.map(p => ({
    ...p,
    sellerId: HOUSE_SELLER_ID,
    sellerName: 'AMEZA Official',
    sellerSlug: 'ameza-official',
    basePriceCents: p.price > 500 && p.price % 1 === 0 ? p.price : Math.round(Number(p.price || 0) * 100),
    compareAtPriceCents: p.oldPrice ? (p.oldPrice > 500 && p.oldPrice % 1 === 0 ? p.oldPrice : Math.round(Number(p.oldPrice) * 100)) : null,
    commissionOverridePct: 0.0
  }))
};

fs.writeFileSync(path.join(seedsDir, 'initial_catalog.json'), JSON.stringify(catalogJson, null, 2), 'utf8');

// 2. Build SQL Seed
let sql = `-- =====================================================================
-- AMEZA Multi-Vendor Marketplace: Catalog Seed
-- Loads House Seller "AMEZA Official" (0% commission) and 51 Products
-- =====================================================================

-- 1. Create Placeholder Profile & House Seller
INSERT INTO public.profiles (id, first_name, last_name, email, phone, role)
VALUES ('${HOUSE_USER_ID}', 'AMEZA', 'Official', 'official@example.com', '+15550100100', 'super_admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sellers (id, user_id, store_name, slug, description, status, commission_override_pct, is_trusted, country)
VALUES (
    '${HOUSE_SELLER_ID}',
    '${HOUSE_USER_ID}',
    'AMEZA Official',
    'ameza-official',
    'Official AMEZA Flagship Collection. 100% Genuine Certified Luxury & Lifestyle Goods.',
    'approved',
    0.00,
    TRUE,
    'US'
)
ON CONFLICT (slug) DO UPDATE SET 
    commission_override_pct = 0.00,
    is_trusted = TRUE,
    status = 'approved';

-- 2. Insert Categories
`;

categories.forEach(cat => {
  const catDesc = (cat.description || '').replace(/'/g, "''");
  const catName = (cat.name || '').replace(/'/g, "''");
  sql += `INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('${cat.id}', '${catName}', '${cat.slug}', '${catDesc}', '${cat.image || ''}', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;\n`;
});

sql += `\n-- 3. Insert 51 Products\n`;

products.forEach(p => {
  const title = (p.name || '').replace(/'/g, "''");
  const desc = (p.description || '').replace(/'/g, "''");
  const priceCents = p.price > 500 && p.price % 1 === 0 ? p.price : Math.round(Number(p.price || 0) * 100);
  const oldPriceCents = p.oldPrice ? (p.oldPrice > 500 && p.oldPrice % 1 === 0 ? p.oldPrice : Math.round(Number(p.oldPrice) * 100)) : 'NULL';
  const badge = p.badge ? `'${p.badge.replace(/'/g, "''")}'` : 'NULL';
  const featuresJson = JSON.stringify(p.features || []).replace(/'/g, "''");
  const isDeal = p.isDeal ? 'TRUE' : 'FALSE';
  const stockCount = p.stockCount || 50;
  const ratingAvg = p.rating || 5.0;
  const ratingCount = p.reviews || 0;

  sql += `INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '${p.id}',
    '${HOUSE_SELLER_ID}',
    '${p.categorySlug || p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}',
    '${title}',
    '${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}',
    '${desc.substring(0, 180)}...',
    '${desc}',
    ${priceCents},
    ${oldPriceCents},
    ${badge},
    '${p.section || 'latest-range'}',
    '${featuresJson}'::jsonb,
    0.00,
    ${ratingAvg},
    ${ratingCount},
    'published',
    ${isDeal},
    TRUE,
    ${stockCount}
) ON CONFLICT (legacy_id) DO NOTHING;\n`;
});

fs.writeFileSync(path.join(__dirname, '../db/seed.sql'), sql, 'utf8');

console.log('Successfully generated:');
console.log(' - db/seeds/initial_catalog.json');
console.log(' - db/seed.sql');
