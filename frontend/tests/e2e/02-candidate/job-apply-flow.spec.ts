import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_JOBS } from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { JobDetailPage } from '../../pages/candidate/job-detail.page';
import { ApplyModalPage } from '../../pages/candidate/apply-modal.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Chi Tiết Việc Làm & Nộp Hồ Sơ Ứng Tuyển (Job Apply Flow)', () => {
  let jobDetailPage: JobDetailPage;
  let applyModalPage: ApplyModalPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Bỏ qua product tour
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_candidate_dashboard', 'true');
        window.localStorage.setItem('infohr_product_tour_completed_practice_room', 'true');
      } catch {}
    });

    jobDetailPage = new JobDetailPage(page);
    applyModalPage = new ApplyModalPage(page);
  });

  /**
   * CAND-03: Xem chi tiết tin tuyển dụng (JD, phúc lợi, hạn nộp) và mở modal ứng tuyển
   */
  test('CAND-03: View job detail and open Apply Modal', async ({ page }) => {
    const targetJob = MOCK_JOBS[0];
    await jobDetailPage.goto(targetJob.slug);

    // 1. Kiểm tra tiêu đề việc làm, tên công ty và hạn nộp
    const title = await jobDetailPage.getJobTitle();
    expect(title.length).toBeGreaterThan(0);

    await jobDetailPage.expectCompanyVisible(targetJob.company.company_name);
    await expect(jobDetailPage.deadlineElement).toBeVisible();

    // 2. Bấm nút "Ứng tuyển ngay" / "Nộp hồ sơ"
    await jobDetailPage.openApplyModal();

    // 3. Modal Ứng tuyển xuất hiện
    await applyModalPage.expectModalVisible();
  });

  /**
   * CAND-04: Nộp hồ sơ bằng CV trực tuyến / CV đính kèm có sẵn, chuyển trạng thái "Đã ứng tuyển"
   */
  test('CAND-04: Apply using attached CV with cover letter, shows applied badge', async ({ page }) => {
    const targetJob = MOCK_JOBS[0];
    await jobDetailPage.goto(targetJob.slug);

    // 1. Mở Modal ứng tuyển
    await jobDetailPage.openApplyModal();
    await applyModalPage.expectModalVisible();

    // 2. Chọn CV có sẵn từ danh sách
    await applyModalPage.selectAttachedResume(0);

    // 3. Cập nhật thông tin liên hệ và thư giới thiệu
    await applyModalPage.fillContactInfo({
      fullName: 'Nguyen Van Ung Vien',
      phone: '0901234567',
    });
    await applyModalPage.fillCoverLetter('Tôi rất quan tâm và mong muốn cống hiến cho vị trí này.');

    // 4. Bấm nộp hồ sơ
    await applyModalPage.submit();

    // 5. Xác nhận modal đóng lại
    await applyModalPage.expectModalClosed();

    // 6. Nút ứng tuyển cập nhật thành badge "Đã ứng tuyển"
    await jobDetailPage.expectAppliedBadge();
  });

  /**
   * CAND-05: Nộp hồ sơ bằng cách tải lên file CV PDF mới (kèm kiểm tra dung lượng/định dạng)
   */
  test('CAND-05: Apply by uploading new PDF file', async ({ page }) => {
    const targetJob = MOCK_JOBS[0];
    await jobDetailPage.goto(targetJob.slug);

    // 1. Mở modal ứng tuyển
    await jobDetailPage.openApplyModal();
    await applyModalPage.expectModalVisible();

    // 2. Tải lên file CV PDF mới
    await applyModalPage.uploadNewResume(
      'resume_leducnam_2026.pdf',
      'application/pdf',
      Buffer.from('%PDF-1.4 Mock CV Content for Senior Software Engineer')
    );

    // 3. Điền thông tin liên hệ
    await applyModalPage.fillContactInfo({
      fullName: 'Le Duc Nam',
      phone: '0988776655',
    });

    // 4. Bấm nộp hồ sơ
    await applyModalPage.submit();

    // 5. Modal đóng và hiển thị trạng thái hoàn tất
    await applyModalPage.expectModalClosed();
  });
});
