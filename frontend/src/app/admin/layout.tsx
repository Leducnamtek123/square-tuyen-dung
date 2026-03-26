'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';
import tokenService from '@/services/tokenService';
import { getUserInfo } from '@/redux/userSlice';
import { ROLES_NAME } from '@/configs/constants';
import { isAdminPortalPath, getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);

  // Detect if current path is an auth-related page (login, forgot-password, etc.)
  // We check for both English (/admin) and Vietnamese (/quan-tri) prefixes
  const authSubPaths = ['/login', '/forgot-password', '/reset-password'];
  const isAuthPage = authSubPaths.some((subPath) => 
    pathname.endsWith(subPath) || pathname.includes(`${subPath}/`)
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenService.getAccessTokenFromCookie();
      const lang = getPreferredLanguage();
      const adminPrefix = getPortalPrefix('admin', lang);

      // 1. If no token, redirect to login if not already on an auth page
      if (!token) {
        if (!isAuthPage) {
          router.replace(`${adminPrefix}/login`);
        } else {
          setIsChecking(false);
        }
        return;
      }

      // 2. Token exists, ensure user info is loaded
      if (!currentUser) {
        try {
          await dispatch(getUserInfo()).unwrap();
        } catch (error) {
          // If fetching user info fails, token might be invalid/expired
          if (!isAuthPage) {
            router.replace(`${adminPrefix}/login`);
          } else {
            setIsChecking(false);
          }
          return;
        }
      }

      // 3. Re-check currentUser after dispatch
    };

    checkAuth();
  }, [dispatch, isAuthPage, pathname, router]);

  // Second effect to handle role verification once currentUser is available
  useEffect(() => {
    if (currentUser) {
      const lang = getPreferredLanguage();
      const adminPrefix = getPortalPrefix('admin', lang);
      const userRole = currentUser.roleName || (currentUser as any).role_name;

      if (userRole !== ROLES_NAME.ADMIN) {
        // Not an admin: if on an admin page, redirect away
        if (!isAuthPage) {
          // Redirect to a forbidden page or home if not authorized
          router.replace('/'); 
        } else {
          setIsChecking(false);
        }
      } else {
        // Is admin: if on login page, redirect to dashboard
        if (isAuthPage && (pathname.endsWith('/login') || pathname.endsWith('/quan-tri'))) {
           router.replace(`${adminPrefix}/dashboard`);
        } else {
          setIsChecking(false);
        }
      }
    }
  }, [currentUser, isAuthPage, pathname, router]);

  if (isChecking) {
    // Show nothing or a loading spinner while checking auth/roles
    return null; 
  }

  if (isAuthPage) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
