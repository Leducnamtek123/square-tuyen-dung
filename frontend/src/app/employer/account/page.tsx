import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AccountPage from '@/views/employerPages/AccountPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.account');
}

export default function Page() {
  return <AccountPage />;
}
