import { readFileSync } from 'fs';
import { join } from 'path';

const careerCarouselSource = readFileSync(join(__dirname, '../CareerCarousel/index.tsx'), 'utf8');
const companiesSource = readFileSync(join(__dirname, '../Companies/index.tsx'), 'utf8');
const feedbackCarouselSource = readFileSync(join(__dirname, '../FeedbackCarousel/index.tsx'), 'utf8');

const sourceByFile = {
  careerCarouselSource,
  companiesSource,
  feedbackCarouselSource,
};

const fixedHomeKeys = [
  'home.jobsCount',
  'home.companiesCount',
  'home.topCompanies',
  'home.noCompaniesFound',
  'home.noFeedbacks',
];

describe('Home feature i18n', () => {
  it('does not hide missing home feature keys with hard-coded fallback copy', () => {
    Object.values(sourceByFile).forEach((source) => {
      expect(source).not.toContain('defaultValue');
      expect(source).not.toMatch(/t\(\s*["']home\.[^"']+["']\s*,\s*["']/);
    });

    expect(careerCarouselSource).toContain('"home.jobsCount"');
    expect(companiesSource).toContain('"home.companiesCount"');
    expect(companiesSource).toContain('"home.topCompanies"');
    expect(companiesSource).toContain('"home.noCompaniesFound"');
    expect(feedbackCarouselSource).toContain('"home.noFeedbacks"');
  });

  it('has Vietnamese and English locale entries for home feature copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/public.json'), 'utf8'));

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
