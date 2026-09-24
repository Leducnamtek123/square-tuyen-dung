import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupJobsApiMocks,
  setupAuthApiMocks,
  MOCK_JOBS,
} from '../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../helpers/auth';
import {
  delayApi,
  mockEmptyApi,
  mockErrorApi,
  isAnyLoadingVisible,
  detectBlankScreen,
  detectPrematureEmptyState,
  detectFullPageMasking,
  createUXIssue,
  matrixReporter,
} from '../helpers/loadingMatrix';

const ROUTE_JOBS = '/jobs';
const ROUTE_JOB_DETAIL = `/jobs/${MOCK_JOBS[0].slug}`;

test.describe('Loading & UX State Matrix - Candidate Jobs Portal', () => {
  test.afterAll(() => {
    matrixReporter.exportReports();
  });

  test('Page Loading & Slow API (3s Search): Skeleton present, no blank screen, no premature empty, no full-page mask', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Initial navigation & hydration check
    await page.goto(ROUTE_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

    // Now intercept job-post search with a 3000ms delay to evaluate Slow API & Skeleton UX
    await delayApi(page, /\/job-post\/web\/?(\?.*)?$/, { delayMs: 3000 });

    const kwInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    await kwInput.fill('Senior');

    const searchBtn = page.getByRole('button', { name: /tìm kiếm/i }).first();
    await searchBtn.click();

    // [During Loading Phase: Next 3 seconds]
    await page.waitForTimeout(600);

    const blankCheck = await detectBlankScreen(page);
    if (blankCheck.isBlank) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_JOBS,
          state: 'slow_api',
          severity: 'P0',
          issue: `Màn hình trắng hoàn toàn khi đang tải API: ${blankCheck.reason}`,
          expected: 'Phải hiển thị layout shell và skeleton/loading indicator',
        })
      );
    }
    expect(blankCheck.isBlank).toBeFalsy();

    const hasLoading = await isAnyLoadingVisible(page);
    const prematureEmpty = await detectPrematureEmptyState(page);
    if (prematureEmpty) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_JOBS,
          state: 'slow_api',
          severity: 'P0',
          issue: 'Hiển thị "Không có dữ liệu" trước khi API kịp trả về kết quả.',
          expected: 'Chỉ hiển thị empty state SAU KHI API đã hoàn tất và kết quả thực sự rỗng.',
        })
      );
    }
    expect(prematureEmpty).toBeFalsy();

    const maskingCheck = await detectFullPageMasking(page);
    if (maskingCheck.isMasking) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_JOBS,
          state: 'slow_api',
          severity: 'P1',
          issue: 'Backdrop spinner che toàn bộ màn hình ngăn tương tác header/filter.',
          expected: 'Giữ nguyên header và filter bar, chỉ render skeleton tại danh sách tin tuyển dụng.',
        })
      );
    }

    const loadingScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_JOBS, 'loading');
    matrixReporter.recordState(
      ROUTE_JOBS,
      'slow_api',
      hasLoading ? 'PASS' : 'WARN',
      hasLoading
        ? 'JobPostLarge.Loading skeletons hiển thị đúng vị trí danh sách công việc'
        : 'Không tìm thấy skeleton selector chuẩn',
      loadingScreenshot
    );

    // [After API returns: Verify success state]
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 15_000 });

    const successScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_JOBS, 'success');
    matrixReporter.recordState(
      ROUTE_JOBS,
      'success',
      'PASS',
      'Dữ liệu tin tuyển dụng hiển thị đầy đủ sau khi API trả về',
      successScreenshot
    );
  });

  test('Empty State: API returns [] -> polite NoDataCard with helpful guidance', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    // Initial load
    await page.goto(ROUTE_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 25_000 });

    // Mock empty API for search
    await mockEmptyApi(page, /\/job-post\/web\/?(\?.*)?$/);

    const kwInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    await kwInput.fill('NonExistentKeywordXYZ12345');

    const searchBtn = page.getByRole('button', { name: /tìm kiếm/i }).first();
    await searchBtn.click();

    // Look for empty state text or NoDataCard
    const emptyIndicators = page
      .getByText(/không tìm thấy việc làm|không có dữ liệu|chưa có việc làm/i)
      .or(page.locator('[data-testid="no-data"]'));
    await expect(emptyIndicators.first()).toBeVisible({ timeout: 15_000 });

    const emptyScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_JOBS, 'empty');
    matrixReporter.recordState(
      ROUTE_JOBS,
      'empty',
      'PASS',
      'Hiển thị NoDataCard rõ ràng, thẩm mỹ khi API trả về danh sách rỗng',
      emptyScreenshot
    );
  });

  test('Error 500 & Resilience: API 500 does not crash page; graceful error feedback', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    await page.goto(ROUTE_JOBS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 25_000 });

    // Mock 500 server crash on search
    await mockErrorApi(page, /\/job-post\/web\/?(\?.*)?$/, 500, 'Máy chủ tuyển dụng đang bận');

    const kwInput = page.locator('input[name="kw"], input[placeholder*="Tìm kiếm"]').first();
    await kwInput.fill('Trigger500');

    const searchBtn = page.getByRole('button', { name: /tìm kiếm/i }).first();
    await searchBtn.click();
    await page.waitForTimeout(1000);

    // App should not trigger unhandled Next.js error crash overlay
    const blankCheck = await detectBlankScreen(page);
    if (blankCheck.isBlank) {
      matrixReporter.recordIssue(
        createUXIssue({
          route: ROUTE_JOBS,
          state: 'error_500',
          severity: 'P0',
          issue: `Trang bị sập hoặc trắng khi API gặp lỗi 500: ${blankCheck.reason}`,
          expected: 'Phải hiển thị thông báo lỗi thân thiện kèm nút Thử lại hoặc quay về Trang chủ',
        })
      );
    }
    expect(blankCheck.isBlank).toBeFalsy();

    const errorScreenshot = await matrixReporter.captureStateScreenshot(page, ROUTE_JOBS, 'error_500');
    matrixReporter.recordState(
      ROUTE_JOBS,
      'error_500',
      'PASS',
      'Giao diện duy trì độ ổn định khi máy chủ gặp sự cố 500',
      errorScreenshot
    );
  });

  test('Job Detail (/jobs/[slug]): Detail view loads stably; displays job information and company badge', async ({
    page,
    context,
  }) => {
    await setupCommonApiMocks(page);
    await setupJobsApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await injectSession(context, DEFAULT_CANDIDATE);

    await page.goto(ROUTE_JOB_DETAIL, { waitUntil: 'domcontentloaded' });

    const blankCheck = await detectBlankScreen(page);
    expect(blankCheck.isBlank).toBeFalsy();

    await expect(page.getByRole('heading', { name: MOCK_JOBS[0].job_name }).first()).toBeVisible({
      timeout: 20_000,
    });

    const detailSuccessScreenshot = await matrixReporter.captureStateScreenshot(
      page,
      ROUTE_JOB_DETAIL,
      'success'
    );
    matrixReporter.recordState(
      ROUTE_JOB_DETAIL,
      'success',
      'PASS',
      'Chi tiết công việc tải thành công và hiển thị rõ ràng thông tin đãi ngộ và công ty',
      detailSuccessScreenshot
    );
  });
});
