import type { Metadata } from 'next';
import ResumesPage from '@/views/adminPages/ResumesPage';

export const metadata: Metadata = { title: 'Resumes' };

export default function Page() {
  return <ResumesPage />;
}
