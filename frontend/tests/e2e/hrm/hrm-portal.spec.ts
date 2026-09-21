import { test, expect } from '@playwright/test';
import { setupCommonApiMocks, setupAuthApiMocks, setupHrmApiMocks, MOCK_HRM_EMPLOYEES } from '../../helpers/mockApi';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';

test.describe('HRM Portal E2E Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupHrmApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can view employee records on /employer/hrm/employees', async ({ page }) => {
    await page.goto('/employer/hrm/employees');

    // Check employee list data rendering
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].full_name).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(MOCK_HRM_EMPLOYEES[0].employee_code).first()).toBeVisible();

    // Check action controls (Add employee button, Search input)
    const addEmployeeBtn = page.locator('button').filter({ hasText: /thêm nhân viên|tạo mới|add employee/i }).first();
    await expect(addEmployeeBtn).toBeVisible();
  });

  test('Employer can view attendance management on /employer/hrm/attendances', async ({ page }) => {
    await page.goto('/employer/hrm/attendances');

    // Verify page loads without crashing and renders attendance container
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/chấm công|điểm danh|attendance|bảng công/i).first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can view payroll list on /employer/hrm/payroll', async ({ page }) => {
    await page.goto('/employer/hrm/payroll');

    // Verify payroll view rendered
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/lương|payroll|phiếu lương|bảng lương/i).first()
    ).toBeVisible({ timeout: 20_000 });
  });
});
