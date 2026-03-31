import httpRequest from '../utils/httpRequest';


const adminSettingsService = {
  getSystemSettings: (): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.get<Record<string, unknown>>(url) as unknown as Promise<Record<string, unknown>>;
  },
  updateSystemSettings: (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put<Record<string, unknown>>(url, data) as unknown as Promise<Record<string, unknown>>;
  },
};

export default adminSettingsService;

