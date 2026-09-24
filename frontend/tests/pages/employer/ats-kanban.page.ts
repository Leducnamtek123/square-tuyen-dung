import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * AtsKanbanPage - Page Object Model quản lý hồ sơ ứng viên phễu ATS & Kanban
 * Phục vụ các kịch bản: EMP-03 (Kéo thả/chuyển trạng thái Kanban), EMP-04 (Lên lịch phỏng vấn AI), EMP-09 (Lọc điểm AI & Xuất Excel)
 */
export class AtsKanbanPage extends BasePage {
  readonly viewModeToggleGroup: Locator;
  readonly tableViewBtn: Locator;
  readonly boardViewBtn: Locator;
  readonly blindModeBtn: Locator;

  // Kanban Board Elements
  readonly kanbanColumns: Locator;
  readonly candidateCards: Locator;

  // Table View Elements
  readonly appliedTable: Locator;
  readonly tableRows: Locator;

  // Modals & Actions
  readonly exportBtn: Locator;
  readonly exportModal: Locator;
  readonly exportConfirmBtn: Locator;
  readonly importBtn: Locator;

  // Status Change Menu
  readonly statusMenu: Locator;
  readonly statusMenuItems: Locator;

  // Quick Schedule Interview Modal
  readonly quickScheduleModal: Locator;
  readonly scheduleFormatAiRadio: Locator;
  readonly scheduleNotesInput: Locator;
  readonly scheduleSubmitBtn: Locator;
  readonly scheduleCloseBtn: Locator;

  // Onboard to HRM
  readonly hrmConvertBtn: Locator;
  readonly hrmDialog: Locator;

  constructor(page: Page) {
    super(page);

    this.viewModeToggleGroup = page.locator('.MuiToggleButtonGroup-root').first();
    this.tableViewBtn = page.locator('button[value="table"]').first();
    this.boardViewBtn = page.locator('button[value="board"]').first();
    this.blindModeBtn = page.locator('button[value="blind"]').first();

    this.kanbanColumns = page.locator('[data-rbd-droppable-id], [class*="MuiStack-root"] > div[droppableid]');
    this.candidateCards = page.locator('.MuiCard-root, [data-rbd-draggable-id]');

    this.appliedTable = page.locator('table, [role="table"]').first();
    this.tableRows = page.locator('tbody tr');

    this.exportBtn = page.getByRole('button', { name: /xuất danh sách|xuất excel/i }).first();
    this.exportModal = page.locator('[role="dialog"]').filter({ hasText: /xuất dữ liệu|xuất danh sách/i }).first();
    this.exportConfirmBtn = this.exportModal.getByRole('button', { name: /tải xuống|xuất/i }).first();
    this.importBtn = page.getByRole('button', { name: /nhập excel/i }).first();

    this.statusMenu = page.locator('.MuiMenu-paper, [role="menu"]').first();
    this.statusMenuItems = this.statusMenu.locator('[role="menuitem"]');

    this.quickScheduleModal = page.locator('[role="dialog"]').filter({ hasText: /lên lịch phỏng vấn/i }).first();
    this.scheduleFormatAiRadio = this.quickScheduleModal.locator('input[value="ai"]').first();
    this.scheduleNotesInput = this.quickScheduleModal.locator('textarea, input[name="notes"]').first();
    this.scheduleSubmitBtn = this.quickScheduleModal.getByRole('button', { name: /xác nhận|gửi lời mời/i }).first();
    this.scheduleCloseBtn = this.quickScheduleModal.locator('button[aria-label="close"], button:has-text("Đóng")').first();

    this.hrmConvertBtn = page.locator('button[aria-label*="HRM"], button:has([data-testid="PersonAddAltIcon"])').first();
    this.hrmDialog = page.locator('[role="dialog"]').filter({ hasText: /chuyển sang hrm|tạo nhân viên/i }).first();
  }

  /**
   * Điều hướng tới trang Quản lý hồ sơ ứng tuyển (/employer/applied-profiles)
   */
  async goto(queryParams?: string) {
    const url = queryParams ? `/employer/applied-profiles?${queryParams}` : '/employer/applied-profiles';
    await super.goto(url);
    await this.waitForLoadingGone();
  }

