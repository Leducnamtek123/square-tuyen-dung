import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const publicVi = require('../../../../../i18n/locales/vi/public.json');
const publicEn = require('../../../../../i18n/locales/en/public.json');

describe('CompanySearch i18n', () => {
  it('localizes the reset icon aria label', () => {
    expect(source).not.toContain('aria-label="delete"');
    expect(source).toContain("t('companySearch.resetFiltersAria')");
    expect(publicVi.companySearch.resetFiltersAria).toBeTruthy();
    expect(publicEn.companySearch.resetFiltersAria).toBeTruthy();
  });
});
