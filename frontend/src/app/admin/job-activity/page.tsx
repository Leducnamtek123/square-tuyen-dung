'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Nhật ký tin tuyển dụng' };

import JobActivityPage from '@/views/adminPages/JobActivityPage';

export default function Page() {
  return <JobActivityPage />;
}
