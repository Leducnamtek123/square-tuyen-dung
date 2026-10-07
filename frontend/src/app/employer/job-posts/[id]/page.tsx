import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobPostEditorPage from '@/views/employerPages/JobPostPage/JobPostEditorPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.job-posts-edit');
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobPostEditorPage mode="edit" id={id} />;
}
