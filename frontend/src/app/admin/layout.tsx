'use client';

import { useQuery } from '@tanstack/react-query';
import { redirect, usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';
import tokenService from '@/services/tokenService';
import { getUserInfo } from '@/redux/userSlice';
import { ROLES_NAME } from '@/configs/constants';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

/**
 * AdminSectionLayout - Handles authentication and role-based access control
 * for all routes under /admin and /quan-tri.
 */
export default function AdminSectionLayout({
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

  const { data: fetchedUser } = useQuery({
    queryKey: ['admin-layout-user', token],
    queryFn: async () => dispatch(getUserInfo()).unwrap(),
    enabled: Boolean(token) && !currentUser,
    retry: false,
  });

  const user = currentUser ?? fetchedUser ?? null;

  if (!token) {
    if (!isAuthPage) {
      redirect(`${adminPrefix}/login`);
    }
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  if (!user && !isAuthPage) {
    redirect(`${adminPrefix}/login`);
  }

  if (user?.roleName && user.roleName !== ROLES_NAME.ADMIN) {
    if (!isAuthPage) {
      redirect('/');
    }
  } else if (isAuthPage && isLoginPage) {
    redirect(`${adminPrefix}/dashboard`);
  }

  if (isAuthPage) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
