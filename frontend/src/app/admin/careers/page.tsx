'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Ngành nghề' };

import CareersPage from '@/views/adminPages/CareersPage';

export default function Page() {
  return <CareersPage />;
}
