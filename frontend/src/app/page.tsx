import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('home');
}

export default function Page() {
  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}
