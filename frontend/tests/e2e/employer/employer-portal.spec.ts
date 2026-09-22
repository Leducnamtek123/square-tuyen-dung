import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupEmployerApiMocks,
  MOCK_JOBS,
  MOCK_QUESTIONS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_EMPLOYER } from '../../helpers/auth';

test.describe('Employer Portal - Authentication & Route Protection', () => {
  test.beforeEach(async ({ page }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'EMPLOYER',
      id: DEFAULT_EMPLOYER.id,
      email: DEFAULT_EMPLOYER.email,
      fullName: DEFAULT_EMPLOYER.fullName,
      companyId: DEFAULT_EMPLOYER.companyId,
      companyName: DEFAULT_EMPLOYER.companyName,
    });
    await setupEmployerApiMocks(page);
  });

  test('Route protection redirects unauthenticated user from protected routes to employer login', async ({ page }) => {
    // Navigate without injecting session cookies
    await page.goto('/employer/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login(\?.*)?$/, { timeout: 20_000 });
    await expect(page.locator('input[name="email"], input#email').first()).toBeVisible({ timeout: 15_000 });
  });

  test('Employer can log in via /employer/login and access dashboard', async ({ page }) => {
    await page.goto('/employer/login');

    const emailInput = page.locator('input[name="email"], input#email').first();
    const passwordInput = page.locator('input[name="password"], input#password').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15_000 });
    await emailInput.fill(DEFAULT_EMPLOYER.email || '');
    await passwordInput.fill('SecurePassword123!');
    await submitBtn.click();

    // After login, employer should be redirected to employer dashboard
    await expect(page).toHaveURL(/.*\/dashboard|.*\/bang-dieu-khien/, { timeout: 20_000 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Employer Portal - Dashboard & Analytics', () => {
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
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can access dashboard and view recruitment KPI overview', async ({ page }) => {
    await page.goto('/employer/dashboard');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });

    // Verify KPI statistics cards render (Total job posts, applications, etc.)
    await expect(
      page.locator('text=/tin tuyển dụng|hồ sơ ứng tuyển|phỏng vấn/i').first()
    ).toBeVisible({ timeout: 20_000 });

    // Verify recent applications widget displays candidate record
    await expect(page.getByText('Nguyen Van Ung Vien').first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Employer Portal - Job Posts Management', () => {
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
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can view job posts management page and navigate to create', async ({ page }) => {
    await page.goto('/employer/job-posts');

    // Verify job post table or cards render
    await expect(page.getByText(MOCK_JOBS[0].job_name).first()).toBeVisible({ timeout: 20_000 });

    // Verify "Tạo tin tuyển dụng" / "Đăng tin" button exists and click it
    const createJobBtn = page.locator('button, a').filter({ hasText: /tạo tin|đăng tin|thêm tin/i }).first();
    await expect(createJobBtn).toBeVisible({ timeout: 15_000 });
    await expect(createJobBtn).toBeEnabled({ timeout: 15_000 });
    await createJobBtn.click();

    // Verify navigation to job creation form
    await expect(page).toHaveURL(/.*\/job-posts\/create|.*\/tin-tuyen-dung\/tao-moi/, { timeout: 15_000 });
  });

  test('Employer can fill job post form on /employer/job-posts/create', async ({ page }) => {
    await page.goto('/employer/job-posts/create');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });

    // Fill job name
    const jobTitleInput = page.locator('input#jobName, input[name="jobName"]').first();
    await expect(jobTitleInput).toBeVisible({ timeout: 20_000 });
    await jobTitleInput.fill('AI & Machine Learning Engineer');

    // Fill quantity and salary
    const quantityInput = page.locator('input#quantity, input[name="quantity"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
    }

    const salaryMinInput = page.locator('input#salaryMin, input[name="salaryMin"]').first();
    if (await salaryMinInput.isVisible()) {
      await salaryMinInput.fill('30000000');
    }

    const salaryMaxInput = page.locator('input#salaryMax, input[name="salaryMax"]').first();
    if (await salaryMaxInput.isVisible()) {
      await salaryMaxInput.fill('50000000');
    }

    // Verify submit button exists
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /đăng tin|lưu|tạo tin/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test('Employer can view and edit existing job post on /employer/job-posts/101/edit', async ({ page }) => {
    await page.goto('/employer/job-posts/101/edit');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });

    // Form should pre-populate with existing job post title
    const jobTitleInput = page.locator('input#jobName, input[name="jobName"]').first();
    await expect(jobTitleInput).toBeVisible({ timeout: 20_000 });
    await expect(jobTitleInput).toHaveValue(MOCK_JOBS[0].job_name, { timeout: 15_000 });

    // Edit title
    await jobTitleInput.fill('Senior Fullstack Engineer (React & Django) - Updated');

    // Save changes
    const saveBtn = page.locator('button[type="submit"], button').filter({ hasText: /lưu|cập nhật|đăng tin/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify redirected back to job posts
    await expect(page).toHaveURL(/.*\/job-posts|.*\/tin-tuyen-dung/, { timeout: 20_000 });
  });
});

test.describe('Employer Portal - Candidates & Applied Profiles', () => {
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
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can view candidate applications on /employer/applied-profiles', async ({ page }) => {
    await page.goto('/employer/applied-profiles');

    // Verify candidate application records are listed
    await expect(page.getByText('Nguyen Van Ung Vien').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Tran Thi Phu Hop').first()).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can filter candidate applications by status', async ({ page }) => {
    // Navigate with status query param for Suitable candidates (status = 2)
    await page.goto('/employer/applied-profiles?status=2');
    await expect(page.getByText('Tran Thi Phu Hop').first()).toBeVisible({ timeout: 20_000 });

    // Navigate with status query param for Interview candidates (status = 4)
    await page.goto('/employer/applied-profiles?status=4');
    await expect(page.getByText('Le Van Phong Van').first()).toBeVisible({ timeout: 20_000 });

    // Navigate with status query param for Rejected candidates (status = 6)
    await page.goto('/employer/applied-profiles?status=6');
    await expect(page.getByText('Pham Thi Tu Choi').first()).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can browse potential candidates on /employer/candidates', async ({ page }) => {
    await page.goto('/employer/candidates');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
    // Verify candidate search or candidate profile card is rendered
    await expect(
      page.locator('text=/tìm ứng viên|ứng viên tiềm năng|ứng viên/i').first()
    ).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Employer Portal - Question Bank & Interview Scripts', () => {
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
    await setupEmployerApiMocks(page);
    await injectSession(context, DEFAULT_EMPLOYER);
  });

  test('Employer can view question bank on /employer/question-bank', async ({ page }) => {
    await page.goto('/employer/question-bank');

    await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });

    // Verify mock questions text is visible
    await expect(page.getByText(MOCK_QUESTIONS[0].text).first()).toBeVisible({ timeout: 20_000 });
  });

  test('Employer can open dialog and create a new interview question', async ({ page }) => {
    await page.goto('/employer/question-bank');

    // Click "Thêm câu hỏi"
    const addBtn = page.locator('button').filter({ hasText: /thêm câu hỏi|tạo câu hỏi/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 20_000 });
    await addBtn.click();

    // Dialog should appear
    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // Fill question text
    const textInput = dialog.locator('textarea, input[type="text"]').first();
    await textInput.fill('Làm thế nào để tối ưu hoá hiệu năng xử lý âm thanh WebRTC?');

    // Click save button in dialog
    const saveBtn = dialog.locator('button').filter({ hasText: /tạo|lưu|xác nhận/i }).first();
    await saveBtn.click();

    // Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });
});
