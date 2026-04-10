import adminJobService from '../adminJobService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe('adminJobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllJobs calls get with params', async () => {
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ results: [] });
    await adminJobService.getAllJobs({ page: 2 });
    expect(httpRequest.get).toHaveBeenCalledWith('job/web/admin-job-posts/', { params: { page: 2 } });
  });

  it('updateJob calls patch with data', async () => {
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ id: '1', title: 'New' });
    await adminJobService.updateJob('1', { title: 'New' });
    expect(httpRequest.patch).toHaveBeenCalledWith('job/web/admin-job-posts/1/', { title: 'New' });
  });

  it('approveJob calls patch to approve endpoint', async () => {
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ id: '1', status: 'approved' });
    await adminJobService.approveJob('1');
    expect(httpRequest.patch).toHaveBeenCalledWith('job/web/admin-job-posts/1/approve/');
  });

  it('rejectJob calls patch to reject endpoint', async () => {
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ id: '1', status: 'rejected' });
    await adminJobService.rejectJob('1');
    expect(httpRequest.patch).toHaveBeenCalledWith('job/web/admin-job-posts/1/reject/');
  });

  it('deleteJob calls delete endpoint', async () => {
    (httpRequest.delete as jest.Mock).mockResolvedValueOnce({});
    await adminJobService.deleteJob('1');
    expect(httpRequest.delete).toHaveBeenCalledWith('job/web/admin-job-posts/1/');
  });
});
