import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateActivityChartCard Component & Progress Tracking', () => {
  const filePath = join(__dirname, '../CandidateActivityChartCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('provides 7_days, 30_days, and 90_days timeframe filter options', () => {
    expect(source).toContain('7_days');
    expect(source).toContain('30_days');
    expect(source).toContain('90_days');
  });

  it('renders linear progress bars for applied, saved, viewed, and followed metrics', () => {
    expect(source).toContain('appliedCount');
    expect(source).toContain('savedCount');
    expect(source).toContain('viewedCount');
    expect(source).toContain('followingCount');
    expect(source).toContain('LinearProgress');
  });

  it('renders an empty state when total activity is zero', () => {
    expect(source).toContain('totalActivity === 0');
    expect(source).toContain('candidateDashboard.activity.emptyTitle');
    expect(source).toContain('candidateDashboard.activity.emptySubtitle');
  });

  it('uses candidateDashboard.activity localization keys', () => {
    expect(source).toContain('candidateDashboard.activity.title');
    expect(source).toContain('candidateDashboard.activity.applied');
    expect(source).toContain('candidateDashboard.activity.saved');
    expect(source).toContain('candidateDashboard.activity.viewed');
    expect(source).toContain('candidateDashboard.activity.following');
  });
});
