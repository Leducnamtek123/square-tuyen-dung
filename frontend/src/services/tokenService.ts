import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '../configs/constants';

/** Cookie options -- enable `secure` only over HTTPS so local dev still works. */
const baseCookieOptions: Cookies.CookieAttributes = {
  sameSite: 'Lax' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

const tokenService = {
  getAccessTokenFromCookie: (): string | null => {
    try {
      const accessToken = Cookies.get(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      return accessToken && accessToken !== 'undefined' ? accessToken : null;
    } catch {
      return null;
    }
  },

  getRefreshTokenFromCookie: (): string | null => {
    try {
      const refreshToken = Cookies.get(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      return refreshToken && refreshToken !== 'undefined' ? refreshToken : null;
    } catch {
      return null;
    }
  },

  getProviderFromCookie: (): string | null => {
    try {
      const provider = Cookies.get(AUTH_CONFIG.BACKEND_KEY);
      return provider && provider !== 'undefined' ? provider : null;
    } catch {
      return null;
    }
  },

  saveAccessTokenAndRefreshTokenToCookie: (
    accessToken: string,
    refreshToken: string,
    provider: string | null | undefined
  ): boolean => {
    try {
      Cookies.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, accessToken, {
        ...baseCookieOptions,
        expires: 7, // 7 days -- server-side TTL is the real expiry
      });
      Cookies.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken, {
        ...baseCookieOptions,
        expires: 30, // 30 days
      });
      if (provider) {
        Cookies.set(AUTH_CONFIG.BACKEND_KEY, provider, {
          ...baseCookieOptions,
          expires: 30,
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  removeAccessTokenAndRefreshTokenFromCookie: (): boolean => {
    try {
      Cookies.remove(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      Cookies.remove(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      Cookies.remove(AUTH_CONFIG.BACKEND_KEY);
      return true;
    } catch {
      return false;
    }
  },
};

export default tokenService;
