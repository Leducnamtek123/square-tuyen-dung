import adminService from '../adminService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUsers calls /auth/users/ and presigns', async () => {
    const mockData = { results: [] };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await adminService.getUsers({ page: 1 });
    expect(httpRequest.get).toHaveBeenCalledWith('auth/users/', { params: { page: 1 } });
    expect(presignInObject).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ count: 0, results: [] });
  });

  it('getUsers normalizes nested presigned list responses', async () => {
    const user = { id: 12, email: 'admin@square.vn' };
    const mockData = { data: { count: 1, results: [user] } };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await adminService.getUsers({ page: 2 });

    expect(httpRequest.get).toHaveBeenCalledWith('auth/users/', { params: { page: 2 } });
    expect(presignInObject).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ count: 1, results: [user] });
  });

  it('getStats calls admin-general-statistics and presigns', async () => {
    const mockData = { total: 100 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await adminService.getStats();
    expect(httpRequest.get).toHaveBeenCalledWith('interview/web/statistics/admin-general-statistics/');
    expect(presignInObject).toHaveBeenCalledWith(mockData);
    expect(result).toBe(mockData);
  });

  it('getStats unwraps nested admin statistics responses after presign', async () => {
    const stats = { totalUsers: 100, totalApplications: 25 };
    const mockData = { data: { data: stats } };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockData);

    await expect(adminService.getStats()).resolves.toEqual(stats);
    expect(httpRequest.get).toHaveBeenCalledWith('interview/web/statistics/admin-general-statistics/');
    expect(presignInObject).toHaveBeenCalledWith(mockData);
  });
});
