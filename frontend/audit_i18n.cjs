const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');
const LANGS = ['en', 'vi'];
const OUTPUT_FILE = path.join(__dirname, 'audit_output.md');

const lines = [];
function log(s = '') { lines.push(s); }

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
    result[ns] = new Set(flattenKeys(data));
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

// Load translations
const translations = {};
for (const lang of LANGS) {
  translations[lang] = loadTranslations(lang);
}

// Collect all used keys WITH their file-level namespace
const allFiles = getAllFiles(SRC_DIR);
const usedKeysWithContext = []; // { rawKey, ns, resolvedKey, file }

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const fileNS = extractNamespace(content) || 'common';
  const keys = extractTKeys(content);
  const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  
  for (const rawKey of keys) {
    let ns, resolvedKey;
    if (rawKey.includes(':')) {
      [ns, resolvedKey] = rawKey.split(':', 2);
    } else {
      ns = fileNS;
      resolvedKey = rawKey;
    }
    usedKeysWithContext.push({ rawKey, ns, resolvedKey, file: relPath });
  }
}

// Check each used key against translations
log('# I18N Audit Report');
log('');
log(`- Total source files scanned: ${allFiles.length}`);
log(`- Total translation key usages found: ${usedKeysWithContext.length}`);
log('');

// Group missing keys by namespace
const missingByLang = { en: {}, vi: {} };

for (const { rawKey, ns, resolvedKey, file } of usedKeysWithContext) {
  for (const lang of LANGS) {
    const nsKeys = translations[lang][ns];
    let found = false;
    
    if (nsKeys && nsKeys.has(resolvedKey)) {
      found = true;
    }
    
    // Also try: if default ns is common and key starts with ns name, strip it
    if (!found && ns === 'common' && resolvedKey.includes('.')) {
      const firstDot = resolvedKey.indexOf('.');
      const possibleNS = resolvedKey.substring(0, firstDot);
      const possibleKey = resolvedKey.substring(firstDot + 1);
      const possibleNSKeys = translations[lang][possibleNS];
      if (possibleNSKeys && possibleNSKeys.has(possibleKey)) {
        found = true;
      }
      // Also check if common has the nested key
      if (!found && nsKeys && nsKeys.has(resolvedKey)) {
        found = true;
      }
    }
    
    if (!found) {
      const fullKey = `${ns}:${resolvedKey}`;
      if (!missingByLang[lang][fullKey]) {
        missingByLang[lang][fullKey] = { ns, key: resolvedKey, files: [] };
      }
      if (!missingByLang[lang][fullKey].files.includes(file)) {
        missingByLang[lang][fullKey].files.push(file);
      }
    }
  }
}

// Output missing keys
for (const lang of LANGS) {
  const entries = Object.values(missingByLang[lang]);
  log(`## Missing keys in ${lang.toUpperCase()} (${entries.length} keys)`);
  log('');
  if (entries.length === 0) {
    log('None! All keys are present.');
  } else {
    log('| # | Namespace | Key | Used In |');
    log('|---|-----------|-----|---------|');
    let i = 1;
    for (const entry of entries) {
      log(`| ${i} | ${entry.ns} | \`${entry.key}\` | ${entry.files.join(', ')} |`);
      i++;
    }
  }
  log('');
}

// EN/VI Parity Check
log('## EN/VI Parity Check (keys in JSON but missing in opposite lang)');
log('');
const allNS = new Set([...Object.keys(translations.en), ...Object.keys(translations.vi)]);
for (const ns of allNS) {
  const enKeys = translations.en[ns] || new Set();
  const viKeys = translations.vi[ns] || new Set();
  const missingInVI = [...enKeys].filter(k => !viKeys.has(k));
  const missingInEN = [...viKeys].filter(k => !enKeys.has(k));
  if (missingInVI.length > 0 || missingInEN.length > 0) {
    log(`### Namespace: \`${ns}\``);
    log('');
    if (missingInVI.length > 0) {
      log(`**Missing in VI (${missingInVI.length}):**`);
      for (const k of missingInVI) log(`- \`${k}\``);
      log('');
    }
    if (missingInEN.length > 0) {
      log(`**Missing in EN (${missingInEN.length}):**`);
      for (const k of missingInEN) log(`- \`${k}\``);
      log('');
    }
  }
}

// useTranslation namespace usage
log('## useTranslation namespace usage');
log('');
const nsUsage = new Map();
const nsRegex = /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = nsRegex.exec(content)) !== null) {
    const ns = m[1];
    if (!nsUsage.has(ns)) nsUsage.set(ns, []);
    nsUsage.get(ns).push(path.relative(SRC_DIR, file).replace(/\\/g, '/'));
  }
}
log('| Namespace | File Count |');
log('|-----------|------------|');
for (const [ns, files] of nsUsage.entries()) {
  log(`| ${ns} | ${files.length} |`);
}

// Write output
fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
console.log('Done! Output written to audit_output.md');
