import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfilePage from '@/views/jobSeekerPages/ProfilePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('profile');
}

export default function Page() {
  return <ProfilePage />;
}
