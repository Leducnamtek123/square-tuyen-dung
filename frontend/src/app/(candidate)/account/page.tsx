import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AccountPage from '@/views/jobSeekerPages/AccountPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('account');
}

export default function Page() {
  return <AccountPage />;
}
