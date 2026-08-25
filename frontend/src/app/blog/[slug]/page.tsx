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

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = await serverFetch<Article>(`content/web/articles/${slug}/`);

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt || article.title,
        image: article.thumbnailUrl || 'https://infohr.vn/android-chrome-512x512.png',
        datePublished: article.createAt || new Date().toISOString(),
        dateModified: article.updateAt || article.createAt || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'InfoHR Editorial Team',
          url: 'https://infohr.vn',
        },
        publisher: {
          '@type': 'Organization',
          name: 'InfoHR',
          logo: {
            '@type': 'ImageObject',
            url: 'https://infohr.vn/android-chrome-512x512.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://infohr.vn/tin-tuc/${slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DefaultLayout>
        <ArticleDetailPage />
      </DefaultLayout>
    </>
  );
}
