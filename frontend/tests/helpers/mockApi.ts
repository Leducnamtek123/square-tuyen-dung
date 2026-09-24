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
    jobName: 'Senior Fullstack Engineer (React & Django)',
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    },
    company_dict: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
      company_image_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      companyImageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      slug: 'infohr-tech-corp',
      is_verified: true,
      isVerified: true,
    },
    companyDict: {
      id: 10,
      companyName: 'InfoHR Tech Corp',
      companyImageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      slug: 'infohr-tech-corp',
      isVerified: true,
    },
    location: {
      city: 1,
      cityName: 'Thành phố Hà Nội',
      district: 1,
      districtName: 'Cầu Giấy',
      address: 'Duy Tân, Cầu Giấy, Hà Nội',
    },
    location_dict: {
      city: 1,
      cityName: 'Thành phố Hà Nội',
      district: 1,
      districtName: 'Cầu Giấy',
      address: 'Duy Tân, Cầu Giấy, Hà Nội',
    },
    locationDict: {
      city: 1,
      cityName: 'Thành phố Hà Nội',
      district: 1,
      districtName: 'Cầu Giấy',
      address: 'Duy Tân, Cầu Giấy, Hà Nội',
    },
    career: 1,
    career_id: 1,
    salary_min: 25000000,
    salary_max: 45000000,
    salaryMin: 25000000,
    salaryMax: 45000000,
    is_urgent: true,
    is_hot: true,
    isUrgent: true,
    isHot: true,
    job_type: 1,
    job_type_name: 'Toàn thời gian',
    jobTypeName: 'Toàn thời gian',
    deadline: '2026-12-31',
    job_description: '<p>Thiết kế và phát triển tính năng web app Next.js & DRF backend.</p>',
    job_requirement: '<p>3+ năm kinh nghiệm React, TypeScript, Python hoặc Node.js.</p>',
    benefits_enjoyed: '<p>Bảo hiểm sức khỏe cao cấp, thưởng tháng 13+, laptop làm việc.</p>',
  },
  {
    id: 102,
    slug: 'hr-talent-acquisition-lead-102',
    job_name: 'HR & Talent Acquisition Lead',
    jobName: 'HR & Talent Acquisition Lead',
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    },
    company_dict: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
      company_image_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      companyImageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      slug: 'infohr-tech-corp',
      is_verified: true,
      isVerified: true,
    },
    companyDict: {
      id: 10,
      companyName: 'InfoHR Tech Corp',
      companyImageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      slug: 'infohr-tech-corp',
      isVerified: true,
    },
    location: {
      city: 2,
      cityName: 'Thành phố Hồ Chí Minh',
      district: 2,
      districtName: 'Quận 1',
      address: 'Nguyễn Huệ, Quận 1, TP. HCM',
    },
    location_dict: {
      city: 2,
      cityName: 'Thành phố Hồ Chí Minh',
      district: 2,
      districtName: 'Quận 1',
      address: 'Nguyễn Huệ, Quận 1, TP. HCM',
    },
    locationDict: {
      city: 2,
      cityName: 'Thành phố Hồ Chí Minh',
      district: 2,
      districtName: 'Quận 1',
      address: 'Nguyễn Huệ, Quận 1, TP. HCM',
    },
    career: 4,
    career_id: 4,
    salary_min: 20000000,
    salary_max: 35000000,
    salaryMin: 20000000,
    salaryMax: 35000000,
    is_urgent: false,
    is_hot: false,
    isUrgent: false,
    isHot: false,
    job_type: 1,
    job_type_name: 'Toàn thời gian',
    jobTypeName: 'Toàn thời gian',
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
    employeeCode: 'EMP-001',
    first_name: 'Văn A',
    last_name: 'Nguyễn',
    full_name: 'Nguyễn Văn A',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@infohr.vn',
    phone: '0901234567',
    department: 1,
    department_name: 'Công nghệ thông tin',
    departmentName: 'Công nghệ thông tin',
    designation: 1,
    designation_title: 'Senior Developer',
    designationTitle: 'Senior Developer',
    status: 'ACTIVE',
    employment_type: 'FULL_TIME',
    join_date: '2025-01-15',
    base_salary: 30000000,
  },
  {
    id: 2,
    employee_code: 'EMP-002',
    employeeCode: 'EMP-002',
    first_name: 'Thị B',
    last_name: 'Trần',
    full_name: 'Trần Thị B',
    fullName: 'Trần Thị B',
    email: 'tranthib@infohr.vn',
    phone: '0912345678',
    department: 2,
    department_name: 'Nhân sự & Vận hành',
    departmentName: 'Nhân sự & Vận hành',
    designation: 2,
    designation_title: 'HR Executive',
    designationTitle: 'HR Executive',
    status: 'ACTIVE',
    employment_type: 'FULL_TIME',
    join_date: '2025-03-01',
    base_salary: 18000000,
  },
];

export const MOCK_HRM_DEPARTMENTS = [
  { id: 1, name: 'Công nghệ thông tin', code: 'TECH', employee_count: 25, is_active: true },
  { id: 2, name: 'Nhân sự & Vận hành', code: 'HR', employee_count: 10, is_active: true },
  { id: 3, name: 'Kinh doanh', code: 'SALES', employee_count: 10, is_active: true },
];

export const MOCK_HRM_DESIGNATIONS = [
  { id: 1, title: 'Senior Developer', code: 'SR_DEV', employee_count: 15, is_active: true },
  { id: 2, title: 'HR Executive', code: 'HR_EXEC', employee_count: 5, is_active: true },
  { id: 3, title: 'Product Manager', code: 'PM', employee_count: 3, is_active: true },
];

export const MOCK_HRM_LEAVE_TYPES = [
  { id: 1, name: 'Nghỉ phép năm', code: 'ANNUAL', days_per_year: 12, is_paid: true },
  { id: 2, name: 'Nghỉ ốm', code: 'SICK', days_per_year: 5, is_paid: true },
  { id: 3, name: 'Nghỉ không lương', code: 'UNPAID', days_per_year: 0, is_paid: false },
];

export const MOCK_HRM_LEAVE_REQUESTS = [
  {
    id: 1,
    employee: 1,
    employee_name: 'Nguyễn Văn A',
    employeeName: 'Nguyễn Văn A',
    leave_type: 1,
    leaveType: 1,
    leave_type_name: 'Nghỉ phép năm',
    leaveTypeName: 'Nghỉ phép năm',
    start_date: '2026-10-01',
    startDate: '2026-10-01',
    end_date: '2026-10-02',
    endDate: '2026-10-02',
    total_days: 2,
    totalDays: 2,
    reason: 'Việc gia đình',
    status: 'PENDING',
  },
  {
    id: 2,
    employee: 2,
    employee_name: 'Trần Thị B',
    employeeName: 'Trần Thị B',
    leave_type: 1,
    leaveType: 1,
    leave_type_name: 'Nghỉ phép năm',
    leaveTypeName: 'Nghỉ phép năm',
    start_date: '2026-09-10',
    startDate: '2026-09-10',
    end_date: '2026-09-11',
    endDate: '2026-09-11',
    total_days: 2,
    totalDays: 2,
    reason: 'Nghỉ phép cá nhân',
    status: 'APPROVED',
    approved_by_name: 'Trần Thị Tuyển Dụng',
  },
];

export const MOCK_HRM_LEAVE_BALANCES = [
  {
    id: 1,
    employee: 1,
    employee_name: 'Nguyễn Văn A',
    employee_code: 'EMP-001',
    leave_type: 1,
    leave_type_name: 'Nghỉ phép năm',
    year: 2026,
    allocated_days: 12,
    seniority_bonus_days: 1,
    carried_over_days: 2,
    used_days: 3,
    pending_days: 2,
    total_allowed_days: 15,
    remaining_days: 10,
  },
];

export const MOCK_HRM_WORK_SHIFTS = [
  {
    id: 1,
    name: 'Ca hành chính',
    code: 'OFFICE',
    start_time: '08:00:00',
    end_time: '17:00:00',
    break_start: '12:00:00',
    break_end: '13:00:00',
    work_hours: 8,
    is_active: true,
  },
  {
    id: 2,
    name: 'Ca sáng',
    code: 'MORNING',
    start_time: '06:00:00',
    end_time: '14:00:00',
    work_hours: 8,
    is_active: true,
  },
];

export const MOCK_HRM_ATTENDANCE_REQUESTS = [
  {
    id: 1,
    employee: 1,
    employee_name: 'Nguyễn Văn A',
    request_type: 'CHECKIN_MISSING',
    request_type_label: 'Giải trình quên chấm công',
    target_date: '2026-09-21',
    explanation: 'Quên chấm công vào ca sáng',
    status: 'PENDING_STAGE_1',
    status_label: 'Chờ QL trực tiếp duyệt',
  },
];

export const MOCK_HRM_PAYROLL_KPIS = {
  month: 9,
  year: 2026,
  total_employees: 2,
  total_gross: 48000000,
  total_net: 47160000,
  total_pit: 3300000,
  total_emp_insurance: 5040000,
  total_employer_insurance: 11280000,
  total_company_expense: 66780000,
  draft_count: 1,
  approved_count: 1,
  paid_count: 0,
};

export const MOCK_HRM_PAYROLL_RECORDS = [
  {
    id: 1,
    company: 10,
    employee: 1,
    employee_name: 'Nguyễn Văn A',
    employee_code: 'EMP-001',
    department_name: 'Công nghệ thông tin',
    month: 9,
    year: 2026,
    gross_salary: 30000000,
    allowance: 2000000,
    bonus: 3000000,
    working_days_actual: 22,
    standard_working_days: 22,
    unpaid_leave_days: 0,
    dependents_count: 1,
    total_income: 35000000,
    bhxh_amount: 2400000,
    bhyt_amount: 450000,
    bhtn_amount: 300000,
    total_insurance: 3150000,
    employer_bhxh: 5250000,
    employer_bhyt: 900000,
    employer_bhtn: 300000,
    employer_union_fee: 600000,
    total_employer_insurance: 7050000,
    taxable_income: 31850000,
    personal_income_tax: 2350000,
    net_salary: 29500000,
    total_company_expense: 42050000,
    status: 'APPROVED',
    status_label: 'Đã duyệt',
    payment_date: null,
    note: 'Lương tháng 9',
  },
  {
    id: 2,
    company: 10,
    employee: 2,
    employee_name: 'Trần Thị B',
    employee_code: 'EMP-002',
    department_name: 'Nhân sự & Vận hành',
    month: 9,
    year: 2026,
    gross_salary: 18000000,
    allowance: 1500000,
    bonus: 1000000,
    working_days_actual: 22,
    standard_working_days: 22,
    unpaid_leave_days: 0,
    dependents_count: 0,
    total_income: 20500000,
    bhxh_amount: 1440000,
    bhyt_amount: 270000,
    bhtn_amount: 180000,
    total_insurance: 1890000,
    employer_bhxh: 3150000,
    employer_bhyt: 540000,
    employer_bhtn: 180000,
    employer_union_fee: 360000,
    total_employer_insurance: 4230000,
    taxable_income: 18610000,
    personal_income_tax: 950000,
    net_salary: 17660000,
    total_company_expense: 24730000,
    status: 'DRAFT',
    status_label: 'Nháp',
    payment_date: null,
    note: 'Lương tháng 9',
  },
];

