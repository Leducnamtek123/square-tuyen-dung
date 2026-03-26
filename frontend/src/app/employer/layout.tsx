'use client';

import { usePathname } from 'next/navigation';
import EmployerLayout from '@/layouts/EmployerLayout';
import DefaultLayout from '@/layouts/DefaultLayout';
import ChatLayout from '@/layouts/ChatLayout';

// Pages that use DefaultLayout instead of EmployerLayout
const DEFAULT_LAYOUT_PATHS = [
  '/employer/login',
  '/employer/forgot-password',
  '/employer/reset-password',
  '/employer/register',
  '/employer/introduce',
  '/employer/service',
  '/employer/pricing',
  '/employer/support',
  '/employer/blog',
];

const CHAT_LAYOUT_PATHS = ['/employer/chat'];

export default function EmployerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';

  if (CHAT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <ChatLayout>{children}</ChatLayout>;
  }

  if (DEFAULT_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <DefaultLayout>{children}</DefaultLayout>;
  }

  return <EmployerLayout>{children}</EmployerLayout>;
}
