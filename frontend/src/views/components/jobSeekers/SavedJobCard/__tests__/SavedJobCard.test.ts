import { readFileSync } from 'fs';
import { join } from 'path';

describe('SavedJobCard Component & Mutation Management', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries saved jobs via useSavedJobs hook and paginates data', () => {
    expect(source).toContain('useSavedJobs');
    expect(source).toContain('queryParams');
    expect(source).toContain('handleChangePage');
  });

  it('handles toggle bookmarking with useToggleSaveJob and toast message feedback', () => {
    expect(source).toContain('useToggleSaveJob');
    expect(source).toContain('toggleSave.mutate');
    expect(source).toContain('jobSeeker:jobManagement.messages.saved');
    expect(source).toContain('jobSeeker:jobManagement.messages.unsaved');
  });

  it('renders NoDataCard when no saved jobs exist', () => {
    expect(source).toContain('<NoDataCard');
    expect(source).toContain('jobSeeker:jobManagement.empty.saved');
    expect(source).toContain('jobSeeker:jobManagement.actions.searchJobs');
  });
});
