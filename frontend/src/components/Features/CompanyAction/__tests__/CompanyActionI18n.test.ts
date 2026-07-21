import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('CompanyAction i18n', () => {
  it('does not hard-code viewed profile copy in Vietnamese', () => {
    expect(source).not.toContain('Đã xem hồ sơ');
    expect(source).not.toContain('Lần xem cuối');
    expect(source).toContain('jobSeeker:myCompany.viewedCard.viewedProfile');
    expect(source).toContain('jobSeeker:myCompany.viewedCard.lastViewed');
  });

  it('has Vietnamese and English locale entries for viewed profile copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/jobSeeker.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/jobSeeker.json'), 'utf8'));

    ['viewedProfile', 'lastViewed'].forEach((key) => {
      expect(readKey(vi, `myCompany.viewedCard.${key}`)).toEqual(expect.any(String));
      expect(readKey(en, `myCompany.viewedCard.${key}`)).toEqual(expect.any(String));
    });
  });
});
