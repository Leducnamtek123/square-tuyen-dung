import adminInterviewService from '../adminInterviewService';
import adminJobService from '../adminJobService';
import userService from '../userService';
import httpRequest from '../../utils/httpRequest';
import fs from 'fs';
import path from 'path';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('admin list services response normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes raw array admin jobs responses', async () => {
    const job = { id: 17, jobName: 'Frontend Developer' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce([job]);

    const result = await adminJobService.getAllJobs({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('job/web/admin-job-posts/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [job] });
  });

  it('normalizes nested admin interviews responses', async () => {
    const interview = { id: 5, status: 'scheduled' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [interview] },
    });

    const result = await adminInterviewService.getAllInterviews({ page: 2 });

    expect(httpRequest.get).toHaveBeenCalledWith('interview/admin/sessions/', { params: { page: 2 } });
    expect(result).toEqual({ count: 1, results: [interview] });
  });

  it('unwraps nested admin interview detail responses', async () => {
    const interview = { id: 6, status: 'completed' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { data: interview },
    });

    const result = await adminInterviewService.getInterviewDetail(6);

    expect(httpRequest.get).toHaveBeenCalledWith('interview/admin/sessions/6/');
    expect(result).toEqual(interview);
  });

  it('unwraps nested admin interview status update responses', async () => {
    const interview = { id: 7, status: 'cancelled' };
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({
      data: { data: interview },
    });

    const result = await adminInterviewService.updateInterviewStatus(7, 'cancelled');

    expect(httpRequest.patch).toHaveBeenCalledWith('interview/admin/sessions/7/', { status: 'cancelled' });
    expect(result).toEqual(interview);
  });

  it('normalizes nested admin users responses after presign', async () => {
    const user = { id: 9, email: 'hr@square.vn' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [user] },
    });

    const result = await userService.getAllUsers({ page: 3 });

    expect(httpRequest.get).toHaveBeenCalledWith('auth/users/', { params: { page: 3 } });
    expect(result).toEqual({ count: 1, results: [user] });
  });

  it('unwraps nested admin user update responses after presign', async () => {
    const user = { id: 9, email: 'hr@square.vn', roleName: 'ADMIN' };
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: user } });

    await expect(userService.updateUser(9, { roleName: 'ADMIN' } as any)).resolves.toEqual(user);
    expect(httpRequest.patch).toHaveBeenCalledWith('auth/users/9/', { roleName: 'ADMIN' });
  });

  it('keeps admin user toggle status typed as the backend status payload', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/userService.ts'), 'utf8');
    const hookSource = fs.readFileSync(path.join(process.cwd(), 'src/views/adminPages/UsersPage/hooks/useUsers.ts'), 'utf8');

    expect(serviceSource).toContain('export type UserStatusResponse = { isActive: boolean };');
    expect(serviceSource).toContain('toggleUserStatus: (id: IdType): Promise<UserStatusResponse>');
    expect(hookSource).toContain("import userService, { type UserStatusResponse }");
    expect(hookSource).toContain('toggleUserStatus: (user: UserModel) => Promise<UserStatusResponse>;');
  });

  it('unwraps nested admin user status action responses', async () => {
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { isActive: false } } })
      .mockResolvedValueOnce({ data: { data: { updated: 2, isActive: true } } });

    await expect(userService.toggleUserStatus(9)).resolves.toEqual({ isActive: false });
    await expect(userService.bulkStatus([9, 10], true)).resolves.toEqual({ updated: 2, isActive: true });

    expect(httpRequest.post).toHaveBeenNthCalledWith(1, 'auth/users/9/toggle-active/');
    expect(httpRequest.post).toHaveBeenNthCalledWith(2, 'auth/users/bulk-status/', {
      ids: [9, 10],
      isActive: true,
    });
  });
});
