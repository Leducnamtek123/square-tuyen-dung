'use client';

import { useEffect, useReducer } from 'react';
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

const getInitialAuthGateState = (isPublicPage: boolean): AuthGateState => {
  if (isPublicPage) {
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
  // /employer/blog is protected; public readers use /blog or /tin-tuc.
];

const CHAT_LAYOUT_PATHS = ['/employer/chat', '/nha-tuyen-dung/ket-noi-voi-ung-vien', '/nha-tuyen-dung/chat'];

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

  const isPublicPage = DEFAULT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [authGate, dispatchAuthGate] = useReducer(
    authGateReducer,
    isPublicPage,
    getInitialAuthGateState
  );

  useEffect(() => {
    if (authGate.shouldRedirectToLogin) {
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
          }
        }
        return;
      }

      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          window.location.replace(loginPath);
          return;
        }
      }

      if (user?.roleName !== ROLES_NAME.EMPLOYER) {
        window.location.replace('/');
      }
    };

    void checkAuth().finally(() => dispatchAuthGate({ type: 'checked' }));
  }, [authGate.shouldRedirectToLogin, currentUser, dispatch, isPublicPage, pathname]);

  if (authGate.isChecking || authGate.shouldRedirectToLogin) {
    return <AuthLoadingScreen />;
  }

  if (CHAT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <ChatLayout>{children}</ChatLayout>;
  }

  if (isPublicPage) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  return <EmployerLayout>{children}</EmployerLayout>;
}
