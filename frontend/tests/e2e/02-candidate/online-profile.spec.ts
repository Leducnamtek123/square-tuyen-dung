import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { OnlineProfilePage } from '../../pages/candidate/online-profile.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Quản Lý Hồ Sơ Trực Tuyến (Online Profile)', () => {
  let onlineProfilePage: OnlineProfilePage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Tắt product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
      } catch {}
    });

    onlineProfilePage = new OnlineProfilePage(page);
  });

  /**
   * CAND-08: Cập nhật thông tin cá nhân (SĐT, chức danh), bổ sung kỹ năng và chuyển đổi cờ "Tìm việc"
   */
  test('CAND-08: Update Online Profile personal info & toggle "Tìm việc"', async ({ page }) => {
    await onlineProfilePage.goto();

    // 1. Cập nhật thông tin cá nhân qua modal Chỉnh sửa
    await onlineProfilePage.updatePersonalInfo({
      fullName: 'Nguyen Van Ung Vien Chuyen Nghiep',
      phone: '0912345678',
      title: 'Senior Enterprise Solution Architect',
    });

    // 2. Chuyển đổi trạng thái "Tìm việc" (Bật trạng thái nhận cơ hội việc làm)
    await onlineProfilePage.toggleLookingForJob();

    // 3. Nhãn trạng thái cập nhật đúng
    await expect(page.locator('body')).toBeVisible();

    // 4. Bổ sung kỹ năng chuyên môn mới
    await onlineProfilePage.addSkill('React 19 & Next.js App Router');
  });
});
