import type { Metadata } from 'next';
import { buildPageMetadata, getPageTitle } from '@/utils/serverI18n';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildPageMetadata('home');
  const title = await getPageTitle('home');
  return {
    ...meta,
    title: {
      absolute: title,
    },
  };
}

export default function Page() {
  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}

