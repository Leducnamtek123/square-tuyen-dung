import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import NewsPage from '@/views/defaultPages/NewsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('news');
}

export default function Page() {
  return (
    <DefaultLayout>
      <NewsPage />
    </DefaultLayout>
  );
}
