import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminArticleFormPage from '@/views/adminPages/ArticlesPage/AdminArticleFormPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.articles.create');
}

export default function Page() {
  return <AdminArticleFormPage mode="create" />;
}
