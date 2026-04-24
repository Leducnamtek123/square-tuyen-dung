import type { Metadata } from 'next';
import JobsPage from '@/views/adminPages/JobsPage';

export const metadata: Metadata = { title: 'Jobs' };

export default function Page() {
  return <JobsPage />;
}
