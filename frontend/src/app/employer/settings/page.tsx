import type { Metadata } from 'next';
import SettingPage from '@/views/employerPages/SettingPage';

export const metadata: Metadata = { title: 'Settings' };

export default function Page() {
  return <SettingPage />;
}
