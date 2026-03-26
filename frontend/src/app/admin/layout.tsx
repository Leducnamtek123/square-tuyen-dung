'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import AdminLoginLayout from '@/layouts/AdminLoginLayout';

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

  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <AdminLoginLayout>{children}</AdminLoginLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
