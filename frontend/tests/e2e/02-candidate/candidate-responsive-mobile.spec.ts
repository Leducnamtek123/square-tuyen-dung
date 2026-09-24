import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_JOBS } from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { JobSearchPage } from '../../pages/candidate/job-search.page';
import { JobDetailPage } from '../../pages/candidate/job-detail.page';
import { ApplyModalPage } from '../../pages/candidate/apply-modal.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Trải Nghiệm Responsive Mobile Viewport (iPhone 14)', () => {
  // Thiết lập Viewport chuẩn iPhone 14: 390 x 844
  test.use({ viewport: { width: 390, height: 844 } });

  let jobSearchPage: JobSearchPage;
  let jobDetailPage: JobDetailPage;
  let applyModalPage: ApplyModalPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Tắt product tour tự động mở
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_cv_builder', 'true');
      } catch {}
    });

    jobSearchPage = new JobSearchPage(page);
    jobDetailPage = new JobDetailPage(page);
    applyModalPage = new ApplyModalPage(page);
  });

  /**
   * CAND-11: Responsive Mobile Viewport (iPhone 14) Drawer menu, Bottom Sheet filter & Nút CTA cố định
   */
  test('CAND-11: Responsive Mobile Viewport (iPhone 14) drawer menu & fixed CTA', async ({ page }) => {
    // 1. Mở trang danh sách việc làm trên Mobile
    await jobSearchPage.goto();

    // 2. Kiểm tra ô tìm kiếm hiển thị co giãn vừa vặn với chiều ngang 390px
    await expect(jobSearchPage.searchInput).toBeVisible({ timeout: 15_000 });

    // 3. Mở bộ lọc nâng cao (dạng Bottom Sheet / Drawer trên Mobile)
    await jobSearchPage.openAdvancedFilters();

    // 4. Đóng bộ lọc bằng nút Áp dụng
    await jobSearchPage.applyAdvancedFilters();

    // 5. Kiểm tra không bị tràn thanh cuộn ngang trên màn hình di động
    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isHorizontalOverflow).toBeFalsy();

    // 6. Chuyển sang trang chi tiết việc làm trên mobile
    const targetJob = MOCK_JOBS[0];
    await jobDetailPage.goto(targetJob.slug);

    // 7. Xác nhận thanh Sticky Bottom Bar cố định ở đáy màn hình
    const stickyCta = jobDetailPage.mobileStickyApplyButton;
    await expect(stickyCta).toBeVisible({ timeout: 15_000 });

    // 8. Bấm nút CTA cố định để mở Modal Ứng tuyển
    await stickyCta.click();
    await applyModalPage.expectModalVisible();

    // 9. Modal hiển thị đầy đủ và có thể đóng lại an toàn
    await applyModalPage.closeModalIfOpen();
  });
});
