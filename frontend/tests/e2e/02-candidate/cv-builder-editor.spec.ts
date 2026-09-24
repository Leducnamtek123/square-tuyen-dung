import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';
import { CvBuilderPage } from '../../pages/candidate/cv-builder.page';

test.describe('Phân Hệ 2 - Cổng Ứng Viên: Trình Tạo & Chỉnh Sửa CV Trực Tuyến (CV Builder Editor)', () => {
  let cvBuilderPage: CvBuilderPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);

    // Tắt product tour tự động mở
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('infohr_product_tour_completed_cv_builder', 'true');
      } catch {}
    });

    cvBuilderPage = new CvBuilderPage(page);
  });

  /**
   * CAND-06: Cập nhật thông tin cá nhân, học vấn, kinh nghiệm và kiểm tra Live Preview thời gian thực
   */
  test('CAND-06: CV Builder live preview updates text in real-time', async ({ page }) => {
    await cvBuilderPage.goto();

    // 1. Khung xem trước trực tiếp (Live Preview) hiển thị
    await cvBuilderPage.expectPreviewVisible();

    // 2. Nhập họ tên và chức danh chuyên môn
    await cvBuilderPage.fillPersonalInfo({
      fullName: 'LE DUC NAM FULLSTACK',
      jobTitle: 'Senior Fullstack Tech Lead',
    });

    // 3. Khung xem trước cập nhật ngay lập tức không cần tải lại trang
    await cvBuilderPage.expectPreviewText('LE DUC NAM FULLSTACK');
    await cvBuilderPage.expectPreviewText('Senior Fullstack Tech Lead');

    // 4. Thêm kinh nghiệm làm việc mới
    await cvBuilderPage.addExperience({
      position: 'Staff AI Architect',
      company: 'InfoHR Ecosystem Vietnam',
    });

    // 5. Khung xem trước phản ánh kinh nghiệm mới
    await cvBuilderPage.expectPreviewText('Staff AI Architect');
    await cvBuilderPage.expectPreviewText('InfoHR Ecosystem Vietnam');

    // 6. Thêm học vấn mới
    await cvBuilderPage.addEducation({
      school: 'Đại Học Bách Khoa Hà Nội',
    });
    await cvBuilderPage.expectPreviewText('Đại Học Bách Khoa Hà Nội');
  });

  /**
   * CAND-07: Xuất file PDF chuẩn và trải nghiệm tính năng chấm điểm ATS bằng AI (Tab AI Score)
   */
  test('CAND-07: CV Builder PDF export and AI score tab', async ({ page }) => {
    await cvBuilderPage.goto();
    await cvBuilderPage.expectPreviewVisible();

    // 1. Kiểm tra nút Tải PDF hiển thị sẵn sàng
    await expect(cvBuilderPage.downloadPdfButton).toBeVisible();

    // 2. Bấm nút Tải PDF (hàm in / xuất PDF được gọi mà không crash UI)
    await cvBuilderPage.downloadPdf();
    await cvBuilderPage.expectPreviewVisible();

    // 3. Chuyển sang Tab Chấm ATS / AI Score
    await cvBuilderPage.switchTab('ai-score');

    // 4. Kích hoạt phân tích điểm AI
    await cvBuilderPage.runAiScoring();

    // 5. Xác nhận bảng điểm hoặc kết quả phân tích độ tương thích ATS xuất hiện
    await cvBuilderPage.expectAiScoreResult();
  });
});
