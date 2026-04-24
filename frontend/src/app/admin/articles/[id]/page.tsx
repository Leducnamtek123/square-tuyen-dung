'use client';
import AdminArticleFormPage from '@/views/adminPages/ArticlesPage/AdminArticleFormPage';
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminArticleFormPage mode="edit" articleId={Number(id)} />;
}