export const MOCK_SYSTEM_CONFIGS = {
  site_name: 'InfoHR',
  hotline: '1900-1234',
  careerOptions: MOCK_CAREERS,
  cityOptions: MOCK_CITIES,
  jobTypeOptions: [
    { id: 1, name: 'Toàn thời gian' },
    { id: 2, name: 'Bán thời gian' },
    { id: 3, name: 'Thực tập' },
  ],
  typeOfWorkplaceOptions: [
    { id: 1, name: 'Làm việc tại văn phòng' },
    { id: 2, name: 'Hybrid' },
    { id: 3, name: 'Remote / Từ xa' },
  ],
  positionOptions: [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Trưởng nhóm' },
    { id: 3, name: 'Chuyên viên' },
    { id: 4, name: 'Nhân viên' },
  ],
  experienceOptions: [
    { id: 1, name: 'Chưa có kinh nghiệm' },
    { id: 2, name: '1 năm' },
    { id: 3, name: '2 năm' },
    { id: 4, name: '3 năm' },
    { id: 5, name: 'Trên 5 năm' },
  ],
  genderOptions: [
    { id: 'M', name: 'Nam' },
    { id: 'F', name: 'Nữ' },
    { id: 'O', name: 'Khác' },
  ],
  frequencyNotificationOptions: [
    { id: 1, name: 'Hàng ngày' },
    { id: 2, name: '3 ngày/lần' },
    { id: 3, name: 'Hàng tuần' },
  ],
  academicLevelOptions: [
    { id: 1, name: 'Trung học' },
    { id: 2, name: 'Trung cấp' },
    { id: 3, name: 'Cao đẳng' },
    { id: 4, name: 'Đại học' },
    { id: 5, name: 'Sau đại học' },
  ],
  academicLevelDict: {
    '1': 'Trung học',
    '2': 'Trung cấp',
    '3': 'Cao đẳng',
    '4': 'Đại học',
    '5': 'Sau đại học',
  },
  applicationStatusOptions: [
    { id: 1, name: 'Chờ xác nhận' },
    { id: 2, name: 'Đã liên hệ' },
    { id: 3, name: 'Đã làm bài test' },
    { id: 4, name: 'Đã phỏng vấn' },
    { id: 5, name: 'Đã tuyển dụng' },
    { id: 6, name: 'Không phù hợp' },
  ],
  applicationStatusDict: {
    '1': 'Chờ xác nhận',
    '2': 'Đã liên hệ',
    '3': 'Đã làm bài test',
    '4': 'Đã phỏng vấn',
    '5': 'Đã tuyển dụng',
    '6': 'Không phù hợp',
  },
  jobPostStatusOptions: [
    { id: 1, name: 'Chờ duyệt' },
    { id: 2, name: 'Đang hiển thị' },
    { id: 3, name: 'Hết hạn' },
    { id: 4, name: 'Từ chối' },
  ],
  jobPostStatusDict: {
    '1': 'Chờ duyệt',
    '2': 'Đang hiển thị',
    '3': 'Hết hạn',
    '4': 'Từ chối',
  },
  careerDict: {
    '1': 'Công nghệ thông tin / Phần mềm',
    '2': 'Kinh doanh / Bán hàng',
    '3': 'Marketing / Truyền thông',
    '4': 'Nhân sự / Tuyển dụng',
    '5': 'Kế toán / Tài chính',
  },
  cityDict: {
    '1': 'Thành phố Hà Nội',
    '2': 'Thành phố Hồ Chí Minh',
    '3': 'Đà Nẵng',
    '4': 'Bình Dương',
  },
  jobTypeDict: {
    '1': 'Toàn thời gian',
    '2': 'Bán thời gian',
    '3': 'Thực tập',
  },
  typeOfWorkplaceDict: {
    '1': 'Làm việc tại văn phòng',
    '2': 'Hybrid',
    '3': 'Remote / Từ xa',
  },
  positionDict: {
    '1': 'Quản lý',
    '2': 'Trưởng nhóm',
    '3': 'Chuyên viên',
    '4': 'Nhân viên',
  },
  experienceDict: {
    '1': 'Chưa có kinh nghiệm',
    '2': '1 năm',
    '3': '2 năm',
    '4': '3 năm',
    '5': 'Trên 5 năm',
  },
  genderDict: {
    'M': 'Nam',
    'F': 'Nữ',
    'O': 'Khác',
  },
  employeeSizeDict: {
    '1': 'Dưới 20 nhân viên',
    '2': '20 - 50 nhân viên',
    '3': '50 - 100 nhân viên',
    '4': 'Trên 100 nhân viên',
  },
};

export const MOCK_EMPLOYER_STATS = {
  general: {
    totalJobPost: 12,
    totalJobPostingPendingApproval: 2,
    totalJobPostExpired: 1,
    totalApply: 45,
    totalFollowers: 120,
    totalSavedProfiles: 15,
    totalInterviews: 8,
    totalInterviewsCompleted: 6,
    totalInterviewsInProgress: 2,
    avgAiOverallScore: 82,
    avgAiTechnicalScore: 85,
    avgAiCommunicationScore: 80,
    conversionRate: 15,
  },
  recruitment: [
    { label: 'Tin đang đăng', data: [8, 9, 10, 11, 11, 12, 12] },
  ],
  recruitmentByRank: {
    data: [5, 4, 2, 1],
    labels: ['Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  },
  application: {
    title1: 'Hồ sơ ứng tuyển',
    title2: 'Phù hợp',
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    data1: [5, 8, 12, 6, 9, 4, 1],
    data2: [3, 4, 7, 4, 5, 2, 0],
    backgroundColor1: '#2563EB',
    backgroundColor2: '#10B981',
  },
  candidate: {
    title1: 'Ứng viên mới',
    title2: 'Ứng viên tiếp cận',
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    data1: [4, 7, 10, 5, 8, 3, 1],
    data2: [2, 3, 5, 3, 4, 2, 0],
    borderColor1: '#2563EB',
    backgroundColor1: '#2563EB',
    borderColor2: '#10B981',
    backgroundColor2: '#10B981',
  },
  interview: {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    completedData: [1, 2, 1, 0, 1, 1, 0],
    scheduledData: [2, 1, 2, 1, 1, 0, 0],
    cancelledData: [0, 0, 0, 0, 0, 0, 0],
    inProgressData: [0, 1, 0, 0, 1, 0, 0],
    avgScoreData: [80, 85, 82, 78, 88, 80, 0],
    passedCount: 5,
    failedCount: 1,
    pendingCount: 2,
    avgDurationSeconds: 1800,
  },
};

export const MOCK_APPLIED_RESUMES = [
  {
    id: 10,
    fullName: 'Nguyen Van Ung Vien',
    candidate_name: 'Nguyen Van Ung Vien',
    email: 'candidate.e2e@infohr.vn',
    candidate_email: 'candidate.e2e@infohr.vn',
    phone: '0901234567',
    title: 'Senior Frontend CV',
    job_post_title: MOCK_JOBS[0].job_name,
    jobPostTitle: MOCK_JOBS[0].job_name,
    jobPostDict: {
      id: MOCK_JOBS[0].id,
      jobName: MOCK_JOBS[0].job_name,
      slug: MOCK_JOBS[0].slug,
    },
    apply_date: '2026-09-20',
    createAt: '2026-09-20T08:00:00Z',
    status: 1,
    statusName: 'Chờ xác nhận',
    aiAnalysisScore: 88,
    aiAnalysisStatus: 'completed' as const,
    aiAnalysisSummary: 'Ứng viên có 4 năm kinh nghiệm React và TypeScript, phù hợp với yêu cầu vị trí.',
  },
  {
    id: 11,
    fullName: 'Tran Thi Phu Hop',
    candidate_name: 'Tran Thi Phu Hop',
    email: 'tranthiphuhop@infohr.vn',
    candidate_email: 'tranthiphuhop@infohr.vn',
    phone: '0912345678',
    title: 'Fullstack CV',
    job_post_title: MOCK_JOBS[0].job_name,
    jobPostTitle: MOCK_JOBS[0].job_name,
    jobPostDict: {
      id: MOCK_JOBS[0].id,
      jobName: MOCK_JOBS[0].job_name,
      slug: MOCK_JOBS[0].slug,
    },
    apply_date: '2026-09-21',
    createAt: '2026-09-21T09:00:00Z',
    status: 2,
    statusName: 'Phù hợp',
    aiAnalysisScore: 92,
    aiAnalysisStatus: 'completed' as const,
    aiAnalysisSummary: 'Hồ sơ xuất sắc với kinh nghiệm React, Python Django và AWS.',
  },
  {
    id: 12,
    fullName: 'Le Van Phong Van',
    candidate_name: 'Le Van Phong Van',
    email: 'levanphongvan@infohr.vn',
    candidate_email: 'levanphongvan@infohr.vn',
    phone: '0934567890',
    title: 'Lead Engineer CV',
    job_post_title: MOCK_JOBS[0].job_name,
    jobPostTitle: MOCK_JOBS[0].job_name,
    jobPostDict: {
      id: MOCK_JOBS[0].id,
      jobName: MOCK_JOBS[0].job_name,
      slug: MOCK_JOBS[0].slug,
    },
    apply_date: '2026-09-21',
    createAt: '2026-09-21T10:00:00Z',
    status: 4,
    statusName: 'Phỏng vấn',
    aiAnalysisScore: 85,
    aiAnalysisStatus: 'completed' as const,
    aiAnalysisSummary: 'Đã hoàn thành vòng phỏng vấn kỹ thuật bước 1.',
  },
  {
    id: 13,
    fullName: 'Pham Thi Tu Choi',
    candidate_name: 'Pham Thi Tu Choi',
    email: 'phamthituchoi@infohr.vn',
    candidate_email: 'phamthituchoi@infohr.vn',
    phone: '0978901234',
    title: 'Junior CV',
    job_post_title: MOCK_JOBS[0].job_name,
    jobPostTitle: MOCK_JOBS[0].job_name,
    jobPostDict: {
      id: MOCK_JOBS[0].id,
      jobName: MOCK_JOBS[0].job_name,
      slug: MOCK_JOBS[0].slug,
    },
    apply_date: '2026-09-22',
    createAt: '2026-09-22T08:00:00Z',
    status: 6,
    statusName: 'Từ chối',
    aiAnalysisScore: 45,
    aiAnalysisStatus: 'completed' as const,
    aiAnalysisSummary: 'Chưa đủ số năm kinh nghiệm tối thiểu yêu cầu cho vị trí Senior.',
  },
];

export const MOCK_QUESTIONS = [
  {
    id: 1,
    title: 'Kinh nghiệm phát triển React & TypeScript',
    text: 'Hãy giới thiệu về bản thân và kinh nghiệm làm việc với React, TypeScript?',
    question_text: 'Hãy giới thiệu về bản thân và kinh nghiệm làm việc với React, TypeScript?',
    questionText: 'Hãy giới thiệu về bản thân và kinh nghiệm làm việc với React, TypeScript?',
    category: 'technical',
    category_display: 'Kỹ thuật',
    difficulty: 2,
    difficulty_display: 'Trung bình',
    default_duration_seconds: 120,
    canWrite: true,
    is_public: false,
    career: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    company: 10,
  },
  {
    id: 2,
    title: 'Xử lý xung đột và làm việc nhóm',
    text: 'Bạn xử lý như thế nào khi có bất đồng quan điểm kỹ thuật với đồng nghiệp trong nhóm?',
    question_text: 'Bạn xử lý như thế nào khi có bất đồng quan điểm kỹ thuật với đồng nghiệp trong nhóm?',
    questionText: 'Bạn xử lý như thế nào khi có bất đồng quan điểm kỹ thuật với đồng nghiệp trong nhóm?',
    category: 'culture_fit',
    category_display: 'Văn hóa & Đội ngũ',
    difficulty: 1,
    difficulty_display: 'Dễ',
    default_duration_seconds: 90,
    canWrite: true,
    is_public: false,
    career: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    company: 10,
  },
];

export const MOCK_QUESTION_GROUPS = [
  {
    id: 1,
    name: 'Kịch bản phỏng vấn Senior Fullstack Engineer',
    description: 'Bộ câu hỏi đánh giá chuyên sâu kiến trúc frontend và backend',
    question_ids: [1, 2],
    is_public: false,
  },
];

/**
 * Mocks baseline system endpoints required on almost every page (configs, careers, cities, translations)
 */
export async function setupCommonApiMocks(page: Page) {
  // Configs
  await page.route(/\/common\/configs\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SYSTEM_CONFIGS),
    });
  });

  // All careers
  await page.route(/\/common\/(all-careers|careers|top-careers)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_CAREERS.length, results: MOCK_CAREERS }),
    });
  });

  // All cities
  await page.route(/\/common\/(all-cities|cities)\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_CITIES.length, results: MOCK_CITIES }),
    });
  });

  // Districts
  await page.route(/\/common\/districts\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        results: [
          { id: 1, name: 'Cầu Giấy' },
          { id: 2, name: 'Quận 1' },
        ],
      }),
    });
  });

  // Wards
  await page.route(/\/common\/wards\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        results: [
          { id: 1, name: 'Dịch Vọng Hậu' },
          { id: 2, name: 'Bến Nghé' },
        ],
      }),
    });
  });

  // Mock interview sessions endpoint to avoid 401s from background polling in employer layout
  await page.route(/\/interview\/web\/sessions(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Mock notifications / chat unread count
  await page.route(/\/notification\/.*(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Health check endpoint
  await page.route(/(common\/health|api\/.*\/common\/health)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', database: 'ok', redis: 'ok' }),
    });
  });

  // AI health check endpoint (AIServiceHealthBanner)
  await page.route(/(ai\/health|api\/.*\/ai\/health)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ready',
        checks: {
          llm: { status: 'online', latencyMs: 38 },
          stt: { status: 'online', latencyMs: 24 },
          tts: { status: 'online', latencyMs: 20 },
          livekit: { status: 'online', latencyMs: 15 },
          celery: { status: 'online', latencyMs: 5 },
        },
      }),
    });
  });

  // Mock content banners and article categories to avoid 401s from public pages
  await page.route(/\/content\/web\/banner\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/content\/web\/article-categories\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock top companies
  await page.route(/\/info\/web\/companies\/top\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock popular keywords to avoid 401s from public job search inputs
  await page.route(/\/common\/popular-keywords\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'React' },
        { id: 2, name: 'Python' },
        { id: 3, name: 'Node.js' },
      ]),
    });
  });

  // Mock external OpenStreetMap & CartoCDN tile requests to prevent ERR_CONNECTION_RESET
  await page.route(/(tile\.openstreetmap\.org|basemaps\.cartocdn\.com).*\.(png|jpg|jpeg)$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'),
    });
  });

  // Mock Nominatim & Photon geocoding API
  await page.route(/(nominatim\.openstreetmap\.org|photon\.komoot\.io).*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          place_id: 1,
          lat: '21.0285',
          lon: '105.8542',
          display_name: 'Duy Tân, Cầu Giấy, Hà Nội, Việt Nam',
          address: {
            road: 'Duy Tân',
            suburb: 'Dịch Vọng Hậu',
            city_district: 'Cầu Giấy',
            city: 'Thành phố Hà Nội',
            country: 'Việt Nam',
          },
        },
      ]),
    });
  });

  // Mock AI Chatbot config
  await page.route(/(ai\/chatbot\/config|api\/.*\/ai\/chatbot\/config)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        enabled: false,
        name: 'AILA Assistant',
      }),
    });
  });
}

