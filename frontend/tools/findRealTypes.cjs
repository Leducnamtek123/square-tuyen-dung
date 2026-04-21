const fs = require('fs');
const path = require('path');

const files = [];
const walk = (dir) => {
  const list = fs.readdirSync(dir);
  list.forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.d.ts')) {
      files.push(p);
    }
  });
};

walk('src');

const lines = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const cLines = content.split('\n');
  cLines.forEach((l, i) => {
    // Only capture lines that look like type declarations or assertions, ignoring catch blocks and CSS properties
    if (
      (l.includes('unknown') && !l.includes('catch(') && !l.includes('catch (') && !l.includes('typeof')) ||
      (l.includes('object') && !l.includes('objectFit') && !l.includes('objectPosition') && !l.includes('createObjectURL') && !l.includes('typeof') && !l.includes('yup.object()'))
    ) {
        
        // Let's do a more careful check: only if it contains `: object` or `: unknown` or `unknown[]` or `Record<..., unknown>` or `as unknown`
        if (
            l.match(/:\s*unknown\b/) || 
            l.match(/:\s*object\b/) || 
            l.match(/<\s*unknown\s*>/) ||
            l.match(/\bunknown\s*\[\]/) ||
            l.match(/as\s+unknown\b/) ||
            l.match(/as\s+object\b/) ||
            l.match(/\[key:\s*string\]:\s*unknown/)
        ) {
              // skip errorHandling.ts and api.ts which are generic utils
              if (!f.includes('apiClient.ts') && !f.includes('api.ts') && !f.includes('errorHandling.ts')) {
                  lines.push({ file: f, line: i + 1, text: l.trim().substring(0, 80) });
              }
        }
    }
  });
});

console.log(JSON.stringify(lines, null, 2));
