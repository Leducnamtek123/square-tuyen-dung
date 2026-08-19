import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.privacy-policy');
}

export default function Page() {
  return <StaticInfoPage pageKey="privacy" />;
}

