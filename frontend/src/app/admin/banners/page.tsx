import type { Metadata } from 'next';
import BannersPage from '@/views/adminPages/BannersPage';

export const metadata: Metadata = { title: 'Banners' };

export default function Page() {
  return <BannersPage />;
}
