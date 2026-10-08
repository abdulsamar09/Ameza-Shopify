const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

['div', 'section', 'main', 'header', 'footer', 'aside', 'form', 'nav'].forEach(tag => {
  const openRegex = new RegExp('<' + tag + '(\\s+[^>]*>|>)', 'gi');
  const closeRegex = new RegExp('</' + tag + '>', 'gi');
  const openCount = (html.match(openRegex) || []).length;
  const closeCount = (html.match(closeRegex) || []).length;
  console.log(`${tag}: opened=${openCount}, closed=${closeCount} -> ${openCount === closeCount ? 'BALANCED' : 'UNBALANCED'}`);
});
