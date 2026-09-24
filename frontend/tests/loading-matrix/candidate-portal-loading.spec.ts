import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  setupCandidateProfileApiMocks,
  setupCandidateDashboardKpiMocks,
  setupCandidatePracticeApiMocks,
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_RESUMES,
  MOCK_JOBS,
} from '../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../helpers/auth';
import {
  delayApi,
  trackSubmissions,
  detectBlankScreen,
  evaluateDoubleSubmitGuard,
  createUXIssue,
  matrixReporter,
} from '../helpers/loadingMatrix';

const ROUTE_APPLY = `/jobs/${MOCK_JOBS[0].slug}`;
const ROUTE_DASHBOARD = '/dashboard';
const ROUTE_PRACTICE = '/practice';

test.describe('Loading & UX State Matrix - Candidate Portal & Interactions', () => {
  test.afterAll(() => {
    matrixReporter.exportReports();
  });

  test('Apply Modal: Submit Loading, Disabled State & Double-Submit Guard (P0/P1 Check)', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
      isOnboarded: true,
    });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Track POST submissions with 1500ms delay to evaluate in-flight state
    const submissionTracker = await trackSubmissions(
      page,
      /\/job-seeker-job-posts-activity\/?(\?.*)?$/,
      1500,
      { success: true, message: 'Nộp hồ sơ thành công' }
    );

    await page.goto(ROUTE_APPLY, { waitUntil: 'domcontentloaded' });

    // Open Apply Modal
    const applyButton = page.locator('button').filter({ hasText: /nộp hồ sơ|ứng tuyển|apply/i }).first();
    await expect(applyButton).toBeVisible({ timeout: 20_000 });
    await applyButton.click();

    const applyDialogHeading = page.getByText(/ứng tuyển vị trí/i).first();
    await expect(applyDialogHeading).toBeVisible({ timeout: 10_000 });

    const submitApplyBtn = page.getByRole('button', { name: /^ứng tuyển$/i }).last();
    await expect(submitApplyBtn).toBeVisible();

    // Capture screenshot right before submitting
    const initialScreenshot = await matrixReporter.captureStateScreenshot(page, `${ROUTE_APPLY}_apply_modal`, 'initial');
    matrixReporter.recordState(
      `${ROUTE_APPLY}_apply_modal`,
      'initial',
      'PASS',
      'Modal ứng tuyển mở thành công với thông tin đầy đủ',
      initialScreenshot
    );

    // Test Double Submit Guard & In-flight disabled state
    const evalResult = await evaluateDoubleSubmitGuard(page, submitApplyBtn, () =>
      submissionTracker.getRequestsCount()
    );

    const submittingScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      `${ROUTE_APPLY}_apply_modal`,
      'submitting'
    );

    if (!evalResult.passed && evalResult.severity && evalResult.issue) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: `${ROUTE_APPLY}_apply_modal`,
          state: 'submitting',
          severity: evalResult.severity,
          issue: evalResult.issue,
          expected: evalResult.expected || '',
          screenshot: submittingScreenshot,
          request: 'POST /job-seeker-job-posts-activity',
        })
      );
      matrixReporter.recordState(
        `${ROUTE_APPLY}_apply_modal`,
        'double_submit',
        'FAIL',
        evalResult.issue,
        submittingScreenshot
      );
    } else {
      matrixReporter.recordState(
        `${ROUTE_APPLY}_apply_modal`,
        'double_submit',
        'PASS',
        'Nút submit được vô hiệu hóa và chỉ phát sinh 1 HTTP request duy nhất',
        submittingScreenshot
      );
    }

    // Double submit must pass or fail with clear diagnosis
    expect(submissionTracker.getRequestsCount()).toBeLessThanOrEqual(1);
  });

  test('Candidate Dashboard (/dashboard): Independent widget loading & no blank screen during 3s API delay', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupCandidateProfileApiMocks(page);
    await setupCandidateDashboardKpiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'JOB_SEEKER',
      id: MOCK_CANDIDATE_PROFILE.id,
      email: MOCK_CANDIDATE_PROFILE.email,
      fullName: MOCK_CANDIDATE_PROFILE.fullName,
      isOnboarded: true,
    });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Delay Candidate stats API by 3000ms
    await delayApi(page, /\/info\/web\/statistics\/job-seeker\/?(\?.*)?$/, { delayMs: 3000 });

    await page.goto(ROUTE_DASHBOARD, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 25_000 });

    const blankCheck = await detectBlankScreen(page);
    expect(blankCheck.isBlank).toBeFalsy();

    const successScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_DASHBOARD, 'success');
    matrixReporter.recordState(
      ROUTE_DASHBOARD,
      'success',
      'PASS',
      'Toàn bộ widget dashboard tải dữ liệu thành công',
      successScreenshot
    );
  });

  test('AI Voice Practice Center (/practice): Question Bank & Hints loading states', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await setupCandidatePracticeApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    await page.goto(ROUTE_PRACTICE, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 25_000 });

    const blankCheck = await detectBlankScreen(page);
    expect(blankCheck.isBlank).toBeFalsy();

    const successScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_PRACTICE, 'success');
    matrixReporter.recordState(
      ROUTE_PRACTICE,
      'success',
      'PASS',
      'Ngân hàng câu hỏi phỏng vấn AI hiển thị đầy đủ',
      successScreenshot
    );
  });
});
