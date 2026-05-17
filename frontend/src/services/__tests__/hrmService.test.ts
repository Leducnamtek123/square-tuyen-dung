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
});
