import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const fixedKeys = ['companyImage.imageAlt', 'companyImage.previewAlt'];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('CompanyImageCard i18n', () => {
  it('does not hard-code image alt text in English', () => {
    ['alt="Company"', 'alt="Preview"'].forEach((copy) => {
      expect(source).not.toContain(copy);
    });
  });

  it('uses employer locale keys for company image alt text', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for company image alt text', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/employer.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/employer.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
