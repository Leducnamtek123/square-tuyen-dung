import type { Page } from '@playwright/test';
import {
  setupHrmApiMocks,
  setupAuthApiMocks,
  MOCK_HRM_EMPLOYEES,
  MOCK_HRM_DEPARTMENTS,
  MOCK_HRM_LEAVE_REQUESTS,
  MOCK_HRM_LEAVE_BALANCES,
  MOCK_HRM_ATTENDANCE_REQUESTS,
  MOCK_HRM_PAYROLL_RECORDS,
} from '../helpers/mockApi';
import { DEFAULT_EMPLOYER } from '../helpers/auth';

export interface SetupHrmOptions {
  duplicateEmployeeCode?: boolean;
}

/**
 * Đăng ký các mock endpoints phục vụ phân hệ HRM
 */
export async function setupDomainHrmMocks(page: Page, options?: SetupHrmOptions) {
  await setupHrmApiMocks(page);
  await setupAuthApiMocks(page, {
    role: 'EMPLOYER',
    id: DEFAULT_EMPLOYER.id,
    email: DEFAULT_EMPLOYER.email,
    fullName: DEFAULT_EMPLOYER.fullName,
    companyId: DEFAULT_EMPLOYER.companyId,
    companyName: DEFAULT_EMPLOYER.companyName,
  });

  // Mock tạo phòng ban mới (POST)
  await page.route(/\/native-hrm\/departments\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newDept = {
        id: 99,
        name: data.name || 'Phòng Trí tuệ Nhân tạo',
        code: data.code || 'AI_LAB',
        description: data.description || 'Nghiên cứu và phát triển giải pháp AI',
        parent: data.parent ? Number(data.parent) : null,
        manager: data.manager ? Number(data.manager) : null,
        is_active: true,
        employee_count: 0,
        employeeCount: 0,
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newDept),
      });
      return;
    }
    await route.continue();
  });

  // Mock tạo nhân viên mới hoặc kiểm tra trùng mã
  if (options?.duplicateEmployeeCode) {
    await page.route(/\/native-hrm\/employees\/?(\?.*)?$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'DUPLICATE_CODE',
            message: 'Mã nhân viên đã tồn tại trong hệ thống',
            detail: 'Mã nhân viên đã tồn tại trong hệ thống',
            employee_code: ['Mã nhân viên đã tồn tại trong hệ thống.'],
          }),
        });
        return;
      }
      await route.continue();
    });
  }

  // Mock thao tác duyệt / từ chối đơn nghỉ phép
  await page.route(/\/native-hrm\/leave-requests\/\d+\/(approve|reject)\/?(\?.*)?$/, async (route) => {
    const isApprove = route.request().url().includes('approve');
    const data = route.request().postDataJSON() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_HRM_LEAVE_REQUESTS[0],
        status: isApprove ? 'APPROVED' : 'REJECTED',
        rejection_reason: isApprove ? null : (data.rejection_reason || data.reason || 'Lý do từ chối'),
        approved_by_name: isApprove ? 'Người quản lý' : null,
      }),
    });
  });

  // Mock tạo đơn giải trình / yêu cầu chấm công mới (POST)
  await page.route(/\/native-hrm\/attendance-requests\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newReq = {
        id: 99,
        employee: Number(data.employee) || 1,
        employee_name: 'Nguyễn Văn A',
        employeeName: 'Nguyễn Văn A',
        request_type: data.request_type || 'REGULARISATION',
        request_type_label: 'Đề nghị cập nhật công (Giải trình quên chấm công)',
        target_date: data.start_date || '2026-09-21',
        start_date: data.start_date || '2026-09-21',
        end_date: data.end_date || '2026-09-21',
        start_time: data.start_time || '08:30:00',
        end_time: data.end_time || '17:30:00',
        reason: data.reason || 'Quên chấm công vào ca sáng',
        status: 'PENDING_STAGE_1',
        status_label: 'Chờ QL trực tiếp duyệt',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newReq),
      });
      return;
    }
    await route.continue();
  });

  // Mock phê duyệt / từ chối yêu cầu chấm công (Stage 1 / Stage 2 / Reject)
  await page.route(/\/native-hrm\/attendance-requests\/\d+\/(approve-stage-1|approve-stage-2|approve|reject)\/?(\?.*)?$/, async (route) => {
    const url = route.request().url();
    const isReject = url.includes('reject');
    const isStage1 = url.includes('approve-stage-1');
    const data = route.request().postDataJSON() || {};

    let status = 'APPROVED';
    let statusLabel = 'Đã duyệt & Bù công';
    if (isReject) {
      status = 'REJECTED';
      statusLabel = 'Đã từ chối';
    } else if (isStage1) {
      status = 'APPROVED_STAGE_1';
      statusLabel = 'Chờ HR duyệt (Cấp 2)';
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_HRM_ATTENDANCE_REQUESTS[0],
        status,
        status_label: statusLabel,
        rejection_reason: isReject ? (data.reason || 'Từ chối giải trình') : null,
      }),
    });
  });

  // Mock duyệt bảng lương (cá nhân hoặc toàn bộ)
  await page.route(/\/native-hrm\/payroll\/(\d+\/approve|approve-all)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        status: 'APPROVED',
        message: 'Bảng lương đã được phê duyệt thành công.',
      }),
    });
  });
}

