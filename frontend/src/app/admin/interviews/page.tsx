import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewsPage from '@/views/adminPages/InterviewsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.interviews');
}

export default function Page() {
  return <InterviewsPage />;
}
