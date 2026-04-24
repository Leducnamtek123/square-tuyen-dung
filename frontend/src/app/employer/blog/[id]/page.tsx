'use client';
import EmployerBlogFormPage from '@/views/employerPages/BlogPage/EmployerBlogFormPage';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EmployerBlogFormPage mode="edit" articleId={Number(id)} />;
}
