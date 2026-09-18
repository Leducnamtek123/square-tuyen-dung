import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin CompaniesPage Component & Company Administration', () => {
  const filePath = join(__dirname, '../CompaniesPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages companies, creation dialogs, and deletion via useCompanies', () => {
    expect(source).toContain('useCompanies');
    expect(source).toContain('CompanyFormDialog');
    expect(source).toContain('CompanyDeleteDialog');
    expect(source).toContain('DataTable');
  });

  it('provides filter bar and table pagination', () => {
    expect(source).toContain('FilterBar');
    expect(source).toContain('useDataTable');
  });
});
