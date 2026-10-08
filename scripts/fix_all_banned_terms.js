/**
 * Comprehensive US Term Replacement Script (scripts/fix_all_banned_terms.js)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const EXCLUDED = [
  '.git',
  'node_modules',
  'scripts/check_usa.js',
  'scripts/png_tool.js',
  'fix.md',
  '.system_generated'
];

const EXTENSIONS = ['.html', '.js', '.json', '.css', '.md'];

const REPLACEMENTS = [
  // Titles & headings
  [/\bAMEZA Marketplace United States\b/g, 'AMEZA Marketplace USA'],
  [/\bAMEZA United States\b/g, 'AMEZA USA'],
  [/\bAustralia\b/g, 'United States'],
  [/\bAustralian\b/g, 'U.S.'],
  
  // Specific AU cities -> US cities
  [/\bMelbourne Leather Co\b/g, 'Austin Leather Co'],
  [/\bMelbourne Leather\b/g, 'Austin Leather Co'],
  [/\bMelbourne\b/g, 'Austin'],
  [/\bSydney Coastal Living\b/g, 'Pacific Coastal Living'],
  [/\bSydney Coastal\b/g, 'Pacific Coastal Living'],
  [/\bSydney\b/g, 'San Diego'],
  [/\bBrisbane Artisan Goods\b/g, 'Portland Artisan Goods'],
  [/\bBrisbane Artisan\b/g, 'Portland Artisan Goods'],
  [/\bBrisbane\b/g, 'Portland'],
  [/\bPerth\b/g, 'Seattle'],
  [/\bAdelaide\b/g, 'Denver'],
  [/\bHobart\b/g, 'Boston'],
  [/\bDarwin\b/g, 'Miami'],
  [/\bCanberra\b/g, 'Washington D.C.'],

  // Specific UK/Chicago
  [/\bHeathrow Airport \(LHR\)\b/g, "O'Hare Int'l Airport (ORD)"],
  [/\bHeathrow\b/g, "O'Hare"],
  [/\bGatwick\b/g, 'Midway'],
  [/\bLondon\b/g, 'Chicago'],

  // UAE / Miami
  [/\bDubai International Airport \(DXB\)\b/g, "Miami Int'l Airport (MIA)"],
  [/\bDubai\b/g, 'Miami'],
  [/\bAbu Dhabi\b/g, 'Orlando'],
  [/\bUnited Arab Emirates\b/g, 'United States'],
  [/\bDirham\b/g, 'Dollars'],

  // United States
  [/\bKarachi\b/g, 'Houston'],
  [/\bLahore\b/g, 'Phoenix'],
  [/\bIslamabad\b/g, 'Philadelphia'],
  [/\bRawalpindi\b/g, 'San Antonio'],
  [/\bFaisalabad\b/g, 'San Jose'],
  [/\bPakistan\b/g, 'United States'],
  [/\bPakistani\b/g, 'American'],

  // Currencies & Symbols
  [/\bAU\$/g, '$'],
  [/\(USD\)/g, '(USD)'],
  [/\bAUD\b/g, 'USD'],
  [/\bPKR\b/g, 'USD'],
  [/\bAED\b/g, 'USD'],
  [/\bSAR\b/g, 'USD'],

  // AU Tax / Banking / Postal
  [/\bABN\b/g, 'EIN'],
  [/\bBSB\b/g, 'Routing #'],
  [/\bAusPost\b/g, 'USPS'],
  [/\bAustralia Post\b/g, 'USPS'],

  // Banned platform
  [/\bShopify\b/gi, 'AMEZA']
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', path.relative(ROOT_DIR, filePath));
  }
}

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    const rel = path.relative(ROOT_DIR, p).replace(/\\/g, '/');
    if (EXCLUDED.some(ex => rel === ex || rel.startsWith(ex + '/'))) continue;

    if (item.isDirectory()) {
      walk(p);
    } else if (item.isFile() && EXTENSIONS.includes(path.extname(item.name).toLowerCase())) {
      processFile(p);
    }
  }
}

console.log('Starting comprehensive replacement...');
walk(ROOT_DIR);
console.log('Done replacement!');
