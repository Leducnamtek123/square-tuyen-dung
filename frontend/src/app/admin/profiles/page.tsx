import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Hồ sơ ứng viên' };

import ProfilesPage from '@/views/adminPages/ProfilesPage';

export default function Page() {
  return <ProfilesPage />;
}
