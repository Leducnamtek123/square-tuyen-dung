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

type ActionResponse = {
  success: boolean;
  message?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeActionResponse = (raw: unknown): ActionResponse => {
  if (!isRecord(raw)) {
    return { success: true };
  }

  if (isRecord(raw.data)) {
    return { success: true, ...raw.data };
  }

  if ('data' in raw) {
    return { success: true };
  }

  return { success: true, ...raw };
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
  sendNotificationDemo: (): Promise<ActionResponse> => {
    const url = 'content/send-noti-demo/';
    return (httpRequest.post(url, {
      title: 'System notification test',
      content: 'System notification delivery test',
      type: 'SYSTEM',
      userList: [],
    }) as Promise<unknown>).then(normalizeActionResponse);
  },
  healthCheck: (): Promise<SystemHealthPayload> => {
    const url = 'common/health/';
    return httpRequest.get<SystemHealthPayload>(url);
  },
};

export default adminSettingsService;


