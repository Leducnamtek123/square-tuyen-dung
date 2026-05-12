import httpRequest from '../utils/httpRequest';

export type FrappeEmployeeFromApplicationPayload = {
  applicationId: number;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | null;
  jobTitle?: string;
  department?: string;
  startDate?: string | null;
  createFrappeAccount?: boolean;
  sendWelcomeEmail?: boolean;
  frappeRoles?: string[];
  notes?: string;
};

export type EmployeeFromApplicationPayload = FrappeEmployeeFromApplicationPayload;

export type FrappeEmployeeSyncResult = {
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

export type FrappeIntegrationStatus = {
  enabled: boolean;
  baseUrl: string;
  siteName?: string;
};

const hrmService = {
  createEmployeeFromApplication: (data: FrappeEmployeeFromApplicationPayload): Promise<FrappeEmployeeSyncResult> => {
    return httpRequest.post<FrappeEmployeeSyncResult>('hrm/web/employees/from-application/', data);
  },

  provisionCurrentUser: (): Promise<{ userId: string; companyId: string }> => {
    return httpRequest.post<{ userId: string; companyId: string }>('hrm/web/employees/provision-current-user/', {});
  },

  getIntegrationStatus: (): Promise<FrappeIntegrationStatus> => {
    return httpRequest.get<FrappeIntegrationStatus>('hrm/web/integration-status/');
  },
};

export default hrmService;