let currentMockUser: Record<string, any> | null = null;

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
    isOnboarded?: boolean;
  }
) {
  const {
    role,
    id = 1,
    email = 'user@infohr.vn',
    fullName = 'InfoHR User',
    companyId = 10,
    companyName = 'InfoHR Corp',
    isOnboarded = true,
  } = options;

  currentMockUser = {
    id,
    email,
    full_name: fullName,
    fullName: fullName,
    phone_number: '0901234567',
    phoneNumber: '0901234567',
    role_name: role,
    roleName: role,
    is_onboarded: isOnboarded,
    isOnboarded: isOnboarded,
    onboarding_step: isOnboarded ? 4 : 1,
    onboardingStep: isOnboarded ? 4 : 1,
    has_company: role === 'EMPLOYER',
    hasCompany: role === 'EMPLOYER',
    job_seeker_profile_id: role === 'JOB_SEEKER' ? id : null,
    jobSeekerProfileId: role === 'JOB_SEEKER' ? id : null,
    workspaces:
      role === 'EMPLOYER'
        ? [{ type: 'company', company_id: companyId, label: companyName, is_default: true }]
        : [{ type: 'job_seeker', id: 101, label: 'Ứng viên', is_default: true }],
  };

  await page.route('**/auth/user-info-basic/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentMockUser),
    });
  });

  await page.route('**/auth/user-workspaces/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        workspaces:
          role === 'EMPLOYER'
            ? [{ type: 'company', company_id: companyId, label: companyName, is_default: true }]
            : [{ type: 'job_seeker', id: 101, label: 'Ứng viên', is_default: true }],
      }),
    });
  });

  // Onboarding status endpoint (used by candidate & employer completeness cards)
  await page.route(/\/auth\/onboarding\/status\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        isOnboarded: isOnboarded,
        onboardingStep: isOnboarded ? 4 : 1,
        profileCompleteness: isOnboarded ? 100 : 35,
        completedSteps: isOnboarded ? ['basic', 'details', 'complete'] : [],
        pendingSteps: isOnboarded ? [] : ['basic', 'details', 'complete'],
      }),
    });
  });

  if (role === 'ADMIN') {
    await page.route('**/api/**/admin/company-verifications/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: MOCK_COMPANY_VERIFICATIONS.length, results: MOCK_COMPANY_VERIFICATIONS }) });
    });
    await page.route('**/api/**/admin/trust-reports/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: MOCK_TRUST_REPORTS.length, results: MOCK_TRUST_REPORTS }) });
    });
    await page.route('**/api/**/admin/contact-messages/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0, results: [] }) });
    });
  }

  // Credential pre-check endpoint
  await page.route('**/auth/check-creds/**', async (route) => {
    const postData = route.request().postDataJSON() || {};
    const reqEmail = postData.email || email;
    if (reqEmail.includes('wrong') || reqEmail.includes('notfound')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          exists: false,
          email: reqEmail,
          email_verified: false,
          emailVerified: false,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        exists: true,
        email: reqEmail,
        email_verified: true,
        emailVerified: true,
        other_role: null,
        otherRole: null,
      }),
    });
  });

  // Token endpoint for direct login submissions
  await page.route('**/auth/token/**', async (route) => {
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

export const MOCK_CANDIDATE_PROFILE = {
  id: 101,
  user: {
    id: 101,
    email: 'candidate.e2e@infohr.vn',
    full_name: 'Nguyen Van Ung Vien',
    fullName: 'Nguyen Van Ung Vien',
    phone: '0901234567',
  },
  fullName: 'Nguyen Van Ung Vien',
  email: 'candidate.e2e@infohr.vn',
  title: 'Senior Fullstack Engineer',
  phone: '0901234567',
  phoneNumber: '0901234567',
  birthday: '1995-05-15',
  gender: 'M',
  marital_status: 'S',
  location: {
    city: { id: 1, name: 'Thành phố Hà Nội' },
    district: { id: 1, name: 'Cầu Giấy' },
    address: 'Duy Tân, Cầu Giấy, Hà Nội',
  },
  education: 'Đại học Bách Khoa Hà Nội',
  experience: '5 năm kinh nghiệm lập trình Fullstack React & Python Django',
  career: { id: 1, name: 'Công nghệ thông tin / Phần mềm' },
  bio: 'Lập trình viên nhiệt huyết, yêu thích kiến trúc microservices và WebRTC.',
  is_job_seeking: true,
  is_phone_verified: true,
};

export const MOCK_CANDIDATE_RESUMES = [
  {
    id: 501,
    slug: 'resume-senior-fullstack-engineer-501',
    title: 'CV Senior Fullstack Engineer 2026',
    type: 1,
    resume_type: 1,
    is_active: true,
    file_url: 'https://infohr.vn/sample-cv.pdf',
    update_at: '2026-09-20',
  },
];

export const MOCK_CV_TEMPLATES = [
  {
    id: 1,
    code: 'modern-navy',
    name: 'Modern Navy Professional',
    vietnamese_name: 'Đảo Phú Quốc',
    category: 'MODERN',
    thumbnail_url: '/assets/images/cv-templates/modern-navy.png',
    is_popular: true,
    default_colors: ['#1e40af', '#0284c7', '#059669', '#7c3aed', '#dc2626', '#1e293b'],
  },
  {
    id: 2,
    code: 'minimal-clean',
    name: 'Minimal Clean Slate',
    vietnamese_name: 'Đảo Nam Du',
    category: 'MINIMALIST',
    thumbnail_url: '/assets/images/cv-templates/minimal-clean.png',
    is_popular: true,
    default_colors: ['#0f172a', '#2563eb', '#0d9488', '#4b5563', '#b45309'],
  },
];

/**
 * Mocks Jobs API endpoints for Job Seeker flow
 */
export async function setupJobsApiMocks(page: Page) {
  // 1. Saved jobs list
  await page.route(/\/job\/web\/job-posts\/job-posts-saved\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
        total_pages: 1,
      }),
    });
  });

  // 2. Save / toggle save job post
  await page.route(/\/job\/web\/job-posts\/[^/]+\/save\/?/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        detail: 'Đã lưu việc làm thành công',
        is_saved: true,
        isSaved: true,
      }),
    });
  });

  // 3. Suggested jobs
  await page.route(/\/job\/web\/private-job-posts\/suggested-job-posts\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
        total_pages: 1,
      }),
    });
  });

  // 4. Detail for first mock job
  await page.route(new RegExp(`/job/web/job-posts/${MOCK_JOBS[0].slug}/?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_JOBS[0]),
    });
  });

  // 5. Detail for second mock job
  await page.route(new RegExp(`/job/web/job-posts/${MOCK_JOBS[1].slug}/?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_JOBS[1]),
    });
  });

  // 5b. AI Recommended jobs
  await page.route(/\/job\/web\/job-posts\/recommended-jobs\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
        total_pages: 1,
      }),
    });
  });

  // 6. Public job list (supports kw, careerId, cityId, jobTypeId filtering)
  await page.route(/\/job\/web\/job-posts\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = new URL(route.request().url());
      const kw = url.searchParams.get('kw')?.toLowerCase();
      const careerId = url.searchParams.get('careerId') || url.searchParams.get('career_id');
      const cityId = url.searchParams.get('cityId') || url.searchParams.get('city_id');
      const jobTypeId = url.searchParams.get('jobTypeId') || url.searchParams.get('job_type_id');

      let filtered = [...MOCK_JOBS];
      if (kw) {
        filtered = filtered.filter((j) => j.job_name.toLowerCase().includes(kw));
      }
      if (careerId) {
        filtered = filtered.filter((j) => String(typeof j.career === 'object' ? (j.career as any)?.id : j.career) === String(careerId));
      }
      if (cityId) {
        filtered = filtered.filter((j) => String(typeof j.location?.city === 'object' ? (j.location.city as any)?.id : j.location?.city) === String(cityId));
      }
      if (jobTypeId) {
        filtered = filtered.filter((j) => String(j.job_type) === String(jobTypeId));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: filtered.length,
          results: filtered,
          total_pages: 1,
        }),
      });
      return;
    }
    await route.continue();
  });

  // 7. Salary insight for job posts
  await page.route(/\/job\/web\/job-posts\/[^/]+\/salary-insight\/?/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        scope: 'sameCareerCity',
        confidence: 'high',
        count: 15,
        minSalary: 20000000,
        maxSalary: 50000000,
        avgMinSalary: 22000000,
        avgMaxSalary: 42000000,
        medianSalary: 32000000,
        p25Salary: 25000000,
        p75Salary: 40000000,
        currentSalaryMin: 25000000,
        currentSalaryMax: 45000000,
        currentMidSalary: 35000000,
        salaryDelta: 3000000,
        salaryDeltaPercent: 9.38,
        salaryPosition: 'above',
        relatedJobs: [],
      }),
    });
  });

  // 8. Job seeker job post activity (GET for applied list, POST for apply)
  await page.route(/\/job\/web\/job-seeker-job-posts-activity\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1,
          results: [
            {
              id: 999,
              create_at: '2026-09-20T08:30:00Z',
              createAt: '2026-09-20T08:30:00Z',
              status: 1,
              status_name: 'Đã nộp hồ sơ',
              job_post: MOCK_JOBS[0],
              jobPost: MOCK_JOBS[0],
              jobPostDict: {
                id: MOCK_JOBS[0].id,
                slug: MOCK_JOBS[0].slug,
                jobName: MOCK_JOBS[0].job_name,
                deadline: MOCK_JOBS[0].deadline,
                isUrgent: MOCK_JOBS[0].is_urgent,
                isHot: MOCK_JOBS[0].is_hot,
                salaryMin: MOCK_JOBS[0].salary_min,
                salaryMax: MOCK_JOBS[0].salary_max,
                companyDict: {
                  companyImageUrl: MOCK_JOBS[0].company.logo,
                  companyName: MOCK_JOBS[0].company.company_name,
                },
                locationDict: {
                  city: 1,
                },
              },
            },
          ],
        }),
      });
      return;
    }
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
 * Mocks Candidate Profile and Resumes endpoints
 */
export async function setupCandidateProfileApiMocks(page: Page) {
  // Get and update Profile
  await page.route(/\/info\/profile\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CANDIDATE_PROFILE),
      });
      return;
    }
    if (route.request().method() === 'PUT') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_CANDIDATE_PROFILE,
          ...data,
        }),
      });
      return;
    }
    await route.continue();
  });

  // Candidate resumes list
  await page.route(/\/info\/web\/job-seeker-profiles\/[^/]+\/resumes\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_CANDIDATE_RESUMES.length,
        results: MOCK_CANDIDATE_RESUMES,
      }),
    });
  });

  // Private resumes update & get
  await page.route(/\/info\/web\/private-resumes\/[^/]+\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CANDIDATE_RESUMES[0]),
      });
      return;
    }
    const data = route.request().postDataJSON() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_CANDIDATE_RESUMES[0],
        ...data,
      }),
    });
  });
}

/**
 * Mocks CV Builder endpoints
 */
export async function setupCvBuilderApiMocks(page: Page) {
  // CV templates
  await page.route(/\/cv\/templates\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_CV_TEMPLATES.length,
        results: MOCK_CV_TEMPLATES,
      }),
    });
  });

  // Candidate CVs list & create
  await page.route(/\/cv\/candidate-cvs\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 0,
          results: [],
        }),
      });
      return;
    }
    if (route.request().method() === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 888,
          slug: 'cv-ung-tuyen-888',
          title: data.title || 'CV Ứng tuyển',
          template_code: data.template_code || 'modern-navy',
          theme_config: data.theme_config || {},
          cv_data: data.cv_data || {},
          is_public: true,
          is_main_cv: false,
        }),
      });
      return;
    }
    await route.continue();
  });

  // Candidate CV update
  await page.route(/\/cv\/candidate-cvs\/\d+\/?$/, async (route) => {
    const data = route.request().postDataJSON() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 888,
        slug: 'cv-ung-tuyen-888',
        ...data,
      }),
    });
  });
}

/**
 * Mocks Employer API endpoints
 */
