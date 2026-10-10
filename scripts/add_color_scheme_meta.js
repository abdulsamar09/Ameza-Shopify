const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.gemini') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = walk(rootDir);
let updatedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('name="color-scheme"') || content.includes("name='color-scheme'")) {
    continue;
  }

  // Look for <head> or <head ...>
  const headMatch = content.match(/<head[^>]*>/i);
  if (!headMatch) continue;

  const headTag = headMatch[0];
  // Insert meta tags right after <head>
  const metaTags = `\n  <meta name="color-scheme" content="light">\n  <meta name="supported-color-schemes" content="light">`;
  content = content.replace(headTag, headTag + metaTags);

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
  console.log(`Updated: ${path.relative(rootDir, filePath)}`);
}

console.log(`Total HTML files updated: ${updatedCount}`);
