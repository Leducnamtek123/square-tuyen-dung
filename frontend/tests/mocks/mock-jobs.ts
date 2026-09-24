import type { Page } from '@playwright/test';
import {
  setupJobsApiMocks,
  setupCandidateProfileApiMocks,
  setupCvBuilderApiMocks,
  setupCandidateCvsApiMocks,
  setupCandidateSalaryApiMocks,
  MOCK_JOBS,
} from '../helpers/mockApi';

/**
 * Đăng ký các mock endpoints phục vụ luồng Candidate Jobs & Applications
 */
export async function setupDomainJobsMocks(page: Page) {
  await setupJobsApiMocks(page);
  await setupCandidateProfileApiMocks(page);
  await setupCvBuilderApiMocks(page);
  await setupCandidateCvsApiMocks(page);
  await setupCandidateSalaryApiMocks(page);

  // Mock lưu / bỏ lưu tin tuyển dụng
  await page.route(/\/api\/v1\/jobs\/\d+\/save\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ saved: true, message: 'Đã lưu tin tuyển dụng thành công.' }),
    });
  });

  // Mock nộp hồ sơ ứng tuyển
  await page.route(/\/api\/v1\/applications\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999,
          job: MOCK_JOBS[0].id,
          status: 1,
          status_name: 'Chờ xác nhận',
          message: 'Nộp hồ sơ ứng tuyển thành công.',
        }),
      });
      return;
    }
    await route.fallback();
  });
}
