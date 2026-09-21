import type { Metadata } from 'next';
import { preload } from 'react-dom';
import { buildPageMetadata, getPageTitle } from '@/utils/serverI18n';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';
import { IMAGES } from '@/configs/images';

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
  preload(IMAGES.coverImageDefault, { as: 'image', fetchPriority: 'high' });

  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}

