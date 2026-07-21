import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfileDetailPage from '@/views/adminPages/ProfileDetailPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.profileDetail');
}

export default function Page() {
  return <ProfileDetailPage />;
}