export async function setupEmployerApiMocks(page: Page) {
  // Employer Statistics
  await page.route(/\/job\/web\/statistics\/employer\/?(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const type = url.searchParams.get('type') || 'general';

    if (type === 'general') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.general),
      });
      return;
    }

    if (type === 'application') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.application),
      });
      return;
    }

    if (type === 'candidate') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.candidate),
      });
      return;
    }

    if (type === 'recruitment') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.recruitment),
      });
      return;
    }

    if (type === 'recruitment-by-rank') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.recruitmentByRank),
      });
      return;
    }

    if (type === 'interview') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EMPLOYER_STATS.interview),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_EMPLOYER_STATS.general),
    });
  });

  // Employer Company Profile
  await page.route(/\/info\/web\/company\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 10,
        company_name: 'InfoHR Tech Corp',
        companyName: 'InfoHR Tech Corp',
        tax_code: '0109876543',
        email: 'employer.e2e@infohr.vn',
        phone: '0901234567',
        address: 'Duy Tân, Cầu Giấy, Hà Nội',
        is_verified: true,
        isVerified: true,
      }),
    });
  });

  // Job Search Suggestion
  await page.route(/\/job\/web\/search\/job-suggest-title\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: ['Senior Fullstack Engineer', 'Frontend Lead', 'AI Voice Engineer'],
      }),
    });
  });

  // Job Post Options
  await page.route(/\/job\/web\/private-job-posts\/job-posts-options\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          { id: MOCK_JOBS[0].id, jobName: MOCK_JOBS[0].job_name },
          { id: MOCK_JOBS[1].id, jobName: MOCK_JOBS[1].job_name },
        ],
      }),
    });
  });

  // Single Private Job Post (detail, update, delete)
  await page.route(/\/job\/web\/private-job-posts\/(101|102|senior-fullstack-engineer-101|hr-talent-acquisition-lead-102)\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_JOBS[0]),
      });
      return;
    }

    if (method === 'PUT' || method === 'PATCH') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_JOBS[0],
          ...data,
          job_name: data.jobName || MOCK_JOBS[0].job_name,
        }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.continue();
  });

  // Private Job Posts List & Create
  await page.route(/\/job\/web\/private-job-posts\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 103,
          slug: 'senior-fullstack-engineer-103',
          job_name: data.jobName || 'Tin tuyển dụng mới',
          jobName: data.jobName || 'Tin tuyển dụng mới',
          ...data,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_JOBS.length,
        results: MOCK_JOBS,
      }),
    });
  });

  // Employer Applied Profiles Status Update
  await page.route(/\/job\/web\/employer-job-posts-activity\/[^/]+\/application-status\/?(\?.*)?$/, async (route) => {
    const body = route.request().postDataJSON() || {};
    const nextStatus = Number(body.status) || 2;
    const statusLabels: Record<number, string> = {
      1: 'Chờ xác nhận',
      2: 'Phù hợp',
      3: 'Đã làm bài test',
      4: 'Phỏng vấn',
      5: 'Đã tuyển dụng',
      6: 'Từ chối',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...MOCK_APPLIED_RESUMES[0],
        status: nextStatus,
        statusName: statusLabels[nextStatus] || 'Đã cập nhật',
      }),
    });
  });

  // Employer Applied Profiles (both employer-job-posts-activity and legacy path)
  await page.route(/\/job\/web\/(employer-job-posts-activity|employer\/job-post-activities)\/?(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const status = url.searchParams.get('status');

    let list = [...MOCK_APPLIED_RESUMES];
    if (status) {
      list = list.filter((r) => String(r.status) === String(status));
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: list.length,
        results: list,
      }),
    });
  });

  // Question Bank (list & create)
  await page.route(/\/interview\/web\/questions\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newQuestion = {
        id: 99,
        title: data.title || data.text || 'Câu hỏi phỏng vấn mới',
        text: data.text || '',
        question_text: data.text || '',
        questionText: data.text || '',
        category: data.category || 'technical',
        category_display: data.category === 'culture_fit' ? 'Văn hóa & Đội ngũ' : 'Kỹ thuật',
        difficulty: data.difficulty || 2,
        difficulty_display: 'Tiêu chuẩn',
        default_duration_seconds: data.default_duration_seconds || 120,
        canWrite: true,
        company: 10,
        is_public: false,
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newQuestion),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_QUESTIONS.length,
        results: MOCK_QUESTIONS,
      }),
    });
  });

  // Question Bank detail / patch / delete
  await page.route(/\/interview\/web\/questions\/[^/]+\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'PATCH' || method === 'PUT') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_QUESTIONS[0],
          ...data,
        }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_QUESTIONS[0]),
    });
  });

  // Question Groups (Interview Scripts)
  await page.route(/\/interview\/web\/question-groups\/?(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 88,
          ...data,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_QUESTION_GROUPS.length,
        results: MOCK_QUESTION_GROUPS,
      }),
    });
  });

  // Resumes list (for /employer/candidates)
  await page.route(/\/job\/web\/resumes\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        results: [
          {
            id: 1,
            slug: 'nguyen-van-ung-vien-1',
            fullName: 'Nguyen Van Ung Vien',
            title: 'Senior Fullstack Engineer',
            career: { id: 1, name: 'Công nghệ thông tin' },
            city: { id: 1, name: 'Hà Nội' },
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
  await page.route(/\/native-hrm\/dashboard\/stats\/?/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        active_employees: 45,
        probation_employees: 3,
        pending_leaves: 2,
        expiring_contracts: 1,
        activeEmployees: 45,
        probationEmployees: 3,
        pendingLeaves: 2,
        expiringContracts: 1,
        department_breakdown: [
          { id: 1, name: 'Công nghệ thông tin', emp_count: 25 },
          { id: 2, name: 'Nhân sự & Vận hành', emp_count: 10 },
          { id: 3, name: 'Kinh doanh', emp_count: 10 },
        ],
        departmentBreakdown: [
          { id: 1, name: 'Công nghệ thông tin', empCount: 25 },
          { id: 2, name: 'Nhân sự & Vận hành', empCount: 10 },
          { id: 3, name: 'Kinh doanh', empCount: 10 },
        ],
      }),
    });
  });

  // HRM Employees (list & details & CRUD)
  await page.route(/\/native-hrm\/employees(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (url.includes('/export-payroll')) {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'Mã NV,Họ tên,Lương cơ bản\nEMP-001,Nguyễn Văn A,30000000\n',
      });
      return;
    }

    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newEmp = {
        id: 99,
        employee_code: 'EMP-099',
        employeeCode: 'EMP-099',
        first_name: data.first_name || 'Mới',
        last_name: data.last_name || 'Nhân viên',
        full_name: `${data.last_name || 'Nhân viên'} ${data.first_name || 'Mới'}`,
        fullName: `${data.last_name || 'Nhân viên'} ${data.first_name || 'Mới'}`,
        email: data.email || 'new.emp@infohr.vn',
        phone: data.phone || '0988888888',
        department: data.department || 1,
        department_name: 'Công nghệ thông tin',
        departmentName: 'Công nghệ thông tin',
        designation: data.designation || 1,
        designation_title: 'Nhân viên mới',
        designationTitle: 'Nhân viên mới',
        status: data.status || 'PROBATION',
        employment_type: data.employment_type || 'FULL_TIME',
        join_date: data.join_date || '2026-09-01',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newEmp),
      });
      return;
    }

    if (method === 'PATCH' || method === 'PUT') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_HRM_EMPLOYEES[0], ...data }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    // Single detail
    if (/\/native-hrm\/employees\/\d+\/?$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_HRM_EMPLOYEES[0]),
      });
      return;
    }

    // List
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
  await page.route(/\/native-hrm\/departments(\/|\?|$)/, async (route) => {
    const url = route.request().url();
    if (url.includes('/org-chart')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Ban Giám Đốc',
            children: [
              { id: 2, name: 'Công nghệ thông tin', children: [] },
              { id: 3, name: 'Nhân sự & Vận hành', children: [] },
            ],
          },
        ]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_DEPARTMENTS.length,
        results: MOCK_HRM_DEPARTMENTS,
      }),
    });
  });

  // HRM Designations
  await page.route(/\/native-hrm\/designations(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_DESIGNATIONS.length,
        results: MOCK_HRM_DESIGNATIONS,
      }),
    });
  });

  // HRM Contracts
  await page.route(/\/native-hrm\/contracts(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // HRM Leave Requests (approve, reject, list, create)
  await page.route(/\/native-hrm\/leave-requests(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (url.includes('/approve')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_HRM_LEAVE_REQUESTS[0], status: 'APPROVED', approved_by_name: 'Người quản lý' }),
      });
      return;
    }

    if (url.includes('/reject')) {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_HRM_LEAVE_REQUESTS[0], status: 'REJECTED', rejection_reason: data.rejection_reason || 'Từ chối' }),
      });
      return;
    }

    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newLeave = {
        id: 99,
        employee: Number(data.employee) || 1,
        employee_name: 'Nguyễn Văn A',
        employeeName: 'Nguyễn Văn A',
        leave_type: Number(data.leave_type) || 1,
        leaveType: Number(data.leave_type) || 1,
        leave_type_name: 'Nghỉ phép năm',
        leaveTypeName: 'Nghỉ phép năm',
        start_date: data.start_date || '2026-11-01',
        startDate: data.start_date || '2026-11-01',
        end_date: data.end_date || '2026-11-02',
        endDate: data.end_date || '2026-11-02',
        total_days: Number(data.total_days) || 1,
        totalDays: Number(data.total_days) || 1,
        reason: data.reason || 'Nghỉ phép đột xuất',
        status: 'PENDING',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newLeave),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_LEAVE_REQUESTS.length,
        results: MOCK_HRM_LEAVE_REQUESTS,
      }),
    });
  });

  // HRM Leave Types
  await page.route(/\/native-hrm\/leave-types(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_LEAVE_TYPES.length,
        results: MOCK_HRM_LEAVE_TYPES,
      }),
    });
  });

  // HRM Leave Balances
  await page.route(/\/native-hrm\/leave-balances(\/|\?|$)/, async (route) => {
    const url = route.request().url();
    if (url.includes('/auto-allocate')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cấp phát quỹ phép thành công.' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_LEAVE_BALANCES.length,
        results: MOCK_HRM_LEAVE_BALANCES,
      }),
    });
  });

  // HRM Timesheet / Attendance Overview
  await page.route(/\/native-hrm\/attendances\/timesheet(\/|\?|$)/, async (route) => {
    const today = new Date();
    const currentDay = today.getDate();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        total_days: 30,
        totalDays: 30,
        days: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          date: `2026-09-${String(i + 1).padStart(2, '0')}`,
          is_weekend: (i + 1) % 7 === 0 || (i + 1) % 7 === 6,
          isWeekend: (i + 1) % 7 === 0 || (i + 1) % 7 === 6,
        })),
        employees: [
          {
            employee_id: 1,
            employeeId: 1,
            employee_code: 'EMP-001',
            employeeCode: 'EMP-001',
            full_name: 'Nguyễn Văn A',
            fullName: 'Nguyễn Văn A',
            department_name: 'Công nghệ thông tin',
            departmentName: 'Công nghệ thông tin',
            records: {
              [currentDay]: {
                id: 101,
                status: 'PRESENT',
                working_hours: 8,
                workingHours: 8,
                check_in: '08:30:00',
                checkIn: '08:30:00',
                check_out: '17:30:00',
                checkOut: '17:30:00',
              },
            },
            stats: {
              total_present: 22,
              totalPresent: 22,
              total_late: 0,
              totalLate: 0,
              total_leave: 0,
              totalLeave: 0,
              total_hours: 176,
              totalHours: 176,
            },
          },
        ],
      }),
    });
  });

  // Quick Checkin
  await page.route(/\/native-hrm\/attendances\/quick-checkin(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Chấm công thành công!' }),
    });
  });

  // Work Shifts
  await page.route(/\/native-hrm\/work-shifts(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 99, ...data, is_active: true }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_WORK_SHIFTS.length,
        results: MOCK_HRM_WORK_SHIFTS,
      }),
    });
  });

  // Shift Assignments
  await page.route(/\/native-hrm\/shift-assignments(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Phân ca thành công.', count: 1, assignments: [] }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Attendance Requests
  await page.route(/\/native-hrm\/attendance-requests(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_ATTENDANCE_REQUESTS.length,
        results: MOCK_HRM_ATTENDANCE_REQUESTS,
      }),
    });
  });

  // Biometric Logs
  await page.route(/\/native-hrm\/biometric-punch-logs(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Biometric Devices
  await page.route(/\/native-hrm\/biometric-devices(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Work Locations
  await page.route(/\/native-hrm\/work-locations(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Payroll KPIs
  await page.route(/\/native-hrm\/payroll\/summary-kpis(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_HRM_PAYROLL_KPIS),
    });
  });

  // Payroll Calculate
  await page.route(/\/native-hrm\/payroll\/calculate(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Tính lương tự động thành công.',
        records: MOCK_HRM_PAYROLL_RECORDS,
      }),
    });
  });

  // Payroll Approve All
  await page.route(/\/native-hrm\/payroll\/approve-all(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Duyệt toàn bộ bảng lương thành công.' }),
    });
  });

  // Payroll Mark Paid All
  await page.route(/\/native-hrm\/payroll\/mark-paid-all(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Đã thanh toán toàn bộ lương thành công.' }),
    });
  });

  // Payroll List
  await page.route(/\/native-hrm\/payroll(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_HRM_PAYROLL_RECORDS.length,
        results: MOCK_HRM_PAYROLL_RECORDS,
      }),
    });
  });

  // Career Histories
  await page.route(/\/native-hrm\/career-histories(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 88, ...data }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Employee Documents
  await page.route(/\/native-hrm\/documents(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 77, ...data }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Me
  await page.route(/\/native-hrm\/me(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ employee: MOCK_HRM_EMPLOYEES[0] }),
    });
  });
}

/**
 * Mocks Onboarding API endpoints for Candidate and Employer flows
 */
