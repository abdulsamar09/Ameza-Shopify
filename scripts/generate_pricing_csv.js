import fs from 'fs';
import { PRODUCTS } from '../js/products-data.js';

const lines = ['id,name,category,current_value,suggested_usd,compare_at_usd,discount_percent'];

PRODUCTS.forEach(p => {
  const suggested = (p.price / 100).toFixed(2);
  const compare = p.oldPrice ? (p.oldPrice / 100).toFixed(2) : (p.price / 100).toFixed(2);
  const disc = p.oldPrice && p.oldPrice > p.price 
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) 
    : 0;
  const safeName = p.name.includes(',') ? `"${p.name.replace(/"/g, '""')}"` : p.name;
  lines.push(`${p.id},${safeName},${p.category},${p.price},${suggested},${compare},${disc}`);
});

fs.writeFileSync('docs/pricing-review.csv', lines.join('\n'), 'utf-8');
console.log('Successfully written docs/pricing-review.csv with', PRODUCTS.length, 'products');
