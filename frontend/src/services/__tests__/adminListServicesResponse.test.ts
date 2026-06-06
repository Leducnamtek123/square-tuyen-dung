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

  it('normalizes nested admin users responses after presign', async () => {
    const user = { id: 9, email: 'hr@square.vn' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [user] },
    });

    const result = await userService.getAllUsers({ page: 3 });

    expect(httpRequest.get).toHaveBeenCalledWith('auth/users/', { params: { page: 3 } });
    expect(result).toEqual({ count: 1, results: [user] });
  });

  it('keeps admin user toggle status typed as the backend status payload', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/userService.ts'), 'utf8');
    const hookSource = fs.readFileSync(path.join(process.cwd(), 'src/views/adminPages/UsersPage/hooks/useUsers.ts'), 'utf8');

    expect(serviceSource).toContain('export type UserStatusResponse = { isActive: boolean };');
    expect(serviceSource).toContain('toggleUserStatus: (id: IdType): Promise<UserStatusResponse>');
    expect(hookSource).toContain("import userService, { type UserStatusResponse }");
    expect(hookSource).toContain('toggleUserStatus: (user: UserModel) => Promise<UserStatusResponse>;');
  });
});
