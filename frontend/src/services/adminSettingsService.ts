import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const adminSettingsService = {
  getSystemSettings: (): Promise<unknown> => {
    const url = 'Project/web/admin/system-settings/';
    return httpRequest.get(url);
  },
  updateSystemSettings: (data: AnyRecord): Promise<unknown> => {
    const url = 'Project/web/admin/system-settings/';
    return httpRequest.put(url, data);
  },
};

export default adminSettingsService;
