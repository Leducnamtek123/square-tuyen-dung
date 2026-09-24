import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * ApplyModalPage - Page Object Model cho Modal nộp hồ sơ ứng tuyển
 * Phục vụ các kịch bản CAND-03, CAND-04, CAND-05
 */
export class ApplyModalPage extends BasePage {
  readonly dialog: Locator;
  readonly modalTitle: Locator;
  readonly resumeRadios: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly coverLetterInput: Locator;
  readonly submitButton: Locator;
  readonly uploadInput: Locator;
  readonly uploadTabButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.getByRole('dialog').first();
    this.modalTitle = this.dialog.getByText(/ứng tuyển vị trí|nộp hồ sơ/i).first();
    this.resumeRadios = this.dialog.getByRole('radio');
    this.fullNameInput = this.dialog.locator('input[name="fullName"]').first();
    this.emailInput = this.dialog.locator('input[name="email"]').first();
    this.phoneInput = this.dialog.locator('input[name="phone"]').first();
    this.coverLetterInput = this.dialog.locator('textarea[name="coverLetter"], textarea[name="message"], textarea').first();
    this.submitButton = this.dialog.getByRole('button', { name: /^ứng tuyển$|nộp hồ sơ|gửi hồ sơ/i }).last();
    this.uploadInput = this.dialog.locator('input[type="file"]').first();
    this.uploadTabButton = this.dialog.getByRole('button', { name: /tải lên cv mới|upload|đính kèm cv/i }).first();
  }

  /**
   * Xác nhận modal ứng tuyển đang hiển thị
   */
  async expectModalVisible() {
    await expect(this.dialog).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Chọn hồ sơ CV có sẵn theo thứ tự (mặc định là CV đầu tiên)
   */
  async selectAttachedResume(index = 0) {
    await expect(this.resumeRadios.first()).toBeVisible({ timeout: 15_000 });
    const targetRadio = this.resumeRadios.nth(index);
    await targetRadio.check();
  }

  /**
   * Điền thông tin liên hệ trong modal
   */
  async fillContactInfo(data: { fullName?: string; email?: string; phone?: string }) {
    if (data.fullName && (await this.fullNameInput.isVisible())) {
      await this.fullNameInput.fill(data.fullName);
    }
    if (data.email && (await this.emailInput.isVisible())) {
      await this.emailInput.fill(data.email);
    }
    if (data.phone && (await this.phoneInput.isVisible())) {
      await this.phoneInput.fill(data.phone);
    }
  }

  /**
   * Nhập thư giới thiệu nếu có
   */
  async fillCoverLetter(letter: string) {
    if (await this.coverLetterInput.isVisible()) {
      await this.coverLetterInput.fill(letter);
    }
  }

  /**
   * Tải lên file CV PDF mới
   */
  async uploadNewResume(
    fileName = 'my_cv.pdf',
    mimeType = 'application/pdf',
    buffer: Buffer = Buffer.from('%PDF-1.4 mock cv file content for playwright testing')
  ) {
    if (await this.uploadTabButton.isVisible()) {
      await this.uploadTabButton.click();
    }
    if (await this.uploadInput.count() > 0) {
      await this.uploadInput.setInputFiles({
        name: fileName,
        mimeType,
        buffer,
      });
    }
  }

  /**
   * Bấm nút gửi hồ sơ ứng tuyển
   */
  async submit() {
    await expect(this.submitButton).toBeVisible({ timeout: 15_000 });
    await this.submitButton.click();
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận modal ứng tuyển đã đóng lại
   */
  async expectModalClosed() {
    await expect(this.dialog).not.toBeVisible({ timeout: 15_000 });
  }
}
