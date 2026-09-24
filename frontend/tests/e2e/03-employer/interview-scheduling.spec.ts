import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_APPLIED_RESUMES } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { AtsKanbanPage } from '../../pages/employer/ats-kanban.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Lên Lịch Phỏng Vấn AI (AI Interview Scheduling)', () => {
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
   * EMP-04: Mở modal lên lịch phỏng vấn AI cho ứng viên phù hợp và gửi thư mời
   */
  test('EMP-04: Open schedule modal, configure AI Voice interview and send invite', async ({ page }) => {
    await atsKanbanPage.goto();

    const candidate = MOCK_APPLIED_RESUMES[0];
    await atsKanbanPage.expectCandidateVisible(candidate.fullName);

    // 1. Mở Modal lên lịch phỏng vấn
    await atsKanbanPage.openInterviewScheduleModal(candidate.id);

    // 2. Điền ghi chú và xác nhận gửi lời mời
    await atsKanbanPage.submitAiInterviewSchedule(
      'Phỏng vấn đánh giá năng lực kiến trúc hệ thống cùng Trợ lý AI AILA.'
    );

    // 3. Modal đóng lại sau khi gửi thành công
    await expect(atsKanbanPage.quickScheduleModal).not.toBeVisible({ timeout: 10_000 });
  });

  /**
   * EMP-04 Negative: Báo lỗi khi không thể lên lịch phỏng vấn do dữ liệu không hợp lệ
   */
  test('EMP-04 Negative: Server error when scheduling displays error feedback in modal', async ({ page }) => {
    // Giả lập lỗi máy chủ khi lên lịch phỏng vấn
    await page.route(/\/interview\/web\/sessions\/?(\?.*)?$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Vui lòng chọn thời gian bắt đầu phỏng vấn hợp lệ trong tương lai.',
          }),
        });
        return;
      }
      await route.continue();
    });

    await atsKanbanPage.goto();
    const candidate = MOCK_APPLIED_RESUMES[0];
    await atsKanbanPage.openInterviewScheduleModal(candidate.id);

    // Bấm gửi khi server trả lỗi
    await atsKanbanPage.scheduleSubmitBtn.click();

    // Thông báo lỗi xuất hiện trong modal
    const alert = atsKanbanPage.quickScheduleModal.locator('.MuiAlert-root, [role="alert"]').first();
    await expect(alert).toBeVisible({ timeout: 10_000 });
  });
});