export async function setupOnboardingApiMocks(page: Page) {
  // Common File Upload (CV or GPKD or Avatar)
  await page.route(/\/common\/upload-file(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 888,
        url: 'https://minio.infohr.vn/cv/e2e-sample-resume.pdf',
        name: 'e2e-sample-resume.pdf',
      }),
    });
  });

  // Common Districts
  await page.route(/\/common\/districts(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        results: [
          { id: 1, name: 'Cầu Giấy' },
          { id: 2, name: 'Ba Đình' },
        ],
      }),
    });
  });

  // Onboarding status endpoint
  await page.route(/\/auth\/onboarding\/status(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        isOnboarded: false,
        profileCompleteness: 35,
        candidateDraft: null,
        employerDraft: null,
      }),
    });
  });

  // Candidate Step Save (Step 1, Step 2)
  await page.route(/\/auth\/onboarding\/candidate\/step(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Lưu bước hồ sơ ứng viên thành công.',
        onboardingStep: 2,
      }),
    });
  });

  // Candidate CV Smart Parse
  await page.route(
    (url) => url.pathname.includes('/auth/onboarding/candidate/parse-cv') || url.pathname.includes('/candidate-cv-parse'),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            desiredJobTitle: 'Kỹ sư phần mềm Fullstack',
            desired_job_title: 'Kỹ sư phần mềm Fullstack',
            skills: ['React', 'TypeScript', 'Next.js', 'Python'],
            experience: 3,
            phone: '0987654321',
            address: 'Duy Tân, Cầu Giấy, Hà Nội',
            careerId: 1,
            career_id: 1,
            cityId: 1,
            city_id: 1,
          },
        }),
      });
    }
  );

  // Skip Onboarding
  await page.route(/\/auth\/onboarding\/skip(\/|\?|$)/, async (route) => {
    const reqUrl = route.request().url();
    const authHeader = route.request().headers()['authorization'] || '';
    const cookieHeader = route.request().headers()['cookie'] || '';
    const isEmployer =
      authHeader.includes('employer') ||
      cookieHeader.includes('employer') ||
      reqUrl.includes('employer') ||
      currentMockUser?.roleName === 'EMPLOYER';

    const userData = isEmployer
      ? {
          id: 202,
          email: 'employer.e2e@infohr.vn',
          fullName: 'Tran Thi Tuyen Dung',
          full_name: 'Tran Thi Tuyen Dung',
          roleName: 'EMPLOYER',
          role_name: 'EMPLOYER',
          isOnboarded: false,
          is_onboarded: false,
          onboardingStep: -1,
          onboarding_step: -1,
          hasCompany: true,
          has_company: true,
        }
      : {
          id: 101,
          email: 'candidate.e2e@infohr.vn',
          fullName: 'Nguyen Van Ung Vien',
          full_name: 'Nguyen Van Ung Vien',
          roleName: 'JOB_SEEKER',
          role_name: 'JOB_SEEKER',
          isOnboarded: false,
          is_onboarded: false,
          onboardingStep: -1,
          onboarding_step: -1,
        };

    if (currentMockUser) {
      currentMockUser.onboardingStep = -1;
      currentMockUser.onboarding_step = -1;
      currentMockUser.isOnboarded = false;
      currentMockUser.is_onboarded = false;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Đã tạm hoãn thiết lập hồ sơ thành công.',
        user: userData,
        data: {
          message: 'Đã tạm hoãn thiết lập hồ sơ thành công.',
          user: userData,
        },
      }),
    });
  });

  // Tax Code Lookup
  await page.route(
    (url) => url.pathname.includes('/auth/onboarding/tax-lookup'),
    async (route) => {
      const parsedUrl = new URL(route.request().url());
      const postData = route.request().method() === 'POST' ? (route.request().postDataJSON() || {}) : {};
      const taxCode = parsedUrl.searchParams.get('tax_code') || parsedUrl.searchParams.get('taxCode') || postData.tax_code || postData.taxCode || '';

      if (taxCode.includes('DUPLICATE')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            exists: true,
            company: {
              id: 99,
              companyName: 'Tập đoàn Công nghệ Đã Tồn Tại',
              company_name: 'Tập đoàn Công nghệ Đã Tồn Tại',
              taxCode,
              tax_code: taxCode,
              address: 'Tòa nhà Landmark, Ba Đình, Hà Nội',
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          exists: false,
          company: {
            companyName: 'CÔNG TY TNHH CÔNG NGHỆ E2E TEST',
            company_name: 'CÔNG TY TNHH CÔNG NGHỆ E2E TEST',
            taxCode: taxCode || '0109876543',
            tax_code: taxCode || '0109876543',
            address: 'Tầng 12, Tòa nhà Landmark, Ba Đình, Hà Nội',
          },
        }),
      });
    }
  );

  // Join company request
  await page.route(
    (url) => url.pathname.includes('/auth/onboarding/employer/request-join'),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Yêu cầu gia nhập đã được gửi tới quản trị viên doanh nghiệp.',
          companyId: 99,
          companyName: 'Tập đoàn Công nghệ Đã Tồn Tại',
        }),
      });
    }
  );

  // Employer Step Save
  await page.route(/\/auth\/onboarding\/employer\/step(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Lưu bước hồ sơ doanh nghiệp thành công.',
        onboardingStep: 2,
      }),
    });
  });

  // Employer Onboarding submission / completion
  await page.route(
    (url) => url.pathname.includes('/auth/onboarding/employer') && !url.pathname.includes('/step') && !url.pathname.includes('/request-join'),
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Thiết lập thông tin doanh nghiệp thành công.',
          company: {
            id: 10,
            companyName: 'CÔNG TY TNHH CÔNG NGHỆ E2E TEST',
            company_name: 'CÔNG TY TNHH CÔNG NGHỆ E2E TEST',
          },
          user: {
            id: 202,
            email: 'employer.e2e@infohr.vn',
            fullName: 'Tran Thi Tuyen Dung',
            full_name: 'Tran Thi Tuyen Dung',
            roleName: 'EMPLOYER',
            role_name: 'EMPLOYER',
            isOnboarded: true,
            is_onboarded: true,
            hasCompany: true,
            has_company: true,
          },
        }),
      });
    }
  );

  // Candidate Onboarding submission / completion
  await page.route(
    (url) => url.pathname.includes('/auth/onboarding/candidate') && !url.pathname.includes('/step') && !url.pathname.includes('/parse-cv'),
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Lưu hồ sơ ứng viên thành công.',
          user: {
            id: 101,
            email: 'candidate.e2e@infohr.vn',
            fullName: 'Nguyen Van Ung Vien',
            full_name: 'Nguyen Van Ung Vien',
            roleName: 'JOB_SEEKER',
            role_name: 'JOB_SEEKER',
            isOnboarded: true,
            is_onboarded: true,
          },
          recommendedJobs: [
            {
              id: 101,
              slug: 'senior-fullstack-engineer-101',
              title: 'Senior Fullstack Engineer (React & Django)',
              companyName: 'InfoHR Tech Corp',
              cityName: 'Hà Nội',
              salaryText: '25 - 45 triệu',
            },
          ],
        }),
      });
    }
  );
}

/* -- Admin Governance Mocks ------------------------------------------------ */

export const MOCK_ADMIN_STATS = {
  totalUsers: 1250,
  totalEmployers: 180,
  totalJobSeekers: 1070,
  totalAdmins: 5,
  totalJobPosts: 450,
  totalJobPostsPending: 12,
  totalJobPostingPendingApproval: 12,
  totalJobPostsApproved: 410,
  totalJobPostsActive: 390,
  totalJobPostsRejected: 28,
  totalJobPostsExpired: 10,
  totalApplications: 1540,
  totalApplicationsPending: 320,
  totalApplicationsContacted: 400,
  totalApplicationsTested: 280,
  totalApplicationsInterviewed: 240,
  totalApplicationsHired: 180,
  totalApplicationsNotSelected: 120,
  totalCompanies: 210,
  totalCompaniesVerified: 165,
  totalCompaniesUnverified: 45,
  totalCompanyVerifications: 35,
  totalCompanyVerificationsPending: 5,
  totalCompanyVerificationsReviewing: 2,
  totalCompanyVerificationsRejected: 4,
  totalTrustReportsPending: 3,
  totalInterviews: 890,
  totalInterviewsDraft: 15,
  totalInterviewsScheduled: 65,
  totalInterviewsInProgress: 20,
  totalInterviewsCompleted: 750,
  totalInterviewsCancelled: 40,
  totalJobSeekerProfiles: 980,
  totalResumes: 1120,
  totalActiveResumes: 950,
  totalSavedJobPosts: 850,
  totalSavedResumes: 430,
  totalCompanyFollowers: 3200,
  totalResumeViews: 12500,
  totalQuestions: 150,
  totalQuestionGroups: 30,
  newUsers30d: 145,
  newEmployers30d: 25,
  newJobSeekers30d: 120,
  newJobPosts30d: 68,
  newApplications30d: 412,
  newInterviews30d: 185,
  avgAiOverallScore: 82,
};

export const MOCK_ADMIN_TREND_STATS = {
  days: 30,
  labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
  newUsers: [120, 150, 180, 210],
  newJobs: [40, 55, 60, 75],
  newApplications: [300, 420, 510, 600],
  newInterviews: [100, 140, 170, 220],
};

export const MOCK_ADMIN_USERS = [
  {
    id: 1,
    email: 'admin.e2e@infohr.vn',
    fullName: 'Hệ Thống Quản Trị',
    roleName: 'ADMIN',
    isActive: true,
    isStaff: true,
    isSuperuser: true,
    dateJoined: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'employer.e2e@infohr.vn',
    fullName: 'Trần Thị Tuyển Dụng',
    roleName: 'EMPLOYER',
    isActive: true,
    isStaff: false,
    isSuperuser: false,
    company: { id: 10, companyName: 'InfoHR Tech Corp' },
    dateJoined: '2025-03-10T00:00:00Z',
  },
  {
    id: 3,
    email: 'candidate.e2e@infohr.vn',
    fullName: 'Nguyễn Văn Ứng Viên',
    roleName: 'JOB_SEEKER',
    isActive: true,
    isStaff: false,
    isSuperuser: false,
    dateJoined: '2025-05-20T00:00:00Z',
  },
  {
    id: 4,
    email: 'locked.user@infohr.vn',
    fullName: 'Người Dùng Bị Khóa',
    roleName: 'JOB_SEEKER',
    isActive: false,
    isStaff: false,
    isSuperuser: false,
    dateJoined: '2025-06-15T00:00:00Z',
  },
];

export const MOCK_ADMIN_JOB_POSTS = [
  {
    id: 101,
    slug: 'senior-fullstack-engineer-101',
    job_name: 'Senior Fullstack Engineer (React & Django)',
    jobName: 'Senior Fullstack Engineer (React & Django)',
    company: { id: 10, companyName: 'InfoHR Tech Corp' },
    company_dict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    companyDict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    location: { city: { id: 1, name: 'Hà Nội' } },
    salary_min: 25000000,
    salary_max: 45000000,
    salaryMin: 25000000,
    salaryMax: 45000000,
    status: 1,
    status_name: 'Chờ duyệt',
    is_urgent: true,
    is_hot: true,
    create_at: '2026-09-20T08:00:00Z',
  },
  {
    id: 102,
    slug: 'hr-talent-acquisition-lead-102',
    job_name: 'HR & Talent Acquisition Lead',
    jobName: 'HR & Talent Acquisition Lead',
    company: { id: 10, companyName: 'InfoHR Tech Corp' },
    company_dict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    companyDict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    location: { city: { id: 2, name: 'Hồ Chí Minh' } },
    salary_min: 20000000,
    salary_max: 35000000,
    salaryMin: 20000000,
    salaryMax: 35000000,
    status: 2,
    status_name: 'Đã duyệt',
    is_urgent: false,
    is_hot: false,
    create_at: '2026-09-18T09:30:00Z',
  },
  {
    id: 103,
    slug: 'junior-devops-engineer-103',
    job_name: 'Junior DevOps Engineer',
    jobName: 'Junior DevOps Engineer',
    company: { id: 10, companyName: 'InfoHR Tech Corp' },
    company_dict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    companyDict: { id: 10, company_name: 'InfoHR Tech Corp', companyName: 'InfoHR Tech Corp' },
    location: { city: { id: 1, name: 'Hà Nội' } },
    salary_min: 15000000,
    salary_max: 22000000,
    salaryMin: 15000000,
    salaryMax: 22000000,
    status: 1,
    status_name: 'Chờ duyệt',
    is_urgent: false,
    is_hot: false,
    create_at: '2026-09-19T09:30:00Z',
  },
];

export const MOCK_COMPANY_VERIFICATIONS = [
  {
    id: 1,
    company: 10,
    companyId: 10,
    company_id: 10,
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    tax_code: '0101234567',
    taxCode: '0101234567',
    business_license: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    businessLicense: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    representative_name: 'Nguyen Van A',
    representativeName: 'Nguyen Van A',
    status: 'pending' as const,
    admin_note: null,
    adminNote: null,
    create_at: '2026-09-20T08:30:00Z',
    createAt: '2026-09-20T08:30:00Z',
  },
  {
    id: 2,
    company: 11,
    companyId: 11,
    company_id: 11,
    company_name: 'Square Software Global Ltd',
    companyName: 'Square Software Global Ltd',
    tax_code: '0309876543',
    taxCode: '0309876543',
    business_license: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    businessLicense: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    representative_name: 'Tran Thi B',
    representativeName: 'Tran Thi B',
    status: 'pending' as const,
    admin_note: null,
    adminNote: null,
    create_at: '2026-09-18T10:00:00Z',
    createAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 3,
    company: 12,
    companyId: 12,
    company_id: 12,
    company_name: 'FinTech Asia Co.',
    companyName: 'FinTech Asia Co.',
    tax_code: '0405678901',
    taxCode: '0405678901',
    business_license: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    businessLicense: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    representative_name: 'Le Van C',
    representativeName: 'Le Van C',
    status: 'approved' as const,
    admin_note: 'Hồ sơ pháp lý đầy đủ',
    adminNote: 'Hồ sơ pháp lý đầy đủ',
    create_at: '2026-09-17T11:00:00Z',
    createAt: '2026-09-17T11:00:00Z',
  },
  {
    id: 4,
    company: 13,
    companyId: 13,
    company_id: 13,
    company_name: 'MegaCorp Vietnam',
    companyName: 'MegaCorp Vietnam',
    tax_code: '0501122334',
    taxCode: '0501122334',
    business_license: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    businessLicense: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    representative_name: 'Pham Van D',
    representativeName: 'Pham Van D',
    status: 'rejected' as const,
    admin_note: 'Giấy phép hết hạn',
    adminNote: 'Giấy phép hết hạn',
    create_at: '2026-09-16T14:20:00Z',
    createAt: '2026-09-16T14:20:00Z',
  },
];

