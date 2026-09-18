import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfilePage from '@/views/employerPages/ProfilePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.candidates');
}

export default function Page() {
  return <ProfilePage />;
}
