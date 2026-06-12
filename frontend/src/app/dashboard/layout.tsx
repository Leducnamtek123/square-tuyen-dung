// Server Component â€” no client hooks needed, can export metadata
import type { Metadata } from 'next';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Tuyá»ƒn Dá»¥ng',
    default: 'Trang cÃ¡ nhÃ¢n | Square Tuyá»ƒn Dá»¥ng',
  },
};

export default function DashboardSectionLayout({
  children,
}: {
  children: any;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}
