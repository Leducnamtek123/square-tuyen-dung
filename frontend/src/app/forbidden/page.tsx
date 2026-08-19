import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { ForbiddenPage } from '@/views/errorsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('error.forbidden');
}

export default function Page() {
  return <ForbiddenPage />;
}
