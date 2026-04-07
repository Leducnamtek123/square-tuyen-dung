const fs = require('fs');
const path = require('path');
const viAdmin = require('./src/i18n/locales/vi/admin.json');
const viCommon = require('./src/i18n/locales/vi/common.json');
const viInterview = require('./src/i18n/locales/vi/interview.json');

// Flatten nested object to dot notation
function flatten(obj, prefix) {
  prefix = prefix || '';
  const result = {};
  for (const key of Object.keys(obj)) {
    const p = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flatten(obj[key], p));
    } else {
      result[p] = obj[key];
    }
  }
  return result;
}

const flatAdmin = flatten(viAdmin);
const flatCommon = flatten(viCommon);
const flatInterview = flatten(viInterview);

// Recursively find all tsx files in adminPages
function findFiles(dir, ext) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(findFiles(full, ext));
    } else if (full.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const adminDir = path.join(__dirname, 'src', 'views', 'adminPages');
const layoutDir = path.join(__dirname, 'src', 'layouts');
const files = findFiles(adminDir, '.tsx');
if (fs.existsSync(layoutDir)) {
  files.push(...findFiles(layoutDir, '.tsx'));
}

const missing = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find which namespace this file uses
  const nsMatch = content.match(/useTranslation\(\[?['"](\w+)['"]/);
  const ns = nsMatch ? nsMatch[1] : 'admin';
  
  // Find all t('key') or t("key") calls  
  const tCalls = content.matchAll(/\bt\(\s*['"`]([^'"`\n{]+?)['"`]\s*[),]/g);
  
  for (const match of tCalls) {
    const key = match[1];
    // Skip interpolation patterns like `pages.interviews.status.${val}`
    if (key.includes('$')) continue;
    
    let found = false;
    if (ns === 'admin') {
      found = key in flatAdmin;
    } else if (ns === 'common') {
      found = key in flatCommon;
    } else if (ns === 'interview') {
      found = key in flatInterview;
    }
    
    // Also check if it's a namespace-prefixed key like admin:key or common:key
    if (!found && key.includes(':')) {
      const [keyNs, keyPath] = key.split(':');
      if (keyNs === 'admin') found = keyPath in flatAdmin;
      else if (keyNs === 'common') found = keyPath in flatCommon;
      else if (keyNs === 'interview') found = keyPath in flatInterview;
    }
    
    // For multi-namespace like ['interview', 'admin'], check both
    if (!found && ns === 'interview') {
      found = key in flatAdmin;
    }
    
    // Check if key points to an object (not a leaf) - that's also valid for nested access
    if (!found) {
      // Check if any key starts with this prefix (meaning it's an object node)
      const prefix = key + '.';
      if (ns === 'admin') {
        found = Object.keys(flatAdmin).some(k => k.startsWith(prefix));
      } else if (ns === 'common') {
        found = Object.keys(flatCommon).some(k => k.startsWith(prefix));
      }
    }
    
    if (!found) {
      const relFile = path.relative(__dirname, file).replace(/\\/g, '/');
      missing.push(`MISSING [${ns}]: "${key}" in ${relFile}`);
    }
  }
}

if (missing.length === 0) {
  console.log('All translation keys are valid!');
} else {
  console.log(`Found ${missing.length} missing translation keys:\n`);
  // Deduplicate
  const unique = [...new Set(missing)];
  unique.forEach(m => console.log(m));
}
