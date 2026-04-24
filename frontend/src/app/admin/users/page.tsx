import type { Metadata } from 'next';
import UsersPage from '@/views/adminPages/UsersPage';

export const metadata: Metadata = { title: 'Users' };

export default function Page() {
  return <UsersPage />;
}
