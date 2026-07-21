import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ResumesPage from '@/views/adminPages/ResumesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.resumes');
}

export default function Page() {
  return <ResumesPage />;
}
