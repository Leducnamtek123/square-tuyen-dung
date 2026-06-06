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
      expect((httpRequest.post as jest.Mock).mock.calls[0][1]).not.toHaveProperty('client_secret');
      expect(res).toEqual({ access_token: 'aaa' });
    });

    it('unwraps nested token response envelopes', async () => {
      const token = { accessToken: 'access', refreshToken: 'refresh', tokenType: 'Bearer' };
      (httpRequest.post as jest.Mock)
        .mockResolvedValueOnce({ data: { data: token } })
        .mockResolvedValueOnce({ data: { data: token } })
        .mockResolvedValueOnce({ data: { data: token } });

      await expect(authService.getToken('test@example.com', 'password', 'JOB_SEEKER')).resolves.toEqual(token);
      await expect(authService.convertToken('client', 'google-oauth2', 'provider-token')).resolves.toEqual(token);
      await expect(authService.firebaseLogin('firebase-token', 'JOB_SEEKER')).resolves.toEqual(token);
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

    it('unwraps nested auth object response envelopes', async () => {
      const creds = { exists: true, email: 'a@b.com', emailVerified: false };
      const emailExists = { exists: true };
      const user = { id: 1, email: 'a@b.com', avatarUrl: 'avatar.jpg' };
      const workspaces = { id: 1, activeCompany: { id: 9 } };
      const updatedUser = { id: 1, fullName: 'New Name', avatarUrl: 'updated.jpg' };
      const avatar = { avatarUrl: 'avatar-new.jpg' };
      const deletedAvatar = { avatarUrl: null };
      const settings = { emailNotificationActive: true, smsNotificationActive: false };
      const updatedSettings = { emailNotificationActive: false, smsNotificationActive: true };

      (httpRequest.post as jest.Mock)
        .mockResolvedValueOnce({ data: { data: creds } })
        .mockResolvedValueOnce({ data: { data: emailExists } });
      (httpRequest.get as jest.Mock)
        .mockResolvedValueOnce({ data: { data: user } })
        .mockResolvedValueOnce({ data: { data: workspaces } })
        .mockResolvedValueOnce({ data: { data: settings } });
      (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: updatedUser } });
      (httpRequest.put as jest.Mock)
        .mockResolvedValueOnce({ data: { data: avatar } })
        .mockResolvedValueOnce({ data: { data: updatedSettings } });
      (httpRequest.delete as jest.Mock).mockResolvedValueOnce({ data: { data: deletedAvatar } });

      await expect(authService.checkCreds('a@b.com', 'JOB_SEEKER')).resolves.toEqual(creds);
      await expect(authService.emailExists('a@b.com')).resolves.toEqual(emailExists);
      await expect(authService.getUserInfo()).resolves.toEqual({ ...user, avatarUrl: 'presigned-avatar.jpg' });
      await expect(authService.getUserWorkspaces()).resolves.toEqual(workspaces);
      await expect(authService.updateUser({ fullName: 'New Name' })).resolves.toEqual({
        ...updatedUser,
        avatarUrl: 'presigned-updated.jpg',
      });

      const formData = new FormData();
      await expect(authService.updateAvatar(formData)).resolves.toEqual({ avatarUrl: 'presigned-avatar-new.jpg' });
      await expect(authService.deleteAvatar()).resolves.toEqual(deletedAvatar);
      await expect(authService.getUserSettings()).resolves.toEqual(settings);
      await expect(authService.updateUserSettings(updatedSettings)).resolves.toEqual(updatedSettings);
    });

    it('forgotPassword defaults platform to WEB', async () => {
      await authService.forgotPassword({ email: 'a@b.com' });
      expect(httpRequest.post).toHaveBeenCalledWith('auth/forgot-password/', { email: 'a@b.com', platform: 'WEB' });
    });

    it('normalizes empty successful auth action responses', async () => {
      (httpRequest.post as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('');
      (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: null });

      await expect(authService.forgotPassword({ email: 'a@b.com' })).resolves.toEqual({ success: true });
      await expect(authService.changePassword({ new_password: 'pass' } as any)).resolves.toEqual({ success: true });
      await expect(authService.revokeToken('token')).resolves.toEqual({ success: true });
    });

    it('normalizes verify-email action responses and preserves emailVerified', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({ emailVerified: false });

      await expect(authService.sendVerifyEmail('a@b.com')).resolves.toEqual({
        success: true,
        emailVerified: false,
      });
    });

    it('normalizes empty successful register responses', async () => {
      (httpRequest.post as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ data: null });

      await expect(authService.jobSeekerRegister({ email: 'a@b.com' } as any)).resolves.toEqual({ success: true });
      await expect(authService.employerRegister({ email: 'hr@b.com' } as any)).resolves.toEqual({ success: true });
    });

    it('normalizes reset-password responses and preserves backend success payload', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        redirectLoginUrl: '/login',
        successMessage: 'Password reset successfully.',
      });

      await expect(authService.resetPassword({ token: 'reset-token' } as any)).resolves.toEqual({
        success: true,
        redirectLoginUrl: '/login',
        successMessage: 'Password reset successfully.',
      });
    });
    
    it('getUserSettings calls get', async () => {
      await authService.getUserSettings();
      expect(httpRequest.get).toHaveBeenCalledWith('auth/settings/');
    });

    it('convertToken calls post with optional redirectUri and roleName', async () => {
      await authService.convertToken('client', 'google-oauth2', 'token', 'uri', 'EMPLOYER');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/convert-token/', {
        grant_type: 'convert_token',
        client_id: 'client',
        backend: 'google-oauth2',
        token: 'token',
        redirect_uri: 'uri',
        role_name: 'EMPLOYER'
      });
    });

    it('firebaseLogin calls post', async () => {
      await authService.firebaseLogin('token', 'JOB_SEEKER');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/firebase-login/', expect.any(Object));
      expect((httpRequest.post as jest.Mock).mock.calls[0][1]).not.toHaveProperty('client_secret');
    });

    it('revokeToken calls post', async () => {
      await authService.revokeToken('token', 'google');
      expect(httpRequest.post).toHaveBeenCalledWith('auth/revoke-token/', expect.any(Object));
      expect((httpRequest.post as jest.Mock).mock.calls[0][1]).not.toHaveProperty('client_secret');
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
