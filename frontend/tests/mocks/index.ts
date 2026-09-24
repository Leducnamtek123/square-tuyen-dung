import type { Page } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupJobsApiMocks,
  setupCandidateProfileApiMocks,
  setupCvBuilderApiMocks,
  setupEmployerApiMocks,
  setupHrmApiMocks,
  setupOnboardingApiMocks,
  setupAdminApiMocks,
  setupVoiceAiApiMocks,
  setupCandidateCvsApiMocks,
  setupCandidateInterviewsApiMocks,
  setupCandidatePracticeApiMocks,
  setupCandidateSalaryApiMocks,
  setupCandidateDashboardKpiMocks,
  setupCandidateRegisterApiMocks,
  MOCK_CAREERS,
  MOCK_CITIES,
  MOCK_JOBS,
  MOCK_QUESTIONS,
  MOCK_QUESTION_GROUPS,
  MOCK_COMPANY_QUESTION_SETS,
  MOCK_EMPLOYER_STATS,
  MOCK_APPLIED_RESUMES,
  MOCK_HRM_EMPLOYEES,
  MOCK_HRM_DEPARTMENTS,
  MOCK_HRM_DESIGNATIONS,
  MOCK_HRM_LEAVE_TYPES,
  MOCK_HRM_LEAVE_REQUESTS,
  MOCK_HRM_LEAVE_BALANCES,
  MOCK_HRM_WORK_SHIFTS,
  MOCK_HRM_ATTENDANCE_REQUESTS,
  MOCK_HRM_PAYROLL_KPIS,
  MOCK_HRM_PAYROLL_RECORDS,
  MOCK_SYSTEM_CONFIGS,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_RESUMES,
} from '../helpers/mockApi';

export * from './mock-auth';
export * from './mock-jobs';
export * from './mock-employer';
export * from './mock-voice-ai';
export * from './mock-hrm';
export * from './mock-admin';

export {
  MOCK_CAREERS,
  MOCK_CITIES,
  MOCK_JOBS,
  MOCK_QUESTIONS,
  MOCK_QUESTION_GROUPS,
  MOCK_COMPANY_QUESTION_SETS,
  MOCK_EMPLOYER_STATS,
  MOCK_APPLIED_RESUMES,
  MOCK_HRM_EMPLOYEES,
  MOCK_HRM_DEPARTMENTS,
  MOCK_HRM_DESIGNATIONS,
  MOCK_HRM_LEAVE_TYPES,
  MOCK_HRM_LEAVE_REQUESTS,
  MOCK_HRM_LEAVE_BALANCES,
  MOCK_HRM_WORK_SHIFTS,
  MOCK_HRM_ATTENDANCE_REQUESTS,
  MOCK_HRM_PAYROLL_KPIS,
  MOCK_HRM_PAYROLL_RECORDS,
  MOCK_SYSTEM_CONFIGS,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_RESUMES,
};

/**
 * Thiết lập toàn bộ các mock API phổ quát cho một trang web
 */
export async function setupAllApiMocks(page: Page) {
  await setupCommonApiMocks(page);
  await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
  await setupJobsApiMocks(page);
  await setupCandidateProfileApiMocks(page);
  await setupCvBuilderApiMocks(page);
  await setupEmployerApiMocks(page);
  await setupHrmApiMocks(page);
  await setupOnboardingApiMocks(page);
  await setupAdminApiMocks(page);
  await setupVoiceAiApiMocks(page);
  await setupCandidateCvsApiMocks(page);
  await setupCandidateInterviewsApiMocks(page);
  await setupCandidatePracticeApiMocks(page);
  await setupCandidateSalaryApiMocks(page);
  await setupCandidateDashboardKpiMocks(page);
  await setupCandidateRegisterApiMocks(page);
}
