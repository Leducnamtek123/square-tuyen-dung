import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupCvBuilderApiMocks,
  setupCandidateProfileApiMocks,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_CANDIDATE } from '../../helpers/auth';

test.describe('CV Builder Online E2E Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, { role: 'JOB_SEEKER' });
    await setupCandidateProfileApiMocks(page);
    await setupCvBuilderApiMocks(page);
    await injectSession(context, DEFAULT_CANDIDATE);
  });

  test('User can open CV Builder editor page and see editor components', async ({ page }) => {
    await page.goto('/cv-builder');

    // Live preview canvas container must be visible
    const previewCanvas = page.locator('#cv-print-area').first();
    await expect(previewCanvas).toBeVisible({ timeout: 20_000 });

    // Sidebar with Form title or tabs must be visible
    await expect(page.getByText('Chỉnh sửa hồ sơ CV').first()).toBeVisible({ timeout: 15_000 });

    // Primary action buttons (Save / Download PDF) must be rendered and visible
    const downloadPdfBtn = page.locator('[data-tour="cv-export"]').or(page.getByRole('button', { name: /tải pdf/i })).first();
    await expect(downloadPdfBtn).toBeVisible({ timeout: 15_000 });
  });

  test('User can edit personal info and see live preview update', async ({ page }) => {
    await page.goto('/cv-builder');

    // Wait for the editor and initial candidate profile to load into preview
    const previewArea = page.locator('#cv-print-area');
    await expect(previewArea).toBeVisible({ timeout: 20_000 });
    await expect(previewArea.getByText(/nguyen van|họ và tên/i).first()).toBeVisible({ timeout: 15_000 });

    // Fill Full Name input
    const nameInput = page.getByLabel(/họ và tên \*/i).or(page.getByPlaceholder(/VD: NGUYỄN VĂN A/i)).first();
    await expect(nameInput).toBeVisible({ timeout: 15_000 });
    await nameInput.fill('NGUYỄN VĂN TESTER');

    // Fill Job Title input
    const titleInput = page.getByLabel(/vị trí ứng tuyển \*/i).first();
    await titleInput.fill('Lead Fullstack Engineer');

    // Verify live preview area updates with typed name and title
    await expect(previewArea.getByText('NGUYỄN VĂN TESTER').first()).toBeVisible({ timeout: 10_000 });
    await expect(previewArea.getByText('Lead Fullstack Engineer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('User can add and edit work experience and education', async ({ page }) => {
    await page.goto('/cv-builder');
    await expect(page.locator('#cv-print-area')).toBeVisible({ timeout: 20_000 });

    // Add Work Experience
    const addExpBtn = page.getByRole('button', { name: /thêm kinh nghiệm làm việc/i }).first();
    if (await addExpBtn.isVisible()) {
      await addExpBtn.click();
    } else {
      // Fallback click on dashed container button
      await page.getByText(/bấm vào đây để thêm/i).first().click();
    }

    // Fill position & company
    const expPositionInput = page.getByPlaceholder(/VD: Senior Frontend Developer/i).first();
    await expect(expPositionInput).toBeVisible({ timeout: 10_000 });
    await expPositionInput.fill('Senior DevOps Lead');

    const expCompanyInput = page.getByPlaceholder(/VD: Công ty Cổ phần Công nghệ ABC/i).first();
    await expCompanyInput.fill('InfoHR Cloud Solution');

    // Verify live preview reflects added work experience
    const previewArea = page.locator('#cv-print-area');
    await expect(previewArea.getByText('Senior DevOps Lead').first()).toBeVisible({ timeout: 10_000 });
    await expect(previewArea.getByText('InfoHR Cloud Solution').first()).toBeVisible({ timeout: 10_000 });

    // Add Education
    const addEduBtn = page.getByRole('button', { name: /thêm học vấn/i }).first();
    if (await addEduBtn.isVisible()) {
      await addEduBtn.click();
    } else {
      await page.getByRole('button', { name: /\+ Bấm vào đây để thêm/i }).last().click();
    }

    const schoolInput = page.getByLabel(/trường \/ đơn vị đào tạo \*/i).or(page.getByPlaceholder(/VD: Đại học Bách Khoa Hà Nội/i)).first();
    await expect(schoolInput).toBeVisible({ timeout: 10_000 });
    await schoolInput.fill('Đại học Công Nghệ Quốc Gia');

    // Verify education in preview
    await expect(previewArea.getByText('Đại học Công Nghệ Quốc Gia').first()).toBeVisible({ timeout: 10_000 });
  });

  test('User can switch to Design tab and customize template and color palette', async ({ page }) => {
    await page.goto('/cv-builder');
    await expect(page.locator('#cv-print-area')).toBeVisible({ timeout: 20_000 });

    // Switch to "Thiết kế" tab
    const designTab = page.getByRole('button', { name: /thiết kế/i }).first();
    await expect(designTab).toBeVisible({ timeout: 15_000 });
    await designTab.click();

    // Verify design sections appear
    await expect(page.getByText(/mẫu giao diện cv/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/màu sắc chủ đạo/i).first()).toBeVisible({ timeout: 10_000 });

    // Click on a template option or color swatch
    const colorSwatches = page.locator('[title="#059669"], [title="#1e40af"], [title="#e11d48"], [title="#0284c7"]');
    if (await colorSwatches.count() > 0) {
      await colorSwatches.first().click();
    }

    // Verify canvas preview remains stable and visible
    await expect(page.locator('#cv-print-area')).toBeVisible();
  });
});
