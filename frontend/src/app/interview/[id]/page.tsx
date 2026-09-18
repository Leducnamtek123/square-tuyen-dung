import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewRoomPageClient from './page.client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('interview.room');
}

export default function Page() {
  return <InterviewRoomPageClient />;
}
