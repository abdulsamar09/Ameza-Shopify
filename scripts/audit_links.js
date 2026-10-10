const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'design-review') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(rootDir);
console.log(`Found ${htmlFiles.length} HTML files.`);

const allLinks = new Map();
const hrefRegex = /href=["']([^"'#]+)(?:#[^"']*)?["']/gi;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const rawHref = match[1].trim();
    if (!rawHref || 
        rawHref.startsWith('http://') || 
        rawHref.startsWith('https://') || 
        rawHref.startsWith('mailto:') || 
        rawHref.startsWith('tel:') || 
        rawHref.startsWith('javascript:')) {
      continue;
    }
    const relFile = path.relative(rootDir, file).replace(/\\/g, '/');
    const dirOfFile = path.posix.dirname(relFile);
    const resolvedPath = rawHref.startsWith('/')
      ? path.posix.normalize(rawHref.replace(/^\/+/, ''))
      : path.posix.normalize(path.posix.join(dirOfFile, rawHref));
    
    if (!allLinks.has(resolvedPath)) {
      allLinks.set(resolvedPath, { rawHref, resolvedPath, sources: [] });
    }
    allLinks.get(resolvedPath).sources.push(relFile);
  }
}

console.log(`Extracted ${allLinks.size} unique internal links.`);

function checkEndpoint(targetPath) {
  return new Promise((resolve) => {
    const cleanUrl = 'http://localhost:3000/' + targetPath.replace(/^\/+/, '');
    http.get(cleanUrl, (res) => {
      resolve({ path: targetPath, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ path: targetPath, status: 500, error: err.message });
    });
  });
}

async function run() {
  console.log('--- Checking all HTML files directly on server ---');
  let pageFailures = 0;
  for (const file of htmlFiles) {
    const relFile = path.relative(rootDir, file).replace(/\\/g, '/');
    const res = await checkEndpoint(relFile);
    if (res.status !== 200) {
      console.log(`❌ Page load failure: ${relFile} -> status ${res.status}`);
      pageFailures++;
    }
  }
  console.log(`Page verification complete: ${htmlFiles.length - pageFailures}/${htmlFiles.length} loaded with HTTP 200.`);

  console.log('\n--- Checking all extracted href links on server ---');
  let linkFailures = [];
  let linkSuccesses = 0;
  for (const [targetPath, meta] of allLinks.entries()) {
    const res = await checkEndpoint(targetPath);
    if (res.status === 200 || res.status === 301 || res.status === 302) {
      linkSuccesses++;
    } else {
      linkFailures.push({ targetPath, status: res.status, sources: meta.sources.slice(0, 3) });
    }
  }

  console.log(`Link verification complete: ${linkSuccesses} succeeded, ${linkFailures.length} failed.`);
  if (linkFailures.length > 0) {
    console.log('\nFailed links list:');
    for (const fail of linkFailures) {
      console.log(`- ${fail.targetPath} (HTTP ${fail.status}) referenced in: ${fail.sources.join(', ')}`);
    }
  }
}

run();
