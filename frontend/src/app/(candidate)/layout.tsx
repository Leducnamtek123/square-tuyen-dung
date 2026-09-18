import type { Metadata } from 'next';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyển Dụng',
    default: 'Trang cá nhân | InfoHR Tuyển Dụng',
  },
};

export default function CandidateSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}
