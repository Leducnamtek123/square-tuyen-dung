import httpRequest from '../utils/httpRequest';


const adminSettingsService = {
  getSystemSettings: (): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.get<Record<string, unknown>>(url);
  },
  updateSystemSettings: (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put<Record<string, unknown>>(url, data);
  },
};

export default adminSettingsService;

