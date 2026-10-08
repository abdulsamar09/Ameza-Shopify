/**
 * AMEZA Marketplace — U.S. Localization Compliance Guard (scripts/check_usa.js)
 * Scans the codebase for banned regional terms, non-US currencies,
 * and legacy platform names to ensure 100% US localization compliance.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Banned term definitions (Case-insensitive matches)
const BANNED_PATTERNS = [
  // Australian locations & terms
  { name: 'Australia / AU Locations', regex: /\b(Australia|Australian|Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin|Canberra)\b/i },
  // Pakistani locations & terms
  { name: 'Pakistan Locations', regex: /\b(Pakistan|Pakistani|Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad)\b/i },
  // Middle East / UAE terms
  { name: 'UAE / Middle East', regex: /\b(Dubai|Abu Dhabi|United Arab Emirates|Dirham)\b/i },
  // UK terms
  { name: 'UK Locations', regex: /\b(London|Heathrow|Gatwick)\b/i },
  // Non-US charge / base currencies
  { name: 'Banned Currencies', regex: /\b(AUD|PKR|AED|SAR)\b/i },
  // Australian tax & banking terms
  { name: 'AU Tax / Banking / Postal', regex: /\b(ABN|BSB|AusPost)\b/i },
  // Banned platform names
  { name: 'Banned Platform Names', regex: /\b(Shopify)\b/i }
];

// Directories & files excluded from audit
const EXCLUDED_PATHS = [
  '.git',
  'node_modules',
  'scripts/check_usa.js',
  'scripts/fix_travel_content.js', // migration helper containing regexes
  'scripts/fix_all_banned_terms.js', // migration helper containing regexes
  'scripts/apply_pricing_to_products_data.js', // migration helper containing regexes
  'scripts/crop_logo.js',
  'fix.md', // historical audit log
  '.system_generated',
  'scratch'
];

const ALLOWED_EXTENSIONS = [
  '.html', '.js', '.json', '.css', '.md', '.csv'
];

let totalFilesChecked = 0;
const violations = [];

function isExcluded(filePath) {
  const rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  for (const ex of EXCLUDED_PATHS) {
    if (rel === ex || rel.startsWith(ex + '/')) return true;
  }
  return false;
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isExcluded(fullPath)) continue;

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  totalFilesChecked++;
  const rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    for (const { name, regex } of BANNED_PATTERNS) {
      if (regex.test(line)) {
        violations.push({
          file: rel,
          line: lineIdx + 1,
          rule: name,
          snippet: line.trim().slice(0, 100)
        });
      }
    }
  });
}

console.log('🔍 Running AMEZA U.S. Localization Guard on:', ROOT_DIR);
scanDir(ROOT_DIR);

console.log(`\n📄 Total files scanned: ${totalFilesChecked}`);

if (violations.length === 0) {
  console.log('✅ PASS: 0 banned terms detected! Full US compliance verified.\n');
  process.exit(0);
} else {
  console.error(`\n❌ FAIL: Found ${violations.length} banned term violation(s):\n`);
  violations.slice(0, 30).forEach(v => {
    console.error(`  [${v.rule}] ${v.file}:${v.line} -> "${v.snippet}"`);
  });
  if (violations.length > 30) {
    console.error(`  ... and ${violations.length - 30} more.`);
  }
  process.exit(1);
}
