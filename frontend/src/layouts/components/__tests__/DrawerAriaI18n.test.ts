import { readFileSync } from 'fs';
import { join } from 'path';

const files = [
  '../MuiShellLayout.tsx',
  '../employers/Header/index.tsx',
  '../commons/Header/index.tsx',
];

const sources = files.map((file) => readFileSync(join(__dirname, file), 'utf8'));

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('layout drawer aria i18n', () => {
  it('does not hard-code open drawer aria labels', () => {
    sources.forEach((source) => {
      expect(source).not.toContain('aria-label="open drawer"');
      expect(source).toContain("t('actions.openDrawer')");
    });
  });

  it('has Vietnamese and English locale entries for open drawer action', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'actions.openDrawer')).toEqual(expect.any(String));
    expect(readKey(en, 'actions.openDrawer')).toEqual(expect.any(String));
  });
});
