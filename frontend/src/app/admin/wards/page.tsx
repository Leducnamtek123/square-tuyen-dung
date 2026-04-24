import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Phường xã' };

import WardsPage from '@/views/adminPages/WardsPage';

export default function Page() {
  return <WardsPage />;
}
