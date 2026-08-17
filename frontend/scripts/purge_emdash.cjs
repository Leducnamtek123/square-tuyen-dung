const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|jsx|js|css|json)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = walkDir(srcDir);
let changedFilesCount = 0;
let totalReplacedCount = 0;

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('—')) {
    // Count occurrences
    const matches = content.match(/—/g) || [];
    const count = matches.length;

    // Replace — with -
    const updated = content.replace(/—/g, '-');
    fs.writeFileSync(filePath, updated, 'utf8');
    changedFilesCount++;
    totalReplacedCount += count;
    console.log(`Updated: ${path.relative(srcDir, filePath)} (${count} replaced)`);
  }
}

console.log(`\nPurge em-dash complete: ${totalReplacedCount} occurrences across ${changedFilesCount} files.`);
