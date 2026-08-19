import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('privacy-policy');
}

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="privacy" />
    </DefaultLayout>
  );
}

