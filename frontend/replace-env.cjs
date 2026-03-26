const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) { 
      results = results.concat(walk(file));
    } else { 
      if (file.match(/\.(tsx?|jsx?|html)$/)) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src')
    .concat(['./.env', './.env.example', './Dockerfile.prod', '../docker-compose.yml']);

let count = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;
      if (content.includes('import.meta.env.VITE_')) {
          content = content.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
          changed = true;
      }
      if (content.includes('VITE_')) {
          content = content.replace(/VITE_/g, 'NEXT_PUBLIC_');
          changed = true;
      }
      if (changed) {
          fs.writeFileSync(file, content);
          count++;
          console.log(`Updated: ${file}`);
      }
  }
});
console.log(`Total replaced in ${count} files.`);
