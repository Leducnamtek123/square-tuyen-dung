import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ComponentsDesignSystemPage from '@/views/adminPages/ComponentsDesignSystemPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.components');
}

export default function Page() {
  return <ComponentsDesignSystemPage />;
}
