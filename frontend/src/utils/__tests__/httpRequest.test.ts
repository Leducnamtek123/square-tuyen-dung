import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import httpRequest, { refreshClient } from '../httpRequest';
import tokenService from '../../services/tokenService';
import { AUTH_CONFIG } from '../../configs/constants';

jest.mock('../../services/tokenService', () => ({
  getAccessTokenFromCookie: jest.fn(),
  getRefreshTokenFromCookie: jest.fn(),
  removeAccessTokenAndRefreshTokenFromCookie: jest.fn(),
  getProviderFromCookie: jest.fn(),
  saveAccessTokenAndRefreshTokenToCookie: jest.fn(),
}));

describe('httpRequest', () => {
  let mock: MockAdapter;
  let refreshMock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(httpRequest as any);
    refreshMock = new MockAdapter(refreshClient as any);
  });

  afterEach(() => {
    mock.reset();
    refreshMock.reset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mock.restore();
    refreshMock.restore();
  });

  it('adds access token for authenticated requests', async () => {
    (tokenService.getAccessTokenFromCookie as jest.Mock).mockReturnValue('mock-token');

    mock.onGet('/some-protected-endpoint').reply(config => {
      expect(config.headers?.['Authorization']).toBe('Bearer mock-token');
      return [200, { data: { success: true } }];
    });

    const response = await httpRequest.get('/some-protected-endpoint');
    expect(response).toEqual({ success: true }); // Because of unwrapResponse / camelizeKeys
  });

  it('does not add access token for public endpoints', async () => {
    (tokenService.getAccessTokenFromCookie as jest.Mock).mockReturnValue('mock-token');

    mock.onPost('auth/token/').reply(config => {
      expect(config.headers?.['Authorization']).toBeUndefined();
      return [200, { data: { token: '123' } }];
    });

    const response = await httpRequest.post('auth/token/', {});
    expect(response).toEqual({ token: '123' });
  });

  it('cleans empty params via interceptor', async () => {
    mock.onGet('/params-test').reply(config => {
      expect(config.params).toEqual({ valid: 'value' });
      return [200, {}];
    });

    await httpRequest.get('/params-test', {
      params: { valid: 'value', empty: '', nulled: null, undefinedField: undefined },
    });
  });

  it('keeps empty params if keepEmptyParams is true', async () => {
    mock.onGet('/params-test-keep').reply(config => {
      expect(config.params).toEqual({ valid: 'value', empty: '' });
      return [200, {}];
    });

    await httpRequest.get('/params-test-keep', {
      params: { valid: 'value', empty: '' },
      keepEmptyParams: true
    } as any);
  });

  it('converts response snake_case to camelCase properly', async () => {
    mock.onGet('/snake-endpoint').reply(200, {
      data: {
        first_name: 'John',
        last_name: 'Doe'
      }
    });

    const response = await httpRequest.get('/snake-endpoint');
    expect(response).toEqual({ firstName: 'John', lastName: 'Doe' });
  });

  describe('error interceptor & token refresh logic', () => {
    it('retries on 5xx errors for GET requests', async () => {
      mock.onGet('/500-endpoint').replyOnce(500);
      mock.onGet('/500-endpoint').replyOnce(200, { data: { success: true } });

      const response = await httpRequest.get('/500-endpoint');
      expect(response).toEqual({ success: true });
    });

    it('rejects on generic non-401 error', async () => {
      mock.onGet('/400-endpoint').reply(400, { message: 'Bad request' });
      await expect(httpRequest.get('/400-endpoint')).rejects.toThrow();
    });

    it('rejects immediately on 401 if it is a public endpoint', async () => {
      mock.onPost('auth/token/').reply(401);
      await expect(httpRequest.post('auth/token/')).rejects.toThrow();
    });

    it('removes tokens and rejects if refresh token is missing on 401', async () => {
      (tokenService.getRefreshTokenFromCookie as jest.Mock).mockReturnValue(null);
      mock.onGet('/protected-endpoint').reply(401);

      await expect(httpRequest.get('/protected-endpoint')).rejects.toThrow();
      expect(tokenService.removeAccessTokenAndRefreshTokenFromCookie).toHaveBeenCalled();
    });

    it('attempts to refresh token and retries the request', async () => {
      (tokenService.getRefreshTokenFromCookie as jest.Mock).mockReturnValue('valid-refresh');

      // 1. The original request fails
      mock.onGet('/protected-refresh').replyOnce(401);
      // 2. The refresh request succeeds
      refreshMock.onPost('auth/token/').replyOnce(200, {
        data: {
          accessToken: 'new-access',
          refreshToken: 'new-refresh'
        }
      });
      // 3. The retried request succeeds
      mock.onGet('/protected-refresh').replyOnce(200, { data: { success: true } });

      const response = await httpRequest.get('/protected-refresh');

      expect(response).toEqual({ success: true });
      expect(tokenService.saveAccessTokenAndRefreshTokenToCookie).toHaveBeenCalledWith(
        'new-access',
        'new-refresh',
        undefined
      );
    });

    it('fails to refresh token, logs out and rejects', async () => {
      (tokenService.getRefreshTokenFromCookie as jest.Mock).mockReturnValue('valid-refresh');

      mock.onGet('/fail-refresh').replyOnce(401);
      refreshMock.onPost('auth/token/').replyOnce(400); // refresh fails

      await expect(httpRequest.get('/fail-refresh')).rejects.toThrow();
      expect(tokenService.removeAccessTokenAndRefreshTokenFromCookie).toHaveBeenCalled();
    });
  });
});
