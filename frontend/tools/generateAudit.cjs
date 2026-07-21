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

let unknownCount = 0;
let objectCount = 0;
const lines = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const cLines = content.split('\n');
  cLines.forEach((l, i) => {
    if (l.includes('unknown')) {
      unknownCount++;
      lines.push(`| ${f} | ${i + 1} | unknown | type-level | ${l.trim().substring(0, 50)} |`);
    } else if (l.includes('object')) {
      objectCount++;
      lines.push(`| ${f} | ${i + 1} | object | type-level | ${l.trim().substring(0, 50)} |`);
    }
  });
});

const total = unknownCount + objectCount;
const md = `# Type Audit: \`unknown\` / \`object\` Remaining

Generated: ${new Date().toISOString()}
Scope: \`frontend/src\` (\`.ts\`, \`.tsx\`, \`.d.ts\`)

## Summary

- Total matches: **${total}**
- unknown matches: **${unknownCount}**
- object matches: **${objectCount}**

## Detailed List

| File | Line | Kind | Classification | Snippet |
|---|---:|---|---|---|
${lines.join('\n')}`;

fs.writeFileSync('TYPE_UNKNOWN_OBJECT_AUDIT.md', md);
console.log('Done');
