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
  console.log('[generateMetadata tin-tuc/[slug]] fetching slug:', slug);
  const article = await serverFetch<Article>(`content/web/articles/${slug}/`);
  console.log('[generateMetadata tin-tuc/[slug]] fetched article:', article ? article.title : 'NULL');

  if (!article) {
    return buildPageMetadata('news');
  }

  const rawDescription =
    article.excerpt ||
    (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const description =
    rawDescription.length > 160 ? rawDescription.slice(0, 157) + '...' : rawDescription;

  const canonicalUrl = `https://infohr.vn/tin-tuc/${slug}`;
  const ogImageUrl = article.thumbnailUrl || 'https://infohr.vn/android-chrome-512x512.png';

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'InfoHR',
      locale: 'vi_VN',
      images: [
        {
          url: ogImageUrl,
          alt: article.title,
        },
      ],
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
