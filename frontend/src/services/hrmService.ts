import httpRequest from '../utils/httpRequest';

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

const hrmService = {
  createEmployeeFromApplication: (data: EmployeeFromApplicationPayload): Promise<EmployeeSyncResult> => {
    return httpRequest.post<EmployeeSyncResult>('hrm/web/employees/from-application/', data);
  },

  provisionCurrentUser: (): Promise<{ userId: string; companyId: string }> => {
    return httpRequest.post<{ userId: string; companyId: string }>('hrm/web/employees/provision-current-user/', {});
  },

  getIntegrationStatus: (): Promise<HRMIntegrationStatus> => {
    return httpRequest.get<HRMIntegrationStatus>('hrm/web/integration-status/');
  },
};

export default hrmService;
