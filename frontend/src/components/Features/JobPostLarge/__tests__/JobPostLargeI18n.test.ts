import { readFileSync } from 'fs';
import { join } from 'path';

const indexSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const infoChipsSource = readFileSync(join(__dirname, '../JobPostLargeInfoChips.tsx'), 'utf8');
const statusBadgesSource = readFileSync(join(__dirname, '../JobPostLargeStatusBadges.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('JobPostLarge i18n', () => {
  it('does not hard-code card fallback labels', () => {
    expect(indexSource).not.toContain('Job detail');
    expect(indexSource).not.toContain('Chua cap nhat');
    expect(indexSource).toContain('common:viewDetails');
    expect(indexSource).toContain('common:labels.notUpdated');
  });

  it('does not hard-code hot and urgent badge copy', () => {
    expect(statusBadgesSource).not.toContain('Tuyen gap');
    expect(statusBadgesSource).not.toMatch(/>\s*Hot\s*</);
    expect(statusBadgesSource).toContain('common:jobPost.urgentHiring');
    expect(statusBadgesSource).toContain('common:common.hot');
  });

  it('formats salary with the active language instead of fixed Vietnamese units', () => {
    expect(infoChipsSource).not.toContain('salaryString(');
    expect(infoChipsSource).toContain('formatLocalizedSalaryRange');
    expect(infoChipsSource).toContain('salaryLanguage');
    expect(indexSource).toContain('salaryLanguage={i18n.language}');
  });

  it('has Vietnamese and English locale entries for shared job card copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    ['viewDetails', 'labels.notUpdated', 'jobPost.urgentHiring', 'common.hot'].forEach((key) => {
      expect(readKey(vi, key)).toEqual(expect.any(String));
      expect(readKey(en, key)).toEqual(expect.any(String));
    });
  });
});
