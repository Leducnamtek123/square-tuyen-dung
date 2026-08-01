// Server Component - no client hooks needed, can export metadata
import type { Metadata } from 'next';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyển Dụng',
    default: 'Trang cá nhân | InfoHR Tuyển Dụng',
  },
};

export default function DashboardSectionLayout({
  children,
}: {
  children: any;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}

