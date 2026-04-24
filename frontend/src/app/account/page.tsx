'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tài khoản' };

import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import AccountPage from '@/views/jobSeekerPages/AccountPage';

export default function Page() {
  return (
    <JobSeekerLayout>
      <AccountPage />
    </JobSeekerLayout>
  );
}
