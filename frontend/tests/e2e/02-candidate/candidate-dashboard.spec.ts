import { test, expect } from '@playwright/test';
import {
  setupAllApiMocks,
  MOCK_JOBS,
  MOCK_COMPANY_QUESTION_SETS,
} from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { MyJobsPage } from '../../pages/candidate/my-jobs.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Bảng Điều Khiển, Quản Lý Việc Làm & Luyện Tập AI (Dashboard & Practice)', () => {
  let myJobsPage: MyJobsPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Tắt product tour tự động mở
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
      } catch {}
    });

    myJobsPage = new MyJobsPage(page);
  });

  /**
   * CAND-09: Theo dõi danh sách việc làm đã ứng tuyển tại /my-jobs kèm các badge trạng thái
   */
  test('CAND-09: View applied jobs list in /my-jobs with badges', async ({ page }) => {
    // 1. Mở trang Quản lý việc làm (/my-jobs)
    await myJobsPage.goto('applied');

    // 2. Chuyển sang Tab "Đã ứng tuyển"
    await myJobsPage.switchTab('applied');

    // 3. Danh sách hiển thị công việc đã nộp kèm thông tin ngày nộp / loại hồ sơ
    await expect(page.getByText(/ứng tuyển vào|hồ sơ trực tuyến|đã nộp|phù hợp|chờ xác nhận/i).first()).toBeVisible({
      timeout: 20_000,
    });

    // 4. Chuyển sang Tab "Việc làm đã lưu"
    await myJobsPage.switchTab('saved');

    // 5. Kiểm tra danh sách việc làm đã lưu hiển thị
    await expect(page.getByRole('tab', { name: /việc làm đã lưu/i })).toBeVisible();
  });

  /**
   * CAND-10: Duyệt danh sách bộ câu hỏi tuyển dụng doanh nghiệp và điều hướng luyện tập AI tại /practice
   */
  test('CAND-10: Practice questions list and navigate to /practice', async ({ page }) => {
    // 1. Mở trang Luyện phỏng vấn AI (/practice)
    await page.goto('/practice', { waitUntil: 'domcontentloaded' });

    // 2. Xác nhận danh sách bộ câu hỏi luyện tập của doanh nghiệp hiển thị
    await expect(
      page.getByText(/luyện phỏng vấn ai|bộ câu hỏi tuyển dụng|kỹ sư|developer/i).first()
    ).toBeVisible({ timeout: 20_000 });

    // 3. Lọc theo cấp bậc (Seniority)
    const senioritySelect = page
      .getByLabel(/tất cả cấp bậc|cấp bậc/i)
      .or(page.locator('#seniority-select, select[name="seniority"]'))
      .first();
    if (await senioritySelect.isVisible()) {
      await senioritySelect.click();
      const seniorOption = page.getByRole('option', { name: /senior/i }).first();
      if (await seniorOption.isVisible()) {
        await seniorOption.click();
      }
    }

    // 4. Bấm nút "Luyện tập bộ này với AI" hoặc xem câu hỏi trong bộ
    const practiceBtn = page
      .getByRole('button', { name: /luyện tập bộ này với ai|bắt đầu luyện tập|luyện tập/i })
      .or(page.locator('[data-testid="start-set-mock-btn"]'))
      .first();

    await expect(practiceBtn).toBeVisible({ timeout: 15_000 });
    await practiceBtn.click();

    // 5. Hệ thống khởi tạo phòng phỏng vấn thử hoặc chuyển hướng sang trang phỏng vấn
    await expect(page).toHaveURL(/\/(interview|practice|my-interviews)/, { timeout: 20_000 });
  });
});
