import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface QuestionData {
  text: string;
  category?: 'technical' | 'situational' | 'culture_fit' | 'general' | string;
  difficulty?: number;
  duration?: number;
}

/**
 * QuestionBankPage - Page Object Model quản lý ngân hàng câu hỏi & bộ kịch bản phỏng vấn
 * Phục vụ các kịch bản: EMP-06 (CRUD câu hỏi), EMP-07 (Tạo kịch bản phỏng vấn gộp câu hỏi)
 */
export class QuestionBankPage extends BasePage {
  // Ngân hàng câu hỏi (/employer/question-bank)
  readonly addQuestionBtn: Locator;
  readonly questionDialog: Locator;
  readonly questionTextInput: Locator;
  readonly questionCategorySelect: Locator;
  readonly questionDifficultySelect: Locator;
  readonly questionDurationSelect: Locator;
  readonly saveQuestionBtn: Locator;
  readonly cancelQuestionBtn: Locator;
  readonly questionsTable: Locator;

  // Bộ kịch bản phỏng vấn (/employer/question-groups)
  readonly createGroupBtn: Locator;
  readonly groupDialog: Locator;
  readonly groupNameInput: Locator;
  readonly groupDescInput: Locator;
  readonly groupQuestionsSelect: Locator;
  readonly saveGroupBtn: Locator;
  readonly groupsTable: Locator;

  // Dialog xác nhận xóa
  readonly confirmModalBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Question Bank elements
    this.addQuestionBtn = page.getByRole('button', { name: /thêm câu hỏi|tạo câu hỏi/i }).first();
    this.questionDialog = page.locator('div[role="dialog"]').filter({ hasText: /câu hỏi/i }).first();
    this.questionTextInput = this.questionDialog.locator('textarea, input[type="text"]').first();
    this.questionCategorySelect = this.questionDialog.locator('select, [role="combobox"]').first();
    this.questionDifficultySelect = this.questionDialog.locator('[role="combobox"]').nth(1);
    this.questionDurationSelect = this.questionDialog.locator('input[type="number"], select').first();
    this.saveQuestionBtn = this.questionDialog.getByRole('button', { name: /tạo|lưu|xác nhận/i }).first();
    this.cancelQuestionBtn = this.questionDialog.getByRole('button', { name: /hủy|đóng/i }).first();
    this.questionsTable = page.locator('table, [role="table"]').first();

    // Question Groups elements
    this.createGroupBtn = page.getByRole('button', { name: /tạo bộ kịch bản|thêm kịch bản|tạo nhóm/i }).first();
    this.groupDialog = page.locator('div[role="dialog"]').filter({ hasText: /kịch bản|nhóm câu hỏi/i }).first();
    this.groupNameInput = this.groupDialog.locator('input[name="groupName"], input#groupName, input[placeholder*="Tên"]').first();
    this.groupDescInput = this.groupDialog.locator('textarea, input[name="groupDescription"]').first();
    this.groupQuestionsSelect = this.groupDialog.locator('[role="combobox"], select, [class*="MuiSelect-select"]').first();
    this.saveGroupBtn = this.groupDialog.getByRole('button', { name: /lưu|tạo|xác nhận/i }).first();
    this.groupsTable = page.locator('table, [role="table"]').first();

    this.confirmModalBtn = page.locator('.swal2-confirm, button:has-text("Xác nhận"), button:has-text("Đồng ý")').first();
  }

  /**
   * Điều hướng tới Ngân hàng câu hỏi
   */
  async gotoQuestionBank() {
    await super.goto('/employer/question-bank');
    await this.waitForLoadingGone();
  }

  /**
   * Điều hướng tới Bộ kịch bản phỏng vấn
   */
  async gotoQuestionGroups() {
    await super.goto('/employer/question-groups');
    await this.waitForLoadingGone();
  }

  /**
   * Thêm câu hỏi phỏng vấn mới vào ngân hàng
   */
  async createQuestion(data: QuestionData) {
    await expect(this.addQuestionBtn).toBeVisible({ timeout: 15_000 });
    await this.addQuestionBtn.click();

    await expect(this.questionDialog).toBeVisible({ timeout: 10_000 });
    await this.questionTextInput.fill(data.text);

    await expect(this.saveQuestionBtn).toBeVisible();
    await this.saveQuestionBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Xóa câu hỏi khỏi ngân hàng
   */
  async deleteQuestion(questionText: string) {
    const row = this.page.locator('tr').filter({ hasText: questionText }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const deleteBtn = row.locator('button[aria-label*="Xóa"], button:has([data-testid="DeleteIcon"])').first();
    await deleteBtn.click();

    if (await this.confirmModalBtn.isVisible({ timeout: 5_000 })) {
      await this.confirmModalBtn.click();
    }
    await this.waitForLoadingGone();
  }

  /**
   * Tạo bộ kịch bản phỏng vấn mới kết hợp nhiều câu hỏi
   */
  async createQuestionGroup(name: string, description?: string) {
    await expect(this.createGroupBtn).toBeVisible({ timeout: 15_000 });
    await this.createGroupBtn.click();

    await expect(this.groupDialog).toBeVisible({ timeout: 10_000 });
    await this.groupNameInput.fill(name);

    if (description && (await this.groupDescInput.isVisible())) {
      await this.groupDescInput.fill(description);
    }

    await expect(this.saveGroupBtn).toBeVisible();
    await this.saveGroupBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra câu hỏi hiển thị trong bảng
   */
  async expectQuestionVisible(text: string) {
    const item = this.page.getByText(text).first();
    await expect(item).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Kiểm tra bộ kịch bản hiển thị trong danh sách
   */
  async expectQuestionGroupVisible(name: string) {
    const item = this.page.getByText(name).first();
    await expect(item).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Kiểm tra thông báo lỗi validation khi thiếu trường bắt buộc
   */
  async expectValidationError(message?: string | RegExp) {
    const errorMsg = message
      ? this.page.locator('.Mui-error, [role="alert"]').filter({ hasText: message }).first()
      : this.page.locator('.Mui-error, [role="alert"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  }
}
