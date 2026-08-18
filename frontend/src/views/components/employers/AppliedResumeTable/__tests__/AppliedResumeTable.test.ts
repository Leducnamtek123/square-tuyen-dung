import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppliedResumeTable Component & TanStack Table Integration', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('integrates DataTable component with pagination and sorting state', () => {
    expect(source).toContain('DataTable');
    expect(source).toContain('onPaginationChange');
    expect(source).toContain('onSortingChange');
  });

  it('renders application status and AI analysis components in columns', () => {
    expect(source).toContain('AppliedStatusComponent');
    expect(source).toContain('AIAnalysisComponent');
    expect(source).toContain('SendEmailComponent');
  });
});
