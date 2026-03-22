const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'public', 'assets', 'css', 'main.css');
let css = fs.readFileSync(cssPath, 'utf8');

console.log('Original size:', css.length);

// 1. Remove comments
css = css.replace(/\/\*[\s\S]*?\*\//g, '');

// 2. Remove unused blocks - Brand styles
// (Roughly identified by searching for .brand-image and .title-wrap blocks in main.css)
// Since we identified them as unused, we'll strip them if we find them.
// But minification is more important.

// 3. Minify
css = css.replace(/\s+/g, ' '); // Replace all whitespace with single space
css = css.replace(/\s*([{}:;,])\s*/g, '$1'); // Remove spaces around delimiters
css = css.replace(/;}/g, '}'); // Remove last semicolon in blocks
css = css.trim();

console.log('Minified size:', css.length);

fs.writeFileSync(cssPath, css);
console.log('Successfully minified main.css');
