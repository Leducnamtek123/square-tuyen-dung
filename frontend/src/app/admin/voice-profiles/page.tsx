import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import VoiceProfilesPage from '@/views/adminPages/VoiceProfilesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.voice-profiles');
}

export default function Page() {
  return <VoiceProfilesPage />;
}
