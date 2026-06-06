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
});
