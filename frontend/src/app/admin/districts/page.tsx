import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Quận huyện' };

import DistrictsPage from '@/views/adminPages/DistrictsPage';

export default function Page() {
  return <DistrictsPage />;
}
