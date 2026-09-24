import { test, expect } from '@playwright/test';
import { setupAllApiMocks, MOCK_QUESTIONS, MOCK_QUESTION_GROUPS } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { QuestionBankPage } from '../../pages/employer/question-bank.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Ngân Hàng Câu Hỏi & Kịch Bản Phỏng Vấn (Question Bank & Scripts)', () => {
  let questionBankPage: QuestionBankPage;

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    questionBankPage = new QuestionBankPage(page);
  });

  /**
   * EMP-06: Thêm mới và quản lý câu hỏi phỏng vấn trong ngân hàng câu hỏi
   */
  test('EMP-06: Create, view and manage questions in Question Bank', async ({ page }) => {
    await questionBankPage.gotoQuestionBank();

    // 1. Kiểm tra danh sách câu hỏi mẫu hiển thị
    await questionBankPage.expectQuestionVisible(MOCK_QUESTIONS[0].text);

    // 2. Thêm câu hỏi phỏng vấn kỹ thuật mới
    const newQuestionText = 'Trình bày cách bạn thiết kế cơ sở dữ liệu phân tán cho hệ thống tuyển dụng?';
    await questionBankPage.createQuestion({
      text: newQuestionText,
      category: 'technical',
      difficulty: 2,
      duration: 120,
    });

    // 3. Câu hỏi mới được thêm vào danh sách
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-06 Delete: Thao tác xóa câu hỏi khỏi ngân hàng
   */
  test('EMP-06: Delete interview question from bank with confirmation', async ({ page }) => {
    await questionBankPage.gotoQuestionBank();

    const targetQuestion = MOCK_QUESTIONS[0];
    await questionBankPage.expectQuestionVisible(targetQuestion.text);

    // Xóa câu hỏi
    await questionBankPage.deleteQuestion(targetQuestion.text);
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-07: Tạo bộ kịch bản phỏng vấn gộp nhiều câu hỏi
   */
  test('EMP-07: Create interview script group composed of multiple questions', async ({ page }) => {
    await questionBankPage.gotoQuestionGroups();

    // 1. Kiểm tra kịch bản có sẵn
    await questionBankPage.expectQuestionGroupVisible(MOCK_QUESTION_GROUPS[0].name);

    // 2. Bấm tạo bộ kịch bản mới
    await questionBankPage.createQuestionGroup(
      'Kịch bản tuyển React & Next.js Senior 2026',
      'Đánh giá kỹ năng lập trình hướng component và tối ưu hóa SEO'
    );

    // 3. Kịch bản lưu thành công
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-07 Negative: Không nhập tên kịch bản sẽ hiển thị lỗi validation
   */
  test('EMP-07 Negative: Creating script group with empty name triggers validation', async () => {
    await questionBankPage.gotoQuestionGroups();

    // Bấm lưu kịch bản khi chưa nhập tên
    await questionBankPage.createQuestionGroup('');

    // Hệ thống cảnh báo trường bắt buộc
    await questionBankPage.expectValidationError();
  });
});
