import httpRequest from '../utils/httpRequest';

export type SystemSettingsPayload = {
  maintenanceMode?: boolean;
  autoApproveJobs?: boolean;
  emailNotifications?: boolean;
  googleApiKey?: string;
  supportEmail?: string;
};

const adminSettingsService = {
  getSystemSettings: (): Promise<SystemSettingsPayload> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.get<SystemSettingsPayload>(url);
  },
  updateSystemSettings: (data: Partial<SystemSettingsPayload>): Promise<SystemSettingsPayload> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put<SystemSettingsPayload>(url, data);
  },
};

export default adminSettingsService;


