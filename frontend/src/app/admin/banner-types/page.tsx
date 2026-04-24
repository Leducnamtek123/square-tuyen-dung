'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Loại banner' };

import BannerTypesPage from '@/views/adminPages/BannerTypesPage';

export default function Page() {
  return <BannerTypesPage />;
}
