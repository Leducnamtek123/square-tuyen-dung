// Server Component - no client hooks needed, can export metadata
import type { Metadata } from 'next';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyá»ƒn Dá»¥ng',
    default: 'Trang cÃ¡ nhÃ¢n | InfoHR Tuyá»ƒn Dá»¥ng',
  },
};

export default function DashboardSectionLayout({
  children,
}: {
  children: any;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}

