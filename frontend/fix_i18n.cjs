const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');

// --- Load all translations ---
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

function loadAllNS(lang) {
  const langDir = path.join(LOCALES_DIR, lang);
  const result = {};
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
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'locales'].includes(entry.name)) continue;
        results = results.concat(getAllFiles(fp, exts));
      } else if (exts.some(ext => entry.name.endsWith(ext))) {
        results.push(fp);
      }
    }
  } catch (e) {}
  return results;
}

const viNS = loadAllNS('vi');
const enNS = loadAllNS('en');
const allNSNames = Object.keys(viNS);

// For each source file, find which keys it uses and which NS they belong to
const allFiles = getAllFiles(SRC_DIR);
const fixes = []; // {file, currentNS, suggestedNS, keys}

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract current namespace
  const nsMatch = content.match(/useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  const currentNS = nsMatch ? nsMatch[1] : null; // null = no explicit useTranslation
  
  // Extract all t() keys (static only, skip template literals with ${})
  const keys = [];
  const regex = /\bt\s*\(\s*['"]([^'"$\n]+?)['"]/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    keys.push(m[1]);
  }
  if (keys.length === 0) continue;
  
  // For each key, find which namespace it actually exists in (check vi first as primary)
  const keyNSMap = {};
  for (const key of keys) {
    const foundIn = [];
    for (const ns of allNSNames) {
      if (viNS[ns] && viNS[ns].has(key)) foundIn.push(ns);
    }
    // Also check en
    if (foundIn.length === 0) {
      for (const ns of allNSNames) {
        if (enNS[ns] && enNS[ns].has(key)) foundIn.push(ns);
      }
    }
    keyNSMap[key] = foundIn;
  }
  
  // Determine if file needs NS fix
  const effectiveNS = currentNS || 'common';
  const keysNotInCurrentNS = keys.filter(k => {
    const found = keyNSMap[k];
    if (found.length === 0) return true; // truly missing
    return !found.includes(effectiveNS);
  });
  
  if (keysNotInCurrentNS.length > 0) {
    // Determine most likely correct NS
    const nsCounts = {};
    for (const k of keys) {
      for (const ns of (keyNSMap[k] || [])) {
        nsCounts[ns] = (nsCounts[ns] || 0) + 1;
      }
    }
    const suggestedNS = Object.entries(nsCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || effectiveNS;
    
    const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
    
    // Keys that are truly missing (not in any NS)
    const trulyMissing = keysNotInCurrentNS.filter(k => (keyNSMap[k] || []).length === 0);
    // Keys that exist but in wrong NS
    const wrongNS = keysNotInCurrentNS.filter(k => (keyNSMap[k] || []).length > 0);
    
    if (wrongNS.length > 0 || trulyMissing.length > 0) {
      fixes.push({
        file: relPath,
        fullPath: file,
        currentNS: effectiveNS,
        suggestedNS,
        wrongNS: wrongNS.map(k => ({ key: k, existsIn: keyNSMap[k] })),
        trulyMissing,
        totalKeys: keys.length,
      });
    }
  }
}

// --- Output report ---
const lines = [];
function log(s='') { lines.push(s); }

log('# I18N Namespace Fix Report');
log('');
log(`Files needing fixes: ${fixes.length}`);
log('');

// Group by fix type
const nsFixFiles = fixes.filter(f => f.wrongNS.length > 0 && f.suggestedNS !== f.currentNS);
const addKeyFiles = fixes.filter(f => f.trulyMissing.length > 0);

log('## Files using WRONG namespace (need useTranslation fix)');
log('');
for (const f of nsFixFiles) {
  log(`### ${f.file}`);
  log(`- Current: \`useTranslation('${f.currentNS}')\``);
  log(`- Suggested: \`useTranslation('${f.suggestedNS}')\``);
  log(`- Wrong NS keys (${f.wrongNS.length}): ${f.wrongNS.slice(0, 5).map(k => k.key).join(', ')}${f.wrongNS.length > 5 ? '...' : ''}`);
  if (f.trulyMissing.length > 0) {
    log(`- Truly missing (${f.trulyMissing.length}): ${f.trulyMissing.join(', ')}`);
  }
  log('');
}

log('## Truly missing keys (need to be added to JSON)');
log('');
const missingByNS = {};
for (const f of addKeyFiles) {
  for (const key of f.trulyMissing) {
    const ns = f.suggestedNS;
    if (!missingByNS[ns]) missingByNS[ns] = new Set();
    missingByNS[ns].add(key);
  }
}
for (const [ns, keys] of Object.entries(missingByNS)) {
  log(`### Namespace: ${ns} (${keys.size} keys)`);
  for (const k of keys) {
    log(`- \`${k}\``);
  }
  log('');
}

// --- Auto-fix: change useTranslation namespace ---
log('## Auto-fixing namespace issues...');
log('');

let fixedCount = 0;
for (const f of nsFixFiles) {
  // Only fix if ALL keys in the file match the suggested NS
  const content = fs.readFileSync(f.fullPath, 'utf8');
  const oldPattern = `useTranslation('${f.currentNS}')`;
  const newPattern = `useTranslation('${f.suggestedNS}')`;
  
  if (content.includes(oldPattern)) {
    // Verify: count how many keys match suggested vs current
    const keysInSuggested = f.wrongNS.filter(k => k.existsIn.includes(f.suggestedNS)).length;
    const totalWrong = f.wrongNS.length;
    
    // Only fix if majority of keys are in suggested NS
    if (keysInSuggested >= totalWrong * 0.5) {
      const newContent = content.replace(oldPattern, newPattern);
      fs.writeFileSync(f.fullPath, newContent, 'utf8');
      log(`✅ Fixed: ${f.file} → '${f.suggestedNS}'`);
      fixedCount++;
    } else {
      log(`⚠️ Skipped: ${f.file} (mixed namespaces, needs manual review)`);
    }
  } else if (!f.currentNS) {
    log(`⚠️ No useTranslation found in: ${f.file} (uses default 'common')`);
  }
}

log('');
log(`Total files auto-fixed: ${fixedCount}`);

fs.writeFileSync(path.join(__dirname, 'fix_report.md'), lines.join('\n'), 'utf8');
console.log('Done! Report written to fix_report.md');
console.log(`Auto-fixed ${fixedCount} files`);
