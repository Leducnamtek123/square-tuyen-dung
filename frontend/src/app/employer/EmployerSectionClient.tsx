'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import EmployerLayout from '@/layouts/EmployerLayout';
import DefaultLayout from '@/layouts/DefaultLayout';
import ChatLayout from '@/layouts/ChatLayout';
import tokenService from '@/services/tokenService';
import { getUserInfo } from '@/redux/userSlice';
import { ROLES_NAME } from '@/configs/constants';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';

// Pages that use DefaultLayout instead of EmployerLayout
const DEFAULT_LAYOUT_PATHS = [
  '/employer/login',
  '/nha-tuyen-dung/login',
  '/employer/forgot-password',
  '/nha-tuyen-dung/quen-mat-khau',
  '/nha-tuyen-dung/forgot-password',
  '/employer/reset-password',
  '/nha-tuyen-dung/cap-nhat-mat-khau',
  '/nha-tuyen-dung/reset-password',
  '/employer/register',
  '/nha-tuyen-dung/dang-ky',
  '/nha-tuyen-dung/register',
  '/employer/introduce',
  '/nha-tuyen-dung/gioi-thieu',
  '/employer/service',
  '/nha-tuyen-dung/dich-vu',
  '/employer/pricing',
  '/nha-tuyen-dung/bao-gia',
  '/employer/support',
  '/nha-tuyen-dung/ho-tro',
  // NOTE: /employer/blog is a protected employer management page.
  // Public readers should use /blog (localized as /tin-tuc on the VI route set).
];

const CHAT_LAYOUT_PATHS = ['/employer/chat', '/nha-tuyen-dung/ket-noi-voi-ung-vien', '/nha-tuyen-dung/chat'];

/** Full-screen loading overlay — shown while auth check is in progress */
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

export default function EmployerSectionClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  const isPublicPage = DEFAULT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  /**
   * Synchronous early-exit: if this is a protected page and there is no
   * access-token cookie at all, we know immediately (before any async work)
   * that the user must be redirected to login.  Setting the initial state to
   * `true` (= "still checking") keeps the loading screen visible while
   * window.location.replace() fires, which prevents the protected page from
   * ever rendering.
   */
  const [isChecking, setIsChecking] = useState(() => {
    if (isPublicPage) return false; // public pages never need a guard
    if (typeof window === 'undefined') return true; // SSR – stay loading
    const hasToken = Boolean(tokenService.getAccessTokenFromCookie());
    return hasToken; // no token → skip async check (useEffect will redirect)
  });

  // Track whether we should redirect to login without flashing protected content.
  // If the user has no token at all and is on a protected page, redirect immediately.
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(() => {
    if (isPublicPage || typeof window === 'undefined') return false;
    return !tokenService.getAccessTokenFromCookie();
  });

  useEffect(() => {
    // Redirect immediately without waiting for the async check
    if (shouldRedirectToLogin) {
      const lang = getPreferredLanguage();
      const employerPrefix = getPortalPrefix('employer', lang);
      window.location.replace(`${employerPrefix}/login`);
      return;
    }

    const checkAuth = async () => {
      const lang = getPreferredLanguage();
      const employerPrefix = getPortalPrefix('employer', lang);
      const loginPath = `${employerPrefix}/login`;
      const dashboardPath = `${employerPrefix}/bang-dieu-khien`;
      const token = tokenService.getAccessTokenFromCookie();

      if (isPublicPage) {
        if (token) {
          let user = currentUser;
          if (!currentUser) {
            try {
              user = await dispatch(getUserInfo()).unwrap();
            } catch {
              return;
            }
          }

          const role = user?.roleName;
          const isAuthPage =
            pathname.endsWith('/login') ||
            pathname.endsWith('/register') ||
            pathname.endsWith('/forgot-password') ||
            pathname.includes('/reset-password/');

          if (role === ROLES_NAME.EMPLOYER && isAuthPage) {
            window.location.replace(dashboardPath);
            return;
          }
        }
        return;
      }

      // Token exists — verify role
      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          window.location.replace(loginPath);
          return;
        }
      }

      const role = user?.roleName;
      if (role !== ROLES_NAME.EMPLOYER) {
        window.location.replace('/');
        return;
      }
    };

    void checkAuth().finally(() => setIsChecking(false));
  }, [currentUser, dispatch, isPublicPage, pathname, shouldRedirectToLogin]);

  // Show a full-screen loading screen while auth is being verified.
  // This completely hides children so protected pages never flash.
  if (isChecking || shouldRedirectToLogin) {
    return <AuthLoadingScreen />;
  }

  if (CHAT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <ChatLayout>{children}</ChatLayout>;
  }

  if (isPublicPage) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  return <EmployerLayout>{children}</EmployerLayout>;
}
