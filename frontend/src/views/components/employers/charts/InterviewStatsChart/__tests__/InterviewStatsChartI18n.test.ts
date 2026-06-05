import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewStatsChart i18n', () => {
  const chartSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
  const dashboardSource = readFileSync(
    join(__dirname, '../../../../../employerPages/DashboardPage/index.tsx'),
    'utf8',
  );

  it('does not hard-code fallback copy for interview chart fixed keys', () => {
    expect(chartSource).not.toMatch(/t\('interviewChart\.[^']+'\s*,\s*['"]/);
    expect(chartSource).not.toContain('defaultValue:');
    expect(dashboardSource).not.toMatch(/t\('dashboard\.interviewChart'\s*,\s*['"]/);
  });
});
