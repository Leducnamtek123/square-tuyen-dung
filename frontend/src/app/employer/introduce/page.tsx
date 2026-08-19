import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import IntroducePage from '@/views/employerPages/IntroducePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.introduce');
}

export default function Page() {
  return <IntroducePage />;
}
