import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Cài đặt hệ thống' };

import SettingsPage from '@/views/adminPages/SettingsPage';

export default function Page() {
  return <SettingsPage />;
}
