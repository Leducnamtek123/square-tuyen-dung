import fs from 'fs';
import path from 'path';

const componentPath = path.join(__dirname, '..', 'index.tsx');
const advancedFiltersPath = path.join(__dirname, '..', 'JobPostSearchAdvancedFilters.tsx');
const publicVi = require('../../../../../i18n/locales/vi/public.json');
const publicEn = require('../../../../../i18n/locales/en/public.json');

describe('JobPostSearch i18n', () => {
  it('does not hard-code save alert fallback copy in source', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain("'Save search'");
    expect(source).not.toContain("'Saved search'");
    expect(source).not.toContain("'Search alert saved.'");
  });

  it('does not hard-code legacy notification frequency fallbacks', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain('?? 7');
    expect(source).not.toContain('|| 7');
  });

  it('defines save alert copy in public locales', () => {
    expect(publicVi.jobSearch.saveSearch).toBeTruthy();
    expect(publicVi.jobSearch.savedAlert.defaultName).toBeTruthy();
    expect(publicVi.jobSearch.savedAlert.success).toBeTruthy();
    expect(publicEn.jobSearch.saveSearch).toBeTruthy();
    expect(publicEn.jobSearch.savedAlert.defaultName).toBeTruthy();
    expect(publicEn.jobSearch.savedAlert.success).toBeTruthy();
  });

  it('localizes advanced filter icon-only aria labels', () => {
    const source = fs.readFileSync(advancedFiltersPath, 'utf8');

    expect(source).not.toContain('aria-label="reset"');
    expect(source).not.toContain('aria-label="clear"');
    expect(source).toContain("t('jobSearch.resetFiltersAria')");
    expect(source).toContain("t('jobSearch.closeAdvancedFiltersAria')");
    expect(publicVi.jobSearch.resetFiltersAria).toBeTruthy();
    expect(publicVi.jobSearch.closeAdvancedFiltersAria).toBeTruthy();
    expect(publicEn.jobSearch.resetFiltersAria).toBeTruthy();
    expect(publicEn.jobSearch.closeAdvancedFiltersAria).toBeTruthy();
  });
});
