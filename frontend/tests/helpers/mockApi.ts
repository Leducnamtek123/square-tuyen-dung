import type { Page } from '@playwright/test';
import type { UserRole } from './auth';

export const MOCK_CAREERS = [
  { id: 1, name: 'Công nghệ thông tin / Phần mềm' },
  { id: 2, name: 'Kinh doanh / Bán hàng' },
  { id: 3, name: 'Marketing / Truyền thông' },
  { id: 4, name: 'Nhân sự / Tuyển dụng' },
  { id: 5, name: 'Kế toán / Tài chính' },
];

export const MOCK_CITIES = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
  { id: 4, name: 'Bình Dương' },
];

export const MOCK_JOBS = [
  {
    id: 101,
    slug: 'senior-fullstack-engineer-101',
    job_name: 'Senior Fullstack Engineer (React & Django)',
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    },
    location: {
      city: { id: 1, name: 'Hà Nội' },
      district: { id: 1, name: 'Cầu Giấy' },
      address: 'Duy Tân, Cầu Giấy, Hà Nội',
    },
    career: { id: 1, name: 'Công nghệ thông tin / Phần mềm' },
    salary_min: 25000000,
    salary_max: 45000000,
    is_urgent: true,
    is_hot: true,
    job_type: 1,
    job_type_name: 'Toàn thời gian',
    deadline: '2026-12-31',
    job_description: '<p>Thiết kế và phát triển tính năng web app Next.js & DRF backend.</p>',
    job_requirement: '<p>3+ năm kinh nghiệm React, TypeScript, Python hoặc Node.js.</p>',
    benefits_enjoyed: '<p>Bảo hiểm sức khỏe cao cấp, thưởng tháng 13+, laptop làm việc.</p>',
  },
  {
    id: 102,
    slug: 'hr-talent-acquisition-lead-102',
    job_name: 'HR & Talent Acquisition Lead',
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    },
    location: {
      city: { id: 2, name: 'Hồ Chí Minh' },
      district: { id: 2, name: 'Quận 1' },
      address: 'Nguyễn Huệ, Quận 1, TP. HCM',
    },
    career: { id: 4, name: 'Nhân sự / Tuyển dụng' },
    salary_min: 20000000,
    salary_max: 35000000,
    is_urgent: false,
    is_hot: false,
    job_type: 1,
    job_type_name: 'Toàn thời gian',
    deadline: '2026-11-30',
    job_description: '<p>Phụ trách tuyển dụng nhân sự chất lượng cao và vận hành hệ thống HRM.</p>',
    job_requirement: '<p>2+ năm kinh nghiệm tuyển dụng tech, am hiểu văn hóa doanh nghiệp.</p>',
    benefits_enjoyed: '<p>Chế độ đãi ngộ cạnh tranh, du lịch hàng năm.</p>',
  },
];

export const MOCK_HRM_EMPLOYEES = [
  {
    id: 1,
    employee_code: 'EMP-001',
    first_name: 'Văn A',
    last_name: 'Nguyễn',
    full_name: 'Nguyễn Văn A',
    email: 'nguyenvana@infohr.vn',
    phone: '0901234567',
    department: 1,
    department_name: 'Công nghệ thông tin',
    designation: 1,
    designation_title: 'Senior Developer',
    status: 'ACTIVE',
    join_date: '2025-01-15',
    base_salary: 30000000,
  },
  {
    id: 2,
    employee_code: 'EMP-002',
    first_name: 'Thị B',
    last_name: 'Trần',
    full_name: 'Trần Thị B',
    email: 'tranthib@infohr.vn',
    phone: '0912345678',
    department: 2,
    department_name: 'Nhân sự & Vận hành',
    designation: 2,
    designation_title: 'HR Executive',
    status: 'ACTIVE',
    join_date: '2025-03-01',
    base_salary: 18000000,
  },
];

/**
 * Mocks baseline system endpoints required on almost every page (configs, careers, cities, translations)
 */
export async function setupCommonApiMocks(page: Page) {
  // Configs
  await page.route('**/api/common/configs**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        site_name: 'InfoHR',
        hotline: '1900-1234',
      }),
    });
  });

  // All careers
  await page.route('**/api/common/all-careers**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_CAREERS.length, results: MOCK_CAREERS }),
    });
  });

  // All cities
  await page.route('**/api/common/all-cities**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_CITIES.length, results: MOCK_CITIES }),
    });
  });
}

/**
 * Mocks authenticated user endpoints
 */
