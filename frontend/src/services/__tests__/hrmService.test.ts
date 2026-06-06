import hrmService from '../hrmService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('hrmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createEmployeeFromApplication posts to HRM bridge endpoint', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ hrmEmployeeId: 'HR-EMP-0001' });
    await hrmService.createEmployeeFromApplication({
      applicationId: 10,
      fullName: 'Candidate',
      jobTitle: 'Designer',
      createHrmAccount: true,
    });
    expect(httpRequest.post).toHaveBeenCalledWith('hrm/web/employees/from-application/', {
      applicationId: 10,
      fullName: 'Candidate',
      jobTitle: 'Designer',
      createHrmAccount: true,
    });
  });

  it('provisionCurrentUser posts to HRM account endpoint', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ userId: 'hr@example.com' });
    await hrmService.provisionCurrentUser();
    expect(httpRequest.post).toHaveBeenCalledWith('hrm/web/employees/provision-current-user/', {});
  });

  it('getIntegrationStatus calls HRM status endpoint', async () => {
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ enabled: true });
    await hrmService.getIntegrationStatus();
    expect(httpRequest.get).toHaveBeenCalledWith('hrm/web/integration-status/');
  });

  it('unwraps nested HRM bridge response payloads', async () => {
    const syncResult = {
      id: 10,
      applicationId: 10,
      hrmEmployeeId: 'HR-EMP-0001',
      hrmUserId: 'candidate@example.com',
      hrmSyncStatus: 'SYNCED',
    };
    const provisionResult = { userId: 'hr@example.com', companyId: 'Square' };
    const integrationStatus = {
      enabled: true,
      baseUrl: 'https://hrm.square.vn',
      siteName: 'Square HRM',
    };

    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: syncResult } })
      .mockResolvedValueOnce({ data: { data: provisionResult } });
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: integrationStatus } });

    await expect(hrmService.createEmployeeFromApplication({ applicationId: 10 })).resolves.toEqual(syncResult);
    await expect(hrmService.provisionCurrentUser()).resolves.toEqual(provisionResult);
    await expect(hrmService.getIntegrationStatus()).resolves.toEqual(integrationStatus);
  });
});
