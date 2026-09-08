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
  if (!slug || slug === ':slug') {
    return {
      title: 'Tin tức & Cẩm nang nghề nghiệp',
      description: 'Cập nhật tin tức thị trường lao động, xu hướng tuyển dụng và cẩm nang phát triển sự nghiệp toàn diện từ InfoHR.',
    };
  }
  const article = await serverFetch<Article>(`content/web/articles/${slug}/`);

  const canonicalUrl = `https://infohr.vn/tin-tuc/${slug}`;

  if (!article) {
    return {
      title: 'Tin tức & Cẩm nang nghề nghiệp',
      description: 'Cập nhật tin tức thị trường lao động, xu hướng tuyển dụng và cẩm nang phát triển sự nghiệp toàn diện từ InfoHR.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const cleanTitle = (article.title || 'Tin tức').replace(/\s*\|\s*InfoHR\s*$/i, '').trim();

  const rawDescription =
    article.excerpt ||
    (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const description =
    rawDescription.length > 160 ? rawDescription.slice(0, 157) + '...' : rawDescription || 'Tin tức và cẩm nang nghề nghiệp mới nhất trên InfoHR.';

  const ogImageUrl = article.thumbnailUrl || 'https://infohr.vn/android-chrome-512x512.png';

  return {
    title: cleanTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cleanTitle,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'InfoHR',
      locale: 'vi_VN',
      images: [
        {
          url: ogImageUrl,
          alt: cleanTitle,
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
