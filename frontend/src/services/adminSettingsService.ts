import httpRequest from '../utils/httpRequest';


const adminSettingsService = {
  getSystemSettings: (): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.get<Record<string, unknown>>(url) as any;
  },
  updateSystemSettings: (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put<Record<string, unknown>>(url, data) as any;
  },
};

export default adminSettingsService;

