/**
 * AMEZA Full Project Inventory Engine — scripts/inventory.js
 * Scans the entire project, indexes file references, computes SHA256 hashes,
 * performs JS syntax parsing, and writes docs/INVENTORY.md.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.system_generated',
  'scratch',
  'qa-shots'
]);

function getArea(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm.startsWith('seller/onboarding/') || norm.startsWith('onboarding/')) return 'onboarding';
  if (norm.startsWith('storefront/')) return 'storefront';
  if (norm.startsWith('travel/')) return 'travel';
  if (norm.startsWith('auth/')) return 'auth';
  if (norm.startsWith('buyer/')) return 'buyer';
  if (norm.startsWith('seller/')) return 'seller';
  if (norm.startsWith('admin/')) return 'admin';
  if (norm.startsWith('legal/')) return 'legal';
  if (norm.startsWith('shared/')) return 'shared';
  if (norm.startsWith('dev/')) return 'dev';
  if (norm.startsWith('db/')) return 'db';
  if (norm.startsWith('docs/')) return 'docs';
  if (norm.startsWith('scripts/')) return 'scripts';
  if (norm.startsWith('assets/')) return 'assets';
  if (norm.startsWith('_trash/')) return 'trash';

  // Root level categorization
  if (/^(account.*|buyer)\.html$/i.test(norm)) return 'buyer';
  if (/^(seller.*)\.html$/i.test(norm)) return 'seller';
  if (/^(admin.*)\.html$/i.test(norm)) return 'admin';
  if (/^(login|signup|forgot-password|reset-password|verify-email)\.html$/i.test(norm)) return 'auth';
  if (/^(stays.*|flights|car-rental|attractions|airport-taxis)\.html$/i.test(norm)) return 'travel';
  if (/^(selftest|prototype-index|ui-kit)\.html$/i.test(norm)) return 'dev';
  if (/^(index|shop|product|category|subcategory|tag|stores|store|cart|checkout|order-confirmation|wishlist)\.html$/i.test(norm)) return 'storefront';
  if (/^(css|js)\//i.test(norm)) return 'shared';

  return 'root';
}

function getAllFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('[Inventory] Scanning repository files...');
const allFilePaths = getAllFiles(rootDir);
console.log(`[Inventory] Found ${allFilePaths.length} total files.`);

// 1. Read all textual files into memory for reference counting
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.md', '.csv', '.svg']);
const textFileContents = [];

for (const fp of allFilePaths) {
  const ext = path.extname(fp).toLowerCase();
  if (textExtensions.has(ext)) {
    try {
      const content = fs.readFileSync(fp, 'utf8');
      textFileContents.push({ path: path.relative(rootDir, fp).replace(/\\/g, '/'), content });
    } catch (e) {}
  }
}

// 2. Analyze each file
const fileRecords = [];
const hashMap = new Map();
const zeroReferenceFiles = [];
const largeFiles = [];
const jsSyntaxErrors = [];
const orphanedHtmlPages = [];
const missingHeaderFooter = [];

for (const fp of allFilePaths) {
  const relPath = path.relative(rootDir, fp).replace(/\\/g, '/');
  const ext = path.extname(fp).toLowerCase();
  const baseName = path.basename(fp);
  const stats = fs.statSync(fp);
  const sizeBytes = stats.size;
  const area = getArea(relPath);

  // Hash calculation
  let fileHash = '';
  try {
    const buf = fs.readFileSync(fp);
    fileHash = crypto.createHash('sha256').update(buf).digest('hex');
    if (!hashMap.has(fileHash)) {
      hashMap.set(fileHash, []);
    }
    hashMap.get(fileHash).push(relPath);
  } catch (e) {}

  // File size check (> 500 KB)
  if (sizeBytes > 500 * 1024) {
    largeFiles.push({ path: relPath, sizeKB: (sizeBytes / 1024).toFixed(1) });
  }

  // Reference counting: count how many OTHER files reference this file
  let refCount = 0;
  for (const tf of textFileContents) {
    if (tf.path === relPath) continue; // skip self
    // Check if filename or relPath appears in content
    if (tf.content.includes(baseName) || tf.content.includes(relPath)) {
      refCount++;
    }
  }

  if (refCount === 0 && !relPath.startsWith('.git') && relPath !== 'package.json' && relPath !== 'server.js' && relPath !== 'README.md' && !relPath.startsWith('docs/')) {
    zeroReferenceFiles.push(relPath);
  }

  // JS Syntax parsing
  if (ext === '.js') {
    try {
      execSync(`node --check "${fp}"`, { stdio: 'pipe' });
    } catch (err) {
      jsSyntaxErrors.push({ path: relPath, error: err.stderr ? err.stderr.toString().split('\n')[0] : 'Syntax error' });
    }
  }

  // HTML checks
  if (ext === '.html') {
    // Check if any other HTML/JS page links to this page (href="baseName" or href="relPath")
    let linked = false;
    for (const tf of textFileContents) {
      if (tf.path === relPath) continue;
      if (tf.content.includes(baseName) || tf.content.includes(relPath)) {
        linked = true;
        break;
      }
    }
    if (!linked && relPath !== 'index.html' && !relPath.startsWith('dev/') && !relPath.startsWith('_trash/')) {
      orphanedHtmlPages.push(relPath);
    }

    // Header/Footer check
    try {
      const htmlContent = fs.readFileSync(fp, 'utf8');
      const hasHeader = htmlContent.includes('<header') || htmlContent.includes('id="site-header"') || htmlContent.includes('class="top-bar"');
      const hasFooter = htmlContent.includes('<footer') || htmlContent.includes('id="site-footer"') || htmlContent.includes('class="footer"');
      const dataLayout = (htmlContent.match(/data-layout=["']([^"']+)["']/i) || [])[1] || '';
      
      if (dataLayout === 'storefront' || dataLayout === 'travel') {
        if (!hasHeader || !hasFooter) {
          missingHeaderFooter.push({ path: relPath, missing: !hasHeader && !hasFooter ? 'Both' : (!hasHeader ? 'Header' : 'Footer') });
        }
      }
    } catch (e) {}
  }

  // Propose Status & Reason
  let proposedStatus = 'KEEP';
  let reason = 'Active repository component in target architecture';

  if (relPath.startsWith('_trash/')) {
    proposedStatus = 'ARCHIVED';
    reason = 'Archived in _trash/ with manifest audit trail';
  } else if (/^account.*\.html$/i.test(relPath)) {
    proposedStatus = 'MERGE / TRASH-CANDIDATE';
    reason = 'Legacy flat root page; functionality ported to /buyer/ with 301 redirect in server.js';
  } else if (/^seller-.*\.html$/i.test(relPath)) {
    proposedStatus = 'MERGE / TRASH-CANDIDATE';
    reason = 'Legacy flat root page; replaced by /seller/ dashboard with 301 redirect in server.js';
  } else if (/^admin-.*\.html$/i.test(relPath)) {
    proposedStatus = 'MERGE / TRASH-CANDIDATE';
    reason = 'Legacy flat root page; replaced by /admin/ console with 301 redirect in server.js';
  } else if (relPath.endsWith('.zip')) {
    proposedStatus = 'TRASH-CANDIDATE';
    reason = 'Large zip archive file (over 45MB) not referenced by application';
  } else if (relPath === 'import_csv.py' || relPath.endsWith('.csv') && relPath.startsWith('wc-')) {
    proposedStatus = 'TRASH-CANDIDATE';
    reason = 'One-off legacy WooCommerce import data artifact';
  } else if (relPath === 'Super-admin-dashboard/AMEZA Admin Dashboard.html') {
    proposedStatus = 'TRASH-CANDIDATE';
    reason = 'Redundant prototype file replaced by /admin/index.html';
  } else if (relPath === 'assets/logo-transparent.png' || relPath === 'assets/logo.png') {
    proposedStatus = 'MERGE';
    reason = 'Identical 1.1 MB duplicate of assets/ameza-logo.png; to be replaced by assets/brand/ameza-logo.svg';
  }

  fileRecords.push({
    path: relPath,
    type: ext || 'none',
    sizeBytes,
    refCount,
    area,
    proposedStatus,
    reason,
    fileHash
  });
}

// 3. Duplicate groups
const duplicateGroups = Array.from(hashMap.values()).filter(list => list.length > 1);

// 4. Summarize counts per area and status
const areaCounts = {};
const statusCounts = {};

fileRecords.forEach(r => {
  areaCounts[r.area] = (areaCounts[r.area] || 0) + 1;
  statusCounts[r.proposedStatus] = (statusCounts[r.proposedStatus] || 0) + 1;
});

// 5. Build docs/INVENTORY.md
let md = `# AMEZA Repository Comprehensive File Inventory\n\n`;
md += `Generated by \`scripts/inventory.js\` on ${new Date().toISOString().split('T')[0]}.\n\n`;
md += `Total scanned files: **${fileRecords.length}** across **${Object.keys(areaCounts).length}** architectural domains.\n\n`;

md += `## 1. Summary Metrics\n\n`;
md += `### Counts by Area\n`;
md += `| Area | File Count |\n|---|---|\n`;
Object.entries(areaCounts).sort((a,b) => b[1] - a[1]).forEach(([area, count]) => {
  md += `| **${area}** | ${count} |\n`;
});

md += `\n### Counts by Proposed Status\n`;
md += `| Proposed Status | File Count |\n|---|---|\n`;
Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).forEach(([status, count]) => {
  md += `| \`${status}\` | ${count} |\n`;
});

md += `\n## 2. Top 20 Biggest Architectural Findings & Candidate Redundancies\n\n`;
let problemRank = 1;

// 1. JS Syntax Errors (Urgent)
jsSyntaxErrors.forEach(jse => {
  if (problemRank <= 20) {
    md += `${problemRank++}. **JavaScript Syntax Error**: \`${jse.path}\` &mdash; ${jse.error}\n`;
  }
});

// 2. Missing Header/Footer (Layout Quality)
missingHeaderFooter.forEach(mhf => {
  if (problemRank <= 20) {
    md += `${problemRank++}. **Incomplete Layout Markup**: \`${mhf.path}\` is missing expected **${mhf.missing}** for its data-layout.\n`;
  }
});

// 3. Duplicate Groups (Identical Byte-for-Byte)
duplicateGroups.slice(0, 5).forEach(dg => {
  if (problemRank <= 20 && dg.length > 1) {
    md += `${problemRank++}. **Identical Byte-for-Byte Duplicates**: ${dg.map(p => `\`${p}\``).join(' == ')} (identical SHA256).\n`;
  }
});

// 4. Files > 500 KB (Performance)
largeFiles.slice(0, 6).forEach(lf => {
  if (problemRank <= 20) {
    md += `${problemRank++}. **Large File**: \`${lf.path}\` is **${lf.sizeKB} KB** (exceeds recommended 500 KB limit).\n`;
  }
});

// 5. Zero Reference & Legacy Flat Files
fileRecords.filter(r => r.proposedStatus.includes('TRASH-CANDIDATE')).slice(0, 8).forEach(r => {
  if (problemRank <= 20) {
    md += `${problemRank++}. **Legacy Flat File**: \`${r.path}\` (${r.reason}).\n`;
  }
});

md += `\n## 3. Complete File Master Register\n\n`;
md += `| File Path | Type | Size | References | Area | Proposed Status | Reason |\n`;
md += `|---|---|---|---|---|---|---|\n`;

fileRecords.sort((a,b) => a.path.localeCompare(b.path));

fileRecords.forEach(r => {
  const sizeFormatted = r.sizeBytes < 1024 ? `${r.sizeBytes} B` : `${(r.sizeBytes / 1024).toFixed(1)} KB`;
  md += `| \`${r.path}\` | \`${r.type}\` | ${sizeFormatted} | ${r.refCount} | **${r.area}** | \`${r.proposedStatus}\` | ${r.reason} |\n`;
});

const outPath = path.join(rootDir, 'docs', 'INVENTORY.md');
fs.writeFileSync(outPath, md, 'utf8');

console.log(`[Inventory] docs/INVENTORY.md generated successfully with ${fileRecords.length} files.`);

// Print console output for task verification
console.log('\n======================================================');
console.log('              AMEZA INVENTORY SUMMARY                 ');
console.log('======================================================');
console.log('Total files scanned:', fileRecords.length);
console.log('\nCounts by Area:');
console.table(areaCounts);
console.log('\nCounts by Proposed Status:');
console.table(statusCounts);
console.log('\nKey Findings Detected:');
console.log('- Identical duplicate groups:', duplicateGroups.length);
console.log('- Large files (> 500 KB):', largeFiles.length);
console.log('- JS files with syntax errors:', jsSyntaxErrors.length);
console.log('- Orphaned HTML pages:', orphanedHtmlPages.length);
console.log('- Pages missing required header/footer:', missingHeaderFooter.length);
console.log('======================================================\n');
