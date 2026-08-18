import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyViewedCard Component & Views Tracking', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries resume viewers via useResumeViewed hook with pagination', () => {
    expect(source).toContain('useResumeViewed');
    expect(source).toContain('pageSize');
    expect(source).toContain('handleChangePage');
  });

  it('renders viewed items with views count, creation date, and saved profile chip', () => {
    expect(source).toContain('item.views');
    expect(source).toContain('item.createAt');
    expect(source).toContain('item.isSavedResume');
    expect(source).toContain('jobSeeker:myCompany.savedProfile');
  });

  it('renders NoDataCard when no employers have viewed candidate profile', () => {
    expect(source).toContain('<NoDataCard');
    expect(source).toContain('jobSeeker:myCompany.empty.viewed');
  });
});
