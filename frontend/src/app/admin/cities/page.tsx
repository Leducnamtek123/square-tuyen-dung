'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tỉnh thành' };

import CitiesPage from '@/views/adminPages/CitiesPage';

export default function Page() {
  return <CitiesPage />;
}
