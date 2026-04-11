import fs from 'fs';
import path from 'path';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
      files.push(name);
    }
  }
  return files;
}

const dir = './src/views'; // Just scan views for now
const files = getFiles(dir);

// This regex tries to find text between > and < that contains letters
// It ignores things with only symbols/numbers, or {expressions}
const jsxTextRegex = />\s*([^<{]+?[a-zA-Z][^<{]*?)\s*</g;

const ignoreList = ['div', 'span', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'td', 'th', 'a', 'b', 'i', 'strong', 'em', 'button', 'mui', 'Grid', 'Box', 'Stack', 'Typography'];

let totalHardcoded = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  let fileHits = [];
  while ((match = jsxTextRegex.exec(content)) !== null) {
    let text = match[1].trim();
    if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('console.log') && !text.includes('=>') && !text.includes('/*')) {
       // Filter out common things like just numbers, punctuation, or boolean strings
       if (['true', 'false', 'null', 'undefined'].includes(text.toLowerCase())) continue;
       
       fileHits.push(text);
       totalHardcoded++;
    }
  }
  if (fileHits.length > 0) {
      console.log(`\nFile: ${file}`);
      fileHits.forEach(h => console.log(`   "${h}"`));
  }
});

console.log(`Total potential hardcoded texts found: ${totalHardcoded}`);
