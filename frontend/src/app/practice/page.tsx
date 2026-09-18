import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import PracticeLandingPage from '@/views/defaultPages/PracticeLandingPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('practice');
}

export default function Page() {
  return (
    <DefaultLayout>
      <PracticeLandingPage />
    </DefaultLayout>
  );
}
