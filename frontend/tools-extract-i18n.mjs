import fs from 'fs';
import path from 'path';

// Recursively get all files in a directory
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

// Regex to find t('key', 'fallback') or t("key", "fallback")
// This is a naive regex but works for most cases
const tRegex = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function generateNestedObject(keyPath, value) {
  const parts = keyPath.split('.');
  const result = {};
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return result;
}

function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const dir = './src';
const files = getFiles(dir);

const localesPath = './src/i18n/locales/vi';
const namespaces = fs.readdirSync(localesPath).map(f => f.replace('.json', ''));

const missingKeys = {};

namespaces.forEach(ns => {
  missingKeys[ns] = {};
});

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    let key = match[1];
    const fallback = match[2];
    
    let namespace = 'common'; // default namespace (you may need to adjust if files use different defaults or specify them in useTranslation('namespace'))
    
    // Check if key has namespace prefix e.g 'employer:key'
    if (key.includes(':')) {
      const parts = key.split(':');
      namespace = parts[0];
      key = parts[1];
    } else {
      // Very naive way to guess namespace based on useTranslation hook in the file
      const useTranslateMatch = content.match(/useTranslation\(\s*['"]([^'"]+)['"]\s*\)/);
      if (useTranslateMatch) {
         namespace = useTranslateMatch[1];
      }
    }

    if (!namespaces.includes(namespace)) {
       // If namespace doesn't exist, we skip or add it
       continue;
    }

    const localeFile = `${localesPath}/${namespace}.json`;
    if (fs.existsSync(localeFile)) {
      const localeData = JSON.parse(fs.readFileSync(localeFile, 'utf-8'));
      const existingValue = getNestedValue(localeData, key);
      
      if (existingValue === undefined) {
         missingKeys[namespace][key] = fallback;
      }
    }
  }
});

let totalMissing = 0;
for (const ns in missingKeys) {
   const keys = Object.keys(missingKeys[ns]);
   if (keys.length > 0) {
      console.log(`\n\n--- Namespace: ${ns} ---`);
      keys.forEach(k => {
         console.log(`"${k}": "${missingKeys[ns][k]}"`);
         totalMissing++;
      });
   }
}

console.log(`\nTotal missing keys found: ${totalMissing}`);
