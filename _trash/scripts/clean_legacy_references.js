const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'design-review') continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
    else if (f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.md')) files.push(full);
  }
  return files;
}

const files = walk(rootDir);
let changed = 0;

for (const f of files) {
  // Don't update migration scripts themselves
  if (f.includes('migrate_') || f.includes('clean_legacy_references')) continue;

  let text = fs.readFileSync(f, 'utf8');
  let newText = text;
  
  newText = newText.replace(/seller-dashboard\.html/g, 'seller/index.html');
  newText = newText.replace(/href=["']storefront\.html["']/g, 'href="index.html"');
  newText = newText.replace(/href=["']seller\.html["']/g, 'href="login.html"');
  newText = newText.replace(/href=["']sell-with-us\.html["']/g, 'href="onboarding/sell-with-us.html"');
  newText = newText.replace(/href=["']sell-on-ameza\.html["']/g, 'href="onboarding/sell-with-us.html"');
  newText = newText.replace(/href=["']seller-onboarding\.html["']/g, 'href="onboarding/apply.html"');

  if (newText !== text) {
    fs.writeFileSync(f, newText, 'utf8');
    changed++;
    console.log('Updated references in:', path.relative(rootDir, f));
  }
}

console.log('Total files updated:', changed);
