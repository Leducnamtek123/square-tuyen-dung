import Cookies from 'js-cookie';
import tokenService from '../tokenService';
import { AUTH_CONFIG } from '../../configs/constants';

jest.mock('js-cookie');

describe('tokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets accessToken from cookie', () => {
    (Cookies.get as jest.Mock).mockReturnValue('test-token');
    expect(tokenService.getAccessTokenFromCookie()).toBe('test-token');
  });

  it('returns null if accessToken is "undefined"', () => {
    (Cookies.get as jest.Mock).mockReturnValue('undefined');
    expect(tokenService.getAccessTokenFromCookie()).toBeNull();
  });

  it('gets refreshToken from cookie', () => {
    (Cookies.get as jest.Mock).mockReturnValue('refresh-token');
    expect(tokenService.getRefreshTokenFromCookie()).toBe('refresh-token');
  });

  it('runs saveAccessTokenAndRefreshTokenToCookie correctly', () => {
    const success = tokenService.saveAccessTokenAndRefreshTokenToCookie('foo', 'bar', 'backend');
    expect(success).toBe(true);
    expect(Cookies.set).toHaveBeenCalledTimes(3);
  });

  it('runs saveAccessTokenAndRefreshTokenToCookie correctly without provider', () => {
    const success = tokenService.saveAccessTokenAndRefreshTokenToCookie('foo', 'bar', null);
    expect(success).toBe(true);
    expect(Cookies.set).toHaveBeenCalledTimes(2);
  });

  it('runs removeAccessTokenAndRefreshTokenFromCookie correctly', () => {
    const success = tokenService.removeAccessTokenAndRefreshTokenFromCookie();
    expect(success).toBe(true);
    expect(Cookies.remove).toHaveBeenCalledTimes(3);
  });

  it('returns null for getProviderFromCookie when absent', () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    expect(tokenService.getProviderFromCookie()).toBeNull();
  });

  it('gets provider from cookie', () => {
    (Cookies.get as jest.Mock).mockReturnValue('BACKEND');
    expect(tokenService.getProviderFromCookie()).toBe('BACKEND');
  });
});
