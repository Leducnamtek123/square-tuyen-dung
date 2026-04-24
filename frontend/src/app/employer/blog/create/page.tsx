import EmployerBlogFormPage from '@/views/employerPages/BlogPage/EmployerBlogFormPage';

export const metadata = {
  title: 'Viết bài tuyển dụng',
};

export default function Page() {
  return <EmployerBlogFormPage mode="create" />;
}
