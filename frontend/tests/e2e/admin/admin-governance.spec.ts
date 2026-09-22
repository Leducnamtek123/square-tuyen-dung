import { test, expect } from '@playwright/test';
import {
  setupCommonApiMocks,
  setupAuthApiMocks,
  setupAdminApiMocks,
  MOCK_ADMIN_JOB_POSTS,
  MOCK_ADMIN_USERS,
  MOCK_COMPANY_VERIFICATIONS,
  MOCK_TRUST_REPORTS,
  MOCK_ADMIN_INTERVIEW_SESSIONS,
  MOCK_AUDIT_LOGS,
} from '../../helpers/mockApi';
import { injectSession, DEFAULT_ADMIN } from '../../helpers/auth';

test.describe('Admin Governance & Moderation E2E Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupCommonApiMocks(page);
    await setupAuthApiMocks(page, {
      role: 'ADMIN',
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      fullName: DEFAULT_ADMIN.fullName,
    });
    await setupAdminApiMocks(page);
    await injectSession(context, DEFAULT_ADMIN);
  });

  test('Test 1: Admin can view Dashboard with live metric cards and analytics on /admin (redirect to /admin/dashboard)', async ({ page }) => {
    await page.goto('/admin');

    // Verify redirect to /admin/dashboard or localized /quan-tri/bang-dieu-khien
    await page.waitForURL(/\/(admin|quan-tri)\/(dashboard|bang-dieu-khien)?/, { timeout: 25_000 });
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });

    // Verify presence of operating statistics header and refresh button
    const refreshBtn = page.getByRole('button', { name: /làm mới|refresh/i }).first();
    await expect(refreshBtn).toBeVisible({ timeout: 20_000 });

    // Verify main header title
    const headerTitle = page.getByText(/dữ liệu vận hành|operating/i).first();
    await expect(headerTitle).toBeVisible({ timeout: 15_000 });

    // Verify KPI live metric cards render with proper labels
    await expect(page.getByText(/tổng người dùng|người dùng/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/tình trạng tin tuyển dụng|tin tuyển dụng/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/quy trình ứng tuyển|ứng tuyển/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/công ty|doanh nghiệp/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/phỏng vấn/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Test 2: Admin can moderate job postings on /admin/jobs (view list, approve flow with confirmation, reject flow with reason)', async ({ page }) => {
    await page.goto('/admin/jobs');

    // 1. Verify job items are listed in the data table
    const firstJob = MOCK_ADMIN_JOB_POSTS[0];
    await expect(page.getByText(firstJob.job_name).first()).toBeVisible({ timeout: 25_000 });

    // 2. Approve Flow: click approve button -> confirm in AdminConfirmDialog
    const approveBtn = page.getByTestId('approve-job-btn').first();
    await expect(approveBtn).toBeVisible({ timeout: 15_000 });
    await approveBtn.click();

    // Confirm dialog should appear
    const confirmApproveBtn = page.getByTestId('admin-confirm-btn');
    await expect(confirmApproveBtn).toBeVisible({ timeout: 10_000 });
    await confirmApproveBtn.click();
    await expect(confirmApproveBtn).toBeHidden({ timeout: 10_000 });

    // 3. Reject Flow: click reject button -> fill reason -> confirm in AdminConfirmDialog
    const rejectBtn = page.getByTestId('reject-job-btn').first();
    await expect(rejectBtn).toBeVisible({ timeout: 15_000 });
    await rejectBtn.click();

    // Confirm dialog with required reason input
    const reasonInput = page.getByTestId('admin-reason-input').locator('textarea, input').first();
    await expect(reasonInput).toBeVisible({ timeout: 10_000 });
    await reasonInput.fill('Tin tuyển dụng chưa ghi rõ mức lương và chế độ đãi ngộ.');

    const confirmRejectBtn = page.getByTestId('admin-confirm-btn');
    await expect(confirmRejectBtn).toBeVisible({ timeout: 10_000 });
    await confirmRejectBtn.click();
    await expect(confirmRejectBtn).toBeHidden({ timeout: 10_000 });
  });

  test('Test 3: Admin can verify company business licenses on /admin/company-verifications (view list, approve verification, reject verification)', async ({ page }) => {
    await page.goto('/admin/company-verifications');

    // 1. Verify company verification item is displayed in data grid
    const targetCompany = MOCK_COMPANY_VERIFICATIONS[0];
    await expect(page.getByText(targetCompany.companyName).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(targetCompany.taxCode).first()).toBeVisible({ timeout: 15_000 });

    // 2. Approve Verification Flow: click approve button -> confirm dialog
    const approveBtn = page.getByTestId('approve-verification-btn').first();
    await expect(approveBtn).toBeVisible({ timeout: 15_000 });
    await approveBtn.click();

    const confirmApproveBtn = page.getByTestId('admin-confirm-btn');
    await expect(confirmApproveBtn).toBeVisible({ timeout: 10_000 });
    await confirmApproveBtn.click();
    await expect(confirmApproveBtn).toBeHidden({ timeout: 10_000 });

    // 3. Reject Verification Flow: click reject button -> fill reason -> confirm dialog
    const rejectBtn = page.getByTestId('reject-verification-btn').first();
    await expect(rejectBtn).toBeVisible({ timeout: 15_000 });
    await rejectBtn.click();

    // Fill required rejection reason
    const reasonInput = page.getByTestId('admin-reason-input').locator('textarea, input').first();
    await expect(reasonInput).toBeVisible({ timeout: 10_000 });
    await reasonInput.fill('Giấy phép kinh doanh tải lên bị mờ, không xác định được con dấu hợp lệ.');

    const confirmRejectBtn = page.getByTestId('admin-confirm-btn');
    await expect(confirmRejectBtn).toBeVisible({ timeout: 10_000 });
    await confirmRejectBtn.click();
    await expect(confirmRejectBtn).toBeHidden({ timeout: 10_000 });
  });

  test('Test 4: Admin can manage users and roles on /admin/users (view candidates/employers, toggle active status, check role select)', async ({ page }) => {
    await page.goto('/admin/users');

    // 1. Verify candidate and employer users are listed
    const employerUser = MOCK_ADMIN_USERS[1];
    const candidateUser = MOCK_ADMIN_USERS[2];
    await expect(page.getByText(employerUser.email).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(candidateUser.email).first()).toBeVisible({ timeout: 20_000 });

    // 2. Toggle active status switch for a user
    const toggleSwitch = page.getByTestId('toggle-user-active-switch').first();
    await expect(toggleSwitch).toBeAttached({ timeout: 15_000 });
    await toggleSwitch.click({ force: true });

    // 3. Verify role select dropdown is visible and accessible
    const roleSelect = page.getByTestId('user-role-select').or(page.getByRole('combobox')).first();
    await expect(roleSelect).toBeVisible({ timeout: 15_000 });
    await roleSelect.click();

    // Verify role options in menu
    const employerOption = page.getByRole('option', { name: /nhà tuyển dụng|employer/i }).or(page.getByText(/nhà tuyển dụng|employer/i)).first();
    await expect(employerOption).toBeVisible({ timeout: 10_000 });

    // Close select dropdown cleanly
    await page.keyboard.press('Escape');
  });

  test('Test 5: Admin can view and resolve trust reports on /admin/trust-reports (filter reports, resolve report flow)', async ({ page }) => {
    await page.goto('/admin/trust-reports');

    // 1. Verify trust report item is listed
    const firstReport = MOCK_TRUST_REPORTS[0];
    await expect(page.getByText(firstReport.target_title).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(firstReport.reason).first()).toBeVisible({ timeout: 15_000 });

    // 2. Filter reports by search input
    const searchInput = page.getByPlaceholder(/tìm kiếm theo đối tượng|tìm kiếm/i).first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill(firstReport.target_title);
      await expect(page.getByText(firstReport.target_title).first()).toBeVisible({ timeout: 10_000 });
    }

    // 3. Resolve report flow
    const resolveBtn = page.getByTestId('resolve-trust-report-btn').first();
    await expect(resolveBtn).toBeVisible({ timeout: 15_000 });
    await resolveBtn.click();

    // Confirm dialog opens
    const confirmBtn = page.getByTestId('admin-confirm-btn');
    await expect(confirmBtn).toBeVisible({ timeout: 10_000 });
    await confirmBtn.click();
    await expect(confirmBtn).toBeHidden({ timeout: 10_000 });
  });

  test('Test 6: Admin can configure system settings on /admin/settings (toggle maintenance mode, update auto-approve jobs, save settings)', async ({ page }) => {
    await page.goto('/admin/settings');

    // 1. Switch to tab "Hệ Thống & Thông Báo"
    const systemTab = page.getByRole('tab', { name: /hệ thống & thông báo|cấu hình/i }).first();
    await expect(systemTab).toBeVisible({ timeout: 25_000 });
    await systemTab.click();

    // 2. Toggle maintenance mode switch
    const maintenanceSwitch = page.getByLabel(/chế độ bảo trì|maintenance mode/i).or(page.locator('input[type="checkbox"]').first());
    await expect(maintenanceSwitch).toBeAttached({ timeout: 15_000 });
    await maintenanceSwitch.click({ force: true });

    // 3. Toggle auto-approve jobs switch
    const autoApproveSwitch = page.getByLabel(/tự động duyệt/i).or(page.locator('input[type="checkbox"]').nth(1));
    await expect(autoApproveSwitch).toBeAttached({ timeout: 15_000 });
    await autoApproveSwitch.click({ force: true });

    // 4. Optional: test Health Check trigger
    const healthCheckBtn = page.getByRole('button', { name: /kiểm tra trạng thái|health check/i }).first();
    if (await healthCheckBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await healthCheckBtn.click();
      await expect(page.getByText(/trạng thái hệ thống|healthy|ok/i).first()).toBeVisible({ timeout: 10_000 });
    }

    // 5. Save settings
    const saveBtn = page.getByRole('button', { name: /lưu thay đổi|save changes/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15_000 });
    await saveBtn.click();
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
  });

  test('Test 7: Admin can monitor LiveKit AI interview sessions on /admin/interviews (inspect session list, view status chips, verify AI service health banner)', async ({ page }) => {
    await page.goto('/admin/interviews');

    // 1. Verify AI Service Health banner is visible
    await expect(page.getByText(/dịch vụ ai|ai health/i).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText('LiveKit').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('LLM').first()).toBeVisible({ timeout: 15_000 });

    // 2. Verify interview session is listed
    const firstSession = MOCK_ADMIN_INTERVIEW_SESSIONS[0];
    await expect(page.getByText(firstSession.candidateName).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(firstSession.jobName).first()).toBeVisible({ timeout: 15_000 });

    // 3. Verify status chips render
    const statusChip = page.locator('.MuiChip-root').filter({ hasText: /hoàn tất|đã hoàn thành|completed|lên lịch|scheduled|đang xử lý/i }).first();
    await expect(statusChip).toBeVisible({ timeout: 15_000 });

    // 4. Inspect session detail dialog
    const viewBtn = page.locator('tbody tr').first().locator('button').first();
    await expect(viewBtn).toBeVisible({ timeout: 15_000 });
    await viewBtn.click();

    // Dialog opens showing room name, candidate name and recording link
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText(firstSession.roomName).or(dialog.getByText(firstSession.candidateName)).first()).toBeVisible({ timeout: 10_000 });

    // Close detail dialog
    const closeBtn = dialog.getByRole('button', { name: /đóng|close/i }).first();
    await closeBtn.click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  });

  test('Admin can view system audit logs on /admin/audit-logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    // Verify audit log page rendered with email or action
    await expect(page.locator('body')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(MOCK_AUDIT_LOGS[0].actorEmail).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(MOCK_AUDIT_LOGS[0].action).first()).toBeVisible({ timeout: 20_000 });
  });
});
