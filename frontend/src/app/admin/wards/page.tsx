import type { Metadata } from 'next';
import WardsPage from '@/views/adminPages/WardsPage';

export const metadata: Metadata = { title: 'Wards' };

export default function Page() {
  return <WardsPage />;
}
