import adminManagementService from '../adminManagementService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('adminManagementService list response normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nested data.results responses for presigned admin list endpoints', async () => {
    const career = { id: 7, name: 'Engineering' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [career] },
    });

    const result = await adminManagementService.getCareers({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('common/admin/careers/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [career] });
  });

  it('normalizes raw array responses for non-presigned admin list endpoints', async () => {
    const activity = { id: 11, status: 1 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce([activity]);

    const result = await adminManagementService.getJobActivities({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('job/web/admin/job-posts-activity/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [activity] });
  });
});
