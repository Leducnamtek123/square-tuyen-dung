import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import CompanyDetailClientPage from './ClientPage';
import type { Company } from '@/types/models';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await serverFetch<Company>(`info/web/companies/${slug}/`);

  const canonicalUrl = `https://infohr.vn/cong-ty/${slug}`;

  if (!company) {
    return {
      title: 'Thông tin công ty & Doanh nghiệp',
      description: 'Khám phá văn hóa doanh nghiệp, chế độ đãi ngộ và các vị trí tuyển dụng mới nhất trên InfoHR.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const companyName = (company.companyName || 'Công ty').replace(/\s*\|\s*InfoHR\s*$/i, '').trim();
  const fieldOperation = company.fieldOperation || '';
  const employeeSize = company.employeeSize || '';

  const title = `${companyName} - Tuyển dụng & Thông tin doanh nghiệp`;

  const rawDescription = [
    companyName,
    fieldOperation && `Lĩnh vực: ${fieldOperation}`,
    employeeSize && `Quy mô: ${employeeSize} nhân viên`,
    'Xem hồ sơ doanh nghiệp và các vị trí đang tuyển trên InfoHR.',
  ]
    .filter(Boolean)
    .join('. ');

  const description = rawDescription.length > 155
    ? rawDescription.slice(0, 152) + '...'
    : rawDescription;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'InfoHR',
      locale: 'vi_VN',
      ...(company.companyImageUrl && {
        images: [{ url: company.companyImageUrl, alt: title }],
      }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const company = await serverFetch<Company>(`info/web/companies/${slug}/`);

  const jsonLd = company
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.companyName || 'Doanh nghiệp',
        url: `https://infohr.vn/cong-ty/${slug}`,
        logo: company.companyImageUrl || company.logoUrl || undefined,
        description: company.description || undefined,
        sameAs: company.websiteUrl || undefined,
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
      <CompanyDetailClientPage />
    </>
  );
}
