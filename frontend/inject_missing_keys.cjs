const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');
const LANGS = ['en', 'vi'];

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(flattenKeys(v, key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}

function loadTranslations(lang) {
  const langDir = path.join(LOCALES_DIR, lang);
  const result = {};
  if (!fs.existsSync(langDir)) return result;
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const ns = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
    result[ns] = { data, keys: new Set(flattenKeys(data)) };
  }
  return result;
}

function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'locales') continue;
        results = results.concat(getAllFiles(fullPath, exts));
      } else if (exts.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

function extractTKeys(content) {
  const keys = [];
  const regex = /\bt\s*\(\s*['"`]([^'"`\n]+?)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

function extractNamespace(content) {
  const m = content.match(/useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  return m ? m[1] : null;
}

function setNested(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  if (current[parts[parts.length - 1]] === undefined) {
      current[parts[parts.length - 1]] = value;
  }
}

// Load translations
const translations = {};
for (const lang of LANGS) {
  translations[lang] = loadTranslations(lang);
}

// Collect all used keys WITH their file-level namespace
const allFiles = getAllFiles(SRC_DIR);
const usedKeysWithContext = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const fileNS = extractNamespace(content) || 'common';
  const keys = extractTKeys(content);
  
  for (const rawKey of keys) {
    // skip dynamic templates roughly
    if (rawKey.includes('${')) continue;
    
    let ns, resolvedKey;
    if (rawKey.includes(':')) {
      [ns, resolvedKey] = rawKey.split(':', 2);
    } else {
      ns = fileNS;
      resolvedKey = rawKey;
    }
    usedKeysWithContext.push({ rawKey, ns, resolvedKey });
  }
}

let injectedCount = 0;

for (const { ns, resolvedKey } of usedKeysWithContext) {
  for (const lang of LANGS) {
    if (!translations[lang][ns]) {
      console.log(`Namespace ${ns} not found for ${lang}`);
      continue;
    }
    
    const nsKeys = translations[lang][ns].keys;
    let found = false;
    
    if (nsKeys.has(resolvedKey)) {
      found = true;
    }
    
    if (!found && ns === 'common' && resolvedKey.includes('.')) {
      const firstDot = resolvedKey.indexOf('.');
      const possibleNS = resolvedKey.substring(0, firstDot);
      const possibleKey = resolvedKey.substring(firstDot + 1);
      const possibleNSObj = translations[lang][possibleNS];
      if (possibleNSObj && possibleNSObj.keys.has(possibleKey)) {
        found = true;
      }
    }
    
    if (!found) {
        // We inject it
        const parts = resolvedKey.split('.');
        const defaultText = lang === 'en' 
            ? parts[parts.length - 1].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            : `[VI] ${parts[parts.length - 1]}`;
            
        setNested(translations[lang][ns].data, resolvedKey, defaultText);
        translations[lang][ns].keys.add(resolvedKey);
        injectedCount++;
    }
  }
}

// Write injected translations back to disk
for (const lang of LANGS) {
    for (const ns of Object.keys(translations[lang])) {
        const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations[lang][ns].data, null, 2) + '\n', 'utf8');
    }
}

console.log(`Successfully injected ${injectedCount} missing keys across both languages.`);
