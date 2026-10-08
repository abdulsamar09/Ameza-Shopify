const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'design-review') continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
    else if (f.endsWith('.html') || f.endsWith('.js')) files.push(full);
  }
  return files;
}

const files = walk(rootDir);
let count = 0;
for (const f of files) {
  if (f.endsWith('utils.js') || f.endsWith('sanitize.js')) continue;
  let text = fs.readFileSync(f, 'utf8');
  let newText = text.replace(/'\.\/js\/utils\/sanitize\.js'/g, "'./js/core/utils.js'")
                    .replace(/"\.\/js\/utils\/sanitize\.js"/g, '"./js/core/utils.js"')
                    .replace(/'\.\/utils\/sanitize\.js'/g, "'./core/utils.js'")
                    .replace(/"\.\/utils\/sanitize\.js"/g, '"./core/utils.js"');
  if (newText !== text) {
    fs.writeFileSync(f, newText, 'utf8');
    count++;
    console.log('Replaced sanitize in:', path.basename(f));
  }
}
console.log('Updated', count, 'files.');
