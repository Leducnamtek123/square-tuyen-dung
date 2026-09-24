import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * UserRbacPage - Page Object cho phân hệ Quản trị Người dùng & Phân quyền RBAC
 * Đường dẫn: /admin/users
 */
export class UserRbacPage extends BasePage {
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly roleFilterSelect: Locator;
  readonly tableRows: Locator;

  // Dialog xác nhận nếu có
  readonly confirmDialog: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByText(/quản lý tài khoản|người dùng/i).first();
    this.searchInput = page.getByPlaceholder(/tìm kiếm theo tên, email/i).or(page.getByPlaceholder(/tìm kiếm/i)).first();
    this.roleFilterSelect = page.locator('label:has-text("Vai trò") + .MuiInputBase-root').or(
      page.getByRole('combobox', { name: /vai trò/i })
    ).first();
    this.tableRows = page.locator('tbody tr');

    this.confirmDialog = page.getByRole('dialog');
    this.confirmBtn = page.getByTestId('admin-confirm-btn');
  }

  /**
   * Điều hướng tới trang Quản lý Người dùng
   */
  async gotoUsers() {
    await this.goto('/admin/users');
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận danh sách người dùng nạp thành công
   */
  async expectUsersLoaded() {
    await expect(this.tableRows.first()).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Tìm hàng (row) theo email hoặc họ tên người dùng
   */
  getUserRow(identifier: string): Locator {
    return this.tableRows.filter({ hasText: identifier }).first();
  }

  /**
   * Kiểm tra người dùng có hiển thị trong danh sách
   */
  async expectUserInTable(identifier: string) {
    const row = this.getUserRow(identifier);
    await expect(row).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Tìm kiếm người dùng theo email hoặc tên
   */
  async searchUser(keyword: string) {
    if (await this.searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.searchInput.fill(keyword);
      await this.page.waitForTimeout(600);
      await this.waitForLoadingGone();
    }
  }

  /**
   * Lọc danh sách người dùng theo vai trò
   */
  async filterByRole(roleLabel: string) {
    if (await this.roleFilterSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.roleFilterSelect.click();
      const option = this.page.getByRole('option', { name: new RegExp(roleLabel, 'i') }).first();
      await option.click();
      await this.waitForLoadingGone();
    }
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng qua Switch Toggle
   */
  async toggleUserStatus(identifier?: string) {
    const row = identifier ? this.getUserRow(identifier) : this.tableRows.first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const toggleSwitch = row.getByTestId('toggle-user-active-switch').or(row.locator('input[type="checkbox"]')).first();
    await expect(toggleSwitch).toBeAttached({ timeout: 10_000 });
    await toggleSwitch.click({ force: true });
    await this.waitForLoadingGone();
  }

  /**
   * Thay đổi vai trò người dùng (Change Role RBAC)
   */
  async changeRole(identifier: string | undefined, newRole: 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER') {
    const row = identifier ? this.getUserRow(identifier) : this.tableRows.first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const roleSelect = row.getByTestId('user-role-select').or(row.getByRole('combobox')).first();
    await expect(roleSelect).toBeVisible({ timeout: 10_000 });
    await roleSelect.click();

    // Map tên hiển thị của vai trò
    const roleLabels: Record<string, RegExp> = {
      ADMIN: /quản trị viên|admin/i,
      EMPLOYER: /nhà tuyển dụng|employer/i,
      JOB_SEEKER: /ứng viên|job seeker/i,
    };

    const targetOption = this.page.getByRole('option', { name: roleLabels[newRole] }).first();
    await expect(targetOption).toBeVisible({ timeout: 10_000 });
    await targetOption.click();
    await this.waitForLoadingGone();
  }

  /**
   * Kiểm chứng trạng thái hoạt động của người dùng
   */
  async expectUserStatus(identifier: string, statusPattern: string | RegExp) {
    const row = this.getUserRow(identifier);
    await expect(row).toBeVisible({ timeout: 15_000 });

    const statusBadge = row.locator('.MuiChip-root, span').filter({ hasText: statusPattern }).first();
    await expect(statusBadge).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Kiểm chứng vai trò hiển thị của người dùng
   */
  async expectUserRole(identifier: string, rolePattern: string | RegExp) {
    const row = this.getUserRow(identifier);
    await expect(row).toBeVisible({ timeout: 15_000 });

    const roleChip = row.getByTestId('user-role-select').locator('.MuiChip-root, span').filter({ hasText: rolePattern }).first();
    await expect(roleChip).toBeVisible({ timeout: 10_000 });
  }
}
