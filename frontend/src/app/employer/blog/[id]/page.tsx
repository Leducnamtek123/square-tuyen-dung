import EmployerBlogFormPage from '@/views/employerPages/BlogPage/EmployerBlogFormPage';

export const metadata = {
  title: 'Quáº£n lÃ½ blog tuyá»ƒn dá»¥ng | Employer',
  description: 'Chá»‰nh sá»­a bÃ i viáº¿t blog tuyá»ƒn dá»¥ng.',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployerBlogFormPage mode="edit" articleId={Number(id)} />;
}