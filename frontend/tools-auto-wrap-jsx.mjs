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

const jsxTextRegex = />\s*([^<{]+?[a-zA-ZàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ][^<{]*?)\s*</g;

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
  
  // Only process if the file already imports useTranslation to avoid importing logic
  // which is error-prone via regex
  if (!content.includes('useTranslation')) {
     return;
  }
  
  // Find the exact namespace they use: const { t } = useTranslation('something')
  let namespaceMatches = [...content.matchAll(/useTranslation\(\s*['"]([^'"]+)['"]/g)];
  let namespace = 'common';
  if (namespaceMatches.length > 0) {
     namespace = namespaceMatches[0][1];
  }
  
  const baseName = path.basename(file, path.extname(file));

  // Find and replace text
  let newContent = content.replace(jsxTextRegex, (match, textGroup) => {
     let text = textGroup.trim();
     // Skip numbers/symbols only
     if (text.length <= 1) return match;
     if (!/[a-zA-Zà-ỹÀ-Ỹ]/.test(text)) return match;
     if (['true', 'false', 'null', 'undefined'].includes(text.toLowerCase())) return match;
     if (text.includes('console.log') || text.includes('=>') || text.includes('/*')) return match;
     
     // Generate unique key
     const slug = slugify(text);
     const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 4);
     let finalKey = `${baseName}_${slug}_${hash}`;
     
     if (namespace === 'common' || namespace === 'employer') {
         // Auto register key in commonData if it's common or employer (fallback)
         commonData.auto[finalKey] = text;
         totalReplaced++;
         return match.replace(textGroup, `{t('common:auto.${finalKey}', \`${text}\`)}`);
     } else {
         // Just use literal fallback
         totalReplaced++;
         return match.replace(textGroup, `{t('auto.${finalKey}', \`${text}\`)}`);
     }
  });

  if (newContent !== originalContent) {
     fs.writeFileSync(file, newContent, 'utf-8');
     console.log(`Updated ${file}`);
  }
});

fs.writeFileSync(commonJsonPath, JSON.stringify(commonData, null, 2), 'utf-8');
console.log(`\nFinished auto-wrapping ${totalReplaced} hardcoded strings.`);
