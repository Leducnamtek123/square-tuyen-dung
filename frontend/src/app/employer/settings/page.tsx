import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Cài đặt' };

import SettingPage from '@/views/employerPages/SettingPage';

export default function Page() {
  return <SettingPage />;
}