  /**
   * Chuyển đổi giữa chế độ xem Bảng (table) và Kanban (board)
   */
  async switchView(mode: 'table' | 'board' | 'kanban') {
    const targetValue = mode === 'table' ? 'table' : 'board';
    const targetBtn = this.page.locator(`button[value="${targetValue}"]`).first();
    await expect(targetBtn).toBeVisible({ timeout: 10_000 });
    await targetBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Bật / tắt chế độ ẩn danh (Blind hiring mode)
   */
  async toggleBlindMode() {
    await expect(this.blindModeBtn).toBeVisible({ timeout: 10_000 });
    await this.blindModeBtn.click();
  }

  /**
   * Kéo thả card ứng viên sang cột trạng thái mới
   */
  async dragCandidate(candidateId: number | string, targetColumnStatusId: string | number) {
    const card = this.page.locator(`[data-rbd-draggable-id="${candidateId}"]`).first();
    const targetColumn = this.page.locator(`[data-rbd-droppable-id="${targetColumnStatusId}"]`).first();

    if ((await card.isVisible()) && (await targetColumn.isVisible())) {
      await card.dragTo(targetColumn);
      await this.waitForLoadingGone();
    }
  }

  /**
   * Chuyển trạng thái ứng viên bằng Menu Thao tác (DriveFileMove icon)
   */
  async changeCandidateStatusViaMenu(candidateId: number | string, targetStatusNameOrId: string | number) {
    const card = this.page.locator(`[data-rbd-draggable-id="${candidateId}"]`).or(
      this.page.locator('.MuiCard-root, tr').filter({ hasText: String(candidateId) })
    ).first();

    const moveBtn = card.locator('button[aria-label="Chuyển trạng thái"], button:has([data-testid="DriveFileMoveOutlinedIcon"])').first();
    await expect(moveBtn).toBeVisible({ timeout: 10_000 });
    await moveBtn.click();

    // Chọn trạng thái mục tiêu từ Menu
    await expect(this.statusMenu).toBeVisible({ timeout: 5_000 });
    const targetItem = this.statusMenuItems.filter({ hasText: new RegExp(String(targetStatusNameOrId), 'i') }).first();
    await expect(targetItem).toBeVisible({ timeout: 5_000 });
    await targetItem.click();
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal lên lịch phỏng vấn nhanh từ card ứng viên
   */
  async openInterviewScheduleModal(candidateId: number | string) {
    const card = this.page.locator(`[data-rbd-draggable-id="${candidateId}"]`).or(
      this.page.locator('.MuiCard-root, tr').filter({ hasText: String(candidateId) })
    ).first();

    const scheduleBtn = card.locator('button[aria-label="Lên lịch phỏng vấn"], button:has([data-testid="EventIcon"])').first();
    await expect(scheduleBtn).toBeVisible({ timeout: 10_000 });
    await scheduleBtn.click();

    await expect(this.quickScheduleModal).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Hoàn tất lên lịch phỏng vấn AI và gửi lời mời
   */
  async submitAiInterviewSchedule(notes = 'Phỏng vấn tự động AI Voice AILA') {
    if (await this.scheduleNotesInput.isVisible()) {
      await this.scheduleNotesInput.fill(notes);
    }
    await expect(this.scheduleSubmitBtn).toBeVisible({ timeout: 10_000 });
    await this.scheduleSubmitBtn.click();
    await this.waitForLoadingGone();
  }

  /**
   * Đổi trạng thái ứng viên sang Đã tuyển dụng (Status = 5)
   */
  async moveToHired(candidateId: number | string) {
    await this.changeCandidateStatusViaMenu(candidateId, 'Đã tuyển dụng');
  }

  /**
   * Lọc ứng viên có điểm AI cao qua query parameter hoặc bộ lọc
   */
  async filterByAiScore(minScore = 80) {
    await this.goto(`minAiScore=${minScore}`);
    await this.waitForLoadingGone();
  }

  /**
   * Xuất danh sách ứng viên ra file Excel / CSV
   */
  async exportExcel() {
    await expect(this.exportBtn).toBeVisible({ timeout: 15_000 });
    await this.exportBtn.click();

    await expect(this.exportModal).toBeVisible({ timeout: 10_000 });
    
    // Bắt sự kiện tải file
    const downloadPromise = this.page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
    await this.exportConfirmBtn.click();
    return await downloadPromise;
  }

  /**
   * Kiểm tra thông tin ứng viên hiển thị trên bảng/cột
   */
  async expectCandidateVisible(candidateName: string) {
    const item = this.page.getByText(candidateName).first();
    await expect(item).toBeVisible({ timeout: 15_000 });
  }
}
