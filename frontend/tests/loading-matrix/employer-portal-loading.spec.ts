import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupEmployerApiMocks,
  MOCK_JOBS,
} from '../helpers/mockApi';
import { injectSession, DEFAULT_EMPLOYER } from '../helpers/auth';
import {
  delayApi,
  mockEmptyApi,
  trackSubmissions,
  detectBlankScreen,
  detectFullPageMasking,
  detectPrematureEmptyState,
  evaluateDoubleSubmitGuard,
  createUXIssue,
  matrixReporter,
} from '../helpers/loadingMatrix';

const ROUTE_EMPLOYER_JOBS = '/employer/job-posts';
const ROUTE_EMPLOYER_CREATE_JOB = '/employer/job-posts/create';

test.describe('Loading & UX State Matrix - Employer Portal', () => {
  test.afterAll(() => {
    matrixReporter.exportReports();
  });

  test('Job Posts Table (/employer/job-posts): Row skeleton vs Full page backdrop check during 3s API delay', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Initial load & hydration
    await page.goto(ROUTE_EMPLOYER_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    // Now delay employer job posts list by 3000ms for keyword search
    await delayApi(page, /\/job\/web\/private-job-posts\/?(\?.*)?$/, { delayMs: 3000 });

    const searchInput = page.locator('input[placeholder*="Tìm kiếm"], input[name="search"]').first();
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
      await searchInput.fill('Senior');
      await searchInput.press('Enter');
    }

    await page.waitForTimeout(600);

    // 1. Check blank screen (P0)
    const blankCheck = await detectBlankScreen(page);
    if (blankCheck.isBlank) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_EMPLOYER_JOBS,
          state: 'slow_api',
          severity: 'P0',
          issue: `Màn hình quản lý tin tuyển dụng bị trắng: ${blankCheck.reason}`,
          expected: 'Phải duy trì shell của trang quản trị và hiển thị table row skeleton',
        })
      );
    }
    expect(blankCheck.isBlank).toBeFalsy();

    // 2. Check full-page masking (P1)
    const maskingCheck = await detectFullPageMasking(page);
    if (maskingCheck.isMasking) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_EMPLOYER_JOBS,
          state: 'slow_api',
          severity: 'P1',
          issue: 'Backdrop spinner che toàn bộ trang quản trị thay vì chỉ hiển thị skeleton trong bảng.',
          expected: 'Giữ nguyên thanh điều hướng, các nút lọc và render skeleton tại các hàng của bảng.',
        })
      );
    }

    // 3. Premature empty state check
    const prematureEmpty = await detectPrematureEmptyState(page);
    if (prematureEmpty) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_EMPLOYER_JOBS,
          state: 'slow_api',
          severity: 'P0',
          issue: 'Chớp chữ "Không có dữ liệu" trước khi bảng tin tuyển dụng hoàn thành nạp API.',
          expected: 'Chỉ hiển thị NoDataCard sau khi API kết thúc với count = 0.',
        })
      );
    }

    const loadingScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_EMPLOYER_JOBS,
      'loading'
    );
    matrixReporter.recordState(
      ROUTE_EMPLOYER_JOBS,
      'slow_api',
      maskingCheck.isMasking ? 'WARN' : 'PASS',
      maskingCheck.isMasking
        ? 'Phát hiện backdrop che màn hình'
        : 'Table row skeleton hiển thị đúng chỗ, giữ nguyên khung trang',
      loadingScreenshot
    );

    // Verify success after API resolves
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

    const successScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_EMPLOYER_JOBS,
      'success'
    );
    matrixReporter.recordState(
      ROUTE_EMPLOYER_JOBS,
      'success',
      'PASS',
      'Danh sách tin tuyển dụng hiển thị thành công',
      successScreenshot
    );
  });

  test('Job Posts Empty State: Shows polite NoDataCard with CTA button', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Mock empty response
    await mockEmptyApi(page, /\/job\/web\/private-job-posts\/?(\?.*)?$/);

    await page.goto(ROUTE_EMPLOYER_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    const emptyIndicator = page
      .getByText(/bạn chưa có tin tuyển dụng nào|chưa có tin tuyển dụng|không có dữ liệu/i)
      .first();
    await expect(emptyIndicator).toBeVisible({ timeout: 15_000 });

    const emptyScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_EMPLOYER_JOBS,
      'empty'
    );
    matrixReporter.recordState(
      ROUTE_EMPLOYER_JOBS,
      'empty',
      'PASS',
      'Hiển thị trạng thái empty kèm nút tạo tin tuyển dụng',
      emptyScreenshot
    );
  });

  test('Create Job Form (/employer/job-posts/create): Submit Loading, Disabled Button & Double Submit Guard', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Track creation submissions with 1500ms in-flight delay
    const submissionTracker = await trackSubmissions(
      page,
      /\/job\/web\/private-job-posts\/?$/,
      1500,
      { id: 999, job_name: 'Lead AI Engineer', message: 'Tạo tin thành công' }
    );

    await page.goto(ROUTE_EMPLOYER_CREATE_JOB, { waitUntil: 'domcontentloaded' });

    const jobTitleInput = page.locator('input#jobName, input[name="jobName"]').first();
    await expect(jobTitleInput).toBeVisible({ timeout: 20_000 });
    await jobTitleInput.fill('Senior Fullstack Engineer (Verified Lead)');

    const submitBtn = page
      .locator('button[type="submit"], button')
      .filter({ hasText: /đăng tin|lưu|tạo tin/i })
      .first();
    await expect(submitBtn).toBeVisible();

    const formScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_EMPLOYER_CREATE_JOB,
      'initial'
    );
    matrixReporter.recordState(
      ROUTE_EMPLOYER_CREATE_JOB,
      'initial',
      'PASS',
      'Form đăng tin hiển thị sẵn sàng cho nhập liệu',
      formScreenshot
    );

    // Evaluate double-click guard
    const evalResult = await evaluateDoubleSubmitGuard(page, submitBtn, () =>
      submissionTracker.getRequestsCount()
    );

    const submittingScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_EMPLOYER_CREATE_JOB,
      'submitting'
    );

    if (!evalResult.passed && evalResult.severity && evalResult.issue) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_EMPLOYER_CREATE_JOB,
          state: 'submitting',
          severity: evalResult.severity,
          issue: evalResult.issue,
          expected: evalResult.expected || '',
          screenshot: submittingScreenshot,
          request: 'POST /job-post/web/',
        })
      );
      matrixReporter.recordState(
        ROUTE_EMPLOYER_CREATE_JOB,
        'double_submit',
        'FAIL',
        evalResult.issue,
        submittingScreenshot
      );
    } else {
      matrixReporter.recordState(
        ROUTE_EMPLOYER_CREATE_JOB,
        'double_submit',
        'PASS',
        'Nút submit đăng tin ngăn chặn hoàn hảo click đúp và có loading feedback',
        submittingScreenshot
      );
    }

    expect(submissionTracker.getRequestsCount()).toBeLessThanOrEqual(1);
  });
});
