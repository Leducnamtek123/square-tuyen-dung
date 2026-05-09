'use client';

import { useEffect, useReducer } from 'react';
import { usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';
import tokenService from '@/services/tokenService';
import { getUserInfo } from '@/redux/userSlice';
import { ROLES_NAME } from '@/configs/constants';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

type AuthGateState = {
  isChecking: boolean;
  shouldRedirectToLogin: boolean;
};

type AuthGateAction = { type: 'redirectToLogin' } | { type: 'checked' };

const authGateReducer = (state: AuthGateState, action: AuthGateAction): AuthGateState => {
  switch (action.type) {
    case 'redirectToLogin':
      return {
        ...state,
        isChecking: false,
        shouldRedirectToLogin: true,
      };
    case 'checked':
      return {
        ...state,
        isChecking: false,
      };
    default:
      return state;
  }
};

const getInitialAuthGateState = (isAuthPage: boolean): AuthGateState => {
  if (isAuthPage) {
    return {
      isChecking: false,
      shouldRedirectToLogin: false,
    };
  }

  if (typeof window === 'undefined') {
    return {
      isChecking: true,
      shouldRedirectToLogin: false,
    };
  }

  const hasToken = Boolean(tokenService.getAccessTokenFromCookie());

  return {
    isChecking: hasToken,
    shouldRedirectToLogin: !hasToken,
  };
};

/**
 * AdminSectionClient - Handles authentication and role-based access control
 * for all routes under /admin and /quan-tri.
 * Extracted to Client Component so admin/layout.tsx can be a Server Component.
 */

function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
}

export default function AdminSectionClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  const authSubPaths = ['/login', '/forgot-password', '/reset-password'];
  const isAuthPage = authSubPaths.some((subPath) => pathname.endsWith(subPath) || pathname.includes(`${subPath}/`));
  const isLoginPage = pathname.endsWith('/login') || pathname.endsWith('/quan-tri');
  const token = tokenService.getAccessTokenFromCookie();
  const lang = getPreferredLanguage();
  const adminPrefix = getPortalPrefix('admin', lang);
  const loginPath = `${adminPrefix}/login`;
  const dashboardPath = `${adminPrefix}/dashboard`;
  const [authGate, dispatchAuthGate] = useReducer(
    authGateReducer,
    isAuthPage,
    getInitialAuthGateState
  );

  useEffect(() => {
    if (authGate.shouldRedirectToLogin) {
      window.location.replace(loginPath);
      return;
    }

    const checkAuth = async () => {
      const currentToken = tokenService.getAccessTokenFromCookie();

      if (!currentToken) {
        if (!isAuthPage) {
          dispatchAuthGate({ type: 'redirectToLogin' });
        }
        return;
      }

      let nextUser = currentUser;
      if (!nextUser) {
        try {
          nextUser = await dispatch(getUserInfo()).unwrap();
        } catch {
          dispatchAuthGate({ type: 'redirectToLogin' });
          return;
        }
      }

      if (nextUser?.roleName && nextUser.roleName !== ROLES_NAME.ADMIN) {
        window.location.replace('/');
        return;
      }

      if (isAuthPage && isLoginPage && nextUser?.roleName === ROLES_NAME.ADMIN) {
        window.location.replace(dashboardPath);
      }
    };

    void checkAuth().finally(() => {
      dispatchAuthGate({ type: 'checked' });
    });
  }, [authGate.shouldRedirectToLogin, adminPrefix, currentUser, dashboardPath, dispatch, isAuthPage, isLoginPage, loginPath]);

  if (authGate.isChecking || authGate.shouldRedirectToLogin) {
    return <AuthLoadingScreen />;
  }

  if (!token) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  if (isAuthPage) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
