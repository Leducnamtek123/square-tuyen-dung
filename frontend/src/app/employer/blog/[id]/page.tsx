import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import EmployerBlogFormPage from '@/views/employerPages/BlogPage/EmployerBlogFormPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.blog-edit');
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployerBlogFormPage mode="edit" articleId={Number(id)} />;
}