import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { serverFetch } from '@/lib/server-fetch';
import DefaultLayout from '@/layouts/DefaultLayout';
import ArticleDetailPage from '@/views/defaultPages/NewsPage/ArticleDetailPage';
import type { Article } from '@/services/contentService';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await serverFetch<Article>(`content/web/articles/${slug}/`);

  if (!article) {
    return buildPageMetadata('news');
  }

  const description =
    article.excerpt ||
    (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `/blog/${slug}`,
      siteName: 'Square Tuyển Dụng',
      locale: 'vi_VN',
      ...(article.thumbnailUrl && {
        images: [{ url: article.thumbnailUrl }],
      }),
    },
  };
}

export default function Page() {
  return (
    <DefaultLayout>
      <ArticleDetailPage />
    </DefaultLayout>
  );
}