export const MOCK_ADMIN_SYSTEM_SETTINGS = {
  maintenanceMode: false,
  maintenance_mode: false,
  autoApproveJobs: true,
  auto_approve_jobs: true,
  emailNotifications: true,
  email_notifications: true,
  ttsSpeed: '0.92',
  tts_speed: '0.92',
  interviewQuestionGapSeconds: '2.0',
  interview_question_gap_seconds: '2.0',
  interviewMinimumSilenceSeconds: '1.2',
  interview_minimum_silence_seconds: '1.2',
  googleApiKey: 'AIzaSyFakeGoogleApiKeyForE2ETesting',
  google_api_key: 'AIzaSyFakeGoogleApiKeyForE2ETesting',
  supportEmail: 'support@infohr.vn',
  support_email: 'support@infohr.vn',
  chatbotTitle: 'AILA AI',
  chatbotSubtitle: 'Trợ lý tuyển dụng thông minh',
  chatbotEmployerGreeting: 'Xin chào Nhà tuyển dụng!',
  chatbotJobSeekerGreeting: 'Chào bạn! Tôi có thể hỗ trợ gì cho bạn hôm nay?',
  chatbotEmployerSuggestions: 'Cách đăng tin tuyển dụng hiệu quả; Quy trình phỏng vấn AI',
  chatbotJobSeekerSuggestions: 'Cách cải thiện CV; Luyện phỏng vấn thử cùng AI',
};

export const MOCK_ADMIN_INTERVIEW_SESSIONS = [
  {
    id: 101,
    room_name: 'room-interview-101',
    roomName: 'room-interview-101',
    candidate_name: 'Nguyen Van Ung Vien',
    candidateName: 'Nguyen Van Ung Vien',
    candidate_email: 'candidate.e2e@infohr.vn',
    candidateEmail: 'candidate.e2e@infohr.vn',
    job_name: 'Senior Fullstack Engineer',
    jobName: 'Senior Fullstack Engineer',
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    status: 'completed',
    scheduled_at: '2026-09-22T08:00:00Z',
    scheduledAt: '2026-09-22T08:00:00Z',
    start_time: '2026-09-22T08:02:00Z',
    startTime: '2026-09-22T08:02:00Z',
    end_time: '2026-09-22T08:25:00Z',
    endTime: '2026-09-22T08:25:00Z',
    duration: 1380,
    recording_url: 'https://s3.infohr.vn/recordings/room-101.mp4',
    recordingUrl: 'https://s3.infohr.vn/recordings/room-101.mp4',
    ai_score: 85,
    aiScore: 85,
  },
  {
    id: 102,
    room_name: 'room-interview-102',
    roomName: 'room-interview-102',
    candidate_name: 'Tran Thi Candidate',
    candidateName: 'Tran Thi Candidate',
    candidate_email: 'tranthi@infohr.vn',
    candidateEmail: 'tranthi@infohr.vn',
    job_name: 'AI Python Specialist',
    jobName: 'AI Python Specialist',
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    status: 'scheduled',
    scheduled_at: '2026-09-23T09:30:00Z',
    scheduledAt: '2026-09-23T09:30:00Z',
    start_time: null,
    startTime: null,
    end_time: null,
    endTime: null,
    duration: null,
    recording_url: null,
    recordingUrl: null,
    ai_score: null,
    aiScore: null,
  },
  {
    id: 103,
    room_name: 'room-interview-103',
    roomName: 'room-interview-103',
    candidate_name: 'Le Van Dev',
    candidateName: 'Le Van Dev',
    candidate_email: 'levandev@infohr.vn',
    candidateEmail: 'levandev@infohr.vn',
    job_name: 'Frontend React Lead',
    jobName: 'Frontend React Lead',
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    status: 'in_progress',
    scheduled_at: '2026-09-22T10:00:00Z',
    scheduledAt: '2026-09-22T10:00:00Z',
    start_time: '2026-09-22T10:01:00Z',
    startTime: '2026-09-22T10:01:00Z',
    end_time: null,
    endTime: null,
    duration: null,
    recording_url: null,
    recordingUrl: null,
    ai_score: null,
    aiScore: null,
  },
];

export const MOCK_TRUST_REPORTS = [
  {
    id: 1,
    reporter_email: 'candidate.e2e@infohr.vn',
    reporterEmail: 'candidate.e2e@infohr.vn',
    reporter_name: 'Nguyễn Văn Ứng Viên',
    reporterName: 'Nguyễn Văn Ứng Viên',
    target_type: 'job',
    targetType: 'job',
    target_id: '101',
    targetId: '101',
    target_title: 'Tin tuyển dụng có dấu hiệu thu phí',
    targetTitle: 'Tin tuyển dụng có dấu hiệu thu phí',
    reason: 'Nhà tuyển dụng yêu cầu nộp phí đặt cọc phỏng vấn',
    status: 'open',
    status_display: 'Chờ xử lý',
    statusDisplay: 'Chờ xử lý',
    create_at: '2026-09-21T10:00:00Z',
    createAt: '2026-09-21T10:00:00Z',
    reporter_dict: { email: 'candidate.e2e@infohr.vn' },
    reporterDict: { email: 'candidate.e2e@infohr.vn' },
  },
  {
    id: 2,
    reporter_email: 'employer.e2e@infohr.vn',
    reporterEmail: 'employer.e2e@infohr.vn',
    reporter_name: 'InfoHR Tech Corp',
    reporterName: 'InfoHR Tech Corp',
    target_type: 'company',
    targetType: 'company',
    target_id: '303',
    targetId: '303',
    target_title: 'Hồ sơ doanh nghiệp giả mạo chứng chỉ',
    targetTitle: 'Hồ sơ doanh nghiệp giả mạo chứng chỉ',
    reason: 'Khai báo sai lệch bằng cấp chuyên môn',
    status: 'resolved',
    status_display: 'Đã giải quyết',
    statusDisplay: 'Đã giải quyết',
    create_at: '2026-09-20T14:30:00Z',
    createAt: '2026-09-20T14:30:00Z',
    reporter_dict: { email: 'employer.e2e@infohr.vn' },
    reporterDict: { email: 'employer.e2e@infohr.vn' },
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    action: 'LOGIN',
    actor_email: 'admin.e2e@infohr.vn',
    actorEmail: 'admin.e2e@infohr.vn',
    resource_type: 'Auth',
    resourceType: 'Auth',
    resource_id: '303',
    resourceId: '303',
    ip_address: '127.0.0.1',
    ipAddress: '127.0.0.1',
    create_at: '2026-09-22T07:00:00Z',
    createAt: '2026-09-22T07:00:00Z',
  },
  {
    id: 2,
    action: 'APPROVE_JOB',
    actor_email: 'admin.e2e@infohr.vn',
    actorEmail: 'admin.e2e@infohr.vn',
    resource_type: 'JobPost',
    resourceType: 'JobPost',
    resource_id: '101',
    resourceId: '101',
    ip_address: '127.0.0.1',
    ipAddress: '127.0.0.1',
    create_at: '2026-09-22T07:15:00Z',
    createAt: '2026-09-22T07:15:00Z',
  },
  {
    id: 3,
    action: 'UPDATE_ROLE',
    actor_email: 'admin.e2e@infohr.vn',
    actorEmail: 'admin.e2e@infohr.vn',
    resource_type: 'User',
    resourceType: 'User',
    resource_id: '2',
    resourceId: '2',
    ip_address: '127.0.0.1',
    ipAddress: '127.0.0.1',
    create_at: '2026-09-22T07:30:00Z',
    createAt: '2026-09-22T07:30:00Z',
  },
];

export async function setupAdminApiMocks(page: Page) {
  // Statistics
  await page.route('**/api/**/job/web/statistics/admin/**', async (route) => {
    const url = route.request().url();
    if (url.includes('type=trend')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ADMIN_TREND_STATS) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ADMIN_STATS) });
  });

  // Jobs moderation
  await page.route('**/api/**/job/web/admin-job-posts/**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'PATCH' && url.includes('/approve/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_ADMIN_JOB_POSTS[0], status: 2, status_name: 'Đã duyệt' }),
      });
      return;
    }

    if (method === 'PATCH' && url.includes('/reject/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_ADMIN_JOB_POSTS[0], status: 3, status_name: 'Từ chối' }),
      });
      return;
    }

    if (method === 'POST' && url.includes('/bulk-approve/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ updatedCount: 2 }) });
      return;
    }

    if (method === 'POST' && url.includes('/bulk-reject/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ updatedCount: 2 }) });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_ADMIN_JOB_POSTS.length, results: MOCK_ADMIN_JOB_POSTS }),
    });
  });

  // Company verifications
  await page.route(/(info\/web\/admin\/company-verifications|api\/.*\/company-verifications)(\/|\?|$)/, async (route) => {
    const method = route.request().method();

    if (method === 'PATCH') {
      let payload: Record<string, unknown> = {};
      try {
        payload = route.request().postDataJSON() || {};
      } catch {
        // ignore
      }
      const targetStatus = (payload.status as string) || 'approved';
      const adminNote = (payload.adminNote as string) || (payload.admin_note as string) || (targetStatus === 'approved' ? 'Hồ sơ pháp lý hợp lệ' : 'Bị từ chối xác thực');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_COMPANY_VERIFICATIONS[0],
          status: targetStatus,
          adminNote,
          admin_note: adminNote,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_COMPANY_VERIFICATIONS.length, results: MOCK_COMPANY_VERIFICATIONS }),
    });
  });

  // User & role management
  await page.route('**/api/**/auth/users/**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'POST' && url.includes('/toggle-active/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isActive: true }) });
      return;
    }

    if (method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_ADMIN_USERS[1], roleName: 'ADMIN' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_ADMIN_USERS.length, results: MOCK_ADMIN_USERS }),
    });
  });

  // Trust reports
  await page.route(/(info\/web\/admin\/trust-reports|api\/.*\/trust-reports)(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      let payload: Record<string, unknown> = {};
      try {
        payload = route.request().postDataJSON() || {};
      } catch {
        // ignore
      }
      const targetStatus = (payload.status as string) || 'resolved';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_TRUST_REPORTS[0],
          status: targetStatus,
          status_display: targetStatus === 'resolved' ? 'Đã giải quyết' : 'Đã từ chối',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_TRUST_REPORTS.length, results: MOCK_TRUST_REPORTS }),
    });
  });

  // Audit logs
  await page.route('**/api/**/common/admin/audit-logs/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_AUDIT_LOGS.length, results: MOCK_AUDIT_LOGS }),
    });
  });

  // System Settings
  await page.route(/(admin\/web\/system-settings|api\/.*\/system-settings)(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      let payload: Record<string, unknown> = {};
      try {
        payload = route.request().postDataJSON() || {};
      } catch {
        // ignore
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_ADMIN_SYSTEM_SETTINGS,
          ...payload,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ADMIN_SYSTEM_SETTINGS),
    });
  });

  // Send Notification Demo
  await page.route(/(content\/send-noti-demo|api\/.*\/send-noti-demo)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Đã gửi thông báo thử nghiệm thành công' }),
    });
  });

  // LiveKit AI Interview Sessions
  await page.route(/(interview\/admin\/sessions|api\/.*\/interview\/admin\/sessions)(\/|\?|$)/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'PATCH') {
      let payload: Record<string, unknown> = {};
      try {
        payload = route.request().postDataJSON() || {};
      } catch {
        // ignore
      }
      const updatedStatus = (payload.status as string) || 'completed';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_ADMIN_INTERVIEW_SESSIONS[0],
          status: updatedStatus,
        }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    // Detail check: if URL ends with /{id}/
    const isDetail = /\/interview\/admin\/sessions\/\d+\/?$/.test(url);
    if (isDetail) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ADMIN_INTERVIEW_SESSIONS[0]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_ADMIN_INTERVIEW_SESSIONS.length,
        results: MOCK_ADMIN_INTERVIEW_SESSIONS,
      }),
    });
  });

  // Common Health check
  await page.route(/(common\/health|api\/.*\/common\/health)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', database: 'ok', redis: 'ok' }),
    });
  });

  // AI Service Health check (AIServiceHealthBanner)
  await page.route(/(ai\/health|api\/.*\/ai\/health)(\/|\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ready',
        checks: {
          llm: { status: 'online', latencyMs: 38 },
          stt: { status: 'online', latencyMs: 24 },
          tts: { status: 'online', latencyMs: 20 },
          livekit: { status: 'online', latencyMs: 15 },
          celery: { status: 'online', latencyMs: 5 },
        },
      }),
    });
  });
}

