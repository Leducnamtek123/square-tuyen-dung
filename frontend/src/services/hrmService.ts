import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse } from '../utils/apiResponse';

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
  candidate_profile_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: number;
  designation_id?: number;
  join_date: string;
  probation_end_date?: string;
  base_salary?: number;
  employment_type?: string;
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
    return (httpRequest.get('native-hrm/dashboard/stats/') as Promise<unknown>).then(
      unwrapDataResponse<HrmDashboardStats>,
    );
  },

  getEmployees: (params?: { department?: number; status?: string; search?: string }): Promise<NativeEmployee[]> => {
    return (httpRequest.get('native-hrm/employees/', { params }) as Promise<unknown>).then((res: any) => {
      const unwrapped = unwrapDataResponse<any>(res);
      return Array.isArray(unwrapped) ? unwrapped : unwrapped?.results || [];
    });
  },

  getEmployeeDetail: (id: number): Promise<NativeEmployee> => {
    return (httpRequest.get(`native-hrm/employees/${id}/`) as Promise<unknown>).then(
      unwrapDataResponse<NativeEmployee>,
    );
  },

  createEmployee: (data: Partial<NativeEmployee>): Promise<NativeEmployee> => {
    return (httpRequest.post('native-hrm/employees/', data) as Promise<unknown>).then(
      unwrapDataResponse<NativeEmployee>,
    );
  },

  updateEmployee: (id: number, data: Partial<NativeEmployee>): Promise<NativeEmployee> => {
    return (httpRequest.patch(`native-hrm/employees/${id}/`, data) as Promise<unknown>).then(
      unwrapDataResponse<NativeEmployee>,
    );
  },

  onboardCandidate: (payload: OnboardCandidatePayload): Promise<NativeEmployee> => {
    return (httpRequest.post('native-hrm/employees/onboard-from-candidate/', payload) as Promise<unknown>).then(
      unwrapDataResponse<NativeEmployee>,
    );
  },

  getDepartments: (): Promise<NativeDepartment[]> => {
    return (httpRequest.get('native-hrm/departments/') as Promise<unknown>).then((res: any) => {
      const unwrapped = unwrapDataResponse<any>(res);
      return Array.isArray(unwrapped) ? unwrapped : unwrapped?.results || [];
    });
  },

  createDepartment: (data: { name: string; code?: string; parent?: number; description?: string }): Promise<NativeDepartment> => {
    return (httpRequest.post('native-hrm/departments/', data) as Promise<unknown>).then(
      unwrapDataResponse<NativeDepartment>,
    );
  },

  getOrgChart: (): Promise<NativeOrgTreeNode[]> => {
    return (httpRequest.get('native-hrm/departments/org-chart/') as Promise<unknown>).then(
      unwrapDataResponse<NativeOrgTreeNode[]>,
    );
  },

  getDesignations: (): Promise<NativeDesignation[]> => {
    return (httpRequest.get('native-hrm/designations/') as Promise<unknown>).then((res: any) => {
      const unwrapped = unwrapDataResponse<any>(res);
      return Array.isArray(unwrapped) ? unwrapped : unwrapped?.results || [];
    });
  },

  getLeaveRequests: (): Promise<NativeLeaveRequest[]> => {
    return (httpRequest.get('native-hrm/leave-requests/') as Promise<unknown>).then((res: any) => {
      const unwrapped = unwrapDataResponse<any>(res);
      return Array.isArray(unwrapped) ? unwrapped : unwrapped?.results || [];
    });
  },

  approveLeaveRequest: (id: number): Promise<NativeLeaveRequest> => {
    return (httpRequest.patch(`native-hrm/leave-requests/${id}/approve/`, {}) as Promise<unknown>).then(
      unwrapDataResponse<NativeLeaveRequest>,
    );
  },

  rejectLeaveRequest: (id: number, rejection_reason?: string): Promise<NativeLeaveRequest> => {
    return (httpRequest.patch(`native-hrm/leave-requests/${id}/reject/`, { rejection_reason }) as Promise<unknown>).then(
      unwrapDataResponse<NativeLeaveRequest>,
    );
  },

  getContracts: (): Promise<NativeContract[]> => {
    return (httpRequest.get('native-hrm/contracts/') as Promise<unknown>).then((res: any) => {
      const unwrapped = unwrapDataResponse<any>(res);
      return Array.isArray(unwrapped) ? unwrapped : unwrapped?.results || [];
    });
  },

  exportPayrollCsv: async (): Promise<Blob> => {
    const response = await httpRequest.get('native-hrm/employees/export-payroll/', {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};

export default hrmService;
