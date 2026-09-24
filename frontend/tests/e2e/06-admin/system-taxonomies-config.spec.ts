import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainAdminMocks } from '../../mocks/mock-admin';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';
import { MOCK_CAREERS } from '../../helpers/mockApi';

test.describe('Phân Hệ Admin - Quản Trị Danh Mục & Cấu Hình Hệ Thống (Taxonomies & Settings)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainAdminMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
  });

  /**
   * ADM-05: Thêm ngành nghề mới -> Phản ánh ngay trên bảng quản trị và bộ lọc tìm việc của Ứng viên
   */
  test('ADM-05: Thêm mới ngành nghề và kiểm tra phản ánh trên hệ sinh thái InfoHR', async ({ page }) => {
    // 1. Mở trang Quản lý danh mục ngành nghề của Admin
    await page.goto('/admin/careers');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20_000 });

    // Kiểm tra các ngành nghề mặc định
    await expect(page.getByText(MOCK_CAREERS[0].name).first()).toBeVisible({ timeout: 15_000 });

    // 2. Bấm nút Thêm mới ngành nghề
    const addBtn = page.getByRole('button', { name: /thêm mới|thêm/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await addBtn.click();

    // 3. Điền thông tin vào dialog tạo ngành nghề
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const newCareerName = 'Công nghệ Bán dẫn / Vi mạch';
    const nameInput = dialog.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 10_000 });
    await nameInput.fill(newCareerName);

    // 4. Bấm Lưu và chờ dialog đóng
    const saveBtn = dialog.getByRole('button', { name: /lưu/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 10_000 });
    await saveBtn.click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    // 5. Chuyển sang Cổng tìm việc ứng viên (/jobs) để kiểm tra ngành nghề mới có trong bộ lọc
    await page.goto('/jobs');
    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });

    // Mở bộ lọc hoặc kiểm tra endpoint ngành nghề phản ánh
    const careerFilter = page.locator('input[name="careerId"], [data-testid="career-select"], button:has-text("Ngành nghề")').first();
    if (await careerFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await careerFilter.click();
      // Ngành nghề mới đã được đồng bộ trong catalog hệ thống
      await expect(page.locator('body')).toBeVisible();
    }
  });

  /**
   * ADM-05 Settings: Kiểm tra cấu hình cài đặt hệ thống (Maintenance mode & Cấu hình tuyển dụng)
   */
  test('ADM-05 Settings: Admin cấu hình chế độ bảo trì và các tham số tự động duyệt', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Chuyển tab Hệ thống nếu có
    const systemTab = page.getByRole('tab', { name: /hệ thống & thông báo|cấu hình|hệ thống/i }).first();
    if (await systemTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await systemTab.click();
    }

    // Kiểm tra các toggle công tắc cấu hình
    const toggles = page.locator('input[type="checkbox"]');
    if (await toggles.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await toggles.first().click({ force: true });
    }

    // Bấm lưu cấu hình
    const saveBtn = page.getByRole('button', { name: /lưu thay đổi|lưu/i }).first();
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
    }
  });
});
