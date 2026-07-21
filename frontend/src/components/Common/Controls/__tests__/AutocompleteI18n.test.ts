import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const srcRoot = join(__dirname, '../../../..');

const collectTsxFiles = (dir: string): string[] => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      if (entry === '__tests__') return [];
      return collectTsxFiles(path);
    }

    return entry.endsWith('.tsx') ? [path] : [];
  });
};

describe('Autocomplete i18n defaults', () => {
  it('overrides MUI default English dropdown text in production components', () => {
    const autocompleteFiles = collectTsxFiles(srcRoot).filter((path) => {
      const source = readFileSync(path, 'utf8');
      return source.includes('<Autocomplete');
    });

    expect(autocompleteFiles.length).toBeGreaterThan(0);

    for (const path of autocompleteFiles) {
      const source = readFileSync(path, 'utf8');

      expect(source).toContain('noOptionsText=');
      expect(source).toContain('loadingText=');
      expect(source).toContain('openText=');
      expect(source).toContain('closeText=');
      expect(source).toContain('clearText=');
    }
  });

  it('defines common locale entries for Autocomplete UI text', () => {
    const vi = JSON.parse(readFileSync(join(srcRoot, 'i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(srcRoot, 'i18n/locales/en/common.json'), 'utf8'));

    for (const key of ['loading', 'noOptions']) {
      expect(vi[key]).toEqual(expect.any(String));
      expect(en[key]).toEqual(expect.any(String));
    }

    for (const key of ['clear', 'open', 'close']) {
      expect(vi.autocomplete[key]).toEqual(expect.any(String));
      expect(en.autocomplete[key]).toEqual(expect.any(String));
    }
  });
});
