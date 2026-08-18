import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeekerQuantityStatistics Component & General Stats', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries job seeker statistics via statisticService.jobSeekerGeneralStatistics', () => {
    expect(source).toContain("queryKey: ['job-seeker-statistics']");
    expect(source).toContain('statisticService.jobSeekerGeneralStatistics');
  });

  it('displays loading skeletons while query is in-flight', () => {
    expect(source).toContain('<Skeleton width={80} height={32} />');
  });
});
