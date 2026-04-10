import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import httpRequest from '../httpRequest';
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

  beforeAll(() => {
    mock = new MockAdapter(httpRequest as any);
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mock.restore();
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
});
