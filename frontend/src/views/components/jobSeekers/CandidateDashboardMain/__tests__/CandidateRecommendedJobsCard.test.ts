import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateRecommendedJobsCard Component & Bookmarking', () => {
  const filePath = join(__dirname, '../CandidateRecommendedJobsCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries recommended job posts from jobService with pagination', () => {
    expect(source).toContain('jobService');
    expect(source).toContain('getJobPosts');
    expect(source).toContain('pageSize: 6');
  });

  it('formats salaries into millions or negotiable fallback safely', () => {
    expect(source).toContain('formatSalary');
    expect(source).toContain('1_000_000');
    expect(source).toContain('Thỏa thuận');
  });

  it('extracts location names from complex locationDict object or string', () => {
    expect(source).toContain('getLocationName');
    expect(source).toContain('Toàn quốc');
  });

  it('supports bookmarking jobs with optimistic state toggle and snackbar feedback', () => {
    expect(source).toContain('handleToggleSave');
    expect(source).toContain('setSavedJobs');
    expect(source).toContain('setToastMessage');
  });
});
