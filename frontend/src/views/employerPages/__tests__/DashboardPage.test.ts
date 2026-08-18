import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer DashboardPage Component & Analytics Layout', () => {
  const filePath = join(__dirname, '../DashboardPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders KPI summary statistics and 5 core employer analytics charts', () => {
    expect(source).toContain('<EmployerQuantityStatistics');
    expect(source).toContain('<RecruitmentChart');
    expect(source).toContain('<InterviewStatsChart');
    expect(source).toContain('<ApplicationChart');
    expect(source).toContain('<CandidateChart');
    expect(source).toContain('<HiringAcademicChart');
  });

  it('sets localized page title using employer i18n namespace', () => {
    expect(source).toContain("useTranslation('employer')");
    expect(source).toContain("TabTitle(t('dashboard.pageTitle'))");
  });
});
