import type { Metadata } from 'next';
import ProfilesPage from '@/views/adminPages/ProfilesPage';

export const metadata: Metadata = { title: 'Profiles' };

export default function Page() {
  return <ProfilesPage />;
}
