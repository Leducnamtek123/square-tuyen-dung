import { readFileSync } from 'fs';
import { join } from 'path';

const expectNoFallback = (source: string, key: string) => {
  expect(source).toContain(key);
  expect(source).not.toMatch(new RegExp(`t\\(["']${key.replaceAll('.', '\\.')}["']\\s*,\\s*["']`));
};

describe('CompanyPage i18n', () => {
  it('does not hard-code fallback copy for company page tabs', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expectNoFallback(source, 'company.tabs.team');
  });

  it('does not hard-code fallback copy for company profile title', () => {
    const source = readFileSync(
      join(__dirname, '../../../components/employers/CompanyCard/index.tsx'),
      'utf8',
    );

    expectNoFallback(source, 'companyProfile.title');
  });
});
