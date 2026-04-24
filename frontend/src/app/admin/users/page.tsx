import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import UsersPage from '@/views/adminPages/UsersPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.users');
}

export default function Page() {
  return <UsersPage />;
}
