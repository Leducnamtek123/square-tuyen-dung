'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
  '/employer/blog',
  '/nha-tuyen-dung/blog-tuyen-dung',
];

const CHAT_LAYOUT_PATHS = ['/employer/chat', '/nha-tuyen-dung/ket-noi-voi-ung-vien', '/nha-tuyen-dung/chat'];

export default function EmployerSectionClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);

  const isPublicPage = DEFAULT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
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

      if (!token) {
        window.location.replace(loginPath);
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

      const role = user?.roleName;
      if (role !== ROLES_NAME.EMPLOYER) {
        window.location.replace('/');
        return;
      }
    };

    void checkAuth().finally(() => setIsChecking(false));
  }, [currentUser, dispatch, isPublicPage, pathname]);

  if (isChecking) {
    return null;
  }

  if (CHAT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <ChatLayout>{children}</ChatLayout>;
  }

  if (isPublicPage) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  return <EmployerLayout>{children}</EmployerLayout>;
}
