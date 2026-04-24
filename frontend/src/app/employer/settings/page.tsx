import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SettingPage from '@/views/employerPages/SettingPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.settings');
}

export default function Page() {
  return <SettingPage />;
}
