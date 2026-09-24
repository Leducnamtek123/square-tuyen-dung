import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * OnlineProfilePage - Page Object Model cho trang hồ sơ ứng viên trực tuyến (/profile)
 * Phục vụ kịch bản CAND-08
 */
export class OnlineProfilePage extends BasePage {
  readonly editProfileButton: Locator;
  readonly editModal: Locator;
  readonly modalFullNameInput: Locator;
  readonly modalPhoneInput: Locator;
  readonly modalTitleInput: Locator;
  readonly modalSaveButton: Locator;
  readonly seekingSwitch: Locator;
  readonly seekingStatusChip: Locator;
  readonly editSkillsButton: Locator;
  readonly skillModal: Locator;
  readonly newSkillInput: Locator;
  readonly addSkillButton: Locator;
  readonly saveSkillsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editProfileButton = page.getByRole('button', { name: /chỉnh sửa/i }).first();
    this.editModal = page.getByRole('dialog').first();
    this.modalFullNameInput = this.editModal.locator('input[placeholder*="họ và tên"], input[name="fullName"]').first();
    this.modalPhoneInput = this.editModal.locator('input[placeholder*="số điện thoại"], input[name="phoneNumber"]').first();
    this.modalTitleInput = this.editModal.locator('input[placeholder*="chức danh"], input[name="title"]').first();
    this.modalSaveButton = this.editModal.getByRole('button', { name: /lưu thay đổi|lưu/i }).first();

    this.seekingSwitch = page.locator('input[type="checkbox"]').first();
    this.seekingStatusChip = page
      .locator('.MuiChip-root')
      .filter({ hasText: /đang mở cửa nhận việc|đang tạm dừng nhận việc/i })
      .first();

    this.editSkillsButton = page
      .locator('[title="Chỉnh sửa kỹ năng"], button[aria-label="Thao tác"]')
      .or(page.getByRole('button', { name: /thêm kỹ năng|chỉnh sửa/i }))
      .last();
    this.skillModal = page.getByRole('dialog').first();
    this.newSkillInput = this.skillModal
      .locator('input[placeholder*="kỹ năng"], input[type="text"]')
      .first();
    this.addSkillButton = this.skillModal.getByRole('button', { name: /thêm|áp dụng/i }).first();
    this.saveSkillsButton = this.skillModal.getByRole('button', { name: /lưu|hoàn tất/i }).first();
  }

  /**
   * Điều hướng vào trang hồ sơ cá nhân
   */
  async goto(path: string = '/profile') {
    await super.goto(path);
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal chỉnh sửa thông tin cá nhân
   */
  async openEditProfileModal() {
    await expect(this.editProfileButton).toBeVisible({ timeout: 15_000 });
    await this.editProfileButton.click();
    await expect(this.editModal).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Cập nhật thông tin cá nhân trong modal
   */
  async updatePersonalInfo(data: { fullName?: string; phone?: string; title?: string }) {
    await this.openEditProfileModal();

    if (data.fullName && (await this.modalFullNameInput.isVisible())) {
      await this.modalFullNameInput.fill(data.fullName);
    }
    if (data.phone && (await this.modalPhoneInput.isVisible())) {
      await this.modalPhoneInput.fill(data.phone);
    }
    if (data.title && (await this.modalTitleInput.isVisible())) {
      await this.modalTitleInput.fill(data.title);
    }

    await expect(this.modalSaveButton).toBeVisible({ timeout: 10_000 });
    await this.modalSaveButton.click();
    await this.waitForLoadingGone();
  }

  /**
   * Bật / tắt cờ tìm kiếm việc làm
   */
  async toggleLookingForJob() {
    await expect(this.seekingSwitch).toBeVisible({ timeout: 15_000 });
    await this.seekingSwitch.click();
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm tra nhãn trạng thái nhận việc
   */
  async expectSeekingStatus(active: boolean) {
    const expectedLabel = active ? /đang mở cửa nhận việc/i : /đang tạm dừng nhận việc/i;
    await expect(this.page.getByText(expectedLabel).first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Thêm kỹ năng mới vào hồ sơ
   */
  async addSkill(skillName: string) {
    if (await this.editSkillsButton.isVisible()) {
      await this.editSkillsButton.click();
      if (await this.skillModal.isVisible()) {
        if (await this.newSkillInput.isVisible()) {
          await this.newSkillInput.fill(skillName);
          await this.addSkillButton.click();
        }
        await this.saveSkillsButton.click();
        await this.waitForLoadingGone();
      }
    }
  }

  /**
   * Kiểm tra kỹ năng hiển thị trên giao diện
   */
  async expectSkillVisible(skillName: string) {
    await expect(this.page.getByText(skillName).first()).toBeVisible({ timeout: 15_000 });
  }
}
