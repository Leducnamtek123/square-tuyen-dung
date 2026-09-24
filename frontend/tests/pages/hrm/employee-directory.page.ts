import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  status?: string;
  employmentType?: string;
  joinDate?: string;
  bankName?: string;
  bankAccount?: string;
  taxId?: string;
  socialInsuranceId?: string;
  dependentsCount?: number;
}

/**
 * EmployeeDirectoryPage - Page Object cho phân hệ Quản lý Hồ sơ Nhân sự (Employee Directory)
 * Đường dẫn: /employer/hrm/employees
 */
export class EmployeeDirectoryPage extends BasePage {
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly deptFilterSelect: Locator;
  readonly statusFilterSelect: Locator;
  readonly createEmployeeBtn: Locator;
  readonly employeeTable: Locator;
  readonly employeeRows: Locator;

  // Dialog Tạo / Sửa Nhân Sự
  readonly employeeDialog: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly departmentSelect: Locator;
  readonly designationSelect: Locator;
  readonly statusSelect: Locator;
  readonly employmentTypeSelect: Locator;
  readonly joinDateInput: Locator;
  readonly saveEmployeeBtn: Locator;
  readonly cancelEmployeeBtn: Locator;

  // Drawer Chi tiết Nhân Sự
  readonly detailDrawer: Locator;
  readonly closeDrawerBtn: Locator;

  // Delete Dialog
  readonly deleteDialog: Locator;
  readonly confirmDeleteBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByText(/hồ sơ nhân sự 360°|quản lý nhân sự/i).first();
    this.searchInput = page.getByPlaceholder(/tìm theo tên/i);
    this.deptFilterSelect = page.locator('label:has-text("Phòng ban") + .MuiInputBase-root').or(
      page.getByRole('combobox', { name: /phòng ban/i })
    );
    this.statusFilterSelect = page.locator('label:has-text("Trạng thái làm việc") + .MuiInputBase-root').or(
      page.getByRole('combobox', { name: /trạng thái/i })
    );
    this.createEmployeeBtn = page.getByRole('button', { name: /tạo hồ sơ mới|thêm nhân viên|tạo mới/i }).first();
    this.employeeTable = page.locator('table');
    this.employeeRows = page.locator('tbody tr');

    // Dialog elements
    this.employeeDialog = page.getByRole('dialog');
    this.firstNameInput = page.getByLabel(/^Họ đệm/i);
    this.lastNameInput = page.getByLabel(/^Tên$/i);
    this.emailInput = page.getByLabel(/^Email liên hệ/i);
    this.phoneInput = page.getByLabel(/^Số điện thoại/i);
    this.departmentSelect = this.employeeDialog.locator('label:has-text("Phòng ban") + .MuiInputBase-root');
    this.designationSelect = this.employeeDialog.locator('label:has-text("Chức danh") + .MuiInputBase-root');
    this.statusSelect = this.employeeDialog.locator('label:has-text("Trạng thái") + .MuiInputBase-root');
    this.employmentTypeSelect = this.employeeDialog.locator('label:has-text("Hình thức làm việc") + .MuiInputBase-root');
    this.joinDateInput = page.getByLabel(/^Ngày vào làm/i);
    this.saveEmployeeBtn = page.getByRole('button', { name: /tạo hồ sơ|lưu cập nhật/i });
    this.cancelEmployeeBtn = page.getByRole('button', { name: /^Hủy$/i });

    // Detail drawer
    this.detailDrawer = page.locator('.MuiDrawer-paper');
    this.closeDrawerBtn = page.getByRole('button', { name: /^Đóng$/i }).or(page.locator('button[aria-label="Đóng"]'));

    // Delete dialog
    this.deleteDialog = page.getByRole('dialog').filter({ hasText: /xác nhận xóa/i });
    this.confirmDeleteBtn = page.getByRole('button', { name: /xóa nhân sự|xác nhận xóa/i });
  }

  /**
   * Điều hướng tới danh sách nhân sự
   */
  async gotoEmployees() {
    await this.goto('/employer/hrm/employees');
    await this.waitForLoadingGone();
  }

  /**
   * Mở modal Tạo Hồ sơ Mới
   */
  async openCreateEmployeeModal() {
    await this.createEmployeeBtn.click();
    await expect(this.employeeDialog).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Điền form tạo mới / chỉnh sửa hồ sơ nhân viên
   */
  async fillEmployeeForm(data: EmployeeFormData) {
    if (data.firstName) {
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.department) {
      await this.departmentSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.department, 'i') }).first().click();
    }
    if (data.designation) {
      await this.designationSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.designation, 'i') }).first().click();
    }
    if (data.status) {
      await this.statusSelect.click();
      await this.page.getByRole('option', { name: new RegExp(data.status, 'i') }).first().click();
    }
  }

  /**
   * Bấm lưu / tạo hồ sơ nhân sự
   */
  async submitEmployeeForm() {
    await this.saveEmployeeBtn.click();
  }

  /**
   * Quy trình tạo nhanh một nhân sự mới
   */
  async createEmployee(data: EmployeeFormData) {
    await this.openCreateEmployeeModal();
    await this.fillEmployeeForm(data);
    await this.submitEmployeeForm();
    await this.waitForLoadingGone();
  }

  /**
   * Tìm kiếm nhân sự theo từ khóa (Mã NV, Họ tên, Email)
   */
  async searchEmployee(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400); // Debounce
  }

  /**
   * Lọc nhân sự theo phòng ban
   */
  async filterByDepartment(deptName: string) {
    await this.deptFilterSelect.click();
    await this.page.getByRole('option', { name: new RegExp(deptName, 'i') }).first().click();
    await this.waitForLoadingGone();
  }

  /**
   * Lọc nhân sự theo trạng thái làm việc
   */
  async filterByStatus(statusName: string) {
    await this.statusFilterSelect.click();
    await this.page.getByRole('option', { name: new RegExp(statusName, 'i') }).first().click();
    await this.waitForLoadingGone();
  }

  /**
   * Mở Drawer xem chi tiết hồ sơ 360 độ của một nhân viên
   */
  async openEmployeeDrawer(identifier: string) {
    const row = this.employeeRows.filter({ hasText: identifier }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    const viewBtn = row.locator('button[aria-label="Thao tác"]').first();
    await viewBtn.click();
    await expect(this.detailDrawer).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Đóng Drawer chi tiết
   */
  async closeEmployeeDrawer() {
    if (await this.closeDrawerBtn.first().isVisible({ timeout: 2000 })) {
      await this.closeDrawerBtn.first().click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Mở modal chỉnh sửa nhân sự
   */
  async openEditEmployeeModal(identifier: string) {
    const row = this.employeeRows.filter({ hasText: identifier }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    // Icon thứ 4 là Edit
    const editBtn = row.locator('button[aria-label="Thao tác"]').nth(3);
    await editBtn.click();
    await expect(this.employeeDialog).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Cập nhật trạng thái thôi việc / chấm dứt hợp đồng (TERMINATED)
   */
  async terminateEmployee(identifier: string) {
    await this.openEditEmployeeModal(identifier);
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: /đã chấm dứt|terminated/i }).first().click();
    await this.submitEmployeeForm();
    await this.waitForLoadingGone();
  }

  /**
   * Xác nhận nhân sự có xuất hiện trong bảng
   */
  async expectEmployeeInTable(nameOrCode: string) {
    const el = this.employeeTable.getByText(new RegExp(nameOrCode, 'i')).first();
    await expect(el).toBeVisible({ timeout: 15_000 });
  }
}
