import { readFileSync } from 'fs';
import { join } from 'path';

const indexSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const drawerSource = readFileSync(join(__dirname, '../CompanySearchAdvancedFilters.tsx'), 'utf8');
const publicVi = require('../../../../../i18n/locales/vi/public.json');
const publicEn = require('../../../../../i18n/locales/en/public.json');

describe('CompanySearch Advanced Filter Drawer & Reset System', () => {
  it('integrates CompanySearchAdvancedFilters drawer component', () => {
    expect(indexSource).toContain('CompanySearchAdvancedFilters');
    expect(indexSource).toContain('showAdvanceFilter');
    expect(indexSource).toContain('setShowAdvanceFilter');
  });

  it('provides a badge indicating active filter count', () => {
    expect(indexSource).toContain('activeAdvancedFilterCount');
    expect(indexSource).toContain('badgeContent={activeAdvancedFilterCount}');
  });

  it('has dedicated reset button with RestartAltRoundedIcon and a11y label', () => {
    expect(indexSource).toContain('RestartAltRoundedIcon');
    expect(indexSource).toContain("t('companySearch.resetFiltersAria')");
    expect(indexSource).toContain('handleReset');
  });

  it('renders filter drawer with city and employee size controls', () => {
    expect(drawerSource).toContain('cityId');
    expect(drawerSource).toContain('employeeSize');
    expect(drawerSource).toContain('Drawer');
    expect(drawerSource).toContain('handleApply');
    expect(drawerSource).toContain('onReset');
  });

  it('provides complete i18n keys for company filters in Vietnamese and English', () => {
    expect(publicVi.companySearch.filterDrawerTitle).toBeTruthy();
    expect(publicEn.companySearch.filterDrawerTitle).toBeTruthy();
    expect(publicVi.companySearch.filterEmployeeSize).toBeTruthy();
    expect(publicEn.companySearch.filterEmployeeSize).toBeTruthy();
    expect(publicVi.companySearch.applyFilters).toBeTruthy();
    expect(publicEn.companySearch.applyFilters).toBeTruthy();
    expect(publicVi.companySearch.resetFilters).toBeTruthy();
    expect(publicEn.companySearch.resetFilters).toBeTruthy();
  });
});
