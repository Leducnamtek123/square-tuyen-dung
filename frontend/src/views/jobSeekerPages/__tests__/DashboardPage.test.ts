import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker DashboardPage Component & Logic', () => {
  const filePath = join(__dirname, '../DashboardPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('uses candidate layout and hooks to query real API counts', () => {
    expect(source).toContain('useAppSelector');
    expect(source).toContain('jobPostActivityService.getJobPostActivity');
    expect(source).toContain('useSavedJobs');
    expect(source).toContain('useCompaniesFollowed');
    expect(source).toContain('useResumeViewed');
  });

  it('aggregates stats with nullish coalescing to prevent UI crashes', () => {
    expect(source).toContain('appliedCount: appliedData ?? 0');
    expect(source).toContain('savedCount: savedData?.count ?? 0');
    expect(source).toContain('viewedCount: viewedData?.count ?? 0');
    expect(source).toContain('followingCount: followedData?.count ?? 0');
  });

  it('renders all 4 dashboard core sections', () => {
    expect(source).toContain('<CandidateTopKpiRow');
    expect(source).toContain('<CandidateCvScoreCard');
    expect(source).toContain('<CandidateActivityChartCard');
    expect(source).toContain('<AiRecommendedJobsSection');
    expect(source).toContain('<CandidateRecommendedJobsCard');
  });

  it('sets dynamic page title with translated string', () => {
    expect(source).toContain("t('dashboard.pageTitle'");
    expect(source).toContain('TabTitle');
  });
});
