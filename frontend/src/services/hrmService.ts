import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse, normalizePaginatedResponse } from '../utils/apiResponse';

export type EmployeeFromApplicationPayload = {
  applicationId: number;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | null;
  jobTitle?: string;
  department?: string;
  startDate?: string | null;
  createHrmAccount?: boolean;
  sendWelcomeEmail?: boolean;
  hrmRoles?: string[];
  notes?: string;
};

export type EmployeeSyncResult = {
  id: number;
  applicationId: number;
  status?: number;
  statusName?: string;
  hrmEmployeeId: string;
  hrmUserId: string;
  hrmSyncStatus: 'NOT_SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED' | string;
  hrmSyncError?: string;
  hrmSyncedAt?: string | null;
  hrmEmployeeUrl?: string;
  recruiterUserId?: string;
};

export type HRMIntegrationStatus = {
  enabled: boolean;
  baseUrl: string;
  siteName?: string;
};

// Native HRM Types
export type NativeDepartment = {
  id: number;
  name: string;
  code?: string;
  parent?: number | null;
  parent_name?: string;
  manager?: number | null;
  manager_name?: string;
  description?: string;
  is_active: boolean;
  employee_count: number;
};

export type NativeDesignation = {
  id: number;
  title: string;
  code?: string;
  description?: string;
  is_active: boolean;
  employee_count: number;
};

export type NativeEmployee = {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth?: string;
  address?: string;
  department?: number | null;
  department_name?: string;
  designation?: number | null;
  designation_title?: string;
  reports_to?: number | null;
  reports_to_name?: string;
  status: 'PROBATION' | 'ACTIVE' | 'RESIGNED' | 'TERMINATED';
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  join_date?: string;
  probation_end_date?: string;
  resign_date?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  tax_id?: string;
  social_insurance_id?: string;
  contracts?: NativeContract[];
};

export type NativeContract = {
  id: number;
  employee: number;
  employee_name?: string;
  contract_number: string;
  contract_type: 'PROBATION' | 'FIXED_TERM' | 'INDEFINITE';
  start_date: string;
  end_date?: string;
  base_salary: number;
  allowance: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  notes?: string;
};

export type NativeLeaveRequest = {
  id: number;
  employee: number;
  employee_name?: string;
  leave_type?: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
};

export type NativeOrgTreeNode = {
  id: number;
  name: string;
  code?: string;
  manager_name?: string;
  employee_count: number;
  children: NativeOrgTreeNode[];
};

export type HrmDashboardStats = {
  active_employees: number;
  probation_employees: number;
  pending_leaves: number;
  expiring_contracts: number;
  department_breakdown: { id: number; name: string; code?: string; emp_count: number }[];
};

export type OnboardCandidatePayload = {
  job_application_id?: number;
  applicationId?: number;
  candidate_profile_id?: number;
  candidateProfileId?: number;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department_id?: number;
  departmentId?: number;
  designation_id?: number;
  designationId?: number;
  reports_to_id?: number;
  reportsToId?: number;
  join_date?: string;
  joinDate?: string;
  probation_end_date?: string;
  probationEndDate?: string;
  base_salary?: number;
  baseSalary?: number;
  allowance?: number;
  employment_type?: string;
  employmentType?: string;
  status?: string;
  notes?: string;
};

export type NativeLeaveBalance = {
  id: number;
  employee: number;
  employee_name?: string;
  employee_code?: string;
  leave_type: number;
  leave_type_name?: string;
  year: number;
  allocated_days: number;
  seniority_bonus_days: number;
  carried_over_days: number;
  used_days: number;
  pending_days: number;
  total_allowed_days: number;
  remaining_days: number;
};

