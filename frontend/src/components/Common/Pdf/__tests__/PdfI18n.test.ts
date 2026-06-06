import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const fixedKeys = ['actions.zoomOut', 'actions.zoomIn'];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('Pdf i18n', () => {
  it('does not hard-code fallback text for the download action', () => {
    const call = source.match(/t\('actions\.download'[\s\S]*?\)/)?.[0] || '';

    expect(call).toContain("t('actions.download'");
    expect(call).not.toContain('defaultValue');
    expect(call).not.toMatch(/t\('actions\.download'\s*,\s*['"]/);
  });

  it('does not hard-code zoom aria labels', () => {
    ['aria-label="zoom-out"', 'aria-label="zoom-in"'].forEach((copy) => {
      expect(source).not.toContain(copy);
    });
  });

  it('uses common locale keys for zoom aria labels', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for zoom aria labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
