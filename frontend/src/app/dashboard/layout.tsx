// Server Component — no client hooks needed, can export metadata
import type { Metadata } from 'next';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Tuyển Dụng',
    default: 'Trang cá nhân | Square Tuyển Dụng',
  },
};

export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}
