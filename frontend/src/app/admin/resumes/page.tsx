'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'CV Resume' };

import ResumesPage from '@/views/adminPages/ResumesPage';

export default function Page() {
  return <ResumesPage />;
}
