'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';
import tokenService from '@/services/tokenService';

// Pages that use AdminLoginLayout instead of AdminLayout
const AUTH_PATHS = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    const token = tokenService.getAccessTokenFromCookie();
    if (!token && !isAuthPage) {
      router.replace('/admin/login');
      return;
    }
    setIsChecking(false);
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  if (isChecking) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
