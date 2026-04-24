'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Người dùng' };

import UsersPage from '@/views/adminPages/UsersPage';

export default function Page() {
  return <UsersPage />;
}
