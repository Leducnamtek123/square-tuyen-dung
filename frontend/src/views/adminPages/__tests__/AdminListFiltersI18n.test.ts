import { readFileSync } from 'fs';
import { join } from 'path';

const cases = [
  {
    file: '../BannerTypesPage/index.tsx',
    keys: ['common.clearFilters', 'pages.bannerTypes.filter.title'],
  },
  {
    file: '../CareersPage/index.tsx',
    keys: ['common.clearFilters', 'pages.careers.filter.title'],
  },
  {
    file: '../CitiesPage/index.tsx',
    keys: ['common.clearFilters', 'pages.cities.filter.title'],
  },
  {
    file: '../CompaniesPage/index.tsx',
    keys: ['common.clearFilters', 'pages.companies.filter.title'],
  },
  {
    file: '../DistrictsPage/index.tsx',
    keys: ['common.advancedFilters', 'common.clearFilters', 'pages.districts.filter.title'],
  },
  {
    file: '../JobActivityPage/index.tsx',
    keys: ['common.clearFilters', 'pages.jobActivity.filter.title'],
  },
  {
    file: '../JobNotificationsPage/index.tsx',
    keys: ['common.clearFilters', 'pages.jobNotifications.filter.title'],
  },
  {
    file: '../ProfilesPage/index.tsx',
    keys: ['common.clearFilters', 'pages.profiles.filter.title'],
  },
  {
    file: '../ResumesPage/index.tsx',
    keys: ['common.clearFilters', 'pages.resumes.filter.title'],
  },
  {
    file: '../UsersPage/components/UserFilters.tsx',
    keys: ['common.clearFilters', 'pages.users.filters.title'],
  },
  {
    file: '../WardsPage/index.tsx',
    keys: ['common.advancedFilters', 'common.clearFilters', 'pages.wards.filter.title'],
  },
];

describe('admin list filters i18n', () => {
  it.each(cases)('$file does not hard-code fallback text for fixed filter copy', ({ file, keys }) => {
    const source = readFileSync(join(__dirname, file), 'utf8');
    const lines = source.split(/\r?\n/);

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }
  });
});
