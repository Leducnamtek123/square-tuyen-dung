import type { Metadata } from 'next';
import JobActivityPage from '@/views/adminPages/JobActivityPage';

export const metadata: Metadata = { title: 'Job Activity' };

export default function Page() {
  return <JobActivityPage />;
}
