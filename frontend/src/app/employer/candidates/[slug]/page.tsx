import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfileDetailPage from '@/views/employerPages/ProfileDetailPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.candidate-detail');
}

export default function Page() {
  return <ProfileDetailPage />;
}