/* -- Voice AI & Interview Center Mocks ------------------------------------- */

export const MOCK_COMPANY_QUESTION_SETS = [
  {
    id: 1,
    name: 'Bộ câu hỏi Fullstack React & Python Django',
    description: 'Đánh giá kiến trúc Web, RESTful APIs, Next.js và tối ưu cơ sở dữ liệu',
    career_id: 1,
    careerId: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    careerName: 'Công nghệ thông tin / Phần mềm',
    seniority: 'senior',
    questions_count: 5,
    questionsCount: 5,
    questions: [
      {
        id: 1,
        text: 'Bạn hãy giới thiệu về bản thân và các dự án Fullstack tiêu biểu đã tham gia.',
        interviewer_intent: 'Đánh giá kinh nghiệm thực tế và khả năng tổng hợp dự án.',
      },
      {
        id: 2,
        text: 'Giải thích cơ chế xử lý bất đồng bộ và cách tối ưu hóa hiệu năng trong ứng dụng Next.js & React.',
        interviewer_intent: 'Kiểm tra độ sâu hiểu biết về React rendering lifecycle và SSR.',
      },
    ],
  },
];

export const MOCK_INTERVIEW_SESSION_SCHEDULED = {
  id: 777,
  invite_token: 'e2e-voice-ai-invite',
  inviteToken: 'e2e-voice-ai-invite',
  room_name: 'room-e2e-voice-ai',
  roomName: 'room-e2e-voice-ai',
  status: 'scheduled',
  type: 'mixed',
  session_type: 'official',
  sessionType: 'official',
  candidate_name: 'Nguyen Van Ung Vien',
  candidateName: 'Nguyen Van Ung Vien',
  candidate_email: 'candidate.e2e@infohr.vn',
  candidateEmail: 'candidate.e2e@infohr.vn',
  job_name: 'Senior Fullstack Engineer',
  jobName: 'Senior Fullstack Engineer',
  company_name: 'InfoHR Tech Corp',
  companyName: 'InfoHR Tech Corp',
  company_logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
  companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
  scheduled_at: '2026-09-25T10:00:00Z',
  scheduledAt: '2026-09-25T10:00:00Z',
  questions: [
    {
      id: 1,
      text: 'Bạn hãy giới thiệu về bản thân và kinh nghiệm làm việc nổi bật.',
      interviewer_intent: 'Đánh giá kinh nghiệm và phong thái tự tin của ứng viên.',
      answer_structure: 'Khái quát -> Kinh nghiệm cốt lõi -> Điểm mạnh',
    },
    {
      id: 2,
      text: 'Bạn xử lý bài toán hiệu năng cao và đồng thời (concurrency) trong backend Django như thế nào?',
      interviewer_intent: 'Kiểm tra kỹ năng kiến trúc backend và giải pháp caching/queue.',
      answer_structure: 'Nguyên nhân nghẽn -> Giải pháp Redis/Celery -> Giám sát',
    },
  ],
  transcripts: [],
  evaluations: [],
};

export const MOCK_INTERVIEW_SESSION_COMPLETED = {
  ...MOCK_INTERVIEW_SESSION_SCHEDULED,
  status: 'completed',
  start_time: '2026-09-25T10:00:00Z',
  startTime: '2026-09-25T10:00:00Z',
  end_time: '2026-09-25T10:25:00Z',
  endTime: '2026-09-25T10:25:00Z',
  duration: 1500,
  recording_url: 'http://localhost:9000/square/interviews/777/recording.mp4',
  recordingUrl: 'http://localhost:9000/square/interviews/777/recording.mp4',
  ai_overall_score: 88,
  aiOverallScore: 88,
  ai_technical_score: 90,
  aiTechnicalScore: 90,
  ai_communication_score: 85,
  aiCommunicationScore: 85,
  ai_summary: 'Ứng viên thể hiện năng lực chuyên môn xuất sắc trong hệ sinh thái React và Django. Diễn đạt mạch lạc, tư duy kiến trúc rõ ràng.',
  aiSummary: 'Ứng viên thể hiện năng lực chuyên môn xuất sắc trong hệ sinh thái React và Django. Diễn đạt mạch lạc, tư duy kiến trúc rõ ràng.',
  ai_strengths: 'Kiến thức vững chắc về Next.js SSR, tối ưu cơ sở dữ liệu MySQL, chủ động trong giao tiếp kỹ thuật.',
  aiStrengths: 'Kiến thức vững chắc về Next.js SSR, tối ưu cơ sở dữ liệu MySQL, chủ động trong giao tiếp kỹ thuật.',
  ai_weaknesses: 'Cần nâng cao thêm kinh nghiệm về Kubernetes và distributed tracing.',
  aiWeaknesses: 'Cần nâng cao thêm kinh nghiệm về Kubernetes và distributed tracing.',
  ai_detailed_feedback: 'Phù hợp cao với vị trí Senior Fullstack Engineer tại InfoHR Tech Corp.',
  aiDetailedFeedback: 'Phù hợp cao với vị trí Senior Fullstack Engineer tại InfoHR Tech Corp.',
};

export async function setupVoiceAiApiMocks(
  page: Page,
  options: {
    inviteToken?: string;
    roomName?: string;
    status?: 'scheduled' | 'in_progress' | 'completed';
    sessionType?: 'mock' | 'official';
  } = {}
) {
  const inviteToken = options.inviteToken || 'e2e-voice-ai-invite';
  const roomName = options.roomName || 'room-e2e-voice-ai';
  const status = options.status || 'scheduled';

  // Keep LiveKit WebSocket connected to prevent unexpected onDisconnected unmounts
  if (typeof (page as any).routeWebSocket === 'function') {
    try {
      await (page as any).routeWebSocket(/.*livekit.*/, (_ws: any) => {
        // Mock connection remains open without closing
      });
    } catch {
      // ignore if unsupported in environment
    }
  }

  // Question sets & question groups for practice
  await page.route('**/api/**/interview/web/question-groups/public/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_COMPANY_QUESTION_SETS),
    });
  });

  await page.route('**/api/**/interview/web/question-groups/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_COMPANY_QUESTION_SETS),
    });
  });

  await page.route('**/api/**/interview/web/question-sets/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_COMPANY_QUESTION_SETS),
    });
  });

  await page.route('**/api/**/interview/web/questions/bank/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  // Mock sessions create for practice
  await page.route('**/api/**/interview/web/mock-sessions/**', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 888,
        invite_token: 'practice-mock-token-888',
        interview_url: '/interview/practice-mock-token-888',
        room_name: 'room-practice-888',
        status: 'scheduled',
      }),
    });
  });

  // Resumes for practice prefill
  await page.route('**/api/**/job-seeker/resumes/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CANDIDATE_RESUMES),
    });
  });

  // Candidate profile and resumes for practice
  await page.route('**/api/**/info/web/job-seeker-profiles/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: MOCK_CANDIDATE_RESUMES.length, results: MOCK_CANDIDATE_RESUMES }),
    });
  });

  await page.route('**/api/**/info/profile/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CANDIDATE_PROFILE),
    });
  });

  // Presigned URL for video
  await page.route('**/api/**/common/presign/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'http://localhost:9000/square/interviews/777/recording.mp4' }),
    });
  });

  // Interview session detail & actions by invite token or room
  await page.route('**/api/**/interview/web/sessions/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/create-mock/')) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 888,
          invite_token: 'practice-mock-token-888',
          interview_url: '/interview/practice-mock-token-888',
          room_name: 'room-practice-888',
          status: 'scheduled',
        }),
      });
      return;
    }

    if (url.includes('/livekit-token/') || url.includes('/hr-presence-token/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'e2e-fake-livekit-token',
          serverUrl: 'ws://localhost:3000/livekit',
          roomName: roomName,
        }),
      });
      return;
    }

    if (url.includes('/warmup/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tts: 'ready', stt: 'ready' }),
      });
      return;
    }

    if (url.includes('/status/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          invite_token: inviteToken,
          room_name: roomName,
          status: 'in_progress',
        }),
      });
      return;
    }

    const baseSession = status === 'completed' ? MOCK_INTERVIEW_SESSION_COMPLETED : MOCK_INTERVIEW_SESSION_SCHEDULED;
    const sessionData = {
      ...baseSession,
      invite_token: inviteToken,
      inviteToken: inviteToken,
      room_name: roomName,
      roomName: roomName,
      ...(options.sessionType
        ? {
            session_type: options.sessionType,
            sessionType: options.sessionType,
            ...(options.sessionType === 'mock'
              ? { job_name: 'Luyện tập Fullstack Engineer cùng AI', jobName: 'Luyện tập Fullstack Engineer cùng AI' }
              : {}),
          }
        : {}),
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionData),
    });
  });
}

/**
 * ============================================================================
 * CANDIDATE (JOB SEEKER) ADVANCED E2E MOCKS
 * ============================================================================
 */

export const MOCK_CANDIDATE_CVS = [
  {
    id: 1,
    title: 'CV Lập trình viên Fullstack React & Python',
    slug: 'cv-lap-trinh-vien-fullstack-1',
    template: 1,
    template_code: 'modern-navy',
    templateCode: 'modern-navy',
    template_name: 'Modern Navy Professional',
    templateName: 'Modern Navy Professional',
    template_category: 'MODERN',
    templateCategory: 'MODERN',
    is_main_cv: true,
    isMainCv: true,
    is_public: true,
    isPublic: true,
    views_count: 42,
    viewsCount: 42,
    download_count: 15,
    downloadCount: 15,
    ai_score: 92,
    aiScore: 92,
    create_at: '2026-09-01T10:00:00Z',
    createAt: '2026-09-01T10:00:00Z',
    update_at: '2026-09-20T14:30:00Z',
    updateAt: '2026-09-20T14:30:00Z',
  },
  {
    id: 2,
    title: 'CV Frontend Lead Architecture',
    slug: 'cv-frontend-lead-architecture-2',
    template: 2,
    template_code: 'minimal-clean',
    templateCode: 'minimal-clean',
    template_name: 'Minimal Clean Slate',
    templateName: 'Minimal Clean Slate',
    template_category: 'MINIMALIST',
    templateCategory: 'MINIMALIST',
    is_main_cv: false,
    isMainCv: false,
    is_public: false,
    isPublic: false,
    views_count: 12,
    viewsCount: 12,
    download_count: 3,
    downloadCount: 3,
    ai_score: 85,
    aiScore: 85,
    create_at: '2026-09-05T09:00:00Z',
    createAt: '2026-09-05T09:00:00Z',
    update_at: '2026-09-18T11:00:00Z',
    updateAt: '2026-09-18T11:00:00Z',
  },
];

export const MOCK_CANDIDATE_INTERVIEW_SESSIONS = [
  {
    id: 901,
    invite_token: 'candidate-mock-session-901',
    inviteToken: 'candidate-mock-session-901',
    room_name: 'room-candidate-mock-901',
    roomName: 'room-candidate-mock-901',
    job_post: 101,
    job_name: 'Senior Fullstack Engineer (React & Django)',
    jobName: 'Senior Fullstack Engineer (React & Django)',
    company: 10,
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    session_type: 'mock',
    sessionType: 'mock',
    status: 'completed',
    scheduled_at: '2026-09-21T09:00:00Z',
    scheduledAt: '2026-09-21T09:00:00Z',
    start_time: '2026-09-21T09:00:00Z',
    startTime: '2026-09-21T09:00:00Z',
    end_time: '2026-09-21T09:25:00Z',
    endTime: '2026-09-21T09:25:00Z',
    duration_seconds: 1500,
    ai_overall_score: 8.5,
    aiOverallScore: 8.5,
    ai_technical_score: 8.8,
    aiTechnicalScore: 8.8,
    ai_communication_score: 8.2,
    aiCommunicationScore: 8.2,
    ai_strengths: 'Nắm vững kiến thức React, Next.js, tư duy cấu trúc thuật toán tốt.',
    aiStrengths: 'Nắm vững kiến thức React, Next.js, tư duy cấu trúc thuật toán tốt.',
    ai_weaknesses: 'Cần tự tin hơn khi trình bày các giải pháp tối ưu hóa cơ sở dữ liệu lớn.',
    aiWeaknesses: 'Cần tự tin hơn khi trình bày các giải pháp tối ưu hóa cơ sở dữ liệu lớn.',
    ai_feedback: 'Ứng viên có tiềm năng xuất sắc, phản hồi mạch lạc và giải quyết bài toán kỹ thuật hiệu quả.',
    aiFeedback: 'Ứng viên có tiềm năng xuất sắc, phản hồi mạch lạc và giải quyết bài toán kỹ thuật hiệu quả.',
  },
  {
    id: 902,
    invite_token: 'candidate-official-session-902',
    inviteToken: 'candidate-official-session-902',
    room_name: 'room-candidate-official-902',
    roomName: 'room-candidate-official-902',
    job_post: 101,
    job_name: 'Senior Fullstack Engineer (React & Django)',
    jobName: 'Senior Fullstack Engineer (React & Django)',
    company: 10,
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    session_type: 'official',
    sessionType: 'official',
    status: 'scheduled',
    scheduled_at: '2026-10-05T14:00:00Z',
    scheduledAt: '2026-10-05T14:00:00Z',
    start_time: null,
    startTime: null,
    end_time: null,
    endTime: null,
  },
];

