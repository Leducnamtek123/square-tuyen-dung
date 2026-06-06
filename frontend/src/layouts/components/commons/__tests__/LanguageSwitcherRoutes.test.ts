import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('LanguageSwitcher route localization', () => {
  const source = readFileSync(
    resolve(__dirname, '../LanguageSwitcher/index.tsx'),
    'utf-8'
  );

  it('uses the shared route localizer for every current path instead of a separate portal map', () => {
    expect(source).toContain('localizeRoutePath(currentPath, lng)');
    expect(source).not.toContain('toCanonicalChildPath');
    expect(source).not.toContain('localizeCanonicalChildPath');
    expect(source).not.toContain('stripPortalPrefix');
    expect(source).not.toContain('buildPortalPath');
  });
});