export type NativeMonthlyPayrollRecord = {
  id: number;
  company: number;
  employee: number;
  employee_name: string;
  employee_code: string;
  department_name?: string;
  month: number;
  year: number;
  gross_salary: number;
  allowance: number;
  bonus: number;
  working_days_actual: number;
  standard_working_days: number;
  unpaid_leave_days: number;
  dependents_count: number;
  total_income: number;
  bhxh_amount: number;
  bhyt_amount: number;
  bhtn_amount: number;
  total_insurance: number;
  employer_bhxh: number;
  employer_bhyt: number;
  employer_bhtn: number;
  employer_union_fee: number;
  total_employer_insurance: number;
  taxable_income: number;
  personal_income_tax: number;
  net_salary: number;
  total_company_expense: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  status_label?: string;
  payment_date?: string | null;
  note?: string;
};

export type PayrollSummaryKPIs = {
  month: number;
  year: number;
  total_employees: number;
  total_gross: number;
  total_net: number;
  total_pit: number;
  total_emp_insurance: number;
  total_employer_insurance: number;
  total_company_expense: number;
  draft_count: number;
  approved_count: number;
  paid_count: number;
};

export type NativeTimesheetDay = {
  day: number;
  date: string;
  is_weekend: boolean;
  day_of_week: string;
};

export type NativeTimesheetRecord = {
  id?: number;
  status: 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'ON_LEAVE' | 'WEEKEND';
  working_hours?: number;
  check_in?: string | null;
  check_out?: string | null;
};

export type NativeTimesheetEmployee = {
  employee_id: number;
  employee_code: string;
  full_name: string;
  department_name?: string;
  designation_title?: string;
  records: Record<number, NativeTimesheetRecord>;
  stats: {
    total_present: number;
    total_late: number;
    total_leave: number;
    total_hours: number;
  };
};

export type NativeTimesheetResponse = {
  month: number;
  year: number;
  total_days: number;
  days: NativeTimesheetDay[];
  employees: NativeTimesheetEmployee[];
};

export type RenewContractPayload = {
  contract_number: string;
  contract_type: 'PROBATION' | 'FIXED_TERM' | 'INDEFINITE';
  start_date: string;
  end_date?: string | null;
  base_salary: number;
  allowance?: number;
  notes?: string;
};

export type QuickCheckinPayload = {
  employee_id: number;
  date?: string;
  status?: 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'ON_LEAVE';
  check_in?: string | null;
  check_out?: string | null;
  working_hours?: number;
  notes?: string;
};

export type MyHrmProfileResponse = {
  employee: NativeEmployee;
  active_contract?: NativeContract | null;
  leave_balances: NativeLeaveBalance[];
  recent_payrolls: NativeMonthlyPayrollRecord[];
};

export type NativeLeaveType = {
  id: number;
  name: string;
  code: string;
  days_per_year: number;
  is_paid: boolean;
};

