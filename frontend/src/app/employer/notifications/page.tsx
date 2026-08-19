import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import NotificationPage from '@/views/defaultPages/NotificationPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.notifications');
}

export default function Page() {
  return <NotificationPage />;
}
