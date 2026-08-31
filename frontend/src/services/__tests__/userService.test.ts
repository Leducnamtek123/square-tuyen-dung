import userService from '../userService';
import httpRequest from '@/utils/httpRequest';
import { presignInObject } from '@/utils/presignUrl';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllUsers calls /auth/users/ and presigns result', async () => {
    const mockData = { results: [{ id: 1, email: 'admin@infohr.vn' }], count: 1 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await userService.getAllUsers({ page: 1 });
    expect(httpRequest.get).toHaveBeenCalledWith('auth/users/', { params: { page: 1 } });
    expect(presignInObject).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ count: 1, results: [{ id: 1, email: 'admin@infohr.vn' }] });
  });

  it('updateUser sends PATCH to /auth/users/:id/', async () => {
    const mockUser = { id: 2, fullName: 'Updated Name' };
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce(mockUser);

    const result = await userService.updateUser(2, { fullName: 'Updated Name' });
    expect(httpRequest.patch).toHaveBeenCalledWith('auth/users/2/', { fullName: 'Updated Name' });
    expect(result).toEqual(mockUser);
  });

  it('toggleUserStatus sends POST to /auth/users/:id/toggle-active/', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { isActive: true } });

    const result = await userService.toggleUserStatus(5);
    expect(httpRequest.post).toHaveBeenCalledWith('auth/users/5/toggle-active/');
    expect(result).toEqual({ isActive: true });
  });

  it('bulkStatus sends POST to /auth/users/bulk-status/', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { updated: 3, isActive: false } });

    const result = await userService.bulkStatus([1, 2, 3], false);
    expect(httpRequest.post).toHaveBeenCalledWith('auth/users/bulk-status/', { ids: [1, 2, 3], isActive: false });
    expect(result).toEqual({ updated: 3, isActive: false });
  });

  it('deleteUser sends DELETE to /auth/users/:id/', async () => {
    (httpRequest.delete as jest.Mock).mockResolvedValueOnce(undefined);

    await userService.deleteUser(10);
    expect(httpRequest.delete).toHaveBeenCalledWith('auth/users/10/');
  });
});
