import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import MyInterviewsPage from '@/views/jobSeekerPages/MyInterviewsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('my-interviews');
}

export default function Page() {
  return <MyInterviewsPage />;
}
