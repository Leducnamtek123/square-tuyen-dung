import { readFileSync } from 'fs';
import { join } from 'path';

const jobSeekerTabBar = readFileSync(join(__dirname, '../jobSeekers/TabBar/index.tsx'), 'utf8');
const employerCompanyPage = readFileSync(join(__dirname, '../../../views/employerPages/CompanyPage/index.tsx'), 'utf8');

const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
  (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
  locale
);

describe('portal tab aria i18n', () => {
  it('does not hard-code tab navigation aria labels', () => {
    expect(jobSeekerTabBar).not.toContain('aria-label="nav tabs job seeker"');
    expect(jobSeekerTabBar).toContain("t('jobSeeker:nav.tabsAria')");

    expect(employerCompanyPage).not.toContain('aria-label="company tabs"');
    expect(employerCompanyPage).toContain('company.tabs.ariaLabel');
  });

  it('has Vietnamese and English locale entries for tab aria labels', () => {
    const viJobSeeker = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/jobSeeker.json'), 'utf8'));
    const enJobSeeker = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/jobSeeker.json'), 'utf8'));
    const viEmployer = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/employer.json'), 'utf8'));
    const enEmployer = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/employer.json'), 'utf8'));

    expect(readKey(viJobSeeker, 'nav.tabsAria')).toEqual(expect.any(String));
    expect(readKey(enJobSeeker, 'nav.tabsAria')).toEqual(expect.any(String));
    expect(readKey(viEmployer, 'company.tabs.ariaLabel')).toEqual(expect.any(String));
    expect(readKey(enEmployer, 'company.tabs.ariaLabel')).toEqual(expect.any(String));
  });
});
