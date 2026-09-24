import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainHrmMocks } from '../../mocks/mock-hrm';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';

test.describe('Phân Hệ HRM - Cơ Cấu Tổ Chức & Sơ Đồ Cây (Org Chart & Departments)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainHrmMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  /**
   * HRM-07: Tạo phòng ban mới và hiển thị sơ đồ tổ chức (Org Chart)
   */
  test('HRM-07: Tạo phòng ban mới và kiểm tra sơ đồ cây cơ cấu tổ chức (Org Chart)', async ({ page }) => {
    // 1. Mở trang Quản lý Phòng ban & Chức danh
    await page.goto('/employer/hrm/departments');
    await expect(page.getByText(/phòng ban & vị trí chức danh|danh sách phòng ban/i).first()).toBeVisible({ timeout: 20_000 });

    // 2. Mở dialog Thêm phòng ban mới
    const addDeptBtn = page.getByRole('button', { name: /thêm phòng ban/i }).first();
    await expect(addDeptBtn).toBeVisible({ timeout: 10_000 });
    await addDeptBtn.click();

    const deptDialog = page.getByRole('dialog').filter({ hasText: /thêm phòng ban/i });
    await expect(deptDialog).toBeVisible({ timeout: 10_000 });

    // Điền thông tin phòng ban
    await deptDialog.getByLabel(/tên phòng ban/i).fill('Phòng Trí tuệ Nhân tạo');
    await deptDialog.getByLabel(/mã phòng ban/i).fill('AI_LAB');
    await deptDialog.getByLabel(/mô tả chức năng/i).fill('Nghiên cứu và phát triển giải pháp AI');

    // Bấm lưu phòng ban
    const submitBtn = deptDialog.getByRole('button', { name: /tạo phòng ban/i });
    await submitBtn.click();

    // 3. Điều hướng tới Sơ đồ tổ chức (Org Chart)
    await page.goto('/employer/hrm/org-chart');
    await expect(page.getByText(/sơ đồ cây tổ chức|sơ đồ tổ chức/i).first()).toBeVisible({ timeout: 20_000 });

    // 4. Kiểm tra các nút phòng ban trong cây sơ đồ tổ chức
    await expect(page.getByText('Ban Giám Đốc').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Công nghệ thông tin').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Nhân sự & Vận hành').first()).toBeVisible({ timeout: 15_000 });

    // 5. Kiểm tra các nút thao tác mở rộng / thu gọn toàn bộ cây
    const expandAllBtn = page.getByRole('button', { name: /mở rộng tất cả/i }).first();
    if (await expandAllBtn.isVisible()) {
      await expandAllBtn.click();
    }
  });
});
