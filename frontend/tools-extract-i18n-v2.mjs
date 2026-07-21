import fs from 'fs';
import path from 'path';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx')) {
      files.push(name);
    }
  }
  return files;
}

const tRegex = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;

function getNestedValue(obj, p) {
  return p.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const dir = './src';
const files = getFiles(dir);

const localesPath = './src/i18n/locales/vi';
// fallback for namespaces to test
const namespacesMap = {
  'employer': JSON.parse(fs.readFileSync(`${localesPath}/employer.json`, 'utf-8')),
  // Add other namespaces if they exist
};

if (fs.existsSync(`${localesPath}/jobseeker.json`)) namespacesMap['jobseeker'] = JSON.parse(fs.readFileSync(`${localesPath}/jobseeker.json`, 'utf-8'));
if (fs.existsSync(`${localesPath}/admin.json`)) namespacesMap['admin'] = JSON.parse(fs.readFileSync(`${localesPath}/admin.json`, 'utf-8'));

const missingKeys = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    let key = match[1];
    const fallback = match[2];
    
    // Check all parsed namespaces to see if any has it
    let found = false;
    for (const ns in namespacesMap) {
      const existing = getNestedValue(namespacesMap[ns], key);
      if (existing !== undefined) {
        found = true;
        break;
      }
    }
    
    // Check if key has explicit namespace
    if(key.includes(':')) {
       const keyParts = key.split(':');
       const ns = keyParts[0];
       const realKey = keyParts[1];
       if (namespacesMap[ns] && getNestedValue(namespacesMap[ns], realKey) !== undefined) {
          found = true;
       }
    }

    if (!found) {
       missingKeys.push({ file, key, fallback });
    }
  }
});

console.log(`Total missing: ${missingKeys.length}`);
missingKeys.forEach(m => console.log(`${m.key} -> ${m.fallback} (in ${m.file})`));
