import AdminArticleFormPage from '@/views/adminPages/ArticlesPage/AdminArticleFormPage';

export const metadata = {
  title: 'Quản lý Tin tức & Blog | Admin',
  description: 'Quản lý bài viết tin tức và blog tuyển dụng.',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminArticleFormPage mode="edit" articleId={Number(id)} />;
}