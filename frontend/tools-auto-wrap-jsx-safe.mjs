import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
      files.push(name);
    }
  }
  return files;
}

const dir = './src/views';
const files = getFiles(dir);

// This safe regex ensures it only matches text right before a closing tag </
const safeJsxTextRegex = />([^<>{]+?)<\//g;

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
}

const commonJsonPath = './src/i18n/locales/vi/common.json';
let commonData = {};
if (fs.existsSync(commonJsonPath)) {
  commonData = JSON.parse(fs.readFileSync(commonJsonPath, 'utf-8'));
}
if (!commonData.auto) commonData.auto = {};

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;
  
  if (!content.includes('useTranslation')) {
     return;
  }
  
  let namespaceMatches = [...content.matchAll(/useTranslation\(\s*['"]([^'"]+)['"]/g)];
  let namespace = 'common';
  if (namespaceMatches.length > 0) {
     namespace = namespaceMatches[0][1];
  }
  
  const baseName = path.basename(file, path.extname(file));

  let newContent = content.replace(safeJsxTextRegex, (match, textGroup) => {
     let text = textGroup.trim();
     
     if (text.length <= 1) return match;
     if (!/[a-zA-Zà-ỹÀ-Ỹ]/.test(text)) return match;
     if (['true', 'false', 'null', 'undefined'].includes(text.toLowerCase())) return match;
     if (text.includes('console.log') || text.includes('=>') || text.includes('/*')) return match;
     // Ignore code statements
     if (text.includes('return ') || text.includes('import ') || text.includes('const ')) return match;
     
     const slug = slugify(text);
     const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 4);
     let finalKey = `${baseName}_${slug}_${hash}`;
     
     if (namespace === 'common' || namespace === 'employer' || namespace === 'admin' || namespace === 'jobseeker') {
         commonData.auto[finalKey] = text;
         totalReplaced++;
         return `>{t('${namespace}:auto.${finalKey}', \`${text}\`)}</`;
     } else {
         totalReplaced++;
         return `>{t('auto.${finalKey}', \`${text}\`)}</`;
     }
  });

  if (newContent !== originalContent) {
     fs.writeFileSync(file, newContent, 'utf-8');
     console.log(`Updated ${file}`);
  }
});

fs.writeFileSync(commonJsonPath, JSON.stringify(commonData, null, 2), 'utf-8');
console.log(`\nFinished auto-wrapping ${totalReplaced} hardcoded strings.`);
