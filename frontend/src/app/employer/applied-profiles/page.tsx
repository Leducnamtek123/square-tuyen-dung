import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProfileAppliedPage from '@/views/employerPages/ProfileAppliedPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.applied-profiles');
}

export default function Page() {
  return <ProfileAppliedPage />;
}
