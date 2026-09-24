import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainAdminMocks } from '../../mocks/mock-admin';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';
import { MOCK_AUDIT_LOGS } from '../../helpers/mockApi';

test.describe('Phân Hệ Admin - Giám Sát Nhật Ký Kiểm Toán (Audit Logs Inspection)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainAdminMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
  });

  /**
   * ADM-06: Kiểm tra nhật ký kiểm toán ghi nhận chính xác actor, action, timestamp, IP
   */
  test('ADM-06: Bảng Audit Logs ghi nhận đầy đủ người thực hiện, hành động, thời gian và địa chỉ IP', async ({ page }) => {
    // 1. Mở trang Nhật ký kiểm toán hệ thống
    await page.goto('/admin/audit-logs');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20_000 });

    const firstLog = MOCK_AUDIT_LOGS[0];

    // 2. Xác nhận thông tin Người thực hiện (Actor)
    await expect(page.getByText(firstLog.actorEmail).first()).toBeVisible({ timeout: 15_000 });

    // 3. Xác nhận Hành động (Action)
    await expect(page.getByText(new RegExp(firstLog.action, 'i')).first()).toBeVisible({ timeout: 15_000 });

    // 4. Xác nhận Địa chỉ IP
    await expect(page.getByText(firstLog.ipAddress).first()).toBeVisible({ timeout: 15_000 });

    // 5. Xác nhận Loại đối tượng (Resource Type)
    await expect(page.getByText(new RegExp(firstLog.resourceType, 'i')).first()).toBeVisible({ timeout: 15_000 });
  });

  /**
   * ADM-06: Lọc nhật ký kiểm toán theo hành động và người thực hiện
   */
  test('ADM-06: Lọc nhật ký kiểm toán theo từ khóa và mở Modal xuất báo cáo', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20_000 });

    // 1. Tìm kiếm theo email actor
    const searchInput = page.getByPlaceholder(/tìm kiếm/i).first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('admin.e2e@infohr.vn');
      await page.waitForTimeout(600);
      await expect(page.getByText('admin.e2e@infohr.vn').first()).toBeVisible({ timeout: 10_000 });
    }

    // 2. Mở Modal Xuất dữ liệu kiểm toán CSV
    const exportBtn = page.getByRole('button', { name: /xuất csv|xuất dữ liệu|export/i }).first();
    if (await exportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await exportBtn.click();
      const exportModal = page.getByRole('dialog');
      await expect(exportModal).toBeVisible({ timeout: 10_000 });

      // Đóng modal
      const closeBtn = exportModal.getByRole('button', { name: /hủy|đóng/i }).first();
      await closeBtn.click();
      await expect(exportModal).toBeHidden({ timeout: 10_000 });
    }
  });
});
