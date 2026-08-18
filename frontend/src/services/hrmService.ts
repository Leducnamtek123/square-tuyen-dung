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

const hrmService = {
  // Legacy / Frappe
  createEmployeeFromApplication: (data: EmployeeFromApplicationPayload): Promise<EmployeeSyncResult> => {
    return (httpRequest.post('hrm/web/employees/from-application/', data) as Promise<unknown>).then(
      unwrapDataResponse<EmployeeSyncResult>,
    );
  },

  provisionCurrentUser: (): Promise<{ userId: string; companyId: string }> => {
    return (httpRequest.post('hrm/web/employees/provision-current-user/', {}) as Promise<unknown>).then(
      unwrapDataResponse<{ userId: string; companyId: string }>,
    );
  },

  getIntegrationStatus: (): Promise<HRMIntegrationStatus> => {
    return (httpRequest.get('hrm/web/integration-status/') as Promise<unknown>).then(
      unwrapDataResponse<HRMIntegrationStatus>,
    );
  },

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

  deleteEmployee: (id: number): Promise<void> => {
    return httpRequest.delete(`native-hrm/employees/${id}/`).then(() => undefined);
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

  exportPayrollCsv: async (): Promise<Blob> => {
    const response = await httpRequest.get('native-hrm/employees/export-payroll/', {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};

export default hrmService;
