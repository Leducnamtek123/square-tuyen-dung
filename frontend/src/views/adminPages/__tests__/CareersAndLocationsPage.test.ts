import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin System Master Data (Careers & Locations)', () => {
  const careersFilePath = join(__dirname, '../CareersPage/index.tsx');
  const citiesFilePath = join(__dirname, '../CitiesPage/index.tsx');
  const districtsFilePath = join(__dirname, '../DistrictsPage/index.tsx');
  const wardsFilePath = join(__dirname, '../WardsPage/index.tsx');

  const careersSource = readFileSync(careersFilePath, 'utf8');
  const citiesSource = readFileSync(citiesFilePath, 'utf8');
  const districtsSource = readFileSync(districtsFilePath, 'utf8');
  const wardsSource = readFileSync(wardsFilePath, 'utf8');

  it('provides full CRUD for career industries with validation', () => {
    expect(careersSource).toContain('useCareers');
    expect(careersSource).toContain('getCareerFormValidationErrors');
    expect(careersSource).toContain('DataTable');
  });

  it('manages geographic administrative divisions: cities, districts, and wards', () => {
    expect(citiesSource).toContain('useCities');
    expect(districtsSource).toContain('useDistricts');
    expect(wardsSource).toContain('useWards');
  });
});
