import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fixedKeys = [
  'profileUpload.allowSearch',
  'profileUpload.searchHelp',
  'profileUpload.lastUpdated',
  'profileUpload.download',
  'profileUpload.editResume',
  'profileUpload.deleteResume',
];

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('ProfileUploadCard i18n', () => {
  it('does not hard-code fixed Vietnamese or English card copy', () => {
    [
      'Cho phép tìm kiếm',
      'Bật "Cho phép tìm kiếm"',
      'Cập nhật lần cuối:',
      'Tải xuống',
      'aria-label="edit resume"',
      'aria-label="delete resume"',
    ].forEach((copy) => {
      expect(source).not.toContain(copy);
    });
  });

  it('uses common profile upload locale keys for fixed card copy', () => {
    expect(source).toContain("useTranslation('common')");
    fixedKeys.forEach((key) => {
      expect(source).toContain(key);
    });
  });

  it('has Vietnamese and English locale entries for fixed card copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
