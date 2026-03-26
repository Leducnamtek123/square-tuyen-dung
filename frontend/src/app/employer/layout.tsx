'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
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

export default function EmployerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
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
          let user = currentUser as any;
          if (!currentUser) {
            try {
              user = await dispatch(getUserInfo()).unwrap();
            } catch {
              setIsChecking(false);
              return;
            }
          }

          const role = user?.roleName || user?.role_name;
          const isAuthPage =
            pathname.endsWith('/login') ||
            pathname.endsWith('/register') ||
            pathname.endsWith('/forgot-password') ||
            pathname.includes('/reset-password/');

          if (role === ROLES_NAME.EMPLOYER && isAuthPage) {
            router.replace(dashboardPath);
            return;
          }
        }

        setIsChecking(false);
        return;
      }

      if (!token) {
        router.replace(loginPath);
        return;
      }

      let user = currentUser as any;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          router.replace(loginPath);
          return;
        }
      }

      const role = user?.roleName || user?.role_name;
      if (role !== ROLES_NAME.EMPLOYER) {
        router.replace('/');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [currentUser, dispatch, isPublicPage, pathname, router]);

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
