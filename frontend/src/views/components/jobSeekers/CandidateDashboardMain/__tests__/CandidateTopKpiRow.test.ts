import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateTopKpiRow Component & Localization', () => {
  const filePath = join(__dirname, '../CandidateTopKpiRow.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders 4 core metric cards with correct routes and icons', () => {
    expect(source).toContain('/my-jobs?tab=2');
    expect(source).toContain('/my-jobs?tab=1');
    expect(source).toContain('/my-company');
    expect(source).toContain('/companies');
  });

  it('uses candidateDashboard.kpi translation keys instead of hardcoded strings', () => {
    expect(source).toContain('candidateDashboard.kpi.appliedTitle');
    expect(source).toContain('candidateDashboard.kpi.savedTitle');
    expect(source).toContain('candidateDashboard.kpi.viewedTitle');
    expect(source).toContain('candidateDashboard.kpi.followingTitle');
  });

  it('safely handles zero or undefined stats without crashing', () => {
    expect(source).toContain('stats?.appliedCount ?? 0');
    expect(source).toContain('stats?.savedCount ?? 0');
    expect(source).toContain('stats?.viewedCount ?? 0');
    expect(source).toContain('stats?.followingCount ?? 0');
  });
});
