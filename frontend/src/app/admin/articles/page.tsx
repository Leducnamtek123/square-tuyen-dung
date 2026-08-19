import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminArticlesPage from '@/views/adminPages/ArticlesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.articles');
}

export default function Page() {
  return <AdminArticlesPage />;
}
