'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Banner' };

import BannersPage from '@/views/adminPages/BannersPage';

export default function Page() {
  return <BannersPage />;
}
