import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SavedProfilesPageClient from './page.client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.saved-profiles');
}

export default function Page() {
  return <SavedProfilesPageClient />;
}
