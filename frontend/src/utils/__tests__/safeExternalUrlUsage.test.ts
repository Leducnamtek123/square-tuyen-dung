import { readFileSync } from 'fs';
import { join, relative } from 'path';

const SOURCE_ROOT = join(__dirname, '..', '..');

const readSourceFiles = (dir: string): string[] => {
  const { readdirSync, statSync } = require('fs') as typeof import('fs');
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      if (entry === '__tests__') return [];
      return readSourceFiles(path);
    }
    if (!/\.(tsx|ts)$/.test(entry)) return [];
    if (entry === 'safeExternalUrl.ts') return [];
    return [path];
  });
};

describe('safe external URL usage', () => {
  it('does not render dynamic URL hrefs without a safe URL helper', () => {
    const offenders: string[] = [];

    for (const filePath of readSourceFiles(SOURCE_ROOT)) {
      const source = readFileSync(filePath, 'utf8');
      const hrefMatches = source.matchAll(/href=\{([^}]*[Uu]rl[^}]*)\}/g);
      for (const match of hrefMatches) {
        const expression = match[1];
        if (/safe|getSafeExternalOpenUrl/.test(expression)) continue;

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${relative(SOURCE_ROOT, filePath)}:${line}:href={${expression}}`);
      }

      const objectHrefMatches = source.matchAll(/\bhref:\s*([^,\n}]*[Uu]rl[^,\n}]*)/g);
      for (const match of objectHrefMatches) {
        const expression = match[1].trim();
        if (/safe|getSafeExternalOpenUrl|getSafeResourceUrl/.test(expression)) continue;

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${relative(SOURCE_ROOT, filePath)}:${line}:href: ${expression}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not pass raw file URLs into resource viewers or downloads', () => {
    const offenders: string[] = [];

    for (const filePath of readSourceFiles(SOURCE_ROOT)) {
      const source = readFileSync(filePath, 'utf8');
      const relativePath = relative(SOURCE_ROOT, filePath);
      const normalizedPath = relativePath.replace(/\\/g, '/');

      const fileUrlPropMatches = source.matchAll(/\bfileUrl=\{([^}]*)\}/g);
      for (const match of fileUrlPropMatches) {
        const expression = match[1].trim();
        if (/safe|getSafeResourceUrl/.test(expression)) continue;
        if (normalizedPath === 'components/Common/Pdf/index.tsx' && expression === 'fileUrl') {
          continue;
        }

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${relativePath}:${line}:fileUrl={${expression}}`);
      }

      const downloadMatches = source.matchAll(/downloadPdf\(([^)]*[Ff]ile[Uu]rl[^)]*)\)/g);
      for (const match of downloadMatches) {
        const expression = match[1].trim();
        if (/safe|getSafeResourceUrl/.test(expression)) continue;

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${relativePath}:${line}:downloadPdf(${expression})`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not render chat attachment images from a raw attachment URL', () => {
    const source = readFileSync(join(SOURCE_ROOT, 'views', 'components', 'chats', 'Message', 'index.tsx'), 'utf8');

    expect(source).not.toContain('src={attachmentUrl}');
    expect(source).not.toContain('openExternalUrlSafely(attachmentUrl)');
  });

  it('adds noopener and noreferrer to every target blank link', () => {
    const offenders: string[] = [];

    for (const filePath of readSourceFiles(SOURCE_ROOT)) {
      const source = readFileSync(filePath, 'utf8');
      const blankTargetMatches = source.matchAll(/<[^>]*\btarget=(?:"_blank"|\{[^}]*['_"]_blank['_"][^}]*\})[^>]*>/gs);

      for (const match of blankTargetMatches) {
        const element = match[0];
        if (/\brel=/.test(element) && /noopener/.test(element) && /noreferrer/.test(element)) {
          continue;
        }

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${relative(SOURCE_ROOT, filePath)}:${line}:${element.replace(/\s+/g, ' ').trim()}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
