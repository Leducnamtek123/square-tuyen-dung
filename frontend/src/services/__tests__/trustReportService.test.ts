import trustReportService from '../trustReportService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  post: jest.fn(),
}));

describe('trustReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unwraps nested create trust report responses', async () => {
    const report = {
      id: 17,
      targetType: 'job',
      reason: 'scam',
      status: 'open',
      jobPost: 42,
    };

    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: report } });

    await expect(
      trustReportService.createTrustReport({
        targetType: 'job',
        reason: 'scam',
        jobPost: 42,
      }),
    ).resolves.toEqual(report);

    expect(httpRequest.post).toHaveBeenCalledWith('info/web/trust-reports/', {
      targetType: 'job',
      reason: 'scam',
      jobPost: 42,
    });
  });
});
