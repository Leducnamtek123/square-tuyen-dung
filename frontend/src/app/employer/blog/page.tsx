import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import BlogPage from '@/views/employerPages/BlogPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.blog');
}

export default function Page() {
  return <BlogPage />;
}
