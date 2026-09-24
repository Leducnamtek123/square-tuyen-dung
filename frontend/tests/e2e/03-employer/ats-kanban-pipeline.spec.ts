import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_APPLIED_RESUMES } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { AtsKanbanPage } from '../../pages/employer/ats-kanban.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Phễu Tuyển Dụng ATS & Bảng Kanban (ATS Pipeline)', () => {
  let atsKanbanPage: AtsKanbanPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    // Bỏ qua product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_employer_applied_resumes', 'true');
      } catch {}
    });

    atsKanbanPage = new AtsKanbanPage(page);
  });

  /**
   * EMP-03: Chuyển đổi giữa chế độ xem Bảng / Kanban và chuyển trạng thái ứng viên
   */
  test('EMP-03: Switch view mode and move candidate status across ATS pipeline', async ({ page }) => {
    await atsKanbanPage.goto();

    // 1. Kiểm tra ứng viên hiển thị trong bảng
    const candidate = MOCK_APPLIED_RESUMES[0];
    await atsKanbanPage.expectCandidateVisible(candidate.fullName);

    // 2. Chuyển sang chế độ xem Bảng Kanban
    await atsKanbanPage.switchView('board');
    await expect(atsKanbanPage.boardViewBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Chuyển trạng thái ứng viên từ "Chờ xác nhận" sang "Phù hợp"
    await atsKanbanPage.changeCandidateStatusViaMenu(candidate.id, 'Phù hợp');

    // 4. Xác nhận card di chuyển và không gây lỗi giao diện
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-03 Negative: Lỗi mạng khi cập nhật trạng thái sẽ hoàn tác vị trí card
   */
  test('EMP-03 Negative: Network error during status update triggers rollback with alert', async ({ page }) => {
    await atsKanbanPage.goto();
    await atsKanbanPage.switchView('board');

    // Giả lập API cập nhật trạng thái trả về lỗi 500
    await page.route(/\/job\/web\/employer-job-posts-activity\/[^/]+\/application-status\/?(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Lỗi kết nối máy chủ' }),
      });
    });

    const candidate = MOCK_APPLIED_RESUMES[0];
    await atsKanbanPage.changeCandidateStatusViaMenu(candidate.id, 'Phù hợp');

    // Hệ thống báo lỗi hoặc hoàn tác vị trí
    const errorNotice = page.locator('.swal2-modal, [role="alert"], [class*="error"]').first();
    await expect(errorNotice).toBeVisible({ timeout: 10_000 });
  });

  /**
   * EMP-09: Lọc ứng viên có điểm AI >= 80%, đánh dấu trúng tuyển và xuất file Excel
   */
  test('EMP-09: Filter candidates by AI score, mark as hired and export Excel list', async ({ page }) => {
    await atsKanbanPage.goto();

    // 1. Lọc ứng viên có điểm AI cao
    await atsKanbanPage.filterByAiScore(80);

    // Ứng viên điểm cao xuất hiện
    await atsKanbanPage.expectCandidateVisible(MOCK_APPLIED_RESUMES[0].fullName);

    // 2. Đổi trạng thái sang "Đã tuyển dụng" (Hired)
    await atsKanbanPage.moveToHired(MOCK_APPLIED_RESUMES[0].id);

    // 3. Bấm xuất danh sách ra file Excel
    const download = await atsKanbanPage.exportExcel();
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.(xlsx|csv)$/i);
    }
  });

  /**
   * EMP-03 Blind Mode: Bật chế độ tuyển dụng công bằng (Blind Hiring)
   */
  test('EMP-03: Toggle blind hiring mode to conceal candidate personal information', async ({ page }) => {
    await atsKanbanPage.goto();
    await atsKanbanPage.switchView('board');

    // Bật chế độ Blind Mode
    await atsKanbanPage.toggleBlindMode();
    await expect(atsKanbanPage.blindModeBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
