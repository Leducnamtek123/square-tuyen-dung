import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const adminSettingsService = {
  getSystemSettings: (): Promise<AnyRecord> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.get<AnyRecord>(url) as any as Promise<AnyRecord>;
  },
  updateSystemSettings: (data: AnyRecord): Promise<AnyRecord> => {
    const url = 'admin/web/system-settings/';
    return httpRequest.put<AnyRecord>(url, data) as any as Promise<AnyRecord>;
  },
};

export default adminSettingsService;
