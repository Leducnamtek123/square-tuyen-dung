import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('JobPostAction i18n', () => {
  it('does not hard-code the missing location copy', () => {
    expect(source).not.toContain('Chưa cập nhật');
    expect(source).toContain('common:labels.notUpdated');
  });

  it('formats salary with the active language instead of fixed Vietnamese units', () => {
    expect(source).not.toContain('salaryString(');
    expect(source).toContain('formatLocalizedSalaryRange');
    expect(source).toContain('i18n.language');
  });

  it('has Vietnamese and English locale entries for the shared missing data copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(readKey(vi, 'labels.notUpdated')).toEqual(expect.any(String));
    expect(readKey(en, 'labels.notUpdated')).toEqual(expect.any(String));
  });
});
