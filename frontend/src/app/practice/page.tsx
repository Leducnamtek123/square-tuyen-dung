import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import PracticePageClient from './PracticePageClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('practice');
}

export default function Page() {
  return <PracticePageClient />;
}

