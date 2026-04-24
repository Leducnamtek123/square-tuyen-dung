import type { Metadata } from 'next';
import CareersPage from '@/views/adminPages/CareersPage';

export const metadata: Metadata = { title: 'Careers' };

export default function Page() {
  return <CareersPage />;
}
