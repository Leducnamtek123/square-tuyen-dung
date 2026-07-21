import httpRequest from '../../utils/httpRequest';
import adminSettingsService from '../adminSettingsService';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe('adminSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes empty successful notification demo responses', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce(null);

    await expect(adminSettingsService.sendNotificationDemo()).resolves.toEqual({ success: true });
    expect(httpRequest.post).toHaveBeenCalledWith('content/send-noti-demo/', {
      title: 'System notification test',
      content: 'System notification delivery test',
      type: 'SYSTEM',
      userList: [],
    });
  });

  it('unwraps nested notification demo action responses', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: { message: 'Demo notification queued' } },
    });

    await expect(adminSettingsService.sendNotificationDemo()).resolves.toEqual({
      success: true,
      message: 'Demo notification queued',
    });
  });

  it('normalizes backend common health response for the admin settings UI', async () => {
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      status: 'ok',
      checks: {
        database: 'ok',
        cache: 'ok',
      },
    });

    await expect(adminSettingsService.healthCheck()).resolves.toEqual({
      status: 'healthy',
      database: 'ok',
      redis: 'ok',
    });
    expect(httpRequest.get).toHaveBeenCalledWith('common/health/');
  });

  it('unwraps nested system settings get and update responses', async () => {
    const settings = {
      maintenanceMode: true,
      autoApproveJobs: false,
      emailNotifications: true,
      googleApiKey: 'google-key',
      supportEmail: 'support@square.vn',
    };
    const updatedSettings = {
      ...settings,
      autoApproveJobs: true,
    };

    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: settings } });
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: { data: updatedSettings } });

    await expect(adminSettingsService.getSystemSettings()).resolves.toEqual(settings);
    await expect(adminSettingsService.updateSystemSettings({ autoApproveJobs: true })).resolves.toEqual(updatedSettings);

    expect(httpRequest.get).toHaveBeenCalledWith('admin/web/system-settings/');
    expect(httpRequest.put).toHaveBeenCalledWith('admin/web/system-settings/', { autoApproveJobs: true });
  });
});
