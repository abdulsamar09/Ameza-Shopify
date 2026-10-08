/**
 * AMEZA Security Verification: XSS Escaping Check
 * Scans JavaScript UI rendering templates to verify that dynamic
 * product and seller fields are wrapped with escapeHTML().
 */

const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../js/app.js'),
  path.join(__dirname, '../js/account-ui.js')
];

let issuesFound = 0;

targetFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Fields that must be escaped when rendered in templates
  const vulnerableFieldPatterns = [
    /\$\{\s*p\.name\s*\}/g,
    /\$\{\s*p\.category\s*\}/g,
    /\$\{\s*p\.badge\s*\}/g,
    /\$\{\s*p\.description\s*\}/g,
    /\$\{\s*cat\.name\s*\}/g,
    /\$\{\s*o\.items\.join/g
  ];

  lines.forEach((line, index) => {
    vulnerableFieldPatterns.forEach(pattern => {
      if (pattern.test(line) && !line.includes('escapeHTML(') && !line.includes('sanitizeHTML(')) {
        console.warn(`[XSS Warning] ${path.basename(filePath)}:${index + 1} - Raw unescaped interpolation found: ${line.trim()}`);
        issuesFound++;
      }
    });
  });
});

if (issuesFound > 0) {
  console.log(`\n❌ Found ${issuesFound} potential unescaped template string interpolations.`);
  process.exitCode = 1;
} else {
  console.log('\n✅ All targeted template string interpolations are safely escaped with escapeHTML() / sanitizeHTML().');
}
