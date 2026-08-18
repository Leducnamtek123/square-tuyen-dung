import { readFileSync } from 'fs';
import { join } from 'path';

describe('AiRecommendedJobsSection Component & API Contract', () => {
  const filePath = join(__dirname, '../AiRecommendedJobsSection.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('fetches recommended jobs from job/web/job-posts/recommended-jobs/', () => {
    expect(source).toContain('httpRequest');
    expect(source).toContain('job/web/job-posts/recommended-jobs/');
    expect(source).toContain('unwrapDataResponse');
  });

  it('slices the top 4 AI suggested job posts', () => {
    expect(source).toContain('setJobs(list.slice(0, 4))');
  });

  it('uses candidateDashboard.aiRecommended translation keys', () => {
    expect(source).toContain('candidateDashboard.aiRecommended.title');
    expect(source).toContain('candidateDashboard.aiRecommended.subtitle');
    expect(source).toContain('candidateDashboard.aiRecommended.viewAll');
  });
});
