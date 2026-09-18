import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import AboutUsPage from '@/views/defaultPages/AboutUsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('about');
}

export default function Page() {
  return (
    <DefaultLayout>
      <AboutUsPage />
    </DefaultLayout>
  );
}
