import authService from '../authService';
import httpRequest from '../../utils/httpRequest';
import { ensurePresignedUrl } from '../../utils/presignUrl';

jest.mock('../../utils/httpRequest', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  ensurePresignedUrl: jest.fn((url) => Promise.resolve(`presigned-${url}`)),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('calls httpRequest.post with correct params', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({ access_token: 'aaa' });
      const res = await authService.getToken('test@example.com', 'password', 'JOB_SEEKER');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/token/', expect.any(Object));
      expect(res).toEqual({ access_token: 'aaa' });
    });
  });

  describe('getUserInfo', () => {
    it('fetches user info and presigns avatarUrl', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        avatarUrl: 'raw-url.jpg',
      });
      const res = await authService.getUserInfo();
      expect(httpRequest.get).toHaveBeenCalledWith('auth/user-info-basic/');
      expect(ensurePresignedUrl).toHaveBeenCalledWith('raw-url.jpg');
      expect(res.avatarUrl).toBe('presigned-raw-url.jpg');
    });
    
    it('handles no avatarUrl', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
      });
      const res = await authService.getUserInfo();
      expect(ensurePresignedUrl).not.toHaveBeenCalled();
      expect(res).toEqual({ id: 1, email: 'test@example.com' });
    });
  });

  describe('updateUser', () => {
    it('updates user and presigns avatar', async () => {
      (httpRequest.patch as jest.Mock).mockResolvedValueOnce({
        id: 1,
        avatarUrl: 'updated.jpg',
      });
      const res = await authService.updateUser({ fullName: 'New Name' });
      expect(httpRequest.patch).toHaveBeenCalledWith('auth/update-user/', { fullName: 'New Name' });
      expect(res.avatarUrl).toBe('presigned-updated.jpg');
    });
  });

  describe('updateAvatar and deleteAvatar', () => {
    it('updateAvatar calls put with formdata', async () => {
      (httpRequest.put as jest.Mock).mockResolvedValueOnce({ avatarUrl: 'new.jpg' });
      const fd = new FormData();
      const res = await authService.updateAvatar(fd);
      expect(httpRequest.put).toHaveBeenCalledWith('auth/avatar/', fd, expect.any(Object));
      expect(res.avatarUrl).toBe('presigned-new.jpg');
    });

    it('deleteAvatar calls delete', async () => {
      (httpRequest.delete as jest.Mock).mockResolvedValueOnce({ avatarUrl: null });
      const res = await authService.deleteAvatar();
      expect(httpRequest.delete).toHaveBeenCalledWith('auth/avatar/');
      expect(res.avatarUrl).toBeNull();
    });
  });

  describe('other methods', () => {
    it('checkCreds calls post', async () => {
      await authService.checkCreds('a@b.com', 'JOB_SEEKER');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/check-creds/', { email: 'a@b.com', roleName: 'JOB_SEEKER' });
    });

    it('getUserWorkspaces calls get', async () => {
      await authService.getUserWorkspaces();
      expect(httpRequest.get).toHaveBeenCalledWith('auth/user-workspaces/');
    });
    
    // Add simple cases for others just to ensure coverage
    it('emailExists calls post', async () => {
      await authService.emailExists('a@b.com');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/email-exists/', { email: 'a@b.com' });
    });

    it('forgotPassword calls post', async () => {
      await authService.forgotPassword({ email: 'a@b.com' });
      expect(httpRequest.post).toHaveBeenCalledWith('auth/forgot-password/', { email: 'a@b.com' });
    });
    
    it('getUserSettings calls get', async () => {
      await authService.getUserSettings();
      expect(httpRequest.get).toHaveBeenCalledWith('auth/settings/');
    });

    it('convertToken calls post with optional redirectUri', async () => {
      await authService.convertToken('client', 'secret', 'google', 'token', 'uri');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/convert-token/', {
        grant_type: 'convert_token',
        client_id: 'client',
        client_secret: 'secret',
        backend: 'google',
        token: 'token',
        redirect_uri: 'uri'
      });
    });

    it('firebaseLogin calls post', async () => {
      await authService.firebaseLogin('token', 'JOB_SEEKER');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/firebase-login/', expect.any(Object));
    });

    it('revokeToken calls post', async () => {
      await authService.revokeToken('token', 'google');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/revoke-token/', expect.any(Object));
    });

    it('jobSeekerRegister calls post', async () => {
      await authService.jobSeekerRegister({ email: 'a@b.com' } as any);
      expect(httpRequest.post).toHaveBeenCalledWith('auth/job-seeker/register/', { email: 'a@b.com' });
    });

    it('employerRegister calls post', async () => {
      await authService.employerRegister({ email: 'a@b.com' } as any);
      expect(httpRequest.post).toHaveBeenCalledWith('auth/employer/register/', { email: 'a@b.com' });
    });

    it('changePassword calls put', async () => {
      await authService.changePassword({ new_password: 'pass' } as any);
      expect(httpRequest.put).toHaveBeenCalledWith('auth/change-password/', { new_password: 'pass' });
    });

    it('resetPassword calls post', async () => {
      await authService.resetPassword({ email: 'a@b.com' } as any);
      expect(httpRequest.post).toHaveBeenCalledWith('auth/reset-password/', { email: 'a@b.com' });
    });

    it('updateUserSettings calls put', async () => {
      await authService.updateUserSettings({ language: 'vi' } as any);
      expect(httpRequest.put).toHaveBeenCalledWith('auth/settings/', { language: 'vi' });
    });

    it('sendVerifyEmail calls post', async () => {
      await authService.sendVerifyEmail('a@b.com');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/send-verify-email/', { email: 'a@b.com', platform: 'WEB' });
    });
  });
});
