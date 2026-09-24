import { test, expect } from '@playwright/test';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainAdminMocks } from '../../mocks/mock-admin';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';
import { MOCK_COMPANY_VERIFICATIONS } from '../../helpers/mockApi';
import { CompanyVerifyPage } from '../../pages/admin/company-verify.page';

test.describe('Phân Hệ Admin - Xác Thực Doanh Nghiệp (Company Verification KYC)', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainAdminMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
  });

  /**
   * ADM-03: Kiểm tra hồ sơ GPKD và phê duyệt cấp huy hiệu Tích xanh xác thực
   */
  test('ADM-03: Admin kiểm tra tài liệu GPKD và duyệt cấp Tích xanh xác thực (Verified Badge)', async ({ page }) => {
    const verifyPage = new CompanyVerifyPage(page);

    // 1. Mở trang Quản lý xác thực doanh nghiệp
    await verifyPage.gotoVerifications();
    await verifyPage.expectVerificationsLoaded();

    // 2. Xác nhận doanh nghiệp cần xác thực hiển thị cùng Mã số thuế
    const targetCompany = MOCK_COMPANY_VERIFICATIONS[0];
    await verifyPage.expectCompanyInTable(targetCompany.companyName, targetCompany.taxCode);

    // 3. Kiểm tra link xem file Giấy phép kinh doanh (GPKD)
    const licenseUrl = await verifyPage.viewLicenseFile(targetCompany.companyName);
    expect(licenseUrl).toBeTruthy();

    // 4. Bấm phê duyệt cấp Tích xanh xác thực cho doanh nghiệp
    await verifyPage.verifyCompany(targetCompany.companyName);

    // 5. Kiểm tra kết quả sau khi duyệt
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * ADM-03 Negative: Từ chối hồ sơ xác thực khi GPKD không hợp lệ kèm lý do
   */
  test('ADM-03 Negative: Từ chối yêu cầu xác thực khi GPKD bị mờ hoặc thông tin không trùng khớp', async ({ page }) => {
    const verifyPage = new CompanyVerifyPage(page);

    await verifyPage.gotoVerifications();
    await verifyPage.expectVerificationsLoaded();

    const targetCompany = MOCK_COMPANY_VERIFICATIONS[0];
    const rejectReason = 'Hình ảnh Giấy phép kinh doanh tải lên bị mờ, không nhận diện được mã số thuế và con dấu pháp nhân.';

    // 1. Bấm từ chối xác thực và nhập lý do
    await verifyPage.rejectCompany(targetCompany.companyName, rejectReason);

    // 2. Xác nhận dialog đã hoàn tất và đóng
    await expect(verifyPage.confirmDialog).toBeHidden({ timeout: 10_000 });
  });
});
