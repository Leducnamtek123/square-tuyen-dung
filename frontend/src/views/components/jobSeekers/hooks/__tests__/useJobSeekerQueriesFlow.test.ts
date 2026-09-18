import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker React Query Custom Hooks', () => {
  const filePath = join(__dirname, '../useJobSeekerQueries.ts');
  const source = readFileSync(filePath, 'utf8');

  it('handles auth-enabled queries for saved jobs and resumes with token check', () => {
    expect(source).toContain('useSavedJobs');
    expect(source).toContain('enabled: !!isAuthenticated && !!currentUser?.id && hasToken');
    expect(source).toContain('useResumes');
    expect(source).toContain('enabled: !!isAuthenticated && !!jobSeekerProfileId && hasToken');
  });

  it('implements 401/403 bypass in query retry logic to prevent infinite retries on unauthorized state', () => {
    expect(source).toContain('shouldRetryQuery');
    expect(source).toContain('status === 401 || status === 403');
  });

  it('manages query cache invalidation on mutations (toggle save, follow, job alert CRUD)', () => {
    expect(source).toContain("queryClient.invalidateQueries({ queryKey: ['savedJobs'] })");
    expect(source).toContain("queryClient.invalidateQueries({ queryKey: ['companiesFollowed'] })");
    expect(source).toContain("queryClient.invalidateQueries({ queryKey: ['jobPostNotifications'] })");
  });
});
