import AdminArticleFormPage from '@/views/adminPages/ArticlesPage/AdminArticleFormPage';

export const metadata = {
  title: 'Tạo bài viết mới | Admin',
};

export default function Page() {
  return <AdminArticleFormPage mode="create" />;
}
