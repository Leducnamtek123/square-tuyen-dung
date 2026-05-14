const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');
const LANGS = ['en', 'vi'];
const OUTPUT_FILE = path.join(__dirname, 'audit_output.md');
const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const lines = [];
function log(line = '') {
  lines.push(line);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function flattenValues(obj, prefix = '') {
  const entries = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenValues(value, nextKey));
    } else {
      entries.push([nextKey, value]);
    }
  }
  return entries;
}

function loadTranslations(lang) {
  const langDir = path.join(LOCALES_DIR, lang);
  const result = {};
  if (!fs.existsSync(langDir)) return result;

  for (const file of fs.readdirSync(langDir).filter((name) => name.endsWith('.json'))) {
    const ns = file.replace(/\.json$/, '');
    const fullPath = path.join(langDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    result[ns] = {
      path: fullPath,
      entries: flattenValues(data),
      keys: new Set(flattenValues(data).map(([key]) => key)),
    };
  }

  return result;
}

function getAllSourceFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'locales'].includes(entry.name)) continue;
      files.push(...getAllSourceFiles(fullPath));
    } else if (SOURCE_EXTS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseNamespaces(args) {
  const source = args.trim();
  if (!source) return ['common'];

  const arrayMatch = source.match(/^\[\s*([\s\S]*?)\s*\]/);
  if (arrayMatch) {
    const namespaces = [...arrayMatch[1].matchAll(/['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
    return namespaces.length ? namespaces : ['common'];
  }

  const stringMatch = source.match(/^['"`]([^'"`]+)['"`]/);
  return stringMatch ? [stringMatch[1]] : ['common'];
}

function extractTranslationBindings(content) {
  const bindings = new Map();
  const regex = /\b(?:const|let|var)\s+(\{[^}]*\}|\[[^\]]*\])\s*=\s*useTranslation\s*\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const bindingSource = match[1].trim();
    const namespaces = parseNamespaces(match[2]);
    const defaultNamespace = namespaces[0] || 'common';

    if (bindingSource.startsWith('{')) {
      const inside = bindingSource.slice(1, -1);
      for (const part of inside.split(',')) {
        const segment = part.trim();
        if (!segment) continue;

        const aliasMatch = segment.match(/^t\s*:\s*([A-Za-z_$][\w$]*)$/);
        if (segment === 't' || aliasMatch) {
          const alias = aliasMatch ? aliasMatch[1] : 't';
          if (!bindings.has(alias)) bindings.set(alias, new Set());
          bindings.get(alias).add(defaultNamespace);
        }
      }
    } else if (bindingSource.startsWith('[')) {
      const first = bindingSource.slice(1, -1).split(',')[0]?.trim();
      if (first && /^[A-Za-z_$][\w$]*$/.test(first)) {
        if (!bindings.has(first)) bindings.set(first, new Set());
        bindings.get(first).add(defaultNamespace);
      }
    }
  }

  return bindings;
}

function findMatchingParen(content, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = openIndex; i < content.length; i += 1) {
    const char = content[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function readFirstStringArgument(args) {
  let index = 0;
  while (index < args.length && /\s/.test(args[index])) index += 1;

  const quote = args[index];
  if (!['"', "'", '`'].includes(quote)) return null;

  let value = '';
  let escaped = false;
  for (let i = index + 1; i < args.length; i += 1) {
    const char = args[i];
    if (escaped) {
      value += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === quote) {
      return {
        value,
        endIndex: i + 1,
        isTemplate: quote === '`',
      };
    }
    value += char;
  }

  return null;
}

function extractTCalls(content, bindings) {
  const calls = [];

  for (const [alias, defaultNamespaces] of bindings.entries()) {
    const callRegex = new RegExp(`(?<![\\w$.])${escapeRegExp(alias)}\\s*\\(`, 'g');
    let match;

    while ((match = callRegex.exec(content)) !== null) {
      const openIndex = content.indexOf('(', match.index);
      const closeIndex = findMatchingParen(content, openIndex);
      if (closeIndex < 0) continue;

      const args = content.slice(openIndex + 1, closeIndex);
      const firstArg = readFirstStringArgument(args);
      if (!firstArg) continue;
      if (firstArg.isTemplate && firstArg.value.includes('${')) continue;

      const optionsText = args.slice(firstArg.endIndex);
      const nsMatch = optionsText.match(/\bns\s*:\s*['"`]([^'"`]+)['"`]/);
      const explicitNamespace = nsMatch ? nsMatch[1] : null;

      calls.push({
        rawKey: firstArg.value,
        explicitNamespace,
        defaultNamespaces: [...defaultNamespaces],
      });
    }
  }

  return calls;
}

function resolveCall(call) {
  if (call.rawKey.includes(':')) {
    const [namespace, ...keyParts] = call.rawKey.split(':');
    return [{ namespace, key: keyParts.join(':') }];
  }

  if (call.explicitNamespace) {
    return [{ namespace: call.explicitNamespace, key: call.rawKey }];
  }

  return call.defaultNamespaces.map((namespace) => ({ namespace, key: call.rawKey }));
}

function hasKey(lang, candidates) {
  return candidates.some(({ namespace, key }) => {
    if (namespace === '*') {
      return Object.values(translations[lang]).some((data) => data.keys.has(key));
    }
    return translations[lang][namespace]?.keys.has(key);
  });
}

const translations = Object.fromEntries(LANGS.map((lang) => [lang, loadTranslations(lang)]));
const sourceFiles = getAllSourceFiles(SRC_DIR);
const usages = [];

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let bindings = extractTranslationBindings(content);

  if (bindings.size === 0) {
    if (!content.includes('t(') && !content.includes('TFunction')) continue;
    bindings = new Map([['t', new Set(['*'])]]);
  }

  const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  for (const call of extractTCalls(content, bindings)) {
    usages.push({ ...call, file: relPath });
  }
}

const missingByLang = Object.fromEntries(LANGS.map((lang) => [lang, new Map()]));

for (const usage of usages) {
  const candidates = resolveCall(usage);

  for (const lang of LANGS) {
    if (hasKey(lang, candidates)) continue;

    const primary = candidates[0];
    const reportNamespace = primary.namespace === '*' ? 'unknown' : primary.namespace;
    const reportKey = `${reportNamespace}:${primary.key}`;
    if (!missingByLang[lang].has(reportKey)) {
      missingByLang[lang].set(reportKey, {
        namespace: reportNamespace,
        key: primary.key,
        files: new Set(),
      });
    }
    missingByLang[lang].get(reportKey).files.add(usage.file);
  }
}

const keyLikeValues = [];
for (const lang of LANGS) {
  for (const [namespace, data] of Object.entries(translations[lang])) {
    for (const [key, value] of data.entries) {
      if (typeof value !== 'string') continue;
      const normalized = value.trim();
      const isSimpleWord = !key.includes('.') && !normalized.includes('.') && !normalized.includes(':');
      if (!isSimpleWord && (normalized === key || normalized === `${namespace}.${key}` || normalized === `${namespace}:${key}`)) {
        keyLikeValues.push({ lang, namespace, key, value: normalized });
      }
    }
  }
}

log('# I18N Audit Report');
log('');
log(`- Source files scanned: ${sourceFiles.length}`);
log(`- Static t() calls checked: ${usages.length}`);
log('');

let hasFailures = false;
for (const lang of LANGS) {
  const entries = [...missingByLang[lang].values()];
  if (entries.length > 0) hasFailures = true;

  log(`## Missing keys in ${lang.toUpperCase()} (${entries.length})`);
  log('');
  if (entries.length === 0) {
    log('None.');
  } else {
    log('| # | Namespace | Key | Used In |');
    log('|---|-----------|-----|---------|');
    entries
      .sort((a, b) => `${a.namespace}:${a.key}`.localeCompare(`${b.namespace}:${b.key}`))
      .forEach((entry, index) => {
        log(`| ${index + 1} | ${entry.namespace} | \`${entry.key}\` | ${[...entry.files].sort().join(', ')} |`);
      });
  }
  log('');
}

if (keyLikeValues.length > 0) hasFailures = true;
log(`## Key-like translation values (${keyLikeValues.length})`);
log('');
if (keyLikeValues.length === 0) {
  log('None.');
} else {
  log('| Language | Namespace | Key | Value |');
  log('|----------|-----------|-----|-------|');
  for (const item of keyLikeValues) {
    log(`| ${item.lang} | ${item.namespace} | \`${item.key}\` | \`${item.value}\` |`);
  }
}
log('');

log('## EN/VI Parity Check');
log('');
const allNamespaces = new Set([
  ...Object.keys(translations.en),
  ...Object.keys(translations.vi),
]);
let parityRows = 0;
for (const namespace of [...allNamespaces].sort()) {
  const enKeys = translations.en[namespace]?.keys || new Set();
  const viKeys = translations.vi[namespace]?.keys || new Set();
  const missingInVI = [...enKeys].filter((key) => !viKeys.has(key));
  const missingInEN = [...viKeys].filter((key) => !enKeys.has(key));
  if (missingInVI.length === 0 && missingInEN.length === 0) continue;
  parityRows += 1;
  log(`### ${namespace}`);
  log('');
  if (missingInVI.length > 0) log(`- Missing in VI: ${missingInVI.length}`);
  if (missingInEN.length > 0) log(`- Missing in EN: ${missingInEN.length}`);
  log('');
}
if (parityRows === 0) log('EN and VI contain the same key paths.');

fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');

if (hasFailures) {
  console.error('I18N audit failed. See audit_output.md for details.');
  process.exit(1);
}

console.log('I18N audit passed. Output written to audit_output.md');
