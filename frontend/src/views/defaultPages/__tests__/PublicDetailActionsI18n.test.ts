import { readFileSync } from 'fs';
import { join } from 'path';

const jobDetailActionsSource = readFileSync(join(__dirname, '../JobDetailPage/components/JobDetailActions.tsx'), 'utf8');
const jobDetailHeaderSource = readFileSync(join(__dirname, '../JobDetailPage/components/JobDetailHeaderCard.tsx'), 'utf8');
const companyHeaderSource = readFileSync(join(__dirname, '../CompanyDetailPage/CompanyHeader.tsx'), 'utf8');
const companySidebarSource = readFileSync(join(__dirname, '../CompanyDetailPage/CompanySidebar.tsx'), 'utf8');
const publicDetailSources = [
  jobDetailActionsSource,
  jobDetailHeaderSource,
  companyHeaderSource,
  companySidebarSource,
].join('\n');

const fixedPublicDetailKeys = [
  'jobDetail.actions.report',
  'companyDetail.report',
  'companyDetail.verified',
  'companyDetail.verifiedDescription',
];

describe('Public detail action i18n', () => {
  it('does not hide missing public detail action keys with English fallback copy', () => {
    expect(jobDetailActionsSource).not.toMatch(/t\(\s*["']jobDetail\.actions\.report["']\s*,\s*["']/);
    expect(publicDetailSources).not.toMatch(/t\(\s*["']companyDetail\.(?:report|verified|verifiedDescription)["']\s*,\s*["']/);

    fixedPublicDetailKeys.forEach((key) => {
      expect(publicDetailSources).toContain(`"${key}"`);
    });
  });

  it('formats job detail salary with the active language instead of fixed Vietnamese units', () => {
    expect(jobDetailHeaderSource).not.toContain('salaryString(');
    expect(jobDetailHeaderSource).toContain('formatLocalizedSalaryRange');
    expect(jobDetailHeaderSource).toContain('i18n.language');
  });

  it('has Vietnamese and English locale entries for public detail action copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/public.json'), 'utf8'));

    fixedPublicDetailKeys.forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
