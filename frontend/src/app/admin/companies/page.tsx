'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Công ty' };

import CompaniesPage from '@/views/adminPages/CompaniesPage';

export default function Page() {
  return <CompaniesPage />;
}
