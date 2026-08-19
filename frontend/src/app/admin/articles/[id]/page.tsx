import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminArticleFormPage from '@/views/adminPages/ArticlesPage/AdminArticleFormPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.articles');
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminArticleFormPage mode="edit" articleId={Number(id)} />;
}