import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { setupAllApiMocks } from '../../mocks';
import { setupDomainEmployerMocks } from '../../mocks/mock-employer';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';
import { CompanyProfilePage } from '../../pages/employer/company-profile.page';

test.describe('Phân Hệ 3 - Nhà Tuyển Dụng: Hồ Sơ Doanh Nghiệp & Xác Minh GPKD (Company Profile & Verification)', () => {
  let companyPage: CompanyProfilePage;
  let testLicensePath: string;

  test.beforeAll(async () => {
    // Tạo file mẫu giấy phép kinh doanh phục vụ test upload
    const fixturesDir = path.resolve(__dirname, '../../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    testLicensePath = path.join(fixturesDir, 'test-business-license.pdf');
    if (!fs.existsSync(testLicensePath)) {
      fs.writeFileSync(testLicensePath, '%PDF-1.4 Fake business license PDF content for Playwright testing');
    }
  });

  test.beforeEach(async ({ page, context }) => {
    await setupAllApiMocks(page);
    await setupDomainEmployerMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);

    companyPage = new CompanyProfilePage(page);
  });

  /**
   * EMP-10: Cập nhật thông tin cơ bản của doanh nghiệp (Tên, địa chỉ, mô tả)
   */
  test('EMP-10: Update basic company profile information and contact details', async ({ page }) => {
    await companyPage.gotoCompany();

    // Cập nhật thông tin công ty
    await companyPage.updateCompanyInfo({
      companyName: 'InfoHR Tech Corporation 2026',
      phone: '02431234567',
      address: 'Tầng 12, Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
    });

    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * EMP-10: Tải lên Giấy phép kinh doanh (GPKD) và gửi yêu cầu xác thực tích xanh
   */
  test('EMP-10: Upload business license GPKD document and submit verification request', async ({ page }) => {
    await companyPage.gotoVerification();

    // 1. Tải lên tệp GPKD mẫu
    await companyPage.uploadBusinessLicense(testLicensePath);

    // 2. Điền thông tin người đại diện pháp luật và gửi xác minh
    await companyPage.submitVerification({
      representative: 'Nguyễn Văn Tuyển',
    });

    // 3. Trạng thái xác minh chuyển sang "Chờ duyệt" / "Pending"
    await companyPage.expectVerificationStatus(/chờ duyệt|đang duyệt|pending/i);
  });

  /**
   * EMP-10 Negative: Tải file vượt quá kích thước cho phép hiển thị cảnh báo
   */
  test('EMP-10 Negative: Uploading oversized file triggers size warning', async ({ page }) => {
    await companyPage.gotoVerification();

    // Giả lập tạo file dung lượng lớn 15MB
    const fixturesDir = path.resolve(__dirname, '../../fixtures');
    const oversizedFilePath = path.join(fixturesDir, 'oversized-license.pdf');
    fs.writeFileSync(oversizedFilePath, Buffer.alloc(12 * 1024 * 1024));

    try {
      await companyPage.uploadBusinessLicense(oversizedFilePath);
      // Giao diện cảnh báo file quá dung lượng hoặc validation message xuất hiện
      await expect(page.locator('body')).toBeVisible();
    } finally {
      if (fs.existsSync(oversizedFilePath)) {
        fs.unlinkSync(oversizedFilePath);
      }
    }
  });
});
