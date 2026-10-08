const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 51 Products Pricing Review Mapping
const PRODUCT_PRICING = {
  "549": { suggested: 59.99, compareAt: 79.99, note: "Sample pricing, client to confirm. Canvas & leather tote." },
  "536": { suggested: 149.99, compareAt: 189.99, note: "Sample pricing, client to confirm. Full-grain hobo shoulder." },
  "530": { suggested: 229.99, compareAt: 279.99, note: "Sample pricing, client to confirm. Handcrafted all-leather tote." },
  "520": { suggested: 139.99, compareAt: 169.99, note: "Sample pricing, client to confirm. Full-grain mini satchel." },
  "510": { suggested: 169.99, compareAt: 219.99, note: "Sample pricing, client to confirm. Double zip leather crossbody." },
  "500": { suggested: 59.99, compareAt: 79.99, note: "Sample pricing, client to confirm. Hand-painted vintage belt." },
  "490": { suggested: 64.99, compareAt: 84.99, note: "Sample pricing, client to confirm. Western filigree belt." },
  "456": { suggested: 64.99, compareAt: 84.99, note: "Sample pricing, client to confirm. Hand-laced western belt." },
  "435": { suggested: 54.99, compareAt: 69.99, note: "Sample pricing, client to confirm. American bison belt." },
  "407": { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Classic saddle leather belt." },
  "284": { suggested: 49.99, compareAt: 69.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (2995) to realistic USD." },
  "281": { suggested: 29.99, compareAt: 39.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1249) to realistic USD." },
  "278": { suggested: 69.99, compareAt: 89.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1999) to realistic USD." },
  "274": { suggested: 24.99, compareAt: 34.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (999) to realistic USD." },
  "270": { suggested: 89.99, compareAt: 119.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1499) to realistic USD." },
  "267": { suggested: 69.99, compareAt: 89.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1699) to realistic USD." },
  "264": { suggested: 99.99, compareAt: 129.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (2299) to realistic USD." },
  "260": { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1199) to realistic USD." },
  "257": { suggested: 34.99, compareAt: 49.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (899) to realistic USD." },
  "254": { suggested: 24.99, compareAt: 34.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (899) to realistic USD." },
  "250": { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1799) to realistic USD." },
  "246": { suggested: 24.99, compareAt: 34.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (599) to realistic USD." },
  "239": { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1499) to realistic USD." },
  "236": { suggested: 44.99, compareAt: 59.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (1290) to realistic USD." },
  "233": { suggested: 24.99, compareAt: 34.99, note: "Sample pricing, client to confirm. Scaled from rupee placeholder (999) to realistic USD." },
  "208": { suggested: 39.99, compareAt: 54.99, note: "Sample pricing, client to confirm. English bevel edge jean belt." },
  "204": { suggested: 29.99, compareAt: 39.99, note: "Sample pricing, client to confirm. Braided leather belt." },
  "201": { suggested: 34.99, compareAt: 44.99, note: "Sample pricing, client to confirm. Twelve-strand crafted braided belt." },
  "196": { suggested: 89.99, compareAt: 119.99, note: "Sample pricing, client to confirm. Everyday pack canvas & leather." },
  "154": { suggested: 139.99, compareAt: 179.99, note: "Sample pricing, client to confirm. 24/7 Canvas & leather tote." },
  "149": { suggested: 19.99, compareAt: 24.99, note: "Sample pricing, client to confirm. Oval leather key fob." },
  "146": { suggested: 29.99, compareAt: 39.99, note: "Sample pricing, client to confirm. Mini leather basketball memorabilia." },
  "144": { suggested: 39.99, compareAt: 49.99, note: "Sample pricing, client to confirm. Leather card case." },
  "139": { suggested: 139.99, compareAt: 174.99, note: "Sample pricing, client to confirm. Simple mini V hobo shoulder bag." },
  "133": { suggested: 149.99, compareAt: 189.99, note: "Sample pricing, client to confirm. Double handle shoulder bag." },
  "115": { suggested: 79.99, compareAt: 99.99, note: "Sample pricing, client to confirm. Pocket secretary wallet." },
  "112": { suggested: 44.99, compareAt: 59.99, note: "Sample pricing, client to confirm. Signature cardholder wallet." },
  "107": { suggested: 29.99, compareAt: 39.99, note: "Sample pricing, client to confirm. Classic steel money clip." },
  "103": { suggested: 59.99, compareAt: 79.99, note: "Sample pricing, client to confirm. Tradesman slim leather wallet." },
  "99":  { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Classic bifold wallet." },
  "97":  { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Wax cord braided belt." },
  "94":  { suggested: 59.99, compareAt: 79.99, note: "Sample pricing, client to confirm. Western lace tapered belt." },
  "88":  { suggested: 44.99, compareAt: 59.99, note: "Sample pricing, client to confirm. Vintage washed leather belt." },
  "83":  { suggested: 54.99, compareAt: 69.99, note: "Sample pricing, client to confirm. Solid brass buckle belt." },
  "79":  { suggested: 49.99, compareAt: 64.99, note: "Sample pricing, client to confirm. Saddle leather belt." },
  "76":  { suggested: 199.99, compareAt: 249.99, note: "Sample pricing, client to confirm. Otto leather crossbody." },
  "56":  { suggested: 79.99, compareAt: 99.99, note: "Sample pricing, client to confirm. Mini phone crossbody." },
  "54":  { suggested: 229.99, compareAt: 289.99, note: "Sample pricing, client to confirm. Rainier full-grain backpack." },
  "52":  { suggested: 189.99, compareAt: 239.99, note: "Sample pricing, client to confirm. Wallace leather messenger." },
  "49":  { suggested: 129.99, compareAt: 159.99, note: "Sample pricing, client to confirm. Simple everyday tote." },
  "47":  { suggested: 199.99, compareAt: 249.99, note: "Sample pricing, client to confirm. Lennon canvas & leather backpack." }
};

// Read current products-data.js to extract current values
const productsDataFile = path.join(__dirname, '../js/products-data.js');
const content = fs.readFileSync(productsDataFile, 'utf8');
const prodMatch = content.match(/export const PRODUCTS = (\[[\s\S]*?\]);/);
const currentProducts = JSON.parse(prodMatch[1]);

const csvRows = [
  ['id', 'name', 'category', 'current_value_in_file', 'interpreted_usd', 'suggested_usd', 'compare_at_usd', 'discount_percent', 'notes']
];

currentProducts.forEach(p => {
  const cfg = PRODUCT_PRICING[p.id] || { suggested: p.price, compareAt: null, note: "Sample pricing, client to confirm." };
  const interpreted = p.price > 500 ? (p.price / 100).toFixed(2) : p.price.toFixed(2);
  const suggested = cfg.suggested.toFixed(2);
  const compareAt = cfg.compareAt ? cfg.compareAt.toFixed(2) : '';
  const discountPct = cfg.compareAt ? Math.round((1 - cfg.suggested / cfg.compareAt) * 100) + '%' : '';
  
  csvRows.push([
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.category}"`,
    p.price,
    interpreted,
    suggested,
    compareAt,
    discountPct,
    `"${cfg.note}"`
  ]);
});

const csvContent = csvRows.map(r => r.join(',')).join('\n');
fs.writeFileSync(path.join(docsDir, 'pricing-review.csv'), csvContent, 'utf8');
console.log(`✅ Generated docs/pricing-review.csv with ${currentProducts.length} reviewed products.`);

module.exports = { PRODUCT_PRICING };
