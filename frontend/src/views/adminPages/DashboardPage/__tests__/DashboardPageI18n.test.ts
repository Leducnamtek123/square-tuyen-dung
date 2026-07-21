import { readFileSync } from 'fs';
import { join } from 'path';

describe('DashboardPage i18n', () => {
  it('does not hard-code fallback text for fixed dashboard copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'dashboard.activeProfileRate',
      'dashboard.activeRate',
      'dashboard.activeResumes',
      'dashboard.applicationPipeline',
      'dashboard.applicationStates.contacted',
      'dashboard.applicationStates.hired',
      'dashboard.applicationStates.interviewed',
      'dashboard.applicationStates.notSelected',
      'dashboard.applicationStates.pending',
      'dashboard.applicationStates.tested',
      'dashboard.avgApplicationsPerJob',
      'dashboard.companies',
      'dashboard.companyFollowers',
      'dashboard.completionRate',
      'dashboard.hiringRate',
      'dashboard.interviewStates.cancelled',
      'dashboard.interviewStates.completed',
      'dashboard.interviewStates.draft',
      'dashboard.interviewStates.inProgress',
      'dashboard.interviewStates.scheduled',
      'dashboard.interviewStatus',
      'dashboard.interviews',
      'dashboard.jobPostStatus',
      'dashboard.jobStates.active',
      'dashboard.jobStates.expired',
      'dashboard.jobStates.pending',
      'dashboard.jobStates.rejected',
      'dashboard.last30Days',
      'dashboard.loadingChart',
      'dashboard.newApplications30d',
      'dashboard.newInterviews30d',
      'dashboard.newJobPosts30d',
      'dashboard.noApplicationData',
      'dashboard.noInterviewData',
      'dashboard.noJobPostData',
      'dashboard.noUserData',
      'dashboard.operatingStats',
      'dashboard.profileCompanyStats',
      'dashboard.questionBank',
      'dashboard.questionGroups',
      'dashboard.resumeViews',
      'dashboard.resumes',
      'dashboard.savedJobs',
      'dashboard.savedResumes',
      'dashboard.verifiedCompanies',
      'dashboard.verifiedRate',
    ];

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toContain('defaultValue');
        expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }
  });
});
