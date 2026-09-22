import Cookies from 'js-cookie';
import tokenService from '../tokenService';
import { AUTH_CONFIG } from '../../configs/constants';

jest.mock('js-cookie');

describe('tokenService Edge Case & Resilience Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessTokenFromCookie', () => {
    it('returns null when cookie contains null, undefined, or empty string', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('undefined');
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('null');
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('');
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('    ');
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('[object Object]');
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();
    });

    it('returns valid trimmed access token', () => {
      (Cookies.get as jest.Mock).mockReturnValue('   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ');
      expect(tokenService.getAccessTokenFromCookie()).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('handles Cookies.get exception safely without throwing unhandled error', () => {
      (Cookies.get as jest.Mock).mockImplementation(() => {
        throw new Error('Cookie access denied');
      });
      expect(tokenService.getAccessTokenFromCookie()).toBeNull();
    });
  });

  describe('getRefreshTokenFromCookie', () => {
    it('returns null for corrupted or placeholder refresh tokens', () => {
      (Cookies.get as jest.Mock).mockReturnValue('null');
      expect(tokenService.getRefreshTokenFromCookie()).toBeNull();

      (Cookies.get as jest.Mock).mockReturnValue('undefined');
      expect(tokenService.getRefreshTokenFromCookie()).toBeNull();
    });

    it('returns valid trimmed refresh token', () => {
      (Cookies.get as jest.Mock).mockReturnValue('valid-refresh-token-123');
      expect(tokenService.getRefreshTokenFromCookie()).toBe('valid-refresh-token-123');
    });
  });

  describe('saveAccessTokenAndRefreshTokenToCookie & remove', () => {
    it('saves tokens and returns true', () => {
      expect(tokenService.saveAccessTokenAndRefreshTokenToCookie('acc_token', 'ref_token', 'google')).toBe(true);
      expect(Cookies.set).toHaveBeenCalledWith(AUTH_CONFIG.ACCESS_TOKEN_KEY, 'acc_token', expect.any(Object));
      expect(Cookies.set).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_TOKEN_KEY, 'ref_token', expect.any(Object));
      expect(Cookies.set).toHaveBeenCalledWith(AUTH_CONFIG.BACKEND_KEY, 'google', expect.any(Object));
    });

    it('handles Cookies.set error gracefully returning false', () => {
      (Cookies.set as jest.Mock).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(tokenService.saveAccessTokenAndRefreshTokenToCookie('acc_token', 'ref_token', null)).toBe(false);
    });

    it('removes tokens and returns true', () => {
      expect(tokenService.removeAccessTokenAndRefreshTokenFromCookie()).toBe(true);
      expect(Cookies.remove).toHaveBeenCalledWith(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      expect(Cookies.remove).toHaveBeenCalledWith(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      expect(Cookies.remove).toHaveBeenCalledWith(AUTH_CONFIG.BACKEND_KEY);
    });
  });
});
