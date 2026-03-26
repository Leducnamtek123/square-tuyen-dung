const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk(path.join(__dirname, 'src/views'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace window.location.origin
  content = content.replaceAll('window.location.origin', "(typeof window !== 'undefined' ? window.location.origin : '')");
  
  // Replace window.location.href
  content = content.replaceAll('window.location.href', "(typeof window !== 'undefined' ? window.location.href : '')");

  // Replace window.location.pathname
  content = content.replaceAll('window.location.pathname', "(typeof window !== 'undefined' ? window.location.pathname : '')");

  // Fix edge cases where it was twice wrapped or syntax got weird
  content = content.replaceAll("(typeof window !== 'undefined' ? (typeof window !== 'undefined' ? window.location.origin : '') : '')", "(typeof window !== 'undefined' ? window.location.origin : '')");
  content = content.replaceAll("(typeof window !== 'undefined' ? (typeof window !== 'undefined' ? window.location.href : '') : '')", "(typeof window !== 'undefined' ? window.location.href : '')");
  content = content.replaceAll("(typeof window !== 'undefined' ? (typeof window !== 'undefined' ? window.location.pathname : '') : '')", "(typeof window !== 'undefined' ? window.location.pathname : '')");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});
