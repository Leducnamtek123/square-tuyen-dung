import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SettingsPage from '@/views/adminPages/SettingsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.settings');
}

export default function Page() {
  return <SettingsPage />;
}
