import EmployerBlogFormPage from '@/views/employerPages/BlogPage/EmployerBlogFormPage';

export const metadata = {
  title: 'Quản lý blog tuyển dụng | Employer',
  description: 'Chỉnh sửa bài viết blog tuyển dụng.',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployerBlogFormPage mode="edit" articleId={Number(id)} />;
}