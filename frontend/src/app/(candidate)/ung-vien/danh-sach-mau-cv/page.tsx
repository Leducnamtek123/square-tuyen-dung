import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { CVGalleryPage } from '@/views/cvBuilderPages/CVGalleryPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('cv-templates');
}

export default function CandidateCVGalleryPage() {
  return <CVGalleryPage />;
}
