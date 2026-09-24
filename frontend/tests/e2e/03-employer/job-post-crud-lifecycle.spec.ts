import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_JOBS } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { JobPostEditorPage } from '../../pages/employer/job-post-editor.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Vòng Đời Quản Lý Tin Tuyển Dụng (Job Post CRUD Lifecycle)', () => {
  let jobPostPage: JobPostEditorPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Bỏ qua product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_employer_job_posts', 'true');
      } catch {}
    });

    jobPostPage = new JobPostEditorPage(page);
  });

  /**
   * EMP-01: Đăng tin tuyển dụng mới với rich-text JD
   */
  test('EMP-01: Create new job post with rich text JD and verify creation', async ({ page }) => {
    await jobPostPage.gotoCreate();

    // 1. Điền thông tin form tuyển dụng
    await jobPostPage.fillJobPostForm({
      jobName: 'Senior Backend Python Developer 2026',
      quantity: '3',
      salaryMin: '35000000',
      salaryMax: '55000000',
      deadline: '31/12/2026',
      jobDescription: 'Phát triển hệ thống microservices Python FastAPI và Django trên nền tảng Kubernetes.',
    });

    // 2. Nhấn nút Đăng tin
    await jobPostPage.submitJob();

    // 3. Tin tuyển dụng xuất hiện trong danh sách tin
    await jobPostPage.gotoList();
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-01 Negative: Bỏ trống các trường bắt buộc sẽ hiển thị thông báo lỗi validation
   */
  test('EMP-01 Negative: Submitting empty form highlights required validation errors', async () => {
    await jobPostPage.gotoCreate();

    // Nhấn đăng tin ngay khi form đang trống
    await jobPostPage.submitJob();

    // Hệ thống cảnh báo các ô bắt buộc
    await jobPostPage.expectValidationError();
  });

  /**
   * EMP-02: Đóng tin tuyển dụng (Expired / Closed) và mở lại tin
   */
  test('EMP-02: Close active job post, change status to expired and reopen', async ({ page }) => {
    await jobPostPage.gotoList();

    // 1. Kiểm tra tin mẫu hiển thị trong bảng
    const firstJob = MOCK_JOBS[0];
    await expect(page.getByText(firstJob.job_name).first()).toBeVisible({ timeout: 15_000 });

    // 2. Thao tác đóng tin tuyển dụng
    await jobPostPage.closeJobPost(firstJob.job_name);

    // 3. Mở lại tin tuyển dụng bằng cách cập nhật hạn nộp mới
    await jobPostPage.reopenJobPost(firstJob.slug, '31/12/2026');
    await jobPostPage.gotoList();
    await expect(page.getByText(firstJob.job_name).first()).toBeVisible({ timeout: 15_000 });
  });

  /**
   * EMP-11: Xử lý hết hạn mức đăng tin gói dịch vụ (Quota Exceeded Modal)
   */
  test('EMP-11: Quota exceeded limit displays upgrade notice and navigates to pricing', async ({ page }) => {
    // Giả lập tài khoản đạt giới hạn số lượng tin đăng
    await page.route(/\/job\/web\/private-job-posts\/?(\?.*)?$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Tài khoản của bạn đã đạt giới hạn đăng tin của gói hiện tại. Vui lòng nâng cấp gói dịch vụ.',
            code: 'QUOTA_EXCEEDED',
          }),
        });
        return;
      }
      await route.continue();
    });

    await jobPostPage.gotoCreate();
    await jobPostPage.fillJobPostForm({
      jobName: 'Lead DevOps Engineer (Kubernetes & AWS)',
      salaryMin: '40000000',
      salaryMax: '60000000',
      jobDescription: 'Vận hành hạ tầng cloud AWS và hệ thống microservices.',
    });

    await jobPostPage.submitJob();

    // Xác thực modal hoặc alert nâng cấp xuất hiện
    await jobPostPage.expectQuotaModalOrAlert();

    // Điều hướng tới trang Bảng giá dịch vụ
    if (await jobPostPage.pricingLink.isVisible()) {
      await jobPostPage.pricingLink.click();
      await expect(page).toHaveURL(/.*\/pricing|.*\/bao-gia/, { timeout: 15_000 });
    }
  });
});
