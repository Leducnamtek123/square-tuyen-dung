import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const adminSettingsService = {
  getSystemSettings: (): Promise<unknown> => {
    // assuming a new endpoint for system settings
    const url = 'admin/web/system-settings/';
    return httpRequest.get(url);
  },
  updateSystemSettings: (data: AnyRecord): Promise<unknown> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put(url, data);
  },
};

export default adminSettingsService;
