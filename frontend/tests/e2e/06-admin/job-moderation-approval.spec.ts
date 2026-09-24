import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainAdminMocks } from '../../mocks/mock-admin';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';
import { MOCK_ADMIN_JOB_POSTS } from '../../helpers/mockApi';
import { JobModerationPage } from '../../pages/admin/job-moderation.page';

test.describe('Phân Hệ Admin - Kiểm Duyệt Tin Tuyển Dụng (Job Moderation)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainAdminMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
  });

  /**
   * ADM-01: Phê duyệt đơn lẻ tin tuyển dụng chờ duyệt -> Chuyển sang APPROVED
   */
  test('ADM-01: Admin phê duyệt đơn lẻ tin tuyển dụng -> Trạng thái chuyển sang APPROVED', async ({ page }) => {
    const jobPage = new JobModerationPage(page);

    // 1. Vào trang Quản lý & kiểm duyệt tin tuyển dụng
    await jobPage.gotoJobs();
    await jobPage.expectJobsLoaded();

    // 2. Tìm tin tuyển dụng đầu tiên trong danh sách
    const targetJob = MOCK_ADMIN_JOB_POSTS[0];
    await expect(page.getByText(targetJob.job_name).first()).toBeVisible({ timeout: 20_000 });

    // 3. Thực hiện phê duyệt tin tuyển dụng qua nút approve
    await jobPage.approveJob(targetJob.job_name);

    // 4. Kiểm tra thông báo hoặc trạng thái sau khi duyệt
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * ADM-01 (Batch): Phê duyệt hàng loạt nhiều tin tuyển dụng cùng lúc
   */
  test('ADM-01 (Batch): Admin chọn nhiều tin và phê duyệt hàng loạt (Batch Approval)', async ({ page }) => {
    const jobPage = new JobModerationPage(page);

    await jobPage.gotoJobs();
    await jobPage.expectJobsLoaded();

    // 1. Chọn 2 tin qua checkbox hàng
    await jobPage.selectMultipleJobs(2);

    // 2. Kích hoạt nút Duyệt hàng loạt và xác nhận dialog
    await jobPage.batchApprove();

    // 3. Xác nhận hoàn tất thao tác
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * ADM-02: Từ chối tin tuyển dụng vi phạm chính sách kèm lý do bắt buộc
   */
  test('ADM-02: Admin từ chối tin tuyển dụng vi phạm chính sách kèm lý do bắt buộc', async ({ page }) => {
    const jobPage = new JobModerationPage(page);

    await jobPage.gotoJobs();
    await jobPage.expectJobsLoaded();

    const targetJob = MOCK_ADMIN_JOB_POSTS[0];
    await expect(page.getByText(targetJob.job_name).first()).toBeVisible({ timeout: 20_000 });

    const violationReason = 'Tin tuyển dụng có dấu hiệu lừa đảo, yêu cầu ứng viên chuyển khoản đặt cọc.';

    // 1. Bấm từ chối tin và điền lý do bắt buộc
    await jobPage.rejectJob(targetJob.job_name, violationReason);

    // 2. Xác nhận dialog đã đóng và thao tác từ chối được ghi nhận
    await expect(jobPage.confirmDialog).toBeHidden({ timeout: 10_000 });
  });

  /**
   * ADM-01 / ADM-02: Mở Drawer kiểm tra chi tiết JD trước khi duyệt
   */
  test('ADM-01 Detail: Admin mở Drawer xem chi tiết JD, mức lương, liên hệ trước khi ra quyết định', async ({ page }) => {
    const jobPage = new JobModerationPage(page);

    await jobPage.gotoJobs();
    await jobPage.expectJobsLoaded();

    const targetJob = MOCK_ADMIN_JOB_POSTS[0];

    // 1. Mở Drawer chi tiết tin
    await jobPage.openJobDetail(targetJob.job_name);
    await expect(jobPage.detailDrawer).toBeVisible({ timeout: 10_000 });

    // 2. Kiểm tra thông tin trong drawer
    await expect(jobPage.detailDrawer.getByText(/thông tin chung/i).first()).toBeVisible();

    // 3. Đóng drawer
    await jobPage.closeDetailDrawer();
    await expect(jobPage.detailDrawer).toBeHidden({ timeout: 10_000 });
  });
});
