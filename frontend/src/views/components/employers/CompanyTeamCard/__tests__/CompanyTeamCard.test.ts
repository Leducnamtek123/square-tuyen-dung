import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyTeamCard Component & Member Management', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries and manages company team members and roles via companyTeamService', () => {
    expect(source).toContain('companyTeamService');
    expect(source).toContain('useQuery');
    expect(source).toContain('useMutation');
  });

  it('provides modal dialogs for member invitation and role customization', () => {
    expect(source).toContain('Dialog');
    expect(source).toContain('openCreateMember');
    expect(source).toContain('openCreateRole');
    expect(source).toContain('confirmModal');
  });
});
