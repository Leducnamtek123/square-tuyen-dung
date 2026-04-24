import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import FeedbacksPage from '@/views/adminPages/FeedbacksPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.feedbacks');
}

export default function Page() {
  return <FeedbacksPage />;
}
