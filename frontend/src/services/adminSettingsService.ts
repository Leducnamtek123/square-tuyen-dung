import httpRequest from '../utils/httpRequest';

export type SystemSettingsPayload = {
  maintenanceMode?: boolean;
  autoApproveJobs?: boolean;
  emailNotifications?: boolean;
  googleApiKey?: string;
  supportEmail?: string;
};

export type SystemHealthPayload = {
  status: string;
  database?: string;
  redis?: string;
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
  sendNotificationDemo: (): Promise<void> => {
    const url = 'content/send-noti-demo/';
    return httpRequest.post(url, {
      title: 'System notification test',
      content: 'System notification delivery test',
      type: 'SYSTEM',
      userList: [],
    });
  },
  healthCheck: (): Promise<SystemHealthPayload> => {
    const url = 'common/health/';
    return httpRequest.get<SystemHealthPayload>(url);
  },
};

export default adminSettingsService;