export async function setupAuthApiMocks(
  page: Page,
  options: {
    role: UserRole;
    id?: number;
    email?: string;
    fullName?: string;
    companyId?: number;
    companyName?: string;
  }
) {
  const { role, id = 1, email = 'user@infohr.vn', fullName = 'InfoHR User', companyId = 10, companyName = 'InfoHR Corp' } = options;

  await page.route('**/api/auth/user-info-basic/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id,
        email,
        full_name: fullName,
        role_name: role,
        has_company: role === 'EMPLOYER',
        workspaces:
          role === 'EMPLOYER'
            ? [{ type: 'company', company_id: companyId, label: companyName, is_default: true }]
            : [],
      }),
    });
  });

  await page.route('**/api/auth/user-workspaces/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        workspaces:
          role === 'EMPLOYER'
            ? [{ type: 'company', company_id: companyId, label: companyName, is_default: true }]
            : [],
      }),
    });
  });

  // Token endpoint for direct login submissions
  await page.route('**/api/auth/token/**', async (route) => {
    const postData = route.request().postDataJSON() || {};
    if (postData.password === 'WrongPassword!') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          non_field_errors: ['Email hoặc mật khẩu không chính xác.'],
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: `token-${role.toLowerCase()}-e2e`,
        refresh_token: `refresh-${role.toLowerCase()}-e2e`,
        token_type: 'Bearer',
        expires_in: 86400,
      }),
    });
  });
}

/**
 * Mocks Jobs API endpoints for Job Seeker flow
 */
export async function setupJobsApiMocks(page: Page) {
  // Public job list
  await page.route(/\/api\/job\/web\/job-posts\/\?*.*/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: MOCK_JOBS.length,
          results: MOCK_JOBS,
          total_pages: 1,
        }),
      });
      return;
    }
    await route.continue();
  });

  // Detail for first mock job
  await page.route(new RegExp(`/api/job/web/job-posts/${MOCK_JOBS[0].slug}/`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_JOBS[0]),
    });
  });

  // Apply to job post activity
  await page.route('**/api/job/web/job-seeker-job-posts-activity/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999,
          job_post: MOCK_JOBS[0].id,
          status: 'APPLIED',
          message: 'Ứng tuyển thành công!',
        }),
      });
      return;
    }
    await route.continue();
  });
}

/**
 * Mocks Employer API endpoints
 */
export async function setupEmployerApiMocks(page: Page) {
  // Employer private job posts
  await page.route(/\/api\/job\/web\/private-job-posts\/.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
      }),
    });
  });

  // Employer applied profiles
  await page.route(/\/api\/job\/web\/employer\/job-post-activities\/.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 1,
        results: [
          {
            id: 10,
            candidate_name: 'Nguyen Van Ung Vien',
            candidate_email: 'candidate.e2e@infohr.vn',
            job_post_title: MOCK_JOBS[0].job_name,
            apply_date: '2026-09-20',
            status: 1,
            status_name: 'Chờ duyệt',
          },
        ],
      }),
    });
  });
}

/**
 * Mocks Native HRM API endpoints
 */
export async function setupHrmApiMocks(page: Page) {
  // HRM Dashboard stats
  await page.route('**/api/native-hrm/dashboard/stats/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        active_employees: 45,
        probation_employees: 3,
        pending_leaves: 2,
        expiring_contracts: 1,
        department_breakdown: [
          { id: 1, name: 'Công nghệ thông tin', emp_count: 25 },
          { id: 2, name: 'Nhân sự', emp_count: 10 },
          { id: 3, name: 'Kinh doanh', emp_count: 10 },
        ],
      }),
    });
  });

  // HRM Employees list
  await page.route(/\/api\/native-hrm\/employees\/\?*.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_EMPLOYEES.length,
        results: MOCK_HRM_EMPLOYEES,
      }),
    });
  });

  // HRM Departments
  await page.route('**/api/native-hrm/departments/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        results: [
          { id: 1, name: 'Công nghệ thông tin', code: 'TECH', employee_count: 25 },
          { id: 2, name: 'Nhân sự & Vận hành', code: 'HR', employee_count: 10 },
        ],
      }),
    });
  });

  // HRM Timesheet / Attendance
  await page.route(/\/api\/native-hrm\/timesheet\/.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        month: 9,
        year: 2026,
        total_days: 30,
        days: [{ day: 1, is_weekend: false }, { day: 2, is_weekend: false }],
        employees: [
          {
            employee_id: 1,
            employee_code: 'EMP-001',
            full_name: 'Nguyễn Văn A',
            department_name: 'Công nghệ thông tin',
            records: {},
            stats: { total_present: 22, total_hours: 176 },
          },
        ],
      }),
    });
  });

  // HRM Payroll
  await page.route(/\/api\/native-hrm\/payroll\/monthly\/.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 1,
        results: [
          {
            id: 1,
            employee_name: 'Nguyễn Văn A',
            employee_code: 'EMP-001',
            month: 9,
            year: 2026,
            base_salary: 30000000,
            net_salary: 27500000,
            status: 'APPROVED',
          },
        ],
      }),
    });
  });
}
