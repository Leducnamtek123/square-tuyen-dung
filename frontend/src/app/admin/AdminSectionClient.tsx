'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';
import tokenService from '@/services/tokenService';
import { getUserInfo } from '@/redux/userSlice';
import { ROLES_NAME } from '@/configs/constants';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

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

  const [isChecking, setIsChecking] = useState(() => {
    if (isAuthPage) return false;
    if (typeof window === 'undefined') return true;
    return Boolean(tokenService.getAccessTokenFromCookie());
  });

  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(() => {
    if (isAuthPage || typeof window === 'undefined') return false;
    return !tokenService.getAccessTokenFromCookie();
  });

  useEffect(() => {
    if (shouldRedirectToLogin) {
      window.location.replace(loginPath);
      return;
    }

    const checkAuth = async () => {
      const currentToken = tokenService.getAccessTokenFromCookie();

      if (!currentToken) {
        if (!isAuthPage) {
          setShouldRedirectToLogin(true);
        }
        return;
      }

      let nextUser = currentUser;
      if (!nextUser) {
        try {
          nextUser = await dispatch(getUserInfo()).unwrap();
        } catch {
          setShouldRedirectToLogin(true);
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
      setIsChecking(false);
    });
  }, [adminPrefix, currentUser, dashboardPath, dispatch, isAuthPage, isLoginPage, loginPath, shouldRedirectToLogin]);

  if (isChecking || shouldRedirectToLogin) {
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
