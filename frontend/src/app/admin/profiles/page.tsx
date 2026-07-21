import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfilesPage from '@/views/adminPages/ProfilesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.profiles');
}

export default function Page() {
  return <ProfilesPage />;
}
