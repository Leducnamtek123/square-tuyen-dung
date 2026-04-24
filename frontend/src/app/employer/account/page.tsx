'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tài khoản' };

import AccountPage from '@/views/employerPages/AccountPage';

export default function Page() {
  return <AccountPage />;
}
