import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse } from '../utils/apiResponse';

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

type RawSystemHealthPayload = {
  status?: string;
  database?: string;
  redis?: string;
  checks?: {
    database?: string;
    cache?: string;
    redis?: string;
  };
};

type ActionResponse = {
  success: boolean;
  message?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeActionResponse = (raw: unknown): ActionResponse => {
  const value = unwrapDataResponse<unknown>(raw);
  return isRecord(value)
    ? { success: true, ...value }
    : { success: true };
};

const normalizeHealthResponse = (raw: unknown): SystemHealthPayload => {
  const value = unwrapDataResponse<RawSystemHealthPayload>(raw);
  const status = value.status === 'ok' ? 'healthy' : value.status || 'unknown';

  return {
    status,
    database: value.database || value.checks?.database,
    redis: value.redis || value.checks?.redis || value.checks?.cache,
  };
};

const adminSettingsService = {
  getSystemSettings: (): Promise<SystemSettingsPayload> => {
    const url = 'admin/web/system-settings/';
    return (httpRequest.get(url) as Promise<unknown>).then(unwrapDataResponse<SystemSettingsPayload>);
  },
  updateSystemSettings: (data: Partial<SystemSettingsPayload>): Promise<SystemSettingsPayload> => {
    const url = 'admin/web/system-settings/';
    return (httpRequest.put(url, data) as Promise<unknown>).then(unwrapDataResponse<SystemSettingsPayload>);
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
    return (httpRequest.get(url) as Promise<unknown>).then(normalizeHealthResponse);
  },
};

export default adminSettingsService;


