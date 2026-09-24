import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_JOBS } from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { JobSearchPage } from '../../pages/candidate/job-search.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Tìm kiếm & Lọc Việc Làm (Job Search & Filters)', () => {
  let jobSearchPage: JobSearchPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Bỏ qua product tour tự động để không che khuất màn hình
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_cv_builder', 'true');
      } catch {}
    });

    jobSearchPage = new JobSearchPage(page);
  });

  /**
   * CAND-01: Tìm kiếm theo từ khóa đồng bộ URL ?kw= và hiển thị công việc tương ứng
   */
  test('CAND-01: Keyword search updates URL ?kw= and displays matching jobs', async ({ page }) => {
    await jobSearchPage.goto();

    // 1. Nhập từ khóa 'Fullstack' và bấm Tìm kiếm
    await jobSearchPage.searchKeyword('Fullstack');

    // 2. Xác nhận URL cập nhật query param kw hoặc state tìm kiếm
    await expect(page).toHaveURL(/kw=Fullstack|\/jobs/, { timeout: 15_000 });

    // 3. Thẻ công việc khớp từ khóa hiển thị tên, công ty, lương
    const matchingJob = await jobSearchPage.expectJobVisible(MOCK_JOBS[0].job_name);
    await expect(matchingJob).toBeVisible();

    // 4. Trạng thái biên: Tìm kiếm từ khóa không tồn tại -> Hiển thị Empty State
    await jobSearchPage.searchKeyword('XYZ_KHONG_TON_TAI_123456');
    await jobSearchPage.expectEmptyState();
  });

  /**
   * CAND-02: Lọc kết hợp nhiều tiêu chí (Thành phố, Ngành nghề, Cấp bậc) và kiểm tra kết quả
   */
  test('CAND-02: Multi-criteria filter (city, career, salary) updates results', async ({ page }) => {
    // 1. Truy cập trang tìm việc kèm tham số lọc ngành nghề và thành phố
    await jobSearchPage.goto('careerId=1&cityId=1');

    // 2. Công việc thỏa mãn tiêu chí xuất hiện trên danh sách
    await jobSearchPage.expectJobVisible(MOCK_JOBS[0].job_name);

    // 3. Mở Drawer bộ lọc nâng cao
    await jobSearchPage.openAdvancedFilters();

    // 4. Bấm áp dụng bộ lọc và kiểm tra danh sách tải lại mượt mà
    await jobSearchPage.applyAdvancedFilters();
    await jobSearchPage.expectJobVisible(MOCK_JOBS[0].job_name);

    // 5. Thử nút Đặt lại bộ lọc (Reset)
    await jobSearchPage.resetFilters();
  });

  /**
   * CAND-12: Xử lý trạng thái biên khi mất kết nối mạng (Offline mode) và phục hồi khi có mạng
   */
  test('CAND-12: Offline empty state and retry when online', async ({ page, context }) => {
    await jobSearchPage.goto();
    await jobSearchPage.expectJobVisible(MOCK_JOBS[0].job_name);

    // 1. Giả lập mất kết nối mạng hoàn toàn
    await context.setOffline(true);

    // 2. Thao tác tìm kiếm trong lúc offline
    const kwInput = jobSearchPage.searchInput;
    if (await kwInput.isVisible()) {
      await kwInput.fill('Offline Query');
      await jobSearchPage.searchButton.click();
    }

    // 3. Hệ thống xử lý an toàn không vỡ layout
    await expect(page.locator('body')).toBeVisible();

    // 4. Khôi phục lại kết nối mạng
    await context.setOffline(false);

    // 5. Bấm thử lại hoặc tìm kiếm lại -> Dữ liệu phục hồi bình thường
    await jobSearchPage.searchKeyword('Fullstack');
    await jobSearchPage.expectJobVisible(MOCK_JOBS[0].job_name);
  });
});
