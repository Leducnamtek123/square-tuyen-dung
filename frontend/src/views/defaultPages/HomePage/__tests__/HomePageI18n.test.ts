import { readFileSync } from 'fs';
import { join } from 'path';

const homePageSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const topSlideSource = readFileSync(join(__dirname, '../../../../layouts/components/commons/TopSlide/index.tsx'), 'utf8');

const homeSources = `${homePageSource}\n${topSlideSource}`;

const fixedHomeKeys = [
  'home.heroEyebrow',
  'home.heroTitle',
  'home.heroDescription',
  'home.heroPrimaryCta',
  'home.heroSecondaryCta',
  'home.heroBenefit1',
  'home.heroBenefit2',
  'home.heroBenefit3',
  'home.searchHeading',
  'home.searchDescription',
  'home.topCompaniesSubtitle',
  'home.choosePathTitle',
  'home.choosePathDescription',
  'home.candidateTitle',
  'home.candidateDescription',
  'home.candidateBenefit1',
  'home.candidateBenefit2',
  'home.candidateBenefit3',
  'home.candidateCta',
  'home.employerTitle',
  'home.employerDescription',
  'home.employerBenefit1',
  'home.employerBenefit2',
  'home.employerBenefit3',
  'home.employerCta',
  'home.exploreDescription',
  'home.keyCareersSubtitle',
  'home.userFeedbackSubtitle',
];

describe('Home page i18n', () => {
  it('does not hide missing public home keys with hard-coded fallback copy', () => {
    expect(homeSources).not.toMatch(/t\(\s*['"]home\.[^'"]+['"]\s*,\s*['"]/);
    expect(homeSources).not.toMatch(/t\(\s*['"]home\.[^'"]+['"]\s*,\s*\{[\s\S]*?defaultValue/);

    fixedHomeKeys.forEach((key) => {
      expect(homeSources).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for fixed home copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/public.json'), 'utf8'));

    fixedHomeKeys.forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
