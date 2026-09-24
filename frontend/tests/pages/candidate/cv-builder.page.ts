import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * CvBuilderPage - Page Object Model cho Trình tạo & chỉnh sửa CV trực tuyến (/cv-builder)
 * Phục vụ các kịch bản CAND-06, CAND-07
 */
export class CvBuilderPage extends BasePage {
  readonly previewArea: Locator;
  readonly downloadPdfButton: Locator;
  readonly fullNameInput: Locator;
  readonly jobTitleInput: Locator;
  readonly addExperienceButton: Locator;
  readonly addEducationButton: Locator;
  readonly contentTab: Locator;
  readonly designTab: Locator;
  readonly aiScoreTab: Locator;
  readonly aiAssistTab: Locator;
  readonly runAiScoreButton: Locator;

  constructor(page: Page) {
    super(page);
    this.previewArea = page.locator('#cv-print-area');
    this.downloadPdfButton = page
      .locator('[data-tour="cv-export"]')
      .or(page.getByRole('button', { name: /tải pdf/i }))
      .first();
    this.fullNameInput = page
      .getByLabel(/họ và tên \*/i)
      .or(page.getByPlaceholder(/VD: NGUYỄN VĂN A/i))
      .first();
    this.jobTitleInput = page
      .getByLabel(/vị trí ứng tuyển \*/i)
      .or(page.getByPlaceholder(/VD: Senior Frontend Developer|Lead Fullstack/i))
      .first();
    this.addExperienceButton = page
      .getByRole('button', { name: /thêm kinh nghiệm làm việc|\+ Bấm vào đây để thêm/i })
      .first();
    this.addEducationButton = page
      .getByRole('button', { name: /thêm học vấn|\+ Bấm vào đây để thêm/i })
      .last();
    this.contentTab = page.getByRole('button', { name: /nhập liệu|chỉnh sửa/i }).first();
    this.designTab = page.getByRole('button', { name: /thiết kế/i }).first();
    this.aiScoreTab = page.getByRole('button', { name: /chấm ats|điểm ai|ai score/i }).first();
    this.aiAssistTab = page.getByRole('button', { name: /gợi ý ai/i }).first();
    this.runAiScoreButton = page
      .getByRole('button', { name: /bắt đầu chấm điểm|chấm điểm lại|chấm điểm/i })
      .first();
  }

  /**
   * Điều hướng vào trang CV Builder
   */
  async goto(path: string = '/cv-builder') {
    await super.goto(path);
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận khung Live Preview hiển thị
   */
  async expectPreviewVisible() {
    await expect(this.previewArea).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Điền thông tin cá nhân vào form CV
   */
  async fillPersonalInfo(data: { fullName?: string; jobTitle?: string }) {
    if (data.fullName) {
      await expect(this.fullNameInput).toBeVisible({ timeout: 15_000 });
      await this.fullNameInput.fill(data.fullName);
    }
    if (data.jobTitle) {
      await expect(this.jobTitleInput).toBeVisible({ timeout: 15_000 });
      await this.jobTitleInput.fill(data.jobTitle);
    }
  }

  /**
   * Kiểm tra văn bản cập nhật tức thì trong khung Live Preview
   */
  async expectPreviewText(text: string | RegExp) {
    const textLocator = this.previewArea.getByText(text).first();
    await expect(textLocator).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Thêm kinh nghiệm làm việc mới
   */
  async addExperience(data: { position: string; company: string }) {
    if (await this.addExperienceButton.isVisible()) {
      await this.addExperienceButton.click();
    } else {
      await this.page.getByText(/bấm vào đây để thêm/i).first().click();
    }

    const expPositionInput = this.page.getByPlaceholder(/VD: Senior Frontend Developer/i).first();
    await expect(expPositionInput).toBeVisible({ timeout: 10_000 });
    await expPositionInput.fill(data.position);

    const expCompanyInput = this.page.getByPlaceholder(/VD: Công ty Cổ phần Công nghệ ABC/i).first();
    await expCompanyInput.fill(data.company);
  }

  /**
   * Thêm học vấn mới
   */
  async addEducation(data: { school: string }) {
    if (await this.addEducationButton.isVisible()) {
      await this.addEducationButton.click();
    } else {
      await this.page.getByRole('button', { name: /\+ Bấm vào đây để thêm/i }).last().click();
    }

    const schoolInput = this.page
      .getByLabel(/trường \/ đơn vị đào tạo \*/i)
      .or(this.page.getByPlaceholder(/VD: Đại học Bách Khoa Hà Nội/i))
      .first();
    await expect(schoolInput).toBeVisible({ timeout: 10_000 });
    await schoolInput.fill(data.school);
  }

  /**
   * Chuyển tab trong thanh công cụ bên trái
   */
  async switchTab(tab: 'content' | 'design' | 'ai-score' | 'ai') {
    switch (tab) {
      case 'content':
        await this.contentTab.click();
        break;
      case 'design':
        await this.designTab.click();
        break;
      case 'ai-score':
        await this.aiScoreTab.click();
        break;
      case 'ai':
        await this.aiAssistTab.click();
        break;
    }
  }

  /**
   * Chọn màu sắc hoặc template trong tab Thiết kế
   */
  async selectDesignOptions() {
    await this.switchTab('design');
    const colorSwatches = this.page.locator('[title="#059669"], [title="#1e40af"], [title="#e11d48"], [title="#0284c7"]');
    if ((await colorSwatches.count()) > 0) {
      await colorSwatches.first().click();
    }
  }

  /**
   * Kích hoạt chấm điểm ATS bằng AI
   */
  async runAiScoring() {
    await this.switchTab('ai-score');
    await expect(this.runAiScoreButton).toBeVisible({ timeout: 15_000 });
    await this.runAiScoreButton.click();
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận kết quả phân tích điểm AI hiển thị
   */
  async expectAiScoreResult() {
    const scoreResult = this.page
      .getByText(/điểm|xếp loại|ats|độ tương thích|phân tích/i)
      .first();
    await expect(scoreResult).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Bấm nút tải PDF
   */
  async downloadPdf() {
    await expect(this.downloadPdfButton).toBeVisible({ timeout: 15_000 });
    await this.downloadPdfButton.click();
  }
}
