import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { setupAllApiMocks } from '../../mocks/index';
import { setupDomainAuthMocks } from '../../mocks/mock-auth';

test.describe('Phân hệ 01-Auth: Đăng ký ứng viên (AUTH-01)', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
    await setupDomainAuthMocks(page);
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('AUTH-01: Đăng ký tài khoản Ứng viên mới thành công', async ({ page }) => {
    const [registerResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/auth/job-seeker/register/') && (res.status() === 201 || res.status() === 200)
      ),
      registerPage.fillCandidateRegisterForm({
        fullName: 'Nguyen Thi Ung Vien E2E',
        email: 'candidate.register.success@infohr.vn',
        password: 'ValidCandidatePass123!',
        confirmPassword: 'ValidCandidatePass123!',
      }).then(() => registerPage.submit()),
    ]);

    expect(registerResponse.status()).toBe(201);
    await registerPage.expectRegistrationSuccess();
  });

  test('AUTH-01 Negative: Xác nhận mật khẩu không khớp hiển thị lỗi validation', async () => {
    await registerPage.fillCandidateRegisterForm({
      fullName: 'Nguyen Thi Ung Vien',
      email: 'mismatch.pass@infohr.vn',
      password: 'ValidPassword123!',
      confirmPassword: 'NotMatchingPassword456!',
    });
    await registerPage.submit();

    await registerPage.expectValidationError(/không khớp/i);
  });

  test('AUTH-01 Negative: Mật khẩu dưới 8 ký tự bị chặn bởi client validation', async () => {
    await registerPage.fillCandidateRegisterForm({
      fullName: 'Nguyen Thi Ung Vien',
      email: 'short.pass@infohr.vn',
      password: '123',
      confirmPassword: '123',
    });
    await registerPage.submit();

    await registerPage.expectValidationError(/ít nhất 8 ký tự|quy định mật khẩu/i);
  });

  test('AUTH-01 Negative: Đăng ký với email đã tồn tại hiển thị lỗi email trùng lặp', async () => {
    await registerPage.fillCandidateRegisterForm({
      fullName: 'Nguyen Thi Ung Vien',
      email: 'existing.duplicate@infohr.vn',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    });
    await registerPage.submit();

    await registerPage.expectDuplicateEmailError(/đã được|tồn tại/i);
  });
});
