import type { Metadata } from 'next';
import AccountPage from '@/views/jobSeekerPages/AccountPage';

export const metadata: Metadata = { title: 'Account' };

export default function Page() {
  return <AccountPage />;
}