const hrmService = {
  // Native HRM API Endpoints
  getDashboardStats: (): Promise<HrmDashboardStats> => {
    return httpRequest.get('native-hrm/dashboard/stats/').then((res) => unwrapDataResponse<HrmDashboardStats>(res));
  },

  getEmployees: (params?: { department?: number; status?: string; search?: string }): Promise<NativeEmployee[]> => {
    return httpRequest.get('native-hrm/employees/', { params }).then((res) => {
      return normalizePaginatedResponse<NativeEmployee>(res).results;
    });
  },

  getEmployeeDetail: (id: number): Promise<NativeEmployee> => {
    return httpRequest.get(`native-hrm/employees/${id}/`).then((res) => unwrapDataResponse<NativeEmployee>(res));
  },

  createEmployee: (data: Partial<NativeEmployee>): Promise<NativeEmployee> => {
    return httpRequest.post('native-hrm/employees/', data).then((res) => unwrapDataResponse<NativeEmployee>(res));
  },

  updateEmployee: (id: number, data: Partial<NativeEmployee>): Promise<NativeEmployee> => {
    return httpRequest.patch(`native-hrm/employees/${id}/`, data).then((res) => unwrapDataResponse<NativeEmployee>(res));
  },

  onboardCandidate: (payload: OnboardCandidatePayload): Promise<NativeEmployee> => {
    const normalizedPayload = {
      ...payload,
      job_application_id: payload.job_application_id ?? payload.applicationId,
      candidate_profile_id: payload.candidate_profile_id ?? payload.candidateProfileId,
      department_id: payload.department_id ?? payload.departmentId,
      designation_id: payload.designation_id ?? payload.designationId,
      reports_to_id: payload.reports_to_id ?? payload.reportsToId,
      join_date: payload.join_date ?? payload.joinDate,
      probation_end_date: payload.probation_end_date ?? payload.probationEndDate,
      base_salary: payload.base_salary ?? payload.baseSalary,
      employment_type: payload.employment_type ?? payload.employmentType,
    };
    return httpRequest
      .post('native-hrm/employees/onboard-from-candidate/', normalizedPayload)
      .then((res) => unwrapDataResponse<NativeEmployee>(res));
  },

  getDepartments: (): Promise<NativeDepartment[]> => {
    return httpRequest.get('native-hrm/departments/').then((res) => {
      return normalizePaginatedResponse<NativeDepartment>(res).results;
    });
  },

  createDepartment: (data: { name: string; code?: string; parent?: number; description?: string }): Promise<NativeDepartment> => {
    return httpRequest.post('native-hrm/departments/', data).then((res) => unwrapDataResponse<NativeDepartment>(res));
  },

  updateDepartment: (id: number, data: Partial<NativeDepartment>): Promise<NativeDepartment> => {
    return httpRequest.patch(`native-hrm/departments/${id}/`, data).then((res) => unwrapDataResponse<NativeDepartment>(res));
  },

  deleteDepartment: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/departments/${id}/`).then(() => undefined);
  },

  getOrgChart: (): Promise<NativeOrgTreeNode[]> => {
    return httpRequest.get('native-hrm/departments/org-chart/').then((res) => unwrapDataResponse<NativeOrgTreeNode[]>(res));
  },

  getDesignations: (): Promise<NativeDesignation[]> => {
    return httpRequest.get('native-hrm/designations/').then((res) => {
      return normalizePaginatedResponse<NativeDesignation>(res).results;
    });
  },

  createDesignation: (data: { title: string; code?: string; description?: string }): Promise<NativeDesignation> => {
    return httpRequest.post('native-hrm/designations/', data).then((res) => unwrapDataResponse<NativeDesignation>(res));
  },

  updateDesignation: (id: number, data: Partial<NativeDesignation>): Promise<NativeDesignation> => {
    return httpRequest.patch(`native-hrm/designations/${id}/`, data).then((res) => unwrapDataResponse<NativeDesignation>(res));
  },

  deleteDesignation: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/designations/${id}/`).then(() => undefined);
  },

  getLeaveTypes: (): Promise<NativeLeaveType[]> => {
    return httpRequest.get('native-hrm/leave-types/').then((res) => {
      return normalizePaginatedResponse<NativeLeaveType>(res).results;
    });
  },

  getLeaveRequests: (): Promise<NativeLeaveRequest[]> => {
    return httpRequest.get('native-hrm/leave-requests/').then((res) => {
      return normalizePaginatedResponse<NativeLeaveRequest>(res).results;
    });
  },

  createLeaveRequest: (data: Partial<NativeLeaveRequest>): Promise<NativeLeaveRequest> => {
    return httpRequest.post('native-hrm/leave-requests/', data).then((res) => unwrapDataResponse<NativeLeaveRequest>(res));
  },

  deleteLeaveRequest: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/leave-requests/${id}/`).then(() => undefined);
  },

  approveLeaveRequest: (id: number): Promise<NativeLeaveRequest> => {
    return httpRequest.patch(`native-hrm/leave-requests/${id}/approve/`, {}).then((res) => unwrapDataResponse<NativeLeaveRequest>(res));
  },

  rejectLeaveRequest: (id: number, rejection_reason?: string): Promise<NativeLeaveRequest> => {
    return httpRequest.patch(`native-hrm/leave-requests/${id}/reject/`, { rejection_reason }).then((res) => unwrapDataResponse<NativeLeaveRequest>(res));
  },

  getLeaveBalances: (params?: { employee?: number; year?: number }): Promise<NativeLeaveBalance[]> => {
    return httpRequest.get('native-hrm/leave-balances/', { params }).then((res) => {
      return normalizePaginatedResponse<NativeLeaveBalance>(res).results;
    });
  },

  autoAllocateLeaveBalances: (year: number): Promise<{ message: string }> => {
    return httpRequest.post('native-hrm/leave-balances/auto-allocate/', { year }).then((res) => unwrapDataResponse<{ message: string }>(res));
  },

  getContracts: (): Promise<NativeContract[]> => {
    return httpRequest.get('native-hrm/contracts/').then((res) => {
      return normalizePaginatedResponse<NativeContract>(res).results;
    });
  },

  createContract: (data: Partial<NativeContract>): Promise<NativeContract> => {
    return httpRequest.post('native-hrm/contracts/', data).then((res) => unwrapDataResponse<NativeContract>(res));
  },

  updateContract: (id: number, data: Partial<NativeContract>): Promise<NativeContract> => {
    return httpRequest.patch(`native-hrm/contracts/${id}/`, data).then((res) => unwrapDataResponse<NativeContract>(res));
  },

  deleteContract: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/contracts/${id}/`).then(() => undefined);
  },

  renewContract: (contractId: number, data: RenewContractPayload): Promise<NativeContract> => {
    return httpRequest.post(`native-hrm/contracts/${contractId}/renew/`, data).then((res) => unwrapDataResponse<NativeContract>(res));
  },

  getMonthlyTimesheet: (params: { month: number; year: number; department?: number }): Promise<NativeTimesheetResponse> => {
    return httpRequest.get('native-hrm/attendances/timesheet/', { params }).then((res) => unwrapDataResponse<NativeTimesheetResponse>(res));
  },

  quickCheckin: (data: QuickCheckinPayload): Promise<any> => {
    return httpRequest.post('native-hrm/attendances/quick-checkin/', data).then((res) => unwrapDataResponse<any>(res));
  },

  getMonthlyPayrollList: (params?: { month?: number; year?: number; status?: string }): Promise<NativeMonthlyPayrollRecord[]> => {
    return httpRequest.get('native-hrm/payroll/', { params }).then((res) => {
      return normalizePaginatedResponse<NativeMonthlyPayrollRecord>(res).results;
    });
  },

  getPayrollSummaryKPIs: (params: { month: number; year: number }): Promise<PayrollSummaryKPIs> => {
    return httpRequest.get('native-hrm/payroll/summary-kpis/', { params }).then((res) => unwrapDataResponse<PayrollSummaryKPIs>(res));
  },

  calculateMonthlyPayroll: (data: { month: number; year: number; standard_working_days?: number; employee_id?: number; bonus?: number }): Promise<{ message: string; records: NativeMonthlyPayrollRecord[] }> => {
    return httpRequest.post('native-hrm/payroll/calculate/', data).then((res) => unwrapDataResponse<{ message: string; records: NativeMonthlyPayrollRecord[] }>(res));
  },

  approveAllPayroll: (data: { month: number; year: number }): Promise<{ message: string }> => {
    return httpRequest.post('native-hrm/payroll/approve-all/', data).then((res) => unwrapDataResponse<{ message: string }>(res));
  },

  markPaidAllPayroll: (data: { month: number; year: number }): Promise<{ message: string }> => {
    return httpRequest.post('native-hrm/payroll/mark-paid-all/', data).then((res) => unwrapDataResponse<{ message: string }>(res));
  },

  getMyHrmProfile: (): Promise<MyHrmProfileResponse> => {
    return httpRequest.get('native-hrm/me/').then((res) => unwrapDataResponse<MyHrmProfileResponse>(res));
  },

  deleteEmployee: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/employees/${id}/`).then(() => undefined);
  },

  exportPayrollCsv: async (): Promise<Blob> => {
    const response = await httpRequest.get('native-hrm/employees/export-payroll/', {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};

export default hrmService;