export const MOCK_CANDIDATE_COMPANY_QUESTION_SETS = [
  {
    id: 1,
    name: 'Phỏng vấn Fullstack Web - InfoHR Tech',
    description: 'Bộ câu hỏi chuẩn kiểm tra React 19, Next.js App Router và kiến trúc Django REST Framework.',
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    career_id: 1,
    careerId: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    careerName: 'Công nghệ thông tin / Phần mềm',
    seniority: 'senior',
    questions_count: 5,
    questionsCount: 5,
    total_duration_minutes: 25,
    totalDurationMinutes: 25,
    category_tags: ['React', 'Next.js', 'Django', 'Architecture'],
  },
  {
    id: 2,
    name: 'Phỏng vấn Kỹ sư Frontend Junior',
    description: 'Đánh giá kiến thức cốt lõi JavaScript ES6+, HTML5/CSS3 và React Hooks cơ bản.',
    company_name: 'InfoHR Tech Corp',
    companyName: 'InfoHR Tech Corp',
    career_id: 1,
    careerId: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    careerName: 'Công nghệ thông tin / Phần mềm',
    seniority: 'junior',
    questions_count: 4,
    questionsCount: 4,
    total_duration_minutes: 15,
    totalDurationMinutes: 15,
    category_tags: ['JavaScript', 'React', 'CSS'],
  },
];

export const MOCK_CANDIDATE_QUESTION_BANK = [
  {
    id: 101,
    title: 'Giải thích cơ chế Server Component và Client Component trong Next.js App Router?',
    content: 'Giải thích cơ chế Server Component và Client Component trong Next.js App Router?',
    difficulty: 3,
    difficulty_display: 'Khá / Nâng cao',
    category: 'React & Next.js',
    category_display: 'Công nghệ Frontend',
    career: 1,
    career_name: 'Công nghệ thông tin / Phần mềm',
    seniority: 'senior',
    default_duration_seconds: 180,
    interviewer_intent: 'Kiểm tra khả năng phân định ranh giới SSR / CSR và tối ưu bundle payload.',
    important_tips: [
      { id: 1, tip: 'Nhấn mạnh việc bảo mật API keys và fetch data trực tiếp trên Server.' },
      { id: 2, tip: 'Lưu ý khi nào cần gắn directive "use client".' },
    ],
    follow_up_questions: ['Làm thế nào để truyền Props phức tạp giữa Server và Client Component?'],
  },
];

export const MOCK_CANDIDATE_SALARY_BENCHMARKS = [
  {
    id: 1,
    job_title: 'Kỹ sư phần mềm Fullstack (React & Python)',
    jobTitle: 'Kỹ sư phần mềm Fullstack (React & Python)',
    position_title: 'Kỹ sư phần mềm Fullstack (React & Python)',
    positionTitle: 'Kỹ sư phần mềm Fullstack (React & Python)',
    category: 'Công nghệ thông tin / Phần mềm',
    career_name: 'Công nghệ thông tin / Phần mềm',
    careerName: 'Công nghệ thông tin / Phần mềm',
    seniority: 'senior',
    experience_level: 'senior',
    experienceLevel: 'senior',
    experience_level_display: 'Senior (> 4 năm)',
    min_salary: 30000000,
    minSalary: 30000000,
    salary_min: 30000000,
    salaryMin: 30000000,
    median_salary: 42000000,
    medianSalary: 42000000,
    salary_avg: 42000000,
    salaryAvg: 42000000,
    max_salary: 60000000,
    maxSalary: 60000000,
    salary_max: 60000000,
    salaryMax: 60000000,
    currency: 'VND',
    sample_size: 450,
    sampleSize: 450,
    sampleCount: 450,
    is_hot: true,
  },
  {
    id: 2,
    job_title: 'Frontend Developer',
    jobTitle: 'Frontend Developer',
    position_title: 'Frontend Developer',
    positionTitle: 'Frontend Developer',
    category: 'Công nghệ thông tin / Phần mềm',
    career_name: 'Công nghệ thông tin / Phần mềm',
    careerName: 'Công nghệ thông tin / Phần mềm',
    seniority: 'mid',
    experience_level: 'mid',
    experienceLevel: 'mid',
    experience_level_display: 'Trung cấp (2 - 4 năm)',
    min_salary: 18000000,
    minSalary: 18000000,
    salary_min: 18000000,
    salaryMin: 18000000,
    median_salary: 26000000,
    medianSalary: 26000000,
    salary_avg: 26000000,
    salaryAvg: 26000000,
    max_salary: 35000000,
    maxSalary: 35000000,
    salary_max: 35000000,
    salaryMax: 35000000,
    currency: 'VND',
    sample_size: 620,
    sampleSize: 620,
    sampleCount: 620,
    is_hot: false,
  },
];

export const MOCK_COMPANIES_FOLLOWED = [
  {
    id: 1,
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
      company_image_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      companyImageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      slug: 'infohr-tech-corp',
    },
  },
];

export const MOCK_RESUME_VIEWED = [
  {
    id: 1,
    views: 8,
    createAt: '2026-09-20T10:00:00Z',
    resume: MOCK_CANDIDATE_RESUMES[0],
    company: {
      id: 10,
      company_name: 'InfoHR Tech Corp',
      companyName: 'InfoHR Tech Corp',
    },
  },
];

/**
 * Mocks Candidate CV Management endpoints (/my-cvs, /ung-vien/quan-ly-cv)
 */
export async function setupCandidateCvsApiMocks(page: Page, initialCvs = MOCK_CANDIDATE_CVS) {
  let cvs = [...initialCvs];

  await page.route(/\/cv\/candidate-cvs\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search')?.toLowerCase();
      let filtered = [...cvs];
      if (search) {
        filtered = filtered.filter((c) => c.title.toLowerCase().includes(search));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: filtered.length,
          results: filtered,
        }),
      });
      return;
    }
    if (route.request().method() === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newCv = {
        id: cvs.length + 10,
        slug: `cv-new-${cvs.length + 10}`,
        title: data.title || 'CV Mới Tạo',
        template: 1,
        template_code: data.template_code || 'modern-navy',
        templateCode: data.template_code || 'modern-navy',
        template_name: 'Modern Navy Professional',
        templateName: 'Modern Navy Professional',
        template_category: 'MODERN',
        templateCategory: 'MODERN',
        is_main_cv: false,
        isMainCv: false,
        is_public: true,
        isPublic: true,
        views_count: 0,
        viewsCount: 0,
        download_count: 0,
        downloadCount: 0,
        ai_score: 90,
        aiScore: 90,
        create_at: new Date().toISOString(),
        createAt: new Date().toISOString(),
        update_at: new Date().toISOString(),
        updateAt: new Date().toISOString(),
      };
      cvs.push(newCv);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newCv),
      });
      return;
    }
    await route.continue();
  });

  // Set Main CV
  await page.route(/\/cv\/candidate-cvs\/\d+\/set-main\/?$/, async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/\/cv\/candidate-cvs\/(\d+)\/set-main/);
    const id = idMatch ? Number(idMatch[1]) : 1;
    cvs = cvs.map((c) => ({
      ...c,
      is_main_cv: c.id === id,
      isMainCv: c.id === id,
    }));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Đã đặt làm CV chính thành công.' }),
    });
  });

  // Duplicate CV
  await page.route(/\/cv\/candidate-cvs\/\d+\/duplicate\/?$/, async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/\/cv\/candidate-cvs\/(\d+)\/duplicate/);
    const id = idMatch ? Number(idMatch[1]) : 1;
    const target = cvs.find((c) => c.id === id) || cvs[0];
    const duplicated = {
      ...target,
      id: cvs.length + 50,
      title: `${target.title} (Bản sao)`,
      slug: `${target.slug}-copy`,
      is_main_cv: false,
      isMainCv: false,
    };
    cvs.push(duplicated);
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(duplicated),
    });
  });

  // Delete CV
  await page.route(/\/cv\/candidate-cvs\/\d+\/?$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const url = route.request().url();
      const idMatch = url.match(/\/cv\/candidate-cvs\/(\d+)/);
      const id = idMatch ? Number(idMatch[1]) : null;
      if (id) {
        cvs = cvs.filter((c) => c.id !== id);
      }
      await route.fulfill({
        status: 204,
      });
      return;
    }
    await route.continue();
  });
}

/**
 * Mocks Candidate Interviews Hub endpoints (/my-interviews)
 */
export async function setupCandidateInterviewsApiMocks(
  page: Page,
  sessions = MOCK_CANDIDATE_INTERVIEW_SESSIONS
) {
  // Candidate sessions list
  await page.route(/\/interview\/web\/sessions\/?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search')?.toLowerCase();
      let filtered = [...sessions];
      if (search) {
        filtered = filtered.filter(
          (s) =>
            s.job_name.toLowerCase().includes(search) ||
            s.company_name.toLowerCase().includes(search)
        );
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: filtered.length,
          results: filtered,
        }),
      });
      return;
    }
    await route.continue();
  });

  // Session details by ID or token
  await page.route(/\/interview\/web\/sessions\/(\d+|candidate-[^/]+)\/?$/, async (route) => {
    const url = route.request().url();
    const isMock = url.includes('901') || url.includes('mock');
    const targetSession = isMock ? sessions[0] : sessions[1] || sessions[0];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(targetSession),
    });
  });

  // Evaluations endpoint for session
  await page.route(/\/interview\/web\/evaluations\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 1,
        results: [
          {
            id: 1,
            interview: 901,
            attitude_score: 8.5,
            professional_score: 8.8,
            overall_score: 8.6,
            result: 'passed',
            comments: 'Ứng viên trả lời lưu loát, nắm rất chắc kỹ năng cốt lõi React và hệ thống.',
          },
        ],
      }),
    });
  });
}

/**
 * Mocks Candidate Practice Room endpoints (/practice)
 */
export async function setupCandidatePracticeApiMocks(page: Page) {
  // Company Question Sets
  await page.route(/\/interview\/web\/question-groups\/public\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CANDIDATE_COMPANY_QUESTION_SETS),
    });
  });

  // Question Bank
  await page.route(/\/interview\/web\/questions\/bank\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_CANDIDATE_QUESTION_BANK.length,
        results: MOCK_CANDIDATE_QUESTION_BANK,
      }),
    });
  });

  // Question Hints
  await page.route(/\/interview\/web\/questions\/\d+\/hints\/?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 101,
        interviewer_intent: 'Đánh giá khả năng tối ưu render và dữ liệu máy chủ.',
        important_tips: [
          { id: 1, tip: 'Nêu bật ưu điểm SEO và thời gian tải trang ban đầu.' },
        ],
      }),
    });
  });

  // Create Mock Session
  await page.route(/\/interview\/web\/sessions\/create-mock\/?$/, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 999,
        invite_token: 'practice-mock-token-999',
        interview_url: '/interview/practice-mock-token-999',
        room_name: 'room-practice-999',
        status: 'scheduled',
      }),
    });
  });
}

/**
 * Mocks Salary Benchmark Tool endpoints (/salary, /tra-cuu-luong)
 */
export async function setupCandidateSalaryApiMocks(page: Page) {
  await page.route(/\/interview\/web\/salary-benchmarks\/?(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search')?.toLowerCase();
    const seniority = url.searchParams.get('seniority')?.toLowerCase();

    let filtered = [...MOCK_CANDIDATE_SALARY_BENCHMARKS];
    if (search) {
      filtered = filtered.filter((b) => b.job_title.toLowerCase().includes(search));
    }
    if (seniority) {
      filtered = filtered.filter((b) => b.seniority.toLowerCase() === seniority);
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: filtered.length,
        results: filtered,
      }),
    });
  });
}

/**
 * Mocks Dashboard KPI social data (Companies Followed & Resume Views)
 */
export async function setupCandidateDashboardKpiMocks(page: Page) {
  // Companies followed
  await page.route(/\/info\/web\/companies-follow\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_COMPANIES_FOLLOWED.length,
        results: MOCK_COMPANIES_FOLLOWED,
      }),
    });
  });

  // Resume viewed
  await page.route(/\/info\/web\/resume-views\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: MOCK_RESUME_VIEWED.length,
        results: MOCK_RESUME_VIEWED,
      }),
    });
  });

  // Candidate Activity Stats
  await page.route(/\/info\/web\/statistics\/job-seeker\/?(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile_views: 45,
        applied_jobs: 12,
        saved_jobs: 6,
        followed_companies: 3,
        activities_by_day: [
          { date: '2026-09-18', views: 5, applications: 1 },
          { date: '2026-09-19', views: 8, applications: 2 },
          { date: '2026-09-20', views: 12, applications: 3 },
          { date: '2026-09-21', views: 10, applications: 1 },
          { date: '2026-09-22', views: 15, applications: 4 },
        ],
      }),
    });
  });
}

/**
 * Mocks Candidate Registration endpoint
 */
export async function setupCandidateRegisterApiMocks(page: Page) {
  await page.route(/\/auth\/job-seeker\/register\/?$/, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Đăng ký tài khoản ứng viên thành công!',
      }),
    });
  });

  await page.route(/\/auth\/send-verify-email\/?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Mã xác thực đã được gửi tới email.',
      }),
    });
  });
}



