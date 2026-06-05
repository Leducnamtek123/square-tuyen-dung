import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fixedKeys = [
  'aiHealth.title',
  'aiHealth.status.online',
  'aiHealth.status.offline',
  'aiHealth.status.notConfigured',
  'aiHealth.status.checking',
];

describe('AIServiceHealthBanner i18n', () => {
  it('does not hide AI health labels with hard-coded English fallback copy', () => {
    ['AI services', 'Online', 'Not configured', 'Offline', 'Checking...'].forEach((copy) => {
      expect(source).not.toContain(copy);
    });

    fixedKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English admin locale entries for AI health labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
