'use client';

import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}
