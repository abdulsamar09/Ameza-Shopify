import fs from 'fs';

const raw = fs.readFileSync('mock/products.json', 'utf-8');
const products = JSON.parse(raw);

const updated = products.map(p => {
  const priceCents = p.priceCents;
  const compareAtCents = p.compareAtCents || p.compareAtPriceCents || null;
  const discountPct = compareAtCents && compareAtCents > priceCents
    ? Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
    : 0;

  const newP = {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    priceCents: priceCents,
    compareAtCents: compareAtCents,
    discountText: discountPct > 0 ? `-${discountPct}%` : null,
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    sellerSlug: p.sellerSlug,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    stockCount: p.stockCount,
    status: p.status,
    badge: p.badge,
    image: p.image,
    description: p.description,
    variants: (p.variants || []).map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceCents: v.priceCents,
      stock: v.stock
    })),
    features: p.features
  };
  return newP;
});

fs.writeFileSync('mock/products.json', JSON.stringify(updated, null, 2), 'utf-8');
console.log('Updated mock/products.json: only priceCents and compareAtCents kept for', updated.length, 'products');
